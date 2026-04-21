import { escapeHTML } from '../utils/sanitize.js';
import { t } from '../i18n/index.js';
import { getState } from '../store.js';

const TYPE_ICONS = {
  project_deadline_reminder: '⏳',
  friend_request: '➕',
  friend_accepted: '✓',
  direct_message: '✉',
  default: '•'
};

function fmtTime(iso) {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d) / 60000);
  if (diffMin < 1) return t('messages.now');
  if (diffMin < 60) return `${diffMin}min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, { credentials: 'include', ...opts });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function renderNotifications(container) {
  const user = getState('user');
  if (!user) {
    container.innerHTML = `
      <section class="notif-page">
        <div class="container notif-empty">
          <p>${t('notifications.login_required')}</p>
          <a href="/auth/github" class="btn-primary">${t('common.login')}</a>
        </div>
      </section>
    `;
    return;
  }

  container.innerHTML = `
    <section class="notif-page">
      <div class="container">
        <header class="notif-header">
          <h1 class="notif-title">${t('notifications.title')}</h1>
          <button class="btn-ghost btn-ghost--sm" id="notif-read-all">${t('notifications.read_all')}</button>
        </header>
        <div class="notif-list" id="notif-list">
          <div class="notif-empty">${t('common.loading')}</div>
        </div>
      </div>
    </section>
  `;

  const listEl = container.querySelector('#notif-list');
  const btnReadAll = container.querySelector('#notif-read-all');

  async function refresh() {
    try {
      const notifs = await fetchJson('/api/notifications?limit=50');
      if (!notifs || notifs.length === 0) {
        listEl.innerHTML = `<div class="notif-empty">${t('notifications.empty')}</div>`;
        return;
      }
      listEl.innerHTML = notifs.map(n => {
        const icon = TYPE_ICONS[n.type] || TYPE_ICONS.default;
        const unread = !n.read_at;
        const href = n.link ? escapeHTML(n.link) : '#';
        return `
          <a href="${href}" class="notif-row ${unread ? 'notif-row--unread' : ''}" data-id="${escapeHTML(n.id)}">
            <span class="notif-row__icon">${icon}</span>
            <div class="notif-row__body">
              <span class="notif-row__title">${escapeHTML(n.title)}</span>
              ${n.body ? `<span class="notif-row__desc">${escapeHTML(n.body)}</span>` : ''}
            </div>
            <span class="notif-row__time">${fmtTime(n.created_at)}</span>
          </a>
        `;
      }).join('');
    } catch {
      listEl.innerHTML = `<div class="notif-empty">${t('common.error')}</div>`;
    }
  }

  listEl.addEventListener('click', async (e) => {
    const row = e.target.closest('.notif-row');
    if (!row) return;
    const id = row.dataset.id;
    if (!id) return;
    // fire-and-forget mark as read
    fetch(`/api/notifications/${id}/read`, { method: 'POST', credentials: 'include' }).catch(() => {});
    row.classList.remove('notif-row--unread');
  });

  btnReadAll.addEventListener('click', async () => {
    btnReadAll.disabled = true;
    try {
      await fetchJson('/api/notifications/read-all', { method: 'POST' });
      await refresh();
    } catch { /* silent */ }
    btnReadAll.disabled = false;
  });

  await refresh();
}
