import pool from '../db/connection.js';
import { DygError, NotFoundError, ForbiddenError, ConflictError } from '../utils/errors.js';
import { awardPoints } from './seasons.js';
import { createNotification } from './notifications.js';

const TEAM_SIZE_MAX = 5;
const NUM_JUDGES = 5;
const ALL_DIVISIONS = [
  'architect', 'shipper', 'artisan', 'creative',
  'explorer', 'commando', 'mentor', 'synth'
];

// --- Reads ---------------------------------------------------------------

export async function getCurrentWar(type = 'inter_division') {
  const r = await pool.query(
    `SELECT * FROM wars
     WHERE type = $1 AND state IN ('staffing', 'running', 'judging')
     ORDER BY starts_at DESC LIMIT 1`,
    [type]
  );
  return r.rows[0] || null;
}

export async function getWarById(warId) {
  const r = await pool.query('SELECT * FROM wars WHERE id = $1', [warId]);
  if (r.rows.length === 0) throw new NotFoundError('War not found');
  return r.rows[0];
}

export async function listWars({ state, type, limit = 20 } = {}) {
  const params = [];
  const conditions = [];
  if (state) { params.push(state); conditions.push(`state = $${params.length}`); }
  if (type)  { params.push(type);  conditions.push(`type = $${params.length}`); }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  params.push(Math.min(limit, 50));
  const r = await pool.query(
    `SELECT * FROM wars ${where} ORDER BY starts_at DESC LIMIT $${params.length}`,
    params
  );
  return r.rows;
}

export async function getWarDetail(warId) {
  const war = await getWarById(warId);

  const teams = await pool.query(`
    SELECT wt.*,
      json_agg(json_build_object(
        'user_id', u.id,
        'github_login', u.github_login,
        'avatar_url', u.avatar_url,
        'name', u.name,
        'archetype', d.archetype,
        'role', wm.role
      ) ORDER BY wm.joined_at) FILTER (WHERE wm.id IS NOT NULL) AS members
    FROM war_teams wt
    LEFT JOIN war_members wm ON wm.war_team_id = wt.id
    LEFT JOIN users u ON u.id = wm.user_id
    LEFT JOIN developers d ON d.user_id = u.id
    WHERE wt.war_id = $1
    GROUP BY wt.id
    ORDER BY COALESCE(wt.final_score, -1) DESC, wt.division
  `, [warId]);

  return { war, teams: teams.rows };
}

// --- Team composition ----------------------------------------------------

export async function joinTeam(warId, userId) {
  const war = await getWarById(warId);
  if (war.state !== 'staffing') throw new ConflictError('War is not in staffing phase.');

  const dev = await pool.query(
    'SELECT archetype FROM developers WHERE user_id = $1',
    [userId]
  );
  if (dev.rows.length === 0) throw new ForbiddenError('Complete onboarding first.');
  const division = dev.rows[0].archetype;
  if (!division) throw new ForbiddenError('No archetype — complete the scan.');

  // Ensure the team for this division exists (lazy create).
  let team = await pool.query(
    'SELECT * FROM war_teams WHERE war_id = $1 AND division = $2',
    [warId, division]
  );
  if (team.rows.length === 0) {
    const ins = await pool.query(
      `INSERT INTO war_teams (war_id, division, name)
       VALUES ($1, $2, $3) RETURNING *`,
      [warId, division, divisionDisplayName(division)]
    );
    team = ins;
  }
  const teamRow = team.rows[0];

  // Already a member of this team?
  const existing = await pool.query(
    'SELECT 1 FROM war_members WHERE war_team_id = $1 AND user_id = $2',
    [teamRow.id, userId]
  );
  if (existing.rows.length > 0) return { team: teamRow, already: true };

  // Prevent joining multiple teams in the same war.
  const otherTeam = await pool.query(
    `SELECT 1 FROM war_members wm
     JOIN war_teams wt ON wt.id = wm.war_team_id
     WHERE wt.war_id = $1 AND wm.user_id = $2 LIMIT 1`,
    [warId, userId]
  );
  if (otherTeam.rows.length > 0) {
    throw new ConflictError('You are already in a team for this war.');
  }

  // Team size cap.
  const count = await pool.query(
    'SELECT COUNT(*)::int AS n FROM war_members WHERE war_team_id = $1',
    [teamRow.id]
  );
  if (count.rows[0].n >= TEAM_SIZE_MAX) {
    throw new ConflictError(`Team is full (${TEAM_SIZE_MAX} members max).`);
  }

  const role = count.rows[0].n === 0 ? 'lead' : 'member';
  await pool.query(
    `INSERT INTO war_members (war_team_id, user_id, role) VALUES ($1, $2, $3)`,
    [teamRow.id, userId, role]
  );

  // Recompute synergy.
  await recomputeSynergy(teamRow.id);

  return { team: teamRow, role };
}

