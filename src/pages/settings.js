import { getState, subscribe, checkAuth, logout } from '../store.js';
import { showToast } from '../components/toast.js';
import { t, getLocale, setLocale } from '../i18n/index.js';
import { escapeHTML } from '../utils/sanitize.js';

const DIVISION_COLORS = {
  architect: '#3B82F6', shipper: '#22C55E', artisan: '#F5C542',
  creative: '#A855F7', explorer: '#06B6D4', commando: '#EF4444',
  mentor: '#F97316', synth: '#EC4899'
};

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, { credentials: 'include', ...opts });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function patchJson(url, body) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export function renderSettings(container) {
  const user = getState('user');
  if (!user) {
    container.innerHTML = `
      <section class="set-page">
        <div class="container set-empty">
          <p>${t('settings.login_required')}</p>
          <a href="/auth/github" class="btn-primary">${t('common.login')}</a>
        </div>
      </section>
    `;
    return;
  }
  loadSettings(container);
}

async function loadSettings(container) {
  const user = getState('user');
  const dev = getState('developer');

  container.innerHTML = `
    <section class="set-page">
      <div class="container set-container">
        <header class="set-header">
          <h1 class="set-title">${t('settings.title')}</h1>
          <p class="set-sub">${escapeHTML(user.name || user.github_login)} · @${escapeHTML(user.github_login)}</p>
        </header>
        <div id="set-body"><div class="set-loading">${t('common.loading')}</div></div>
      </div>
    </section>
  `;

  const body = container.querySelector('#set-body');

  let me, prefs, sampleCount;
  try {
    [me, prefs, sampleCount] = await Promise.all([
      fetchJson('/api/auth/me'),
      fetchJson('/api/auth/preferences'),
      fetchJson('/api/data/my-samples/count').catch(() => ({ total: 0 }))
    ]);
  } catch {
    body.innerHTML = `<div class="set-empty">${t('common.error')}</div>`;
    return;
  }

  const developer = me?.developer || dev || null;
  const currentLocale = getLocale();
  const availability = me?.user?.availability || 'available';
  const consent = me?.user?.data_consent || false;

  const primary = developer?.archetype;
  const primaryColor = primary ? DIVISION_COLORS[primary] : null;

  body.innerHTML = `
    ${profileSection(developer, availability)}
    ${archetypeSection(developer, primaryColor)}
    ${notificationsSection(prefs || {})}
    ${languageSection(currentLocale)}
    ${privacySection(consent, sampleCount?.total || 0)}
    ${dangerSection()}
  `;

  attachHandlers(container, { reload: () => loadSettings(container) });
}

function profileSection(dev, availability) {
  const tagline = dev?.tagline || '';
  return `
    <section class="set-card">
      <h2 class="set-card__title">${t('settings.profile_title')}</h2>
      <p class="set-card__desc">${t('settings.profile_desc')}</p>

      <label class="set-field">
        <span class="set-field__label">${t('settings.tagline_label')}</span>
        <input type="text" class="input" id="set-tagline" maxlength="100"
               placeholder="${t('settings.tagline_ph')}"
               value="${escapeHTML(tagline)}">
        <span class="set-field__hint">${t('settings.tagline_hint')}</span>
      </label>

      <label class="set-field">
        <span class="set-field__label">${t('settings.availability_label')}</span>
        <select class="input" id="set-availability">
          <option value="available" ${availability === 'available' ? 'selected' : ''}>${t('availability.available')}</option>
          <option value="in_project" ${availability === 'in_project' ? 'selected' : ''}>${t('availability.in_project')}</option>
          <option value="unavailable" ${availability === 'unavailable' ? 'selected' : ''}>${t('settings.availability_unavail')}</option>
        </select>
        <span class="set-field__hint">${t('settings.availability_hint')}</span>
      </label>

      <div class="set-card__actions">
        <button class="btn-primary" id="btn-save-profile">${t('settings.save')}</button>
      </div>
    </section>
  `;
}

function archetypeSection(dev, color) {
  if (!dev || !dev.archetype) {
    return `
      <section class="set-card">
        <h2 class="set-card__title">${t('settings.archetype_title')}</h2>
        <p class="set-card__desc">${t('settings.archetype_empty')}</p>
        <div class="set-card__actions">
          <a href="#/onboarding" class="btn-primary">${t('common.scan_github')}</a>
        </div>
      </section>
    `;
  }

  const archetypes = [
    { key: dev.archetype, role: t('settings.archetype_primary') },
    dev.secondary_archetype ? { key: dev.secondary_archetype, role: t('settings.archetype_secondary') } : null,
    dev.tertiary_archetype ? { key: dev.tertiary_archetype, role: t('settings.archetype_tertiary') } : null
  ].filter(Boolean);

  return `
    <section class="set-card" style="--accent:${color};">
      <h2 class="set-card__title">${t('settings.archetype_title')}</h2>
      <div class="set-archs">
        ${archetypes.map(a => `
          <div class="set-arch" style="--c:${DIVISION_COLORS[a.key]};">
            <span class="set-arch__role">${a.role}</span>
            <a href="#/archetype/${a.key}" class="set-arch__name">${escapeHTML(t('archetype.' + a.key))}</a>
          </div>
        `).join('')}
      </div>
      <p class="set-card__desc">${t('settings.archetype_rescan_desc')}</p>
      <div class="set-card__actions">
        <a href="#/onboarding" class="btn-secondary btn-secondary--sm">${t('settings.archetype_rescan')}</a>
      </div>
    </section>
  `;
}

