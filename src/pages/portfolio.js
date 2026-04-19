import { createRadarChart, animateRadar, PILLARS_ORDER, PILLAR_LABELS } from '../components/radarChart.js';
import { escapeHTML } from '../utils/sanitize.js';
import { getState } from '../store.js';
import { showToast } from '../components/toast.js';
import { t } from '../i18n/index.js';
import { setArchetypeTheme } from '../utils/theme.js';

function archName(k) { return t(`archetype.${k}`); }
const ARCHETYPE_COLORS = {
  architect: '#3B82F6', shipper: '#22C55E', artisan: '#F5C542',
  creative: '#A855F7', explorer: '#06B6D4', commando: '#EF4444', mentor: '#F97316'
};
function sl(s) { return t(`status.${s}`); }

function renderPortfolio(container, params = {}) {
  const login = params.login;
  if (!login) {
    container.innerHTML = `<p style="padding:var(--space-2xl);color:var(--color-text-dim);">${t('notfound.text')}</p>`;
    return;
  }

  container.innerHTML = `
    <section class="portfolio">
      <div class="container" style="padding-top:var(--space-2xl);">
        <div class="skeleton" style="height:500px;"></div>
      </div>
    </section>
  `;

  loadPortfolio(container, login);
}

async function loadPortfolio(container, login) {
  let data;
  try {
    const res = await fetch(`/api/users/${login}/portfolio`);
    if (!res.ok) throw new Error('Not found');
    data = await res.json();
  } catch {
    container.innerHTML = `
      <section class="portfolio">
        <div class="container" style="padding-top:var(--space-2xl);">
          <div class="empty-state"><p class="empty-state__text">${t('notfound.text')}</p></div>
        </div>
      </section>`;
    return;
  }

  const { user, developer, projects, progression } = data;
  const arch = developer?.archetype;
  if (arch) setArchetypeTheme(arch);
  const archColor = ARCHETYPE_COLORS[arch] || '#E8620A';
  const archLabel = archName(arch);
  const scores = developer?.scores || [];
  const shippedCount = projects.filter(p => p.status === 'shipped').length;

  container.innerHTML = `
    <section class="portfolio">
      <div class="container" style="padding-top:var(--space-2xl);">

        <div class="portfolio__hero" style="--arch-color:${archColor};">
          <div class="portfolio__identity">
            <img class="portfolio__avatar" src="${escapeHTML(user.avatar_url || '')}" alt="${escapeHTML(user.name)}"
                 onerror="this.style.display='none'">
            <div>
              <h1 class="portfolio__name">${escapeHTML(user.name || user.github_login)}</h1>
              <span class="portfolio__login">@${escapeHTML(user.github_login)}</span>
              ${developer ? `<span class="portfolio__archetype" style="color:${archColor};">${escapeHTML(archLabel)}</span>` : ''}
            </div>
          </div>
          <div class="portfolio__actions" id="portfolio-actions"></div>
          <div class="portfolio__stats">
            <div class="portfolio__stat">
              <span class="portfolio__stat-value">${projects.length}</span>
              <span class="portfolio__stat-label">Projects</span>
            </div>
            <div class="portfolio__stat">
              <span class="portfolio__stat-value">${shippedCount}</span>
              <span class="portfolio__stat-label">Shipped</span>
            </div>
            <div class="portfolio__stat">
              <span class="portfolio__stat-value">${progression.length}</span>
              <span class="portfolio__stat-label">Evolutions</span>
            </div>
          </div>
        </div>

        ${developer ? `
        <div class="portfolio__layout">
          <div class="portfolio__radar-section">
            <h2 class="portfolio__section-title">Skills Radar</h2>
            <div id="portfolio-radar"></div>
            <div class="portfolio__scores" id="portfolio-scores"></div>
          </div>

          <div class="portfolio__bio-section">
            ${developer.bio ? `<p class="portfolio__bio">${escapeHTML(developer.bio)}</p>` : ''}
            ${developer.languages && developer.languages.length > 0 ? `
            <div class="portfolio__langs">
              <h3 class="portfolio__langs-title">Languages</h3>
              <div class="portfolio__langs-list">
                ${developer.languages.map(l => `<span class="profile-lang">${escapeHTML(l)}</span>`).join('')}
              </div>
            </div>` : ''}
          </div>
        </div>
        ` : `<p style="color:var(--color-text-dim);padding:var(--space-xl) 0;">${t('portfolio.no_profile')}</p>`}

        <div class="portfolio__projects-section">
          <h2 class="portfolio__section-title">Projects</h2>
          ${projects.length > 0 ? `
          <div class="portfolio__projects">
            ${projects.map(p => {
              const statusColor = p.status === 'shipped' ? '#22C55E' : p.status === 'building' ? '#E8620A' : '#06B6D4';
              return `
              <a href="#/projects/${p.id}" class="portfolio__project" style="--proj-color:${statusColor};">
                <div class="portfolio__project-bar" style="background:${statusColor};"></div>
                <div class="portfolio__project-body">
                  <div class="portfolio__project-top">
                    <h3 class="portfolio__project-name">${escapeHTML(p.name)}</h3>
                    <span class="portfolio__project-status" style="color:${statusColor};">${sl(p.status) || p.status}</span>
                  </div>
                  <p class="portfolio__project-desc">${escapeHTML(p.description || '')}</p>
                  <div class="portfolio__project-meta">
                    <span>${p.member_count || 0} member${(p.member_count || 0) > 1 ? 's' : ''}</span>
                    ${p.ended_at ? `<span>Shipped ${new Date(p.ended_at).toLocaleDateString('en-US')}</span>` : ''}
                  </div>
                </div>
              </a>`;
            }).join('')}
          </div>
          ` : `<p style="color:var(--color-text-dim);">${t('portfolio.no_projects')}</p>`}
        </div>

        ${progression.length > 0 ? `
        <div class="portfolio__progression-section">
          <h2 class="portfolio__section-title">Progression</h2>

          <div class="portfolio__progression">
            ${progression.map(s => `
            <div class="portfolio__snap">
              <span class="portfolio__snap-date">${new Date(s.computed_at).toLocaleDateString('en-US')}</span>
              <span class="portfolio__snap-project">${escapeHTML(s.project_name)}</span>
              ${s.archetype_before !== s.archetype_after ? `
              <span class="portfolio__snap-evolution">
                ${archName(s.archetype_before)} &rarr; ${archName(s.archetype_after)}
              </span>` : ''}
            </div>`).join('')}
          </div>
        </div>` : ''}

      </div>
    </section>
  `;

  // Contact button
  const actionsEl = container.querySelector('#portfolio-actions');
  const currentUser = getState('user');
  if (currentUser && currentUser.id !== user.id) {
    actionsEl.innerHTML = `<button class="btn-primary btn-primary--sm" id="btn-contact">Contact</button>`;
    actionsEl.querySelector('#btn-contact').addEventListener('click', async () => {
      const btn = actionsEl.querySelector('#btn-contact');
      btn.disabled = true;
      try {
        const res = await fetch('/api/messages/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: user.id, body: 'Hey! I found you on DYG.' })
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        showToast('Message sent');
        window.location.hash = `#/messages/${data.conversation_id}`;
      } catch {
        showToast('Failed to send', 'error');
        btn.disabled = false;
      }
    });
  } else if (!currentUser) {
    actionsEl.innerHTML = `<a href="/auth/github" class="btn-primary btn-primary--sm">${t('portfolio.contact_login')}</a>`;
  }

  // Mount radar
  if (developer && scores.length > 0) {
    const radarMount = container.querySelector('#portfolio-radar');
    const radar = createRadarChart(scores, { animate: true, color: archColor, id: 'portfolio-radar-svg' });
    radarMount.appendChild(radar);
    setTimeout(() => animateRadar(radar, 800), 200);

    // Score bars
    const scoresMount = container.querySelector('#portfolio-scores');
    PILLARS_ORDER.forEach(pillar => {
      const sc = scores.find(s => s.pillar === pillar);
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
    setTimeout(() => {
      scoresMount.querySelectorAll('.profile-score-row__fill').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    }, 300);
  }
}

export { renderPortfolio };
