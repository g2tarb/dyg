import pool from '../db/connection.js';
import { ARCHETYPES, PILLARS } from '../constants/archetypes.js';
import { collectProjectContributions } from './collector.js';

const REVIEW_PILLARS = ['collaboration', 'craft', 'velocity'];

async function closeProject(projectId) {
  // Get all members
  const membersResult = await pool.query(
    'SELECT user_id FROM project_members WHERE project_id = $1',
    [projectId]
  );
  const memberIds = membersResult.rows.map(r => r.user_id);
  if (memberIds.length === 0) return;

  for (const userId of memberIds) {
    await updateMemberScores(projectId, userId);
    // Collect code samples for AI training (async, non-blocking)
    collectProjectContributions(projectId, userId).catch(err =>
      console.error(`[collector] Background collection failed:`, err.message)
    );
  }
}

async function updateMemberScores(projectId, userId) {
  // Get developer profile
  const devResult = await pool.query('SELECT id, archetype FROM developers WHERE user_id = $1', [userId]);
  if (devResult.rows.length === 0) return;

  const devId = devResult.rows[0].id;
  const archetypeBefore = devResult.rows[0].archetype;

  // Get current scores
  const scoresResult = await pool.query(
    'SELECT pillar, score FROM developer_scores WHERE developer_id = $1',
    [devId]
  );
  const currentScores = {};
  for (const row of scoresResult.rows) {
    currentScores[row.pillar] = row.score;
  }

  // Get peer reviews received on this project
  const reviewsResult = await pool.query(
    'SELECT pillar, rating FROM peer_reviews WHERE project_id = $1 AND reviewee_id = $2',
    [projectId, userId]
  );

  // Group reviews by pillar
  const reviewsByPillar = {};
  for (const r of reviewsResult.rows) {
    if (!reviewsByPillar[r.pillar]) reviewsByPillar[r.pillar] = [];
    reviewsByPillar[r.pillar].push(r.rating);
  }

  // Calculate deltas
  const newScores = {};
  for (const pillar of PILLARS) {
    const current = currentScores[pillar] || 5;

    if (REVIEW_PILLARS.includes(pillar) && reviewsByPillar[pillar]) {
      const ratings = reviewsByPillar[pillar];
      const avg = ratings.reduce((s, v) => s + v, 0) / ratings.length;
      // Map 1-5 avg to delta: (avg - 3) * 1.5, capped at ±3
      const delta = Math.round((avg - 3) * 1.5);
      const clamped = Math.max(-3, Math.min(3, delta));
      newScores[pillar] = Math.max(1, Math.min(10, current + clamped));
    } else {
      // Non-reviewed pillars: no change (avoids inflation)
      newScores[pillar] = current;
    }
  }

  // Update developer_scores
  for (const pillar of PILLARS) {
    await pool.query(`
      INSERT INTO developer_scores (developer_id, pillar, score) VALUES ($1, $2, $3)
      ON CONFLICT (developer_id, pillar) DO UPDATE SET score = $3
    `, [devId, pillar, newScores[pillar]]);
  }

  // Recalculate archetype
  const scores = PILLARS.map(p => ({ pillar: p, score: newScores[p] }));
  let bestMatch = 'architect';
  let bestScore = -1;
  for (const [key, archetype] of Object.entries(ARCHETYPES)) {
    const dominantSum = archetype.dominants.reduce((sum, p) => {
      const s = scores.find(sc => sc.pillar === p);
      return sum + (s ? s.score : 0);
    }, 0);
    if (dominantSum > bestScore) {
      bestScore = dominantSum;
      bestMatch = key;
    }
  }

  // Update archetype
  await pool.query('UPDATE developers SET archetype = $1 WHERE id = $2', [bestMatch, devId]);

  // Create score snapshot
  const pillarScoresJson = {};
  for (const p of PILLARS) pillarScoresJson[p] = newScores[p];

  await pool.query(`
    INSERT INTO score_snapshots (user_id, project_id, pillar_scores, archetype_before, archetype_after)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, project_id) DO UPDATE SET
      pillar_scores = $3, archetype_before = $4, archetype_after = $5, computed_at = NOW()
  `, [userId, projectId, JSON.stringify(pillarScoresJson), archetypeBefore, bestMatch]);

  // Audit log
  await pool.query(`
    INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
    VALUES ($1, 'score_update', 'project', $2, $3)
  `, [userId, projectId, JSON.stringify({
    archetype_before: archetypeBefore,
    archetype_after: bestMatch,
    pillar_scores: pillarScoresJson
  })]);
}

export { closeProject };
