-- ==========================================
-- DYG Training Curriculum — Inspired by Believemy structure
-- 9 tracks, 30 exercises, 150 tips
-- ==========================================

-- TRACKS
INSERT INTO training_tracks (id, name, description, level, sort_order) VALUES
('t1000000-0000-0000-0000-000000000001', 'HTML — Les bases', 'Structure de page, balises sémantiques, liens, images. Les fondations de tout site web.', 1, 1),
('t2000000-0000-0000-0000-000000000001', 'CSS — Les bases', 'Couleurs, typographie, borders, box model, positions. Donne vie à ton HTML.', 1, 2),
('t3000000-0000-0000-0000-000000000001', 'CSS — Apparences dynamiques', 'Hover, focus, pseudo-classes, pseudo-éléments, variables CSS. Le CSS interactif.', 2, 3),
('t4000000-0000-0000-0000-000000000001', 'Layout — Flexbox', 'Aligne, distribue, ordonne. Flexbox est ton outil de mise en page quotidien.', 2, 4),
('t5000000-0000-0000-0000-000000000001', 'Layout — CSS Grid', 'Grilles 2D puissantes. Colonnes, lignes, zones. Le layout moderne.', 2, 5),
('t6000000-0000-0000-0000-000000000001', 'Responsive Design', 'Media queries, unités relatives, mobile-first. Ton site doit marcher partout.', 2, 6),
('t7000000-0000-0000-0000-000000000001', 'Formulaires & Tableaux', 'Inputs, validations CSS, tables. Les composants essentiels du web.', 3, 7),
('t8000000-0000-0000-0000-000000000001', 'Animations CSS', 'Keyframes, transitions, transforms. Donne du mouvement à tes interfaces.', 3, 8),
('t9000000-0000-0000-0000-000000000001', 'Projets finaux', 'Sites complets multi-pages. Restaurant, blog, e-commerce, portfolio. Le boss final.', 3, 9);

-- ==========================================
-- TRACK 1: HTML — Les bases (4 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e1010000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001',
 'Ma première page HTML',
 'Crée une page HTML valide avec un titre, des paragraphes et des liens.',
 'Crée un fichier index.html avec :

1. **DOCTYPE et structure** : <!DOCTYPE html>, <html lang="fr">, <head> avec <meta charset>, <title>, et <body>
2. **Contenu** : Un <h1> avec ton nom, un <h2> "À propos", un paragraphe de présentation
3. **Liens** : 3 liens <a> vers tes sites préférés (target="_blank")
4. **Listes** : Une liste ordonnée <ol> de tes 5 langages préférés et une liste non-ordonnée <ul> de tes hobbies
5. **Sémantique** : Utilise <header>, <main>, <footer> pour structurer la page

Pas de CSS. Juste du HTML pur et propre.',
 'Une page HTML valide qui passe le validateur W3C. Structure sémantique claire. Contenu lisible même sans style.',
 1, 1, '{"code"}'),

('e1020000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001',
 'Les images et les figures',
 'Maîtrise les images : formats, attributs alt, figures avec légendes.',
 'Crée une page "Galerie photo" avec :

1. **6 images** : utilise https://picsum.photos/400/300?random=N (change N pour chaque image)
2. **Attributs** : chaque <img> doit avoir alt, width, height, loading="lazy"
3. **Figures** : enveloppe 3 images dans <figure> avec <figcaption>
4. **Favicon** : ajoute un favicon avec <link rel="icon">
5. **Image de fond** : une section <div> avec une image de fond en inline style (background-image)

Bonus : ajoute une image avec <picture> et <source> pour différentes tailles.',
 'Une page galerie avec des images bien décrites (alt text), des figures avec légendes, et un favicon visible.',
 1, 2, '{"code","craft"}'),

('e1030000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001',
 'Navigation multi-pages',
 'Crée 3 pages HTML liées entre elles avec une navigation commune.',
 'Crée un mini-site de 3 pages :

**index.html** (Accueil) :
- Navigation avec 3 liens (Accueil, Recettes, Contact)
- Un <h1> "Mes Recettes"
- 3 cartes de recettes (image + titre + courte description + lien "Voir la recette")

**recette.html** (Recette) :
- Même navigation
- Titre de la recette, image, ingrédients (<ul>), étapes (<ol>)
- Lien retour vers l''accueil

**contact.html** (Contact) :
- Même navigation
- Adresse, email, téléphone dans un <address>
- Un formulaire basique (juste le HTML, pas de style)

Les 3 pages doivent se lier entre elles avec des liens relatifs.',
 'Un site de 3 pages naviguable. La navigation fonctionne sur chaque page. Les liens relatifs sont corrects.',
 1, 3, '{"code","autonomy"}'),

('e1040000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001',
 'HTML sémantique avancé',
 'Balises sémantiques, tableaux, médias. Tout le HTML moderne.',
 'Crée une page "CV en ligne" avec :

1. **Structure sémantique** : <header>, <nav>, <main>, <article>, <section>, <aside>, <footer>
2. **Tableau** : un tableau <table> avec ton parcours (année, formation/poste, description)
3. **Vidéo** : intègre une vidéo YouTube avec <iframe> (ou <video> avec source)
4. **Détails** : utilise <details> et <summary> pour des sections dépliables (FAQ)
5. **Metadata** : <meta name="description">, <meta name="author">, balises Open Graph
6. **Accessibilité** : attributs aria-label sur la nav, role="main", lang="fr"

Le HTML doit passer le validateur W3C avec 0 erreurs.',
 'Un CV en ligne avec une structure HTML parfaite. Accessible, sémantique, avec des balises modernes.',
 1, 4, '{"code","craft","autonomy"}');

