import { escapeHTML } from '../utils/sanitize.js';
import { t } from '../i18n/index.js';
import { setArchetypeTheme } from '../utils/theme.js';

const ARCHETYPE_DATA = {
  architect: { color: '#3B82F6', dominants: ['code', 'autonomy'], image: '/assets/archetypes/architect.png' },
  shipper: { color: '#22C55E', dominants: ['velocity', 'autonomy'], image: '/assets/archetypes/shipper.png' },
  artisan: { color: '#F5C542', dominants: ['craft', 'code'], image: '/assets/archetypes/artisan.png' },
  creative: { color: '#A855F7', dominants: ['creativity', 'versatility'], image: '/assets/archetypes/creative.png' },
  explorer: { color: '#06B6D4', dominants: ['versatility', 'creativity'], image: '/assets/archetypes/explorer.png' },
  commando: { color: '#EF4444', dominants: ['velocity', 'collaboration'], image: '/assets/archetypes/commando.png' },
  mentor: { color: '#F97316', dominants: ['collaboration', 'craft'], image: '/assets/archetypes/mentor.png' }
};

async function renderArchetypePage(container, params = {}) {
  const key = params.key;
  const data = ARCHETYPE_DATA[key];

  if (!data) {
    container.innerHTML = `<div class="empty-state" style="padding:var(--space-4xl);"><p class="empty-state__text">${t('notfound.text')}</p></div>`;
    return;
  }

  const name = t(`archetype.${key}`);
  const color = data.color;
  setArchetypeTheme(key);

  // Fetch devs of this archetype
  let devs = [];
  try {
    const res = await fetch(`/api/developers?archetype=${key}&limit=10`);
    if (res.ok) devs = await res.json();
  } catch { /* best effort */ }

  container.innerHTML = `
    <section class="archpage" style="--arch-color:${color};">
      <div class="container" style="padding-top:var(--space-2xl);">

        <div class="archpage__hero">
          <div class="archpage__portrait">
            <img src="${escapeHTML(data.image)}" alt="${escapeHTML(name)}" class="archpage__img">
          </div>
          <div class="archpage__info">
            <span class="archpage__label" style="color:${color};">${t(`archetype.${key}`)}</span>
            <h1 class="archpage__name" style="color:${color};">${escapeHTML(name)}</h1>
            <div class="archpage__dominants">
              ${data.dominants.map(p => `<span class="archpage__dominant">${t(`pillar.${p}`)}</span>`).join(' + ')}
            </div>
          </div>
        </div>

        <div class="archpage__devs">
          <h2 class="archpage__devs-title">${escapeHTML(name)}s on DYG</h2>
          <div class="dev-grid">
            ${devs.length > 0 ? devs.map(dev => `
              <a href="#/profile/${dev.id}" class="dev-card" style="--card-archetype-color:${color};">
                <div class="dev-card__color-bar" style="background:${color};"></div>
                <div class="dev-card__top">
                  <img class="avatar avatar--md avatar--${key}" src="${escapeHTML(dev.avatar_url)}" alt="${escapeHTML(dev.name)}" loading="lazy" onerror="this.style.display='none'">
                  <div class="dev-card__identity">
                    <span class="dev-card__name">${escapeHTML(dev.name)}</span>
                    <span class="badge badge--${key}">${escapeHTML(name)}</span>
                  </div>
                </div>
                <p class="dev-card__bio">${escapeHTML(dev.bio || '')}</p>
                <div class="dev-card__footer">
                  <span class="score-pill">${dev.avg_score || '—'}/10</span>
                </div>
              </a>
            `).join('') : `<p style="color:var(--color-text-dim);grid-column:1/-1;">${t('search.empty')}</p>`}
          </div>
        </div>

        <div class="archpage__cta">
          <a href="#/onboarding" class="btn-primary btn-primary--lg">${t('common.scan_github')}</a>
          <a href="#/search" class="btn-secondary">${t('common.explore_devs')}</a>
        </div>
      </div>
    </section>
  `;
}

export { renderArchetypePage };
