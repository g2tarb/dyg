-- ==========================================
-- DYG Team Project Briefs — By Level
-- Pas de framework. Vanilla only. À la dure.
-- ==========================================

-- ==========================================
-- NIVEAU 1-2 : Sites vitrines statiques (HTML/CSS)
-- ==========================================

INSERT INTO project_briefs (id, title, description, brief, stack, level, deadline_days, max_members, theme, sort_order) VALUES

('ab100000-0000-0000-0000-000000000001',
 'Portfolio Photographe',
 'Un site vitrine pour un photographe professionnel. 3 pages, galerie, animations CSS.',
 'Votre client est un photographe qui veut un site pour montrer son travail.

**Pages requises :**
- Accueil : hero plein écran avec photo de fond, nom, tagline, CTA "Voir mes photos"
- Galerie : grille CSS Grid masonry avec 12+ photos, overlay au hover (titre + catégorie), filtres visuels (Portraits, Nature, Urban)
- Contact : formulaire stylé (nom, email, message), adresse, liens Instagram/Behance

**Exigences techniques :**
- Zéro JavaScript. Tout en HTML/CSS pur.
- Responsive (mobile, tablette, desktop)
- Au moins 3 animations CSS (fade-in au scroll simulé, hover effects, transition de page)
- Google Fonts (2 max), CSS variables pour le thème
- Images : utilisez picsum.photos ou unsplash

**Rôles suggérés :**
- Dev 1 : Page accueil + header/footer communs
- Dev 2 : Page galerie + système de grille
- Dev 3 : Page contact + formulaire
- Dev 4 : Responsive + animations + polish final',
 'html-css', 1, 10, 'professionnel', 1),

