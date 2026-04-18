import { escapeHTML } from '../utils/sanitize.js';

const PILLARS_DATA = [
  { key: 'code', name: 'Code', icon: '{ }', description: 'La base. Nombre de repositories, qualité du code, stars et forks. Un signal direct de production réelle.', measure: 'Repos, stars, forks GitHub' },
  { key: 'velocity', name: 'Vélocité', icon: '>>', description: 'La capacité à livrer, vite et souvent. Pas de réunions interminables, pas de paralysis by analysis.', measure: 'Activité récente (6 derniers mois)' },
  { key: 'craft', name: 'Craft', icon: '\u25C6', description: 'Le souci du détail. Un dev craft ne code pas juste \u2014 il polit. Descriptions, README, qualité perçue.', measure: 'Documentation, polish des repos' },
  { key: 'collaboration', name: 'Collaboration', icon: '\u26A1', description: 'Le jeu en équipe. Forks, contributions, projets partagés. Un dev solo brillant ne fait pas une équipe qui gagne.', measure: 'Forks, contributions croisées' },
  { key: 'versatility', name: 'Polyvalence', icon: '\u25CE', description: 'La diversité des langages et des domaines. Plus le spectre est large, plus le dev s\'adapte.', measure: 'Nombre de langages maîtrisés' },
  { key: 'creativity', name: 'Créativité', icon: '\u2726', description: 'L\'originalité des projets, la capacité à innover au-delà du cadre. Les projets qui n\'existent nulle part ailleurs.', measure: 'Originalité des repositories' },
  { key: 'autonomy', name: 'Autonomie', icon: '\u25C9', description: 'La capacité à produire seul, à documenter, à maintenir du code sans supervision permanente.', measure: 'Repos originaux, documentation' }
];

const ARCHETYPES_DATA = [
  { key: 'architect', name: 'Architecte', color: '#3B82F6', dominants: ['Code', 'Autonomie'], tagline: 'Il construit ce qui dure.', description: 'L\'Architecte pense en systèmes. Il ne code pas une feature \u2014 il code une fondation. Son code tient debout dans 5 ans. Il est le pilier technique de toute équipe sérieuse. Quand un projet déraille structurellement, c\'est lui qu\'on appelle.', ideal: 'Lead technique, architecture de systèmes complexes, projets long terme.' },
  { key: 'shipper', name: 'Shipper', color: '#22C55E', dominants: ['Vélocité', 'Autonomie'], tagline: 'Il livre. Point.', description: 'Le Shipper ne parle pas \u2014 il push. Pas de réunion de 2h, pas de spec de 40 pages. Il prend le ticket, il livre. Son GitHub est un flux continu de commits. C\'est la machine à délivrer de toute équipe performante.', ideal: 'Sprints serrés, MVPs, game jams, prototypage rapide.' },
  { key: 'artisan', name: 'Artisan', color: '#F5C542', dominants: ['Craft', 'Code'], tagline: 'Chaque pixel est une décision.', description: 'L\'Artisan refuse le "ça marche, on passe à la suite". Chaque fonction est poncée, chaque nommage réfléchi. Il est le gardien de la qualité. Son code n\'a pas besoin de commentaires \u2014 il se lit comme de la prose.', ideal: 'Systèmes critiques, code partagé, librairies internes.' },
  { key: 'creative', name: 'Créatif', color: '#A855F7', dominants: ['Créativité', 'Polyvalence'], tagline: 'Il voit ce qui n\'existe pas encore.', description: 'Le Créatif invente avant de construire. Ses projets sont des prototypes de futurs possibles. Il connecte des domaines que personne ne pense à croiser. C\'est lui qui propose la feature que personne n\'a demandée \u2014 mais que tout le monde adopte.', ideal: 'Innovation produit, R&D, expériences interactives, game design.' },
  { key: 'explorer', name: 'Explorateur', color: '#06B6D4', dominants: ['Polyvalence', 'Créativité'], tagline: 'Là où tu spécialises, il connecte.', description: 'L\'Explorateur touche à tout et apprend vite. 6 langages, 4 frameworks, 3 domaines différents. Là où les autres creusent en profondeur, lui tisse en largeur. C\'est le premier à tester une nouvelle techno et le dernier à dire "c\'est pas mon scope".', ideal: 'Équipes pluridisciplinaires, migrations technologiques, projets full-stack.' },
  { key: 'commando', name: 'Commando', color: '#EF4444', dominants: ['Vélocité', 'Collaboration'], tagline: 'Rapide. Collectif. Létal.', description: 'Le Commando combine vitesse et esprit d\'équipe. Il livre vite ET il embarque les autres. En game jam, c\'est le coéquipier que tout le monde veut. Il ne brille pas seul \u2014 il fait briller l\'équipe entière.', ideal: 'Game jams, hackathons, sprints d\'équipe, pair programming.' },
  { key: 'mentor', name: 'Mentor', color: '#F97316', dominants: ['Collaboration', 'Craft'], tagline: 'Son code review vaut de l\'or.', description: 'Le Mentor élève le niveau de toute l\'équipe. Ses pull requests sont des masterclass. Il code propre ET il transmet. Un junior qui travaille avec un Mentor progresse 3x plus vite. C\'est le multiplicateur de force.', ideal: 'Lead d\'équipe, onboarding, code reviews, pair programming senior.' }
];

