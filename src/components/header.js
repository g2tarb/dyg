import { subscribe, getState } from '../store.js';
import { navigate } from '../router.js';

function createHeader() {
  const header = document.createElement('header');
  header.className = 'dyg-header';
  header.innerHTML = `
    <nav class="header-nav container">
      <a href="#/" class="header-logo">DYG</a>
      <div class="header-links">
        <a href="#/about" class="header-link">Qui sommes-nous</a>
        <a href="#/search" class="header-link">Explorer</a>
        <a href="#/onboarding" class="header-link header-link--dev">Je suis dev</a>
        <a href="#/team" class="header-link header-team">
          <span class="team-icon">&#9776;</span>
          Ma team
          <span class="team-badge" id="team-badge">0</span>
        </a>
      </div>
    </nav>
  `;

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

  return header;
}

export { createHeader };
