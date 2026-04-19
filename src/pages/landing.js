import { escapeHTML } from '../utils/sanitize.js';
import { initHeroOrbs } from '../components/heroOrbs.js';
import { t } from '../i18n/index.js';
import { PILLAR_LABELS, PILLARS_ORDER } from '../components/radarChart.js';
import { ARCHETYPE_DATA } from '../components/archetypeCard.js';

const ARCHETYPES = [
  { key: 'architect', name: 'Architect', color: '#3B82F6', image: '/assets/archetypes/architect.png' },
  { key: 'shipper', name: 'Shipper', color: '#22C55E', image: '/assets/archetypes/shipper.png' },
  { key: 'artisan', name: 'Artisan', color: '#F5C542', image: '/assets/archetypes/artisan.png' },
  { key: 'creative', name: 'Creative', color: '#A855F7', image: '/assets/archetypes/creative.png' },
  { key: 'explorer', name: 'Explorer', color: '#06B6D4', image: '/assets/archetypes/explorer.png' },
  { key: 'commando', name: 'Commando', color: '#EF4444', image: '/assets/archetypes/commando.png' },
  { key: 'mentor', name: 'Mentor', color: '#F97316', image: '/assets/archetypes/mentor.png' }
];

function renderLanding(container) {
  container.innerHTML = `
    <!-- HERO = THE SCAN -->
    <section class="tj-hero">
      <canvas class="tj-hero__canvas" id="hero-canvas"></canvas>
      <div class="tj-hero__overlay"></div>
      <div class="tj-hero__center">
        <span class="tj-hero__logo-mark">DYG</span>
        <span class="tj-hero__badge">Alpha — Early Access</span>
        <h1 class="tj-hero__title">${t('landing.hero_title')}</h1>
        <p class="tj-hero__subtitle">${t('landing.hero_sub')}</p>

        <!-- Scan input -->
        <div class="tj-hero__scan" id="tj-scan">
          <div class="tj-hero__scan-row">
            <input type="text" class="tj-hero__input" id="hero-github-input" placeholder="${t('landing.scan_placeholder')}" autocomplete="off" spellcheck="false">
            <button class="btn-primary btn-primary--lg tj-hero__scan-btn" id="hero-scan-btn">${t('landing.scan_btn')}</button>
          </div>
          <p class="tj-hero__error" id="hero-scan-error" style="display:none;"></p>
          <div class="tj-hero__progress" id="hero-scan-progress" style="display:none;">
            <div class="tj-hero__bar"><div class="tj-hero__bar-fill" id="hero-scan-bar"></div></div>
            <p class="tj-hero__step" id="hero-scan-step"></p>
          </div>
        </div>

        <!-- Result card (hidden until scan) -->
        <div class="tj-hero__result" id="tj-scan-result" style="display:none;">
          <div class="tj-result-card" id="tj-result-card">
            <div class="tj-result-card__header" id="tj-result-header"></div>
            <div class="tj-result-card__scores" id="tj-result-scores"></div>
            <div class="tj-result-card__actions">
              <a href="#/onboarding" class="btn-primary">${t('landing.scan_full')}</a>
              <button class="btn-secondary" id="tj-rescan-btn">${t('landing.scan_btn')}</button>
            </div>
          </div>
        </div>

        <a href="#section-features" class="tj-hero__scroll"><span>&#8595;</span></a>
      </div>
    </section>

    <!-- STATS BAR -->
    <section class="tj-stats">
      <div class="container tj-stats__grid">
        <div class="tj-stat">
          <span class="tj-stat__number">8</span>
          <span class="tj-stat__label">${t('landing.stat_pillars')}</span>
        </div>
        <div class="tj-stat">
          <span class="tj-stat__number">150+</span>
          <span class="tj-stat__label">${t('landing.stat_exercises')}</span>
        </div>
        <div class="tj-stat">
          <span class="tj-stat__number">7</span>
          <span class="tj-stat__label">${t('landing.stat_archetypes')}</span>
        </div>
        <div class="tj-stat">
          <span class="tj-stat__number">11</span>
          <span class="tj-stat__label">${t('landing.stat_projects')}</span>
        </div>
      </div>
    </section>

    <!-- FEATURES GRID -->
    <section class="tj-features" id="section-features">
      <div class="container">
        <div class="tj-section-header">
          <span class="tj-section-label">Features</span>
          <h2 class="tj-section-title">${t('landing.tagline')}</h2>
          <p class="tj-section-sub">${t('landing.pitch')}</p>
        </div>
        <div class="tj-features__grid">
          <div class="tj-feature-card">
            <div class="tj-feature-card__icon" style="background: rgba(59, 130, 246, 0.1); color: #3B82F6;">&#9781;</div>
            <h3 class="tj-feature-card__title">GitHub Scan</h3>
            <p class="tj-feature-card__desc">${t('landing.feature_scan')}</p>
          </div>
          <div class="tj-feature-card">
            <div class="tj-feature-card__icon" style="background: rgba(232, 98, 10, 0.1); color: #E8620A;">&#9733;</div>
            <h3 class="tj-feature-card__title">7 Archetypes</h3>
            <p class="tj-feature-card__desc">${t('landing.archetypes_sub')}</p>
          </div>
          <div class="tj-feature-card">
            <div class="tj-feature-card__icon" style="background: rgba(245, 197, 66, 0.1); color: #F5C542;">&#9881;</div>
            <h3 class="tj-feature-card__title">Dual Rating</h3>
            <p class="tj-feature-card__desc">${t('landing.feature_dual')}</p>
          </div>
          <div class="tj-feature-card">
            <div class="tj-feature-card__icon" style="background: rgba(34, 197, 94, 0.1); color: #22C55E;">&#9776;</div>
            <h3 class="tj-feature-card__title">Team Projects</h3>
            <p class="tj-feature-card__desc">${t('landing.step2_desc')}</p>
          </div>
          <div class="tj-feature-card">
            <div class="tj-feature-card__icon" style="background: rgba(168, 85, 247, 0.1); color: #A855F7;">&#10003;</div>
            <h3 class="tj-feature-card__title">Peer Review</h3>
            <p class="tj-feature-card__desc">${t('landing.step3_desc')}</p>
          </div>
          <div class="tj-feature-card">
            <div class="tj-feature-card__icon" style="background: rgba(6, 182, 212, 0.1); color: #06B6D4;">&#9670;</div>
            <h3 class="tj-feature-card__title">Public Portfolio</h3>
            <p class="tj-feature-card__desc">${t('landing.feature_portfolio')}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ARCHETYPES -->
    <section class="tj-archetypes">
      <div class="container">
        <div class="tj-section-header">
          <span class="tj-section-label">Archetypes</span>
          <h2 class="tj-section-title">${t('landing.archetypes_title')}</h2>
          <p class="tj-section-sub">${t('landing.archetypes_sub')}</p>
        </div>
        <div class="tj-archetypes__grid">
          ${ARCHETYPES.map(a => `
            <a href="#/archetype/${a.key}" class="tj-archetype" style="--arch-color: ${a.color};">
              <div class="tj-archetype__img-wrap">
                <img src="${escapeHTML(a.image)}" alt="${escapeHTML(a.name)}" class="tj-archetype__img" loading="lazy">
              </div>
              <span class="tj-archetype__name">${escapeHTML(t('archetype.' + a.key))}</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA BOTTOM -->
    <section class="tj-cta">
      <div class="container tj-cta__content">
        <h2 class="tj-cta__title">${t('landing.cta_bottom_title')}</h2>
        <p class="tj-cta__sub">${t('landing.cta_bottom_sub')}</p>
        <a href="#top" class="btn-primary btn-primary--lg" id="cta-scroll-top">${t('landing.cta_find')}</a>
      </div>
    </section>
  `;

  // ===== MINI SCAN LOGIC =====
  const heroInput = container.querySelector('#hero-github-input');
  const heroBtn = container.querySelector('#hero-scan-btn');
  const heroError = container.querySelector('#hero-scan-error');
  const heroProgress = container.querySelector('#hero-scan-progress');
  const heroBar = container.querySelector('#hero-scan-bar');
  const heroStep = container.querySelector('#hero-scan-step');
  const scanWidget = container.querySelector('#tj-scan');
  const scanResult = container.querySelector('#tj-scan-result');
  const resultHeader = container.querySelector('#tj-result-header');
  const resultScores = container.querySelector('#tj-result-scores');
  const rescanBtn = container.querySelector('#tj-rescan-btn');
  const ctaScrollTop = container.querySelector('#cta-scroll-top');

  const SCAN_STEPS = [
    t('onboarding.step1'),
    t('onboarding.step2'),
    t('onboarding.step3'),
    t('onboarding.step4')
  ];

  async function heroScan() {
    const username = heroInput.value.trim();
    if (!username) {
      heroError.textContent = t('onboarding.error');
      heroError.style.display = 'block';
      return;
    }
    heroError.style.display = 'none';
    heroBtn.disabled = true;
    heroInput.disabled = true;
    heroProgress.style.display = 'block';

    const apiCall = fetch('/api/onboarding/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ github_username: username })
    });

    for (let i = 0; i < SCAN_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 350 + Math.random() * 250));
      heroBar.style.width = ((i + 1) / SCAN_STEPS.length * 100) + '%';
      heroStep.textContent = SCAN_STEPS[i];
    }

    let data;
    try {
      const res = await apiCall;
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Profile not found');
      }
      data = await res.json();
    } catch (err) {
      heroProgress.style.display = 'none';
      heroBtn.disabled = false;
      heroInput.disabled = false;
      heroError.textContent = err.message;
      heroError.style.display = 'block';
      return;
    }

    heroBar.style.width = '100%';

    // Build result card
    const arch = ARCHETYPE_DATA[data.archetype] || { name: data.archetype_name, color: data.archetype_color };
    const resultCard = container.querySelector('#tj-result-card');
    resultCard.style.setProperty('--arch-color', arch.color);

    resultHeader.innerHTML = `
      <img class="tj-result-card__avatar" src="${escapeHTML(data.avatar_url || '')}" alt="" onerror="this.style.display='none'">
      <div class="tj-result-card__identity">
        <span class="tj-result-card__name">${escapeHTML(data.name || data.username)}</span>
        <span class="tj-result-card__archetype" style="color:${escapeHTML(arch.color)};">${escapeHTML(arch.name)}</span>
        ${data.secondary_archetype ? `<span class="tj-result-card__secondary">${t('archetype.' + data.secondary_archetype)}${data.tertiary_archetype ? ' / ' + t('archetype.' + data.tertiary_archetype) : ''}</span>` : ''}
      </div>
    `;

    resultScores.innerHTML = '';
    for (const pillar of PILLARS_ORDER) {
      const sc = data.scores.find(s => s.pillar === pillar);
      const value = sc ? sc.score : 0;
      const row = document.createElement('div');
      row.className = 'tj-result-card__row';
      row.innerHTML = `
        <span class="tj-result-card__pillar">${PILLAR_LABELS[pillar]}</span>
        <div class="tj-result-card__bar-track"><div class="tj-result-card__bar-fill" style="width:0%;background:${escapeHTML(arch.color)};"></div></div>
        <span class="tj-result-card__val">${value}</span>
      `;
      resultScores.appendChild(row);
    }

    // Transition: hide scan, show result
    await new Promise(r => setTimeout(r, 300));
    scanWidget.style.display = 'none';
    scanResult.style.display = 'block';

    // Animate score bars
    await new Promise(r => setTimeout(r, 80));
    resultScores.querySelectorAll('.tj-result-card__bar-fill').forEach((bar, i) => {
      const sc = data.scores.find(s => s.pillar === PILLARS_ORDER[i]);
      const value = sc ? sc.score : 0;
      setTimeout(() => {
        bar.style.width = (value * 10) + '%';
      }, i * 80);
    });
  }

  function resetScan() {
    scanResult.style.display = 'none';
    scanWidget.style.display = 'block';
    heroProgress.style.display = 'none';
    heroBar.style.width = '0%';
    heroBtn.disabled = false;
    heroInput.disabled = false;
    heroInput.value = '';
    heroInput.focus();
  }

  heroBtn.addEventListener('click', heroScan);
  heroInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') heroScan();
  });
  rescanBtn.addEventListener('click', resetScan);

  // Bottom CTA scrolls to top + focus input
  ctaScrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      if (scanResult.style.display !== 'none') resetScan();
      heroInput.focus();
    }, 500);
  });

  // Auto-focus input on load
  requestAnimationFrame(() => heroInput.focus());

  // ===== SCROLL ANIMATIONS =====
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('tj-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  container.querySelectorAll('.tj-feature-card, .tj-archetype, .tj-stat').forEach(el => observer.observe(el));

  // ===== HERO ORBS =====
  const heroCanvas = container.querySelector('#hero-canvas');
  const cleanupOrbs = heroCanvas ? initHeroOrbs(heroCanvas) : null;

  return () => {
    observer.disconnect();
    if (cleanupOrbs) cleanupOrbs();
  };
}

export { renderLanding };
