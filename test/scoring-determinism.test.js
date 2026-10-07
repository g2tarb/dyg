/**
 * DYG-C2 — Le scoring serveur doit être déterministe et stable.
 *
 * Deux garanties complémentaires de DYG-C1 : puisque les scores viennent
 * désormais exclusivement du serveur, on vérifie que (1) un même profil GitHub
 * figé produit toujours les mêmes scores, et (2) ces scores respectent les
 * invariants de base du barème V4. Ce test rejoue les réponses d'API enregistrées
 * par scripts/scoring-bench.js — aucun appel réseau, aucun quota consommé.
 *
 * Il est automatiquement ignoré si aucune fixture n'a encore été enregistrée,
 * pour ne pas faire échouer la CI sur une machine fraîche.
 */

import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'fs';
import { readdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { installCache } from '../scripts/lib/http-cache.js';
import { VALID_PILLARS } from '../server/constants/shared.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, '..', 'scripts', 'fixtures', 'github-api');
const RESULTS_DIR = join(__dirname, '..', 'scripts', 'fixtures', 'results');

async function recordedLogins() {
  if (!existsSync(RESULTS_DIR)) return [];
  const files = await readdir(RESULTS_DIR);
  return files.filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
}

let logins = [];
before(async () => { logins = await recordedLogins(); });

test('un profil figé produit des scores identiques à chaque scan', async (t) => {
  if (!existsSync(CACHE_DIR) || logins.length === 0) {
    t.skip('Aucune fixture — lance `npm run bench:record` pour activer ce test.');
    return;
  }

  const { fetchGitHubProfile } = await import('../server/services/github.js');
  const cache = installCache({ mode: 'replay', cacheDir: CACHE_DIR });

  try {
    for (const login of logins) {
      const a = await fetchGitHubProfile(login);
      const b = await fetchGitHubProfile(login);
      assert.deepEqual(
        b.scores, a.scores,
        `Scores non déterministes pour ${login}`
      );

      // Invariants du barème V4 : 8 piliers, chacun entier de 1 à 10.
      assert.equal(a.scores.length, 8, `${login} doit avoir 8 piliers`);
      for (const { pillar, score } of a.scores) {
        assert.ok(VALID_PILLARS.includes(pillar), `pilier inconnu: ${pillar}`);
        assert.ok(Number.isInteger(score), `${login}/${pillar}: score non entier`);
        assert.ok(score >= 1 && score <= 10, `${login}/${pillar}=${score} hors [1,10]`);
      }
    }
  } finally {
    cache.restore();
  }
});
