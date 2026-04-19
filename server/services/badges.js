import pool from '../db/connection.js';

const BADGE_DEFINITIONS = {
  'first-scan': { trigger: 'scan', condition: () => true },
  'first-project': { trigger: 'project_join', condition: () => true },
  'first-ship': { trigger: 'project_ship', condition: () => true },
  'five-shipped': { trigger: 'project_ship', condition: async (userId) => {
    const r = await pool.query(
      "SELECT COUNT(*)::int AS c FROM project_members pm JOIN projects p ON p.id = pm.project_id WHERE pm.user_id = $1 AND p.status = 'shipped'",
      [userId]
    );
    return r.rows[0].c >= 5;
  }},
  'perfect-review': { trigger: 'review_received', condition: async (userId) => {
    const r = await pool.query(
      'SELECT AVG(stars) AS avg FROM reputation WHERE reviewee_id = $1',
      [userId]
    );
    return parseFloat(r.rows[0]?.avg) >= 5;
  }},
  'dual-archetype': { trigger: 'scan', condition: async (userId) => {
    const r = await pool.query('SELECT secondary_archetype FROM developers WHERE user_id = $1', [userId]);
    return !!r.rows[0]?.secondary_archetype;
  }},
  'triple-archetype': { trigger: 'scan', condition: async (userId) => {
    const r = await pool.query('SELECT tertiary_archetype FROM developers WHERE user_id = $1', [userId]);
    return !!r.rows[0]?.tertiary_archetype;
  }},
  'training-10': { trigger: 'training_submit', condition: async (userId) => {
    const r = await pool.query(
      "SELECT COUNT(*)::int AS c FROM training_submissions WHERE user_id = $1 AND status IN ('submitted', 'reviewed')",
      [userId]
    );
    return r.rows[0].c >= 10;
  }},
  'ia-architect': { trigger: 'scan', condition: async (userId, extra) => {
    return extra?.dev_style === 'ia-architect';
  }}
};

async function checkAndAwardBadges(userId, trigger, extra = {}) {
  const awarded = [];

  for (const [key, def] of Object.entries(BADGE_DEFINITIONS)) {
    if (def.trigger !== trigger) continue;

    try {
      // Check if already earned
      const existing = await pool.query(
        'SELECT 1 FROM badges WHERE user_id = $1 AND badge_key = $2',
        [userId, key]
      );
      if (existing.rows.length > 0) continue;

      // Check condition
      const earned = await def.condition(userId, extra);
      if (!earned) continue;

      // Award
      await pool.query(
        'INSERT INTO badges (user_id, badge_key) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, key]
      );
      awarded.push(key);
    } catch { /* badge check failure is non-critical */ }
  }

  return awarded;
}

async function getUserBadges(userId) {
  const result = await pool.query(
    'SELECT badge_key, earned_at FROM badges WHERE user_id = $1 ORDER BY earned_at',
    [userId]
  );
  return result.rows;
}

export { checkAndAwardBadges, getUserBadges, BADGE_DEFINITIONS };
