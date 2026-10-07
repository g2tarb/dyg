/**
 * DYG-C1 — Preuve de bout en bout : un compte authentifié ne peut pas se forger
 * des scores. Teste la vraie route POST /api/onboarding/save-profile contre une
 * base jetable, avec le scan GitHub rejoué depuis les fixtures (aucun réseau).
 *
 * Scénario : un user dont le vrai GitHub (torvalds, figé) donne des scores mixtes,
 * poste un body avec les 8 piliers à 10. On vérifie qu'en base, ce sont les scores
 * SCANNÉS qui sont persistés, pas les 10 forgés.
 *
 * Prérequis : `npm run test:setup` (crée dyg_test) + fixtures enregistrées
 * (`npm run bench:record`). Le test se skippe proprement sinon.
 *
 * Lancement : `npm run test:int`
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

import { installCache } from '../../scripts/lib/http-cache.js';
import { assertTestDb, sessionCookie } from '../helpers/session.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, '..', '..', 'scripts', 'fixtures', 'github-api');
const FIXTURE_LOGIN = 'torvalds';

let fastify, pool, cache, ready = false, skipReason = null;

before(async () => {
  if (!existsSync(CACHE_DIR)) {
    skipReason = 'Pas de fixtures GitHub — lance `npm run bench:record`.';
    return;
  }

  try {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    await assertTestDb(pool);
  } catch (err) {
    skipReason = `Base de test indisponible : ${err.message}`;
    return;
  }

  // App assemblée sans listen ni crons (import = isMain false).
  ({ fastify } = await import('../../server/index.js'));
  await fastify.ready();

  cache = installCache({ mode: 'replay', cacheDir: CACHE_DIR });
  ready = true;
});

after(async () => {
  if (cache) cache.restore();
  if (fastify) await fastify.close();
  if (pool) await pool.end();
});

test('save-profile persiste les scores scannés, pas ceux forgés par le client', async (t) => {
  if (!ready) { t.skip(skipReason); return; }

  // Table rase + user de test dont le github_login pointe vers la fixture.
  await pool.query('DELETE FROM users WHERE github_login = $1', [FIXTURE_LOGIN]);
  const { rows } = await pool.query(
    `INSERT INTO users (github_id, github_login, access_token)
     VALUES ($1, $2, $3) RETURNING id, github_login`,
    [999001, FIXTURE_LOGIN, 'x']
  );
  const user = rows[0];

  const forged = [
    'code', 'velocity', 'craft', 'collaboration',
    'versatility', 'creativity', 'autonomy', 'ia'
  ].map(pillar => ({ pillar, score: 10 }));

  const res = await fastify.inject({
    method: 'POST',
    url: '/api/onboarding/save-profile',
    cookies: sessionCookie(fastify, user),
    payload: {
      name: 'Forgeur',
      bio: 'Je prétends être parfait.',
      archetype: 'architect',
      languages: ['Brainfuck'],
      scores: forged
    }
  });

  assert.equal(res.statusCode, 200, `save-profile a échoué: ${res.body}`);

  // Scores réellement persistés en base.
  const saved = await pool.query(
    `SELECT ds.pillar, ds.score
       FROM developer_scores ds
       JOIN developers d ON d.id = ds.developer_id
      WHERE d.user_id = $1
      ORDER BY ds.pillar`,
    [user.id]
  );

  assert.equal(saved.rows.length, 8, 'Les 8 piliers doivent être persistés');

  const allTens = saved.rows.every(r => r.score === 10);
  assert.equal(allTens, false, 'FAILLE : les scores forgés à 10 ont été persistés');

  // Et ils doivent correspondre au scan serveur de la fixture.
  const { fetchGitHubProfile } = await import('../../server/services/github.js');
  const scanned = await fetchGitHubProfile(FIXTURE_LOGIN);
  const scannedMap = Object.fromEntries(scanned.scores.map(s => [s.pillar, s.score]));

  for (const row of saved.rows) {
    assert.equal(
      row.score, scannedMap[row.pillar],
      `${row.pillar} persisté=${row.score} mais scan serveur=${scannedMap[row.pillar]}`
    );
  }

  // Nettoyage.
  await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
});
