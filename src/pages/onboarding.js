import { PILLAR_LABELS, PILLARS_ORDER } from '../components/radarChart.js';
import { createRadarChart, animateRadar } from '../components/radarChart.js';
import { ARCHETYPE_DATA } from '../components/archetypeCard.js';
import { escapeHTML } from '../utils/sanitize.js';
import { getState, checkAuth } from '../store.js';

import { t } from '../i18n/index.js';

function getScanSteps() {
  return [
    t('onboarding.scanning'),
    t('onboarding.scanning'),
    t('onboarding.scanning'),
    t('onboarding.scanning'),
    t('onboarding.scanning'),
    t('onboarding.scanning')
  ];
}

function renderOnboarding(container) {
  container.innerHTML = `
    <section class="onboarding">
      <div class="container">
        <div class="onboarding-layout">

          <div class="onboarding-left">
            <h2 class="onboarding-title">${t('onboarding.title')}</h2>
            <p class="onboarding-subtitle">${t('onboarding.sub')}</p>

            <div class="onboarding-auth-cta" id="auth-cta" style="display:none;margin-bottom:var(--space-xl);">
              <a href="/auth/github" class="btn-primary" style="gap:var(--space-sm);">
                ${t('onboarding.connect_github')}
              </a>
              <p style="color:var(--color-text-dim);font-size:0.75rem;margin-top:var(--space-sm);">${t('onboarding.connect_sub')}</p>
            </div>

            <div class="onboarding-input-group" id="input-group">
              <div class="onboarding-input-row">
                <input type="text" class="input onboarding-input" id="github-input" placeholder="${t('onboarding.placeholder')}" autocomplete="off" spellcheck="false">
                <button class="btn-primary" id="btn-scan">${t('onboarding.scan')}</button>
              </div>
              <p class="input-error-msg" id="error-msg" style="display:none;"></p>
            </div>

            <!-- Scan animation (hidden by default) -->
            <div class="onboarding-scan" id="scan-zone" style="display:none;">
              <div class="scan-progress">
                <div class="scan-progress__bar" id="scan-bar"></div>
              </div>
              <p class="scan-step" id="scan-step"></p>
              <div class="scan-scores" id="scan-scores"></div>
            </div>
          </div>

          <div class="onboarding-right">
            <!-- Card reveal zone -->
            <div class="onboarding-card-zone" id="card-zone">
              <div class="card-flip" id="card-flip">
                <div class="card-flip__inner" id="card-inner">
                  <!-- Back (face cachée) -->
                  <div class="card-flip__back">
                    <div class="card-back-content">
                      <span class="card-back-logo">DYG</span>
                      <span class="card-back-sub">DO YOUR GAME</span>
                    </div>
                  </div>
                  <!-- Front (archétype révélé) -->
                  <div class="card-flip__front" id="card-front">
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Results (hidden until scan complete) -->
        <div class="onboarding-results" id="results-zone" style="display:none;">
          <div class="onboarding-results__bio" id="result-bio"></div>
          <div class="onboarding-results__radar" id="result-radar"></div>
          <div class="onboarding-results__langs" id="result-langs"></div>
        </div>

      </div>
    </section>
  `;

  const input = container.querySelector('#github-input');
  const btnScan = container.querySelector('#btn-scan');
  const errorMsg = container.querySelector('#error-msg');
  const scanZone = container.querySelector('#scan-zone');
  const scanBar = container.querySelector('#scan-bar');
  const scanStep = container.querySelector('#scan-step');
  const scanScores = container.querySelector('#scan-scores');
  const cardFlip = container.querySelector('#card-flip');
  const cardInner = container.querySelector('#card-inner');
  const cardFront = container.querySelector('#card-front');
  const resultsZone = container.querySelector('#results-zone');
  const resultBio = container.querySelector('#result-bio');
  const resultRadar = container.querySelector('#result-radar');
  const resultLangs = container.querySelector('#result-langs');
  const inputGroup = container.querySelector('#input-group');

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    input.classList.add('input--error');
  }

  function clearError() {
    errorMsg.style.display = 'none';
    input.classList.remove('input--error');
  }

  async function simulateScan(onProgress) {
    for (let i = 0; i < getScanSteps().length; i++) {
      await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
      onProgress(i, getScanSteps()[i]);
    }
  }

  async function startScan() {
    const username = input.value.trim();
    if (!username) {
      showError(t('onboarding.error'));
      return;
    }

    clearError();
    btnScan.disabled = true;
    btnScan.classList.add('btn-primary--disabled');
    input.disabled = true;

    // Show scan zone
    scanZone.style.display = 'block';
    scanScores.innerHTML = '';
    scanBar.style.width = '0%';

    // Start scan animation + API call in parallel
    const apiCall = fetch('/api/onboarding/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ github_username: username })
    });

    // Animate scan steps
    await simulateScan((step, label) => {
      const progress = ((step + 1) / getScanSteps().length) * 100;
      scanBar.style.width = progress + '%';
      scanStep.textContent = label;
    });

    // Wait for API result
    let data;
    try {
      const res = await apiCall;
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Profil non trouvé');
      }
      data = await res.json();
    } catch (err) {
      scanZone.style.display = 'none';
      btnScan.disabled = false;
      btnScan.classList.remove('btn-primary--disabled');
      input.disabled = false;
      showError(err.message || 'Ce profil GitHub n\'existe pas.');
      return;
    }

    // Complete progress
    scanBar.style.width = '100%';
    scanStep.textContent = t('onboarding.done');

    // If authenticated, save profile to server
    const currentUser = getState('user');
    if (currentUser && data.username.toLowerCase() === currentUser.github_login.toLowerCase()) {
      try {
        await fetch('/api/onboarding/save-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            avatar_url: data.avatar_url,
            bio: data.bio,
            archetype: data.archetype,
            languages: data.languages,
            scores: data.scores
          })
        });
        await checkAuth(); // Refresh developer profile in store
      } catch { /* save is best-effort */ }
    }

    // Reveal scores one by one
    for (const pillar of PILLARS_ORDER) {
      const sc = data.scores.find(s => s.pillar === pillar);
      const value = sc ? sc.score : 0;

      await new Promise(r => setTimeout(r, 150));

      const row = document.createElement('div');
      row.className = 'scan-score-row';
      row.innerHTML = `
        <span class="scan-score-row__label">${PILLAR_LABELS[pillar]}</span>
        <div class="scan-score-row__bar">
          <div class="scan-score-row__fill" style="width:0%;"></div>
        </div>
        <span class="scan-score-row__value">${value}/10</span>
      `;
      scanScores.appendChild(row);

      // Animate bar
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          row.querySelector('.scan-score-row__fill').style.width = (value * 10) + '%';
        });
      });
    }

    // Wait then reveal archetype card
    await new Promise(r => setTimeout(r, 800));

    // Build card front
    const archData = ARCHETYPE_DATA[data.archetype] || { name: data.archetype_name, color: data.archetype_color, description: data.archetype_description };

    cardFront.innerHTML = `
      <div class="card-revealed" style="--archetype-color:${escapeHTML(archData.color)};">
        <div class="card-revealed__portrait">
          <img
            src="${escapeHTML(data.avatar_url || '')}"
            alt="${escapeHTML(data.name)}"
            onerror="this.style.display='none'"
          >
          <div class="card-revealed__fallback">${escapeHTML((data.name || '?').charAt(0))}</div>
        </div>
        <div class="card-revealed__info">
          <span class="card-revealed__archetype" style="color:${escapeHTML(archData.color)};">${escapeHTML(archData.name)}</span>
          <span class="card-revealed__name">${escapeHTML(data.name || data.username)}</span>
        </div>
      </div>
    `;

    // Trigger flip
    cardInner.classList.add('card-flip__inner--flipped');

    // Show results below
    await new Promise(r => setTimeout(r, 1000));
    resultsZone.style.display = 'block';

    // Bio
    resultBio.innerHTML = `
      <h3 style="font-size:1.25rem;color:var(--color-text);margin-bottom:var(--space-sm);">Bio générée par IA</h3>
      <p style="color:var(--color-text-dim);line-height:1.6;">${escapeHTML(data.bio || '')}</p>
    `;

    // Langs
    resultLangs.innerHTML = `
      <h3 style="font-size:1.25rem;color:var(--color-text);margin-bottom:var(--space-sm);">Langages détectés</h3>
      <div class="profile-langs">
        ${(data.languages || []).map(l => `<span class="profile-lang">${escapeHTML(l)}</span>`).join('')}
      </div>
    `;

    // Radar
    resultRadar.innerHTML = '';
    const radar = createRadarChart(data.scores, { animate: true, id: 'onboarding-radar' });
    resultRadar.appendChild(radar);
    setTimeout(() => animateRadar(radar, 800), 200);
  }

  btnScan.addEventListener('click', startScan);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startScan();
  });

  // Auth-aware behavior
  const user = getState('user');
  const authCta = container.querySelector('#auth-cta');

  if (user) {
    // If user already has a profile, redirect to their portfolio
    const existingDev = getState('developer');
    if (existingDev) {
      window.location.hash = `#/u/${user.github_login}`;
      return;
    }
    // User is logged in but no profile — pre-fill and auto-scan
    input.value = user.github_login;
    authCta.style.display = 'none';
    requestAnimationFrame(() => startScan());
  } else {
    // Show OAuth CTA, let user scan any username manually
    authCta.style.display = 'block';
    requestAnimationFrame(() => input.focus());
  }
}

export { renderOnboarding };
