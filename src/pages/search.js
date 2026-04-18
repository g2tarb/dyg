import { createDevCard } from '../components/devCard.js';
import { t } from '../i18n/index.js';
import { createFilters } from '../components/filters.js';
import { subscribe, getState, setState } from '../store.js';

let unsubTeam = null;

async function fetchDevelopers(filters = {}, offset = 0) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.archetype) params.set('archetype', filters.archetype);
  if (filters.price) params.set('price', filters.price);
  if (filters.pillar) params.set('pillar', filters.pillar);
  if (filters.min) params.set('min', filters.min);
  params.set('limit', '20');
  params.set('offset', offset.toString());

  const res = await fetch(`/api/developers?${params}`);
  if (!res.ok) throw new Error('Failed to fetch developers');
  return res.json();
}

function renderSkeletons(grid, count = 6) {
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skel = document.createElement('div');
    skel.className = 'skeleton skeleton-card';
    grid.appendChild(skel);
  }
}

function renderGrid(grid, developers) {
  grid.innerHTML = '';

  if (developers.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <p class="empty-state__text">Aucun dev ne correspond. Ajuste tes filtres.</p>
      </div>
    `;
    return;
  }

  developers.forEach((dev, i) => {
    const card = createDevCard(dev);
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.4s var(--ease-out) ${i * 60}ms, transform 0.4s var(--ease-spring) ${i * 60}ms`;
    grid.appendChild(card);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    });
  });
}

function renderSearch(container) {
  container.innerHTML = `
    <section class="search">
      <div class="container" style="padding-top:var(--space-2xl);">
        <h2 style="font-size:2.5rem;color:var(--color-text);margin-bottom:var(--space-sm);">${t('search.title')}</h2>
        <p style="color:var(--color-text-dim);margin-bottom:var(--space-lg);">${t('search.sub')}</p>
        <div class="search-bar" style="margin-bottom:var(--space-lg);">
          <input type="text" class="input" id="search-input" placeholder="${t('search.placeholder')}" style="max-width:400px;" autocomplete="off">
        </div>
        <div id="filters-mount"></div>
        <div class="dev-grid" id="dev-grid"></div>
      </div>
    </section>
  `;

  const grid = container.querySelector('#dev-grid');
  const filtersMount = container.querySelector('#filters-mount');

  let currentFilters = {};
  let currentOffset = 0;
  let allLoaded = false;

  async function loadDevs(filters = {}, append = false) {
    if (!append) {
      currentOffset = 0;
      allLoaded = false;
      renderSkeletons(grid);
    }

    try {
      const developers = await fetchDevelopers(filters, currentOffset);

      if (!append) {
        setState('developers', developers);
        renderGrid(grid, developers);
      } else {
        const existing = getState('developers');
        const merged = [...existing, ...developers];
        setState('developers', merged);
        // Append new cards to grid
        const existingLoadMore = grid.querySelector('.load-more-wrap');
        if (existingLoadMore) existingLoadMore.remove();
        developers.forEach((dev, i) => {
          const card = createDevCard(dev);
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          card.style.transition = `opacity 0.4s var(--ease-out) ${i * 60}ms, transform 0.4s var(--ease-spring) ${i * 60}ms`;
          grid.appendChild(card);
          requestAnimationFrame(() => { requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }); });
        });
      }

      if (developers.length < 20) {
        allLoaded = true;
      } else {
        currentOffset += developers.length;
        appendLoadMore();
      }
    } catch (err) {
      if (!append) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1;">
            <p class="empty-state__text">${t('common.error')}</p>
          </div>
        `;
      }
    }
  }

  function appendLoadMore() {
    const existing = grid.querySelector('.load-more-wrap');
    if (existing) existing.remove();

    const wrap = document.createElement('div');
    wrap.className = 'load-more-wrap';
    wrap.style.cssText = 'grid-column:1/-1;text-align:center;padding:var(--space-xl) 0;';
    wrap.innerHTML = '<button class="btn-secondary" id="btn-load-more">Charger plus</button>';
    grid.appendChild(wrap);

    wrap.querySelector('#btn-load-more').addEventListener('click', () => {
      loadDevs(currentFilters, true);
    });
  }

  // Mount filters
  const filtersEl = createFilters((filters) => {
    currentFilters = filters;
    loadDevs(filters);
  });
  filtersMount.appendChild(filtersEl);

  // Re-render grid when team changes (to update checkmarks)
  unsubTeam = subscribe('team', () => {
    const devs = getState('developers');
    if (devs.length > 0) renderGrid(grid, devs);
  });

  // Search by name
  const searchInput = container.querySelector('#search-input');
  let searchTimeout = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = searchInput.value.trim() || undefined;
      loadDevs(currentFilters);
    }, 300);
  });

  // Initial load
  loadDevs();

  // Return cleanup function
  return () => {
    if (unsubTeam) unsubTeam();
    unsubTeam = null;
    clearTimeout(searchTimeout);
  };
}

export { renderSearch };
