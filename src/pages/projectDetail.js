import { getState } from '../store.js';
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
const STATUS_FLOW = ['open', 'staffing', 'building', 'review', 'shipped'];
const REVIEW_PILLARS = ['collaboration', 'craft', 'velocity'];
const REVIEW_PILLAR_LABELS = { collaboration: 'Collaboration', craft: 'Craft', velocity: 'Vélocité' };

function renderStars(name, value = 0) {
  let html = '<div class="review-stars" data-pillar="' + name + '">';
  for (let i = 1; i <= 5; i++) {
    html += `<button class="review-star ${i <= value ? 'review-star--active' : ''}" data-value="${i}">${i <= value ? '\u2605' : '\u2606'}</button>`;
  }
  html += '</div>';
  return html;
}

function renderProjectDetail(container, params = {}) {
  const projectId = params.id;
  if (!projectId) {
    container.innerHTML = '<p style="padding:var(--space-2xl);color:var(--color-text-dim);">Projet non trouvé.</p>';
    return;
  }

  container.innerHTML = `
    <section class="project-detail">
      <div class="container" style="padding-top:var(--space-2xl);">
        <a href="#/projects" class="profile-back">&larr; Retour aux projets</a>
        <div class="skeleton" style="height:400px;margin-top:var(--space-lg);"></div>
      </div>
    </section>
  `;

  loadProject(container, projectId);
}

