import {
  listMine,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../services/notifications.js';
import { UnauthorizedError } from '../utils/errors.js';

async function notificationRoutes(fastify) {
  // GET /api/notifications?limit=30&unread=1
  fastify.get('/api/notifications', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const limit = parseInt(request.query.limit) || 30;
    const offset = parseInt(request.query.offset) || 0;
    const unreadOnly = request.query.unread === '1' || request.query.unread === 'true';
    return await listMine(request.user.id, { limit, offset, unreadOnly });
  });

  // GET /api/notifications/unread-count
  fastify.get('/api/notifications/unread-count', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    return { count: await getUnreadCount(request.user.id) };
  });

  // POST /api/notifications/:id/read
  fastify.post('/api/notifications/:id/read', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const ok = await markAsRead(request.user.id, request.params.id);
    return { ok };
  });

  // POST /api/notifications/read-all
  fastify.post('/api/notifications/read-all', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const count = await markAllAsRead(request.user.id);
    return { marked: count };
  });
}

export default notificationRoutes;
