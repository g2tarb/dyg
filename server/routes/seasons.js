import {
  getActiveSeason,
  getMyEnrollment,
  getDivisionLeaderboard
} from '../services/seasons.js';
import { UnauthorizedError, ConflictError } from '../utils/errors.js';

async function seasonRoutes(fastify) {
  // GET /api/seasons/current — public info about the active season
  fastify.get('/api/seasons/current', async () => {
    const season = await getActiveSeason();
    return season || null;
  });

  // GET /api/seasons/me — my enrollment + rank in my division
  fastify.get('/api/seasons/me', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const enrollment = await getMyEnrollment(request.user.id);
    return enrollment || null;
  });

  // GET /api/leaderboard — leaderboard of the caller's division only.
  // Users can never see a division that is not theirs.
  fastify.get('/api/leaderboard', async (request, reply) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const me = await getMyEnrollment(request.user.id);
    if (!me) {
      throw new ConflictError('Enroll first by completing onboarding.');
    }
    const leaderboard = await getDivisionLeaderboard(me.season_id, me.division);
    return {
      season_id: me.season_id,
      division: me.division,
      my_rank: Number(me.division_rank),
      division_size: Number(me.division_size),
      leaderboard
    };
  });
}

export default seasonRoutes;