-- ==========================================
-- TRACK 2: CSS — Les bases (4 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e2010000-0000-0000-0000-000000000001', 't2000000-0000-0000-0000-000000000001',
 'Couleurs, typo et backgrounds',
 'Les fondamentaux visuels : couleurs, polices Google Fonts, arrière-plans.',
 'Reprends ta page "Mes Recettes" (Track 1) et ajoute du style :

1. **Couleurs** : définis un scheme de 4 couleurs (fond, texte, accent, secondaire). Utilise les variables CSS : --color-bg, --color-text, --color-accent, --color-secondary
2. **Typographie** : importe 2 polices Google Fonts (une pour les titres, une pour le texte). Applique font-size, line-height (1.6), letter-spacing
3. **Arrière-plans** : fond de page avec background-color, une section avec un gradient (linear-gradient)
4. **Liens** : style les liens sans soulignement, couleur accent, qui changent au survol
5. **Texte** : text-transform: uppercase sur les titres, text-align: center sur le hero

Utilise un fichier style.css séparé, pas de style inline.',
 'Un site avec une identité visuelle cohérente. Les couleurs sont harmonieuses, la typo est lisible, les backgrounds donnent de la profondeur.',
 1, 1, '{"craft"}'),

('e2020000-0000-0000-0000-000000000001', 't2000000-0000-0000-0000-000000000001',
 'Borders et border-radius',
 'Maîtrise les bordures : styles, coins arrondis, outlines.',
 'Crée une page "Cartes de profil" avec 4 cartes :

1. **Carte 1** : border simple (1px solid), border-radius: 8px
2. **Carte 2** : border-left: 4px solid accent (style barre latérale)
3. **Carte 3** : border-radius: 50% sur l''avatar (cercle parfait)
4. **Carte 4** : border: none + box-shadow pour l''effet "elevation"
5. **Chaque carte** : image, nom, rôle, 3 tags, un bouton
6. **Hover** : au survol, border-color change avec transition

Bonus : une carte avec un border gradient (border-image ou pseudo-element trick).',
 'Quatre cartes avec des styles de bordures différents. Chaque carte est élégante et le hover est fluide.',
 1, 2, '{"craft","creativity"}'),

('e2030000-0000-0000-0000-000000000001', 't2000000-0000-0000-0000-000000000001',
 'Le Box Model : margin, padding, dimensions',
 'Comprends le modèle de boîte CSS. Margin, padding, width, height, box-sizing.',
 'Crée une page "Dashboard" avec :

1. **Container** : max-width: 1200px, margin: 0 auto, padding: 0 24px
2. **Header** : hauteur fixe (60px), padding interne, box-shadow en bas
3. **3 colonnes** : chacune avec padding interne (24px), margin entre elles (16px gap)
4. **Cards** : dans chaque colonne, 2-3 cards avec padding: 16px 24px, margin-bottom: 16px
5. **Boutons** : padding: 8px 24px, pas de margin par défaut
6. **box-sizing** : TOUT le document doit avoir box-sizing: border-box (via *, *::before, *::after)

Utilise la console développeur Chrome pour vérifier visuellement le box model de chaque élément.',
 'Un layout de dashboard où chaque élément a des espacements cohérents. Aucun overflow, aucun élément qui déborde.',
 1, 3, '{"code","craft"}'),

('e2040000-0000-0000-0000-000000000001', 't2000000-0000-0000-0000-000000000001',
 'Positions : relative, absolute, fixed, sticky',
 'Les 4 modes de positionnement CSS. Quand utiliser lequel.',
 'Crée une page avec 4 sections qui démontrent chaque position :

1. **Section relative** : un parent relative avec un enfant positionné en top: -10px (badge "NEW" sur une card)
2. **Section absolute** : une image avec un overlay texte en absolute (bottom: 0, left: 0) — titre sur l''image
3. **Section fixed** : un bouton "Retour en haut" fixé en bas à droite (bottom: 24px, right: 24px)
4. **Section sticky** : un header de section qui reste collé en haut quand on scroll (position: sticky, top: 0)
5. **Z-index** : un élément qui passe devant un autre au survol (z-index: 10 on hover)

Chaque section doit avoir assez de contenu pour scroller.',
 'Une page qui démontre les 4 positions CSS. Le sticky fonctionne, le fixed reste en place, les absolutes sont bien positionnés.',
 2, 4, '{"code","autonomy"}');

-- ==========================================
-- TRACK 3: CSS Apparences dynamiques (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e3010000-0000-0000-0000-000000000001', 't3000000-0000-0000-0000-000000000001',
 'Hover, active, focus et transitions',
 'Rends ton interface interactive avec les pseudo-classes et les transitions CSS.',
 'Crée une page "UI Kit" avec ces composants interactifs :

1. **Bouton primaire** : hover (translateY(-2px) + box-shadow), active (translateY(0) + shadow réduit), focus-visible (outline accent)
2. **Bouton secondaire** : border only, hover (background fill + couleur texte change)
3. **Lien de navigation** : underline qui grandit de gauche à droite au hover (pseudo-element + width 0→100%)
4. **Card** : hover (lift + ombre + border-color change), transition: all 0.3s ease
5. **Input** : focus (border-color change + box-shadow glow), transition fluide
6. **Image** : hover (scale 1.05 dans un container overflow:hidden)

TOUTES les transitions doivent être fluides (transition: all 0.2s ease ou ease-out).',
 'Un UI kit où chaque élément réagit au survol, au clic, et au focus. Tout est fluide, rien ne saute.',
 2, 1, '{"craft","creativity"}'),

