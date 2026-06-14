import { subscribe, getState, logout } from '../store.js';
import { escapeHTML } from '../utils/sanitize.js';
import { t, getLocale, setLocale } from '../i18n/index.js';
import { createLogoSVG, setupLogoAnimation } from './logo.js';

let cleanupLogoAnim = null;

function createHeader() {
  const header = document.createElement('header');
  header.className = 'dyg-header';

  function render() {
    const user = getState('user');
    const lang = getLocale();

    header.innerHTML = `
      <nav class="header-nav container">
        <a href="#/" class="header-logo">${createLogoSVG('sm')}<span class="header-alpha">alpha</span></a>
        <div class="header-actions">
          <a href="#/" class="header-scan">${t('landing.scan_btn')}</a>
          ${user ? `
            <button class="header-burger" id="btn-burger" aria-label="Menu">
              <span></span><span></span><span></span>
            </button>
          ` : `
            <a href="/auth/github" class="btn-secondary btn-secondary--nav">${t('common.login')}</a>
          `}
          <button class="header-lang" id="btn-lang" title="Language">${lang === 'fr' ? 'EN' : 'FR'}</button>
        </div>
      </nav>
      ${user ? `
        <div class="header-menu" id="header-menu">
          <a href="#/u/${escapeHTML(user.github_login)}" class="header-menu__item header-menu__profile">
            <img class="header-menu__avatar" src="${escapeHTML(user.avatar_url)}" alt="" onerror="this.style.display='none'">
            ${escapeHTML(user.name || user.github_login)}
          </a>
          <a href="#/" class="header-menu__item">${t('landing.scan_btn')}</a>
          <a href="#/about" class="header-menu__item">${t('header.about')}</a>
          <a href="#/settings" class="header-menu__item">${t('common.settings') || 'Settings'}</a>
          <div class="header-menu__sep"></div>
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

    // Logo animation
    if (cleanupLogoAnim) cleanupLogoAnim();
    const logoSvg = header.querySelector('.dyg-logo-svg');
    cleanupLogoAnim = setupLogoAnimation(logoSvg);
  }

  render();
  subscribe('user', () => render());

  return header;
}

export { createHeader };
