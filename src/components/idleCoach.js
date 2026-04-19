import { getState } from '../store.js';
import { escapeHTML } from '../utils/sanitize.js';
import { PILLAR_LABELS, PILLARS_ORDER } from './radarChart.js';
import { ARCHETYPE_DATA } from './archetypeCard.js';
import { t } from '../i18n/index.js';

const IDLE_TIMEOUT = 60_000; // 1 minute
const TIPS_PER_PILLAR = {
  code: [
    'coach.code_1',
    'coach.code_2',
    'coach.code_3'
  ],
  velocity: [
    'coach.velocity_1',
    'coach.velocity_2',
    'coach.velocity_3'
  ],
  craft: [
    'coach.craft_1',
    'coach.craft_2',
    'coach.craft_3'
  ],
  collaboration: [
    'coach.collab_1',
    'coach.collab_2',
    'coach.collab_3'
  ],
  versatility: [
    'coach.versatility_1',
    'coach.versatility_2',
    'coach.versatility_3'
  ],
  creativity: [
    'coach.creativity_1',
    'coach.creativity_2',
    'coach.creativity_3'
  ],
  autonomy: [
    'coach.autonomy_1',
    'coach.autonomy_2',
    'coach.autonomy_3'
  ],
  ia: [
    'coach.ia_1',
    'coach.ia_2',
    'coach.ia_3'
  ]
};

let idleTimer = null;
let overlay = null;

function getWeakestPillars(scores, count = 3) {
  const sorted = [...scores].sort((a, b) => a.score - b.score);
  return sorted.slice(0, count);
}

function getTipForPillar(pillar, score) {
  const tips = TIPS_PER_PILLAR[pillar];
  if (!tips) return null;
  // Pick tip based on score level
  if (score <= 3) return t(tips[0]);
  if (score <= 6) return t(tips[1]);
  return t(tips[2]);
}

function buildOverlay(developer) {
  const scores = developer.scores || [];
  const arch = developer.archetype;
  const archData = ARCHETYPE_DATA[arch] || {};
  const weakest = getWeakestPillars(scores);

  // Check if close to dual archetype
  const hasDual = !!developer.secondary_archetype;
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);

  const el = document.createElement('div');
  el.className = 'idle-coach';
  el.innerHTML = `
    <div class="idle-coach__backdrop"></div>
    <div class="idle-coach__panel">
      <button class="idle-coach__close" id="idle-close">&times;</button>

      <div class="idle-coach__header">
        <div class="idle-coach__arch-badge" style="--arch-color: ${archData.color || '#E8620A'};">
          <span class="idle-coach__arch-name">${escapeHTML(archData.name || arch)}</span>
          ${hasDual ? `<span class="idle-coach__dual-tag">${t('coach.dual_unlocked')}</span>` : ''}
        </div>
        <p class="idle-coach__greeting">${t('coach.greeting')}</p>
      </div>

      <div class="idle-coach__scores">
        ${PILLARS_ORDER.map(pillar => {
          const sc = scores.find(s => s.pillar === pillar);
          const value = sc ? sc.score : 0;
          return `
          <div class="idle-coach__score-row">
            <span class="idle-coach__pillar">${PILLAR_LABELS[pillar]}</span>
            <div class="idle-coach__bar-track">
              <div class="idle-coach__bar-fill" data-value="${value * 10}" style="width:0%;background:${archData.color || '#E8620A'};"></div>
            </div>
            <span class="idle-coach__val">${value}</span>
          </div>`;
        }).join('')}
      </div>

      <div class="idle-coach__tips">
        <h3 class="idle-coach__tips-title">${t('coach.tips_title')}</h3>
        ${weakest.map(w => {
          const tip = getTipForPillar(w.pillar, w.score);
          return tip ? `
          <div class="idle-coach__tip">
            <span class="idle-coach__tip-pillar">${PILLAR_LABELS[w.pillar]} <span class="idle-coach__tip-score">${w.score}/10</span></span>
            <p class="idle-coach__tip-text">${escapeHTML(tip)}</p>
          </div>` : '';
        }).join('')}
      </div>

      ${!hasDual ? `
      <div class="idle-coach__goal">
        <span class="idle-coach__goal-label">${t('coach.next_goal')}</span>
        <p class="idle-coach__goal-text">${t('coach.goal_dual')}</p>
      </div>` : `
      <div class="idle-coach__goal idle-coach__goal--rare">
        <span class="idle-coach__goal-label">${t('coach.next_goal')}</span>
        <p class="idle-coach__goal-text">${t('coach.goal_triple')}</p>
      </div>`}

      <div class="idle-coach__actions">
        <a href="#/training" class="btn-primary">${t('coach.cta_train')}</a>
        <a href="#/onboarding" class="btn-secondary">${t('coach.cta_rescan')}</a>
      </div>
    </div>
  `;

  return el;
}

function showCoach() {
  const developer = getState('developer');
  if (!developer || !developer.scores || developer.scores.length === 0) return;
  if (overlay) return; // Already showing

  overlay = buildOverlay(developer);
  document.body.appendChild(overlay);

  // Animate bars after mount
  requestAnimationFrame(() => {
    overlay.querySelectorAll('.idle-coach__bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.value + '%';
    });
  });

  // Close handlers
  const closeBtn = overlay.querySelector('#idle-close');
  const backdrop = overlay.querySelector('.idle-coach__backdrop');

  function dismiss() {
    overlay.classList.add('idle-coach--closing');
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
    }, 300);
    resetIdleTimer();
  }

  closeBtn.addEventListener('click', dismiss);
  backdrop.addEventListener('click', dismiss);
  overlay.querySelectorAll('a').forEach(link => link.addEventListener('click', dismiss));
}

function hideCoach() {
  if (!overlay) return;
  overlay.classList.add('idle-coach--closing');
  setTimeout(() => {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
  }, 300);
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  if (overlay) {
    hideCoach();
  }
  // Only set timer if user is logged in with a dev profile
  const developer = getState('developer');
  if (developer && developer.scores && developer.scores.length > 0) {
    idleTimer = setTimeout(showCoach, IDLE_TIMEOUT);
  }
}

function startIdleCoach() {
  const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
  events.forEach(evt => {
    document.addEventListener(evt, resetIdleTimer, { passive: true });
  });
  resetIdleTimer();
}

function stopIdleCoach() {
  clearTimeout(idleTimer);
  const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
  events.forEach(evt => {
    document.removeEventListener(evt, resetIdleTimer);
  });
  hideCoach();
}

export { startIdleCoach, stopIdleCoach };
