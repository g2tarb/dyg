import {
  sendFriendRequest,
  respondToRequest,
  removeFriend,
  blockUser,
  unblockUser,
  listFriends,
  listPendingReceived,
  listPendingSent,
  listBlocked,
  getRelationStatus
} from '../services/friendships.js';
import { UnauthorizedError } from '../utils/errors.js';

async function friendshipRoutes(fastify) {
  // POST /api/friends/request — send a friend request
  fastify.post('/api/friends/request', {
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } }
  }, async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const { user_id } = request.body || {};
    if (!user_id) throw new Error('user_id required');
    return await sendFriendRequest(request.user.id, user_id);
  });

  // POST /api/friends/:id/accept
  fastify.post('/api/friends/:id/accept', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    return await respondToRequest(request.params.id, request.user.id, 'accept');
  });

  // POST /api/friends/:id/decline
  fastify.post('/api/friends/:id/decline', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    return await respondToRequest(request.params.id, request.user.id, 'decline');
  });

  // DELETE /api/friends/:userId — remove a friend
  fastify.delete('/api/friends/:userId', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    return await removeFriend(request.user.id, request.params.userId);
  });

  // POST /api/friends/block — block a user (body: { user_id })
  fastify.post('/api/friends/block', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const { user_id } = request.body || {};
    if (!user_id) throw new Error('user_id required');
    return await blockUser(request.user.id, user_id);
  });

  // POST /api/friends/unblock
  fastify.post('/api/friends/unblock', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const { user_id } = request.body || {};
    if (!user_id) throw new Error('user_id required');
    return await unblockUser(request.user.id, user_id);
  });

  // GET /api/friends — accepted friends
  fastify.get('/api/friends', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    return await listFriends(request.user.id);
  });

  // GET /api/friends/pending — incoming pending requests
  fastify.get('/api/friends/pending', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    return await listPendingReceived(request.user.id);
  });

  // GET /api/friends/sent — outgoing pending requests
  fastify.get('/api/friends/sent', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    return await listPendingSent(request.user.id);
  });

  // GET /api/friends/blocked — my blocked list
  fastify.get('/api/friends/blocked', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    return await listBlocked(request.user.id);
  });

  // GET /api/friends/status/:userId — relation with another user
  fastify.get('/api/friends/status/:userId', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    return await getRelationStatus(request.user.id, request.params.userId);
  });
}

export default friendshipRoutes;
