import pool from '../db/connection.js';

/**
 * Universal notification service.
 *
 * Create: idempotent via dedup_key (UNIQUE on (user_id, dedup_key)).
 *         Null dedup_key means "always new" (e.g. a fresh friend_request).
 *
 * Types currently supported (non-exhaustive):
 *   project_deadline_reminder | project_started | project_shipped
 *   friend_request | friend_accepted
 *   direct_message | community_mention
 *   war_invitation | war_starting
 */

export async function createNotification(userId, type, opts = {}) {
  const { title, body = null, link = null, payload = {}, dedupKey = null } = opts;
  if (!title) throw new Error('createNotification: title is required');

  try {
    const r = await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, link, payload, dedup_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, dedup_key) DO NOTHING
       RETURNING *`,
      [userId, type, title, body, link, JSON.stringify(payload), dedupKey]
    );
    return r.rows[0] || null; // null when dedup-skipped
  } catch (err) {
    console.warn('[notifications] create failed', err.message);
    return null;
  }
}

export async function listMine(userId, { limit = 30, offset = 0, unreadOnly = false } = {}) {
  const params = [userId, Math.min(limit, 100), Math.max(offset, 0)];
  const where = unreadOnly ? 'AND read_at IS NULL' : '';
  const r = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = $1 ${where}
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    params
  );
  return r.rows;
}

export async function getUnreadCount(userId) {
  const r = await pool.query(
    'SELECT COUNT(*)::int AS c FROM notifications WHERE user_id = $1 AND read_at IS NULL',
    [userId]
  );
  return r.rows[0].c;
}

export async function markAsRead(userId, notificationId) {
  const r = await pool.query(
    `UPDATE notifications SET read_at = NOW()
     WHERE id = $1 AND user_id = $2 AND read_at IS NULL
     RETURNING id`,
    [notificationId, userId]
  );
  return r.rows.length > 0;
}

export async function markAllAsRead(userId) {
  const r = await pool.query(
    'UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL',
    [userId]
  );
  return r.rowCount || 0;
}
