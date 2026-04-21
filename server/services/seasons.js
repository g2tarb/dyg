import pool from '../db/connection.js';

/**
 * Enroll a user in the currently active season.
 * Division is frozen at enrollment — it is NOT updated if the user re-enrolls
 * or if their archetype changes later in the season.
 */
export async function enrollUserInActiveSeason(userId, division) {
  const season = await pool.query(
    "SELECT id FROM seasons WHERE status = 'active' ORDER BY starts_at DESC LIMIT 1"
  );
  if (season.rows.length === 0) return null;

  const seasonId = season.rows[0].id;

  const existing = await pool.query(
    'SELECT * FROM season_enrollments WHERE season_id = $1 AND user_id = $2',
    [seasonId, userId]
  );
  if (existing.rows.length > 0) return existing.rows[0];

  const inserted = await pool.query(
    `INSERT INTO season_enrollments (season_id, user_id, division)
     VALUES ($1, $2, $3) RETURNING *`,
    [seasonId, userId, division]
  );
  return inserted.rows[0];
}

/**
 * Atomically award points to a user for an event.
 *
 * - Resolves the user's enrollment in the active season (no-op if not enrolled).
 * - Caps each source at 50 points per season (github_points or dyg_points).
 * - Writes an immutable audit row into point_events with the points actually applied.
 * - If the cap is already reached, writes a capped event with points = 0.
 *
 * Returns { enrollmentId, awarded, capped } or null if the user is not enrolled.
 */
export async function awardPoints(userId, source, eventType, points, details = {}) {
  if (source !== 'github' && source !== 'dyg') {
    throw new Error(`Invalid source: ${source}`);
  }
  const requested = Number(points);
  if (!Number.isFinite(requested) || requested < 0) {
    throw new Error(`Invalid points: ${points}`);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the enrollment row while we read/update it.
    const enrollResult = await client.query(
      `SELECT se.id, se.github_points, se.dyg_points
       FROM season_enrollments se
       JOIN seasons s ON s.id = se.season_id
       WHERE se.user_id = $1 AND s.status = 'active'
       LIMIT 1
       FOR UPDATE`,
      [userId]
    );
    if (enrollResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const enrollment = enrollResult.rows[0];
    const column = source === 'github' ? 'github_points' : 'dyg_points';
    const current = Number(enrollment[column]);
    const room = Math.max(0, 50 - current);
    const delta = Math.min(room, requested);

    if (delta === 0) {
      await client.query(
        `INSERT INTO point_events (enrollment_id, source, event_type, points, details)
         VALUES ($1, $2, $3, 0, $4)`,
        [enrollment.id, source, eventType, JSON.stringify({ ...details, capped: true, requested })]
      );
      await client.query('COMMIT');
      return { enrollmentId: enrollment.id, awarded: 0, capped: true };
    }

    await client.query(
      `INSERT INTO point_events (enrollment_id, source, event_type, points, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [enrollment.id, source, eventType, delta, JSON.stringify(details)]
    );
    await client.query(
      `UPDATE season_enrollments SET ${column} = ${column} + $1 WHERE id = $2`,
      [delta, enrollment.id]
    );
    await client.query('COMMIT');

    return { enrollmentId: enrollment.id, awarded: delta, capped: delta < requested };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getActiveSeason() {
  const result = await pool.query(
    "SELECT id, slug, name, starts_at, ends_at, status FROM seasons WHERE status = 'active' ORDER BY starts_at DESC LIMIT 1"
  );
  return result.rows[0] || null;
}

/**
 * Returns the user's enrollment in the active season, plus their current rank
 * within their division. Null if not enrolled.
 */
export async function getMyEnrollment(userId) {
  const result = await pool.query(`
    WITH active AS (
      SELECT id FROM seasons WHERE status = 'active' ORDER BY starts_at DESC LIMIT 1
    ),
    ranked AS (
      SELECT
        se.*,
        RANK() OVER (PARTITION BY se.season_id, se.division ORDER BY se.total_points DESC, se.joined_at ASC) AS division_rank,
        COUNT(*) OVER (PARTITION BY se.season_id, se.division) AS division_size
      FROM season_enrollments se
      WHERE se.season_id = (SELECT id FROM active)
    )
    SELECT * FROM ranked WHERE user_id = $1
  `, [userId]);
  return result.rows[0] || null;
}

/**
 * Leaderboard for a division in a season. Users' identity is joined on demand.
 */
export async function getDivisionLeaderboard(seasonId, division, limit = 50) {
  const result = await pool.query(`
    SELECT
      se.user_id,
      u.github_login,
      u.avatar_url,
      u.name,
      se.division,
      se.github_points,
      se.dyg_points,
      se.total_points,
      RANK() OVER (ORDER BY se.total_points DESC, se.joined_at ASC) AS rank
    FROM season_enrollments se
    JOIN users u ON u.id = se.user_id
    WHERE se.season_id = $1 AND se.division = $2
    ORDER BY se.total_points DESC, se.joined_at ASC
    LIMIT $3
  `, [seasonId, division, limit]);
  return result.rows;
}
