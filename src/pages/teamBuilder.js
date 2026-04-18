import { getState, subscribe, removeFromTeam, setState } from '../store.js';
import { createTeamRadar, PILLARS_ORDER, PILLAR_LABELS } from '../components/radarChart.js';
import { createSynergyGauge, updateSynergyGauge } from '../components/synergyGauge.js';
import { ARCHETYPE_NAMES } from '../components/devCard.js';
import { showToast } from '../components/toast.js';
import { escapeHTML } from '../utils/sanitize.js';

const MAX_SLOTS = 5;
let unsubTeam = null;

function calculateLocalSynergy(members) {
  if (members.length === 0) return { synergy: 0, diversityBonus: 0, total: 0 };

  const pillarMaxes = PILLARS_ORDER.map(pillar => {
    const scores = members.map(m => {
      const s = (m.scores || []).find(sc => sc.pillar === pillar);
      return s ? s.score : 0;
    });
    return Math.max(0, ...scores);
  });

  const coverage = pillarMaxes.reduce((sum, v) => sum + v, 0) / (PILLARS_ORDER.length * 10) * 100;
  const uniqueArchetypes = new Set(members.map(m => m.archetype));
  const diversityBonus = Math.max(0, (uniqueArchetypes.size - 1) * 5);
  const total = Math.min(100, Math.round(coverage + diversityBonus));

  return { synergy: Math.round(coverage), diversityBonus, total };
}

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
        showToast(`${dev.name} retiré de la team`);
      });

    } else {
      slot.className = 'team-slot team-slot--empty';
      slot.dataset.index = i;
      slot.innerHTML = `
        <span class="team-slot__number">${i + 1}</span>
        <span class="team-slot__empty-text">Slot libre</span>
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
            <h2 class="team-slots__title">Ta Team</h2>
            <div id="team-slots" class="team-slots"></div>
          </div>
          <div class="team-stats">
            <h2 class="team-stats__title">Synergie</h2>
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

  function updateAll(team) {
    // Slots
    renderSlots(slotsContainer, team);

    // Synergy
    const { synergy, diversityBonus, total } = calculateLocalSynergy(team);

    // Radar
    radarMount.innerHTML = '';
    if (team.length > 0) {
      const radar = createTeamRadar(team);
      radarMount.appendChild(radar);
    } else {
      radarMount.innerHTML = `
        <div style="width:300px;height:300px;display:flex;align-items:center;justify-content:center;">
          <p style="color:var(--color-text-dim);font-size:0.875rem;text-align:center;">
            Ajoute des devs pour voir<br>le radar d'équipe
          </p>
        </div>
      `;
    }

    // Gauge
    if (!currentGauge) {
      currentGauge = createSynergyGauge(synergy, diversityBonus, total);
      gaugeMount.innerHTML = '';
      gaugeMount.appendChild(currentGauge);
    } else {
      updateSynergyGauge(currentGauge, synergy, diversityBonus, total);
    }

    // Empty state CTA
    if (team.length === 0) {
      const existing = slotsContainer.querySelector('.team-empty-cta');
      if (!existing) {
        const cta = document.createElement('div');
        cta.className = 'team-empty-cta';
        cta.style.cssText = 'text-align:center;padding:var(--space-lg) 0;';
        cta.innerHTML = `
          <p style="color:var(--color-text-dim);margin-bottom:var(--space-md);">Ton équipe est vide. Explore les devs et compose ta team.</p>
          <a href="#/search" class="btn-primary">Explorer les devs</a>
        `;
        slotsContainer.appendChild(cta);
      }
    }
  }

  // Initial render
  updateAll(getState('team'));

  // Subscribe to team changes
  unsubTeam = subscribe('team', updateAll);

  return () => {
    if (unsubTeam) unsubTeam();
    unsubTeam = null;
    currentGauge = null;
  };
}

export { renderTeamBuilder };