export async function leaveTeam(warId, userId) {
  const war = await getWarById(warId);
  if (war.state !== 'staffing') throw new ConflictError('Cannot leave after staffing.');

  const member = await pool.query(
    `SELECT wm.id, wm.war_team_id FROM war_members wm
     JOIN war_teams wt ON wt.id = wm.war_team_id
     WHERE wt.war_id = $1 AND wm.user_id = $2`,
    [warId, userId]
  );
  if (member.rows.length === 0) throw new NotFoundError('Not on any team for this war.');

  await pool.query('DELETE FROM war_members WHERE id = $1', [member.rows[0].id]);
  await recomputeSynergy(member.rows[0].war_team_id);
  return { left: true };
}

/**
 * Synergy multiplier based on archetype diversity.
 * 1 distinct archetype on the team = 1.0, 5 distinct = 1.5.
 * Interpolated linearly between 1 and 5 distinct archetypes.
 */
export async function recomputeSynergy(warTeamId) {
  const r = await pool.query(`
    SELECT COUNT(DISTINCT d.archetype)::int AS distinct_archs
    FROM war_members wm
    JOIN developers d ON d.user_id = wm.user_id
    WHERE wm.war_team_id = $1
  `, [warTeamId]);
  const distinct = r.rows[0].distinct_archs || 1;
  // 1 → 1.0, 2 → 1.125, 3 → 1.25, 4 → 1.375, 5 → 1.5
  const mult = 1.0 + Math.min(4, Math.max(0, distinct - 1)) * 0.125;
  await pool.query(
    'UPDATE war_teams SET synergy_multiplier = $1 WHERE id = $2',
    [mult, warTeamId]
  );
  return mult;
}

export async function submitDeliverable(warTeamId, userId, { repo_url, deliverable_url }) {
  const team = await pool.query(
    `SELECT wt.*, w.state FROM war_teams wt
     JOIN wars w ON w.id = wt.war_id
     WHERE wt.id = $1`,
    [warTeamId]
  );
  if (team.rows.length === 0) throw new NotFoundError('Team not found.');
  const t = team.rows[0];
  if (t.state !== 'running') throw new ConflictError('Not in the build phase.');

  const member = await pool.query(
    'SELECT role FROM war_members WHERE war_team_id = $1 AND user_id = $2',
    [warTeamId, userId]
  );
  if (member.rows.length === 0) throw new ForbiddenError('Not a team member.');
  if (member.rows[0].role !== 'lead') throw new ForbiddenError('Only the lead can submit.');

  await pool.query(
    'UPDATE war_teams SET repo_url = COALESCE($1, repo_url), deliverable_url = COALESCE($2, deliverable_url) WHERE id = $3',
    [repo_url ?? null, deliverable_url ?? null, warTeamId]
  );
  return { ok: true };
}

// --- Judges --------------------------------------------------------------

/**
 * Pool of eligible judges:
 *   - Has a completed developer profile (archetype set)
 *   - Is not a member of any team in this war
 *   - Has no accepted friendship with any member of any team in this war
 *   - Ordered by reputation (avg stars) then total_points descending
 * Returns up to NUM_JUDGES candidates.
 */
