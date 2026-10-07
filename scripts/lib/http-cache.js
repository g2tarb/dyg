/**
 * Enregistrement / rejeu des réponses de l'API GitHub.
 *
 * Pourquoi : `fetchGitHubProfile` mélange collecte réseau et calcul des scores
 * dans une seule fonction. Figer son résultat ne sert donc à rien pour calibrer —
 * les scores seraient déjà calculés. Ce qu'il faut figer, ce sont les réponses
 * BRUTES de l'API, pour pouvoir rejouer les formules autant de fois qu'on veut.
 *
 * On intercepte donc `globalThis.fetch` au lieu de modifier `services/github.js` :
 * zéro ligne touchée dans le code de production, donc zéro risque de régression.
 *
 * Deux modes :
 *   record  → appel réel + écriture de la réponse sur disque (consomme du quota)
 *   replay  → lecture disque uniquement, aucun appel réseau, aucun quota
 */

import { createHash } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

function keyFor(url) {
  const hash = createHash('sha256').update(url).digest('hex').slice(0, 16);
  const slug = url
    .replace('https://api.github.com/', '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .slice(0, 60);
  return `${slug}__${hash}.json`;
}

/** Réponse minimale compatible avec ce que github.js consomme. */
function fakeResponse(entry) {
  return {
    ok: entry.ok,
    status: entry.status,
    statusText: entry.statusText,
    headers: {
      get: (name) => entry.headers?.[name.toLowerCase()] ?? null
    },
    json: async () => entry.body
  };
}

/**
 * Installe le patch sur globalThis.fetch.
 * Retourne { restore, stats } — appeler restore() en fin de script.
 */
export function installCache({ mode, cacheDir }) {
  if (mode !== 'record' && mode !== 'replay') {
    throw new Error(`mode invalide: ${mode} (attendu 'record' ou 'replay')`);
  }

  const realFetch = globalThis.fetch;
  const stats = { network: 0, hits: 0, misses: 0 };

  globalThis.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url ?? String(input);

    // On ne met en cache que l'API GitHub, et jamais /rate_limit qui doit
    // toujours refléter l'état réel du quota.
    if (!url.startsWith('https://api.github.com/') || url.includes('/rate_limit')) {
      return realFetch(input, init);
    }

    const path = join(cacheDir, keyFor(url));

    if (existsSync(path)) {
      stats.hits++;
      return fakeResponse(JSON.parse(await readFile(path, 'utf-8')));
    }

    if (mode === 'replay') {
      stats.misses++;
      // En replay, une absence de cache ne doit pas faire un appel réseau
      // silencieux : on renvoie une 404 vide, que github.js sait absorber.
      return fakeResponse({
        ok: false, status: 404, statusText: 'Not Found (cache miss)',
        headers: {}, body: {}
      });
    }

    stats.network++;
    const res = await realFetch(input, init);

    let body = null;
    try { body = await res.clone().json(); } catch { body = null; }

    const entry = {
      url,
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      headers: {
        'x-ratelimit-remaining': res.headers.get('x-ratelimit-remaining'),
        'x-ratelimit-limit': res.headers.get('x-ratelimit-limit')
      },
      body,
      recorded_at: new Date().toISOString()
    };

    await mkdir(cacheDir, { recursive: true });
    await writeFile(path, JSON.stringify(entry, null, 2));

    return fakeResponse(entry);
  };

  return {
    stats,
    restore: () => { globalThis.fetch = realFetch; }
  };
}

/** Quota restant côté GitHub, sans consommer de quota (endpoint exempté). */
export async function remainingQuota() {
  try {
    const res = await fetch('https://api.github.com/rate_limit');
    if (!res.ok) return null;
    const data = await res.json();
    return data.resources?.core ?? null;
  } catch {
    return null;
  }
}
