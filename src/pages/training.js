import { getState } from '../store.js';
import { escapeHTML } from '../utils/sanitize.js';
import { showToast } from '../components/toast.js';
import { t } from '../i18n/index.js';

function renderStars(count, max, type) {
  let html = '';
  for (let i = 1; i <= max; i++) {
    html += `<span class="train-star train-star--${type} ${i <= count ? 'train-star--filled' : ''}">\u2605</span>`;
  }
  return html;
}

function renderGrayStars(value) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const filled = value >= i;
    const half = !filled && value >= i - 0.5;
    html += `<span class="train-star train-star--gray ${filled ? 'train-star--filled' : ''} ${half ? 'train-star--half' : ''}">\u2605</span>`;
  }
  return html;
}

async function renderTraining(container, params = {}) {
  const user = getState('user');
  if (!user) {
    container.innerHTML = `
      <section class="training">
        <div class="container" style="padding-top:var(--space-2xl);">
          <div class="empty-state">
            <p class="empty-state__text">${t('training.login_required')}</p>
            <a href="/auth/github" class="btn-primary" style="margin-top:var(--space-md);">${t('common.login')}</a>
          </div>
        </div>
      </section>`;
    return;
  }

  if (params.exerciseId) {
    return renderExercise(container, params.exerciseId);
  }

  // Load tracks
  container.innerHTML = `
    <section class="training">
      <div class="container" style="padding-top:var(--space-2xl);">
        <h2 class="training__title">${t('training.title')}</h2>
        <p class="training__sub">${t('training.sub')}</p>
        <div class="training__progress" id="train-progress"></div>
        <div class="training__tracks" id="train-tracks">
          <div class="skeleton" style="height:200px;"></div>
        </div>
      </div>
    </section>`;

  try {
    const [tracksRes, progressRes] = await Promise.all([
      fetch('/api/training/tracks'),
      fetch('/api/training/my-progress')
    ]);
    const tracks = await tracksRes.json();
    const progress = await progressRes.json();

    // Progress bar
    const progressEl = container.querySelector('#train-progress');
    progressEl.innerHTML = `
      <div class="train-progress-bar">
        <div class="train-progress-stats">
          <span>${t('training.completed')}: <strong>${progress.total_completed}</strong></span>
          <span>${t('training.avg_gold')}: ${renderStars(Math.round(progress.avg_gold), 5, 'gold')}</span>
          <span>${t('training.avg_gray')}: ${renderGrayStars(progress.avg_gray)}</span>
        </div>
      </div>`;

    // Group tracks by language
    const langGroups = {};
    const langOrder = ['htmlcss', 'js', 'js_expert', 'python', 'c', 'shell', 'physics'];

    for (const track of tracks) {
      const name = track.name.toLowerCase();
      let lang = 'other';
      if (name.startsWith('html') || name.startsWith('css') || name.includes('flexbox') || name.includes('grid') || name.includes('responsive') || name.includes('formulaire') || name.includes('animation') || name.startsWith('layout') || name.startsWith('projets finaux')) lang = 'htmlcss';
      else if (name.includes('expert') || name.includes('scope') || name.includes('prototypes') || name.includes('event loop') || name.includes('coercion') || name.includes('metaprogramming')) lang = 'js_expert';
      else if (name.startsWith('js') || name.startsWith('javascript')) lang = 'js';
      else if (name.startsWith('python')) lang = 'python';
      else if (name.startsWith('c —') || name.startsWith('c —')) lang = 'c';
      else if (name.startsWith('shell')) lang = 'shell';
      else if (name.startsWith('math') || name.startsWith('physique') || name.includes('mouvement') || name.includes('collision') || name.includes('forces') || name.includes('simulation')) lang = 'physics';

      if (!langGroups[lang]) langGroups[lang] = [];
      langGroups[lang].push(track);
    }

    // Level labels
    const levelLabel = (l) => t(`training.level_${l}`);

    // Render grouped
    const tracksEl = container.querySelector('#train-tracks');
    let html = '';

    for (const lang of langOrder) {
      const group = langGroups[lang];
      if (!group || group.length === 0) continue;

      html += `<div class="train-lang-group">
        <h3 class="train-lang-title">${t('training.lang_' + lang)}</h3>
        <div class="train-lang-tracks">`;

      html += group.map(track => `
      <div class="train-track">
        <div class="train-track__header">
          <div>
            <span class="train-track__level">${levelLabel(track.level)}</span>
            <h3 class="train-track__name">${escapeHTML(track.name)}</h3>
            <p class="train-track__desc">${escapeHTML(track.description)}</p>
          </div>
          <div class="train-track__stats">
            <span class="train-track__progress">${track.completed}/${track.exercise_count}</span>
            ${track.completed > 0 ? `
              <span>${renderStars(Math.round(track.avg_gold), 5, 'gold')}</span>
              <span>${renderGrayStars(track.avg_gray)}</span>
            ` : ''}
          </div>
        </div>
        <div class="train-track__exercises" id="track-${track.id}" data-track-id="${track.id}">
          <button class="btn-secondary train-track__toggle" data-track="${track.id}">${t('training.show_exercises')}</button>
        </div>
      </div>
    `).join('');
      html += '</div></div>';
    }

    tracksEl.innerHTML = html;

    // Toggle exercises per track
    tracksEl.querySelectorAll('.train-track__toggle').forEach(btn => {
      btn.addEventListener('click', async () => {
        const trackId = btn.dataset.track;
        const container = document.querySelector(`#track-${trackId}`);
        if (container.dataset.loaded) {
          container.querySelector('.train-exercises').classList.toggle('hidden');
          return;
        }

        btn.disabled = true;
        const res = await fetch(`/api/training/tracks/${trackId}/exercises`);
        const exercises = await res.json();
        container.dataset.loaded = 'true';

        const exercisesHtml = exercises.map(ex => {
          const sub = ex.submission;
          const statusClass = sub ? (sub.status === 'submitted' || sub.status === 'reviewed' ? 'done' : 'progress') : 'new';
          return `
            <a href="#/training/${ex.id}" class="train-exercise train-exercise--${statusClass}">
              <div class="train-exercise__info">
                <span class="train-exercise__status-dot"></span>
                <span class="train-exercise__title">${escapeHTML(ex.title)}</span>
              </div>
              <div class="train-exercise__stars">
                ${sub ? `${renderStars(sub.gold_stars, 5, 'gold')} ${renderGrayStars(sub.gray_stars)}` : `<span class="train-exercise__new">${t('training.start')}</span>`}
              </div>
            </a>`;
        }).join('');

        container.innerHTML += `<div class="train-exercises">${exercisesHtml}</div>`;
      });
    });
  } catch {
    container.querySelector('#train-tracks').innerHTML = `<p style="color:var(--color-text-dim);">${t('common.error')}</p>`;
  }
}