function renderAbout(container) {
  container.innerHTML = `
    <!-- Hero -->
    <section class="about-hero">
      <div class="about-hero__bg"></div>
      <div class="about-hero__content container">
        <span class="about-hero__label">// QUI SOMMES-NOUS</span>
        <h1 class="about-hero__title">Le recrutement gaming<br>mérite mieux qu'un CV.</h1>
        <p class="about-hero__sub">DYG scanne, profile et compose. Bienvenue dans le recrutement par la data.</p>
      </div>
    </section>

    <!-- Manifeste -->
    <section class="about-manifesto container">
      <div class="about-section-label">
        <span class="about-section-label__num">01</span>
        <span class="about-section-label__text">Le Manifeste</span>
      </div>
      <div class="about-manifesto__grid">
        <div class="about-manifesto__text">
          <h2 class="about-manifesto__title">Le problème est simple.</h2>
          <p class="about-manifesto__p">Tu cherches un dev pour ton jeu. Tu postes une offre. Tu reçois 200 CVs. 80% sont du copier-coller. Les 20% restants, tu ne sais pas les évaluer. Tu fais un entretien. Tu poses des questions génériques. Tu croises les doigts.</p>
          <p class="about-manifesto__p"><strong>Résultat :</strong> tu recrutes au feeling. L'équipe manque de synergie. Le projet prend du retard. Le dev part au bout de 6 mois.</p>
          <p class="about-manifesto__p about-manifesto__p--accent">On peut faire mieux. Beaucoup mieux.</p>
        </div>
        <div class="about-manifesto__vision">
          <div class="about-vision-card hud-corner">
            <span class="about-vision-card__icon">\u25C6</span>
            <h3 class="about-vision-card__title">Data > Déclaratif</h3>
            <p class="about-vision-card__text">Un dev dit qu'il est senior ? Son GitHub le confirme \u2014 ou pas. On ne croit plus les CVs. On scanne.</p>
          </div>
          <div class="about-vision-card hud-corner">
            <span class="about-vision-card__icon">\u25CE</span>
            <h3 class="about-vision-card__title">Profil > CV</h3>
            <p class="about-vision-card__text">7 piliers de compétences. Un archétype. Un radar. Tu sais exactement qui est en face en 3 secondes.</p>
          </div>
          <div class="about-vision-card hud-corner">
            <span class="about-vision-card__icon">\u26A1</span>
            <h3 class="about-vision-card__title">Synergie > Skills</h3>
            <p class="about-vision-card__text">Le meilleur dev du monde ne suffit pas. Ce qui compte, c'est la complémentarité de l'équipe.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Piliers -->
    <section class="about-pillars">
      <div class="container">
        <div class="about-section-label">
          <span class="about-section-label__num">02</span>
          <span class="about-section-label__text">Les 7 Piliers</span>
        </div>
        <div class="about-pillars__header">
          <h2 class="about-pillars__title">7 dimensions. Zéro bullshit.</h2>
          <p class="about-pillars__sub">Chaque développeur est évalué sur 7 piliers de compétences, scorés de 1 à 10 à partir de données réelles.</p>
        </div>
        <div class="about-pillars__grid">
          ${PILLARS_DATA.map((p, i) => `
            <div class="about-pillar" style="--pillar-delay: ${i * 80}ms;">
              <div class="about-pillar__icon">${p.icon}</div>
              <div class="about-pillar__body">
                <h3 class="about-pillar__name">${escapeHTML(p.name)}</h3>
                <p class="about-pillar__desc">${escapeHTML(p.description)}</p>
                <span class="about-pillar__measure">${escapeHTML(p.measure)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Archétypes -->
    <section class="about-archetypes">
      <div class="container">
        <div class="about-section-label">
          <span class="about-section-label__num">03</span>
          <span class="about-section-label__text">Les 7 Archétypes</span>
        </div>
        <div class="about-archetypes__header">
          <h2 class="about-archetypes__title">7 façons de coder.<br>7 identités de dev.</h2>
          <p class="about-archetypes__sub">Chaque développeur est unique. L'archétype capture son ADN : ses 2 piliers dominants définissent son style, sa force, son rôle naturel dans une équipe.</p>
        </div>
        <div class="about-archetypes__list">
          ${ARCHETYPES_DATA.map((a, i) => `
            <div class="about-archetype ${i % 2 !== 0 ? 'about-archetype--reverse' : ''}" style="--arch-color: ${a.color};">
              <div class="about-archetype__portrait">
                <img src="/src/assets/archetypes/${escapeHTML(a.key)}.png" alt="${escapeHTML(a.name)}" class="about-archetype__img">
                <div class="about-archetype__portrait-glow"></div>
              </div>
              <div class="about-archetype__content">
                <span class="about-archetype__tagline">${escapeHTML(a.tagline)}</span>
                <h3 class="about-archetype__name">${escapeHTML(a.name)}</h3>
                <div class="about-archetype__dominants">
                  ${a.dominants.map(d => `<span class="about-archetype__dominant">${escapeHTML(d)}</span>`).join('')}
                </div>
                <p class="about-archetype__desc">${escapeHTML(a.description)}</p>
                <div class="about-archetype__ideal">
                  <span class="about-archetype__ideal-label">Idéal pour :</span>
                  <span class="about-archetype__ideal-text">${escapeHTML(a.ideal)}</span>
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
        <span class="about-section-label__num">04</span>
        <span class="about-section-label__text">La Synergie</span>
      </div>
      <div class="about-synergy__content">
        <h2 class="about-synergy__title">L'équipe > la somme des individus.</h2>
        <p class="about-synergy__text">La synergie DYG mesure la force réelle d'une équipe sur deux axes :</p>
        <div class="about-synergy__axes">
          <div class="about-synergy__axis hud-corner">
            <div class="about-synergy__axis-header">
              <span class="about-synergy__axis-value">0\u2013100%</span>
              <h3 class="about-synergy__axis-name">Couverture</h3>
            </div>
            <p class="about-synergy__axis-desc">Pour chaque pilier, on prend le meilleur score de l'équipe. La couverture, c'est le pourcentage du score maximum théorique (70 points = 7 piliers \u00D7 10). Une équipe qui couvre tous les piliers est une équipe complète.</p>
          </div>
          <div class="about-synergy__axis hud-corner">
            <div class="about-synergy__axis-header">
              <span class="about-synergy__axis-value">+5%</span>
              <h3 class="about-synergy__axis-name">Bonus diversité</h3>
            </div>
            <p class="about-synergy__axis-desc">Chaque archétype unique dans l'équipe ajoute +5% de bonus. Une équipe de 5 Architectes a 0% de bonus. Une équipe avec 5 archétypes différents a +20%. La diversité gagne. Toujours.</p>
          </div>
        </div>
        <div class="about-synergy__formula">
          <span class="about-synergy__formula-label">Formule</span>
          <code class="about-synergy__formula-code">Synergie = min(100, Couverture + Bonus diversité)</code>
        </div>
      </div>
    </section>

    <!-- Stack technique -->
    <section class="about-tech">
      <div class="container">
        <div class="about-section-label">
          <span class="about-section-label__num">05</span>
          <span class="about-section-label__text">La Tech</span>
        </div>
        <div class="about-tech__header">
          <h2 class="about-tech__title">Sous le capot.</h2>
          <p class="about-tech__sub">DYG n'est pas un template. C'est une stack construite pour la performance et l'extensibilité.</p>
        </div>
        <div class="about-tech__grid">
          <div class="about-tech-card hud-corner">
            <span class="about-tech-card__icon">\u2637</span>
            <h3 class="about-tech-card__name">GitHub API</h3>
            <p class="about-tech-card__desc">Scan des profils publics : repos, langages, stars, forks, activité récente. Pas de déclaratif \u2014 des données brutes.</p>
          </div>
          <div class="about-tech-card hud-corner">
            <span class="about-tech-card__icon">\u2699</span>
            <h3 class="about-tech-card__name">Scoring Engine</h3>
            <p class="about-tech-card__desc">Algorithme propriétaire de scoring sur 7 piliers. Chaque heuristique est calibrée sur des données réelles de développeurs.</p>
          </div>
          <div class="about-tech-card hud-corner">
            <span class="about-tech-card__icon">\u25C8</span>
            <h3 class="about-tech-card__name">Gemini AI</h3>
            <p class="about-tech-card__desc">Biographies générées par IA basées sur les stats réelles du dev. Assertives, précises, contextuelles.</p>
          </div>
          <div class="about-tech-card hud-corner">
            <span class="about-tech-card__icon">\u25C6</span>
            <h3 class="about-tech-card__name">Synergie Engine</h3>
            <p class="about-tech-card__desc">Calcul de couverture multi-piliers et bonus de diversité en temps réel. L'équipe est évaluée comme un tout.</p>
          </div>
          <div class="about-tech-card hud-corner">
            <span class="about-tech-card__icon">\u25B2</span>
            <h3 class="about-tech-card__name">Three.js</h3>
            <p class="about-tech-card__desc">D20 interactif, particules, slideshow 3D. L'univers gaming jusque dans l'interface.</p>
          </div>
          <div class="about-tech-card hud-corner">
            <span class="about-tech-card__icon">\u25BA</span>
            <h3 class="about-tech-card__name">Fastify + PostgreSQL</h3>
            <p class="about-tech-card__desc">Backend haute performance. API REST sécurisée. Rate limiting intelligent. Base de données relationnelle avec indexes optimisés.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Créateur -->
    <section class="about-creator container">
      <div class="about-section-label">
        <span class="about-section-label__num">06</span>
        <span class="about-section-label__text">Le Créateur</span>
      </div>
      <div class="about-creator__content">
        <div class="about-creator__identity">
          <h2 class="about-creator__name">Scory</h2>
          <span class="about-creator__studio">4Dayvelopment</span>
        </div>
        <p class="about-creator__bio">Développeur full-stack, passionné par le game dev et les systèmes qui font sens. DYG est né d'une frustration simple : les plateformes de recrutement ne comprennent pas les développeurs de jeux. Elles mesurent des mots-clés, pas des compétences. DYG change la donne.</p>
        <div class="about-creator__values">
          <div class="about-creator__value">
            <span class="about-creator__value-num">01</span>
            <span class="about-creator__value-text">Vanilla JS \u2014 pas de framework inutile</span>
          </div>
          <div class="about-creator__value">
            <span class="about-creator__value-num">02</span>
            <span class="about-creator__value-text">Data-driven \u2014 chaque score est justifié</span>
          </div>
          <div class="about-creator__value">
            <span class="about-creator__value-num">03</span>
            <span class="about-creator__value-text">Gaming DNA \u2014 l'esthétique au service du propos</span>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="about-cta container">
      <h2 class="about-cta__title">Prêt à composer ta dream team ?</h2>
      <p class="about-cta__sub">14 développeurs profilés t'attendent. Explore, compare, compose.</p>
      <div class="about-cta__actions">
        <a href="#/search" class="btn-primary btn-primary--lg">Explorer les devs</a>
        <a href="#/onboarding" class="btn-secondary">Je suis dev</a>
      </div>
    </section>
  `;

  // Scroll animations
  const animatedEls = container.querySelectorAll(
    '.about-pillar, .about-archetype, .about-vision-card, .about-tech-card, .about-synergy__axis, .about-creator__value'
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
