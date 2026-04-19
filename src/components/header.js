import { subscribe, getState, logout } from '../store.js';
import { escapeHTML } from '../utils/sanitize.js';
import { showToast } from '../components/toast.js';
import { t, getLocale, setLocale } from '../i18n/index.js';
import { createLogoSVG } from './logo.js';

let unreadPoll = null;

function createHeader() {
  const header = document.createElement('header');
  header.className = 'dyg-header';

  function render() {
    const user = getState('user');
    const lang = getLocale();

    header.innerHTML = `
      <nav class="header-nav container">
        <a href="#/" class="header-logo">${createLogoSVG('sm')}</a>
        <div class="header-links">
          <a href="#/about" class="header-link">${t('header.about')}</a>
          <a href="#/search" class="header-link">${t('header.explore')}</a>
          <a href="#/training" class="header-link">${t('training.title')}</a>
        <a href="#/projects" class="header-link">${t('header.projects')}</a>
          <a href="#/team" class="header-link header-team">
            <span class="team-icon">&#9776;</span>
            ${t('header.team')}
            <span class="team-badge" id="team-badge">0</span>
          </a>
          <a href="#/messages" class="header-link" id="header-msg-link" style="display:${user ? '' : 'none'};">
            ${t('header.messages')}
            <span class="header-msg-badge" id="msg-badge" style="display:none;">0</span>
          </a>
          <div class="header-auth" id="header-auth">
            ${user ? `
              <div class="header-user">
                <a href="#/u/${escapeHTML(user.github_login)}" class="header-user__link">
                  <img class="header-user__avatar" src="${escapeHTML(user.avatar_url)}" alt="${escapeHTML(user.name || user.github_login)}" onerror="this.style.display='none'">
                  <span class="header-user__name">${escapeHTML(user.name || user.github_login)}</span>
                </a>
                <a href="#/settings" class="header-user__settings" title="Settings">&#9881;</a>
          <button class="header-user__logout" id="btn-logout" title="${t('common.logout')}">&times;</button>
              </div>
            ` : `
              <a href="/auth/github" class="header-link header-link--dev">${t('common.login')}</a>
            `}
          </div>
          <button class="header-lang" id="btn-lang" title="Language">${lang === 'fr' ? 'EN' : 'FR'}</button>
        </div>
      </nav>
    `;

    // Event listeners
    const btnLogout = header.querySelector('#btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async (e) => {
        e.preventDefault();
        await logout();
        window.location.hash = '#/';
      });
    }

    const btnLang = header.querySelector('#btn-lang');
    btnLang.addEventListener('click', () => {
      setLocale(lang === 'fr' ? 'en' : 'fr');
      render(); // Re-render header immediately
    });

    // Update team badge
    updateBadge(getState('team'));

    // Start unread poll if logged in
    if (user) {
      startUnreadPoll();
      checkArchetypeChange();
    } else {
      stopUnreadPoll();
    }
  }

  function updateBadge(team) {
    const badge = header.querySelector('#team-badge');
    if (!badge) return;
    badge.textContent = team.length;
    badge.classList.toggle('team-badge--active', team.length > 0);
  }

  function startUnreadPoll() {
    fetchUnread();
    if (unreadPoll) clearInterval(unreadPoll);
    unreadPoll = setInterval(fetchUnread, 15000);
  }

  function stopUnreadPoll() {
    if (unreadPoll) { clearInterval(unreadPoll); unreadPoll = null; }
  }

  async function fetchUnread() {
    try {
      const res = await fetch('/api/messages/unread');
      if (!res.ok) return;
      const { unread } = await res.json();
      const badge = header.querySelector('#msg-badge');
      if (!badge) return;
      if (unread > 0) {
        badge.textContent = unread;
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }
    } catch { /* silent */ }
  }

  function checkArchetypeChange() {
    const dev = getState('developer');
    if (!dev || !dev.archetype) return;
    const stored = localStorage.getItem('dyg_last_archetype');
    if (stored && stored !== dev.archetype) {
      const from = t(`archetype.${stored}`);
      const to = t(`archetype.${dev.archetype}`);
      showToast(t('archetype_change', { from, to }));
    }
    localStorage.setItem('dyg_last_archetype', dev.archetype);
  }

  // Initial render
  render();

  // Re-render on auth change
  subscribe('team', updateBadge);
  subscribe('user', () => render());

  return header;
}

export { createHeader };
