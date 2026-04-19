import { subscribe, getState, logout } from '../store.js';
import { escapeHTML } from '../utils/sanitize.js';
import { showToast } from '../components/toast.js';
import { t, getLocale, setLocale } from '../i18n/index.js';
import { createLogoSVG, setupLogoAnimation } from './logo.js';

let unreadPoll = null;
let cleanupLogoAnim = null;

function createHeader() {
  const header = document.createElement('header');
  header.className = 'dyg-header';

  function render() {
    const user = getState('user');
    const lang = getLocale();

    header.innerHTML = `
      <nav class="header-nav container">
        <a href="#/" class="header-logo">${createLogoSVG('sm')}</a>
        <div class="header-actions">
          <a href="#/onboarding" class="header-scan">${t('landing.scan_btn')}</a>
          ${user ? `
            <button class="header-burger" id="btn-burger" aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          ` : `
            <a href="/auth/github" class="header-login">${t('common.login')}</a>
          `}
          <button class="header-lang" id="btn-lang" title="Language">${lang === 'fr' ? 'EN' : 'FR'}</button>
        </div>
      </nav>
      ${user ? `
        <div class="header-menu" id="header-menu">
          <a href="#/messages" class="header-menu__item">
            ${t('header.messages')}
            <span class="header-menu__badge" id="msg-badge" style="display:none;">0</span>
          </a>
          <a href="#/team" class="header-menu__item">
            ${t('header.team')}
            <span class="header-menu__badge" id="team-badge">0</span>
          </a>
          <a href="#/projects" class="header-menu__item">${t('header.projects')}</a>
          <a href="#/training" class="header-menu__item">${t('training.title')}</a>
          <a href="#/search" class="header-menu__item">${t('header.explore')}</a>
          <div class="header-menu__sep"></div>
          <a href="#/u/${escapeHTML(user.github_login)}" class="header-menu__item header-menu__profile">
            <img class="header-menu__avatar" src="${escapeHTML(user.avatar_url)}" alt="" onerror="this.style.display='none'">
            ${escapeHTML(user.name || user.github_login)}
          </a>
          <a href="#/settings" class="header-menu__item">${t('header.about')}</a>
          <button class="header-menu__item header-menu__logout" id="btn-logout">${t('common.logout')}</button>
        </div>
      ` : ''}
    `;

    // Burger toggle
    const burger = header.querySelector('#btn-burger');
    const menu = header.querySelector('#header-menu');
    if (burger && menu) {
      burger.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = menu.classList.toggle('header-menu--open');
        burger.classList.toggle('header-burger--open', open);
      });

      // Close on item click
      menu.querySelectorAll('.header-menu__item').forEach(item => {
        if (item.id !== 'btn-logout') {
          item.addEventListener('click', () => {
            menu.classList.remove('header-menu--open');
            burger.classList.remove('header-burger--open');
          });
        }
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) {
          menu.classList.remove('header-menu--open');
          burger.classList.remove('header-burger--open');
        }
      });

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          menu.classList.remove('header-menu--open');
          burger.classList.remove('header-burger--open');
        }
      });
    }

    // Logout
    const btnLogout = header.querySelector('#btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async (e) => {
        e.preventDefault();
        if (menu) menu.classList.remove('header-menu--open');
        await logout();
        window.location.hash = '#/';
      });
    }

    // Language toggle
    const btnLang = header.querySelector('#btn-lang');
    btnLang.addEventListener('click', () => {
      setLocale(lang === 'fr' ? 'en' : 'fr');
      render();
    });

    // Badges
    updateBadge(getState('team'));

    // Logo animation
    if (cleanupLogoAnim) cleanupLogoAnim();
    const logoSvg = header.querySelector('.dyg-logo-svg');
    cleanupLogoAnim = setupLogoAnimation(logoSvg);

    // Unread poll
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
    if (team.length > 0) {
      badge.textContent = team.length;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
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

  render();
  subscribe('team', updateBadge);
  subscribe('user', () => render());

  return header;
}

export { createHeader };
