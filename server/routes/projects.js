import pool from '../db/connection.js';
import { closeProject } from '../services/closing.js';
import { CreateProjectSchema, UpdateProjectSchema, SubmitReviewsSchema, REVIEW_PILLARS } from '../schemas/validation.js';
import { UnauthorizedError, NotFoundError, ForbiddenError } from '../utils/errors.js';

async function getProjectWithMembers(projectId) {
  const projResult = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
  if (projResult.rows.length === 0) return null;

  const membersResult = await pool.query(`
    SELECT u.id, u.github_login, u.avatar_url, u.name, pm.role, pm.joined_at
    FROM project_members pm
    JOIN users u ON u.id = pm.user_id
    WHERE pm.project_id = $1
    ORDER BY pm.joined_at
  `, [projectId]);

  return {
    ...projResult.rows[0],
    members: membersResult.rows
  };
}

async function projectRoutes(fastify) {
  // POST /api/projects — create a project (requires auth)
  fastify.post('/api/projects', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const parsed = CreateProjectSchema.parse(request.body);
    const creatorId = request.user.id;

    const result = await pool.query(`
      INSERT INTO projects (name, description, repo_url, creator_id, max_members)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [parsed.name, parsed.description, parsed.repo_url, creatorId, parsed.max_members]);

    const project = result.rows[0];

    // Creator auto-joins as 'lead'
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [project.id, creatorId, 'lead']
    );

    const full = await getProjectWithMembers(project.id);
    return reply.code(201).send(full);
  });

  // GET /api/projects — list projects
  fastify.get('/api/projects', async (request, reply) => {
    const { status, mine, limit = 20, offset = 0 } = request.query;

    let query = `
      SELECT p.*, u.github_login AS creator_login, u.avatar_url AS creator_avatar,
             (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) AS member_count
      FROM projects p
      JOIN users u ON u.id = p.creator_id
    `;
    const params = [];
    const conditions = [];

    if (mine === 'true') {
      try {
        await request.jwtVerify();
        params.push(request.user.id);
        conditions.push(`EXISTS (SELECT 1 FROM project_members pm2 WHERE pm2.project_id = p.id AND pm2.user_id = $${params.length})`);
      } catch {
        return [];
      }
    }

    if (status) {
      params.push(status);
      conditions.push(`p.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.created_at DESC';
    params.push(Math.min(parseInt(limit) || 20, 100));
    query += ` LIMIT $${params.length}`;
    params.push(parseInt(offset) || 0);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    return result.rows;
  });

  // GET /api/projects/:id
  fastify.get('/api/projects/:id', async (request, reply) => {
    const project = await getProjectWithMembers(request.params.id);
    if (!project) return reply.code(404).send({ error: 'Project not found' });
    return project;
  });

  // PATCH /api/projects/:id — update project (creator only)
  fastify.patch('/api/projects/:id', async (request, reply) => {
    try { await request.jwtVerify(); } catch { return reply.code(401).send({ error: 'Not authenticated' }); }

    const { id } = request.params;
    const userId = request.user.id;

    const projCheck = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projCheck.rows.length === 0) return reply.code(404).send({ error: 'Project not found' });
    if (projCheck.rows[0].creator_id !== userId) return reply.code(403).send({ error: 'Only the creator can update this project' });

    const { name, description, repo_url, status } = request.body;
    const current = projCheck.rows[0];

    // Validate status transitions (no skipping)
    if (status && status !== current.status) {
      const VALID_TRANSITIONS = {
        open: ['staffing', 'building'],
        staffing: ['building'],
        building: ['review'],
        review: ['shipped'],
        shipped: ['archived'],
        archived: []
      };
      const allowed = VALID_TRANSITIONS[current.status] || [];
      if (!allowed.includes(status)) {
        return reply.code(400).send({ error: `Cannot transition from ${current.status} to ${status}` });
      }
    }

    const updates = {
      name: name || current.name,
      description: description !== undefined ? description : current.description,
      repo_url: repo_url !== undefined ? repo_url : current.repo_url,
      status: status || current.status
    };

    // Set timestamps on status transitions
    let startedAt = current.started_at;
    let endedAt = current.ended_at;
    if (status === 'building' && !startedAt) startedAt = new Date().toISOString();
    if (status === 'shipped' && !endedAt) endedAt = new Date().toISOString();

    await pool.query(`
      UPDATE projects SET name = $1, description = $2, repo_url = $3, status = $4,
             started_at = $5, ended_at = $6 WHERE id = $7
    `, [updates.name, updates.description, updates.repo_url, updates.status, startedAt, endedAt, id]);

    // Closing ritual: calculate scores when project ships (idempotent)
    if (status === 'shipped' && current.status !== 'shipped') {
      // Check if closing already ran (score snapshots exist)
      const snapshotCheck = await pool.query(
        'SELECT 1 FROM score_snapshots WHERE project_id = $1 LIMIT 1',
        [id]
      );
      if (snapshotCheck.rows.length === 0) {
        try {
          await closeProject(id);
          fastify.log.info(`Closing ritual completed for project ${id}`);
        } catch (err) {
          fastify.log.error(`Closing ritual failed for project ${id}:`, err);
          // Revert status so it can be retried
          await pool.query('UPDATE projects SET status = $1 WHERE id = $2', [current.status, id]);
          return reply.code(500).send({ error: 'Closing ritual failed, status reverted' });
        }
      }
    }

    const project = await getProjectWithMembers(id);
    return project;
  });

  // POST /api/projects/:id/join — join a project (requires auth, race-safe)
  fastify.post('/api/projects/:id/join', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
  }, async (request, reply) => {
    try { await request.jwtVerify(); } catch { return reply.code(401).send({ error: 'Not authenticated' }); }

    const { id } = request.params;
    const userId = request.user.id;

    // Use a transaction with row lock to prevent race condition
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock the project row to prevent concurrent joins
      const projCheck = await client.query('SELECT * FROM projects WHERE id = $1 FOR UPDATE', [id]);
      if (projCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return reply.code(404).send({ error: 'Project not found' });
      }

      const project = projCheck.rows[0];
      if (project.status !== 'open' && project.status !== 'staffing') {
        await client.query('ROLLBACK');
        return reply.code(400).send({ error: 'Project is not accepting new members' });
      }

      const memberCount = await client.query('SELECT COUNT(*) FROM project_members WHERE project_id = $1', [id]);
      if (parseInt(memberCount.rows[0].count) >= project.max_members) {
        await client.query('ROLLBACK');
        return reply.code(400).send({ error: 'Project is full' });
      }

      await client.query(
        'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
        [id, userId, 'member']
      );

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.code === '23505') return reply.code(409).send({ error: 'Already a member' });
      throw err;
    } finally {
      client.release();
    }

    const full = await getProjectWithMembers(id);
    return full;
  });

  // POST /api/projects/:id/leave — leave a project
  fastify.post('/api/projects/:id/leave', async (request, reply) => {
    try { await request.jwtVerify(); } catch { return reply.code(401).send({ error: 'Not authenticated' }); }

    const { id } = request.params;
    const userId = request.user.id;

    // Can't leave if you're the creator
    const projCheck = await pool.query('SELECT creator_id FROM projects WHERE id = $1', [id]);
    if (projCheck.rows.length === 0) return reply.code(404).send({ error: 'Project not found' });
    if (projCheck.rows[0].creator_id === userId) {
      return reply.code(400).send({ error: 'Creator cannot leave the project' });
    }

    await pool.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [id, userId]);

    const full = await getProjectWithMembers(id);
    return full;
  });

  // POST /api/projects/:id/reviews — submit peer reviews (batch)
  fastify.post('/api/projects/:id/reviews', {
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } }
  }, async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const { id } = request.params;
    const reviewerId = request.user.id;
    const parsed = SubmitReviewsSchema.parse(request.body);
    const { reviews } = parsed;

    // Verify project exists and is in review status
    const projCheck = await pool.query('SELECT status FROM projects WHERE id = $1', [id]);
    if (projCheck.rows.length === 0) return reply.code(404).send({ error: 'Project not found' });
    if (projCheck.rows[0].status !== 'review') {
      return reply.code(400).send({ error: 'Reviews can only be submitted during review phase' });
    }

    // Verify reviewer is a member
    const memberCheck = await pool.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, reviewerId]
    );
    if (memberCheck.rows.length === 0) return reply.code(403).send({ error: 'Not a project member' });

    // Get project member IDs for validation
    const membersResult = await pool.query(
      'SELECT user_id FROM project_members WHERE project_id = $1',
      [id]
    );
    const memberIds = new Set(membersResult.rows.map(r => r.user_id));

    // Validate and insert reviews
    for (const review of reviews) {
      if (review.user_id === reviewerId) continue; // Can't review yourself

      if (!memberIds.has(review.user_id)) {
        throw new ForbiddenError(`User ${review.user_id} is not a project member`);
      }

      for (const pillar of REVIEW_PILLARS) {
        await pool.query(`
          INSERT INTO peer_reviews (project_id, reviewer_id, reviewee_id, pillar, rating)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (project_id, reviewer_id, reviewee_id, pillar)
          DO UPDATE SET rating = $5, created_at = NOW()
        `, [id, reviewerId, review.user_id, pillar, review[pillar]]);
      }
    }

    return { ok: true };
  });

  // GET /api/projects/:id/reviews — get review status for this project
  fastify.get('/api/projects/:id/reviews', async (request, reply) => {
    const { id } = request.params;

    // Who has reviewed
    const reviewersResult = await pool.query(
      'SELECT DISTINCT reviewer_id FROM peer_reviews WHERE project_id = $1',
      [id]
    );
    const reviewerIds = reviewersResult.rows.map(r => r.reviewer_id);

    // Get current user's reviews (if authenticated)
    let myReviews = [];
    try {
      await request.jwtVerify();
      const userId = request.user.id;
      const myResult = await pool.query(
        'SELECT reviewee_id, pillar, rating FROM peer_reviews WHERE project_id = $1 AND reviewer_id = $2',
        [id, userId]
      );
      myReviews = myResult.rows;
    } catch { /* not authenticated, that's fine */ }

    return { reviewerIds, myReviews };
  });

  // GET /api/users/:login/portfolio — public portfolio
  fastify.get('/api/users/:login/portfolio', async (request, reply) => {
    const { login } = request.params;

    const userResult = await pool.query(
      'SELECT id, github_login, avatar_url, name, created_at FROM users WHERE github_login = $1',
      [login]
    );
    if (userResult.rows.length === 0) return reply.code(404).send({ error: 'User not found' });

    const user = userResult.rows[0];

    // Developer profile
    const devResult = await pool.query(`
      SELECT d.id, d.archetype, d.bio, d.languages,
             json_agg(json_build_object('pillar', ds.pillar, 'score', ds.score)) AS scores
      FROM developers d
      JOIN developer_scores ds ON ds.developer_id = d.id
      WHERE d.user_id = $1
      GROUP BY d.id
    `, [user.id]);

    // Shipped projects
    const projectsResult = await pool.query(`
      SELECT p.id, p.name, p.description, p.repo_url, p.status, p.started_at, p.ended_at,
             (SELECT COUNT(*) FROM project_members pm2 WHERE pm2.project_id = p.id) AS member_count
      FROM projects p
      JOIN project_members pm ON pm.project_id = p.id
      WHERE pm.user_id = $1 AND p.status IN ('shipped', 'building', 'review')
      ORDER BY p.ended_at DESC NULLS LAST, p.created_at DESC
    `, [user.id]);

    // Score snapshots (progression history)
    const snapshotsResult = await pool.query(`
      SELECT ss.pillar_scores, ss.archetype_before, ss.archetype_after, ss.computed_at,
             p.name AS project_name
      FROM score_snapshots ss
      JOIN projects p ON p.id = ss.project_id
      WHERE ss.user_id = $1
      ORDER BY ss.computed_at
    `, [user.id]);

    return {
      user,
      developer: devResult.rows[0] || null,
      projects: projectsResult.rows,
      progression: snapshotsResult.rows
    };
  });
}

export default projectRoutes;