('e3020000-0000-0000-0000-000000000001', 't3000000-0000-0000-0000-000000000001',
 'Pseudo-éléments et CSS avancé',
 'Maîtrise ::before, ::after, :nth-child, et les sélecteurs avancés.',
 'Crée une page "Timeline" (frise chronologique) :

1. **Timeline verticale** : une ligne centrale en ::before sur le container (position absolute, width: 2px)
2. **Points sur la ligne** : chaque item a un ::before circulaire (12px) positionné sur la ligne
3. **Alternance** : items pairs à gauche, impairs à droite (:nth-child(odd/even))
4. **Dates** : en ::after sur chaque item, affichées avec content: attr(data-date)
5. **Dernier item** : :last-child a un style spécial (accent color, plus gros point)
6. **Custom list** : une liste <ul> où les puces sont remplacées par des emojis via li::before { content: "✦"; }

Pas de JavaScript. Tout en CSS pur.',
 'Une timeline verticale élégante avec alternance gauche/droite, des points sur la ligne, et des dates. Tout en pseudo-éléments.',
 2, 2, '{"code","craft","creativity"}'),

('e3030000-0000-0000-0000-000000000001', 't3000000-0000-0000-0000-000000000001',
 'Variables CSS et thème dark/light',
 'CSS custom properties, :root, et toggle de thème sans JavaScript.',
 'Crée une page "Blog post" avec un toggle dark/light mode :

1. **Variables** : définis tout dans :root (--bg, --text, --accent, --surface, --border, --radius, --shadow)
2. **Dark mode** : un <input type="checkbox" id="theme-toggle"> caché + un <label>. Quand coché : input:checked ~ .page { --bg: #0a0a0f; --text: #e2e8f0; ... }
3. **Le blog post** : titre, date, auteur, contenu avec sous-titres, une citation <blockquote> stylée, un bloc de code <pre><code>
4. **Sidebar** : "Articles populaires" (3 liens), "Tags" (badges)
5. **Tout doit changer** entre les deux thèmes via les variables — AUCUNE propriété hardcodée

Le switch doit être fluide (transition: background 0.3s, color 0.3s sur body).',
 'Un blog post qui switch parfaitement entre dark et light mode. Les variables CSS font tout le travail.',
 2, 3, '{"craft","autonomy","creativity"}');

-- ==========================================
-- TRACK 4: Flexbox (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e4010000-0000-0000-0000-000000000001', 't4000000-0000-0000-0000-000000000001',
 'Flexbox — Les fondamentaux',
 'Conteneur flex, direction, wrap, justify-content, align-items.',
 'Crée 5 mini-layouts sur la même page, chacun dans une section :

1. **Navigation horizontale** : <nav> avec 5 liens en flex, justify-content: space-between, align-items: center
2. **Cards en ligne** : 3 cards côte à côte, flex-wrap: wrap, gap: 16px, chaque card en flex: 1 1 300px
3. **Centrage parfait** : un div de 200x200px parfaitement centré (display: flex, justify-content: center, align-items: center) avec un texte dedans
4. **Footer multi-colonnes** : 4 colonnes (Logo, Liens, Contact, Newsletter), flex-wrap sur mobile
5. **Sidebar + contenu** : aside (width: 250px, flex-shrink: 0) + main (flex: 1)

Chaque section doit avoir un titre <h2> qui explique quel concept flexbox est utilisé.',
 'Cinq layouts différents qui démontrent chacun un aspect de flexbox. Tout est aligné, distribué correctement.',
 2, 1, '{"code"}'),

('e4020000-0000-0000-0000-000000000001', 't4000000-0000-0000-0000-000000000001',
 'Flexbox — Navbar responsive',
 'Construis une barre de navigation professionnelle qui s''adapte au mobile.',
 'Crée une navbar complète :

**Desktop (> 768px)** :
- Logo à gauche
- Liens au centre (flex: 1, justify-content: center)
- Bouton "Sign up" à droite
- Hauteur fixe 64px, fond semi-transparent, backdrop-filter: blur

**Mobile (< 768px)** :
- Logo à gauche, icône burger à droite
- Les liens deviennent un menu vertical (flex-direction: column)
- Le menu est caché par défaut, visible quand le burger est cliqué (CSS checkbox hack)
- Animation slide-down sur le menu mobile (max-height: 0 → max-height: 300px)

CSS-only. Pas de JavaScript.',
 'Une navbar qui passe de horizontale à burger menu sur mobile. Le toggle fonctionne en CSS pur avec le checkbox hack.',
 2, 2, '{"code","craft","versatility"}'),

('e4030000-0000-0000-0000-000000000001', 't4000000-0000-0000-0000-000000000001',
 'Flexbox — Pricing cards',
 'Crée 3 cartes de pricing avec mise en avant de l''offre centrale.',
 'Crée une section pricing avec 3 plans :

1. **3 cards** côte à côte en flex, la card centrale est plus grande (transform: scale(1.05) + z-index + shadow)
2. **Chaque card** : nom du plan, prix (gros), liste de features (✓ vert / ✗ gris), bouton CTA
3. **Card centrale** : badge "Populaire" en position absolute, couleur accent, border accent
4. **Hover** : toutes les cards liftent au survol
5. **Responsive** : en colonne sur mobile, la card centrale reste mise en avant (order: -1 pour la mettre en premier)

La typographie du prix doit être impressionnante : gros chiffre + petit "/mois".',
 'Une section pricing qui ressemble à Stripe ou Linear. La card centrale attire l''oeil. Responsive impeccable.',
 2, 3, '{"craft","creativity"}');

-- ==========================================
-- TRACK 5: CSS Grid (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e5010000-0000-0000-0000-000000000001', 't5000000-0000-0000-0000-000000000001',
 'CSS Grid — Dashboard layout',
 'Construis un layout de dashboard avec sidebar, header, et grille de widgets.',
 'Crée un dashboard admin :

1. **Layout principal** : CSS Grid avec grid-template-areas: "sidebar header" "sidebar main"
2. **Sidebar** : 200px fixe, fond sombre, liens de navigation verticaux
3. **Header** : hauteur 60px, search bar + avatar user
4. **Main** : grille de 4 widgets (2x2) avec grid-template-columns: repeat(2, 1fr), gap: 16px
5. **Widgets** : chacun avec un titre, un chiffre gros, un mini graphique (juste des barres en div)
6. **Responsive** : sur mobile, sidebar disparaît, widgets passent en 1 colonne

Utilise grid-template-areas avec des noms explicites.',
 'Un dashboard qui ressemble à Vercel ou Linear. Sidebar fixe, grille propre, responsive.',
 2, 1, '{"code","craft"}'),

('e5020000-0000-0000-0000-000000000001', 't5000000-0000-0000-0000-000000000001',
 'CSS Grid — Masonry gallery',
 'Crée une galerie photo masonry avec des images de hauteurs variées.',
 'Crée une galerie photo "Luna Studio" :

1. **Grid** : grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))
2. **Masonry** : certaines cards span 2 rows (.card:nth-child(3n) { grid-row: span 2; })
3. **Overlay** : au hover, un gradient overlay avec le titre et la catégorie
4. **Categories** : boutons filtre en haut (All, Nature, Urban, Portrait) — juste visuels
5. **Lightbox feel** : au hover, l''image scale(1.05) dans un container overflow:hidden
6. **10+ images** : utilise picsum.photos avec des tailles variées

