import { escapeHTML } from '../utils/sanitize.js';

const PILLARS_DATA = [
  { key: 'code', name: 'Code', icon: '{ }', description: 'Le volume et la qualité de production. Chaque repo, chaque commit, chaque star compte. Plus tu codes, plus ce pilier monte.', measure: 'Repos, stars, forks, contributions' },
  { key: 'velocity', name: 'Vélocité', icon: '>>', description: 'Ta capacité à livrer, vite et régulièrement. Les projets terminés dans les temps font grimper ce score. Pas de paralysis by analysis.', measure: 'Activité récente, projets livrés' },
  { key: 'craft', name: 'Craft', icon: '\u25C6', description: 'Le souci du détail. Code propre, documentation soignée, nommage réfléchi. Ce pilier se développe quand tes pairs valident la qualité de ton travail.', measure: 'Reviews positives, documentation, polish' },
  { key: 'collaboration', name: 'Collaboration', icon: '\u26A1', description: 'Le jeu en équipe. Chaque projet collaboratif, chaque contribution croisée renforce ce pilier. Un dev solo brillant ne fait pas une équipe qui gagne.', measure: 'Projets d\'équipe, pair programming' },
  { key: 'versatility', name: 'Polyvalence', icon: '\u25CE', description: 'La diversité des langages et des domaines. Frontend, backend, game engine \u2014 plus tu explores, plus ce pilier s\'élargit.', measure: 'Langages maîtrisés, domaines couverts' },
  { key: 'creativity', name: 'Créativité', icon: '\u2726', description: 'L\'originalité de tes projets. Les concepts qui n\'existent nulle part ailleurs. Ce pilier récompense l\'innovation, pas la reproduction.', measure: 'Concepts innovants, projets originaux' },
  { key: 'autonomy', name: 'Autonomie', icon: '\u25C9', description: 'La capacité à porter un projet seul, documenter, résoudre des problèmes sans qu\'on te tienne la main. Le pilier que 42 valorise le plus.', measure: 'Projets autonomes, initiative, docs' }
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
        <h1 class="about-hero__title">Apprends à la dure.<br>Prouve-le.</h1>
        <p class="about-hero__sub">DYG est la plateforme où les développeurs autodidactes trouvent leur équipe, construisent des vrais projets et forgent un portfolio qui parle plus fort qu'un diplôme.</p>
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
          <h2 class="about-manifesto__title">Le diplôme ne dit rien.<br>Le code dit tout.</h2>
          <p class="about-manifesto__p">Tu veux entrer en 42, Epitech, HETIC ? Ils cherchent pas un CV \u2014 ils cherchent quelqu'un qui sait apprendre, s'adapter, collaborer sous pression. Quelqu'un qui a déjà prouvé qu'il peut livrer.</p>
          <p class="about-manifesto__p">Le problème : comment tu prouves ça quand t'as pas de diplôme, pas de stage, pas de réseau ? Tu codes seul dans ta chambre. T'as un GitHub avec des projets perso. Mais personne pour confirmer que tu sais bosser en équipe. Personne pour dire que tu livres dans les temps. <strong>Personne pour mesurer ta progression.</strong></p>
          <p class="about-manifesto__p about-manifesto__p--accent">DYG comble ce trou. Pas avec des mots. Avec de la data, des vrais projets et des compétences mesurées.</p>
        </div>
        <div class="about-manifesto__vision">
          <div class="about-vision-card hud-corner">
            <span class="about-vision-card__icon">\u25C6</span>
            <h3 class="about-vision-card__title">Progresser > Déclarer</h3>
            <p class="about-vision-card__text">Tes compétences évoluent à chaque projet. Pas de score figé \u2014 un radar qui grandit avec toi.</p>
          </div>
          <div class="about-vision-card hud-corner">
            <span class="about-vision-card__icon">\u25CE</span>
            <h3 class="about-vision-card__title">Collaborer > Coder seul</h3>
            <p class="about-vision-card__text">Le code solo ne suffit plus. Les écoles et les studios cherchent des gens qui savent travailler en équipe.</p>
          </div>
          <div class="about-vision-card hud-corner">
            <span class="about-vision-card__icon">\u26A1</span>
            <h3 class="about-vision-card__title">Prouver > Promettre</h3>
            <p class="about-vision-card__text">Un portfolio de projets réels, avec des métriques de contribution. Pas un CV \u2014 des preuves.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Les 3 Pôles -->
    <section class="about-poles">
      <div class="container">
        <div class="about-section-label">
          <span class="about-section-label__num">02</span>
          <span class="about-section-label__text">Les 3 Pôles</span>
        </div>
        <div class="about-poles__header">
          <h2 class="about-poles__title">3 pôles. Un seul objectif :<br>te rendre inarrêtable.</h2>
          <p class="about-poles__sub">DYG structure ta progression en 3 phases. Chacune te rapproche de ton objectif \u2014 que ce soit une école, un studio, ou ton propre jeu.</p>
        </div>
        <div class="about-poles__list">

          <div class="about-pole">
            <div class="about-pole__header">
              <span class="about-pole__num">01</span>
              <div class="about-pole__icon-wrap about-pole__icon-wrap--find">
                <span class="about-pole__icon">\u25CE</span>
              </div>
            </div>
            <h3 class="about-pole__title">Trouver</h3>
            <p class="about-pole__tagline">Scanne. Profile. Explore.</p>
            <p class="about-pole__desc">Connecte ton GitHub. DYG scanne tes repos, tes langages, ton activité et calcule tes scores sur 7 piliers. Tu découvres ton archétype \u2014 ton identité de dev. Ensuite, explore les profils des autres développeurs. Trouve ceux qui complètent tes forces.</p>
            <div class="about-pole__features">
              <span class="about-pole__feature">Scan GitHub</span>
              <span class="about-pole__feature">7 piliers</span>
              <span class="about-pole__feature">Archétypes</span>
              <span class="about-pole__feature">Radar</span>
              <span class="about-pole__feature">Filtres avancés</span>
            </div>
          </div>

          <div class="about-pole">
            <div class="about-pole__header">
              <span class="about-pole__num">02</span>
              <div class="about-pole__icon-wrap about-pole__icon-wrap--connect">
                <span class="about-pole__icon">\u26A1</span>
              </div>
            </div>
            <h3 class="about-pole__title">Connecter</h3>
            <p class="about-pole__tagline">Forme une équipe qui a du sens.</p>
            <p class="about-pole__desc">Une équipe performante, c'est pas 5 clones du même profil. C'est la diversité qui crée la synergie. DYG mesure la complémentarité en temps réel : couverture des piliers + bonus de diversité. Trouve les devs qui comblent tes lacunes et compose ta dream team.</p>
            <div class="about-pole__features">
              <span class="about-pole__feature">Composition d'équipe</span>
              <span class="about-pole__feature">Synergie temps réel</span>
              <span class="about-pole__feature">Radar d'équipe</span>
              <span class="about-pole__feature">Bonus diversité</span>
            </div>
          </div>

          <div class="about-pole">
            <div class="about-pole__header">
              <span class="about-pole__num">03</span>
              <div class="about-pole__icon-wrap about-pole__icon-wrap--build">
                <span class="about-pole__icon">\u2726</span>
              </div>
            </div>
            <h3 class="about-pole__title">Construire</h3>
            <p class="about-pole__tagline">Le code parle. Le portfolio prouve.</p>
            <p class="about-pole__desc">C'est là que DYG change tout. Pas de tutos YouTube. Pas de todo-list en React. Des vrais projets, avec une vraie équipe, des vraies deadlines. Chaque projet terminé nourrit ton profil : tes scores évoluent, ton archétype peut changer, ton portfolio grossit. Quand un jury 42 regarde ton profil DYG, il voit pas ce que tu dis savoir faire \u2014 il voit ce que tu as fait.</p>
            <div class="about-pole__features">
              <span class="about-pole__feature">Projets collaboratifs</span>
              <span class="about-pole__feature">Suivi de contributions</span>
              <span class="about-pole__feature">Scores évolutifs</span>
              <span class="about-pole__feature">Portfolio partageable</span>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Piliers -->
    <section class="about-pillars">
      <div class="container">
        <div class="about-section-label">
          <span class="about-section-label__num">03</span>
          <span class="about-section-label__text">Les 7 Piliers</span>
        </div>
        <div class="about-pillars__header">
          <h2 class="about-pillars__title">7 axes de progression.</h2>
          <p class="about-pillars__sub">Chaque pilier est un muscle. Plus tu l'utilises, plus il se développe. Le scoring initial vient de ton GitHub. Ensuite, chaque projet le fait évoluer.</p>
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
          <span class="about-section-label__num">04</span>
          <span class="about-section-label__text">Les 7 Archétypes</span>
        </div>
        <div class="about-archetypes__header">
          <h2 class="about-archetypes__title">7 façons de coder.<br>7 identités de dev.</h2>
          <p class="about-archetypes__sub">Chaque développeur est unique. L'archétype capture son ADN : ses 2 piliers dominants définissent son style, sa force, son rôle naturel dans une équipe. Et il peut évoluer \u2014 un Shipper qui polit son craft peut devenir Artisan.</p>
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
        <span class="about-section-label__num">05</span>
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

    <!-- Le Parcours -->
    <section class="about-journey">
      <div class="container">
        <div class="about-section-label">
          <span class="about-section-label__num">06</span>
          <span class="about-section-label__text">Le Parcours</span>
        </div>
        <div class="about-journey__header">
          <h2 class="about-journey__title">Du scan à l'école.</h2>
          <p class="about-journey__sub">Le chemin type d'un dev sur DYG \u2014 de zéro à inarrêtable.</p>
        </div>
        <div class="about-journey__timeline">
          <div class="about-journey__step">
            <span class="about-journey__step-num">01</span>
            <div class="about-journey__step-content">
              <h3 class="about-journey__step-title">Tu scannes ton GitHub</h3>
              <p class="about-journey__step-desc">Ton profil DYG est créé. Tes scores initiaux sont calculés sur les 7 piliers. Tu découvres ton archétype.</p>
            </div>
          </div>
          <div class="about-journey__step">
            <span class="about-journey__step-num">02</span>
            <div class="about-journey__step-content">
              <h3 class="about-journey__step-title">Tu explores les devs</h3>
              <p class="about-journey__step-desc">Tu filtres par archétype, par pilier, par score. Tu trouves des profils complémentaires au tien.</p>
            </div>
          </div>
          <div class="about-journey__step">
            <span class="about-journey__step-num">03</span>
            <div class="about-journey__step-content">
              <h3 class="about-journey__step-title">Tu formes une équipe</h3>
              <p class="about-journey__step-desc">Tu composes ta team. La synergie se calcule en temps réel. Tu optimises la couverture des piliers.</p>
            </div>
          </div>
          <div class="about-journey__step">
            <span class="about-journey__step-num">04</span>
            <div class="about-journey__step-content">
              <h3 class="about-journey__step-title">Vous lancez un projet</h3>
              <p class="about-journey__step-desc">Un vrai projet. Avec des rôles, des deadlines, du code à livrer. Chaque contribution est trackée.</p>
            </div>
          </div>
          <div class="about-journey__step">
            <span class="about-journey__step-num">05</span>
            <div class="about-journey__step-content">
              <h3 class="about-journey__step-title">Tes scores évoluent</h3>
              <p class="about-journey__step-desc">Le projet est livré. Tes piliers montent. Ton archétype peut changer. Ton portfolio s'enrichit.</p>
            </div>
          </div>
          <div class="about-journey__step">
            <span class="about-journey__step-num">06</span>
            <div class="about-journey__step-content">
              <h3 class="about-journey__step-title">Tu postules</h3>
              <p class="about-journey__step-desc">Ton profil DYG parle pour toi. Des projets réels, des métriques de contribution, une progression documentée. Pas un CV \u2014 des preuves.</p>
            </div>
          </div>
        </div>
        <div class="about-journey__schools">
          <p class="about-journey__schools-text">Les écoles comme <strong>42</strong>, <strong>Epitech</strong> et <strong>HETIC</strong> évaluent l'autonomie, la créativité, la collaboration et la capacité à livrer sous pression. Ce sont exactement les 7 piliers DYG. Quand tu arrives avec un profil rempli de projets livrés en équipe, t'as pas besoin de convaincre \u2014 les données le font pour toi.</p>
        </div>
      </div>
    </section>

    <!-- Stack technique -->
    <section class="about-tech">
      <div class="container">
        <div class="about-section-label">
          <span class="about-section-label__num">07</span>
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
            <p class="about-tech-card__desc">Algorithme de scoring sur 7 piliers. Chaque heuristique est calibrée sur des données réelles de développeurs.</p>
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
            <p class="about-tech-card__desc">Backend haute performance. API REST sécurisée. Rate limiting intelligent. Base relationnelle avec indexes optimisés.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Créateur -->
    <section class="about-creator container">
      <div class="about-section-label">
        <span class="about-section-label__num">08</span>
        <span class="about-section-label__text">Le Créateur</span>
      </div>
      <div class="about-creator__content">
        <div class="about-creator__identity">
          <h2 class="about-creator__name">Scory</h2>
          <span class="about-creator__studio">4Dayvelopment</span>
        </div>
        <p class="about-creator__bio">Développeur full-stack, passionné par le game dev et les systèmes qui font sens. DYG est né d'un constat : les autodidactes ont les compétences mais pas les preuves. Les écoles veulent de l'autonomie et de la créativité \u2014 exactement ce que ces devs développent tous les jours dans l'ombre. DYG rend cette progression visible.</p>
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
      <h2 class="about-cta__title">Ton parcours commence maintenant.</h2>
      <p class="about-cta__sub">Scanne ton GitHub. Trouve ton archétype. Rejoins des devs. Construis quelque chose.</p>
      <div class="about-cta__actions">
        <a href="#/onboarding" class="btn-primary btn-primary--lg">Scanner mon GitHub</a>
        <a href="#/search" class="btn-secondary">Explorer les devs</a>
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