function notificationsSection(prefs) {
  const on = (k) => prefs[k] !== false; // default true
  const toggle = (key, label, desc) => `
    <label class="set-toggle">
      <div class="set-toggle__text">
        <span class="set-toggle__label">${label}</span>
        <span class="set-toggle__desc">${desc}</span>
      </div>
      <input type="checkbox" class="set-toggle__input" data-pref="${key}" ${on(key) ? 'checked' : ''}>
    </label>
  `;
  return `
    <section class="set-card">
      <h2 class="set-card__title">${t('settings.notifs_title')}</h2>
      <p class="set-card__desc">${t('settings.notifs_desc')}</p>
      ${toggle('email_project_reminders', t('settings.pref_email_reminders'), t('settings.pref_email_reminders_desc'))}
      ${toggle('email_dms', t('settings.pref_email_dms'), t('settings.pref_email_dms_desc'))}
      ${toggle('in_app_friend_requests', t('settings.pref_friend_req'), t('settings.pref_friend_req_desc'))}
    </section>
  `;
}

function languageSection(locale) {
  return `
    <section class="set-card">
      <h2 class="set-card__title">${t('settings.lang_title')}</h2>
      <div class="set-lang">
        <button class="set-lang__btn ${locale === 'fr' ? 'set-lang__btn--active' : ''}" data-lang="fr">Français</button>
        <button class="set-lang__btn ${locale === 'en' ? 'set-lang__btn--active' : ''}" data-lang="en">English</button>
      </div>
    </section>
  `;
}

function privacySection(consent, sampleCount) {
  return `
    <section class="set-card">
      <h2 class="set-card__title">${t('settings.privacy_title')}</h2>

      <div class="set-field">
        <label class="set-toggle">
          <div class="set-toggle__text">
            <span class="set-toggle__label">${t('consent.title')}</span>
            <span class="set-toggle__desc">${t('consent.desc')}</span>
            ${sampleCount > 0 ? `<span class="set-toggle__meta">${sampleCount} ${t('consent.samples')}</span>` : ''}
          </div>
          <input type="checkbox" class="set-toggle__input" id="set-consent" ${consent ? 'checked' : ''}>
        </label>
      </div>

      <div class="set-card__actions set-card__actions--wrap">
        <button class="btn-secondary btn-secondary--sm" id="btn-export">${t('settings.export_data')}</button>
        ${sampleCount > 0 ? `<button class="btn-ghost btn-ghost--sm" id="btn-purge-samples">${t('consent.delete')}</button>` : ''}
      </div>
    </section>
  `;
}

function dangerSection() {
  return `
    <section class="set-card set-card--danger">
      <h2 class="set-card__title">${t('settings.danger_title')}</h2>
      <p class="set-card__desc">${t('settings.danger_desc')}</p>
      <div class="set-card__actions">
        <button class="btn-ghost btn-ghost--sm" id="btn-logout">${t('common.logout')}</button>
        <button class="btn-danger" id="btn-delete-account">${t('settings.delete_account')}</button>
      </div>
    </section>
  `;
}

function attachHandlers(container, { reload }) {
  // Save profile (tagline + availability)
  container.querySelector('#btn-save-profile')?.addEventListener('click', async (e) => {
    e.target.disabled = true;
    try {
      const tagline = container.querySelector('#set-tagline').value.trim();
      const availability = container.querySelector('#set-availability').value;
      await Promise.all([
        patchJson('/api/profile', { tagline: tagline || null }),
        patchJson('/api/auth/availability', { availability })
      ]);
      showToast(t('settings.saved'));
      checkAuth();
    } catch (err) {
      showToast(err.message || t('common.error'), 'error');
    } finally {
      e.target.disabled = false;
    }
  });

  // Notification toggles — patch on change
  container.querySelectorAll('[data-pref]').forEach(input => {
    input.addEventListener('change', async () => {
      const key = input.dataset.pref;
      try {
        await patchJson('/api/auth/preferences', { [key]: input.checked });
        showToast(t('settings.saved'));
      } catch {
        input.checked = !input.checked;
        showToast(t('common.error'), 'error');
      }
    });
  });

  // Language
  container.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      setLocale(btn.dataset.lang);
      // setLocale triggers a hashchange → page re-renders with new locale
    });
  });

  // Consent
  const consentInput = container.querySelector('#set-consent');
  if (consentInput) {
    consentInput.addEventListener('change', async () => {
      try {
        await patchJson('/api/auth/consent', { consent: consentInput.checked });
        showToast(t('settings.saved'));
      } catch {
        consentInput.checked = !consentInput.checked;
        showToast(t('common.error'), 'error');
      }
    });
  }

  // Export data
  container.querySelector('#btn-export')?.addEventListener('click', () => {
    window.location.href = '/api/auth/my-data-export';
  });

  // Purge samples
  container.querySelector('#btn-purge-samples')?.addEventListener('click', async (e) => {
    if (!confirm(t('settings.confirm_purge'))) return;
    e.target.disabled = true;
    try {
      const res = await fetch('/api/data/my-samples', { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      showToast(t('consent.deleted'));
      reload();
    } catch {
      showToast(t('common.error'), 'error');
      e.target.disabled = false;
    }
  });

  // Logout
  container.querySelector('#btn-logout')?.addEventListener('click', async () => {
    await logout();
    window.location.hash = '#/';
  });

  // Delete account (2-step confirmation)
  container.querySelector('#btn-delete-account')?.addEventListener('click', async () => {
    const answer = prompt(t('settings.delete_confirm_prompt'));
    if (answer !== 'SUPPRIMER' && answer !== 'DELETE') return;
    if (!confirm(t('settings.delete_final_confirm'))) return;
    try {
      const res = await fetch('/api/auth/account', { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      showToast(t('settings.account_deleted'));
      await logout();
      window.location.hash = '#/';
    } catch {
      showToast(t('common.error'), 'error');
    }
  });
}
