import pool from '../db/connection.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    try { await request.jwtVerify(); } catch { return reply.code(401).send({ error: 'Not authenticated' }); }

    const { name, description, repo_url, max_members } = request.body;
    const creatorId = request.user.id;

    if (!name || name.trim().length === 0) {
      return reply.code(400).send({ error: 'Project name is required' });
    }

    const result = await pool.query(`
      INSERT INTO projects (name, description, repo_url, creator_id, max_members)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [name.trim(), description || null, repo_url || null, creatorId, max_members || 5]);

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
    const { status, limit = 20, offset = 0 } = request.query;

    let query = `
      SELECT p.*, u.github_login AS creator_login, u.avatar_url AS creator_avatar,
             (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id) AS member_count
      FROM projects p
      JOIN users u ON u.id = p.creator_id
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` WHERE p.status = $${params.length}`;
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

    const project = await getProjectWithMembers(id);
    return project;
  });

  // POST /api/projects/:id/join — join a project (requires auth)
  fastify.post('/api/projects/:id/join', async (request, reply) => {
    try { await request.jwtVerify(); } catch { return reply.code(401).send({ error: 'Not authenticated' }); }

    const { id } = request.params;
    const userId = request.user.id;

    const projCheck = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (projCheck.rows.length === 0) return reply.code(404).send({ error: 'Project not found' });

    const project = projCheck.rows[0];
    if (project.status !== 'open' && project.status !== 'staffing') {
      return reply.code(400).send({ error: 'Project is not accepting new members' });
    }

    const memberCount = await pool.query('SELECT COUNT(*) FROM project_members WHERE project_id = $1', [id]);
    if (parseInt(memberCount.rows[0].count) >= project.max_members) {
      return reply.code(400).send({ error: 'Project is full' });
    }

    try {
      await pool.query(
        'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
        [id, userId, 'member']
      );
    } catch (err) {
      if (err.code === '23505') return reply.code(409).send({ error: 'Already a member' });
      throw err;
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
