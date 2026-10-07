#!/usr/bin/env node
/**
 * Banc de mesure du scoring DYG.
 *
 * Pourquoi : le scoring V4 vise une distribution précise (moyenne ~5, 8+ = top
 * 15 %, 9+ = top 5 %). Sans mesure sur un échantillon réel, toute modification des
 * formules se fait à l'aveugle. Ce script fige les réponses de l'API GitHub, puis
 * rejoue les formules autant de fois qu'on veut sans consommer de quota.
 *
 * Usage :
 *   node scripts/scoring-bench.js record            # scanne profiles.json (réseau)
 *   node scripts/scoring-bench.js record foo bar    # scanne ces logins (réseau)
 *   node scripts/scoring-bench.js report            # rejoue le cache, affiche la distribution
 *   node scripts/scoring-bench.js snapshot avant    # enregistre la distribution sous un nom
 *   node scripts/scoring-bench.js compare avant apres
 *   node scripts/scoring-bench.js list              # profils présents dans le cache
 *
 * Boucle de calibrage typique :
 *   1. record                      (une fois, consomme du quota)
 *   2. snapshot avant
 *   3. on modifie les formules
 *   4. snapshot apres
 *   5. compare avant apres
 */

import { mkdir, readFile, writeFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// dotenv 17 imprime un bandeau promotionnel avec une URL externe à chaque
// chargement. Il pollue la sortie du banc, qui est lue comme un rapport.
process.env.DOTENV_CONFIG_QUIET = 'true';

import { installCache, remainingQuota } from './lib/http-cache.js';
import { buildDistribution, renderDistribution, renderComparison } from './lib/distribution.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, 'fixtures', 'github-api');
const RESULTS_DIR = join(__dirname, 'fixtures', 'results');
const SNAPSHOT_DIR = join(__dirname, 'fixtures', 'snapshots');
const PROFILES_FILE = join(__dirname, 'profiles.json');
const PROFILES_EXAMPLE = join(__dirname, 'profiles.example.json');

async function loadProfileList() {
  const file = existsSync(PROFILES_FILE) ? PROFILES_FILE : PROFILES_EXAMPLE;
  if (!existsSync(file)) {
    throw new Error(`Aucune liste de profils. Crée ${PROFILES_FILE}.`);
  }
  const raw = JSON.parse(await readFile(file, 'utf-8'));
  const logins = (raw.profiles ?? [])
    .map(p => (typeof p === 'string' ? p : p.login))
    .filter(Boolean);
  if (logins.length === 0) {
    throw new Error(`${file} ne contient aucun login. Remplis le tableau "profiles".`);
  }
  return { file, logins };
}

/** Scan d'un login via le pipeline réel (github.js + scoring.js), sans Gemini. */
async function scanOne(login) {
  const { fetchGitHubProfile } = await import('../server/services/github.js');
  const { determineArchetype } = await import('../server/services/scoring.js');

  const profile = await fetchGitHubProfile(login);
  const { primary, secondary, tertiary } = determineArchetype(profile.scores);

  return {
    username: profile.username,
    name: profile.name,
    archetype: primary,
    secondary_archetype: secondary,
    tertiary_archetype: tertiary,
    dev_style: profile.dev_style,
    dev_style_confidence: profile.dev_style_confidence,
    ai_usage_quality: profile.ai_usage_quality,
    languages: profile.languages,
    dev_metrics: profile.dev_metrics,
    scores: profile.scores
  };
}

async function cmdRecord(args) {
  let logins = args;
  if (logins.length === 0) {
    const loaded = await loadProfileList();
    logins = loaded.logins;
    console.log(`Liste : ${loaded.file}`);
  }

  const quota = await remainingQuota();
  if (quota) {
    console.log(`Quota GitHub : ${quota.remaining}/${quota.limit} restant`);
    const estimate = logins.length * 16;
    if (quota.remaining < estimate) {
      console.log(`\nATTENTION : ${logins.length} profils coûtent environ ${estimate} requêtes, il en reste ${quota.remaining}.`);
      console.log('Les profils non récupérés seront marqués en échec. Ajoute GITHUB_PAT dans .env pour passer à 5 000 req/h.\n');
    }
  }

  await mkdir(CACHE_DIR, { recursive: true });
  await mkdir(RESULTS_DIR, { recursive: true });

  const cache = installCache({ mode: 'record', cacheDir: CACHE_DIR });
  const ok = [];
  const failed = [];

  try {
    for (const login of logins) {
      process.stdout.write(`  ${login.padEnd(24)} `);
      try {
        const result = await scanOne(login);
        await writeFile(join(RESULTS_DIR, `${login}.json`), JSON.stringify(result, null, 2));
        const summary = result.scores.map(s => s.score).join(',');
        console.log(`OK   ${result.archetype.padEnd(10)} [${summary}]`);
        ok.push(login);
      } catch (err) {
        console.log(`ÉCHEC  ${err.message}`);
        failed.push({ login, error: err.message });
      }
    }
  } finally {
    cache.restore();
  }

  console.log(`\n${ok.length} profils enregistrés, ${failed.length} en échec.`);
  console.log(`Requêtes réseau : ${cache.stats.network}, servies par le cache : ${cache.stats.hits}`);
  if (failed.length) {
    console.log('\nÉchecs :');
    for (const f of failed) console.log(`  ${f.login} — ${f.error}`);
  }
  console.log(`\nEnsuite : node scripts/scoring-bench.js report`);
}

async function loadResults() {
  if (!existsSync(RESULTS_DIR)) return [];
  const files = (await readdir(RESULTS_DIR)).filter(f => f.endsWith('.json'));
  const out = [];
  for (const f of files) {
    out.push(JSON.parse(await readFile(join(RESULTS_DIR, f), 'utf-8')));
  }
  return out;
}

/** Recalcule tous les profils du cache avec les formules actuelles. */
async function recompute() {
  if (!existsSync(CACHE_DIR)) {
    throw new Error(`Aucun cache. Lance d'abord : node scripts/scoring-bench.js record`);
  }
  const previous = await loadResults();
  if (previous.length === 0) {
    throw new Error(`Aucun résultat enregistré. Lance d'abord : node scripts/scoring-bench.js record`);
  }

  const cache = installCache({ mode: 'replay', cacheDir: CACHE_DIR });
  const results = [];
  try {
    for (const p of previous) {
      try {
        results.push(await scanOne(p.username));
      } catch (err) {
        console.error(`  (ignoré) ${p.username} — ${err.message}`);
      }
    }
  } finally {
    cache.restore();
  }

  if (cache.stats.misses > 0) {
    console.error(`\nATTENTION : ${cache.stats.misses} requêtes absentes du cache — distribution potentiellement faussée.`);
    console.error('Relance "record" pour compléter le cache.\n');
  }
  return results;
}

async function cmdReport() {
  const results = await recompute();
  const dist = buildDistribution(results);
  console.log(renderDistribution(dist, { title: 'Distribution actuelle' }));
}

async function cmdSnapshot(args) {
  const name = args[0];
  if (!name) throw new Error('Nom requis : node scripts/scoring-bench.js snapshot <nom>');

  const results = await recompute();
  const dist = buildDistribution(results);

  await mkdir(SNAPSHOT_DIR, { recursive: true });
  await writeFile(
    join(SNAPSHOT_DIR, `${name}.json`),
    JSON.stringify({ name, created_at: new Date().toISOString(), distribution: dist }, null, 2)
  );

  console.log(renderDistribution(dist, { title: `Snapshot « ${name} »` }));
  console.log(`Enregistré : scripts/fixtures/snapshots/${name}.json`);
}

async function cmdCompare(args) {
  const [a, b] = args;
  if (!a || !b) throw new Error('Usage : node scripts/scoring-bench.js compare <avant> <apres>');

  const load = async (n) => {
    const p = join(SNAPSHOT_DIR, `${n}.json`);
    if (!existsSync(p)) throw new Error(`Snapshot introuvable : ${n}`);
    return JSON.parse(await readFile(p, 'utf-8')).distribution;
  };

  console.log(renderComparison(await load(a), await load(b)));
}

async function cmdList() {
  const results = await loadResults();
  if (results.length === 0) {
    console.log('Aucun profil enregistré.');
    return;
  }
  console.log(`${results.length} profils dans le cache :\n`);
  for (const r of results) {
    const scores = r.scores.map(s => `${s.pillar.slice(0, 4)}=${s.score}`).join(' ');
    console.log(`  ${r.username.padEnd(22)} ${(r.archetype ?? '?').padEnd(10)} ${r.dev_style ?? '?'}`);
    console.log(`    ${scores}`);
  }
}

const COMMANDS = {
  record: cmdRecord,
  report: cmdReport,
  snapshot: cmdSnapshot,
  compare: cmdCompare,
  list: cmdList
};

const [cmd, ...args] = process.argv.slice(2);

if (!cmd || !COMMANDS[cmd]) {
  console.log(`Commandes : ${Object.keys(COMMANDS).join(', ')}`);
  console.log('Détail en tête de scripts/scoring-bench.js');
  process.exit(cmd ? 1 : 0);
}

try {
  await COMMANDS[cmd](args);
} catch (err) {
  console.error(`\nErreur : ${err.message}`);
  process.exit(1);
}
