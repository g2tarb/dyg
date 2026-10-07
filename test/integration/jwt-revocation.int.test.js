/**
 * DYG-H2 — Révocation des JWT. Un token reste utilisable tant que le compte n'a
 * pas bumpé sa version ; après un logout, le même token doit être rejeté.
 *
 * Prérequis : `npm run test:setup`. Pas de fixtures GitHub nécessaires (on ne
 * scanne pas ici). Lancement : `npm run test:int`.
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';

import { assertTestDb, sessionCookie } from '../helpers/session.js';

let fastify, pool, ready = false, skipReason = null;

before(async () => {
  try {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    await assertTestDb(pool);
  } catch (err) {
    skipReason = `Base de test indisponible : ${err.message}`;
    return;
  }
  ({ fastify } = await import('../../server/index.js'));
  await fastify.ready();
  ready = true;
});

after(async () => {
  if (fastify) await fastify.close();
  if (pool) await pool.end();
});

test('un token est révoqué après logout', async (t) => {
  if (!ready) { t.skip(skipReason); return; }

  await pool.query('DELETE FROM users WHERE github_login = $1', ['revoke-victim']);
  const { rows } = await pool.query(
    `INSERT INTO users (github_id, github_login, access_token, token_version)
     VALUES ($1, $2, $3, 0) RETURNING id, github_login, token_version`,
    [999002, 'revoke-victim', 'x']
  );
  const user = rows[0];
  const cookies = sessionCookie(fastify, user); // tv=0

  // 1. Le token frais est accepté.
  const before = await fastify.inject({ method: 'GET', url: '/api/auth/me', cookies });
  assert.equal(before.statusCode, 200, `token frais devrait passer: ${before.body}`);

  // 2. Logout avec ce token → bump token_version en base.
  const logout = await fastify.inject({ method: 'POST', url: '/api/auth/logout', cookies });
  assert.equal(logout.statusCode, 200);

  const after = await pool.query('SELECT token_version FROM users WHERE id = $1', [user.id]);
  assert.equal(after.rows[0].token_version, 1, 'le logout doit incrémenter token_version');

  // 3. Le MÊME token (tv=0) est maintenant rejeté : révocation effective.
  const replay = await fastify.inject({ method: 'GET', url: '/api/auth/me', cookies });
  assert.equal(replay.statusCode, 401, 'FAILLE : le token d\'avant le logout est toujours accepté');

  await pool.query('DELETE FROM users WHERE id = $1', [user.id]);
});

test('le token d\'un compte supprimé est rejeté', async (t) => {
  if (!ready) { t.skip(skipReason); return; }

  await pool.query('DELETE FROM users WHERE github_login = $1', ['ghost']);
  const { rows } = await pool.query(
    `INSERT INTO users (github_id, github_login, access_token, token_version)
     VALUES ($1, $2, $3, 0) RETURNING id, github_login, token_version`,
    [999003, 'ghost', 'x']
  );
  const user = rows[0];
  const cookies = sessionCookie(fastify, user);

  await pool.query('DELETE FROM users WHERE id = $1', [user.id]);

  const res = await fastify.inject({ method: 'GET', url: '/api/auth/me', cookies });
  assert.equal(res.statusCode, 401, 'un token pointant vers un compte supprimé doit être rejeté');
});
