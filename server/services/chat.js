import pool from '../db/connection.js';
import { ForbiddenError, NotFoundError, DygError } from '../utils/errors.js';

const COMMUNITY_RATE_LIMIT_SECONDS = 10;

/**
 * Returns the conversation row or throws NotFoundError.
 */
export async function getConversation(conversationId) {
  const r = await pool.query('SELECT * FROM conversations WHERE id = $1', [conversationId]);
  if (r.rows.length === 0) throw new NotFoundError('Conversation not found');
  return r.rows[0];
}

/**
 * Access rules per conversation type:
 *   dm        → must be in conversation_participants
 *   global    → any authenticated user
 *   archetype → user's developer.archetype matches conversation.scope
 *   project   → user is in project_members(conversation.scope = project_id)
 *
 * Returns true/false, never throws.
 */
export async function canAccess(userId, conv) {
  if (!userId) return false;

  switch (conv.type) {
    case 'global':
      return true;

    case 'archetype': {
      const r = await pool.query(
        'SELECT archetype, secondary_archetype, tertiary_archetype FROM developers WHERE user_id = $1',
        [userId]
      );
      if (r.rows.length === 0) return false;
      const { archetype, secondary_archetype, tertiary_archetype } = r.rows[0];
      // Primary only — strict rule: your main division chat.
      return archetype === conv.scope;
    }

    case 'project': {
      const r = await pool.query(
        'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2 LIMIT 1',
        [conv.scope, userId]
      );
      return r.rows.length > 0;
    }

    case 'dm':
    default: {
      const r = await pool.query(
        'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2 LIMIT 1',
        [conv.id, userId]
      );
      return r.rows.length > 0;
    }
  }
}

/**
 * Fetch or create the single system conversation for a (type, scope).
 * Works for global (scope=null) and archetype (scope=division) and project (scope=project_id).
 */
export async function getSystemConversation(type, scope = null) {
  if (!['global', 'archetype', 'project'].includes(type)) {
    throw new DygError('Invalid system conversation type.', 400, 'VALIDATION_FAILED');
  }

  const existing = await pool.query(
    `SELECT * FROM conversations WHERE type = $1 AND (scope IS NOT DISTINCT FROM $2)`,
    [type, scope]
  );
  if (existing.rows.length > 0) return existing.rows[0];

  // Project conversations are created on the fly.
  if (type === 'project') {
    const inserted = await pool.query(
      `INSERT INTO conversations (type, scope, name) VALUES ('project', $1, $2) RETURNING *`,
      [scope, 'Project Chat']
    );
    return inserted.rows[0];
  }

  throw new NotFoundError('System conversation not seeded. Run migrations.');
}

export async function getConversationForArchetype(userId) {
  const r = await pool.query(
    'SELECT archetype FROM developers WHERE user_id = $1',
    [userId]
  );
  if (r.rows.length === 0) return null;
  return await getSystemConversation('archetype', r.rows[0].archetype);
}

/**
 * Returns true if the user's last message in this conversation was sent
 * less than COMMUNITY_RATE_LIMIT_SECONDS ago. Only applies to global/archetype.
 */
export async function isRateLimitedInCommunity(userId, conversationId) {
  const r = await pool.query(
    `SELECT created_at FROM messages
     WHERE conversation_id = $1 AND sender_id = $2
     ORDER BY created_at DESC LIMIT 1`,
    [conversationId, userId]
  );
  if (r.rows.length === 0) return { limited: false };
  const elapsedMs = Date.now() - new Date(r.rows[0].created_at).getTime();
  const remainingMs = COMMUNITY_RATE_LIMIT_SECONDS * 1000 - elapsedMs;
  if (remainingMs > 0) {
    return { limited: true, retryAfterMs: remainingMs };
  }
  return { limited: false };
}

/**
 * Assert that a user can access a conversation. Throws ForbiddenError if not.
 */
export async function assertAccess(userId, conv) {
  const ok = await canAccess(userId, conv);
  if (!ok) throw new ForbiddenError('You do not have access to this conversation.');
}

export { COMMUNITY_RATE_LIMIT_SECONDS };

/**
 * Cold DM cap: you can send up to INVITATION_CAP messages to a non-friend.
 * After that, you're locked until the recipient either replies or accepts
 * the friend request.
 */
export const INVITATION_CAP = 2;

/**
 * Tells whether userId can send a DM to otherId *right now*.
 * Returns:
 *   { allowed: true,  reason: 'friends' }
 *   { allowed: true,  reason: 'replied' }
 *   { allowed: true,  reason: 'invitation', remaining: 2 | 1 }
 *   { allowed: false, reason: 'self' | 'blocked' | 'declined' | 'invitation_cap' }
 */
export async function canSendDM(userId, otherId) {
  if (userId === otherId) return { allowed: false, reason: 'self' };

  // Block from either side closes the door (recipient blocked sender or vice-versa).
  const block = await pool.query(
    `SELECT 1 FROM user_blocks
     WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)
     LIMIT 1`,
    [userId, otherId]
  );
  if (block.rows.length > 0) return { allowed: false, reason: 'blocked' };

  // Friendship state.
  const fr = await pool.query(
    `SELECT status FROM friendships
     WHERE (requester_id = $1 AND addressee_id = $2) OR (requester_id = $2 AND addressee_id = $1)
     LIMIT 1`,
    [userId, otherId]
  );
  const status = fr.rows[0]?.status;
  if (status === 'accepted') return { allowed: true, reason: 'friends' };
  if (status === 'declined') return { allowed: false, reason: 'declined' };

  // No friendship (or pending). Check invitation cap.
  // Find the existing 1-to-1 DM conversation between these two, if any.
  const conv = await pool.query(
    `SELECT cp1.conversation_id
     FROM conversation_participants cp1
     JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
     JOIN conversations c ON c.id = cp1.conversation_id
     WHERE c.type = 'dm' AND cp1.user_id = $1 AND cp2.user_id = $2
       AND (SELECT COUNT(*) FROM conversation_participants cp3
            WHERE cp3.conversation_id = cp1.conversation_id) = 2
     LIMIT 1`,
    [userId, otherId]
  );
  if (conv.rows.length === 0) {
    return { allowed: true, reason: 'invitation', remaining: INVITATION_CAP };
  }

  const convId = conv.rows[0].conversation_id;
  const counts = await pool.query(
    `SELECT sender_id, COUNT(*)::int AS n FROM messages
     WHERE conversation_id = $1 GROUP BY sender_id`,
    [convId]
  );
  const mine = counts.rows.find(r => r.sender_id === userId)?.n || 0;
  const theirReply = counts.rows.some(r => r.sender_id === otherId);

  if (theirReply) return { allowed: true, reason: 'replied' };
  if (mine >= INVITATION_CAP) {
    return { allowed: false, reason: 'invitation_cap', cap: INVITATION_CAP, sent: mine };
  }
  return { allowed: true, reason: 'invitation', remaining: INVITATION_CAP - mine };
}

/**
 * For a DM conversation, figure out the policy vs each participant from the
 * viewer's perspective. Used to render UI banners and compute remaining quota.
 */
export async function getDmPolicy(viewerId, conversationId) {
  const other = await pool.query(
    `SELECT cp.user_id FROM conversation_participants cp
     WHERE cp.conversation_id = $1 AND cp.user_id != $2
     LIMIT 1`,
    [conversationId, viewerId]
  );
  if (other.rows.length === 0) return null;
  return await canSendDM(viewerId, other.rows[0].user_id);
}
