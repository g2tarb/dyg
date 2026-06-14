import { escapeHTML } from '../utils/sanitize.js';
import { t } from '../i18n/index.js';

const PILLARS_KEYS = ['code', 'velocity', 'craft', 'collaboration', 'versatility', 'creativity', 'autonomy', 'ia'];
const PILLARS_ICONS = { code: '{ }', velocity: '>>', craft: '\u25C6', collaboration: '\u26A1', versatility: '\u25CE', creativity: '\u2726', autonomy: '\u25C9', ia: '\u25B3' };

const ARCHETYPES_KEYS = ['architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth'];
const ARCHETYPES_COLORS = { architect: '#3B82F6', shipper: '#22C55E', artisan: '#F5C542', creative: '#A855F7', explorer: '#06B6D4', commando: '#EF4444', mentor: '#F97316', synth: '#EC4899' };

function renderAbout(container) {
  container.innerHTML = `
    <!-- Hero -->
    <section class="about-hero">
      <div class="about-hero__bg"></div>
      <div class="about-hero__content container">
        <span class="about-hero__label">${t('about.hero_label')}</span>
        <h1 class="about-hero__title">${t('about.hero_title').replace('\n', '<br>')}</h1>
        <p class="about-hero__sub">${t('about.hero_sub')}</p>
      </div>
    </section>

    <!-- Manifeste -->
    <section class="about-manifesto container">
      <div class="about-section-label">
        <span class="about-section-label__num">${t('about.manifesto_num')}</span>
        <span class="about-section-label__text">${t('about.manifesto_label')}</span>
      </div>
      <div class="about-manifesto__grid">
        <div class="about-manifesto__text">
          <h2 class="about-manifesto__title">${t('about.manifesto_title').replace('\n', '<br>')}</h2>
          <p class="about-manifesto__p">${t('about.manifesto_p1')}</p>
          <p class="about-manifesto__p">${t('about.manifesto_p2')} <strong>${t('about.manifesto_p2_bold')}</strong></p>
          <p class="about-manifesto__p about-manifesto__p--accent">${t('about.manifesto_accent')}</p>
        </div>
        <div class="about-manifesto__vision">
          <div class="about-vision-card hud-corner">
            <span class="about-vision-card__icon">\u25C6</span>
            <h3 class="about-vision-card__title">${t('about.vision1_title')}</h3>
            <p class="about-vision-card__text">${t('about.vision1_text')}</p>
          </div>
          <div class="about-vision-card hud-corner">
            <span class="about-vision-card__icon">\u25CE</span>
            <h3 class="about-vision-card__title">${t('about.vision2_title')}</h3>
            <p class="about-vision-card__text">${t('about.vision2_text')}</p>
          </div>
          <div class="about-vision-card hud-corner">
            <span class="about-vision-card__icon">\u26A1</span>
            <h3 class="about-vision-card__title">${t('about.vision3_title')}</h3>
            <p class="about-vision-card__text">${t('about.vision3_text')}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Piliers -->
    <section class="about-pillars">
      <div class="container">
        <div class="about-section-label">
          <span class="about-section-label__num">${t('about.pillars_num')}</span>
          <span class="about-section-label__text">${t('about.pillars_label')}</span>
        </div>
        <div class="about-pillars__header">
          <h2 class="about-pillars__title">${t('about.pillars_title')}</h2>
          <p class="about-pillars__sub">${t('about.pillars_sub')}</p>
        </div>
        <div class="about-pillars__grid">
          ${PILLARS_KEYS.map((key, i) => `
            <div class="about-pillar" style="--pillar-delay: ${i * 80}ms;">
              <div class="about-pillar__icon">${PILLARS_ICONS[key]}</div>
              <div class="about-pillar__body">
                <h3 class="about-pillar__name">${escapeHTML(t('pillar.' + key + '.name'))}</h3>
                <p class="about-pillar__desc">${escapeHTML(t('pillar.' + key + '.desc'))}</p>
                <span class="about-pillar__measure">${escapeHTML(t('pillar.' + key + '.measure'))}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Archetypes -->
    <section class="about-archetypes">
      <div class="container">
        <div class="about-section-label">
          <span class="about-section-label__num">${t('about.archetypes_num')}</span>
          <span class="about-section-label__text">${t('about.archetypes_label')}</span>
        </div>
        <div class="about-archetypes__header">
          <h2 class="about-archetypes__title">${t('about.archetypes_title').replace('\n', '<br>')}</h2>
          <p class="about-archetypes__sub">${t('about.archetypes_sub')}</p>
        </div>
        <div class="about-archetypes__list">
          ${ARCHETYPES_KEYS.map((key, i) => `
            <div class="about-archetype ${i % 2 !== 0 ? 'about-archetype--reverse' : ''}" style="--arch-color: ${ARCHETYPES_COLORS[key]};">
              <div class="about-archetype__portrait">
                <img src="/assets/archetypes/${escapeHTML(key)}.png" alt="${escapeHTML(t('archetype.' + key + '.name'))}" class="about-archetype__img">
                <div class="about-archetype__portrait-glow"></div>
              </div>
              <div class="about-archetype__content">
                <span class="about-archetype__tagline">${escapeHTML(t('archetype.' + key + '.tagline'))}</span>
                <h3 class="about-archetype__name">${escapeHTML(t('archetype.' + key + '.name'))}</h3>
                <div class="about-archetype__dominants">
                  <span class="about-archetype__dominant">${escapeHTML(t('archetype.' + key + '.dom1'))}</span>
                  <span class="about-archetype__dominant">${escapeHTML(t('archetype.' + key + '.dom2'))}</span>
                </div>
                <p class="about-archetype__desc">${escapeHTML(t('archetype.' + key + '.desc'))}</p>
                <div class="about-archetype__ideal">
                  <span class="about-archetype__ideal-label">${t('about.archetype_ideal_label')}</span>
                  <span class="about-archetype__ideal-text">${escapeHTML(t('archetype.' + key + '.ideal'))}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Stack technique -->
    <section class="about-tech">
      <div class="container">
        <div class="about-section-label">
          <span class="about-section-label__num">${t('about.tech_num')}</span>
          <span class="about-section-label__text">${t('about.tech_label')}</span>
        </div>
        <div class="about-tech__header">
          <h2 class="about-tech__title">${t('about.tech_title')}</h2>
          <p class="about-tech__sub">${t('about.tech_sub')}</p>
        </div>
        <div class="about-tech__grid">
          <div class="about-tech-card hud-corner">
            <span class="about-tech-card__icon">\u2637</span>
            <h3 class="about-tech-card__name">${t('about.tech_github_name')}</h3>
            <p class="about-tech-card__desc">${t('about.tech_github_desc')}</p>
          </div>
          <div class="about-tech-card hud-corner">
            <span class="about-tech-card__icon">\u2699</span>
            <h3 class="about-tech-card__name">${t('about.tech_scoring_name')}</h3>
            <p class="about-tech-card__desc">${t('about.tech_scoring_desc')}</p>
          </div>
          <div class="about-tech-card hud-corner">
            <span class="about-tech-card__icon">\u25BA</span>
            <h3 class="about-tech-card__name">${t('about.tech_fastify_name')}</h3>
            <p class="about-tech-card__desc">${t('about.tech_fastify_desc')}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Createur -->
    <section class="about-creator container">
      <div class="about-section-label">
        <span class="about-section-label__num">${t('about.creator_num')}</span>
        <span class="about-section-label__text">${t('about.creator_label')}</span>
      </div>
      <div class="about-creator__content">
        <div class="about-creator__identity">
          <h2 class="about-creator__name">${t('about.creator_name')}</h2>
          <span class="about-creator__studio">${t('about.creator_studio')}</span>
        </div>
        <p class="about-creator__bio">${t('about.creator_bio')}</p>
        <div class="about-creator__values">
          <div class="about-creator__value">
            <span class="about-creator__value-num">01</span>
            <span class="about-creator__value-text">${t('about.creator_val1')}</span>
          </div>
          <div class="about-creator__value">
            <span class="about-creator__value-num">02</span>
            <span class="about-creator__value-text">${t('about.creator_val2')}</span>
          </div>
          <div class="about-creator__value">
            <span class="about-creator__value-num">03</span>
            <span class="about-creator__value-text">${t('about.creator_val3')}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="about-cta container">
      <h2 class="about-cta__title">${t('about.cta_title')}</h2>
      <p class="about-cta__sub">${t('about.cta_sub')}</p>
      <div class="about-cta__actions">
        <a href="#/" class="btn-primary btn-primary--lg">${t('common.scan_github')}</a>
      </div>
    </section>
  `;

  // Scroll animations
  const animatedEls = container.querySelectorAll(
    '.about-pillar, .about-archetype, .about-vision-card, .about-pole, .about-tech-card, .about-synergy__axis, .about-creator__value, .about-journey__step'
  );
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('about-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  animatedEls.forEach(el => observer.observe(el));

  return () => {
    observer.disconnect();
  };
}

export { renderAbout };
