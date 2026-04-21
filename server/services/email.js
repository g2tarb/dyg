/**
 * Minimal Resend wrapper. No-op if RESEND_API_KEY or RESEND_FROM are missing
 * (so dev environments don't explode on every notification).
 *
 * Free tier: 3 000 emails/month, 100/day. Enough to start.
 */

const RESEND_API = 'https://api.resend.com/emails';

export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM; // e.g. 'DYG <noreply@dyg.dev>'

  if (!apiKey || !from) {
    // Silent no-op in dev.
    return { skipped: true, reason: 'no-config' };
  }
  if (!to) return { skipped: true, reason: 'no-recipient' };

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to, subject, html, text }),
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) {
      const err = await res.text();
      console.warn('[email] send failed', res.status, err.slice(0, 200));
      return { sent: false, status: res.status };
    }
    return { sent: true };
  } catch (err) {
    console.warn('[email] send exception', err.message);
    return { sent: false, error: err.message };
  }
}
