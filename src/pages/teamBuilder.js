import { getState, subscribe, removeFromTeam, setState } from '../store.js';
import { createTeamRadar } from '../components/radarChart.js';
import { createSynergyGauge, updateSynergyGauge } from '../components/synergyGauge.js';
import { ARCHETYPE_NAMES } from '../components/devCard.js';
import { showToast } from '../components/toast.js';
import { escapeHTML } from '../utils/sanitize.js';
import { t } from '../i18n/index.js';

const MAX_SLOTS = 5;
let unsubTeam = null;
let unsubSynergy = null;

function renderSlots(slotsContainer, team) {
  slotsContainer.innerHTML = '';

  for (let i = 0; i < MAX_SLOTS; i++) {
    const dev = team[i];
    const slot = document.createElement('div');

    if (dev) {
      slot.className = 'team-slot team-slot--filled';
      slot.draggable = true;
      slot.dataset.index = i;
      slot.dataset.devId = dev.id;

      const safeName = escapeHTML(dev.name);
      slot.innerHTML = `
        <img
          class="avatar avatar--sm avatar--${escapeHTML(dev.archetype)}"
          src="${escapeHTML(dev.avatar_url)}"
          alt="${safeName}"
          onerror="this.outerHTML='<div class=\\'avatar avatar--sm avatar--${escapeHTML(dev.archetype)}\\' style=\\'display:flex;align-items:center;justify-content:center;font-size:0.75rem;color:var(--color-text-dim);background:var(--color-surface);\\'>${escapeHTML(dev.name.charAt(0))}</div>'"
        >
        <div class="team-slot__info">
          <span class="team-slot__name">${safeName}</span>
          <div class="team-slot__meta">
            <span class="badge badge--${dev.archetype}" style="font-size:0.625rem;">${ARCHETYPE_NAMES[dev.archetype] || dev.archetype}</span>
            <span class="score-pill" style="font-size:0.7rem;height:18px;min-width:30px;">
              ${((dev.scores || []).reduce((s, sc) => s + sc.score, 0) / 7).toFixed(1)}
            </span>
          </div>
        </div>
        <button class="team-slot__remove" data-dev-id="${dev.id}" title="Retirer">&times;</button>
      `;

      // Drag events
      slot.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', i.toString());
        slot.classList.add('team-slot--dragging');
      });

      slot.addEventListener('dragend', () => {
        slot.classList.remove('team-slot--dragging');
      });

      // Remove button
      const removeBtn = slot.querySelector('.team-slot__remove');
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromTeam(dev.id);
        showToast(t('team.removed', { name: dev.name }));
      });

    } else {
      slot.className = 'team-slot team-slot--empty';
      slot.dataset.index = i;
      slot.innerHTML = `
        <span class="team-slot__number">${i + 1}</span>
        <span class="team-slot__empty-text">${t('team.slot_free')}</span>
      `;
    }

    // Drop zone for all slots
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('team-slot--drag-over');
    });

    slot.addEventListener('dragleave', () => {
      slot.classList.remove('team-slot--drag-over');
    });

    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('team-slot--drag-over');
      const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
      const toIndex = i;
      if (fromIndex === toIndex || isNaN(fromIndex)) return;

      // Swap positions in team array
      const currentTeam = [...getState('team')];
      const maxIdx = Math.max(fromIndex, toIndex);
      if (maxIdx >= currentTeam.length) return;
      [currentTeam[fromIndex], currentTeam[toIndex]] = [currentTeam[toIndex], currentTeam[fromIndex]];
      setState('team', currentTeam);
    });

    slotsContainer.appendChild(slot);
  }
}

function renderTeamBuilder(container) {
  container.innerHTML = `
    <section class="team-builder">
      <div class="container">
        <div class="team-layout">
          <div>
            <h2 class="team-slots__title">${t('team.title')}</h2>
            <div id="team-slots" class="team-slots"></div>
          </div>
          <div class="team-stats">
            <h2 class="team-stats__title">${t('team.synergy')}</h2>
            <div id="team-radar-mount"></div>
            <div id="team-gauge-mount"></div>
          </div>
        </div>
      </div>
    </section>
  `;

  const slotsContainer = container.querySelector('#team-slots');
  const radarMount = container.querySelector('#team-radar-mount');
  const gaugeMount = container.querySelector('#team-gauge-mount');

  let currentGauge = null;

  function updateTeamUI(team) {
    renderSlots(slotsContainer, team);

    // Radar
    radarMount.innerHTML = '';
    if (team.length > 0) {
      const radar = createTeamRadar(team);
      radarMount.appendChild(radar);
    } else {
      radarMount.innerHTML = `
        <div style="width:300px;height:300px;display:flex;align-items:center;justify-content:center;">
          <p style="color:var(--color-text-dim);font-size:0.875rem;text-align:center;">
            ${t('team.empty_radar')}
          </p>
        </div>
      `;
    }

    // Empty state CTA
    if (team.length === 0) {
      const existing = slotsContainer.querySelector('.team-empty-cta');
      if (!existing) {
        const cta = document.createElement('div');
        cta.className = 'team-empty-cta';
        cta.style.cssText = 'text-align:center;padding:var(--space-lg) 0;';
        cta.innerHTML = `
          <p style="color:var(--color-text-dim);margin-bottom:var(--space-md);">${t('team.empty')}</p>
          <a href="#/search" class="btn-primary">${t('common.explore_devs')}</a>
        `;
        slotsContainer.appendChild(cta);
      }
    }
  }

  function updateGauge({ coverage, diversityBonus, total }) {
    if (!currentGauge) {
      currentGauge = createSynergyGauge(coverage, diversityBonus, total);
      gaugeMount.innerHTML = '';
      gaugeMount.appendChild(currentGauge);
    } else {
      updateSynergyGauge(currentGauge, coverage, diversityBonus, total);
    }
  }

  // Initial render
  updateTeamUI(getState('team'));
  updateGauge(getState('synergy'));

  // Subscribe to changes
  unsubTeam = subscribe('team', updateTeamUI);
  unsubSynergy = subscribe('synergy', updateGauge);

  return () => {
    if (unsubTeam) unsubTeam();
    if (unsubSynergy) unsubSynergy();
    unsubTeam = null;
    unsubSynergy = null;
    currentGauge = null;
  };
}

export { renderTeamBuilder };