Le grid doit s''adapter naturellement à toutes les tailles d''écran.',
 'Une galerie masonry qui s''adapte à l''écran. Les overlays sont élégants. L''effet d''immersion est là.',
 2, 2, '{"code","creativity"}'),

('e5030000-0000-0000-0000-000000000001', 't5000000-0000-0000-0000-000000000001',
 'CSS Grid — Magazine layout',
 'Crée un layout de magazine avec des articles de tailles différentes.',
 'Crée une page d''accueil de magazine "The Byte" :

1. **Hero article** : grid-column: span 2, grid-row: span 2 — gros article avec image de fond + titre
2. **Articles secondaires** : 4 articles plus petits autour du hero
3. **Sidebar** : colonne de droite avec "Trending", "Newsletter signup"
4. **Chaque article** : image, catégorie (badge), titre, extrait (2 lignes max avec -webkit-line-clamp)
5. **Grid areas nommées** : "hero hero sidebar" "small1 small2 sidebar"
6. **Responsive** : tout empilé sur mobile

Le layout doit donner une impression de magazine premium.',
 'Un layout de magazine à la Bloomberg ou Medium. Les articles sont hiérarchisés visuellement par leur taille dans la grid.',
 3, 3, '{"code","craft","creativity"}');

-- ==========================================
-- TRACK 6: Responsive (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e6010000-0000-0000-0000-000000000001', 't6000000-0000-0000-0000-000000000001',
 'Media queries et mobile-first',
 'Apprends à coder mobile-first et à ajouter des media queries.',
 'Crée une page "App mobile" qui est conçue mobile-first :

1. **Mobile (< 768px)** : navigation en bottom bar (fixed bottom), contenu pleine largeur, texte 16px
2. **Tablet (768-1024px)** : nav en sidebar gauche, contenu avec padding, grid 2 colonnes
3. **Desktop (> 1024px)** : nav en top bar, contenu max-width: 1200px centré, grid 3 colonnes
4. **Unités** : utilise rem pour les tailles, clamp() pour les titres (clamp(1.5rem, 4vw, 3rem))
5. **Images** : max-width: 100% partout, object-fit: cover
6. **Touch targets** : boutons de 44px minimum sur mobile (recommandation Apple)

Code mobile-first : le CSS de base = mobile, les @media (min-width) ajoutent les styles desktop.',
 'Un site qui fonctionne sur mobile, tablette et desktop. Aucun scroll horizontal, aucun texte trop petit.',
 2, 1, '{"code","versatility"}'),

('e6020000-0000-0000-0000-000000000001', 't6000000-0000-0000-0000-000000000001',
 'Clamp, min, max et unités modernes',
 'Les fonctions CSS modernes pour un responsive sans media queries.',
 'Crée une page "Typography showcase" :

1. **Titres fluides** : font-size: clamp(2rem, 5vw, 4rem) — pas de media query, tout fluide
2. **Container fluide** : width: min(90%, 1200px) — remplace max-width + margin auto
3. **Spacing fluide** : padding: clamp(1rem, 3vw, 3rem)
4. **Grid fluide** : grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr))
5. **Images fluides** : width: min(100%, 600px)
6. **Texte** : font-size entre 1rem et 1.25rem avec clamp, line-height entre 1.5 et 1.8

