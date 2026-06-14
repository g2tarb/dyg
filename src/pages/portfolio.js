import { createRadarChart, animateRadar, PILLARS_ORDER, PILLAR_LABELS } from '../components/radarChart.js';
import { buildAdviceSection } from '../components/advice.js';
import { escapeHTML } from '../utils/sanitize.js';
import { getState } from '../store.js';
import { t } from '../i18n/index.js';
import { setArchetypeTheme } from '../utils/theme.js';

function archName(k) { return t(`archetype.${k}`); }
const ARCHETYPE_COLORS = {
  architect: '#3B82F6', shipper: '#22C55E', artisan: '#F5C542',
  creative: '#A855F7', explorer: '#06B6D4', commando: '#EF4444', mentor: '#F97316', synth: '#EC4899'
};

function renderPortfolio(container, params = {}) {
  const login = params.login;
  if (!login) {
    container.innerHTML = `<p style="padding:var(--space-2xl);color:var(--color-text-dim);">${t('notfound.text')}</p>`;
    return;
  }

  container.innerHTML = `
    <section class="portfolio">
      <div class="container" style="padding-top:var(--space-2xl);">
        <div class="skeleton" style="height:500px;"></div>
      </div>
    </section>
  `;

  loadPortfolio(container, login);
}

async function loadPortfolio(container, login) {
  let data;
  try {
    const res = await fetch(`/api/users/${login}/portfolio`);
    if (!res.ok) throw new Error('Not found');
    data = await res.json();
  } catch {
    container.innerHTML = `
      <section class="portfolio">
        <div class="container" style="padding-top:var(--space-2xl);">
          <div class="empty-state"><p class="empty-state__text">${t('notfound.text')}</p></div>
        </div>
      </section>`;
    return;
  }

  const { user, developer } = data;
  const arch = developer?.archetype;
  if (arch) setArchetypeTheme(arch);
  const archColor = ARCHETYPE_COLORS[arch] || '#E8620A';
  const archLabel = archName(arch);
  const scores = developer?.scores || [];

  container.innerHTML = `
    <section class="portfolio">
      <div class="container" style="padding-top:var(--space-2xl);">

        <div class="portfolio__hero" style="--arch-color:${archColor};">
          <div class="portfolio__identity">
            <img class="portfolio__avatar" src="${escapeHTML(user.avatar_url || '')}" alt="${escapeHTML(user.name)}"
                 onerror="this.style.display='none'">
            <div>
              <h1 class="portfolio__name">${escapeHTML(user.name || user.github_login)}</h1>
              <span class="portfolio__login">@${escapeHTML(user.github_login)}</span>
              ${developer ? `<span class="portfolio__archetype" style="color:${archColor};">${escapeHTML(archLabel)}</span>` : ''}
            </div>
          </div>
          <div class="portfolio__actions" id="portfolio-actions"></div>
        </div>

        ${developer ? `
        <div class="portfolio__layout">
          <div class="portfolio__radar-section">
            <h2 class="portfolio__section-title">${t('portfolio.skills_radar')}</h2>
            <div id="portfolio-radar"></div>
            <div class="portfolio__scores" id="portfolio-scores"></div>
          </div>

          <div class="portfolio__bio-section">
            ${developer.bio ? `<p class="portfolio__bio">${escapeHTML(developer.bio)}</p>` : ''}
            ${developer.languages && developer.languages.length > 0 ? `
            <div class="portfolio__langs">
              <h3 class="portfolio__langs-title">${t('portfolio.languages')}</h3>
              <div class="portfolio__langs-list">
                ${developer.languages.map(l => `<span class="profile-lang">${escapeHTML(l)}</span>`).join('')}
              </div>
            </div>` : ''}
          </div>
        </div>

        <div id="portfolio-advice"></div>
        ` : `<p style="color:var(--color-text-dim);padding:var(--space-xl) 0;">${t('portfolio.no_profile')}</p>`}

      </div>
    </section>
  `;

  // Actions : seul le propriétaire voit le bouton "re-scanner"
  const actionsEl = container.querySelector('#portfolio-actions');
  const currentUser = getState('user');
  if (currentUser && currentUser.github_login?.toLowerCase() === user.github_login.toLowerCase()) {
    actionsEl.innerHTML = `<a href="#/" class="btn-secondary btn-secondary--sm">${t('landing.scan_btn')}</a>`;
  }

  // Mount radar + scores + conseils
  if (developer && scores.length > 0) {
    const radarMount = container.querySelector('#portfolio-radar');
    const radar = createRadarChart(scores, { animate: true, color: archColor, id: 'portfolio-radar-svg' });
    radarMount.appendChild(radar);
    setTimeout(() => animateRadar(radar, 800), 200);

    // Score bars
    const scoresMount = container.querySelector('#portfolio-scores');
    PILLARS_ORDER.forEach(pillar => {
      const sc = scores.find(s => s.pillar === pillar);
      const value = sc ? sc.score : 0;
      const row = document.createElement('div');
      row.className = 'profile-score-row';
      row.innerHTML = `
        <span class="profile-score-row__label">${PILLAR_LABELS[pillar]}</span>
        <div class="profile-score-row__bar">
          <div class="profile-score-row__fill" style="width:0%;" data-target="${value * 10}"></div>
        </div>
        <span class="profile-score-row__value">${value}</span>
      `;
      scoresMount.appendChild(row);
    });
    setTimeout(() => {
      scoresMount.querySelectorAll('.profile-score-row__fill').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    }, 300);

    // Points faibles + conseils
    const adviceMount = container.querySelector('#portfolio-advice');
    if (adviceMount) adviceMount.innerHTML = buildAdviceSection(scores, archColor);
  }
}

export { renderPortfolio };
