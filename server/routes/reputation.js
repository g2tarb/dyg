import pool from '../db/connection.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

async function reputationRoutes(fastify) {
  // POST /api/projects/:id/reputation — rate a teammate after project ships
  fastify.post('/api/projects/:id/reputation', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } }
  }, async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const { id } = request.params;
    const reviewerId = request.user.id;
    const { reviewee_id, stars, comment } = request.body;

    // Validate
    if (!reviewee_id || !stars) {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'reviewee_id and stars required' });
    }
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'Stars must be 1-5' });
    }
    if (comment && comment.length > 500) {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'Comment max 500 chars' });
    }
    if (reviewee_id === reviewerId) {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'Cannot rate yourself' });
    }

    // Verify project is shipped
    const projCheck = await pool.query('SELECT status FROM projects WHERE id = $1', [id]);
    if (projCheck.rows.length === 0) return reply.code(404).send({ error: 'NOT_FOUND' });
    if (projCheck.rows[0].status !== 'shipped') {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'Project must be shipped' });
    }

    // Verify both are members
    const memberCheck = await pool.query(
      'SELECT user_id FROM project_members WHERE project_id = $1 AND user_id IN ($2, $3)',
      [id, reviewerId, reviewee_id]
    );
    if (memberCheck.rows.length < 2) {
      throw new ForbiddenError('Both users must be project members');
    }

    await pool.query(`
      INSERT INTO reputation (project_id, reviewer_id, reviewee_id, stars, comment)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (project_id, reviewer_id, reviewee_id)
      DO UPDATE SET stars = $4, comment = $5, created_at = NOW()
    `, [id, reviewerId, reviewee_id, stars, comment || null]);

    return { ok: true };
  });

  // GET /api/users/:login/reputation — public reputation for a user
  fastify.get('/api/users/:login/reputation', async (request, reply) => {
    const { login } = request.params;

    const userResult = await pool.query('SELECT id FROM users WHERE github_login = $1', [login]);
    if (userResult.rows.length === 0) return reply.code(404).send({ error: 'NOT_FOUND' });

    const userId = userResult.rows[0].id;

    // Average stars
    const avgResult = await pool.query(
      'SELECT ROUND(AVG(stars), 1) AS avg_stars, COUNT(*)::int AS total_reviews FROM reputation WHERE reviewee_id = $1',
      [userId]
    );

    // Recent reviews with project name
    const reviewsResult = await pool.query(`
      SELECT r.stars, r.comment, r.created_at,
             u.github_login AS reviewer_login, u.avatar_url AS reviewer_avatar, u.name AS reviewer_name,
             p.name AS project_name
      FROM reputation r
      JOIN users u ON u.id = r.reviewer_id
      JOIN projects p ON p.id = r.project_id
      WHERE r.reviewee_id = $1
      ORDER BY r.created_at DESC
      LIMIT 20
    `, [userId]);

    return {
      avg_stars: parseFloat(avgResult.rows[0].avg_stars) || 0,
      total_reviews: avgResult.rows[0].total_reviews,
      reviews: reviewsResult.rows
    };
  });

  // POST /api/report — signal content (moderation)
  fastify.post('/api/report', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
  }, async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const { target_type, target_id, reason } = request.body;

    if (!target_type || !target_id || !reason) {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'target_type, target_id, and reason required' });
    }
    if (!['user', 'message', 'comment', 'project'].includes(target_type)) {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'Invalid target_type' });
    }
    if (reason.length > 200) {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'Reason max 200 chars' });
    }

    await pool.query(
      'INSERT INTO reports (reporter_id, target_type, target_id, reason) VALUES ($1, $2, $3, $4)',
      [request.user.id, target_type, target_id, reason]
    );

    return { ok: true };
  });
}

export default reputationRoutes;
