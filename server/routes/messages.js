import pool from '../db/connection.js';
import { SendMessageSchema, ReplyMessageSchema } from '../schemas/validation.js';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../utils/errors.js';

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
      return reply.code(400).send({ error: 'VALIDATION_FAILED', message: 'Impossible de s\'envoyer un message' });
    }

    // Check recipient exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [to]);
    if (userCheck.rows.length === 0) {
      return reply.code(404).send({ error: 'Recipient not found' });
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

  // GET /api/messages — list conversations with last message + unread count
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
      ORDER BY (SELECT MAX(m.created_at) FROM messages m WHERE m.conversation_id = c.id) DESC NULLS LAST
    `, [userId]);

    return result.rows;
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

  // GET /api/messages/:conversationId — get messages + mark as read
  fastify.get('/api/messages/:conversationId', async (request, reply) => {
    try { await request.jwtVerify(); } catch { return reply.code(401).send({ error: 'Not authenticated' }); }

    const { conversationId } = request.params;
    const userId = request.user.id;

    // Verify participation
    const partCheck = await pool.query(
      'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, userId]
    );
    if (partCheck.rows.length === 0) return reply.code(403).send({ error: 'Not a participant' });

    // Get messages (paginated, last 50)
    const limit = Math.min(parseInt(request.query.limit) || 50, 100);
    const offset = Math.max(parseInt(request.query.offset) || 0, 0);

    const messagesResult = await pool.query(`
      SELECT m.id, m.body, m.created_at, m.sender_id,
             u.github_login AS sender_login, u.avatar_url AS sender_avatar, u.name AS sender_name
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [conversationId, limit, offset]);

    // Reverse for display (oldest first)
    messagesResult.rows.reverse();

    // Get other participant info
    const otherResult = await pool.query(`
      SELECT u.id, u.github_login, u.avatar_url, u.name
      FROM conversation_participants cp
      JOIN users u ON u.id = cp.user_id
      WHERE cp.conversation_id = $1 AND cp.user_id != $2
      LIMIT 1
    `, [conversationId, userId]);

    // Mark as read
    await pool.query(
      'UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, userId]
    );

    return {
      messages: messagesResult.rows,
      other_user: otherResult.rows[0] || null
    };
  });

  // POST /api/messages/:conversationId — send message to existing conversation
  fastify.post('/api/messages/:conversationId', {
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } }
  }, async (request, reply) => {
    try { await request.jwtVerify(); } catch { return reply.code(401).send({ error: 'Not authenticated' }); }

    const { conversationId } = request.params;
    const senderId = request.user.id;
    const { body } = request.body;

    if (!body || body.trim().length === 0) {
      return reply.code(400).send({ error: 'body is required' });
    }

    // Verify participation
    const partCheck = await pool.query(
      'SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, senderId]
    );
    if (partCheck.rows.length === 0) return reply.code(403).send({ error: 'Not a participant' });

    const msgResult = await pool.query(
      'INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1, $2, $3) RETURNING *',
      [conversationId, senderId, body.trim().slice(0, 2000)]
    );

    // Update sender's last_read_at
    await pool.query(
      'UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = $1 AND user_id = $2',
      [conversationId, senderId]
    );

    return reply.code(201).send(msgResult.rows[0]);
  });
}

export default messageRoutes;
