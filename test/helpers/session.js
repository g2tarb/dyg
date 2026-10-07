/**
 * Helpers de test d'intégration.
 *
 * - assertTestDb : refuse de tourner ailleurs que sur une base jetable, pour
 *   qu'un DATABASE_URL mal configuré ne puisse JAMAIS muter la base de dev.
 * - sessionCookie : fabrique un cookie de session légitime via le JWT de l'app
 *   elle-même (fastify.jwt.sign), exactement comme le callback OAuth le ferait.
 */

import assert from 'node:assert/strict';

export async function assertTestDb(pool) {
  const r = await pool.query('SELECT current_database() AS db');
  const db = r.rows[0].db;
  assert.ok(
    /test/.test(db),
    `SÉCURITÉ : les tests d'intégration exigent une base dont le nom contient "test" (actuel: "${db}"). Lance "npm run test:setup" et exporte DATABASE_URL vers dyg_test.`
  );
  return db;
}

export function sessionCookie(fastify, user) {
  const token = fastify.jwt.sign({
    id: user.id,
    github_login: user.github_login,
    tv: user.token_version ?? 0
  });
  return { token };
}
