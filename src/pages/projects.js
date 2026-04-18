import { getState, subscribe } from '../store.js';
import { escapeHTML } from '../utils/sanitize.js';
import { showToast } from '../components/toast.js';

const STATUS_LABELS = {
  open: 'Ouvert', staffing: 'Recrutement', building: 'En cours',
  review: 'Review', shipped: 'Livré', archived: 'Archivé'
};
const STATUS_COLORS = {
  open: '#06B6D4', staffing: '#F5C542', building: '#E8620A',
  review: '#A855F7', shipped: '#22C55E', archived: '#5A6174'
};

function renderProjectCard(project) {
  const color = STATUS_COLORS[project.status] || '#5A6174';
  const card = document.createElement('a');
  card.href = `#/projects/${project.id}`;
  card.className = 'project-card';
  card.style.setProperty('--proj-color', color);
  card.innerHTML = `
    <div class="project-card__bar" style="background:${color};"></div>
    <div class="project-card__body">
      <div class="project-card__top">
        <h3 class="project-card__name">${escapeHTML(project.name)}</h3>
        <span class="project-card__status" style="color:${color};border-color:${color};">
          ${STATUS_LABELS[project.status] || project.status}
        </span>
      </div>
      <p class="project-card__desc">${escapeHTML(project.description || 'Pas de description')}</p>
      <div class="project-card__footer">
        <div class="project-card__creator">
          <img class="project-card__avatar" src="${escapeHTML(project.creator_avatar || '')}"
               alt="${escapeHTML(project.creator_login || '')}"
               onerror="this.style.display='none'">
          <span class="project-card__login">${escapeHTML(project.creator_login || '')}</span>
        </div>
        <span class="project-card__members">${project.member_count || 0} / ${project.max_members || 5}</span>
      </div>
    </div>
  `;
  return card;
}

function renderProjects(container) {
  const user = getState('user');

  container.innerHTML = `
    <section class="projects">
      <div class="container" style="padding-top:var(--space-2xl);">
        <div class="projects__header">
          <div>
            <h2 class="projects__title">Projets</h2>
            <p class="projects__sub">Rejoins un projet ou lance le tien.</p>
          </div>
          ${user ? '<button class="btn-primary" id="btn-create-toggle">Créer un projet</button>' : '<a href="/auth/github" class="btn-primary">Se connecter pour créer</a>'}
        </div>

        <div class="projects-create" id="create-form" style="display:none;">
          <h3 class="projects-create__title">Nouveau projet</h3>
          <div class="projects-create__fields">
            <input type="text" class="input" id="proj-name" placeholder="Nom du projet" maxlength="100">
            <textarea class="input projects-create__textarea" id="proj-desc" placeholder="Description (optionnel)" rows="3"></textarea>
            <input type="text" class="input" id="proj-repo" placeholder="URL du repo GitHub (optionnel)">
          </div>
          <div class="projects-create__actions">
            <button class="btn-primary" id="btn-create-submit">Lancer le projet</button>
            <button class="btn-secondary" id="btn-create-cancel">Annuler</button>
          </div>
          <p class="input-error-msg" id="create-error" style="display:none;"></p>
        </div>

        <div class="projects-filters" id="proj-filters">
          <button class="proj-filter proj-filter--active" data-status="">Tous</button>
          ${user ? '<button class="proj-filter" data-status="mine">Mes projets</button>' : ''}
          <button class="proj-filter" data-status="open">Ouvert</button>
          <button class="proj-filter" data-status="staffing">Recrutement</button>
          <button class="proj-filter" data-status="building">En cours</button>
          <button class="proj-filter" data-status="shipped">Livré</button>
        </div>

        <div class="projects-grid" id="projects-grid">
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
          <div class="skeleton skeleton-card"></div>
        </div>
      </div>
    </section>
  `;

  const grid = container.querySelector('#projects-grid');
  const createForm = container.querySelector('#create-form');
  const filtersBar = container.querySelector('#proj-filters');
  let currentStatus = '';

  // Create project toggle
  const btnToggle = container.querySelector('#btn-create-toggle');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      createForm.style.display = createForm.style.display === 'none' ? 'block' : 'none';
    });
  }

  const btnCancel = container.querySelector('#btn-create-cancel');
  if (btnCancel) {
    btnCancel.addEventListener('click', () => { createForm.style.display = 'none'; });
  }

  // Submit new project
  const btnSubmit = container.querySelector('#btn-create-submit');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', async () => {
      const name = container.querySelector('#proj-name').value.trim();
      const description = container.querySelector('#proj-desc').value.trim();
      const repo_url = container.querySelector('#proj-repo').value.trim();
      const errorEl = container.querySelector('#create-error');

      if (!name) {
        errorEl.textContent = 'Le nom du projet est requis.';
        errorEl.style.display = 'block';
        return;
      }

      errorEl.style.display = 'none';
      btnSubmit.disabled = true;

      try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description: description || null, repo_url: repo_url || null })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Erreur');
        }
        createForm.style.display = 'none';
        showToast('Projet créé');
        loadProjects();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
      } finally {
        btnSubmit.disabled = false;
      }
    });
  }

  // Filters
  filtersBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.proj-filter');
    if (!btn) return;
    filtersBar.querySelectorAll('.proj-filter').forEach(b => b.classList.remove('proj-filter--active'));
    btn.classList.add('proj-filter--active');
    currentStatus = btn.dataset.status;
    loadProjects();
  });

  async function loadProjects() {
    grid.innerHTML = '<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>';
    try {
      let url = '/api/projects';
      if (currentStatus === 'mine') {
        url = '/api/projects?mine=true';
      } else if (currentStatus) {
        url = `/api/projects?status=${currentStatus}`;
      }
      const res = await fetch(url);
      const projects = await res.json();

      grid.innerHTML = '';
      if (projects.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><p class="empty-state__text">Aucun projet pour l\'instant. Sois le premier.</p></div>';
        return;
      }
      projects.forEach((proj, i) => {
        const card = renderProjectCard(proj);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.4s var(--ease-out) ${i * 60}ms, transform 0.4s var(--ease-spring) ${i * 60}ms`;
        grid.appendChild(card);
        requestAnimationFrame(() => { requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }); });
      });
    } catch {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><p class="empty-state__text">Erreur de chargement.</p></div>';
    }
  }

  // Update header auth reactively
  const unsub = subscribe('user', () => {
    // Re-render page on auth change
    renderProjects(container);
  });

  loadProjects();

  return () => { unsub(); };
}

export { renderProjects };