async function loadProject(container, projectId) {
  let project, reviewData;
  try {
    const [projRes, revRes] = await Promise.all([
      fetch(`/api/projects/${projectId}`),
      fetch(`/api/projects/${projectId}/reviews`)
    ]);
    if (!projRes.ok) throw new Error('Not found');
    project = await projRes.json();
    reviewData = revRes.ok ? await revRes.json() : { reviewerIds: [], myReviews: [] };
  } catch {
    container.innerHTML = `
      <section class="project-detail">
        <div class="container" style="padding-top:var(--space-2xl);">
          <a href="#/projects" class="profile-back">&larr; Retour</a>
          <div class="empty-state"><p class="empty-state__text">Projet non trouvé.</p></div>
        </div>
      </section>`;
    return;
  }

  const user = getState('user');
  const color = STATUS_COLORS[project.status] || '#5A6174';
  const isCreator = user && project.creator_id === user.id;
  const isMember = user && project.members.some(m => m.id === user.id);
  const canJoin = user && !isMember && (project.status === 'open' || project.status === 'staffing');
  const canLeave = isMember && !isCreator;
  const isReviewPhase = project.status === 'review';
  const hasReviewed = user && reviewData.reviewerIds.includes(user.id);

  // Next status for creator
  const currentIdx = STATUS_FLOW.indexOf(project.status);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  // Build existing reviews map for current user
  const myReviewsMap = {};
  for (const r of reviewData.myReviews) {
    if (!myReviewsMap[r.reviewee_id]) myReviewsMap[r.reviewee_id] = {};
    myReviewsMap[r.reviewee_id][r.pillar] = r.rating;
  }

  // Teammates to review (everyone except self)
  const teammates = user ? project.members.filter(m => m.id !== user.id) : [];

  container.innerHTML = `
    <section class="project-detail">
      <div class="container" style="padding-top:var(--space-2xl);">
        <a href="#/projects" class="profile-back">&larr; Retour aux projets</a>

        <div class="projdet__header">
          <div class="projdet__header-left">
            <span class="projdet__status" style="color:${color};border-color:${color};">
              ${STATUS_LABELS[project.status] || project.status}
            </span>
            <h2 class="projdet__name">${escapeHTML(project.name)}</h2>
            <p class="projdet__desc">${escapeHTML(project.description || 'Pas de description.')}</p>
            ${project.repo_url ? `<a href="${escapeHTML(project.repo_url)}" target="_blank" rel="noopener" class="projdet__repo">GitHub repo &rarr;</a>` : ''}
          </div>
          <div class="projdet__actions">
            ${canJoin ? '<button class="btn-primary" id="btn-join">Rejoindre</button>' : ''}
            ${canLeave ? '<button class="btn-secondary" id="btn-leave">Quitter</button>' : ''}
            ${isCreator && nextStatus ? `<button class="btn-primary" id="btn-advance">Passer en ${STATUS_LABELS[nextStatus]}</button>` : ''}
          </div>
        </div>

        <div class="projdet__layout">
          <div class="projdet__members-section">
            <h3 class="projdet__section-title">Membres (${project.members.length} / ${project.max_members})</h3>
            <div class="projdet__members">
              ${project.members.map(m => `
                <div class="projdet__member">
                  <img class="projdet__member-avatar" src="${escapeHTML(m.avatar_url || '')}" alt="${escapeHTML(m.name || m.github_login)}" onerror="this.style.display='none'">
                  <div class="projdet__member-info">
                    <a href="#/u/${escapeHTML(m.github_login)}" class="projdet__member-name">${escapeHTML(m.name || m.github_login)}</a>
                    <span class="projdet__member-role">${m.role === 'lead' ? 'Lead' : 'Membre'}</span>
                  </div>
                  ${isReviewPhase ? `<span class="projdet__member-review-status ${reviewData.reviewerIds.includes(m.id) ? 'projdet__member-review-status--done' : ''}">${reviewData.reviewerIds.includes(m.id) ? '\u2713' : '\u2022'}</span>` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="projdet__info-section">
            <h3 class="projdet__section-title">Infos</h3>
            <div class="projdet__info-grid">
              <div class="projdet__info-item">
                <span class="projdet__info-label">Créé le</span>
                <span class="projdet__info-value">${new Date(project.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              ${project.started_at ? `
              <div class="projdet__info-item">
                <span class="projdet__info-label">Démarré le</span>
                <span class="projdet__info-value">${new Date(project.started_at).toLocaleDateString('fr-FR')}</span>
              </div>` : ''}
              ${project.ended_at ? `
              <div class="projdet__info-item">
                <span class="projdet__info-label">Livré le</span>
                <span class="projdet__info-value">${new Date(project.ended_at).toLocaleDateString('fr-FR')}</span>
              </div>` : ''}
            </div>
          </div>
        </div>

        ${isReviewPhase && isMember ? `
        <div class="projdet__review-section">
          <h3 class="projdet__section-title">Peer Review</h3>
          <p class="projdet__review-intro">${hasReviewed ? 'Tu as déjà soumis tes reviews. Tu peux les modifier.' : 'Évalue tes coéquipiers sur 3 piliers. Sois honnête \u2014 ça impacte leurs scores.'}</p>
          <div class="projdet__reviews" id="review-forms">
            ${teammates.map(m => {
              const existing = myReviewsMap[m.id] || {};
              return `
              <div class="projdet__review-card" data-user-id="${m.id}">
                <div class="projdet__review-card-header">
                  <img class="projdet__member-avatar" src="${escapeHTML(m.avatar_url || '')}" alt="${escapeHTML(m.name || m.github_login)}" onerror="this.style.display='none'">
                  <span class="projdet__review-card-name">${escapeHTML(m.name || m.github_login)}</span>
                </div>
                <div class="projdet__review-card-pillars">
                  ${REVIEW_PILLARS.map(p => `
                    <div class="projdet__review-pillar">
                      <span class="projdet__review-pillar-label">${REVIEW_PILLAR_LABELS[p]}</span>
                      ${renderStars(p, existing[p] || 0)}
                    </div>
                  `).join('')}
                </div>
              </div>`;
            }).join('')}
          </div>
          ${teammates.length > 0 ? '<button class="btn-primary" id="btn-submit-reviews">Soumettre les reviews</button>' : ''}
        </div>` : ''}

        ${project.status === 'shipped' ? `
        <div class="projdet__shipped-banner">
          <span class="projdet__shipped-icon">\u2713</span>
          <div>
            <strong>Projet livré</strong>
            <p>Les scores des membres ont été mis à jour. Consulte les portfolios pour voir la progression.</p>
          </div>
        </div>` : ''}

      </div>
    </section>
  `;

  // Star click handlers
  container.querySelectorAll('.review-stars').forEach(starsEl => {
    starsEl.querySelectorAll('.review-star').forEach(starBtn => {
      starBtn.addEventListener('click', () => {
        const value = parseInt(starBtn.dataset.value);
        starsEl.querySelectorAll('.review-star').forEach((s, i) => {
          s.classList.toggle('review-star--active', i < value);
          s.textContent = i < value ? '\u2605' : '\u2606';
        });
      });
    });
  });

  // Submit reviews
  const btnSubmit = container.querySelector('#btn-submit-reviews');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', async () => {
      const reviewCards = container.querySelectorAll('.projdet__review-card');
      const reviews = [];

      reviewCards.forEach(card => {
        const userId = card.dataset.userId;
        const review = { user_id: userId };
        card.querySelectorAll('.review-stars').forEach(starsEl => {
          const pillar = starsEl.dataset.pillar;
          const active = starsEl.querySelectorAll('.review-star--active').length;
          if (active > 0) review[pillar] = active;
        });
        reviews.push(review);
      });

      // Check at least some ratings were given
      const hasRatings = reviews.some(r => r.collaboration || r.craft || r.velocity);
      if (!hasRatings) {
        showToast('Donne au moins une note', 'error');
        return;
      }

      btnSubmit.disabled = true;
      try {
        const res = await fetch(`/api/projects/${projectId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviews })
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
        showToast('Reviews soumises');
        loadProject(container, projectId);
      } catch (err) {
        showToast(err.message, 'error');
        btnSubmit.disabled = false;
      }
    });
  }

  // Join
  const btnJoin = container.querySelector('#btn-join');
  if (btnJoin) {
    btnJoin.addEventListener('click', async () => {
      btnJoin.disabled = true;
      try {
        const res = await fetch(`/api/projects/${project.id}/join`, { method: 'POST' });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
        showToast('Tu as rejoint le projet');
        loadProject(container, project.id);
      } catch (err) { showToast(err.message, 'error'); btnJoin.disabled = false; }
    });
  }

  // Leave
  const btnLeave = container.querySelector('#btn-leave');
  if (btnLeave) {
    btnLeave.addEventListener('click', async () => {
      btnLeave.disabled = true;
      try {
        const res = await fetch(`/api/projects/${project.id}/leave`, { method: 'POST' });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
        showToast('Tu as quitté le projet');
        loadProject(container, project.id);
      } catch (err) { showToast(err.message, 'error'); btnLeave.disabled = false; }
    });
  }

  // Advance status
  const btnAdvance = container.querySelector('#btn-advance');
  if (btnAdvance && nextStatus) {
    btnAdvance.addEventListener('click', async () => {
      btnAdvance.disabled = true;
      try {
        const res = await fetch(`/api/projects/${project.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus })
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
        showToast(`Projet passé en ${STATUS_LABELS[nextStatus]}`);
        loadProject(container, project.id);
      } catch (err) { showToast(err.message, 'error'); btnAdvance.disabled = false; }
    });
  }
}

export { renderProjectDetail };
