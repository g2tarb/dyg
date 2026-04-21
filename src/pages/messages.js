import { getState } from '../store.js';
import { escapeHTML } from '../utils/sanitize.js';
import { showToast } from '../components/toast.js';
import { t } from '../i18n/index.js';

const ARCHETYPE_COLORS = {
  architect: '#3B82F6', shipper: '#22C55E', artisan: '#F5C542',
  creative: '#A855F7', explorer: '#06B6D4', commando: '#EF4444',
  mentor: '#F97316', synth: '#EC4899'
};

const COMMUNITY_RATE_SECONDS = 10;

let pollInterval = null;
let rateTimer = null;
const lastSentAt = new Map(); // convId → timestamp
let currentConvKey = null;    // for polling

function fmtTime(iso) {
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d) / 60000);
  if (diffMin < 1) return t('messages.now') || 'à l\'instant';
  if (diffMin < 60) return `${diffMin}min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

async function fetchJson(url) {
  const res = await fetch(url, { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function cleanup() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  if (rateTimer) { clearInterval(rateTimer); rateTimer = null; }
  currentConvKey = null;
}

export function renderMessages(container, params = {}) {
  cleanup();

  const user = getState('user');
  if (!user) {
    container.innerHTML = `
      <section class="msg-page">
        <div class="container msg-empty">
          <p class="msg-empty__text">${t('messages.login_required')}</p>
          <a href="/auth/github" class="btn-primary">${t('common.login')}</a>
        </div>
      </section>
    `;
    return cleanup;
  }

  let chatTarget = null;
  if (params.type === 'project') chatTarget = { kind: 'project', id: params.projectId };
  else if (params.id === 'global') chatTarget = { kind: 'global' };
  else if (params.id === 'archetype') chatTarget = { kind: 'archetype' };
  else if (params.id) chatTarget = { kind: 'dm', id: params.id };

  container.innerHTML = `
    <section class="msg-page">
      <div class="msg-layout ${chatTarget ? 'msg-layout--with-chat' : ''}">
        <aside class="msg-sidebar" id="msg-sidebar">
          <div class="msg-sidebar__loading">${t('common.loading')}</div>
        </aside>
        <main class="msg-chat" id="msg-chat">
          ${chatTarget ? `<div class="msg-chat__loading">${t('common.loading')}</div>` : renderEmptyChat()}
        </main>
      </div>
    </section>
  `;

  buildSidebar(container, user, chatTarget);

  if (chatTarget) {
    loadChat(container, user, chatTarget);
  }

  return cleanup;
}

function renderEmptyChat() {
  return `
    <div class="msg-chat__empty">
      <span class="msg-chat__empty-icon">&#128172;</span>
      <p class="msg-chat__empty-text">${t('messages.pick_channel')}</p>
    </div>
  `;
}

async function buildSidebar(container, user, chatTarget) {
  const sidebar = container.querySelector('#msg-sidebar');
  try {
    const dev = getState('developer');
    const division = dev?.archetype;
    const divisionName = division ? t(`archetype.${division}`) : null;
    const divisionColor = division ? ARCHETYPE_COLORS[division] : null;

    const [dms, projects] = await Promise.all([
      fetchJson('/api/messages').catch(() => []),
      fetchJson('/api/projects?mine=true&limit=20').catch(() => [])
    ]);

    const isActive = (key, val) => chatTarget && chatTarget.kind === key && (val === undefined || chatTarget.id === val);

    const communityHtml = `
      <div class="msg-nav__group">
        <span class="msg-nav__label">${t('messages.nav_community')}</span>
        <a href="#/messages/global" class="msg-nav__item ${isActive('global') ? 'msg-nav__item--active' : ''}">
          <span class="msg-nav__icon">&#127758;</span>
          <span class="msg-nav__name">${t('messages.global')}</span>
        </a>
        ${division ? `
          <a href="#/messages/archetype" class="msg-nav__item ${isActive('archetype') ? 'msg-nav__item--active' : ''}" style="--chan-color:${divisionColor};">
            <span class="msg-nav__icon msg-nav__icon--dot" style="background:${divisionColor};"></span>
            <span class="msg-nav__name">${escapeHTML(divisionName)}</span>
          </a>
        ` : `
          <a href="#/onboarding" class="msg-nav__item msg-nav__item--locked">
            <span class="msg-nav__icon">&#128274;</span>
            <span class="msg-nav__name">${t('messages.division_locked')}</span>
          </a>
        `}
      </div>
    `;

    const projectsHtml = projects.length > 0 ? `
      <div class="msg-nav__group">
        <span class="msg-nav__label">${t('messages.nav_projects')}</span>
        ${projects.map(p => `
          <a href="#/messages/project/${p.id}" class="msg-nav__item ${isActive('project', p.id) ? 'msg-nav__item--active' : ''}">
            <span class="msg-nav__icon">&#8227;</span>
            <span class="msg-nav__name">${escapeHTML(p.name || 'Projet')}</span>
          </a>
        `).join('')}
      </div>
    ` : '';

    const dmsHtml = `
      <div class="msg-nav__group">
        <span class="msg-nav__label">${t('messages.nav_dms')}</span>
        ${dms.length > 0 ? dms.map(conv => {
          const other = conv.other_user || {};
          const last = conv.last_message || {};
          const unread = conv.unread_count || 0;
          return `
            <a href="#/messages/${conv.conversation_id}" class="msg-nav__item msg-nav__dm ${isActive('dm', conv.conversation_id) ? 'msg-nav__item--active' : ''} ${unread ? 'msg-nav__dm--unread' : ''}">
              <img class="msg-nav__avatar" src="${escapeHTML(other.avatar_url || '')}" alt="" onerror="this.style.display='none'">
              <span class="msg-nav__name">${escapeHTML(other.name || other.github_login || '?')}</span>
              ${unread ? `<span class="msg-nav__badge">${unread}</span>` : ''}
            </a>
          `;
        }).join('') : `<span class="msg-nav__empty">${t('messages.empty')}</span>`}
      </div>
    `;

    sidebar.innerHTML = communityHtml + projectsHtml + dmsHtml;
  } catch {
    sidebar.innerHTML = `<p class="msg-nav__empty">${t('common.error')}</p>`;
  }
}

async function loadChat(container, user, target) {
  const chatEl = container.querySelector('#msg-chat');
  const endpoint = resolveFetchEndpoint(target);
  const postKey = resolvePostKey(target);

  let data;
  try {
    data = await fetchJson(endpoint);
    if (!data) throw new Error('empty');
  } catch {
    chatEl.innerHTML = `<div class="msg-chat__empty"><p class="msg-chat__empty-text">${t('messages.not_found')}</p></div>`;
    return;
  }

  const conv = data.conversation || {};
  const convId = conv.id || postKey.fallbackId;
  currentConvKey = convId;
  const isCommunity = conv.type === 'global' || conv.type === 'archetype';

  const headerHtml = buildChatHeader(conv, data.other_user);

  chatEl.innerHTML = `
    <header class="msg-chat__header">
      <a href="#/messages" class="msg-chat__back" aria-label="Back">&larr;</a>
      ${headerHtml}
    </header>
    <div class="msg-chat__messages" id="msg-chat-msgs"></div>
    <form class="msg-chat__form" id="msg-form">
      <input type="text" class="msg-chat__input" id="msg-input" placeholder="${t('messages.placeholder')}" maxlength="2000" autocomplete="off">
      <button type="submit" class="btn-primary msg-chat__send" id="msg-send">${t('common.send')}</button>
      <span class="msg-chat__rate" id="msg-rate" style="display:none;"></span>
    </form>
  `;

  const msgsEl = chatEl.querySelector('#msg-chat-msgs');
  msgsEl.innerHTML = data.messages.map(m => renderBubble(m, user.id, isCommunity)).join('');
  msgsEl.scrollTop = msgsEl.scrollHeight;

  const form = chatEl.querySelector('#msg-form');
  const input = chatEl.querySelector('#msg-input');
  const btn = chatEl.querySelector('#msg-send');
  const rateEl = chatEl.querySelector('#msg-rate');

  function updateRateState() {
    if (!isCommunity) return;
    const last = lastSentAt.get(convId);
    if (!last) { btn.disabled = false; rateEl.style.display = 'none'; return; }
    const elapsed = (Date.now() - last) / 1000;
    const remaining = COMMUNITY_RATE_SECONDS - elapsed;
    if (remaining <= 0) {
      btn.disabled = false;
      rateEl.style.display = 'none';
      lastSentAt.delete(convId);
    } else {
      btn.disabled = true;
      rateEl.style.display = '';
      rateEl.textContent = `${Math.ceil(remaining)}s`;
    }
  }

  updateRateState();
  if (rateTimer) clearInterval(rateTimer);
  if (isCommunity) rateTimer = setInterval(updateRateState, 500);

  async function sendMessage(e) {
    e?.preventDefault();
    const body = input.value.trim();
    if (!body || btn.disabled) return;
    input.value = '';
    btn.disabled = true;

    try {
      const res = await fetch(`/api/messages/${convId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body })
      });
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        const sec = Math.ceil((data.retry_after_ms || 10000) / 1000);
        showToast(`Attends ${sec}s`, 'error');
        lastSentAt.set(convId, Date.now() - (COMMUNITY_RATE_SECONDS - sec) * 1000);
        updateRateState();
        return;
      }
      if (!res.ok) throw new Error();
      const msg = await res.json();
      msgsEl.insertAdjacentHTML('beforeend', renderBubble({
        ...msg,
        sender_login: user.github_login,
        sender_avatar: user.avatar_url,
        sender_name: user.name || user.github_login,
        sender_archetype: getState('developer')?.archetype
      }, user.id, isCommunity));
      msgsEl.scrollTop = msgsEl.scrollHeight;

      if (isCommunity) {
        lastSentAt.set(convId, Date.now());
        updateRateState();
      }
    } catch {
      showToast(t('common.error'), 'error');
      btn.disabled = false;
    } finally {
      input.focus();
    }
  }

  form.addEventListener('submit', sendMessage);
  input.focus();

  // Poll new messages every 4s (only for the currently open conv).
  pollInterval = setInterval(async () => {
    if (currentConvKey !== convId) return;
    try {
      const fresh = await fetchJson(endpoint);
      if (!fresh?.messages) return;
      const currentCount = msgsEl.querySelectorAll('.msg-bubble').length;
      if (fresh.messages.length > currentCount) {
        for (let i = currentCount; i < fresh.messages.length; i++) {
          const m = fresh.messages[i];
          if (m.sender_id === user.id) continue;
          msgsEl.insertAdjacentHTML('beforeend', renderBubble(m, user.id, isCommunity));
        }
        msgsEl.scrollTop = msgsEl.scrollHeight;
      }
    } catch { /* silent */ }
  }, 4000);
}

