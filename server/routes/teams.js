import pool from '../db/connection.js';
import { calculateSynergy } from '../services/synergy.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getTeamWithMembers(teamId) {
  const teamResult = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
  if (teamResult.rows.length === 0) return null;

  const membersResult = await pool.query(`
    SELECT d.*, json_agg(json_build_object('pillar', ds.pillar, 'score', ds.score)) AS scores
    FROM team_members tm
    JOIN developers d ON d.id = tm.developer_id
    JOIN developer_scores ds ON ds.developer_id = d.id
    WHERE tm.team_id = $1
    GROUP BY d.id
  `, [teamId]);

  return {
    ...teamResult.rows[0],
    members: membersResult.rows
  };
}

async function teamRoutes(fastify) {
  // POST /api/teams — create a team
  fastify.post('/api/teams', async (request, reply) => {
    const { name = 'My Team', developer_ids = [] } = request.body;

    if (!Array.isArray(developer_ids) || developer_ids.some(id => !UUID_RE.test(id))) {
      return reply.code(400).send({ error: 'developer_ids must be an array of valid UUIDs' });
    }
    if (developer_ids.length > 5) {
      return reply.code(400).send({ error: 'Maximum 5 developers per team' });
    }

    // Get members with scores for synergy calculation
    const members = [];
    for (const devId of developer_ids) {
      const devResult = await pool.query('SELECT * FROM developers WHERE id = $1', [devId]);
      const scoresResult = await pool.query('SELECT pillar, score FROM developer_scores WHERE developer_id = $1', [devId]);
      if (devResult.rows.length > 0) {
        members.push({ ...devResult.rows[0], scores: scoresResult.rows });
      }
    }

    const { synergy, diversityBonus, total } = calculateSynergy(members);

    const teamResult = await pool.query(
      'INSERT INTO teams (name, synergy_score, diversity_bonus) VALUES ($1, $2, $3) RETURNING *',
      [name, synergy, diversityBonus]
    );

    const teamId = teamResult.rows[0].id;

    for (const devId of developer_ids) {
      await pool.query(
        'INSERT INTO team_members (team_id, developer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [teamId, devId]
      );
    }

    const team = await getTeamWithMembers(teamId);
    return reply.code(201).send(team);
  });

  // GET /api/teams/:id
  fastify.get('/api/teams/:id', async (request, reply) => {
    const team = await getTeamWithMembers(request.params.id);
    if (!team) return reply.code(404).send({ error: 'Team not found' });
    return team;
  });

  // PATCH /api/teams/:id — update members
  fastify.patch('/api/teams/:id', async (request, reply) => {
    const { id } = request.params;
    const { developer_ids = [] } = request.body;

    if (!Array.isArray(developer_ids) || developer_ids.some(did => !UUID_RE.test(did))) {
      return reply.code(400).send({ error: 'developer_ids must be an array of valid UUIDs' });
    }
    if (developer_ids.length > 5) {
      return reply.code(400).send({ error: 'Maximum 5 developers per team' });
    }

    const teamCheck = await pool.query('SELECT id FROM teams WHERE id = $1', [id]);
    if (teamCheck.rows.length === 0) return reply.code(404).send({ error: 'Team not found' });

    // Replace all members
    await pool.query('DELETE FROM team_members WHERE team_id = $1', [id]);

    for (const devId of developer_ids) {
      await pool.query(
        'INSERT INTO team_members (team_id, developer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, devId]
      );
    }

    // Recalculate synergy
    const members = [];
    for (const devId of developer_ids) {
      const devResult = await pool.query('SELECT * FROM developers WHERE id = $1', [devId]);
      const scoresResult = await pool.query('SELECT pillar, score FROM developer_scores WHERE developer_id = $1', [devId]);
      if (devResult.rows.length > 0) {
        members.push({ ...devResult.rows[0], scores: scoresResult.rows });
      }
    }

    const { synergy, diversityBonus, total } = calculateSynergy(members);
    await pool.query(
      'UPDATE teams SET synergy_score = $1, diversity_bonus = $2 WHERE id = $3',
      [synergy, diversityBonus, id]
    );

    const team = await getTeamWithMembers(id);
    return team;
  });
}

export default teamRoutes;