('ab100000-0000-0000-0000-000000000002',
 'Landing Page Startup',
 'Une landing page percutante pour une startup fictive. One-page, animations, CTA.',
 'Votre client lance une app de productivité appelée "FlowState". Il veut une landing page qui convertit.

**Sections requises :**
- Hero : titre accrocheur, sous-titre, 2 CTAs (primary + secondary), illustration ou gradient
- Social proof : logos de "clients" (inventés), nombre d''utilisateurs
- Features : 4 cards avec icônes, titre, description
- Pricing : 3 plans (Free, Pro, Enterprise) avec card centrale mise en avant
- Testimonials : 3 citations avec avatar, nom, rôle
- FAQ : 5 questions avec accordéon CSS-only (details/summary ou checkbox hack)
- Footer : liens, newsletter input, copyright

**Exigences :**
- One-page avec navigation qui scroll (ancres #)
- Dark theme avec accent color vif
- Animations : hero slam, stagger sur les cards, hover lift
- Mobile responsive
- Zéro JavaScript',
 'html-css', 1, 10, 'startup', 2),

('ab100000-0000-0000-0000-000000000003',
 'Site Restaurant Gastronomique',
 'Un site élégant pour un restaurant haut de gamme. 4 pages, menu, réservation.',
 'Votre client est le restaurant "Maison Dorée". Il veut un site qui reflète son standing.

**Pages :**
- Accueil : hero vidéo/image, histoire du chef, 3 plats signatures
- Menu : Entrées, Plats, Desserts, Vins. Chaque item : nom, description, prix, icônes (V, GF, Bio)
- Réservation : formulaire (date, heure, couverts, nom, email, allergies), horaires d''ouverture
- Événements : 3 événements à venir (soirée dégustation, brunch, cours de cuisine)

**Exigences :**
- Typographie serif élégante (Playfair Display + Lato)
- Palette : noir, or (#C9A962), blanc cassé
- Animations subtiles et raffinées (pas de flash, pas de bounce)
- Navigation identique sur les 4 pages avec état actif
- Responsive
- Zéro JavaScript',
 'html-css', 2, 12, 'professionnel', 3),

('ab100000-0000-0000-0000-000000000004',
 'Site Agence Créative',
 'Portfolio d''agence avec case studies, équipe, et animations avancées.',
 'Votre client est "Neon Studio", une agence de design digital.

**Pages :**
- Accueil : hero animé (keyframes), services (4 cards), clients (logos défilants CSS), CTA
- Projets : grille de 6 case studies (image, titre, catégorie). Hover : overlay "Voir le projet"
- Équipe : 4 membres avec photo (grayscale → couleur au hover), nom, rôle, liens sociaux
- Contact : split layout (formulaire gauche, carte/infos droite)

**Exigences :**
- Clip-path sur au moins 2 éléments
- Au moins 1 animation @keyframes custom (pas juste des transitions)
- Scroll progress bar en CSS (background gradient sur body)
- Dark mode toggle CSS-only (checkbox hack)
- Stagger animation sur les cards (animation-delay)
- Responsive
- Zéro JavaScript',
 'html-css', 2, 14, 'créatif', 4);

-- ==========================================
-- NIVEAU 3-4 : Sites dynamiques (HTML/CSS/JS vanilla)
-- ==========================================

INSERT INTO project_briefs (id, title, description, brief, stack, level, deadline_days, max_members, theme, sort_order) VALUES

('ab200000-0000-0000-0000-000000000001',
 'Dashboard Météo',
 'Une app météo interactive avec API, géolocalisation, et thème dynamique.',
 'Construisez une app météo complète en vanilla JS.

**Fonctionnalités :**
- Recherche par ville (input + bouton)
- Géolocalisation (bouton "Ma position" → navigator.geolocation)
- Affichage : température, description, humidité, vent, icône météo
- Prévisions : 3-5 prochains jours
- Background qui change selon la météo (soleil = bleu/jaune, pluie = gris, nuit = sombre)
- LocalStorage : sauvegarde la dernière ville
- Unités : toggle Celsius / Fahrenheit

**API :** OpenWeatherMap (gratuit) ou wttr.in (pas de clé)

**Exigences :**
- Vanilla JS uniquement (pas de framework, pas de jQuery)
- Fetch + async/await
- Gestion d''erreurs (ville inexistante → message)
- Loading state visible
- Responsive
- Code structuré en modules (weather.js, ui.js, storage.js)',
 'js-vanilla', 3, 14, 'solopreneur', 5),

('ab200000-0000-0000-0000-000000000002',
 'Gestionnaire de Budget',
 'Une app de suivi de dépenses avec graphiques, catégories, et export.',
 'Construisez un gestionnaire de budget personnel.

**Fonctionnalités :**
- Ajouter une dépense : montant, catégorie (menu déroulant), date, description
- Liste des dépenses avec filtre par catégorie et par mois
- Total par catégorie (barres horizontales en CSS/JS)
- Graphique camembert simple (canvas ou SVG) des dépenses par catégorie
- Budget mensuel : définir un budget max, barre de progression, alerte si dépassé
- Export CSV : bouton qui télécharge un fichier .csv
- LocalStorage : tout persiste entre les sessions

**Exigences :**
- Vanilla JS
- Pas de librairie de graphiques (chart maison en canvas ou SVG)
- Design clean et professionnel
- Responsive
- Code modulaire (budget.js, chart.js, export.js, storage.js)',
 'js-vanilla', 3, 14, 'solopreneur', 6),

('ab200000-0000-0000-0000-000000000003',
 'Quiz App Interactive',
 'Un quiz multi-thèmes avec score, timer, et classement.',
 'Construisez une app de quiz en vanilla JS.

**Fonctionnalités :**
- 3 catégories de quiz (Tech, Culture Générale, Sciences) avec 10 questions chacune
- Timer : 30 secondes par question, barre de progression qui diminue
- Score : +10 points par bonne réponse, +5 bonus si répondu en moins de 10 secondes
- Résultat final : score sur le total, pourcentage, temps moyen par question
- Classement : top 5 des meilleurs scores (LocalStorage)
- Animations : transition entre les questions (slide), feedback visuel (vert/rouge)
- Mode sombre/clair

**Exigences :**
- Questions stockées dans un JSON ou un tableau JS
- Vanilla JS, pas de framework
- Le timer doit être précis (pas de drift)
- Responsive
- Code propre et commenté',
 'js-vanilla', 4, 14, 'créatif', 7),

('ab200000-0000-0000-0000-000000000004',
 'Mini E-commerce Vanilla',
 'Un store en ligne complet avec panier, filtres, et checkout. Zéro framework.',
 'Construisez un mini e-commerce pour "Pixel Store" (gadgets tech).

**Pages / Sections :**
- Catalogue : grille de 12 produits, filtres par catégorie, tri par prix, recherche par nom
- Produit : page détail avec galerie (JS), tailles, couleurs, "Ajouter au panier"
- Panier : slide panel, quantités modifiables, suppression, total, coupon code
- Checkout : formulaire 3 étapes (infos, paiement simulé, confirmation)

**Exigences :**
- Produits dans un fichier data.js (pas d''API)
- Panier en LocalStorage
- Vanilla JS pur
- Design premium (inspiré Apple Store ou Nike)
- Animations fluides sur tout (ajout panier, transitions, hover)
- Responsive
- Code en modules ES (import/export)',
 'js-vanilla', 4, 21, 'professionnel', 8);

-- ==========================================
-- NIVEAU 5-6 : Applications complètes (Full-stack vanilla)
-- ==========================================

INSERT INTO project_briefs (id, title, description, brief, stack, level, deadline_days, max_members, theme, sort_order) VALUES

('ab300000-0000-0000-0000-000000000001',
 'Dashboard Analytics SaaS',
 'Un dashboard d''analytics avec graphiques, KPIs, et données en temps réel.',
 'Construisez un dashboard analytics pour une startup fictive.

**Fonctionnalités :**
- 4 KPI cards en haut (revenus, utilisateurs, conversion, churn) avec tendance ↑↓
- Graphique ligne : revenus sur 12 mois (canvas custom, pas de lib)
- Graphique barres : top 5 sources de trafic
- Tableau : dernières 20 transactions (triable par colonne)
- Filtres : période (7j, 30j, 90j, 12m), comparaison période précédente
- Sidebar : navigation, profil user, dark mode toggle
- Notifications : badge + dropdown avec 5 notifications

**Backend :** Fastify + PostgreSQL (ou données mockées en JSON)

**Exigences :**
- Graphiques dessinés à la main (canvas ou SVG, PAS de Chart.js)
- Données réalistes (générées avec un script seed)
- Responsive (sidebar collapse sur mobile)
- Dark mode
- Vanilla JS + Fastify, zéro framework frontend',
 'fullstack', 5, 21, 'saas', 9),

('ab300000-0000-0000-0000-000000000002',
 'Plateforme de Blog avec CMS',
 'Un blog complet avec système de gestion de contenu, auth, et markdown.',
 'Construisez une plateforme de blog avec un mini-CMS.

**Public (lecteurs) :**
- Liste d''articles (card avec image, titre, extrait, date, auteur)
- Article complet (markdown rendu en HTML, code blocks, images)
- Recherche et filtres par catégorie/tag
- Commentaires (nom + message, pas d''auth pour les lecteurs)

**Admin (CMS) :**
- Login avec mot de passe (JWT)
- Créer/éditer/supprimer des articles (textarea markdown + preview)
- Gérer les catégories et tags
- Modérer les commentaires
- Dashboard : nombre d''articles, commentaires, vues

**Backend :** Fastify + PostgreSQL
**Frontend :** Vanilla JS, markdown-it pour le rendu markdown (seule lib autorisée)

**Exigences :**
- Auth JWT HttpOnly
- SQL paramétrisé (pas d''injection)
- Responsive
- Print stylesheet pour les articles
- SEO : meta tags dynamiques par article',
 'fullstack', 5, 21, 'solopreneur', 10),

('ab300000-0000-0000-0000-000000000003',
 'Outil de Gestion de Projet (mini Trello)',
 'Un board Kanban avec drag & drop, équipes, et temps réel.',
 'Construisez un outil de gestion de projet style Trello simplifié.

**Fonctionnalités :**
- Boards : créer, renommer, supprimer un board
- Colonnes : Todo, In Progress, Review, Done (personnalisables)
- Cards : titre, description, assigné à, priorité (haute/moyenne/basse), date limite
- Drag & drop : déplacer les cards entre colonnes (HTML5 Drag API, pas de lib)
- Filtres : par assigné, par priorité, par deadline
- Auth : login/signup, chaque user voit ses boards
- Temps réel (bonus) : polling toutes les 5s pour voir les changements des autres

**Backend :** Fastify + PostgreSQL

**Exigences :**
- Drag & drop natif HTML5
- Vanilla JS
- Design inspiré Linear/Notion (clean, minimal)
- Responsive
- Pas de framework, pas de Socket.io (polling OK)',
 'fullstack', 6, 28, 'saas', 11),

('ab300000-0000-0000-0000-000000000004',
 'Plateforme de Freelance (mini Malt)',
 'Un marketplace freelance avec profils, missions, et messagerie.',
 'Construisez un marketplace pour freelances.

**Côté Freelance :**
- Profil : photo, bio, compétences (tags), portfolio (3 projets), TJM
- Recherche de missions : filtres par compétence, budget, durée
- Postuler : message de candidature

**Côté Client :**
- Publier une mission : titre, description, budget, durée, compétences requises
- Voir les candidatures, accepter/refuser
- Messagerie avec le freelance choisi

**Système :**
- Auth (JWT) avec 2 rôles (freelance / client)
- Messagerie interne (polling)
- Dashboard : missions en cours, revenus, stats

**Backend :** Fastify + PostgreSQL

**Exigences :**
- 2 rôles avec permissions différentes
- Design professionnel
- Responsive
- Vanilla JS + Fastify
- Zéro framework',
 'fullstack', 6, 28, 'saas', 12);

-- ==========================================
-- NIVEAU 7+ : Projets avancés
-- ==========================================

INSERT INTO project_briefs (id, title, description, brief, stack, level, deadline_days, max_members, theme, sort_order) VALUES

('ab400000-0000-0000-0000-000000000001',
 'Moteur de Particules 3D (Three.js)',
 'Un système de particules interactif avec physique et effets visuels.',
 'Construisez un moteur de particules 3D avec Three.js.

**Fonctionnalités :**
- 5 presets : feu, pluie, neige, explosion, galaxie
- Contrôles : gravité (slider), vent (direction + force), nombre de particules
- Physique : gravité, friction, rebond sur un plan
- Interactivité : la souris influence les particules (attraction/répulsion)
- Performance : instanced mesh pour 10000+ particules à 60fps
- Export : capture screenshot (canvas.toBlob)
- UI : panneau de contrôle avec sliders et boutons

**Exigences :**
- Three.js (seule lib autorisée)
- GLSL custom pour au moins 1 effet (shader)
- Responsive
- Pas de framework UI',
 'threejs', 7, 28, '3d', 13),

('ab400000-0000-0000-0000-000000000002',
 'Raytracer en C',
 'Un raytracer basique qui génère des images 3D en C pur.',
 'Construisez un raytracer qui produit des images PPM.

**Fonctionnalités :**
- Sphères : position, rayon, couleur, réflexion
- Plan : sol avec damier
- Lumière : point light avec ombres
- Camera : position, direction, FOV
- Output : image PPM (format texte simple)
- Scène : configurable via un fichier .scene (format custom simple)

**Étapes :**
1. Rayon primaire (camera → pixel → scène)
2. Intersection rayon-sphère
3. Couleur basique (lambert shading)
4. Ombres (shadow ray)
5. Réflexion (1 rebond)
6. Anti-aliasing (supersampling)

**Exigences :**
- C pur (pas de C++)
- Compilation avec Makefile
- -Wall -Wextra -Werror
- Pas de memory leak (valgrind clean)
- README avec exemples de rendu',
 'c', 8, 28, 'technique', 14),

('ab400000-0000-0000-0000-000000000003',
 'CLI Tool en Python (comme httpie)',
 'Un outil en ligne de commande professionnel avec tests et packaging.',
 'Construisez un CLI tool Python qui analyse un repo GitHub.

**Fonctionnalités :**
- Commande : dyg-scan <username> → affiche les stats du profil
- Output : tableau formaté avec les 7 piliers + archétype
- Options : --json (output JSON), --verbose (détails), --compare <user2>
- Cache : sauvegarde les résultats pendant 1h (SQLite)
- Couleurs : output coloré dans le terminal (ANSI codes)
- Tests : pytest avec 80%+ de couverture

**Packaging :**
- pyproject.toml (pas setup.py)
- Installable avec pip install .
- Entry point CLI défini dans le package

**Exigences :**
- Python 3.10+
- requests pour l''API GitHub
- argparse pour les arguments
- Tests unitaires avec pytest
- Type hints sur toutes les fonctions
- README avec exemples d''utilisation',
 'python', 7, 21, 'technique', 15);

-- ==========================================
-- TIPS pour les projets niveau 1-2 (5 tips par brief)
-- ==========================================

INSERT INTO project_brief_tips (brief_id, sort_order, content) VALUES
('ab100000-0000-0000-0000-000000000001', 1, 'Commencez par la structure HTML commune (header, nav, footer) qui sera identique sur les 3 pages. Un dev s''en charge, les autres attendent.'),
('ab100000-0000-0000-0000-000000000001', 2, 'Pour la galerie masonry : CSS Grid avec grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)). Certaines images span 2 rows.'),
('ab100000-0000-0000-0000-000000000001', 3, 'L''overlay au hover : position relative sur la card, ::after en absolute avec background gradient + opacity 0→1 au hover.'),
('ab100000-0000-0000-0000-000000000001', 4, 'Le formulaire de contact : utilisez des labels flottants (label qui monte au focus) avec la technique :placeholder-shown + ~ label.'),
('ab100000-0000-0000-0000-000000000001', 5, 'Pour le responsive : codez mobile-first. Le CSS de base = mobile. Ajoutez @media (min-width: 768px) pour tablette et (min-width: 1024px) pour desktop.'),

('ab100000-0000-0000-0000-000000000002', 1, 'Le hero slam : @keyframes slam { from { opacity: 0; transform: scale(1.3); filter: blur(8px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }'),
('ab100000-0000-0000-0000-000000000002', 2, 'La card pricing centrale : transform: scale(1.05), z-index: 1, box-shadow plus fort. Badge "Populaire" en position absolute.'),
('ab100000-0000-0000-0000-000000000002', 3, 'L''accordéon FAQ CSS-only : <details><summary>Question</summary><p>Réponse</p></details>. Stylisez le marker avec details summary::marker ou details[open].'),
('ab100000-0000-0000-0000-000000000002', 4, 'Le stagger sur les cards : .card:nth-child(1) { animation-delay: 0ms } .card:nth-child(2) { animation-delay: 100ms } etc.'),
('ab100000-0000-0000-0000-000000000002', 5, 'Navigation smooth scroll : html { scroll-behavior: smooth; } et les liens <a href="#features">Features</a>. Pas besoin de JS.'),

('ab100000-0000-0000-0000-000000000003', 1, 'La palette restaurant : utilisez 3 couleurs max. Noir pour le fond, or (#C9A962) pour les accents, blanc cassé (#F5F0EB) pour le texte.'),
('ab100000-0000-0000-0000-000000000003', 2, 'Le menu : utilisez un <dl> (definition list). <dt> pour le nom + prix (flexbox justify-content: space-between). <dd> pour la description en italic.'),
('ab100000-0000-0000-0000-000000000003', 3, 'Les icônes V/GF/Bio : des <span> avec des lettres stylisées. background: transparent, border: 1px solid, border-radius: 50%, width/height: 20px, font-size: 10px.'),
('ab100000-0000-0000-0000-000000000003', 4, 'Le formulaire de réservation : type="date" et type="time" pour les inputs date/heure. type="number" avec min="1" max="20" pour les couverts.'),
('ab100000-0000-0000-0000-000000000003', 5, 'Les animations subtiles : transition: all 0.3s ease. Pas de bounce, pas de scale excessif. Max translateY(-4px) au hover. C''est un restaurant haut de gamme, pas un jeu vidéo.');
