import { getState, subscribe } from '../store.js';
import { escapeHTML } from '../utils/sanitize.js';
import { showToast } from '../components/toast.js';
import { t } from '../i18n/index.js';

let pollInterval = null;

function renderMessages(container, params = {}) {
  const user = getState('user');
  if (!user) {
    container.innerHTML = `
      <section class="messages">
        <div class="container" style="padding-top:var(--space-2xl);">
          <div class="empty-state">
            <p class="empty-state__text">${t('messages.login_required')}</p>
            <a href="/auth/github" class="btn-primary" style="margin-top:var(--space-md);">${t('common.login')}</a>
          </div>
        </div>
      </section>`;
    return;
  }

  const convId = params.id;
  if (convId) {
    renderConversation(container, convId);
  } else {
    renderInbox(container);
  }

  return () => {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  };
}

async function renderInbox(container) {
  container.innerHTML = `
    <section class="messages">
      <div class="container" style="padding-top:var(--space-2xl);">
        <h2 class="msg__title">${t('messages.title')}</h2>
        <div class="msg__list" id="msg-list">
          <div class="skeleton" style="height:60px;margin-bottom:var(--space-sm);"></div>
          <div class="skeleton" style="height:60px;margin-bottom:var(--space-sm);"></div>
        </div>
      </div>
    </section>
  `;

  const list = container.querySelector('#msg-list');

  try {
    const res = await fetch('/api/messages');
    if (!res.ok) throw new Error();
    const conversations = await res.json();

    if (conversations.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <p class="empty-state__text">${t('messages.empty')}</p>
          <a href="#/search" class="btn-secondary" style="margin-top:var(--space-md);">${t('common.explore_devs')}</a>
        </div>`;
      return;
    }

    list.innerHTML = conversations.map(conv => {
      const other = conv.other_user || {};
      const last = conv.last_message || {};
      const unread = conv.unread_count || 0;
      const timeAgo = last.created_at ? formatTime(last.created_at) : '';

      return `
        <a href="#/messages/${conv.conversation_id}" class="msg__conv ${unread > 0 ? 'msg__conv--unread' : ''}">
          <img class="msg__conv-avatar" src="${escapeHTML(other.avatar_url || '')}" alt="${escapeHTML(other.name || '')}" onerror="this.style.display='none'">
          <div class="msg__conv-body">
            <div class="msg__conv-top">
              <span class="msg__conv-name">${escapeHTML(other.name || other.github_login || '?')}</span>
              <span class="msg__conv-time">${timeAgo}</span>
            </div>
            <p class="msg__conv-preview">${escapeHTML((last.body || '').slice(0, 80))}</p>
          </div>
          ${unread > 0 ? `<span class="msg__conv-badge">${unread}</span>` : ''}
        </a>`;
    }).join('');
  } catch {
    list.innerHTML = `<div class="empty-state"><p class="empty-state__text">${t('common.error')}</p></div>`;
  }
}

async function renderConversation(container, convId) {
  container.innerHTML = `
    <section class="messages">
      <div class="container" style="padding-top:var(--space-2xl);">
        <a href="#/messages" class="profile-back">&larr; ${t('messages.back')}</a>
        <div class="skeleton" style="height:400px;margin-top:var(--space-lg);"></div>
      </div>
    </section>
  `;

  let data;
  try {
    const res = await fetch(`/api/messages/${convId}`);
    if (!res.ok) throw new Error();
    data = await res.json();
  } catch {
    container.innerHTML = `
      <section class="messages">
        <div class="container" style="padding-top:var(--space-2xl);">
          <a href="#/messages" class="profile-back">&larr; Retour</a>
          <div class="empty-state"><p class="empty-state__text">Conversation non trouvée.</p></div>
        </div>
      </section>`;
    return;
  }

  const user = getState('user');
  const other = data.other_user || {};

  container.innerHTML = `
    <section class="messages">
      <div class="container" style="padding-top:var(--space-2xl);">
        <a href="#/messages" class="profile-back">&larr; ${t('messages.back')}</a>

        <div class="msg__chat-header">
          <img class="msg__chat-avatar" src="${escapeHTML(other.avatar_url || '')}" alt="" onerror="this.style.display='none'">
          <a href="#/u/${escapeHTML(other.github_login || '')}" class="msg__chat-name">${escapeHTML(other.name || other.github_login || '?')}</a>
        </div>

        <div class="msg__chat-messages" id="chat-messages">
          ${data.messages.map(m => renderBubble(m, user.id)).join('')}
        </div>

        <div class="msg__chat-input">
          <input type="text" class="input" id="msg-input" placeholder="${t('messages.placeholder')}" maxlength="2000" autocomplete="off">
          <button class="btn-primary" id="btn-send">${t('common.send')}</button>
        </div>
      </div>
    </section>
  `;

  // Scroll to bottom
  const chatEl = container.querySelector('#chat-messages');
  chatEl.scrollTop = chatEl.scrollHeight;

  // Send message
  const input = container.querySelector('#msg-input');
  const btnSend = container.querySelector('#btn-send');

  async function send() {
    const body = input.value.trim();
    if (!body) return;
    input.value = '';
    btnSend.disabled = true;

    try {
      const res = await fetch(`/api/messages/${convId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body })
      });
      if (!res.ok) throw new Error();
      const msg = await res.json();

      const bubble = document.createElement('div');
      bubble.className = 'msg__bubble msg__bubble--mine';
      bubble.innerHTML = `<p class="msg__bubble-body">${escapeHTML(msg.body)}</p><span class="msg__bubble-time">${formatTime(msg.created_at)}</span>`;
      chatEl.appendChild(bubble);
      chatEl.scrollTop = chatEl.scrollHeight;
    } catch {
      showToast('Erreur d\'envoi', 'error');
    } finally {
      btnSend.disabled = false;
      input.focus();
    }
  }

  btnSend.addEventListener('click', send);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
  input.focus();

  // Poll for new messages every 5s
  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/messages/${convId}`);
      if (!res.ok) return;
      const fresh = await res.json();
      const currentCount = chatEl.querySelectorAll('.msg__bubble').length;
      if (fresh.messages.length > currentCount) {
        // Append new messages
        for (let i = currentCount; i < fresh.messages.length; i++) {
          const m = fresh.messages[i];
          if (m.sender_id === user.id) continue;
          const bubble = document.createElement('div');
          bubble.className = 'msg__bubble msg__bubble--theirs';
          bubble.innerHTML = `<p class="msg__bubble-body">${escapeHTML(m.body)}</p><span class="msg__bubble-time">${formatTime(m.created_at)}</span>`;
          chatEl.appendChild(bubble);
        }
        chatEl.scrollTop = chatEl.scrollHeight;
      }
    } catch { /* polling failure is silent */ }
  }, 5000);
}

function renderBubble(msg, myId) {
  const isMine = msg.sender_id === myId;
  return `
    <div class="msg__bubble ${isMine ? 'msg__bubble--mine' : 'msg__bubble--theirs'}">
      <p class="msg__bubble-body">${escapeHTML(msg.body)}</p>
      <span class="msg__bubble-time">${formatTime(msg.created_at)}</span>
    </div>`;
}

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'maintenant';
  if (diffMin < 60) return `${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export { renderMessages };