async function renderExercise(container, exerciseId) {
  container.innerHTML = `
    <section class="training">
      <div class="container" style="padding-top:var(--space-2xl);">
        <a href="#/training" class="profile-back">&larr; ${t('training.back')}</a>
        <div class="skeleton" style="height:400px;margin-top:var(--space-lg);"></div>
      </div>
    </section>`;

  try {
    const res = await fetch(`/api/training/exercises/${exerciseId}`);
    if (!res.ok) throw new Error();
    const data = await res.json();

    const sub = data.submission;
    const isStarted = !!sub;
    const isSubmitted = sub && (sub.status === 'submitted' || sub.status === 'reviewed');
    const grayStars = sub ? parseFloat(sub.gray_stars) : 5;
    const tipsUsed = sub ? sub.tips_used : 0;

    container.innerHTML = `
      <section class="training">
        <div class="container" style="padding-top:var(--space-2xl);">
          <a href="#/training" class="profile-back">&larr; ${t('training.back')}</a>

          <div class="train-ex__header">
            <h2 class="train-ex__title">${escapeHTML(data.title)}</h2>
            <p class="train-ex__desc">${escapeHTML(data.description)}</p>
            <div class="train-ex__stars-display">
              <span>${t('training.gold')}: ${renderStars(sub?.gold_stars || 0, 5, 'gold')}</span>
              <span>${t('training.gray')}: ${renderGrayStars(grayStars)} <small>(${tipsUsed}/${data.tip_count} tips)</small></span>
            </div>
          </div>

          <div class="train-ex__instructions">
            <h3>${t('training.instructions')}</h3>
            <div class="train-ex__instructions-content">${data.instructions.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
          </div>

          ${data.expected_result ? `
          <div class="train-ex__expected">
            <h3>${t('training.expected')}</h3>
            <p>${escapeHTML(data.expected_result)}</p>
          </div>` : ''}

          <div class="train-ex__tips-section">
            <h3>${t('training.tips_title')} (${tipsUsed}/${data.tip_count})</h3>
            <p class="train-ex__tips-warning">${t('training.tips_warning')}</p>
            <div id="tips-list">
              ${(data.tips_revealed || []).map(tip => `
                <div class="train-tip">
                  <span class="train-tip__num">Tip ${tip.sort_order}</span>
                  <p class="train-tip__content">${escapeHTML(tip.content)}</p>
                </div>
              `).join('')}
            </div>
            ${!isSubmitted && tipsUsed < data.tip_count ? `
              <button class="btn-secondary" id="btn-tip">${t('training.request_tip')} (-0.5 \u2605)</button>
            ` : ''}
          </div>

          ${!isStarted ? `
            <button class="btn-primary btn-primary--lg" id="btn-start">${t('training.start_exercise')}</button>
          ` : ''}

          ${isStarted && !isSubmitted ? `
          <div class="train-ex__submit">
            <h3>${t('training.submit_title')}</h3>
            <input type="text" class="input" id="repo-input" placeholder="${t('training.repo_placeholder')}" value="${sub?.repo_url || ''}">
            <button class="btn-primary" id="btn-submit">${t('training.submit')}</button>
          </div>
          ` : ''}

          ${isSubmitted ? `
          <div class="train-ex__completed">
            <span class="train-ex__completed-icon">\u2713</span>
            <strong>${t('training.completed_label')}</strong>
          </div>
          ` : ''}

        </div>
      </section>`;

    // Start exercise
    const btnStart = container.querySelector('#btn-start');
    if (btnStart) {
      btnStart.addEventListener('click', async () => {
        btnStart.disabled = true;
        await fetch(`/api/training/exercises/${exerciseId}/start`, { method: 'POST' });
        renderExercise(container, exerciseId);
      });
    }

    // Request tip
    const btnTip = container.querySelector('#btn-tip');
    if (btnTip) {
      btnTip.addEventListener('click', async () => {
        btnTip.disabled = true;
        try {
          const res = await fetch(`/api/training/exercises/${exerciseId}/tip`, { method: 'POST' });
          if (!res.ok) throw new Error();
          const tipData = await res.json();
          if (tipData.tip) {
            const tipsList = container.querySelector('#tips-list');
            tipsList.innerHTML += `
              <div class="train-tip train-tip--new">
                <span class="train-tip__num">Tip ${tipData.tip.sort_order}</span>
                <p class="train-tip__content">${escapeHTML(tipData.tip.content)}</p>
              </div>`;
          }
          renderExercise(container, exerciseId); // Refresh stars
        } catch {
          showToast(t('common.error'), 'error');
          btnTip.disabled = false;
        }
      });
    }

    // Submit
    const btnSubmit = container.querySelector('#btn-submit');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', async () => {
        const repoUrl = container.querySelector('#repo-input').value.trim();
        btnSubmit.disabled = true;
        try {
          const res = await fetch(`/api/training/exercises/${exerciseId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ repo_url: repoUrl || null })
          });
          if (!res.ok) throw new Error();
          const result = await res.json();
          showToast(`${t('training.submitted')} — ${result.gold_stars}/5 ★`);
          renderExercise(container, exerciseId);
        } catch {
          showToast(t('common.error'), 'error');
          btnSubmit.disabled = false;
        }
      });
    }
  } catch {
    container.innerHTML = `<div class="empty-state" style="padding:var(--space-4xl);"><p class="empty-state__text">${t('common.error')}</p></div>`;
  }
}

export { renderTraining };
