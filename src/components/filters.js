import { ARCHETYPE_NAMES } from './devCard.js';

const ARCHETYPES_LIST = ['architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth'];
const PILLARS_LIST = [
  { key: 'code', label: 'Code' },
  { key: 'velocity', label: 'Velocity' },
  { key: 'craft', label: 'Craft' },
  { key: 'collaboration', label: 'Collaboration' },
  { key: 'versatility', label: 'Versatility' },
  { key: 'creativity', label: 'Creativity' },
  { key: 'autonomy', label: 'Autonomy' },
  { key: 'ia', label: 'IA Mastery' }
];

function createFilters(onChange) {
  const container = document.createElement('div');
  container.className = 'filters-bar';

  let activeArchetype = null;
  let activePrice = null;
  let activePillar = null;
  let activeMin = 1;

  function emitChange() {
    onChange({
      archetype: activeArchetype,
      price: activePrice,
      pillar: activePillar,
      min: activePillar ? activeMin : null
    });
  }

  // Pillar slider
  const pillarGroup = document.createElement('div');
  pillarGroup.className = 'filters-bar__group';
  pillarGroup.style.minWidth = '200px';
  pillarGroup.innerHTML = `
    <span class="filters-bar__label">Minimum pillar</span>
    <select class="input" style="padding:4px 8px;font-size:0.8125rem;" id="filter-pillar">
      <option value="">All</option>
      ${PILLARS_LIST.map(p => `<option value="${p.key}">${p.label}</option>`).join('')}
    </select>
  `;

  const sliderGroup = document.createElement('div');
  sliderGroup.className = 'slider-group';
  sliderGroup.style.minWidth = '140px';
  sliderGroup.innerHTML = `
    <div class="slider-label">
      <span>Min score</span>
      <span class="slider-label__value" id="slider-val">1</span>
    </div>
    <input type="range" class="slider" id="filter-min" min="1" max="10" value="1">
  `;

  // Archetype toggles
  const archGroup = document.createElement('div');
  archGroup.className = 'filters-bar__group';
  archGroup.innerHTML = `<span class="filters-bar__label">Archetype</span>`;
  const archToggles = document.createElement('div');
  archToggles.className = 'filters-bar__archetypes';
  ARCHETYPES_LIST.forEach(a => {
    const btn = document.createElement('span');
    btn.className = `badge badge--${a} badge-toggle`;
    btn.textContent = ARCHETYPE_NAMES[a];
    btn.dataset.archetype = a;
    btn.addEventListener('click', () => {
      if (activeArchetype === a) {
        activeArchetype = null;
        btn.classList.remove('badge-toggle--active');
      } else {
        archToggles.querySelectorAll('.badge-toggle').forEach(b => b.classList.remove('badge-toggle--active'));
        activeArchetype = a;
        btn.classList.add('badge-toggle--active');
      }
      emitChange();
    });
    archToggles.appendChild(btn);
  });
  archGroup.appendChild(archToggles);

  // Price tags
  const priceGroup = document.createElement('div');
  priceGroup.className = 'filters-bar__group';
  priceGroup.innerHTML = `<span class="filters-bar__label">Budget</span>`;
  const priceRow = document.createElement('div');
  priceRow.className = 'filters-bar__price';
  ['low', 'medium', 'high'].forEach(p => {
    const labels = { low: '$', medium: '$$', high: '$$$' };
    const btn = document.createElement('button');
    btn.className = 'price-tag';
    btn.textContent = labels[p];
    btn.dataset.price = p;
    btn.addEventListener('click', () => {
      if (activePrice === p) {
        activePrice = null;
        btn.classList.remove('price-tag--active');
      } else {
        priceRow.querySelectorAll('.price-tag').forEach(b => b.classList.remove('price-tag--active'));
        activePrice = p;
        btn.classList.add('price-tag--active');
      }
      emitChange();
    });
    priceRow.appendChild(btn);
  });
  priceGroup.appendChild(priceRow);

  container.appendChild(pillarGroup);
  container.appendChild(sliderGroup);
  container.appendChild(archGroup);
  container.appendChild(priceGroup);

  // Events after mount
  requestAnimationFrame(() => {
    const select = container.querySelector('#filter-pillar');
    const slider = container.querySelector('#filter-min');
    const sliderVal = container.querySelector('#slider-val');

    if (select) {
      select.addEventListener('change', (e) => {
        activePillar = e.target.value || null;
        emitChange();
      });
    }
    if (slider) {
      slider.addEventListener('input', (e) => {
        activeMin = parseInt(e.target.value);
        if (sliderVal) sliderVal.textContent = activeMin;
        emitChange();
      });
    }
  });

  return container;
}

export { createFilters };
