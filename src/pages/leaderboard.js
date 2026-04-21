import { escapeHTML } from '../utils/sanitize.js';
import { t } from '../i18n/index.js';
import { getState } from '../store.js';
import { setArchetypeTheme } from '../utils/theme.js';

const DIVISION_COLORS = {
  architect: '#3B82F6',
  shipper: '#22C55E',
  artisan: '#F5C542',
  creative: '#A855F7',
  explorer: '#06B6D4',
  commando: '#EF4444',
  mentor: '#F97316',
  synth: '#EC4899'
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(iso) {
  if (!iso) return null;
  const diff = new Date(iso) - new Date();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

async function fetchJson(url) {
  const res = await fetch(url, { credentials: 'include' });
  if (res.status === 401 || res.status === 409 || res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function renderLeaderboard(container) {
  const user = getState('user');

  container.innerHTML = `
    <section class="lb-page">
      <div class="container">
        <div class="lb-loading">${t('common.loading') || 'Chargement…'}</div>
      </div>
    </section>
  `;

  if (!user) {
    container.innerHTML = `
      <section class="lb-page">
        <div class="container lb-empty">
          <h1 class="lb-empty__title">${t('leaderboard.title')}</h1>
          <p class="lb-empty__text">${t('leaderboard.login_required')}</p>
          <a href="/auth/github" class="btn-primary">${t('common.login')}</a>
        </div>
      </section>
    `;
    return;
  }

  let season, me, board;
  try {
    [season, me, board] = await Promise.all([
      fetchJson('/api/seasons/current'),
      fetchJson('/api/seasons/me'),
      fetchJson('/api/leaderboard')
    ]);
  } catch (err) {
    container.innerHTML = `
      <section class="lb-page">
        <div class="container lb-empty">
          <p class="lb-empty__text">${t('common.error') || 'Une erreur est survenue.'}</p>
        </div>
      </section>
    `;
    return;
  }

  if (!me) {
    container.innerHTML = `
      <section class="lb-page">
        <div class="container lb-empty">
          <h1 class="lb-empty__title">${t('leaderboard.title')}</h1>
          <p class="lb-empty__text">${t('leaderboard.not_enrolled')}</p>
          <a href="#/onboarding" class="btn-primary">${t('common.scan_github')}</a>
        </div>
      </section>
    `;
    return;
  }

  const division = me.division;
  const color = DIVISION_COLORS[division];
  setArchetypeTheme(division);

  const ghPct = Math.min(100, (Number(me.github_points) / 50) * 100);
  const dygPct = Math.min(100, (Number(me.dyg_points) / 50) * 100);
  const totalPct = Math.min(100, (Number(me.total_points) / 100) * 100);
  const remaining = daysUntil(season?.ends_at);

  const divisionName = t(`archetype.${division}`);

  const rows = (board?.leaderboard || []).map((row, i) => {
    const isMe = row.user_id === user.id;
    const rank = Number(row.rank);
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
    return `
      <tr class="lb-row ${isMe ? 'lb-row--me' : ''}">
        <td class="lb-col-rank">
          <span class="lb-rank">${medal || rank}</span>
        </td>
        <td class="lb-col-dev">
          <a href="#/u/${escapeHTML(row.github_login)}" class="lb-dev">
            <img class="lb-avatar" src="${escapeHTML(row.avatar_url || '')}" alt="" onerror="this.style.display='none'">
            <span class="lb-dev__name">${escapeHTML(row.name || row.github_login)}</span>
            ${isMe ? `<span class="lb-you">${t('leaderboard.you')}</span>` : ''}
          </a>
        </td>
        <td class="lb-col-pts lb-col-gh">${Number(row.github_points).toFixed(1)}</td>
        <td class="lb-col-pts lb-col-dyg">${Number(row.dyg_points).toFixed(1)}</td>
        <td class="lb-col-pts lb-col-total">${Number(row.total_points).toFixed(1)}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <section class="lb-page" style="--div-color:${color};">
      <div class="container">

        <header class="lb-header">
          <div class="lb-header__main">
            <span class="lb-header__label">${t('leaderboard.season')}</span>
            <h1 class="lb-header__title">${escapeHTML(season?.name || '')}</h1>
            ${remaining !== null ? `<p class="lb-header__remaining">${remaining} ${t('leaderboard.days_left')}</p>` : ''}
          </div>
          <div class="lb-header__division" style="--arch-color:${color};">
            <span class="lb-header__division-label">${t('leaderboard.division')}</span>
            <span class="lb-header__division-name">${escapeHTML(divisionName)}</span>
          </div>
        </header>

        <div class="lb-me">
          <div class="lb-me__top">
            <div class="lb-me__rank-block">
              <span class="lb-me__rank-label">${t('leaderboard.my_rank')}</span>
              <span class="lb-me__rank">
                <span class="lb-me__rank-n">#${Number(me.division_rank)}</span>
                <span class="lb-me__rank-of">${t('leaderboard.of')} ${Number(me.division_size)}</span>
              </span>
            </div>
            <div class="lb-me__total-block">
              <span class="lb-me__total-label">${t('leaderboard.total')}</span>
              <span class="lb-me__total">${Number(me.total_points).toFixed(1)}<span class="lb-me__total-max">/100</span></span>
            </div>
          </div>

          <div class="lb-bars">
            <div class="lb-bar">
              <div class="lb-bar__head">
                <span class="lb-bar__label">${t('leaderboard.github_pts')}</span>
                <span class="lb-bar__val">${Number(me.github_points).toFixed(1)}/50</span>
              </div>
              <div class="lb-bar__track"><div class="lb-bar__fill lb-bar__fill--gh" style="width:${ghPct}%;"></div></div>
            </div>
            <div class="lb-bar">
              <div class="lb-bar__head">
                <span class="lb-bar__label">${t('leaderboard.dyg_pts')}</span>
                <span class="lb-bar__val">${Number(me.dyg_points).toFixed(1)}/50</span>
              </div>
              <div class="lb-bar__track"><div class="lb-bar__fill lb-bar__fill--dyg" style="width:${dygPct}%;"></div></div>
            </div>
          </div>
        </div>

        <div class="lb-table-wrap">
          <h2 class="lb-table-title">${t('leaderboard.ranking')} — ${escapeHTML(divisionName)}</h2>
          <table class="lb-table">
            <thead>
              <tr>
                <th class="lb-col-rank">#</th>
                <th class="lb-col-dev">${t('leaderboard.col_dev')}</th>
                <th class="lb-col-pts">${t('leaderboard.col_gh')}</th>
                <th class="lb-col-pts">${t('leaderboard.col_dyg')}</th>
                <th class="lb-col-pts">${t('leaderboard.col_total')}</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="5" class="lb-empty-row">${t('leaderboard.empty')}</td></tr>`}
            </tbody>
          </table>
        </div>

        <p class="lb-note">${t('leaderboard.note')}</p>

      </div>
    </section>
  `;
}
