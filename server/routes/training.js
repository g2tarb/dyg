import pool from '../db/connection.js';
import { UnauthorizedError } from '../utils/errors.js';
import { reviewSubmission } from '../services/reviewer.js';

async function trainingRoutes(fastify) {
  // GET /api/training/tracks — list all tracks with progress
  fastify.get('/api/training/tracks', async (request, reply) => {
    let userId = null;
    try { await request.jwtVerify(); userId = request.user.id; } catch { /* public */ }

    const tracks = await pool.query('SELECT * FROM training_tracks ORDER BY sort_order, level');

    // Get exercise counts and user progress per track
    const result = [];
    for (const track of tracks.rows) {
      const exerciseCount = await pool.query(
        'SELECT COUNT(*)::int AS total FROM training_exercises WHERE track_id = $1',
        [track.id]
      );

      let completed = 0;
      let avgGold = 0;
      let avgGray = 0;
      if (userId) {
        const progress = await pool.query(`
          SELECT COUNT(*)::int AS done,
                 COALESCE(ROUND(AVG(ts.gold_stars), 1), 0) AS avg_gold,
                 COALESCE(ROUND(AVG(ts.gray_stars), 1), 0) AS avg_gray
          FROM training_submissions ts
          JOIN training_exercises te ON te.id = ts.exercise_id
          WHERE te.track_id = $1 AND ts.user_id = $2 AND ts.status IN ('submitted', 'reviewed')
        `, [track.id, userId]);
        completed = progress.rows[0].done;
        avgGold = parseFloat(progress.rows[0].avg_gold);
        avgGray = parseFloat(progress.rows[0].avg_gray);
      }

      result.push({
        ...track,
        exercise_count: exerciseCount.rows[0].total,
        completed,
        avg_gold: avgGold,
        avg_gray: avgGray
      });
    }

    return result;
  });

  // GET /api/training/tracks/:trackId/exercises — list exercises in a track
  fastify.get('/api/training/tracks/:trackId/exercises', async (request, reply) => {
    let userId = null;
    try { await request.jwtVerify(); userId = request.user.id; } catch { /* public */ }

    const exercises = await pool.query(
      'SELECT id, track_id, title, description, level, sort_order FROM training_exercises WHERE track_id = $1 ORDER BY sort_order',
      [request.params.trackId]
    );

    // Attach user progress
    if (userId) {
      for (const ex of exercises.rows) {
        const sub = await pool.query(
          'SELECT gold_stars, gray_stars, tips_used, status FROM training_submissions WHERE exercise_id = $1 AND user_id = $2',
          [ex.id, userId]
        );
        ex.submission = sub.rows[0] || null;
      }
    }

    return exercises.rows;
  });

  // GET /api/training/exercises/:id — get exercise detail with instructions
  fastify.get('/api/training/exercises/:id', async (request, reply) => {
    const ex = await pool.query('SELECT * FROM training_exercises WHERE id = $1', [request.params.id]);
    if (ex.rows.length === 0) return reply.code(404).send({ error: 'NOT_FOUND' });

    // Count tips available (don't reveal content)
    const tipCount = await pool.query(
      'SELECT COUNT(*)::int AS total FROM training_tips WHERE exercise_id = $1',
      [request.params.id]
    );

    // Get user submission if authenticated
    let submission = null;
    let tipsRevealed = [];
    try {
      await request.jwtVerify();
      const sub = await pool.query(
        'SELECT * FROM training_submissions WHERE exercise_id = $1 AND user_id = $2',
        [request.params.id, request.user.id]
      );
      submission = sub.rows[0] || null;

      // Reveal tips already used
      if (submission && submission.tips_used > 0) {
        const tips = await pool.query(
          'SELECT sort_order, content FROM training_tips WHERE exercise_id = $1 AND sort_order <= $2 ORDER BY sort_order',
          [request.params.id, submission.tips_used]
        );
        tipsRevealed = tips.rows;
      }
    } catch { /* not authenticated */ }

    return {
      ...ex.rows[0],
      tip_count: tipCount.rows[0].total,
      submission,
      tips_revealed: tipsRevealed
    };
  });

  // POST /api/training/exercises/:id/start — start an exercise
  fastify.post('/api/training/exercises/:id/start', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const exerciseId = request.params.id;
    const userId = request.user.id;

    // Check exercise exists
    const ex = await pool.query('SELECT id FROM training_exercises WHERE id = $1', [exerciseId]);
    if (ex.rows.length === 0) return reply.code(404).send({ error: 'NOT_FOUND' });

    // Create or get submission
    const result = await pool.query(`
      INSERT INTO training_submissions (exercise_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (exercise_id, user_id) DO NOTHING
      RETURNING *
    `, [exerciseId, userId]);

    if (result.rows.length === 0) {
      // Already started
      const existing = await pool.query(
        'SELECT * FROM training_submissions WHERE exercise_id = $1 AND user_id = $2',
        [exerciseId, userId]
      );
      return existing.rows[0];
    }

    return result.rows[0];
  });

  // POST /api/training/exercises/:id/tip — request a tip (-0.5 gray stars)
  fastify.post('/api/training/exercises/:id/tip', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const exerciseId = request.params.id;
    const userId = request.user.id;

    // Get current submission
    const sub = await pool.query(
      'SELECT * FROM training_submissions WHERE exercise_id = $1 AND user_id = $2',
      [exerciseId, userId]
    );
    if (sub.rows.length === 0) {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'Start the exercise first' });
    }

    const submission = sub.rows[0];
    if (submission.status !== 'in_progress') {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'Exercise already submitted' });
    }

    // Check if there are more tips available
    const tipCount = await pool.query(
      'SELECT COUNT(*)::int AS total FROM training_tips WHERE exercise_id = $1',
      [exerciseId]
    );
    const nextTip = submission.tips_used + 1;
    if (nextTip > tipCount.rows[0].total) {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'No more tips available' });
    }

    // Deduct 0.5 gray star and increment tips_used
    const newGray = Math.max(0, parseFloat(submission.gray_stars) - 0.5);
    await pool.query(
      'UPDATE training_submissions SET tips_used = $1, gray_stars = $2 WHERE id = $3',
      [nextTip, newGray, submission.id]
    );

    // Reveal the tip
    const tip = await pool.query(
      'SELECT sort_order, content FROM training_tips WHERE exercise_id = $1 AND sort_order = $2',
      [exerciseId, nextTip]
    );

    return {
      tip: tip.rows[0] || null,
      tips_used: nextTip,
      gray_stars: newGray
    };
  });

  // POST /api/training/exercises/:id/submit — submit solution
  fastify.post('/api/training/exercises/:id/submit', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const exerciseId = request.params.id;
    const userId = request.user.id;
    const { repo_url } = request.body;

    const sub = await pool.query(
      'SELECT * FROM training_submissions WHERE exercise_id = $1 AND user_id = $2',
      [exerciseId, userId]
    );
    if (sub.rows.length === 0) {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'Start the exercise first' });
    }
    if (sub.rows[0].status !== 'in_progress') {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'Already submitted' });
    }

    // Auto-review the GitHub repo
    let goldStars = 0;
    let feedback = '';

    if (repo_url) {
      try {
        const exerciseData = await pool.query('SELECT * FROM training_exercises WHERE id = $1', [exerciseId]);
        const result = await reviewSubmission(repo_url, exerciseData.rows[0]);
        goldStars = result.gold_stars;
        feedback = result.feedback;
      } catch (err) {
        console.warn('[reviewer] Auto-review failed:', err.message);
        goldStars = 1;
        feedback = 'Auto-review failed. Manual review pending.';
      }
    }

    await pool.query(`
      UPDATE training_submissions SET status = 'reviewed', repo_url = $1, submitted_at = NOW(),
             reviewed_at = NOW(), gold_stars = $2
      WHERE exercise_id = $3 AND user_id = $4
    `, [repo_url || null, goldStars, exerciseId, userId]);

    return { ok: true, status: 'reviewed', gold_stars: goldStars, feedback };
  });

  // GET /api/training/my-progress — overview of user's training progress
  fastify.get('/api/training/my-progress', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const userId = request.user.id;

    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total_started,
        COUNT(*) FILTER (WHERE status IN ('submitted', 'reviewed'))::int AS total_completed,
        COALESCE(ROUND(AVG(gold_stars) FILTER (WHERE status IN ('submitted', 'reviewed')), 1), 0) AS avg_gold,
        COALESCE(ROUND(AVG(gray_stars) FILTER (WHERE status IN ('submitted', 'reviewed')), 1), 0) AS avg_gray,
        COALESCE(SUM(tips_used)::int, 0) AS total_tips_used
      FROM training_submissions
      WHERE user_id = $1
    `, [userId]);

    return result.rows[0];
  });
}

export default trainingRoutes;