export async function selectEligibleJudges(warId, { count = NUM_JUDGES } = {}) {
  const r = await pool.query(`
    WITH participants AS (
      SELECT wm.user_id
      FROM war_members wm
      JOIN war_teams wt ON wt.id = wm.war_team_id
      WHERE wt.war_id = $1
    ),
    participant_friends AS (
      SELECT requester_id AS user_id FROM friendships
       WHERE status = 'accepted' AND addressee_id IN (SELECT user_id FROM participants)
      UNION
      SELECT addressee_id AS user_id FROM friendships
       WHERE status = 'accepted' AND requester_id IN (SELECT user_id FROM participants)
    )
    SELECT u.id,
           COALESCE((SELECT AVG(stars) FROM reputation WHERE reviewee_id = u.id), 0) AS avg_stars,
           COALESCE((SELECT SUM(total_points) FROM season_enrollments WHERE user_id = u.id), 0) AS total_points
    FROM users u
    JOIN developers d ON d.user_id = u.id
    WHERE u.id NOT IN (SELECT user_id FROM participants)
      AND u.id NOT IN (SELECT user_id FROM participant_friends WHERE user_id IS NOT NULL)
      AND (u.banned_until IS NULL OR u.banned_until < NOW())
    ORDER BY avg_stars DESC, total_points DESC, u.created_at ASC
    LIMIT $2
  `, [warId, count]);
  return r.rows;
}

export async function inviteJudges(warId) {
  const candidates = await selectEligibleJudges(warId, { count: NUM_JUDGES });
  const inserted = [];
  for (const c of candidates) {
    const r = await pool.query(
      `INSERT INTO war_judges (war_id, user_id) VALUES ($1, $2)
       ON CONFLICT (war_id, user_id) DO NOTHING RETURNING *`,
      [warId, c.id]
    );
    if (r.rows[0]) {
      inserted.push(r.rows[0]);
      // Notify the judge.
      createNotification(c.id, 'war_judge_invite', {
        title: 'Tu es désigné juré d\'une DYG War',
        body: 'Accepte la mission et note les teams avant la clôture.',
        link: `#/wars/${warId}`,
        dedupKey: `war_judge_invite:${warId}:${c.id}`,
        payload: { war_id: warId }
      }).catch(() => {});
    }
  }
  return { invited: inserted.length };
}

export async function respondJudgeInvite(warId, userId, accept) {
  const r = await pool.query(
    'SELECT * FROM war_judges WHERE war_id = $1 AND user_id = $2',
    [warId, userId]
  );
  if (r.rows.length === 0) throw new NotFoundError('You are not invited as a judge.');
  const col = accept ? 'accepted_at' : 'declined_at';
  await pool.query(
    `UPDATE war_judges SET ${col} = NOW() WHERE id = $1`,
    [r.rows[0].id]
  );
  return { ok: true };
}

export async function submitRating(warTeamId, judgeUserId, { score, comment }) {
  // Judge must be accepted on this war and team must belong to that war.
  const team = await pool.query(
    `SELECT wt.id, wt.war_id, w.state
     FROM war_teams wt JOIN wars w ON w.id = wt.war_id
     WHERE wt.id = $1`,
    [warTeamId]
  );
  if (team.rows.length === 0) throw new NotFoundError('Team not found.');
  const t = team.rows[0];
  if (t.state !== 'judging') throw new ConflictError('Not in the judging phase.');

  const judge = await pool.query(
    `SELECT accepted_at FROM war_judges WHERE war_id = $1 AND user_id = $2`,
    [t.war_id, judgeUserId]
  );
  if (judge.rows.length === 0 || !judge.rows[0].accepted_at) {
    throw new ForbiddenError('You are not an accepted judge for this war.');
  }

  await pool.query(
    `INSERT INTO war_ratings (war_team_id, judge_user_id, score, comment)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (war_team_id, judge_user_id)
     DO UPDATE SET score = $3, comment = $4, submitted_at = NOW()`,
    [warTeamId, judgeUserId, score, comment ?? null]
  );
  return { ok: true };
}

// --- Finalization --------------------------------------------------------

/**
 * Close a war that has finished judging:
 *   1. For each team, raw_score = avg(war_ratings.score). Default 0.
 *   2. ia_penalty = 0 if war.ai_allowed, else avg(pillar ia scores) / 20.
 *   3. final_score = raw_score * synergy_multiplier * (1 - ia_penalty).
 *   4. Highest final_score team → is_winner = true, wars.winner_team_id set.
 *   5. Award points: war_participation = 3 to every member, war_win = 10 to winner members.
 *   6. Reveal judges (anonymity lifts).
 *   7. Notify members of the outcome.
 */
