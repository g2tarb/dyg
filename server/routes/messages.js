import pool from '../db/connection.js';
import { SendMessageSchema, ReplyMessageSchema } from '../schemas/validation.js';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/errors.js';
import {
  getConversation,
  canAccess,
  assertAccess,
  getSystemConversation,
  getConversationForArchetype,
  isRateLimitedInCommunity,
  canSendDM,
  getDmPolicy,
  COMMUNITY_RATE_LIMIT_SECONDS,
  INVITATION_CAP
} from '../services/chat.js';

function isCommunityType(type) {
  return type === 'global' || type === 'archetype';
}

async function fetchConversationView(conv, viewerId, limit = 50, offset = 0) {
  // Messages, excluding those from users the viewer has blocked.
  const messagesResult = await pool.query(`
    SELECT m.id, m.body, m.created_at, m.sender_id,
           u.github_login AS sender_login, u.avatar_url AS sender_avatar, u.name AS sender_name,
           d.archetype AS sender_archetype, d.secondary_archetype AS sender_secondary
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    LEFT JOIN developers d ON d.user_id = u.id
    WHERE m.conversation_id = $1
      AND NOT EXISTS (
        SELECT 1 FROM user_blocks b
        WHERE b.blocker_id = $2 AND b.blocked_id = m.sender_id
      )
    ORDER BY m.created_at DESC
    LIMIT $3 OFFSET $4
  `, [conv.id, viewerId, Math.min(limit, 100), Math.max(offset, 0)]);

  messagesResult.rows.reverse();

  const view = {
    conversation: { id: conv.id, type: conv.type, scope: conv.scope, name: conv.name },
    messages: messagesResult.rows
  };

  if (conv.type === 'dm') {
    const otherResult = await pool.query(`
      SELECT u.id, u.github_login, u.avatar_url, u.name
      FROM conversation_participants cp
      JOIN users u ON u.id = cp.user_id
      WHERE cp.conversation_id = $1 AND cp.user_id != $2
      LIMIT 1
    `, [conv.id, viewerId]);
    view.other_user = otherResult.rows[0] || null;

    // Attach the invitation / friendship policy so the UI can render a banner.
    view.dm_policy = await getDmPolicy(viewerId, conv.id);

    // Mark DM as read on fetch.
    await pool.query(
      'UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = $1 AND user_id = $2',
      [conv.id, viewerId]
    );
  }

  return view;
}

