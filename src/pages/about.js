import { escapeHTML } from '../utils/sanitize.js';
import { t } from '../i18n/index.js';

const PILLARS_KEYS = ['code', 'velocity', 'craft', 'collaboration', 'versatility', 'creativity', 'autonomy'];
const PILLARS_ICONS = { code: '{ }', velocity: '>>', craft: '\u25C6', collaboration: '\u26A1', versatility: '\u25CE', creativity: '\u2726', autonomy: '\u25C9' };

const ARCHETYPES_KEYS = ['architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor'];
const ARCHETYPES_COLORS = { architect: '#3B82F6', shipper: '#22C55E', artisan: '#F5C542', creative: '#A855F7', explorer: '#06B6D4', commando: '#EF4444', mentor: '#F97316' };

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

    <!-- Les 3 Poles -->
    <section class="about-poles">
      <div class="container">
        <div class="about-section-label">
          <span class="about-section-label__num">${t('about.poles_num')}</span>
          <span class="about-section-label__text">${t('about.poles_label')}</span>
        </div>
        <div class="about-poles__header">
          <h2 class="about-poles__title">${t('about.poles_title').replace('\n', '<br>')}</h2>
          <p class="about-poles__sub">${t('about.poles_sub')}</p>
        </div>
        <div class="about-poles__list">

          <div class="about-pole">
            <div class="about-pole__header">
              <span class="about-pole__num">01</span>
              <div class="about-pole__icon-wrap about-pole__icon-wrap--find">
                <span class="about-pole__icon">\u25CE</span>
              </div>
            </div>
            <h3 class="about-pole__title">${t('about.pole1_title')}</h3>
            <p class="about-pole__tagline">${t('about.pole1_tagline')}</p>
            <p class="about-pole__desc">${t('about.pole1_desc')}</p>
            <div class="about-pole__features">
              <span class="about-pole__feature">${t('about.pole1_f1')}</span>
              <span class="about-pole__feature">${t('about.pole1_f2')}</span>
              <span class="about-pole__feature">${t('about.pole1_f3')}</span>
              <span class="about-pole__feature">${t('about.pole1_f4')}</span>
              <span class="about-pole__feature">${t('about.pole1_f5')}</span>
            </div>
          </div>

          <div class="about-pole">
            <div class="about-pole__header">
              <span class="about-pole__num">02</span>
              <div class="about-pole__icon-wrap about-pole__icon-wrap--connect">
                <span class="about-pole__icon">\u26A1</span>
              </div>
            </div>
            <h3 class="about-pole__title">${t('about.pole2_title')}</h3>
            <p class="about-pole__tagline">${t('about.pole2_tagline')}</p>
            <p class="about-pole__desc">${t('about.pole2_desc')}</p>
            <div class="about-pole__features">
              <span class="about-pole__feature">${t('about.pole2_f1')}</span>
              <span class="about-pole__feature">${t('about.pole2_f2')}</span>
              <span class="about-pole__feature">${t('about.pole2_f3')}</span>
              <span class="about-pole__feature">${t('about.pole2_f4')}</span>
            </div>
          </div>

          <div class="about-pole">
            <div class="about-pole__header">
              <span class="about-pole__num">03</span>
              <div class="about-pole__icon-wrap about-pole__icon-wrap--build">
                <span class="about-pole__icon">\u2726</span>
              </div>
            </div>
            <h3 class="about-pole__title">${t('about.pole3_title')}</h3>
            <p class="about-pole__tagline">${t('about.pole3_tagline')}</p>
            <p class="about-pole__desc">${t('about.pole3_desc')}</p>
            <div class="about-pole__features">
              <span class="about-pole__feature">${t('about.pole3_f1')}</span>
              <span class="about-pole__feature">${t('about.pole3_f2')}</span>
              <span class="about-pole__feature">${t('about.pole3_f3')}</span>
              <span class="about-pole__feature">${t('about.pole3_f4')}</span>
            </div>
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
                <img src="/src/assets/archetypes/${escapeHTML(key)}.png" alt="${escapeHTML(t('archetype.' + key + '.name'))}" class="about-archetype__img">
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

    <!-- Synergie -->
    <section class="about-synergy container">
      <div class="about-section-label">
        <span class="about-section-label__num">${t('about.synergy_num')}</span>
        <span class="about-section-label__text">${t('about.synergy_label')}</span>
      </div>
      <div class="about-synergy__content">
        <h2 class="about-synergy__title">${t('about.synergy_title')}</h2>
        <p class="about-synergy__text">${t('about.synergy_text')}</p>
        <div class="about-synergy__axes">
          <div class="about-synergy__axis hud-corner">
            <div class="about-synergy__axis-header">
              <span class="about-synergy__axis-value">${t('about.synergy_coverage_value')}</span>
              <h3 class="about-synergy__axis-name">${t('about.synergy_coverage_name')}</h3>
            </div>
            <p class="about-synergy__axis-desc">${t('about.synergy_coverage_desc')}</p>
          </div>
          <div class="about-synergy__axis hud-corner">
            <div class="about-synergy__axis-header">
              <span class="about-synergy__axis-value">${t('about.synergy_diversity_value')}</span>
              <h3 class="about-synergy__axis-name">${t('about.synergy_diversity_name')}</h3>
            </div>
            <p class="about-synergy__axis-desc">${t('about.synergy_diversity_desc')}</p>
          </div>
        </div>
        <div class="about-synergy__formula">
          <span class="about-synergy__formula-label">${t('about.synergy_formula_label')}</span>
          <code class="about-synergy__formula-code">${t('about.synergy_formula_code')}</code>
        </div>
      </div>
    </section>

    <!-- Le Parcours -->
    <section class="about-journey">
      <div class="container">
        <div class="about-section-label">
          <span class="about-section-label__num">${t('about.journey_num')}</span>
          <span class="about-section-label__text">${t('about.journey_label')}</span>
        </div>
        <div class="about-journey__header">
          <h2 class="about-journey__title">${t('about.journey_title')}</h2>
          <p class="about-journey__sub">${t('about.journey_sub')}</p>
        </div>
        <div class="about-journey__timeline">
          <div class="about-journey__step">
            <span class="about-journey__step-num">01</span>
            <div class="about-journey__step-content">
              <h3 class="about-journey__step-title">${t('about.step1_title')}</h3>
              <p class="about-journey__step-desc">${t('about.step1_desc')}</p>
            </div>
          </div>
          <div class="about-journey__step">
            <span class="about-journey__step-num">02</span>
            <div class="about-journey__step-content">
              <h3 class="about-journey__step-title">${t('about.step2_title')}</h3>
              <p class="about-journey__step-desc">${t('about.step2_desc')}</p>
            </div>
          </div>
          <div class="about-journey__step">
            <span class="about-journey__step-num">03</span>
            <div class="about-journey__step-content">
              <h3 class="about-journey__step-title">${t('about.step3_title')}</h3>
              <p class="about-journey__step-desc">${t('about.step3_desc')}</p>
            </div>
          </div>
          <div class="about-journey__step">
            <span class="about-journey__step-num">04</span>
            <div class="about-journey__step-content">
              <h3 class="about-journey__step-title">${t('about.step4_title')}</h3>
              <p class="about-journey__step-desc">${t('about.step4_desc')}</p>
            </div>
          </div>
          <div class="about-journey__step">
            <span class="about-journey__step-num">05</span>
            <div class="about-journey__step-content">
              <h3 class="about-journey__step-title">${t('about.step5_title')}</h3>
              <p class="about-journey__step-desc">${t('about.step5_desc')}</p>
            </div>
          </div>
          <div class="about-journey__step">
            <span class="about-journey__step-num">06</span>
            <div class="about-journey__step-content">
              <h3 class="about-journey__step-title">${t('about.step6_title')}</h3>
              <p class="about-journey__step-desc">${t('about.step6_desc')}</p>
            </div>
          </div>
        </div>
        <div class="about-journey__schools">
          <p class="about-journey__schools-text">${t('about.schools_text')}</p>
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
            <span class="about-tech-card__icon">\u25C8</span>
            <h3 class="about-tech-card__name">${t('about.tech_gemini_name')}</h3>
            <p class="about-tech-card__desc">${t('about.tech_gemini_desc')}</p>
          </div>
          <div class="about-tech-card hud-corner">
            <span class="about-tech-card__icon">\u25C6</span>
            <h3 class="about-tech-card__name">${t('about.tech_synergy_name')}</h3>
            <p class="about-tech-card__desc">${t('about.tech_synergy_desc')}</p>
          </div>
          <div class="about-tech-card hud-corner">
            <span class="about-tech-card__icon">\u25B2</span>
            <h3 class="about-tech-card__name">${t('about.tech_threejs_name')}</h3>
            <p class="about-tech-card__desc">${t('about.tech_threejs_desc')}</p>
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
        <a href="#/onboarding" class="btn-primary btn-primary--lg">${t('common.scan_github')}</a>
        <a href="#/search" class="btn-secondary">${t('common.explore_devs')}</a>
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
