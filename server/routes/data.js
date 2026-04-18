import pool from '../db/connection.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);

async function dataRoutes(fastify) {
  // PATCH /api/auth/consent — toggle data consent
  fastify.patch('/api/auth/consent', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const { consent } = request.body;
    if (typeof consent !== 'boolean') {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'consent must be a boolean' });
    }

    await pool.query('UPDATE users SET data_consent = $1, updated_at = NOW() WHERE id = $2', [consent, request.user.id]);

    // Audit log
    await pool.query(`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES ($1, 'data_consent_change', $2)
    `, [request.user.id, JSON.stringify({ consent })]);

    return { ok: true, data_consent: consent };
  });

  // GET /api/auth/consent — get current consent status
  fastify.get('/api/auth/consent', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const result = await pool.query('SELECT data_consent FROM users WHERE id = $1', [request.user.id]);
    return { data_consent: result.rows[0]?.data_consent || false };
  });

  // DELETE /api/data/my-samples — user can delete all their collected data (GDPR right to erasure)
  fastify.delete('/api/data/my-samples', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const result = await pool.query('DELETE FROM code_samples WHERE user_id = $1', [request.user.id]);

    await pool.query(`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES ($1, 'data_erasure', $2)
    `, [request.user.id, JSON.stringify({ deleted_count: result.rowCount })]);

    return { ok: true, deleted: result.rowCount };
  });

  // GET /api/data/my-samples/count — user can see how many samples they've contributed
  fastify.get('/api/data/my-samples/count', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const result = await pool.query(`
      SELECT sample_type, COUNT(*)::int AS count
      FROM code_samples WHERE user_id = $1
      GROUP BY sample_type
    `, [request.user.id]);

    const total = result.rows.reduce((s, r) => s + r.count, 0);
    return { total, breakdown: result.rows };
  });

  // --- Admin-only: export endpoints ---

  // GET /api/admin/data/stats — global collection stats
  fastify.get('/api/admin/data/stats', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    await requireAdmin(request);

    const result = await pool.query(`
      SELECT
        archetype,
        sample_type,
        COUNT(*)::int AS count,
        COUNT(DISTINCT user_id)::int AS unique_users
      FROM code_samples
      GROUP BY archetype, sample_type
      ORDER BY archetype, sample_type
    `);

    const totalResult = await pool.query('SELECT COUNT(*)::int AS total FROM code_samples');
    const consentResult = await pool.query('SELECT COUNT(*)::int AS total FROM users WHERE data_consent = TRUE');

    return {
      total_samples: totalResult.rows[0].total,
      consenting_users: consentResult.rows[0].total,
      breakdown: result.rows
    };
  });

  // GET /api/admin/data/export/:archetype — export samples as JSONL for fine-tuning
  fastify.get('/api/admin/data/export/:archetype', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    await requireAdmin(request);

    const { archetype } = request.params;
    const validArchetypes = ['architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor'];
    if (!validArchetypes.includes(archetype)) {
      return reply.code(400).send({ error: 'Invalid archetype' });
    }

    const { type } = request.query; // optional filter by sample_type

    let query = 'SELECT sample_type, content, metadata, language FROM code_samples WHERE archetype = $1 AND anonymized = TRUE';
    const params = [archetype];

    if (type) {
      params.push(type);
      query += ` AND sample_type = $${params.length}`;
    }

    query += ' ORDER BY created_at';

    const result = await pool.query(query, params);

    // Stream as JSONL
    reply.header('Content-Type', 'application/x-ndjson');
    reply.header('Content-Disposition', `attachment; filename="dyg-${archetype}-samples.jsonl"`);

    const lines = result.rows.map(row => JSON.stringify({
      archetype,
      type: row.sample_type,
      content: row.content,
      language: row.language,
      metadata: row.metadata
    }));

    return lines.join('\n') + '\n';
  });
}

async function requireAdmin(request) {
  const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [request.user.id]);
  if (userResult.rows.length === 0 || !ADMIN_EMAILS.includes(userResult.rows[0].email)) {
    throw new ForbiddenError('Admin access required');
  }
}

export default dataRoutes;