Le but : ZÉRO media query. Tout doit être responsive uniquement avec clamp(), min(), max().',
 'Une page entièrement responsive sans une seule media query. Les fonctions CSS font tout le travail.',
 2, 2, '{"code","craft","autonomy"}'),

('e6030000-0000-0000-0000-000000000001', 't6000000-0000-0000-0000-000000000001',
 'Rendre un site existant responsive',
 'Prends un site desktop-only et rends-le responsive.',
 'Reprends ton Dashboard (Track 5) et rends-le parfaitement responsive :

1. **Mobile** : sidebar masquée, hamburger menu, widgets en 1 colonne, search en pleine largeur
2. **Tablette** : sidebar réduite (icônes only, 60px), widgets en 2 colonnes
3. **Desktop** : sidebar complète (200px), widgets en 2-3 colonnes
4. **Breakpoints** : utilise @media (min-width: 768px) et (min-width: 1024px)
5. **Sidebar toggle** : checkbox hack pour montrer/cacher la sidebar sur mobile
6. **Smooth transitions** : la sidebar slide avec transition: width 0.3s ease

Teste sur 375px (iPhone SE), 768px (iPad), 1024px (laptop), 1440px (desktop).',
 'Le même dashboard qui fonctionne parfaitement sur 4 tailles d''écran. La sidebar s''adapte intelligemment.',
 2, 3, '{"code","versatility","autonomy"}');

-- ==========================================
-- TRACK 7: Formulaires & Tableaux (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e7010000-0000-0000-0000-000000000001', 't7000000-0000-0000-0000-000000000001',
 'Formulaire de contact stylé',
 'Crée un formulaire complet avec tous les types d''inputs, bien stylé.',
 'Crée un formulaire de contact pour une agence :

1. **Inputs texte** : nom, email, téléphone — avec labels flottants (label qui monte au focus)
2. **Select** : un menu déroulant "Sujet" custom (apparence: none + flèche custom)
3. **Radio buttons** : "Budget" avec 4 options custom (cachés + labels stylés)
4. **Checkbox** : "J''accepte les CGU" custom (checkbox cachée + label avec ::before)
5. **Textarea** : message, resize: vertical, min-height: 120px
6. **Bouton submit** : large, accent color, hover animation
7. **Validation CSS** : :valid (border green), :invalid:not(:placeholder-shown) (border red)
8. **Responsive** : pleine largeur sur mobile, 2 colonnes sur desktop

Pas de JavaScript. Toute l''interactivité en CSS.',
 'Un formulaire professionnel avec des inputs custom, une validation visuelle, et des labels flottants. Tout en CSS.',
 3, 1, '{"craft","code"}'),

('e7020000-0000-0000-0000-000000000001', 't7000000-0000-0000-0000-000000000001',
 'Tableau de données responsive',
 'Crée un tableau de données complexe qui s''adapte au mobile.',
 'Crée un tableau "Classement des joueurs" :

1. **Tableau desktop** : <table> avec colonnes Rang, Avatar, Pseudo, Score, Niveau, Actions
2. **Style** : lignes alternées (tr:nth-child(even)), hover sur les lignes, header sticky
3. **Badges** : le niveau est un badge coloré (Bronze, Argent, Or, Diamant)
4. **Responsive** : sur mobile, le tableau se transforme en cartes empilées (chaque <tr> devient une card avec data-label)
5. **Tri visuel** : les headers cliquables (juste le style, pas de JS) avec une flèche ↑↓
6. **Pagination** : barre de pagination en bas (1, 2, 3, ..., 10)

Technique responsive : display: block sur tous les éléments du tableau + data-label en ::before.',
 'Un tableau qui est lisible sur desktop ET mobile. La transformation desktop→cards est fluide.',
 3, 2, '{"code","versatility"}'),

('e7030000-0000-0000-0000-000000000001', 't7000000-0000-0000-0000-000000000001',
 'Formulaire multi-étapes (CSS only)',
 'Crée un formulaire en 3 étapes avec une progress bar, sans JavaScript.',
 'Crée un formulaire d''inscription en 3 étapes :

**Étape 1** : Infos personnelles (nom, email, mot de passe)
**Étape 2** : Préférences (sélection d''intérêts avec checkboxes custom)
**Étape 3** : Confirmation (résumé + bouton "Créer mon compte")

1. **Progress bar** : 3 étapes avec cercles + lignes connectées, l''étape active est colorée
2. **Navigation** : radio inputs cachés, chaque étape visible quand son radio est :checked
3. **Transitions** : les étapes slide avec transform: translateX
4. **Validation** : inputs required, :valid/:invalid styles
5. **Boutons** : "Suivant" et "Précédent" sont des labels pour les radios

Tout en CSS. Pas de JavaScript.',
 'Un formulaire multi-étapes avec progress bar et transitions fluides. CSS-only, impressionnant techniquement.',
 3, 3, '{"code","craft","creativity","autonomy"}');

