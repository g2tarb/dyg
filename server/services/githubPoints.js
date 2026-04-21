import pool from '../db/connection.js';
import { decrypt } from '../utils/crypto.js';

/**
 * GitHub points for a season (0–50 cap):
 *   - Activity: 0.5pt per unique day with at least one PushEvent, cap 25pt (50 days).
 *   - Substance: up to 25pt based on the user's original repos (stars, size,
 *     description, topics, license, homepage).
 *
 * syncGithubPointsForUser(userId) computes the target total, compares it to the
 * current cached value in season_enrollments.github_points, and awards only the
 * positive delta. Points never decrease — if a user becomes inactive, the earned
 * points stay.
 */

const GITHUB_API = 'https://api.github.com';

function buildHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'DYG-App'
  };
}

function scoreRepos(repos) {
  let total = 0;
  const top = repos.filter(r => !r.fork && r.size > 10).slice(0, 10);
  for (const r of top) {
    let s = 0;
    if (r.description && r.description.length > 20) s += 0.5;
    if (r.license) s += 0.5;
    if (r.homepage) s += 0.5;
    if (r.topics && r.topics.length > 0) s += 0.5;
    if (r.size > 100) s += 0.5;
    if (r.size > 500) s += 0.5;
    if (r.stargazers_count >= 1) s += 0.5;
    if (r.stargazers_count >= 10) s += 1;
    if (r.stargazers_count >= 50) s += 1;
    total += s;
  }
  return Math.min(25, total);
}

async function countActiveDays(username, headers, since) {
  const res = await fetch(
    `${GITHUB_API}/users/${username}/events/public?per_page=100`,
    { headers, signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) return 0;
  const events = await res.json();
  const days = new Set();
  for (const ev of events) {
    if (ev.type !== 'PushEvent') continue;
    if (new Date(ev.created_at) < since) continue;
    days.add(ev.created_at.slice(0, 10));
  }
  return days.size;
}

async function fetchRepos(username, headers) {
  const res = await fetch(
    `${GITHUB_API}/users/${username}/repos?per_page=100&sort=pushed&direction=desc`,
    { headers, signal: AbortSignal.timeout(8000) }
  );
  if (!res.ok) return [];
  return res.json();
}

/**
 * Sync GitHub points for a single user in the active season.
 * Returns { target, previous, delta } or null if no enrollment / no token.
 */
export async function syncGithubPointsForUser(userId) {
  const userResult = await pool.query(`
    SELECT u.github_login, u.access_token,
           se.id AS enrollment_id, se.github_points,
           s.starts_at
    FROM users u
    JOIN season_enrollments se ON se.user_id = u.id
    JOIN seasons s ON s.id = se.season_id AND s.status = 'active'
    WHERE u.id = $1
    LIMIT 1
  `, [userId]);

  if (userResult.rows.length === 0) return null;
  const row = userResult.rows[0];

  let token;
  try { token = decrypt(row.access_token); } catch { return null; }
  const headers = buildHeaders(token);

  const since = new Date(row.starts_at);

  const [days, repos] = await Promise.all([
    countActiveDays(row.github_login, headers, since).catch(() => 0),
    fetchRepos(row.github_login, headers).catch(() => [])
  ]);

  const daysPoints = Math.min(25, days * 0.5);
  const repoPoints = scoreRepos(repos);
  const target = Math.min(50, daysPoints + repoPoints);

  const previous = Number(row.github_points);
  const delta = target - previous;
  if (delta <= 0) return { target, previous, delta: 0 };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO point_events (enrollment_id, source, event_type, points, details)
       VALUES ($1, 'github', 'sync_snapshot', $2, $3)`,
      [row.enrollment_id, delta, JSON.stringify({
        days,
        days_points: daysPoints,
        repo_points: repoPoints,
        target,
        previous
      })]
    );
    await client.query(
      `UPDATE season_enrollments SET github_points = $1 WHERE id = $2`,
      [target, row.enrollment_id]
    );
    await client.query('COMMIT');
    return { target, previous, delta };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Batch job: sync all users enrolled in the active season.
 * Sequential (not parallel) to keep under GitHub rate limits comfortably.
 * Each user = 2 API calls. 5000/h PAT limit → supports ~2500 users per batch.
 */
export async function syncGithubPointsAllEnrolled(logger) {
  const result = await pool.query(`
    SELECT DISTINCT se.user_id
    FROM season_enrollments se
    JOIN seasons s ON s.id = se.season_id AND s.status = 'active'
  `);
  const userIds = result.rows.map(r => r.user_id);
  let synced = 0, skipped = 0, failed = 0;

  for (const userId of userIds) {
    try {
      const res = await syncGithubPointsForUser(userId);
      if (res && res.delta > 0) synced++;
      else skipped++;
    } catch (err) {
      failed++;
      logger?.warn?.({ err, userId }, 'Github sync failed for user');
    }
  }

  logger?.info?.({ total: userIds.length, synced, skipped, failed }, 'Github points batch done');
  return { total: userIds.length, synced, skipped, failed };
}
