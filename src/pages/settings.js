import { getState, subscribe, checkAuth } from '../store.js';
import { showToast } from '../components/toast.js';
import { t } from '../i18n/index.js';

function renderSettings(container) {
  const user = getState('user');
  if (!user) {
    container.innerHTML = `
      <section class="settings">
        <div class="container" style="padding-top:var(--space-2xl);">
          <div class="empty-state">
            <p class="empty-state__text">${t('messages.login_required')}</p>
            <a href="/auth/github" class="btn-primary" style="margin-top:var(--space-md);">${t('common.login')}</a>
          </div>
        </div>
      </section>`;
    return;
  }

  loadSettings(container);
}

async function loadSettings(container) {
  let consent = false;
  let sampleCount = { total: 0, breakdown: [] };

  try {
    const [consentRes, samplesRes] = await Promise.all([
      fetch('/api/auth/consent'),
      fetch('/api/data/my-samples/count')
    ]);
    if (consentRes.ok) consent = (await consentRes.json()).data_consent;
    if (samplesRes.ok) sampleCount = await samplesRes.json();
  } catch { /* best effort */ }

  container.innerHTML = `
    <section class="settings">
      <div class="container" style="padding-top:var(--space-2xl);max-width:600px;">
        <h2 style="font-size:2.5rem;color:var(--color-text);margin-bottom:var(--space-2xl);">Settings</h2>

        <div class="settings__card">
          <h3 class="settings__card-title">${t('consent.title')}</h3>
          <p class="settings__card-desc">${t('consent.desc')}</p>
          <p class="settings__card-privacy">${t('consent.privacy')}</p>

          <div class="settings__consent-status">
            <span class="settings__consent-badge ${consent ? 'settings__consent-badge--active' : ''}">
              ${consent ? t('consent.enabled') : t('consent.disabled')}
            </span>
            ${sampleCount.total > 0 ? `<span class="settings__consent-count">${sampleCount.total} ${t('consent.samples')}</span>` : ''}
          </div>

          <div class="settings__actions">
            <button class="btn-primary" id="btn-consent-toggle">
              ${consent ? t('consent.disable') : t('consent.enable')}
            </button>
            ${sampleCount.total > 0 ? `<button class="btn-secondary" id="btn-delete-data" style="color:var(--color-error);border-color:var(--color-error);">${t('consent.delete')}</button>` : ''}
          </div>
        </div>
      </div>
    </section>
  `;

  // Toggle consent
  container.querySelector('#btn-consent-toggle').addEventListener('click', async () => {
    try {
      const res = await fetch('/api/auth/consent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: !consent })
      });
      if (!res.ok) throw new Error();
      showToast(consent ? t('consent.disabled') : t('consent.enabled'));
      loadSettings(container);
    } catch { showToast(t('common.error'), 'error'); }
  });

  // Delete data
  const btnDelete = container.querySelector('#btn-delete-data');
  if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
      btnDelete.disabled = true;
      try {
        const res = await fetch('/api/data/my-samples', { method: 'DELETE' });
        if (!res.ok) throw new Error();
        showToast(t('consent.deleted'));
        loadSettings(container);
      } catch { showToast(t('common.error'), 'error'); }
    });
  }
}

export { renderSettings };
