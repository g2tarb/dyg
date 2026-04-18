import pool from '../db/connection.js';
import { PILLARS } from '../constants/archetypes.js';

const VALID_ARCHETYPES = ['architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor'];
const VALID_PRICES = ['low', 'medium', 'high'];

async function developerRoutes(fastify) {
  // GET /api/developers — list with filters
  fastify.get('/api/developers', async (request, reply) => {
    const { sort = 'score' } = request.query;
    const limit = Math.min(Math.max(parseInt(request.query.limit) || 20, 1), 100);
    const offset = Math.max(parseInt(request.query.offset) || 0, 0);
    const archetype = VALID_ARCHETYPES.includes(request.query.archetype) ? request.query.archetype : null;
    const price = VALID_PRICES.includes(request.query.price) ? request.query.price : null;
    const pillar = PILLARS.includes(request.query.pillar) ? request.query.pillar : null;
    const min = Math.min(Math.max(parseInt(request.query.min) || 1, 1), 10);

    let query = `
      SELECT d.*,
        json_agg(json_build_object('pillar', ds.pillar, 'score', ds.score)) AS scores,
        ROUND(AVG(ds.score), 1) AS avg_score
      FROM developers d
      JOIN developer_scores ds ON ds.developer_id = d.id
    `;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (archetype) {
      conditions.push(`d.archetype = $${paramIndex++}`);
      params.push(archetype);
    }

    if (price) {
      conditions.push(`d.price_range = $${paramIndex++}`);
      params.push(price);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY d.id';

    // Filter by minimum score on a specific pillar (after aggregation)
    if (pillar && min) {
      query = `
        SELECT * FROM (${query}) AS devs
        WHERE EXISTS (
          SELECT 1 FROM json_array_elements(devs.scores) AS s
          WHERE s->>'pillar' = $${paramIndex++}
          AND (s->>'score')::int >= $${paramIndex++}
        )
      `;
      params.push(pillar, min);
    }

    // Sorting — allowlist only, never interpolate user input
    const SORT_MAP = { score: 'avg_score DESC', name: 'name ASC' };
    const orderClause = SORT_MAP[sort] || SORT_MAP.score;
    query += ` ORDER BY ${orderClause}`;

    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  });

  // GET /api/developers/:id — single dev with scores
  fastify.get('/api/developers/:id', async (request, reply) => {
    const { id } = request.params;

    const devResult = await pool.query('SELECT * FROM developers WHERE id = $1', [id]);
    if (devResult.rows.length === 0) {
      return reply.code(404).send({ error: 'Developer not found' });
    }

    const scoresResult = await pool.query(
      'SELECT pillar, score FROM developer_scores WHERE developer_id = $1',
      [id]
    );

    return {
      ...devResult.rows[0],
      scores: scoresResult.rows
    };
  });
}

export default developerRoutes;
