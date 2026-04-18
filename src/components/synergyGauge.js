import { t } from '../i18n/index.js';

function createSynergyGauge(synergy = 0, diversityBonus = 0, total = 0) {
  const gauge = document.createElement('div');
  gauge.className = 'synergy-gauge';

  gauge.innerHTML = `
    <div class="synergy-gauge__header">
      <span class="synergy-gauge__label">${t('team.synergy')}</span>
      <span class="synergy-gauge__total" id="synergy-total">${total}</span>
      <span class="synergy-gauge__percent">%</span>
    </div>
    <div class="synergy-gauge__bar">
      <div class="synergy-gauge__fill" id="synergy-fill" style="width:0%;"></div>
    </div>
    <div class="synergy-gauge__details">
      <span class="synergy-gauge__coverage">${t('team.coverage')} : <strong id="synergy-coverage">${synergy}</strong>%</span>
      <span class="synergy-gauge__bonus ${diversityBonus > 0 ? 'synergy-gauge__bonus--active' : ''}">
        ${t('team.diversity_bonus')} : <strong id="synergy-bonus">+${diversityBonus}</strong>%
      </span>
    </div>
  `;

  // Animate fill after mount
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const fill = gauge.querySelector('#synergy-fill');
      if (fill) fill.style.width = `${Math.min(total, 100)}%`;
    });
  });

  return gauge;
}

function updateSynergyGauge(container, synergy, diversityBonus, total) {
  const totalEl = container.querySelector('#synergy-total');
  const fillEl = container.querySelector('#synergy-fill');
  const coverageEl = container.querySelector('#synergy-coverage');
  const bonusEl = container.querySelector('#synergy-bonus');
  const bonusSpan = container.querySelector('.synergy-gauge__bonus');

  if (totalEl) animateCounter(totalEl, parseInt(totalEl.textContent) || 0, total, 400);
  if (fillEl) fillEl.style.width = `${Math.min(total, 100)}%`;
  if (coverageEl) coverageEl.textContent = synergy;
  if (bonusEl) bonusEl.textContent = `+${diversityBonus}`;
  if (bonusSpan) bonusSpan.classList.toggle('synergy-gauge__bonus--active', diversityBonus > 0);
}

function animateCounter(el, from, to, duration) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + (to - from) * eased);
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

export { createSynergyGauge, updateSynergyGauge };
