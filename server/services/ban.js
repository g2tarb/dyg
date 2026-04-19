import pool from '../db/connection.js';

// Progressive ban durations in months
// 3 abandons = 1 month, 4 = 3 months, 5 = 6 months, 6+ = 12 months
const BAN_DURATIONS = [0, 0, 0, 1, 3, 6, 12];

function getBanDuration(abandonCount) {
  if (abandonCount < 3) return 0;
  if (abandonCount >= BAN_DURATIONS.length) return 12;
  return BAN_DURATIONS[abandonCount];
}

async function recordAbandon(userId, projectId) {
  // Increment abandon count
  const result = await pool.query(`
    UPDATE users SET abandon_count = abandon_count + 1, updated_at = NOW()
    WHERE id = $1 RETURNING abandon_count, ban_count
  `, [userId]);

  if (result.rows.length === 0) return null;

  const { abandon_count } = result.rows[0];
  const banMonths = getBanDuration(abandon_count);

  if (banMonths > 0) {
    const bannedUntil = new Date();
    bannedUntil.setMonth(bannedUntil.getMonth() + banMonths);

    await pool.query(`
      UPDATE users SET banned_until = $1, ban_count = ban_count + 1, updated_at = NOW()
      WHERE id = $2
    `, [bannedUntil.toISOString(), userId]);

    // Record ban history
    await pool.query(`
      INSERT INTO ban_history (user_id, reason, ban_duration_months, banned_until)
      VALUES ($1, 'project_abandon', $2, $3)
    `, [userId, banMonths, bannedUntil.toISOString()]);

    // Audit log
    await pool.query(`
      INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
      VALUES ($1, 'ban_applied', 'project', $2, $3)
    `, [userId, projectId, JSON.stringify({ abandon_count, ban_months: banMonths })]);

    return { banned: true, until: bannedUntil, months: banMonths, abandon_count };
  }

  // Warning at 2 abandons
  return { banned: false, abandon_count, warning: abandon_count === 2 };
}

async function decayAbandons() {
  // Reset abandon_count for users who haven't abandoned in 12 months
  await pool.query(`
    UPDATE users SET abandon_count = GREATEST(0, abandon_count - 1), updated_at = NOW()
    WHERE abandon_count > 0
    AND id NOT IN (
      SELECT user_id FROM ban_history
      WHERE created_at > NOW() - INTERVAL '12 months'
    )
  `);
}

async function isUserBanned(userId) {
  const result = await pool.query(
    'SELECT banned_until FROM users WHERE id = $1',
    [userId]
  );
  if (result.rows.length === 0) return { banned: false };

  const { banned_until } = result.rows[0];
  if (!banned_until) return { banned: false };

  if (new Date(banned_until) > new Date()) {
    return { banned: true, until: banned_until };
  }

  // Ban expired — clear it
  await pool.query('UPDATE users SET banned_until = NULL WHERE id = $1', [userId]);
  return { banned: false };
}

export { recordAbandon, isUserBanned, getBanDuration, decayAbandons };
