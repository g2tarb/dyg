import { subscribe, getState, logout } from '../store.js';
import { escapeHTML } from '../utils/sanitize.js';

function createHeader() {
  const header = document.createElement('header');
  header.className = 'dyg-header';
  header.innerHTML = `
    <nav class="header-nav container">
      <a href="#/" class="header-logo">DYG</a>
      <div class="header-links">
        <a href="#/about" class="header-link">Qui sommes-nous</a>
        <a href="#/search" class="header-link">Explorer</a>
        <a href="#/team" class="header-link header-team">
          <span class="team-icon">&#9776;</span>
          Ma team
          <span class="team-badge" id="team-badge">0</span>
        </a>
        <div class="header-auth" id="header-auth"></div>
      </div>
    </nav>
  `;

  const authContainer = header.querySelector('#header-auth');

  // Render auth state
  function updateAuth(user) {
    if (user) {
      const safeName = escapeHTML(user.name || user.github_login);
      authContainer.innerHTML = `
        <div class="header-user">
          <img class="header-user__avatar" src="${escapeHTML(user.avatar_url)}" alt="${safeName}"
               onerror="this.style.display='none'">
          <span class="header-user__name">${safeName}</span>
          <button class="header-user__logout" id="btn-logout" title="Déconnexion">&times;</button>
        </div>
      `;
      const btnLogout = authContainer.querySelector('#btn-logout');
      btnLogout.addEventListener('click', async (e) => {
        e.preventDefault();
        await logout();
        window.location.hash = '#/';
      });
    } else {
      authContainer.innerHTML = `
        <a href="/auth/github" class="header-link header-link--dev">Se connecter</a>
      `;
    }
  }

  // Update badge on team change
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