function resolveFetchEndpoint(target) {
  if (target.kind === 'global') return '/api/messages/global';
  if (target.kind === 'archetype') return '/api/messages/archetype';
  if (target.kind === 'project') return `/api/messages/project/${encodeURIComponent(target.id)}`;
  return `/api/messages/${encodeURIComponent(target.id)}`;
}

function resolvePostKey(target) {
  if (target.kind === 'dm') return { fallbackId: target.id };
  return { fallbackId: null };
}

function buildChatHeader(conv, otherUser) {
  if (conv.type === 'global') {
    return `
      <div class="msg-chat__title-block">
        <span class="msg-chat__title">${t('messages.global')}</span>
        <span class="msg-chat__sub">${t('messages.global_sub')}</span>
      </div>
    `;
  }
  if (conv.type === 'archetype') {
    const div = conv.scope;
    const color = ARCHETYPE_COLORS[div] || 'var(--color-active)';
    return `
      <div class="msg-chat__title-block" style="--arch-color:${color};">
        <span class="msg-chat__dot" style="background:${color};"></span>
        <div>
          <span class="msg-chat__title">${escapeHTML(t('archetype.' + div) || div)}</span>
          <span class="msg-chat__sub">${t('messages.division_sub')}</span>
        </div>
      </div>
    `;
  }
  if (conv.type === 'project') {
    return `
      <div class="msg-chat__title-block">
        <span class="msg-chat__title">${escapeHTML(conv.name || 'Projet')}</span>
        <span class="msg-chat__sub">${t('messages.project_sub')}</span>
      </div>
    `;
  }
  // DM
  const other = otherUser || {};
  return `
    <a href="#/u/${escapeHTML(other.github_login || '')}" class="msg-chat__title-block msg-chat__title-block--dm">
      <img class="msg-chat__avatar" src="${escapeHTML(other.avatar_url || '')}" alt="" onerror="this.style.display='none'">
      <div>
        <span class="msg-chat__title">${escapeHTML(other.name || other.github_login || '?')}</span>
        <span class="msg-chat__sub">@${escapeHTML(other.github_login || '')}</span>
      </div>
    </a>
  `;
}

