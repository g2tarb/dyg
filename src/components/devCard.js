import { isInTeam } from '../store.js';
import { escapeHTML } from '../utils/sanitize.js';

const ARCHETYPE_NAMES = {
  architect: 'Architecte',
  shipper: 'Shipper',
  artisan: 'Artisan',
  creative: 'Créatif',
  explorer: 'Explorateur',
  commando: 'Commando',
  mentor: 'Mentor'
};

const ARCHETYPE_COLORS = {
  architect: '#3B82F6',
  shipper: '#22C55E',
  artisan: '#F5C542',
  creative: '#A855F7',
  explorer: '#06B6D4',
  commando: '#EF4444',
  mentor: '#F97316'
};

function createDevCard(dev) {
  const avgScore = dev.avg_score ||
    (dev.scores ? (dev.scores.reduce((s, sc) => s + sc.score, 0) / dev.scores.length).toFixed(1) : '—');
  const inTeam = isInTeam(dev.id);
  const langs = (dev.languages || []).slice(0, 3);
  const color = ARCHETYPE_COLORS[dev.archetype] || '#CBD5E1';

  const card = document.createElement('a');
  card.href = `#/profile/${dev.id}`;
  card.className = 'dev-card';
  card.style.setProperty('--card-archetype-color', color);
  card.setAttribute('tabindex', '0');

  const safeName = escapeHTML(dev.name);
  const safeBio = escapeHTML(dev.bio || '');
  const safeInitial = escapeHTML(dev.name.charAt(0));

  card.innerHTML = `
    ${inTeam ? '<span class="dev-card__added">&#10003;</span>' : ''}
    <div class="dev-card__color-bar"></div>
    <div class="dev-card__top">
      <img
        class="avatar avatar--md dev-card__avatar avatar--${escapeHTML(dev.archetype)}"
        src="${escapeHTML(dev.avatar_url)}"
        alt="${safeName}"
        loading="lazy"
        onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 80 80%22><rect fill=%22%23131B2E%22 width=%2280%22 height=%2280%22/><text x=%2240%22 y=%2248%22 text-anchor=%22middle%22 fill=%22%23CBD5E1%22 font-size=%2224%22>${safeInitial}</text></svg>'"
      >
      <div class="dev-card__identity">
        <span class="dev-card__name">${safeName}</span>
        <span class="badge badge--${escapeHTML(dev.archetype)}">${ARCHETYPE_NAMES[dev.archetype] || escapeHTML(dev.archetype)}</span>
      </div>
    </div>
    <p class="dev-card__bio">${safeBio}</p>
    <div class="dev-card__footer">
      <span class="score-pill">${avgScore}/10</span>
      <div class="dev-card__langs">
        ${langs.map(l => `<span class="dev-card__lang">${escapeHTML(l)}</span>`).join('')}
      </div>
    </div>
  `;

  return card;
}

export { createDevCard, ARCHETYPE_NAMES, ARCHETYPE_COLORS };
