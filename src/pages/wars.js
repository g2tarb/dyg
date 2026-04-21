import { escapeHTML } from '../utils/sanitize.js';
import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { showToast } from '../components/toast.js';

const DIVISION_COLORS = {
  architect: '#3B82F6', shipper: '#22C55E', artisan: '#F5C542',
  creative: '#A855F7', explorer: '#06B6D4', commando: '#EF4444',
  mentor: '#F97316', synth: '#EC4899'
};

const STATE_LABELS = {
  upcoming: 'À venir',
  staffing: 'Recrutement',
  running: 'En cours',
  judging: 'Notation',
  closed: 'Terminé'
};

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, { credentials: 'include', ...opts });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function daysBetween(from, to) {
  const d = (new Date(to) - new Date(from)) / (24 * 60 * 60 * 1000);
  if (d < 0) return `il y a ${Math.abs(Math.floor(d))}j`;
  if (d < 1) return `${Math.floor(d * 24)}h`;
  return `${Math.floor(d)}j`;
}

export function renderWars(container, params = {}) {
  if (params.id) {
    renderWarDetail(container, params.id);
  } else {
    renderWarsList(container);
  }
}

async function renderWarsList(container) {
  container.innerHTML = `
    <section class="wars-page">
      <div class="container">
        <header class="wars-header">
          <h1 class="wars-title">DYG Wars</h1>
          <p class="wars-sub">${t('wars.sub')}</p>
        </header>
        <div id="wars-current"><div class="wars-skel"></div></div>
        <h2 class="wars-section-title">${t('wars.history')}</h2>
        <div id="wars-list"><div class="wars-skel"></div></div>
      </div>
    </section>
  `;

  try {
    const [currentResp, past] = await Promise.all([
      fetchJson('/api/wars/current'),
      fetchJson('/api/wars?state=closed')
    ]);

    const currentEl = container.querySelector('#wars-current');
    if (currentResp?.war) {
      currentEl.innerHTML = renderWarCard(currentResp.war, currentResp.mine, true);
    } else {
      currentEl.innerHTML = `<div class="wars-empty">${t('wars.no_current')}</div>`;
    }

    const listEl = container.querySelector('#wars-list');
    if (!past || past.length === 0) {
      listEl.innerHTML = `<div class="wars-empty">${t('wars.no_history')}</div>`;
    } else {
      listEl.innerHTML = past.map(w => renderWarCard(w, null, false)).join('');
    }
  } catch {
    container.querySelector('#wars-current').innerHTML = `<div class="wars-empty">${t('common.error')}</div>`;
  }
}

function renderWarCard(war, mine, isCurrent) {
  const stateLabel = STATE_LABELS[war.state] || war.state;
  const aiTag = war.ai_allowed
    ? `<span class="wars-tag wars-tag--ai">IA autorisée</span>`
    : `<span class="wars-tag wars-tag--noai">No IA</span>`;
  const mineBadge = mine
    ? `<span class="wars-tag wars-tag--mine" style="--c:${DIVISION_COLORS[mine.division]};">${escapeHTML(t('archetype.' + mine.division))}</span>`
    : '';
  return `
    <a href="#/wars/${war.id}" class="wars-card ${isCurrent ? 'wars-card--current' : ''}">
      <div class="wars-card__head">
        <span class="wars-card__state wars-card__state--${war.state}">${stateLabel}</span>
        ${aiTag}
        ${mineBadge}
      </div>
      <h3 class="wars-card__title">${escapeHTML(war.title)}</h3>
      <p class="wars-card__brief">${escapeHTML((war.brief || '').slice(0, 160))}${(war.brief || '').length > 160 ? '…' : ''}</p>
      <div class="wars-card__timeline">
        <span>${t('wars.build_ends')}: ${fmtDate(war.deadline_at)}</span>
      </div>
    </a>
  `;
}

