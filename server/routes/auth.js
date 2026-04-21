import pool from '../db/connection.js';
import { ARCHETYPES, PILLARS } from '../constants/archetypes.js';
import { determineArchetype } from '../services/scoring.js';
import { encrypt } from '../utils/crypto.js';
import { SaveProfileSchema } from '../schemas/validation.js';
import { UnauthorizedError } from '../utils/errors.js';
import { checkAndAwardBadges, getUserBadges } from '../services/badges.js';
import { getRecommendations } from '../services/recommend.js';
import { enrollUserInActiveSeason } from '../services/seasons.js';
import { syncGithubPointsForUser } from '../services/githubPoints.js';
import env from '../config/env.js';

async function authRoutes(fastify) {
  // OAuth callback
  fastify.get('/auth/github/callback', async (request, reply) => {
    let token;
    try {
      const result = await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
      token = result.token;
    } catch (err) {
      request.log.error({ err: err.message, query: request.query }, 'OAuth token exchange failed');
      return reply.redirect('/#/?auth=error');
    }

    const ghRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DYG-App'
      }
    });

    if (!ghRes.ok) {
      request.log.error({ status: ghRes.status }, 'GitHub user fetch failed');
      return reply.redirect('/#/?auth=error');
    }

    const ghUser = await ghRes.json();

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
    } catch { /* best-effort */ }

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

    // Check if user is banned
    if (user.banned_until && new Date(user.banned_until) > new Date()) {
      return reply.redirect(`/#/banned?until=${encodeURIComponent(user.banned_until)}`);
    }

    const jwt = fastify.jwt.sign({ id: user.id, github_login: user.github_login });

    reply.setCookie('token', jwt, {
      path: '/',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });

    return reply.redirect('/#/onboarding');
  });

  // GET /api/auth/me
  fastify.get('/api/auth/me', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      throw new UnauthorizedError();
    }

    const { id } = request.user;

    const userResult = await pool.query(
      'SELECT id, github_login, email, avatar_url, name, data_consent, created_at FROM users WHERE id = $1',
      [id]
    );
    if (userResult.rows.length === 0) throw new UnauthorizedError('User not found');

    const devResult = await pool.query(`
      SELECT d.id, d.archetype, d.bio, d.languages, d.github_username,
             json_agg(json_build_object('pillar', ds.pillar, 'score', ds.score)) AS scores
      FROM developers d
      JOIN developer_scores ds ON ds.developer_id = d.id
      WHERE d.user_id = $1
      GROUP BY d.id
    `, [id]);

    const badges = await getUserBadges(id);

    return {
      user: userResult.rows[0],
      developer: devResult.rows[0] || null,
      badges
    };
  });

  // GET /api/auth/recommendations — recommended teammates
  fastify.get('/api/auth/recommendations', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const recs = await getRecommendations(request.user.id);
    return recs;
  });

  // GET /api/auth/my-data-export — RGPD data export (ZIP JSON)
  fastify.get('/api/auth/my-data-export', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const userId = request.user.id;

    const [user, dev, scores, projects, messages, reviews, badges, training, samples] = await Promise.all([
      pool.query('SELECT id, github_login, email, name, created_at FROM users WHERE id = $1', [userId]),
      pool.query('SELECT * FROM developers WHERE user_id = $1', [userId]),
      pool.query('SELECT ds.* FROM developer_scores ds JOIN developers d ON d.id = ds.developer_id WHERE d.user_id = $1', [userId]),
      pool.query("SELECT p.* FROM projects p JOIN project_members pm ON pm.project_id = p.id WHERE pm.user_id = $1", [userId]),
      pool.query('SELECT m.body, m.created_at FROM messages m WHERE m.sender_id = $1 ORDER BY m.created_at DESC LIMIT 100', [userId]),
      pool.query('SELECT * FROM peer_reviews WHERE reviewer_id = $1 OR reviewee_id = $1', [userId]),
      pool.query('SELECT * FROM badges WHERE user_id = $1', [userId]),
      pool.query('SELECT ts.*, te.title FROM training_submissions ts JOIN training_exercises te ON te.id = ts.exercise_id WHERE ts.user_id = $1', [userId]),
      pool.query('SELECT sample_type, language, created_at FROM code_samples WHERE user_id = $1', [userId])
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user: user.rows[0] || null,
      developer_profile: dev.rows[0] || null,
      scores: scores.rows,
      projects: projects.rows,
      messages_sent: messages.rows,
      peer_reviews: reviews.rows,
      badges: badges.rows,
      training_progress: training.rows,
      code_samples_metadata: samples.rows
    };

    reply.header('Content-Type', 'application/json');
    reply.header('Content-Disposition', 'attachment; filename="dyg-data-export.json"');
    return exportData;
  });

  // POST /api/auth/logout
  fastify.post('/api/auth/logout', async (request, reply) => {
    reply.clearCookie('token', { path: '/' });
    return { ok: true };
  });

  // PATCH /api/profile — customize profile (tagline)
  fastify.patch('/api/profile', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const { tagline } = request.body;
    if (tagline !== undefined && (typeof tagline !== 'string' || tagline.length > 100)) {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'Tagline must be 100 chars or less' });
    }

    const result = await pool.query(
      'UPDATE developers SET tagline = $1 WHERE user_id = $2 RETURNING id, tagline',
      [tagline || null, request.user.id]
    );

    if (result.rows.length === 0) {
      return reply.code(404).send({ error: 'NOT_FOUND', message: 'Profile not found. Scan your GitHub first.' });
    }

    return { ok: true, tagline: result.rows[0].tagline };
  });

  // DELETE /api/auth/account — GDPR right to be forgotten
  fastify.delete('/api/auth/account', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const userId = request.user.id;

    // Cascade delete: developers, scores, project_members, messages, code_samples, audit_logs, etc.
    // Foreign keys with ON DELETE CASCADE handle most of it
    await pool.query('DELETE FROM developers WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    reply.clearCookie('token', { path: '/' });

    return { ok: true, deleted: true };
  });

  // POST /api/onboarding/save-profile
  fastify.post('/api/onboarding/save-profile', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      throw new UnauthorizedError();
    }

    const userId = request.user.id;
    const parsed = SaveProfileSchema.parse(request.body);

    const userResult = await pool.query('SELECT github_login FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) throw new UnauthorizedError('User not found');
    const githubUsername = userResult.rows[0].github_login;

    const existing = await pool.query('SELECT id FROM developers WHERE user_id = $1', [userId]);
    let devId;

    // Recalculate archetype with dual/triple detection
    const { primary, secondary, tertiary } = determineArchetype(parsed.scores);

    if (existing.rows.length > 0) {
      devId = existing.rows[0].id;
      await pool.query(`
        UPDATE developers SET name = $1, avatar_url = $2, bio = $3, archetype = $4,
               secondary_archetype = $5, tertiary_archetype = $6, languages = $7, github_username = $8 WHERE id = $9
      `, [parsed.name, parsed.avatar_url, parsed.bio, primary, secondary, tertiary, JSON.stringify(parsed.languages), githubUsername, devId]);
      await pool.query('DELETE FROM developer_scores WHERE developer_id = $1', [devId]);
    } else {
      const devResult = await pool.query(`
        INSERT INTO developers (user_id, name, avatar_url, bio, archetype, secondary_archetype, tertiary_archetype, github_username, languages)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
      `, [userId, parsed.name, parsed.avatar_url, parsed.bio, primary, secondary, tertiary, githubUsername, JSON.stringify(parsed.languages)]);
      devId = devResult.rows[0].id;
    }

    for (const s of parsed.scores) {
      await pool.query(
        'INSERT INTO developer_scores (developer_id, pillar, score) VALUES ($1, $2, $3)',
        [devId, s.pillar, s.score]
      );
    }

    // Audit log
    await pool.query(`
      INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
      VALUES ($1, 'profile_save', 'developer', $2, $3)
    `, [userId, devId, JSON.stringify({ archetype: parsed.archetype })]);

    // Award badges
    const awarded = await checkAndAwardBadges(userId, 'scan', { dev_style: primary });

    // Enroll in active season — division frozen at primary archetype.
    // No-op if the user is already enrolled (division stays).
    try {
      await enrollUserInActiveSeason(userId, primary);
    } catch (err) {
      request.log.warn({ err, userId, division: primary }, 'Season enrollment failed (non-fatal)');
    }

    // Fire-and-forget initial GitHub points sync (activity + substance).
    syncGithubPointsForUser(userId)
      .catch(err => request.log.warn({ err, userId }, 'Initial GitHub points sync failed'));

    return { ok: true, developer_id: devId, badges_earned: awarded };
  });
}

export default authRoutes;
