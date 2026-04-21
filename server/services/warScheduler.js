import pool from '../db/connection.js';
import { inviteJudges, finalizeWar } from './wars.js';

/**
 * Monthly Inter-Division war scheduler.
 *
 * Timeline of a month's war (start on day 1 of each month):
 *   Day 1            starts_at          → state = 'staffing' (open to join)
 *   Day 3 (+2 days)  build_starts_at    → state = 'running'  (judges invited here)
 *   Day 17 (+14d)    deadline_at        → state = 'judging'  (team submit closes)
 *   Day 19 (+2d)     judging_ends_at    → state = 'closed'   (finalizeWar)
 *
 * IA rule: ai_allowed = (monthIndex % 2 === 0). Even months (Feb, Apr...)
 * allow IA. Odd months (Jan, Mar...) apply the IA penalty.
 *
 * Brief pool: for V1, a fixed list of generic prompts. Expand later.
 */

const BRIEFS = [
  {
    title: 'SaaS Landing Scratch',
    brief: 'Build a production-grade landing page for a SaaS of your choice. Must include: hero, features, pricing, CTA. 48h judging will weigh craft, copy clarity, and conversion-oriented design.',
    theme: 'saas'
  },
  {
    title: 'Mini Dashboard',
    brief: 'Ship a small analytics dashboard (any domain). 1 chart min, 1 filter, deploy live. Judges evaluate signal density, craft, and responsiveness.',
    theme: 'dashboard'
  },
  {
    title: 'API with Docs',
    brief: 'Build a public REST or GraphQL API on a domain you own. Must include OpenAPI / schema + a 1-pager README with curl examples. No auth required.',
    theme: 'api'
  },
  {
    title: 'Game Prototype',
    brief: 'Any small playable web game (canvas, WebGL, or DOM). Loop + win state + deploy. Judges weigh fun, polish, and original idea.',
    theme: 'game'
  },
  {
    title: 'Developer Tool',
    brief: 'Build a useful CLI or web tool for developers. Must solve one clear pain. Ship with a README that would make another dev try it.',
    theme: 'devtool'
  }
];

function pickBrief(monthIndex) {
  return BRIEFS[monthIndex % BRIEFS.length];
}

function firstOfMonth(year, month0) {
  // month0 is 0-indexed (0 = Jan). UTC midnight.
  return new Date(Date.UTC(year, month0, 1, 0, 0, 0));
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Create the war for the current month if it doesn't already exist.
 * Idempotent — safe to call repeatedly.
 */
export async function ensureCurrentMonthWar(logger) {
  const now = new Date();
  const start = firstOfMonth(now.getUTCFullYear(), now.getUTCMonth());
  const buildStart = addDays(start, 2);
  const deadline = addDays(buildStart, 14);
  const judgingEnd = addDays(deadline, 2);

  const monthIndex = now.getUTCMonth();
  const aiAllowed = monthIndex % 2 === 0; // Jan=false, Feb=true, Mar=false...

  const existing = await pool.query(
    `SELECT id FROM wars
     WHERE type = 'inter_division'
       AND starts_at = $1`,
    [start.toISOString()]
  );
  if (existing.rows.length > 0) return { alreadyExists: true, warId: existing.rows[0].id };

  const brief = pickBrief(monthIndex);
  const season = await pool.query(
    "SELECT id FROM seasons WHERE status = 'active' ORDER BY starts_at DESC LIMIT 1"
  );
  const seasonId = season.rows[0]?.id || null;

  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const title = `${monthName} — ${brief.title}${aiAllowed ? '' : ' (No IA)'}`;

  const created = await pool.query(
    `INSERT INTO wars (type, title, brief, theme, state, ai_allowed, season_id,
                       starts_at, build_starts_at, deadline_at, judging_ends_at)
     VALUES ('inter_division', $1, $2, $3, 'upcoming', $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [title, brief.brief, brief.theme, aiAllowed, seasonId,
     start.toISOString(), buildStart.toISOString(),
     deadline.toISOString(), judgingEnd.toISOString()]
  );

  logger?.info?.({ warId: created.rows[0].id, aiAllowed, brief: brief.title }, 'Monthly war created');
  return { created: true, warId: created.rows[0].id };
}

/**
 * Drive state transitions for every active war. Runs hourly — fast enough
 * for day-grain timelines.
 */
export async function tickWarLifecycle(logger) {
  const now = new Date();
  const active = await pool.query(
    `SELECT * FROM wars WHERE state != 'closed' ORDER BY starts_at ASC`
  );

  for (const war of active.rows) {
    const state = war.state;
    if (state === 'upcoming' && new Date(war.starts_at) <= now) {
      await pool.query("UPDATE wars SET state = 'staffing' WHERE id = $1", [war.id]);
      logger?.info?.({ warId: war.id }, 'War → staffing');
    } else if (state === 'staffing' && new Date(war.build_starts_at) <= now) {
      await pool.query("UPDATE wars SET state = 'running' WHERE id = $1", [war.id]);
      // Invite judges as the build phase begins.
      await inviteJudges(war.id).catch(err => logger?.warn?.({ err, warId: war.id }, 'inviteJudges failed'));
      logger?.info?.({ warId: war.id }, 'War → running');
    } else if (state === 'running' && new Date(war.deadline_at) <= now) {
      await pool.query("UPDATE wars SET state = 'judging' WHERE id = $1", [war.id]);
      logger?.info?.({ warId: war.id }, 'War → judging');
    } else if (state === 'judging' && new Date(war.judging_ends_at) <= now) {
      await finalizeWar(war.id).catch(err => logger?.error?.({ err, warId: war.id }, 'finalizeWar failed'));
      logger?.info?.({ warId: war.id }, 'War → closed');
    }
  }
}

/**
 * Convenience wrapper: ensure a war exists for this month, then tick transitions.
 */
export async function runWarScheduler(logger) {
  await ensureCurrentMonthWar(logger).catch(err => logger?.error?.({ err }, 'ensureCurrentMonthWar failed'));
  await tickWarLifecycle(logger);
}
