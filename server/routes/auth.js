import pool from '../db/connection.js';
import { ARCHETYPES, PILLARS } from '../constants/archetypes.js';
import { encrypt } from '../utils/crypto.js';

async function authRoutes(fastify) {
  // OAuth callback — GitHub redirects here after user approves
  fastify.get('/auth/github/callback', async (request, reply) => {
    const { token } = await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);

    // Fetch GitHub user profile
    const ghRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DYG-App'
      }
    });

    if (!ghRes.ok) {
      fastify.log.error('GitHub user fetch failed:', ghRes.status);
      return reply.redirect('/#/?auth=error');
    }

    const ghUser = await ghRes.json();

    // Fetch primary email
    let email = null;
    try {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DYG-App'
        }
      });
      if (emailRes.ok) {
        const emails = await emailRes.json();
        const primary = emails.find(e => e.primary);
        email = primary?.email || emails[0]?.email || null;
      }
    } catch {
      // Email fetch is best-effort
    }

    // Upsert user in DB
    const result = await pool.query(`
      INSERT INTO users (github_id, github_login, email, avatar_url, name, access_token)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (github_id) DO UPDATE SET
        github_login = $2,
        email = COALESCE($3, users.email),
        avatar_url = $4,
        name = $5,
        access_token = $6,
        updated_at = NOW()
      RETURNING *
    `, [ghUser.id, ghUser.login, email, ghUser.avatar_url, ghUser.name || ghUser.login, encrypt(token.access_token)]);

    const user = result.rows[0];

    // Sign JWT and set HttpOnly cookie
    const jwt = fastify.jwt.sign({ id: user.id, github_login: user.github_login });

    reply.setCookie('token', jwt, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return reply.redirect('/#/onboarding');
  });

  // GET /api/auth/me — current user info
  fastify.get('/api/auth/me', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    const { id } = request.user;

    const userResult = await pool.query(
      'SELECT id, github_login, email, avatar_url, name, created_at FROM users WHERE id = $1',
      [id]
    );
    if (userResult.rows.length === 0) {
      return reply.code(401).send({ error: 'User not found' });
    }

    // Check if user has a developer profile
    const devResult = await pool.query(`
      SELECT d.id, d.archetype, d.bio, d.languages, d.github_username,
             json_agg(json_build_object('pillar', ds.pillar, 'score', ds.score)) AS scores
      FROM developers d
      JOIN developer_scores ds ON ds.developer_id = d.id
      WHERE d.user_id = $1
      GROUP BY d.id
    `, [id]);

    return {
      user: userResult.rows[0],
      developer: devResult.rows[0] || null
    };
  });

  // POST /api/auth/logout
  fastify.post('/api/auth/logout', async (request, reply) => {
    reply.clearCookie('token', { path: '/' });
    return { ok: true };
  });

  // POST /api/onboarding/save-profile — save scan results as developer profile (requires auth)
  fastify.post('/api/onboarding/save-profile', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'Not authenticated' });
    }

    const userId = request.user.id;
    const { name, avatar_url, bio, archetype, languages, scores } = request.body;

    if (!archetype || !scores || !Array.isArray(scores)) {
      return reply.code(400).send({ error: 'Missing required fields' });
    }

    // Validate archetype
    if (!ARCHETYPES[archetype]) {
      return reply.code(400).send({ error: 'Invalid archetype' });
    }

    // Validate scores: must have exactly 7 valid pillars with scores 1-10
    if (scores.length !== PILLARS.length) {
      return reply.code(400).send({ error: 'Exactly 7 pillar scores required' });
    }
    for (const s of scores) {
      if (!PILLARS.includes(s.pillar)) {
        return reply.code(400).send({ error: `Invalid pillar: ${s.pillar}` });
      }
      const score = parseInt(s.score);
      if (!Number.isInteger(score) || score < 1 || score > 10) {
        return reply.code(400).send({ error: `Score must be 1-10 for ${s.pillar}` });
      }
      s.score = score; // Ensure integer
    }

    // Get the user's github_login
    const userResult = await pool.query('SELECT github_login FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return reply.code(401).send({ error: 'User not found' });
    }
    const githubUsername = userResult.rows[0].github_login;

    // Check if developer profile already exists for this user
    const existing = await pool.query('SELECT id FROM developers WHERE user_id = $1', [userId]);

    let devId;

    if (existing.rows.length > 0) {
      // Update existing profile
      devId = existing.rows[0].id;
      await pool.query(`
        UPDATE developers SET name = $1, avatar_url = $2, bio = $3, archetype = $4,
               languages = $5, github_username = $6 WHERE id = $7
      `, [name, avatar_url, bio, archetype, JSON.stringify(languages || []), githubUsername, devId]);

      // Replace scores
      await pool.query('DELETE FROM developer_scores WHERE developer_id = $1', [devId]);
    } else {
      // Create new profile
      const devResult = await pool.query(`
        INSERT INTO developers (user_id, name, avatar_url, bio, archetype, github_username, languages)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [userId, name, avatar_url, bio, archetype, githubUsername, JSON.stringify(languages || [])]);
      devId = devResult.rows[0].id;
    }

    // Insert scores
    for (const s of scores) {
      await pool.query(
        'INSERT INTO developer_scores (developer_id, pillar, score) VALUES ($1, $2, $3)',
        [devId, s.pillar, s.score]
      );
    }

    return { ok: true, developer_id: devId };
  });
}

export default authRoutes;
