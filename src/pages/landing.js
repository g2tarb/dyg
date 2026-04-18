import { initHeroD20 } from '../three/heroD20.js';
import { escapeHTML } from '../utils/sanitize.js';

let cleanupD20 = null;

const ALL_ARCHETYPES = [
  { key: 'architect', name: 'Architecte', tagline: 'Il construit ce qui dure.', color: '#3B82F6', image: '/src/assets/archetypes/architect.png' },
  { key: 'shipper', name: 'Shipper', tagline: 'Il livre. Point.', color: '#22C55E', image: '/src/assets/archetypes/shipper.png' },
  { key: 'artisan', name: 'Artisan', tagline: 'Chaque pixel est une décision.', color: '#F5C542', image: '/src/assets/archetypes/artisan.png' },
  { key: 'creative', name: 'Créatif', tagline: 'Il voit ce qui n\'existe pas encore.', color: '#A855F7', image: '/src/assets/archetypes/creative.png' },
  { key: 'explorer', name: 'Explorateur', tagline: 'Là où tu spécialises, il connecte.', color: '#06B6D4', image: '/src/assets/archetypes/explorer.png' },
  { key: 'commando', name: 'Commando', tagline: 'Rapide. Collectif. Létal.', color: '#EF4444', image: '/src/assets/archetypes/commando.png' },
  { key: 'mentor', name: 'Mentor', tagline: 'Son code review vaut de l\'or.', color: '#F97316', image: '/src/assets/archetypes/mentor.png' }
];

function renderLanding(container) {
  container.innerHTML = `
    <section class="landing-hero">
      <!-- Video background -->
      <video class="landing-hero__video" id="hero-video" autoplay muted loop playsinline>
        <source src="/src/assets/hero-reel.mp4" type="video/mp4">
      </video>
      <!-- Dark overlay on top of video -->
      <div class="landing-hero__overlay"></div>
      <!-- Three.js D20 on top of overlay -->
      <div class="landing-hero__canvas" id="hero-canvas"></div>
      <!-- Content on top of everything -->
      <div class="landing-hero__content container">
        <h1 class="landing-hero__title">
          <span class="landing-hero__title-main">DYG</span>
          <span class="landing-hero__title-sub">Do Your Game</span>
        </h1>
        <p class="landing-hero__tagline">Ton jeu. La bonne équipe.</p>
        <p class="landing-hero__pitch">
          Les plateformes te demandent de croire un CV.<br>
          <strong>DYG scanne, score et profile.</strong>
        </p>
        <div class="landing-hero__actions" style="display:flex;gap:var(--space-lg);align-items:center;flex-wrap:wrap;justify-content:center;">
          <a href="#/search" class="btn-primary btn-primary--lg landing-hero__cta">Trouve tes devs</a>
          <a href="#/about" class="btn-secondary landing-hero__cta" style="animation:hero-fade-up 0.6s var(--ease-out) 1.1s both;">Découvrir DYG</a>
        </div>
      </div>
    </section>

    <section class="landing-how container">
      <div class="landing-how__header">
        <h2 class="landing-how__title">Comment ça marche</h2>
        <p class="landing-how__sub">3 étapes. Zéro bullshit.</p>
      </div>
      <div class="landing-how__steps">
        <div class="landing-step" id="step-1">
          <span class="landing-step__number">01</span>
          <h3 class="landing-step__title">On scanne</h3>
          <p class="landing-step__desc">GitHub, repos, commits, langages. Pas de déclaratif. Des données.</p>
        </div>
        <div class="landing-step" id="step-2">
          <span class="landing-step__number">02</span>
          <h3 class="landing-step__title">On profile</h3>
          <p class="landing-step__desc">7 piliers, un radar, un archétype. Tu sais exactement qui est en face.</p>
        </div>
        <div class="landing-step" id="step-3">
          <span class="landing-step__number">03</span>
          <h3 class="landing-step__title">Tu composes</h3>
          <p class="landing-step__desc">Drag & drop ta dream team. La synergie se calcule en temps réel.</p>
        </div>
      </div>
    </section>

    <section class="landing-archetypes">
      <div class="container">
        <div class="landing-archetypes__header">
          <h2 class="landing-archetypes__title">7 archétypes. 7 façons de coder.</h2>
          <p class="landing-archetypes__sub">Chaque dev est unique. On le prouve.</p>
        </div>
        <div class="landing-archetypes__grid" id="archetype-grid">
          ${ALL_ARCHETYPES.map((a, i) => `
            <div class="archetype-mini" style="--arch-color: ${a.color}; --arch-delay: ${i * 100}ms;">
              <div class="archetype-mini__img-wrap">
                <img src="${escapeHTML(a.image)}" alt="${escapeHTML(a.name)}" class="archetype-mini__img">
                <div class="archetype-mini__glow"></div>
              </div>
              <div class="archetype-mini__info">
                <span class="archetype-mini__name">${escapeHTML(a.name)}</span>
                <span class="archetype-mini__tagline">${escapeHTML(a.tagline)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <section class="landing-cta-bottom container">
      <h2 class="landing-cta-bottom__title">Stop les CVs. Start le scoring.</h2>
      <p class="landing-cta-bottom__sub">14 devs profilés t'attendent. Compose ta première team.</p>
      <a href="#/search" class="btn-primary btn-primary--lg">Explorer les devs</a>
    </section>
  `;

  // Video — hide fallback if no video file yet
  const video = container.querySelector('#hero-video');
  video.addEventListener('error', () => {
    video.style.display = 'none';
  });

  // Three.js D20 — on top of video + overlay
  requestAnimationFrame(() => {
    const canvas = container.querySelector('#hero-canvas');
    if (canvas && canvas.clientWidth > 0) {
      try { cleanupD20 = initHeroD20(canvas); }
      catch (e) { /* WebGL fallback */ }
    }
  });

  // Scroll animations — steps
  const steps = container.querySelectorAll('.landing-step');
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('landing-step--visible');
        stepObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  steps.forEach(s => stepObserver.observe(s));

  // Scroll animations — archetype cards
  const archCards = container.querySelectorAll('.archetype-mini');
  const archObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('archetype-mini--visible');
        archObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  archCards.forEach(c => archObserver.observe(c));

  return () => {
    if (cleanupD20) cleanupD20();
    cleanupD20 = null;
    stepObserver.disconnect();
    archObserver.disconnect();
    // Pause video on cleanup
    if (video) { video.pause(); video.src = ''; }
  };
}

export { renderLanding };
