import pool from '../db/connection.js';

// Progressive ban durations in months
// 2 abandons = 3 months, 3 = 6 months, 4 = 12 months, 5+ = 24 months
const BAN_DURATIONS = [0, 0, 3, 6, 12, 24];

function getBanDuration(abandonCount) {
  if (abandonCount < 2) return 0;
  if (abandonCount >= BAN_DURATIONS.length) return 24;
  return BAN_DURATIONS[abandonCount];
}

async function recordAbandon(userId, projectId, ip) {
  // Increment abandon count
  const result = await pool.query(`
    UPDATE users SET abandon_count = abandon_count + 1, updated_at = NOW()
    WHERE id = $1 RETURNING abandon_count, ban_count
  `, [userId]);

  if (result.rows.length === 0) return null;

  const { abandon_count, ban_count } = result.rows[0];
  const banMonths = getBanDuration(abandon_count);

  if (banMonths > 0) {
    const bannedUntil = new Date();
    bannedUntil.setMonth(bannedUntil.getMonth() + banMonths);

    await pool.query(`
      UPDATE users SET banned_until = $1, ban_count = ban_count + 1, banned_ip = $2, updated_at = NOW()
      WHERE id = $3
    `, [bannedUntil.toISOString(), ip, userId]);

    // Record ban history
    await pool.query(`
      INSERT INTO ban_history (user_id, reason, ban_duration_months, banned_until, ip_address)
      VALUES ($1, 'project_abandon', $2, $3, $4)
    `, [userId, banMonths, bannedUntil.toISOString(), ip]);

    // Audit log
    await pool.query(`
      INSERT INTO audit_logs (user_id, action, target_type, target_id, details)
      VALUES ($1, 'ban_applied', 'project', $2, $3)
    `, [userId, projectId, JSON.stringify({ abandon_count, ban_months: banMonths, ip })]);

    return { banned: true, until: bannedUntil, months: banMonths, abandon_count };
  }

  return { banned: false, abandon_count, warning: abandon_count === 1 };
}

async function isUserBanned(userId) {
  const result = await pool.query(
    'SELECT banned_until, banned_ip FROM users WHERE id = $1',
    [userId]
  );
  if (result.rows.length === 0) return { banned: false };

  const { banned_until, banned_ip } = result.rows[0];
  if (!banned_until) return { banned: false };

  if (new Date(banned_until) > new Date()) {
    return { banned: true, until: banned_until, ip: banned_ip };
  }

  // Ban expired — clear it
  await pool.query('UPDATE users SET banned_until = NULL, banned_ip = NULL WHERE id = $1', [userId]);
  return { banned: false };
}

async function isIPBanned(ip) {
  if (!ip) return false;
  const result = await pool.query(
    "SELECT id FROM users WHERE banned_ip = $1 AND banned_until > NOW() LIMIT 1",
    [ip]
  );
  return result.rows.length > 0;
}

async function requiresPayment(userId) {
  const result = await pool.query(
    'SELECT ban_count, is_paid_reinscription FROM users WHERE id = $1',
    [userId]
  );
  if (result.rows.length === 0) return false;
  // First ban is free (they serve the time). After that, 200€ to come back.
  return result.rows[0].ban_count > 1 && !result.rows[0].is_paid_reinscription;
}

export { recordAbandon, isUserBanned, isIPBanned, requiresPayment, getBanDuration };
