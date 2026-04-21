import pool from '../db/connection.js';
import { DygError, NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';

/**
 * Friendship model:
 *   - A row represents a request from requester_id → addressee_id.
 *   - status: pending | accepted | declined.
 *   - Only ONE row can exist between two users at a time (unique constraint).
 *   - Accepted = both users are friends (bidirectional semantic).
 *
 * Blocks are separate (user_blocks). Blocking is directional and independent
 * of the friendship state (but clears it when a block happens).
 */

async function isBlocked(aId, bId) {
  const r = await pool.query(
    `SELECT 1 FROM user_blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1) LIMIT 1`,
    [aId, bId]
  );
  return r.rows.length > 0;
}

export async function sendFriendRequest(requesterId, addresseeId) {
  if (requesterId === addresseeId) {
    throw new ConflictError("You can't friend yourself.");
  }

  if (await isBlocked(requesterId, addresseeId)) {
    throw new ForbiddenError('Cannot send a friend request to this user.');
  }

  const target = await pool.query('SELECT id FROM users WHERE id = $1', [addresseeId]);
  if (target.rows.length === 0) throw new NotFoundError('User not found.');

  // Look for an existing row in either direction.
  const existing = await pool.query(
    `SELECT * FROM friendships
     WHERE (requester_id = $1 AND addressee_id = $2)
        OR (requester_id = $2 AND addressee_id = $1)
     LIMIT 1`,
    [requesterId, addresseeId]
  );

  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    if (row.status === 'accepted') return { ...row, already: 'friends' };
    if (row.status === 'pending') {
      // If the OTHER direction has a pending request, treat this as an auto-accept
      if (row.requester_id === addresseeId && row.addressee_id === requesterId) {
        return await respondToRequest(row.id, requesterId, 'accept');
      }
      return { ...row, already: 'pending' };
    }
    // declined → allow a new request after decline by resetting the row
    const reset = await pool.query(
      `UPDATE friendships SET requester_id = $1, addressee_id = $2, status = 'pending',
                              created_at = NOW(), responded_at = NULL
       WHERE id = $3 RETURNING *`,
      [requesterId, addresseeId, row.id]
    );
    return reset.rows[0];
  }

  const inserted = await pool.query(
    `INSERT INTO friendships (requester_id, addressee_id, status)
     VALUES ($1, $2, 'pending') RETURNING *`,
    [requesterId, addresseeId]
  );
  return inserted.rows[0];
}

export async function respondToRequest(friendshipId, userId, action) {
  if (action !== 'accept' && action !== 'decline') {
    throw new DygError('Invalid action.', 400, 'VALIDATION_FAILED');
  }

  const fr = await pool.query('SELECT * FROM friendships WHERE id = $1', [friendshipId]);
  if (fr.rows.length === 0) throw new NotFoundError('Request not found.');
  const row = fr.rows[0];

  if (row.addressee_id !== userId) {
    throw new ForbiddenError('Only the addressee can respond to this request.');
  }
  if (row.status !== 'pending') {
    throw new ConflictError('This request was already resolved.');
  }

  const newStatus = action === 'accept' ? 'accepted' : 'declined';
  const updated = await pool.query(
    `UPDATE friendships SET status = $1, responded_at = NOW() WHERE id = $2 RETURNING *`,
    [newStatus, friendshipId]
  );
  return updated.rows[0];
}

export async function removeFriend(userId, otherId) {
  const result = await pool.query(
    `DELETE FROM friendships
     WHERE status = 'accepted'
       AND ((requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1))
     RETURNING id`,
    [userId, otherId]
  );
  if (result.rows.length === 0) throw new NotFoundError('You are not friends with this user.');
  return { removed: true };
}

export async function blockUser(blockerId, blockedId) {
  if (blockerId === blockedId) throw new ConflictError("You can't block yourself.");

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM friendships
       WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)`,
      [blockerId, blockedId]
    );
    await client.query(
      `INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [blockerId, blockedId]
    );
    await client.query('COMMIT');
    return { blocked: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function unblockUser(blockerId, blockedId) {
  const result = await pool.query(
    'DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2 RETURNING *',
    [blockerId, blockedId]
  );
  return { unblocked: result.rows.length > 0 };
}

export async function listFriends(userId) {
  const result = await pool.query(`
    SELECT
      u.id, u.github_login, u.avatar_url, u.name,
      d.archetype, d.secondary_archetype,
      f.created_at AS since
    FROM friendships f
    JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
    LEFT JOIN developers d ON d.user_id = u.id
    WHERE f.status = 'accepted'
      AND (f.requester_id = $1 OR f.addressee_id = $1)
    ORDER BY f.responded_at DESC NULLS LAST, f.created_at DESC
  `, [userId]);
  return result.rows;
}

export async function listPendingReceived(userId) {
  const result = await pool.query(`
    SELECT f.id AS friendship_id, f.created_at,
           u.id, u.github_login, u.avatar_url, u.name,
           d.archetype, d.secondary_archetype
    FROM friendships f
    JOIN users u ON u.id = f.requester_id
    LEFT JOIN developers d ON d.user_id = u.id
    WHERE f.addressee_id = $1 AND f.status = 'pending'
    ORDER BY f.created_at DESC
  `, [userId]);
  return result.rows;
}

export async function listPendingSent(userId) {
  const result = await pool.query(`
    SELECT f.id AS friendship_id, f.created_at,
           u.id, u.github_login, u.avatar_url, u.name
    FROM friendships f
    JOIN users u ON u.id = f.addressee_id
    WHERE f.requester_id = $1 AND f.status = 'pending'
    ORDER BY f.created_at DESC
  `, [userId]);
  return result.rows;
}

export async function listBlocked(userId) {
  const result = await pool.query(`
    SELECT u.id, u.github_login, u.avatar_url, u.name, ub.created_at
    FROM user_blocks ub
    JOIN users u ON u.id = ub.blocked_id
    WHERE ub.blocker_id = $1
    ORDER BY ub.created_at DESC
  `, [userId]);
  return result.rows;
}

/**
 * Returns a summary of the social relation between two users.
 * Never throws — safe to call widely.
 */
export async function getRelationStatus(userId, otherId) {
  if (userId === otherId) return { self: true };

  const [friendship, blocks] = await Promise.all([
    pool.query(
      `SELECT * FROM friendships
       WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)
       LIMIT 1`,
      [userId, otherId]
    ),
    pool.query(
      `SELECT blocker_id FROM user_blocks
       WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
      [userId, otherId]
    )
  ]);

  const row = friendship.rows[0];
  const blockedByMe = blocks.rows.some(b => b.blocker_id === userId);
  const blockedByThem = blocks.rows.some(b => b.blocker_id === otherId);

  let state = 'none';
  let friendshipId = null;
  if (row) {
    friendshipId = row.id;
    if (row.status === 'accepted') state = 'friends';
    else if (row.status === 'pending') {
      state = row.requester_id === userId ? 'pending_out' : 'pending_in';
    } else state = 'declined';
  }

  return { state, friendshipId, blockedByMe, blockedByThem };
}

export async function areFriends(userId, otherId) {
  const r = await pool.query(
    `SELECT 1 FROM friendships
     WHERE status = 'accepted'
       AND ((requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1))
     LIMIT 1`,
    [userId, otherId]
  );
  return r.rows.length > 0;
}