async function renderWarDetail(container, warId) {
  container.innerHTML = `
    <section class="wars-page">
      <div class="container">
        <a href="#/wars" class="wars-back">&larr; ${t('wars.back')}</a>
        <div id="war-detail"><div class="wars-skel"></div></div>
      </div>
    </section>
  `;

  async function refresh() {
    try {
      const data = await fetchJson(`/api/wars/${warId}`);
      if (!data) return;
      drawDetail(container, data);
    } catch {
      container.querySelector('#war-detail').innerHTML = `<div class="wars-empty">${t('common.error')}</div>`;
    }
  }

  await refresh();

  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-war-action]');
    if (!btn) return;
    const action = btn.dataset.warAction;
    btn.disabled = true;
    try {
      if (action === 'join')      await post(`/api/wars/${warId}/join`);
      else if (action === 'leave')  await post(`/api/wars/${warId}/leave`);
      else if (action === 'accept-judge') await post(`/api/wars/${warId}/judge/accept`);
      else if (action === 'decline-judge') await post(`/api/wars/${warId}/judge/decline`);
      else if (action === 'submit-deliverable') {
        const teamId = btn.dataset.teamId;
        const repo = container.querySelector('#submit-repo').value.trim() || null;
        const deliverable = container.querySelector('#submit-deliverable').value.trim() || null;
        await post(`/api/wars/${warId}/teams/${teamId}/submit`, { repo_url: repo, deliverable_url: deliverable });
      } else if (action === 'rate') {
        const teamId = btn.dataset.teamId;
        const score = Number(container.querySelector(`#rate-score-${teamId}`).value);
        const comment = container.querySelector(`#rate-comment-${teamId}`).value.trim() || null;
        await post(`/api/wars/${warId}/teams/${teamId}/rate`, { score, comment });
      }
      showToast(t('wars.done'));
      await refresh();
    } catch (err) {
      showToast(err.message || t('common.error'), 'error');
      btn.disabled = false;
    }
  });
}

function drawDetail(container, data) {
  const war = data.war;
  const teams = data.teams || [];
  const user = getState('user');
  const dev = getState('developer');
  const myDivision = dev?.archetype;

  const myTeam = user ? teams.find(tm => (tm.members || []).some(m => m.user_id === user.id)) : null;
  const iAmLead = myTeam?.members?.find(m => m.user_id === user?.id)?.role === 'lead';

  const aiTag = war.ai_allowed
    ? `<span class="wars-tag wars-tag--ai">IA autorisée</span>`
    : `<span class="wars-tag wars-tag--noai">No IA — malus pilier IA</span>`;

  let actions = '';
  if (war.state === 'staffing' && user) {
    actions = myTeam
      ? `<button class="btn-ghost btn-ghost--sm" data-war-action="leave">${t('wars.leave')}</button>`
      : myDivision
        ? `<button class="btn-primary" data-war-action="join">${t('wars.join_division', { division: t('archetype.' + myDivision) })}</button>`
        : `<a href="#/onboarding" class="btn-primary">${t('common.scan_github')}</a>`;
  }

  // Judge panel
  let judgeSection = '';
  if (user && war.state !== 'upcoming' && war.state !== 'staffing') {
    // The detail endpoint doesn't return my judge state, so we check current separately for brevity.
    // (Simplification : we just render the invite if there's no visible team involvement.)
  }

  container.querySelector('#war-detail').innerHTML = `
    <header class="war-head">
      <div class="war-head__tags">
        <span class="war-head__state war-head__state--${war.state}">${STATE_LABELS[war.state]}</span>
        ${aiTag}
      </div>
      <h1 class="war-head__title">${escapeHTML(war.title)}</h1>
      <p class="war-head__brief">${escapeHTML(war.brief)}</p>
      <dl class="war-head__timeline">
        <div><dt>${t('wars.staffing_ends')}</dt><dd>${fmtDate(war.build_starts_at)}</dd></div>
        <div><dt>${t('wars.build_ends')}</dt><dd>${fmtDate(war.deadline_at)}</dd></div>
        <div><dt>${t('wars.judging_ends')}</dt><dd>${fmtDate(war.judging_ends_at)}</dd></div>
      </dl>
      <div class="war-head__actions">${actions}</div>
    </header>

    ${myTeam && war.state === 'running' && iAmLead ? renderLeadSubmit(myTeam) : ''}

    <div class="war-teams">
      ${teams.length === 0
        ? `<div class="wars-empty">${t('wars.no_teams_yet')}</div>`
        : teams.map(tm => renderTeamCard(tm, war, user)).join('')}
    </div>
  `;
}