async function messageRoutes(fastify) {
  // POST /api/messages/send — send a DM (find or create conversation)
  fastify.post('/api/messages/send', {
    config: { rateLimit: { max: 15, timeWindow: '1 minute' } }
  }, async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const senderId = request.user.id;
    const parsed = SendMessageSchema.parse(request.body);
    const { to, body } = parsed;

    if (to === senderId) {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'Cannot send a message to yourself' });
    }

    // Check recipient exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [to]);
    if (userCheck.rows.length === 0) {
      return reply.code(404).send({ error: 'Recipient not found' });
    }

    // Enforce cold-DM rules (blocks, declined friendship, 2-msg invitation cap).
    const policy = await canSendDM(senderId, to);
    if (!policy.allowed) {
      return reply.code(403).send({
        error: 'DM_FORBIDDEN',
        reason: policy.reason,
        cap: policy.cap,
        message: policy.reason === 'invitation_cap'
          ? `Already sent ${policy.sent}/${policy.cap} messages. Wait for a reply or a friend accept.`
          : policy.reason === 'blocked' ? 'This user has blocked you.'
          : policy.reason === 'declined' ? 'This user declined your friend request.'
          : 'Cannot send a DM here.'
      });
    }

    // Find existing DM conversation between these 2 users
    const existingConv = await pool.query(`
      SELECT cp1.conversation_id
      FROM conversation_participants cp1
      JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
      WHERE cp1.user_id = $1 AND cp2.user_id = $2
      AND (SELECT COUNT(*) FROM conversation_participants cp3 WHERE cp3.conversation_id = cp1.conversation_id) = 2
      LIMIT 1
    `, [senderId, to]);

    let convId;

    if (existingConv.rows.length > 0) {
      convId = existingConv.rows[0].conversation_id;
    } else {
      // Create new conversation
      const convResult = await pool.query('INSERT INTO conversations DEFAULT VALUES RETURNING id');
      convId = convResult.rows[0].id;
      await pool.query('INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)', [convId, senderId, to]);
    }

    // Insert message
    const msgResult = await pool.query(
      'INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1, $2, $3) RETURNING *',
      [convId, senderId, body]
    );

    // Update sender's last_read_at
    await pool.query(
      'UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = $1 AND user_id = $2',
      [convId, senderId]
    );

    return reply.code(201).send({ conversation_id: convId, message: msgResult.rows[0] });
  });

  // GET /api/messages — list DM conversations with last message + unread count
  fastify.get('/api/messages', async (request, reply) => {
    try { await request.jwtVerify(); } catch { return reply.code(401).send({ error: 'Not authenticated' }); }

    const userId = request.user.id;

    const result = await pool.query(`
      SELECT
        c.id AS conversation_id,
        c.created_at,
        cp.last_read_at,
        (
          SELECT json_build_object('body', m.body, 'sender_id', m.sender_id, 'created_at', m.created_at)
          FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1
        ) AS last_message,
        (
          SELECT COUNT(*) FROM messages m
          WHERE m.conversation_id = c.id AND m.created_at > cp.last_read_at AND m.sender_id != $1
        )::int AS unread_count,
        (
          SELECT json_build_object('id', u.id, 'github_login', u.github_login, 'avatar_url', u.avatar_url, 'name', u.name)
          FROM conversation_participants cp2
          JOIN users u ON u.id = cp2.user_id
          WHERE cp2.conversation_id = c.id AND cp2.user_id != $1
          LIMIT 1
        ) AS other_user
      FROM conversations c
      JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = $1
      WHERE c.type = 'dm'
      ORDER BY (SELECT MAX(m.created_at) FROM messages m WHERE m.conversation_id = c.id) DESC NULLS LAST
    `, [userId]);

    return result.rows;
  });

  // GET /api/messages/global — the public community chat
  fastify.get('/api/messages/global', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const conv = await getSystemConversation('global');
    return await fetchConversationView(conv, request.user.id, request.query.limit, request.query.offset);
  });

  // GET /api/messages/archetype — the chat of my archetype's division
  fastify.get('/api/messages/archetype', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const conv = await getConversationForArchetype(request.user.id);
    if (!conv) {
      return reply.code(409).send({
        error: 'ARCHETYPE_NOT_SET',
        message: 'Complete onboarding to join your division chat.'
      });
    }
    return await fetchConversationView(conv, request.user.id, request.query.limit, request.query.offset);
  });

  // GET /api/messages/project/:projectId — chat of a specific project
  fastify.get('/api/messages/project/:projectId', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const { projectId } = request.params;
    const conv = await getSystemConversation('project', projectId);
    await assertAccess(request.user.id, conv);
    return await fetchConversationView(conv, request.user.id, request.query.limit, request.query.offset);
  });

  // GET /api/messages/unread — total unread count (for header badge)
  fastify.get('/api/messages/unread', async (request, reply) => {
    try { await request.jwtVerify(); } catch { return reply.code(401).send({ error: 'Not authenticated' }); }

    const result = await pool.query(`
      SELECT COALESCE(SUM(sub.cnt), 0)::int AS total
      FROM (
        SELECT COUNT(*) AS cnt
        FROM messages m
        JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id AND cp.user_id = $1
        WHERE m.created_at > cp.last_read_at AND m.sender_id != $1
      ) sub
    `, [request.user.id]);

    return { unread: result.rows[0].total };
  });

  // GET /api/messages/:conversationId — any conversation (DM / global / archetype / project)
  fastify.get('/api/messages/:conversationId', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const conv = await getConversation(request.params.conversationId);
    await assertAccess(request.user.id, conv);
    return await fetchConversationView(conv, request.user.id, request.query.limit, request.query.offset);
  });

  // POST /api/messages/:conversationId — send message (any type, with access + rate checks)
  fastify.post('/api/messages/:conversationId', {
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } }
  }, async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }

    const senderId = request.user.id;
    const { body } = request.body || {};
    if (!body || String(body).trim().length === 0) {
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'body is required' });
    }

    const conv = await getConversation(request.params.conversationId);
    await assertAccess(senderId, conv);

    if (conv.type === 'dm') {
      const policy = await getDmPolicy(senderId, conv.id);
      if (policy && !policy.allowed) {
        return reply.code(403).send({
          error: 'DM_FORBIDDEN',
          reason: policy.reason,
          cap: policy.cap,
          message: policy.reason === 'invitation_cap'
            ? `Already sent ${policy.sent}/${policy.cap} messages. Wait for a reply or a friend accept.`
            : policy.reason === 'blocked' ? 'This user has blocked you.'
            : policy.reason === 'declined' ? 'This user declined your friend request.'
            : 'Cannot send a DM here.'
        });
      }
    }

    if (isCommunityType(conv.type)) {
      const rate = await isRateLimitedInCommunity(senderId, conv.id);
      if (rate.limited) {
        reply.header('Retry-After', Math.ceil(rate.retryAfterMs / 1000));
        return reply.code(429).send({
          error: 'TOO_MANY_REQUESTS',
          message: `Wait ${Math.ceil(rate.retryAfterMs / 1000)}s before posting again in community chats.`,
          retry_after_ms: rate.retryAfterMs
        });
      }
    }

    const msgResult = await pool.query(
      'INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1, $2, $3) RETURNING *',
      [conv.id, senderId, String(body).trim().slice(0, 2000)]
    );

    if (conv.type === 'dm') {
      await pool.query(
        'UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = $1 AND user_id = $2',
        [conv.id, senderId]
      );
    }

    return reply.code(201).send(msgResult.rows[0]);
  });
}

export default messageRoutes;
