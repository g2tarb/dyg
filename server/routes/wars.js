import pool from '../db/connection.js';
import {
  getCurrentWar,
  getWarById,
  getWarDetail,
  listWars,
  joinTeam,
  leaveTeam,
  submitDeliverable,
  respondJudgeInvite,
  submitRating,
  ALL_DIVISIONS
} from '../services/wars.js';
import { UnauthorizedError } from '../utils/errors.js';
import { z } from 'zod';

const RateSchema = z.object({
  score: z.number().min(0).max(10),
  comment: z.string().trim().max(1000).optional().nullable()
}).strip();

const SubmitSchema = z.object({
  repo_url: z.string().url().max(500).optional().nullable(),
  deliverable_url: z.string().url().max(500).optional().nullable()
}).strip();

function ensureUuid(val) {
  // The routes already accept :id in the path; we just sanity-check here.
  return typeof val === 'string' && /^[0-9a-f-]{36}$/i.test(val);
}

async function warsRoutes(fastify) {
  // GET /api/wars?state=running&type=inter_division
  fastify.get('/api/wars', async (request) => {
    return await listWars({ state: request.query.state, type: request.query.type });
  });

  // GET /api/wars/current — active inter-division war + my participation
  fastify.get('/api/wars/current', async (request) => {
    const war = await getCurrentWar('inter_division');
    if (!war) return { war: null };

    let mine = null;
    let asJudge = null;
    try {
      await request.jwtVerify();
      const userId = request.user.id;
      const m = await pool.query(`
        SELECT wt.id AS team_id, wt.division, wt.name, wm.role
        FROM war_members wm
        JOIN war_teams wt ON wt.id = wm.war_team_id
        WHERE wt.war_id = $1 AND wm.user_id = $2
      `, [war.id, userId]);
      mine = m.rows[0] || null;

      const j = await pool.query(
        'SELECT accepted_at, declined_at FROM war_judges WHERE war_id = $1 AND user_id = $2',
        [war.id, userId]
      );
      asJudge = j.rows[0] || null;
    } catch { /* unauth OK */ }

    return { war, mine, asJudge };
  });

  // GET /api/wars/:id
  fastify.get('/api/wars/:id', async (request) => {
    if (!ensureUuid(request.params.id)) throw new Error('Invalid war id');
    return await getWarDetail(request.params.id);
  });

  // POST /api/wars/:id/join — volunteer in my division's team
  fastify.post('/api/wars/:id/join', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    return await joinTeam(request.params.id, request.user.id);
  });

  // POST /api/wars/:id/leave
  fastify.post('/api/wars/:id/leave', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    return await leaveTeam(request.params.id, request.user.id);
  });

  // POST /api/wars/:id/teams/:teamId/submit — lead submits repo/deliverable
  fastify.post('/api/wars/:id/teams/:teamId/submit', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const parsed = SubmitSchema.parse(request.body || {});
    return await submitDeliverable(request.params.teamId, request.user.id, parsed);
  });

  // POST /api/wars/:id/judge/accept | /decline
  fastify.post('/api/wars/:id/judge/accept', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    return await respondJudgeInvite(request.params.id, request.user.id, true);
  });
  fastify.post('/api/wars/:id/judge/decline', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    return await respondJudgeInvite(request.params.id, request.user.id, false);
  });

  // POST /api/wars/:id/teams/:teamId/rate — judge submits a score for a team
  fastify.post('/api/wars/:id/teams/:teamId/rate', async (request) => {
    try { await request.jwtVerify(); } catch { throw new UnauthorizedError(); }
    const parsed = RateSchema.parse(request.body || {});
    return await submitRating(request.params.teamId, request.user.id, parsed);
  });

  // GET /api/wars/divisions — for UI filters
  fastify.get('/api/wars/divisions', async () => ALL_DIVISIONS);
}

export default warsRoutes;
