import { escapeHTML } from '../utils/sanitize.js';
import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { showToast } from '../components/toast.js';

const ARCHETYPE_COLORS = {
  architect: '#3B82F6', shipper: '#22C55E', artisan: '#F5C542',
  creative: '#A855F7', explorer: '#06B6D4', commando: '#EF4444',
  mentor: '#F97316', synth: '#EC4899'
};

async function fetchJson(url) {
  const res = await fetch(url, { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function del(url) {
  const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function userRow(u, actions) {
  const primary = u.archetype || 'architect';
  const color = ARCHETYPE_COLORS[primary] || 'var(--color-border)';
  const secondary = u.secondary_archetype;
  return `
    <li class="fr-row" style="--row-color:${color};">
      <a href="#/u/${escapeHTML(u.github_login || '')}" class="fr-row__who">
        <img class="fr-row__avatar" src="${escapeHTML(u.avatar_url || '')}" alt="" onerror="this.style.display='none'">
        <span class="fr-row__identity">
          <span class="fr-row__name">${escapeHTML(u.name || u.github_login || '?')}</span>
          <span class="fr-row__login">@${escapeHTML(u.github_login || '')}</span>
          ${u.archetype ? `
            <span class="fr-row__archs">
              <span class="fr-row__arch" style="color:${color};">${t('archetype.' + primary)}</span>
              ${secondary ? `<span class="fr-row__arch fr-row__arch--sec" style="color:${ARCHETYPE_COLORS[secondary] || 'inherit'};">${t('archetype.' + secondary)}</span>` : ''}
            </span>` : ''}
        </span>
      </a>
      <div class="fr-row__actions">${actions}</div>
    </li>
  `;
}

export async function renderFriends(container) {
  const user = getState('user');
  if (!user) {
    container.innerHTML = `
      <section class="fr-page">
        <div class="container fr-empty">
          <p class="fr-empty__text">${t('friends.login_required')}</p>
          <a href="/auth/github" class="btn-primary">${t('common.login')}</a>
        </div>
      </section>
    `;
    return;
  }

  let activeTab = 'friends';

  container.innerHTML = `
    <section class="fr-page">
      <div class="container">
        <header class="fr-header">
          <h1 class="fr-title">${t('friends.title')}</h1>
          <p class="fr-sub">${t('friends.sub')}</p>
        </header>

        <nav class="fr-tabs" id="fr-tabs">
          <button class="fr-tab fr-tab--active" data-tab="friends">${t('friends.tab_friends')} <span class="fr-tab__count" id="count-friends">0</span></button>
          <button class="fr-tab" data-tab="pending">${t('friends.tab_pending')} <span class="fr-tab__count" id="count-pending">0</span></button>
          <button class="fr-tab" data-tab="sent">${t('friends.tab_sent')} <span class="fr-tab__count" id="count-sent">0</span></button>
          <button class="fr-tab" data-tab="blocked">${t('friends.tab_blocked')} <span class="fr-tab__count" id="count-blocked">0</span></button>
        </nav>

        <div class="fr-panel" id="fr-panel">
          <div class="fr-loading">${t('common.loading')}</div>
        </div>
      </div>
    </section>
  `;

  const panel = container.querySelector('#fr-panel');
  const tabs = container.querySelectorAll('.fr-tab');

  async function refresh() {
    try {
      const [friends, pending, sent, blocked] = await Promise.all([
        fetchJson('/api/friends'),
        fetchJson('/api/friends/pending'),
        fetchJson('/api/friends/sent'),
        fetchJson('/api/friends/blocked')
      ]);

      container.querySelector('#count-friends').textContent = (friends || []).length;
      container.querySelector('#count-pending').textContent = (pending || []).length;
      container.querySelector('#count-sent').textContent = (sent || []).length;
      container.querySelector('#count-blocked').textContent = (blocked || []).length;

      renderPanel({ friends, pending, sent, blocked });
    } catch {
      panel.innerHTML = `<p class="fr-empty__text">${t('common.error')}</p>`;
    }
  }

  function renderPanel(data) {
    let html = '';
    if (activeTab === 'friends') {
      const rows = (data.friends || []).map(u => userRow(u, `
        <a href="#/messages" class="btn-secondary btn-secondary--sm" data-action="message" data-id="${escapeHTML(u.id)}">${t('friends.message')}</a>
        <button class="btn-ghost btn-ghost--sm" data-action="remove" data-id="${escapeHTML(u.id)}">${t('friends.remove')}</button>
      `)).join('');
      html = rows || `<p class="fr-empty__text">${t('friends.empty_friends')}</p>`;
    } else if (activeTab === 'pending') {
      const rows = (data.pending || []).map(u => userRow(u, `
        <button class="btn-primary btn-primary--sm" data-action="accept" data-id="${escapeHTML(u.friendship_id)}">${t('friends.accept')}</button>
        <button class="btn-ghost btn-ghost--sm" data-action="decline" data-id="${escapeHTML(u.friendship_id)}">${t('friends.decline')}</button>
      `)).join('');
      html = rows || `<p class="fr-empty__text">${t('friends.empty_pending')}</p>`;
    } else if (activeTab === 'sent') {
      const rows = (data.sent || []).map(u => userRow(u, `
        <span class="fr-badge">${t('friends.waiting')}</span>
      `)).join('');
      html = rows || `<p class="fr-empty__text">${t('friends.empty_sent')}</p>`;
    } else if (activeTab === 'blocked') {
      const rows = (data.blocked || []).map(u => userRow(u, `
        <button class="btn-ghost btn-ghost--sm" data-action="unblock" data-id="${escapeHTML(u.id)}">${t('friends.unblock')}</button>
      `)).join('');
      html = rows || `<p class="fr-empty__text">${t('friends.empty_blocked')}</p>`;
    }

    panel.innerHTML = `<ul class="fr-list">${html}</ul>`;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      tabs.forEach(t => t.classList.toggle('fr-tab--active', t === tab));
      refresh();
    });
  });

  panel.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    btn.disabled = true;
    try {
      if (action === 'accept') await post(`/api/friends/${id}/accept`);
      else if (action === 'decline') await post(`/api/friends/${id}/decline`);
      else if (action === 'remove') await del(`/api/friends/${id}`);
      else if (action === 'unblock') await post('/api/friends/unblock', { user_id: id });
      showToast(t('friends.done'), 'success');
      refresh();
    } catch {
      showToast(t('common.error'), 'error');
      btn.disabled = false;
    }
  });

  await refresh();
}