function renderBubble(m, myId, showSenderMeta) {
  const isMine = m.sender_id === myId;
  const arch = m.sender_archetype;
  const color = arch ? ARCHETYPE_COLORS[arch] : null;
  const meta = (!isMine && showSenderMeta) ? `
    <div class="msg-bubble__meta">
      <img class="msg-bubble__avatar" src="${escapeHTML(m.sender_avatar || '')}" alt="" onerror="this.style.display='none'">
      <span class="msg-bubble__name">${escapeHTML(m.sender_name || m.sender_login || '?')}</span>
      ${arch ? `<span class="msg-bubble__arch" style="color:${color};">${escapeHTML(t('archetype.' + arch) || '')}</span>` : ''}
      <span class="msg-bubble__login">@${escapeHTML(m.sender_login || '')}</span>
    </div>
  ` : '';

  return `
    <div class="msg-bubble ${isMine ? 'msg-bubble--mine' : 'msg-bubble--theirs'} ${showSenderMeta ? 'msg-bubble--community' : ''}" ${color && showSenderMeta && !isMine ? `style="--bubble-color:${color};"` : ''}>
      ${meta}
      <p class="msg-bubble__body">${escapeHTML(m.body)}</p>
      <span class="msg-bubble__time">${fmtTime(m.created_at)}</span>
    </div>
  `;
}
