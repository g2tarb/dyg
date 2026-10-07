import { subscribe, getState } from '../store.js';
import { escapeHTML } from '../utils/sanitize.js';
import { t } from '../i18n/index.js';

// DYG-P0-1 — Navigation mobile par barre basse (pattern Instagram/TikTok).
// Les 5 destinations primaires, à portée du pouce. Le burger du header garde le
// secondaire (notifications, messages, amis, réglages, logout). Masquée ≥768px
// (le header prend le relais) et masquée hors session.

// Icônes stroke inline (pas de dépendance). aria-hidden : le label porte le sens.
const ICONS = {
  explore: '<path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35"/>',
  training: '<path d="M4 19V5M4 12h10M14 7l5 5-5 5"/>',
  projects: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
  wars: '<path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 21l-4.9 2.6.9-5.5-4-3.9 5.5-.8z"/>',
  profile: '<path d="M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0"/>'
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

function createBottomNav() {
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.setAttribute('aria-label', 'Navigation principale');

  let onHashChange = null;

  function items() {
    const user = getState('user');
    const profileHref = user ? `#/u/${escapeHTML(user.github_login)}` : '#/';
    return [
      { key: 'explore', href: '#/search', icon: 'explore', label: t('nav.explore') },
      { key: 'training', href: '#/training', icon: 'training', label: t('nav.training') },
      { key: 'projects', href: '#/projects', icon: 'projects', label: t('nav.projects') },
      { key: 'wars', href: '#/wars', icon: 'wars', label: t('nav.wars') },
      { key: 'profile', href: profileHref, icon: 'profile', label: t('nav.profile') }
    ];
  }

  function currentPath() {
    return (window.location.hash.slice(1) || '/').split('?')[0];
  }

  // Un onglet est actif si le chemin courant commence par sa racine (ex. /training/42).
  function isActive(href, path) {
    const root = href.slice(1).split('?')[0]; // '#/training' -> '/training'
    if (root.startsWith('/u/')) return path.startsWith('/u/');
    return path === root || path.startsWith(root + '/');
  }

  function render() {
    const user = getState('user');
    if (!user) { nav.innerHTML = ''; nav.hidden = true; return; }
    nav.hidden = false;

    const path = currentPath();
    nav.innerHTML = items().map(it => {
      const active = isActive(it.href, path);
      return `<a href="${it.href}" class="bottom-nav__item${active ? ' bottom-nav__item--active' : ''}"
        ${active ? 'aria-current="page"' : ''}>
        ${icon(it.icon)}
        <span class="bottom-nav__label">${escapeHTML(it.label)}</span>
      </a>`;
    }).join('');
  }

  function updateActive() {
    const path = currentPath();
    nav.querySelectorAll('.bottom-nav__item').forEach((el) => {
      const active = isActive(el.getAttribute('href'), path);
      el.classList.toggle('bottom-nav__item--active', active);
      if (active) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });
  }

  render();
  onHashChange = () => updateActive();
  window.addEventListener('hashchange', onHashChange);
  subscribe('user', () => render());

  nav.cleanup = () => {
    if (onHashChange) window.removeEventListener('hashchange', onHashChange);
  };

  return nav;
}

export { createBottomNav };