export async function finalizeWar(warId) {
  const war = await getWarById(warId);
  if (war.state === 'closed') return { alreadyClosed: true };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const teams = await client.query(
      'SELECT id, division FROM war_teams WHERE war_id = $1',
      [warId]
    );

    let best = null;
    const results = [];

    for (const team of teams.rows) {
      // raw_score
      const avg = await client.query(
        'SELECT AVG(score)::numeric(5,2) AS raw FROM war_ratings WHERE war_team_id = $1',
        [team.id]
      );
      const rawScore = Number(avg.rows[0].raw) || 0;

      // ia_penalty
      let iaPenalty = 0;
      if (!war.ai_allowed) {
        const ia = await client.query(`
          SELECT AVG(ds.score)::numeric(5,2) AS avg_ia
          FROM war_members wm
          JOIN developer_scores ds ON ds.developer_id IN (
            SELECT id FROM developers WHERE user_id = wm.user_id
          )
          WHERE wm.war_team_id = $1 AND ds.pillar = 'ia'
        `, [team.id]);
        const avgIa = Number(ia.rows[0].avg_ia) || 0;
        iaPenalty = Math.min(0.5, avgIa / 20); // capped at 50%
      }

      const synergy = (await client.query(
        'SELECT synergy_multiplier FROM war_teams WHERE id = $1',
        [team.id]
      )).rows[0].synergy_multiplier;

      const finalScore = rawScore * Number(synergy) * (1 - iaPenalty);

      await client.query(
        `UPDATE war_teams SET raw_score = $1, ia_penalty = $2, final_score = $3
         WHERE id = $4`,
        [rawScore, iaPenalty, finalScore, team.id]
      );

      results.push({ team_id: team.id, division: team.division, finalScore });
      if (!best || finalScore > best.finalScore) best = { team_id: team.id, finalScore };
    }

    if (best && best.finalScore > 0) {
      await client.query(
        'UPDATE war_teams SET is_winner = TRUE WHERE id = $1',
        [best.team_id]
      );
      await client.query(
        'UPDATE wars SET winner_team_id = $1 WHERE id = $2',
        [best.team_id, warId]
      );
    }

    await client.query(
      "UPDATE wars SET state = 'closed' WHERE id = $1",
      [warId]
    );

    // Reveal judges.
    await client.query(
      'UPDATE war_judges SET revealed = TRUE WHERE war_id = $1',
      [warId]
    );

    await client.query('COMMIT');

    // Outside tx: award points + notifications (fire-and-forget, idempotent via dedup).
    const allMembers = await pool.query(`
      SELECT wm.user_id, wt.id AS team_id
      FROM war_members wm
      JOIN war_teams wt ON wt.id = wm.war_team_id
      WHERE wt.war_id = $1
    `, [warId]);

    for (const m of allMembers.rows) {
      awardPoints(m.user_id, 'dyg', 'war_participation', 3, { war_id: warId, team_id: m.team_id })
        .catch(() => {});
      createNotification(m.user_id, 'war_closed', {
        title: `DYG War fermée — ${war.title}`,
        body: 'Les résultats sont publiés.',
        link: `#/wars/${warId}`,
        dedupKey: `war_closed:${warId}:${m.user_id}`,
        payload: { war_id: warId }
      }).catch(() => {});
    }

    if (best) {
      const winners = await pool.query(
        'SELECT user_id FROM war_members WHERE war_team_id = $1',
        [best.team_id]
      );
      for (const w of winners.rows) {
        awardPoints(w.user_id, 'dyg', 'war_win', 10, { war_id: warId, team_id: best.team_id })
          .catch(() => {});
      }
    }

    return { closed: true, winner: best, results };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// --- Helpers -------------------------------------------------------------

function divisionDisplayName(div) {
  return div.charAt(0).toUpperCase() + div.slice(1) + ' Division';
}

export { TEAM_SIZE_MAX, NUM_JUDGES, ALL_DIVISIONS };
