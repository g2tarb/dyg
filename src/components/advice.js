import { t } from '../i18n/index.js';
import { escapeHTML } from '../utils/sanitize.js';
import { PILLAR_LABELS } from './radarChart.js';

// Conseils statiques par pilier, indexés par niveau de score (faible / moyen / bon).
// Repris de l'ancien coach — 100% local, aucune IA.
const TIPS_PER_PILLAR = {
  code: ['coach.code_1', 'coach.code_2', 'coach.code_3'],
  velocity: ['coach.velocity_1', 'coach.velocity_2', 'coach.velocity_3'],
  craft: ['coach.craft_1', 'coach.craft_2', 'coach.craft_3'],
  collaboration: ['coach.collab_1', 'coach.collab_2', 'coach.collab_3'],
  versatility: ['coach.versatility_1', 'coach.versatility_2', 'coach.versatility_3'],
  creativity: ['coach.creativity_1', 'coach.creativity_2', 'coach.creativity_3'],
  autonomy: ['coach.autonomy_1', 'coach.autonomy_2', 'coach.autonomy_3'],
  ia: ['coach.ia_1', 'coach.ia_2', 'coach.ia_3']
};

function getWeakestPillars(scores, count = 3) {
  return [...scores].sort((a, b) => a.score - b.score).slice(0, count);
}

function getTipForPillar(pillar, score) {
  const tips = TIPS_PER_PILLAR[pillar];
  if (!tips) return null;
  if (score <= 3) return t(tips[0]);
  if (score <= 6) return t(tips[1]);
  return t(tips[2]);
}

// Retourne le HTML de la section "points faibles + conseils" pour un set de scores.
function buildAdviceSection(scores, color = '#E8620A') {
  if (!scores || scores.length === 0) return '';
  const weakest = getWeakestPillars(scores, 3);

  const items = weakest.map(w => {
    const tip = getTipForPillar(w.pillar, w.score);
    if (!tip) return '';
    return `
      <div class="advice__item">
        <div class="advice__head">
          <span class="advice__pillar">${PILLAR_LABELS[w.pillar] || w.pillar}</span>
          <span class="advice__score">${w.score}/10</span>
        </div>
        <p class="advice__tip">${escapeHTML(tip)}</p>
      </div>`;
  }).join('');

  return `
    <div class="advice" style="--advice-color:${escapeHTML(color)};">
      <h3 class="advice__title">${t('advice.title')}</h3>
      <p class="advice__sub">${t('advice.sub')}</p>
      <div class="advice__list">${items}</div>
    </div>`;
}

export { buildAdviceSection, getWeakestPillars, getTipForPillar };
