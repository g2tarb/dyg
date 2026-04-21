import pool from '../db/connection.js';
import { createNotification } from './notifications.js';
import { sendEmail } from './email.js';

/**
 * Project deadline reminders.
 *
 * For every project in status='building' with a non-null deadline_at,
 * we compute the delta in days (ceil, floor semantics) and fire a
 * notification at these breakpoints:
 *    J-7  : first warning
 *    J-3  : second warning
 *    J-1  : last day before D-day
 *    J-0  : deadline day itself
 *    J+1  : overdue (once only)
 *
 * Idempotence: the notification is deduped per (project_id, step), so
 * running the job every hour never produces duplicates.
 */

const STEPS = [7, 3, 1, 0, -1]; // -1 means overdue, fires once

function daysUntil(date, now = new Date()) {
  const diffMs = new Date(date).getTime() - now.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

function stepFor(days) {
  // Return the notification step that this `days` value crosses, or null.
  if (days < 0) return -1;
  if (days === 0) return 0;
  if (days === 1) return 1;
  if (days <= 3) return 3;
  if (days <= 7) return 7;
  return null;
}

function buildPayload(project, step) {
  if (step < 0) {
    return {
      title: `Deadline dépassée — ${project.name}`,
      body: `Le projet "${project.name}" aurait dû être livré. Préviens ton équipe.`
    };
  }
  if (step === 0) {
    return {
      title: `Jour J — ${project.name}`,
      body: `C'est aujourd'hui. Ship ton projet pour ne pas pénaliser l'équipe.`
    };
  }
  return {
    title: `J-${step} — ${project.name}`,
    body: step === 1
      ? `Plus qu'un jour pour livrer. Les points DYG dépendent de la livraison.`
      : step === 3
        ? `3 jours restants avant la deadline. Préviens ton équipe si tu bloques.`
        : `Une semaine avant la deadline. Commence à clôturer tes tâches.`
  };
}

export async function runProjectReminders(logger) {
  const result = await pool.query(`
    SELECT p.id, p.name, p.deadline_at,
           json_agg(json_build_object('user_id', pm.user_id, 'email', u.email)) AS members
    FROM projects p
    JOIN project_members pm ON pm.project_id = p.id
    JOIN users u ON u.id = pm.user_id
    WHERE p.status = 'building' AND p.deadline_at IS NOT NULL
    GROUP BY p.id
  `);

  let created = 0, skipped = 0;
  const now = new Date();

  for (const p of result.rows) {
    const days = daysUntil(p.deadline_at, now);
    const step = stepFor(days);
    if (step === null) { skipped += p.members.length; continue; }

    const { title, body } = buildPayload(p, step);
    const dedupKey = `project_deadline:${p.id}:${step}`;
    const link = `#/projects/${p.id}`;

    for (const m of p.members) {
      const notif = await createNotification(m.user_id, 'project_deadline_reminder', {
        title, body, link, dedupKey,
        payload: { project_id: p.id, step, deadline_at: p.deadline_at }
      });
      if (!notif) { skipped++; continue; }
      created++;

      // Fire-and-forget email.
      if (m.email) {
        sendEmail({
          to: m.email,
          subject: title,
          text: `${body}\n\n→ ${process.env.BASE_URL || 'https://dyg.dev'}/${link}`,
          html: `<p>${body}</p><p><a href="${process.env.BASE_URL || 'https://dyg.dev'}/${link}">Ouvrir le projet</a></p>`
        }).catch(() => {});
      }
    }
  }

  logger?.info?.({ projects: result.rows.length, created, skipped }, 'Project reminders run');
  return { projects: result.rows.length, created, skipped };
}