-- ==========================================
-- TRACK 8: Animations (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e8010000-0000-0000-0000-000000000001', 't8000000-0000-0000-0000-000000000001',
 'Transitions et transforms',
 'Maîtrise les transitions CSS pour des interactions fluides.',
 'Crée une page "Interaction showcase" :

1. **Card flip** : au hover, la carte tourne (rotateY 180deg) et montre le dos (backface-visibility)
2. **Image zoom** : au hover, l''image scale(1.1) dans un container overflow:hidden, transition 0.5s
3. **Bouton elastic** : au clic (:active), le bouton scale(0.95), puis revient
4. **Menu accordéon** : max-height: 0 → max-height: 500px avec transition (3 sections)
5. **Tooltip** : un texte qui apparaît au hover avec opacity + transform translateY
6. **Loading spinner** : un cercle qui tourne (border-top coloré + animation rotate infinie)

Chaque interaction doit avoir une timing function appropriée (ease, ease-out, cubic-bezier).',
 'Une showcase d''interactions où chaque élément réagit de manière fluide et naturelle.',
 3, 1, '{"craft","creativity"}'),

('e8020000-0000-0000-0000-000000000001', 't8000000-0000-0000-0000-000000000001',
 'Keyframes et animations complexes',
 'Crée des animations avancées avec @keyframes.',
 'Crée une page "Animation lab" :

1. **Typing effect** : un texte qui s''écrit lettre par lettre (animation steps() + border-right clignotant)
2. **Bounce** : un élément qui rebondit à l''arrivée (keyframes avec ease-in + ease-out aux bons moments)
3. **Parallax simple** : 3 layers qui bougent à des vitesses différentes au scroll (background-attachment: fixed)
4. **Stagger** : 5 éléments qui apparaissent un par un avec animation-delay croissant
5. **Pulse** : un bouton CTA qui pulse doucement à l''infini (scale + box-shadow)
6. **Gradient animé** : un background gradient qui se déplace lentement (background-size: 200% + animation)

Chaque animation doit avoir un bouton "Replay" (checkbox hack qui reset l''animation).',
 'Un lab d''animations qui démontre une maîtrise avancée de @keyframes. Chaque animation est smooth et intentionnelle.',
 3, 2, '{"craft","creativity","autonomy"}'),

('e8030000-0000-0000-0000-000000000001', 't8000000-0000-0000-0000-000000000001',
 'Landing page animée',
 'Combine tout : animations, transitions, responsive, pour une landing page impressionnante.',
 'Crée une landing page "Neon" avec des animations au chargement :

1. **Hero** : titre qui slam (scale 1.3→1 + blur 8px→0), sous-titre fade-up, CTA fade-up avec delay
2. **Particules** : 10 petits cercles qui flottent en arrière-plan (animation translate + random delays)
3. **Scroll reveal** : les sections apparaissent au scroll (animation fadeUp, triggé par scroll — Intersection Observer OK en JS, ou juste animation-delay pour simuler)
4. **Compteurs** : des chiffres qui "montent" de 0 à la valeur (CSS counter + animation steps)
5. **Cards stagger** : 4 cards qui apparaissent une par une au chargement
6. **Dark theme** : fond sombre, accent néon (text-shadow glow), bordures lumineuses

Le timing de chaque animation doit être coordonné. Le hero en premier, puis le reste cascade.',
 'Une landing page qui fait "wow" au chargement. Les animations sont coordonnées, le timing est parfait, l''ambiance est immersive.',
 3, 3, '{"craft","creativity","autonomy","versatility"}');

