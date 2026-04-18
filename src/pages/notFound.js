import { t } from '../i18n/index.js';

function renderNotFound(container) {
  container.innerHTML = `
    <section class="not-found">
      <div class="container" style="padding-top:var(--space-4xl);text-align:center;">
        <h1 class="not-found__code">${t('notfound.code')}</h1>
        <p class="not-found__text">${t('notfound.text')}</p>
        <a href="#/" class="btn-primary" style="margin-top:var(--space-xl);">${t('notfound.back')}</a>
      </div>
    </section>
  `;
}

export { renderNotFound };
