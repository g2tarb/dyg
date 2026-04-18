import { createRadarChart, animateRadar, PILLAR_LABELS, PILLARS_ORDER } from '../components/radarChart.js';
import { t } from '../i18n/index.js';
import { createArchetypeCard } from '../components/archetypeCard.js';
import { addToTeam, isInTeam, subscribe } from '../store.js';
import { showToast } from '../components/toast.js';
import { ARCHETYPE_NAMES } from '../components/devCard.js';
import { escapeHTML } from '../utils/sanitize.js';

let unsubTeam = null;

async function fetchDeveloper(id) {
  const res = await fetch(`/api/developers/${id}`);
  if (!res.ok) throw new Error('Developer not found');
  return res.json();
}

const PRICE_LABELS = { low: '$', medium: '$$', high: '$$$' };

function renderProfile(container, params = {}) {
  const devId = params.id;
  if (!devId) {
    container.innerHTML = '<p style="padding:var(--space-2xl);color:var(--color-text-dim);">Dev non trouvé.</p>';
    return;
  }

  // Loading state
  container.innerHTML = `
    <section class="profile">
      <div class="container" style="padding-top:var(--space-2xl);">
        <a href="#/search" class="profile-back">&larr; Retour</a>
        <div class="profile-layout">
          <div class="profile-left">
            <div class="skeleton skeleton-circle" style="width:120px;height:120px;"></div>
            <div class="skeleton skeleton-text" style="width:180px;height:32px;"></div>
            <div class="skeleton" style="width:300px;height:300px;border-radius:8px;"></div>
          </div>
          <div class="profile-right">
            <div class="skeleton skeleton-text" style="width:100px;height:24px;"></div>
            <div class="skeleton" style="width:220px;height:330px;border-radius:16px;"></div>
          </div>
        </div>
      </div>
    </section>
  `;

  fetchDeveloper(devId).then(dev => {
    const inTeam = isInTeam(dev.id);
    const safeName = escapeHTML(dev.name);
    const safeBio = escapeHTML(dev.bio || '');
    const safeArchetype = escapeHTML(dev.archetype);

    container.innerHTML = `
      <section class="profile">
        <div class="container" style="padding-top:var(--space-2xl);">
          <a href="#/search" class="profile-back">&larr; Retour à la recherche</a>
          <div class="profile-layout">
            <div class="profile-left">
              <div class="profile-header">
                <img
                  class="avatar avatar--lg avatar--${safeArchetype}"
                  src="${escapeHTML(dev.avatar_url)}"
                  alt="${safeName}"
                  onerror="this.outerHTML='<div class=\\'avatar avatar--lg avatar--${safeArchetype}\\' style=\\'display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:3rem;color:var(--color-text-dim);background:var(--color-surface);\\'>${escapeHTML(dev.name.charAt(0))}</div>'"
                >
                <h2 class="profile-header__name">${safeName}</h2>
                <span class="badge badge--${safeArchetype}">${ARCHETYPE_NAMES[dev.archetype] || safeArchetype}</span>
                <p class="profile-header__bio">${safeBio}</p>
              </div>
              <div id="radar-mount"></div>
              <div class="profile-scores" id="scores-mount"></div>
            </div>
            <div class="profile-right">
              <div id="archetype-card-mount"></div>
              <div>
                <h3 style="font-size:1.25rem;color:var(--color-text);margin-bottom:var(--space-sm);">Langages & Technos</h3>
                <div class="profile-langs">
                  ${(dev.languages || []).map(l => `<span class="profile-lang">${escapeHTML(l)}</span>`).join('')}
                </div>
              </div>
              <div class="profile-price">
                Budget : <span class="profile-price__value">${PRICE_LABELS[dev.price_range] || dev.price_range}</span>
              </div>
              <div class="profile-actions">
                <button class="btn-primary ${inTeam ? 'btn-primary--disabled' : ''}" id="btn-add-team" ${inTeam ? 'disabled' : ''}>
                  ${inTeam ? `${t('team.added_badge')} &#10003;` : t('team.add')}
                </button>
                <a href="#/search" class="btn-secondary">Voir d'autres devs</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    // Mount radar
    const radarMount = container.querySelector('#radar-mount');
    const radar = createRadarChart(dev.scores, { animate: true, id: `radar-${dev.id}` });
    radarMount.appendChild(radar);

    // Animate after a short delay for visual impact
    setTimeout(() => animateRadar(radar, 800), 200);

    // Mount score bars
    const scoresMount = container.querySelector('#scores-mount');
    PILLARS_ORDER.forEach(pillar => {
      const sc = dev.scores.find(s => s.pillar === pillar);
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

    // Animate score bars
    setTimeout(() => {
      scoresMount.querySelectorAll('.profile-score-row__fill').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    }, 300);

    // Mount archetype card
    const cardMount = container.querySelector('#archetype-card-mount');
    const card = createArchetypeCard(dev.archetype, dev.avatar_url, dev.name);
    if (card) cardMount.appendChild(card);

    // Add to team button
    const btn = container.querySelector('#btn-add-team');
    btn.addEventListener('click', () => {
      if (isInTeam(dev.id)) return;
      const added = addToTeam(dev);
      if (added) {
        btn.disabled = true;
        btn.classList.add('btn-primary--disabled');
        btn.innerHTML = `${t('team.added_badge')} &#10003;`;
        showToast(t('team.added', { name: dev.name }));
      } else {
        showToast(t('team.full'), 'error');
      }
    });

    // Update button if team changes externally
    unsubTeam = subscribe('team', () => {
      const nowInTeam = isInTeam(dev.id);
      btn.disabled = nowInTeam;
      btn.classList.toggle('btn-primary--disabled', nowInTeam);
      btn.innerHTML = nowInTeam ? `${t('team.added_badge')} &#10003;` : t('team.add');
    });

  }).catch(() => {
    container.innerHTML = `
      <section class="profile">
        <div class="container" style="padding-top:var(--space-2xl);">
          <a href="#/search" class="profile-back">&larr; Retour</a>
          <div class="empty-state">
            <p class="empty-state__text">Développeur non trouvé.</p>
          </div>
        </div>
      </section>
    `;
  });

  return () => {
    if (unsubTeam) unsubTeam();
    unsubTeam = null;
  };
}

export { renderProfile };
