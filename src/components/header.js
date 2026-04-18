import { subscribe, getState, logout } from '../store.js';
import { escapeHTML } from '../utils/sanitize.js';
import { showToast } from '../components/toast.js';

let unreadPoll = null;

function createHeader() {
  const header = document.createElement('header');
  header.className = 'dyg-header';
  header.innerHTML = `
    <nav class="header-nav container">
      <a href="#/" class="header-logo">DYG</a>
      <div class="header-links">
        <a href="#/about" class="header-link">Qui sommes-nous</a>
        <a href="#/search" class="header-link">Explorer</a>
        <a href="#/projects" class="header-link">Projets</a>
        <a href="#/team" class="header-link header-team">
          <span class="team-icon">&#9776;</span>
          Ma team
          <span class="team-badge" id="team-badge">0</span>
        </a>
        <a href="#/messages" class="header-link" id="header-msg-link" style="display:none;">
          Messages
          <span class="header-msg-badge" id="msg-badge" style="display:none;">0</span>
        </a>
        <div class="header-auth" id="header-auth"></div>
      </div>
    </nav>
  `;

  const authContainer = header.querySelector('#header-auth');
  const msgLink = header.querySelector('#header-msg-link');
  const msgBadge = header.querySelector('#msg-badge');

  function updateAuth(user) {
    if (user) {
      const safeName = escapeHTML(user.name || user.github_login);
      authContainer.innerHTML = `
        <div class="header-user">
          <a href="#/u/${escapeHTML(user.github_login)}" class="header-user__link">
            <img class="header-user__avatar" src="${escapeHTML(user.avatar_url)}" alt="${safeName}"
                 onerror="this.style.display='none'">
            <span class="header-user__name">${safeName}</span>
          </a>
          <button class="header-user__logout" id="btn-logout" title="Déconnexion">&times;</button>
        </div>
      `;
      authContainer.querySelector('#btn-logout').addEventListener('click', async (e) => {
        e.preventDefault();
        await logout();
        window.location.hash = '#/';
      });

      // Show messages link
      msgLink.style.display = '';
      startUnreadPoll();

      // Check for archetype change
      checkArchetypeChange(user);
    } else {
      authContainer.innerHTML = `
        <a href="/auth/github" class="header-link header-link--dev">Se connecter</a>
      `;
      msgLink.style.display = 'none';
      stopUnreadPoll();
    }
  }

  function startUnreadPoll() {
    fetchUnread();
    if (unreadPoll) clearInterval(unreadPoll);
    unreadPoll = setInterval(fetchUnread, 15000);
  }

  function stopUnreadPoll() {
    if (unreadPoll) { clearInterval(unreadPoll); unreadPoll = null; }
    msgBadge.style.display = 'none';
  }

  async function fetchUnread() {
    try {
      const res = await fetch('/api/messages/unread');
      if (!res.ok) return;
      const { unread } = await res.json();
      if (unread > 0) {
        msgBadge.textContent = unread;
        msgBadge.style.display = '';
      } else {
        msgBadge.style.display = 'none';
      }
    } catch { /* silent */ }
  }

  async function checkArchetypeChange(user) {
    const dev = getState('developer');
    if (!dev || !dev.archetype) return;

    const storedArchetype = localStorage.getItem('dyg_last_archetype');
    if (storedArchetype && storedArchetype !== dev.archetype) {
      const NAMES = {
        architect: 'Architecte', shipper: 'Shipper', artisan: 'Artisan',
        creative: 'Créatif', explorer: 'Explorateur', commando: 'Commando', mentor: 'Mentor'
      };
      showToast(`Ton archétype a évolué : ${NAMES[storedArchetype] || storedArchetype} \u2192 ${NAMES[dev.archetype] || dev.archetype}`);
    }
    localStorage.setItem('dyg_last_archetype', dev.archetype);
  }

  function updateBadge(team) {
    const badge = header.querySelector('#team-badge');
    if (!badge) return;
    const count = team.length;
    badge.textContent = count;
    badge.classList.toggle('team-badge--active', count > 0);
  }

  subscribe('team', updateBadge);
  updateBadge(getState('team'));

  subscribe('user', updateAuth);
  updateAuth(getState('user'));

  return header;
}

export { createHeader };