function renderLeadSubmit(team) {
  return `
    <section class="war-submit">
      <h3 class="war-submit__title">${t('wars.submit_title')}</h3>
      <div class="war-submit__fields">
        <input type="url" class="input" id="submit-repo" placeholder="https://github.com/…" value="${escapeHTML(team.repo_url || '')}">
        <input type="url" class="input" id="submit-deliverable" placeholder="https://live-demo.url" value="${escapeHTML(team.deliverable_url || '')}">
        <button class="btn-primary" data-war-action="submit-deliverable" data-team-id="${team.id}">${t('wars.submit_btn')}</button>
      </div>
    </section>
  `;
}

function renderTeamCard(team, war, user) {
  const color = DIVISION_COLORS[team.division] || 'var(--color-active)';
  const members = team.members || [];
  const distinct = new Set(members.map(m => m.archetype).filter(Boolean)).size;

  const scoreBlock = team.final_score !== null && team.final_score !== undefined
    ? `<div class="war-team__scores">
         <span class="war-team__final ${team.is_winner ? 'war-team__final--win' : ''}">${Number(team.final_score).toFixed(2)}</span>
         <span class="war-team__raw">raw ${Number(team.raw_score || 0).toFixed(1)} × syn ${Number(team.synergy_multiplier).toFixed(2)}${!war.ai_allowed && team.ia_penalty > 0 ? ' × -' + Math.round(team.ia_penalty * 100) + '% IA' : ''}</span>
       </div>`
    : `<div class="war-team__scores">
         <span class="war-team__syn">×${Number(team.synergy_multiplier).toFixed(2)} synergy (${distinct} arch.)</span>
       </div>`;

  const judgingUI = (war.state === 'judging' && user)
    ? `<div class="war-team__judge">
         <input type="number" min="0" max="10" step="0.5" class="input" id="rate-score-${team.id}" placeholder="0-10">
         <input type="text" class="input" id="rate-comment-${team.id}" placeholder="${t('wars.rate_comment_ph')}" maxlength="1000">
         <button class="btn-primary btn-primary--sm" data-war-action="rate" data-team-id="${team.id}">${t('wars.rate_submit')}</button>
       </div>`
    : '';

  return `
    <article class="war-team ${team.is_winner ? 'war-team--winner' : ''}" style="--team-color:${color};">
      <header class="war-team__head">
        <span class="war-team__dot" style="background:${color};"></span>
        <h3 class="war-team__name">${escapeHTML(team.name)}</h3>
        ${team.is_winner ? `<span class="war-team__winner">🏆</span>` : ''}
      </header>
      <ul class="war-team__members">
        ${members.map(m => `
          <li class="war-team__member">
            <img class="war-team__avatar" src="${escapeHTML(m.avatar_url || '')}" alt="" onerror="this.style.display='none'">
            <a href="#/u/${escapeHTML(m.github_login)}" class="war-team__mname">${escapeHTML(m.name || m.github_login)}</a>
            ${m.archetype ? `<span class="war-team__march" style="color:${DIVISION_COLORS[m.archetype] || 'inherit'};">${escapeHTML(t('archetype.' + m.archetype))}</span>` : ''}
            ${m.role === 'lead' ? '<span class="war-team__lead">LEAD</span>' : ''}
          </li>
        `).join('')}
        ${members.length === 0 ? `<li class="war-team__empty">${t('wars.team_empty')}</li>` : ''}
      </ul>
      ${team.deliverable_url ? `<a href="${escapeHTML(team.deliverable_url)}" target="_blank" rel="noopener" class="war-team__link">${t('wars.see_delivery')} →</a>` : ''}
      ${scoreBlock}
      ${judgingUI}
    </article>
  `;
}