-- ==========================================
-- TRACK 9: Projets finaux (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('e9010000-0000-0000-0000-000000000001', 't9000000-0000-0000-0000-000000000001',
 'Site restaurant — 3 pages',
 'Un vrai site de restaurant avec menu, réservation, et identité visuelle forte.',
 'Construis le site de "Ember & Oak", restaurant gastronomique :

**Page 1 — Accueil** : Hero plein écran avec image de fond + overlay gradient, histoire du restaurant, 3 plats signatures, témoignages clients
**Page 2 — Menu** : Entrées, Plats, Desserts, Boissons. Chaque item : nom, description, prix, icônes diététiques (V, GF). Design élégant serif.
**Page 3 — Réservation** : Formulaire (date, heure, nombre de personnes, nom, email, demandes spéciales), carte Google Maps placeholder, horaires

**Exigences** :
- Navigation identique sur les 3 pages avec état actif
- Responsive (mobile, tablette, desktop)
- 2 polices Google Fonts (serif pour titres, sans-serif pour texte)
- Variables CSS pour tout le thème
- Animations subtiles (fade-in des sections, hover sur les plats)',
 'Un site de restaurant que tu pourrais présenter à un vrai restaurateur. Identité visuelle cohérente, navigation fluide.',
 3, 1, '{"code","craft","autonomy","versatility"}'),

('e9020000-0000-0000-0000-000000000001', 't9000000-0000-0000-0000-000000000001',
 'Blog tech — 5 pages',
 'Un blog complet avec homepage, listing, article, about, contact. Dark mode inclus.',
 'Construis "ByteSize", un blog tech :

**Page 1 — Home** : Hero, 3 featured articles (cards), newsletter signup
**Page 2 — Articles** : Liste 6+ articles + sidebar (catégories, populaires), pagination
**Page 3 — Article** : Titre, auteur + date, contenu avec <pre><code>, images, citation <blockquote>, articles reliés
**Page 4 — About** : Bio auteur, photo, stack tech, liens sociaux
**Page 5 — Contact** : Formulaire stylé + liens sociaux

**Exigences** :
- Dark/light mode toggle (CSS-only checkbox hack)
- Code blocks avec fond sombre et police monospace
- Tags/catégories en badges
- Reading time affiché
- Responsive complet
- CSS variables pour les deux thèmes
- Print stylesheet (pour imprimer un article proprement)',
 'Un blog indistinguable de Ghost ou Medium. Le dark mode fonctionne parfaitement. L''expérience de lecture est premium.',
 3, 2, '{"code","craft","creativity","autonomy","versatility"}'),

('e9030000-0000-0000-0000-000000000001', 't9000000-0000-0000-0000-000000000001',
 'E-commerce complet — 5 pages',
 'Le boss final. Un site e-commerce complet. 5 pages, CSS-only interactions, responsive, dark mode.',
 'Construis "Pixel Store", boutique tech/gadgets :

**Page 1 — Home** : Hero slider (CSS animation), catégories (4 cards), bestsellers (4 produits), newsletter
**Page 2 — Catalogue** : Sidebar filtres (catégories, prix, couleurs), grille produits, tri, pagination
**Page 3 — Produit** : Galerie images (CSS radio hack), tailles, couleurs, tabs (description/specs/reviews), "Ajouter au panier"
**Page 4 — Panier** : Tableau produits, quantités, coupon code, résumé commande, bouton checkout
**Page 5 — Checkout** : Formulaire 3 étapes (infos, paiement, confirmation), progress bar, validation CSS

**Exigences** :
- Design system complet (variables, composants réutilisés)
- Dark/light mode
- Micro-interactions sur chaque bouton et input
- Skeleton loading states
- Print stylesheet pour la confirmation
- Responsive (375px, 768px, 1440px)
- Accessibilité (focus states, skip-to-content, heading hierarchy)
- ZÉRO JavaScript

C''est l''exercice le plus difficile. Prends ton temps.',
 'Un site e-commerce complet indistinguable d''un vrai store Shopify. Ce seul projet prouve que tu maîtrises HTML/CSS à un niveau professionnel.',
 3, 3, '{"code","craft","creativity","autonomy","versatility"}');

-- ==========================================
-- TIPS (5 par exercice = 150 tips)
-- Seuls les exercices des tracks 1-3 ont des tips détaillés ici
-- Les tracks 4-9 suivront le même pattern
-- ==========================================

-- Track 1, Ex 1.1
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e1010000-0000-0000-0000-000000000001', 1, 'Structure de base : <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Mon site</title></head><body></body></html>'),
('e1010000-0000-0000-0000-000000000001', 2, 'Balises sémantiques : <header> pour le haut de page, <main> pour le contenu principal, <footer> pour le bas. Pas de <div> quand une balise sémantique existe.'),
('e1010000-0000-0000-0000-000000000001', 3, 'Liens externes : <a href="https://..." target="_blank" rel="noopener">Texte du lien</a>. Le rel="noopener" est important pour la sécurité.'),
('e1010000-0000-0000-0000-000000000001', 4, 'Listes : <ol> pour les listes numérotées (classement), <ul> pour les listes à puces (pas d''ordre). Chaque item dans un <li>.'),
('e1010000-0000-0000-0000-000000000001', 5, 'Validateur W3C : va sur validator.w3.org, colle ton HTML, et corrige chaque erreur. 0 erreur = HTML parfait.');

-- Track 1, Ex 1.2
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e1020000-0000-0000-0000-000000000001', 1, 'Images avec picsum : <img src="https://picsum.photos/400/300?random=1" alt="Description de l''image" width="400" height="300" loading="lazy">'),
('e1020000-0000-0000-0000-000000000001', 2, 'Figure : <figure><img src="..." alt="..."><figcaption>Légende de la photo</figcaption></figure>. La figcaption décrit l''image pour l''accessibilité.'),
('e1020000-0000-0000-0000-000000000001', 3, 'Favicon : <link rel="icon" type="image/svg+xml" href="favicon.svg">. Tu peux utiliser un emoji comme favicon SVG.'),
('e1020000-0000-0000-0000-000000000001', 4, 'Alt text : décris ce que l''image MONTRE, pas ce qu''elle EST. "Un chat roux dormant sur un canapé" > "photo de chat". Si l''image est décorative : alt="".'),
('e1020000-0000-0000-0000-000000000001', 5, 'Picture element : <picture><source media="(min-width: 768px)" srcset="grande.jpg"><img src="petite.jpg" alt="..."></picture>. Le navigateur choisit la bonne image.');

-- Track 1, Ex 1.3
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e1030000-0000-0000-0000-000000000001', 1, 'Liens relatifs : si tes 3 fichiers sont dans le même dossier, un lien vers recette.html est juste <a href="recette.html">. Pas besoin de / ou de chemin complet.'),
('e1030000-0000-0000-0000-000000000001', 2, 'Navigation commune : copie le même bloc <nav> dans les 3 pages. Sur chaque page, ajoute class="active" au lien de la page courante.'),
('e1030000-0000-0000-0000-000000000001', 3, 'Balise <address> : utilisée pour les coordonnées de contact. <address><a href="mailto:contact@site.com">contact@site.com</a></address>'),
('e1030000-0000-0000-0000-000000000001', 4, 'Formulaire HTML basique : <form><label for="nom">Nom</label><input type="text" id="nom" name="nom" required><button type="submit">Envoyer</button></form>'),
('e1030000-0000-0000-0000-000000000001', 5, 'Structure de dossier : garde tous les fichiers HTML à la racine. Les images dans un dossier /images/. Le CSS dans /css/style.css.');

-- Track 1, Ex 1.4
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e1040000-0000-0000-0000-000000000001', 1, 'Tableau HTML : <table><thead><tr><th>Année</th><th>Formation</th></tr></thead><tbody><tr><td>2024</td><td>DYG</td></tr></tbody></table>'),
('e1040000-0000-0000-0000-000000000001', 2, 'Détails/Summary : <details><summary>Question fréquente</summary><p>La réponse ici</p></details>. Le navigateur gère l''ouverture/fermeture tout seul.'),
('e1040000-0000-0000-0000-000000000001', 3, 'Open Graph : <meta property="og:title" content="Mon CV"><meta property="og:description" content="CV de ..."><meta property="og:image" content="preview.jpg">'),
('e1040000-0000-0000-0000-000000000001', 4, 'Accessibilité : <nav aria-label="Navigation principale">. Les lecteurs d''écran utilisent aria-label pour décrire la section.'),
('e1040000-0000-0000-0000-000000000001', 5, 'Iframe YouTube : <iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" allowfullscreen></iframe>. Remplace VIDEO_ID par l''ID de la vidéo.');

-- Track 2, Ex 2.1
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e2010000-0000-0000-0000-000000000001', 1, 'Variables CSS : :root { --color-bg: #0a0a0f; --color-text: #e2e8f0; --color-accent: #e8620a; } puis utilise : color: var(--color-text);'),
('e2010000-0000-0000-0000-000000000001', 2, 'Google Fonts : va sur fonts.google.com, choisis 2 polices, copie le <link> dans ton <head>. Applique : font-family: "Bebas Neue", sans-serif;'),
('e2010000-0000-0000-0000-000000000001', 3, 'Gradient : background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%); Les degrés changent la direction.'),
('e2010000-0000-0000-0000-000000000001', 4, 'Liens stylés : a { color: var(--color-accent); text-decoration: none; } a:hover { text-decoration: underline; }'),
('e2010000-0000-0000-0000-000000000001', 5, 'Fichier CSS séparé : <link rel="stylesheet" href="css/style.css"> dans le <head>. JAMAIS de style inline (style="...") en production.');

-- Track 2, Ex 2.2
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e2020000-0000-0000-0000-000000000001', 1, 'Border simple : border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; Utilise rgba pour des bordures subtiles.'),
('e2020000-0000-0000-0000-000000000001', 2, 'Barre latérale : border-left: 4px solid var(--color-accent); padding-left: 16px; C''est un pattern très utilisé pour les citations et les highlights.'),
('e2020000-0000-0000-0000-000000000001', 3, 'Avatar circulaire : width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--color-accent);'),
('e2020000-0000-0000-0000-000000000001', 4, 'Box-shadow au lieu de border : box-shadow: 0 4px 16px rgba(0,0,0,0.1); C''est plus élégant qu''une bordure pour les cards.'),
('e2020000-0000-0000-0000-000000000001', 5, 'Border gradient trick : background: linear-gradient(var(--bg), var(--bg)) padding-box, linear-gradient(135deg, #e8620a, #f5c542) border-box; border: 2px solid transparent;');

-- Track 2, Ex 2.3
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e2030000-0000-0000-0000-000000000001', 1, 'Box-sizing global : *, *::before, *::after { box-sizing: border-box; } TOUJOURS en première ligne de ton CSS. Sans ça, padding ajoute à la largeur.'),
('e2030000-0000-0000-0000-000000000001', 2, 'Container : .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; } Centre le contenu et ajoute des marges latérales sur mobile.'),
('e2030000-0000-0000-0000-000000000001', 3, 'Margin collapse : deux éléments verticaux avec margin-bottom: 16px et margin-top: 16px n''auront que 16px entre eux (pas 32px). C''est le "margin collapsing".'),
('e2030000-0000-0000-0000-000000000001', 4, 'Console développeur : F12 → Elements → sélectionne un élément → regarde le box model en bas à droite. Tu vois margin, border, padding visuellement.'),
('e2030000-0000-0000-0000-000000000001', 5, 'Gap vs Margin : si tu utilises flex ou grid, préfère gap: 16px sur le parent plutôt que margin sur chaque enfant. Plus propre, pas de marge en trop sur le dernier élément.');

-- Track 2, Ex 2.4
INSERT INTO training_tips (exercise_id, sort_order, content) VALUES
('e2040000-0000-0000-0000-000000000001', 1, 'Position relative : l''élément reste dans le flux normal mais tu peux le décaler avec top/left. Utile pour les badges : parent relative, badge absolute.'),
('e2040000-0000-0000-0000-000000000001', 2, 'Position absolute : l''élément sort du flux et se positionne par rapport au parent position:relative le plus proche. Pas de parent relative = positionné par rapport au body.'),
('e2040000-0000-0000-0000-000000000001', 3, 'Position fixed : reste fixe même quand on scroll. Parfait pour les boutons "retour en haut" : position: fixed; bottom: 24px; right: 24px; z-index: 100;'),
('e2040000-0000-0000-0000-000000000001', 4, 'Position sticky : position: sticky; top: 0; L''élément se comporte comme relative jusqu''à ce qu''il atteigne le seuil (top: 0), puis il "colle". Le parent doit avoir assez de hauteur.'),
('e2040000-0000-0000-0000-000000000001', 5, 'Z-index : ne fonctionne que sur les éléments positionnés (relative, absolute, fixed, sticky). Commence par z-index: 1, monte à 10 pour les overlays, 100 pour les modals, 1000 pour les toasts.');
