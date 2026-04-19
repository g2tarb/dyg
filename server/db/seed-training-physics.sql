-- ==========================================
-- DYG Training — Physics & Math for Devs
-- 6 tracks, 18 exercises
-- ==========================================

INSERT INTO training_tracks (id, name, description, level, sort_order) VALUES
('da100000-0000-0000-0000-000000000001', 'Math — Bases pour devs', 'Algèbre, logique booléenne, systèmes de numération. Les maths que tout dev doit connaître.', 1, 40),
('da200000-0000-0000-0000-000000000001', 'Math — Vecteurs & Trigonométrie', 'Vecteurs 2D, angles, sin/cos/tan, distances. Les maths du jeu vidéo.', 2, 41),
('da300000-0000-0000-0000-000000000001', 'Physique — Mouvement', 'Vélocité, accélération, gravité, projectiles. Fais bouger des objets.', 2, 42),
('da400000-0000-0000-0000-000000000001', 'Physique — Collisions', 'AABB, cercles, rebonds, détection de collision. Le cœur du game dev.', 3, 43),
('da500000-0000-0000-0000-000000000001', 'Physique — Forces', 'Friction, ressorts, pendules, orbites. Les forces en simulation.', 3, 44),
('da600000-0000-0000-0000-000000000001', 'Projets — Simulations', 'Pong, platformer, système solaire, particules. Physique appliquée.', 3, 45);

-- TRACK 1: Math bases
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('db110000-0000-0000-0000-000000000001', 'da100000-0000-0000-0000-000000000001',
 'Systèmes de numération',
 'Binaire, octal, hexadécimal. Convertis entre les bases.',
 'Crée un programme (JS ou Python) qui :

1. **Décimal → Binaire** : convertis 42, 255, 1024 en binaire (sans fonction built-in, avec des divisions successives par 2)
2. **Binaire → Décimal** : convertis "101010", "11111111", "10000000000"
3. **Décimal → Hexadécimal** : convertis 255 → FF, 16777215 → FFFFFF
4. **Hex → Décimal** : convertis "FF", "A3", "DEADBEEF"
5. **Convertisseur universel** : fonction convert(nombre, base_source, base_cible)
6. **Application** : montre pourquoi les couleurs CSS sont en hex (#FF6600 = rgb(255, 102, 0))',
 'Le convertisseur fonctionne entre toutes les bases. L''explication des couleurs hex est claire.',
 1, 1, '{"code","versatility"}'),

('db120000-0000-0000-0000-000000000001', 'da100000-0000-0000-0000-000000000001',
 'Algèbre et fonctions',
 'Fonctions linéaires, quadratiques, exponentielles. Les courbes que tu utilises sans le savoir.',
 'Crée un programme qui visualise des fonctions :

1. **Linéaire** : y = ax + b — trace la droite en ASCII art (grille 40x20)
2. **Quadratique** : y = ax² + bx + c — trace la parabole
3. **Easing functions** : implémente easeInQuad(t) = t², easeOutQuad(t) = 1-(1-t)², easeInOutQuad
4. **Application** : anime un carré qui se déplace avec chaque easing (canvas ou terminal)
5. **Interpolation** : lerp(a, b, t) = a + (b - a) * t — montre le linear interpolation
6. **Exercice** : crée une fonction smooth(start, end, duration) qui retourne la position à chaque frame',
 'Les courbes s''affichent. Les easing functions produisent des animations fluides. Lerp fonctionne.',
 1, 2, '{"code","creativity"}'),

('db130000-0000-0000-0000-000000000001', 'da100000-0000-0000-0000-000000000001',
 'Logique booléenne et bitwise',
 'AND, OR, XOR, NOT. Les portes logiques et leur usage en programmation.',
 'Crée un programme qui démontre :

1. **Tables de vérité** : affiche les tables AND, OR, XOR, NOT pour toutes les combinaisons
2. **Flags avec bits** : const READ = 1, WRITE = 2, EXEC = 4. permissions = READ | WRITE → vérifie avec &
3. **Toggle** : active/désactive un flag avec XOR (permissions ^= EXEC)
4. **Masques** : extrait les 4 bits de poids faible avec & 0x0F
5. **Application RGB** : encode une couleur (r, g, b) dans un seul int avec bit shifting, puis décode
6. **Exercice** : crée un système de permissions fichier (rwxrwxrwx → 755) avec des opérations bitwise',
 'Les tables de vérité sont correctes. L''encodage RGB par bit shifting fonctionne. chmod 755 est converti.',
 1, 3, '{"code","autonomy"}');

-- TRACK 2: Vecteurs & Trigonométrie
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('db210000-0000-0000-0000-000000000001', 'da200000-0000-0000-0000-000000000001',
 'Vecteurs 2D',
 'Addition, soustraction, magnitude, normalisation, dot product.',
 'Crée une classe/objet Vector2D :

1. **Constructeur** : Vector2D(x, y)
2. **Addition** : add(v) → retourne un nouveau vecteur
3. **Soustraction** : sub(v)
4. **Multiplication scalaire** : mul(scalar)
5. **Magnitude** : mag() → sqrt(x² + y²)
6. **Normalisation** : normalize() → vecteur de magnitude 1
7. **Dot product** : dot(v) → x1*x2 + y1*y2
8. **Distance** : distance(v) → magnitude de (this - v)
9. **Visualisation** : dessine 2 vecteurs et leur somme sur un canvas ou en ASCII',
 'Toutes les opérations vectorielles sont correctes. La visualisation montre l''addition de vecteurs.',
 2, 1, '{"code","craft"}'),

('db220000-0000-0000-0000-000000000001', 'da200000-0000-0000-0000-000000000001',
 'Trigonométrie appliquée',
 'Sin, cos, tan, angles, rotation, mouvement circulaire.',
 'Crée ces simulations (canvas HTML ou terminal) :

1. **Cercle** : dessine un point qui tourne en cercle (x = cx + r*cos(angle), y = cy + r*sin(angle))
2. **Onde** : dessine une sinusoïde qui scroll horizontalement
3. **Rotation** : fais tourner un carré autour de son centre (matrice de rotation 2D)
4. **Visée** : un objet qui "regarde" toujours vers la souris (atan2(dy, dx))
5. **Spiral** : un point qui fait une spirale (rayon qui augmente avec le temps)
6. **Exercice** : horloge analogique avec aiguilles heures/minutes/secondes',
 'L''horloge fonctionne en temps réel. Les aiguilles sont aux bonnes positions.',
 2, 2, '{"code","creativity","versatility"}'),

('db230000-0000-0000-0000-000000000001', 'da200000-0000-0000-0000-000000000001',
 'Projet : Radar / Scanner',
 'Un radar animé qui scanne et détecte des points.',
 'Crée un radar animé (canvas HTML) :

1. **Cercle radar** : cercles concentriques (portée)
2. **Ligne de scan** : une ligne qui tourne (cos/sin) avec un trail qui fade
3. **Blips** : des points aléatoires qui apparaissent quand la ligne les traverse
4. **Distance** : affiche la distance de chaque blip au centre
5. **Couleur** : les blips proches sont verts, les lointains sont rouges
6. **Animation** : requestAnimationFrame, la ligne tourne en continu',
 'Le radar tourne avec un trail. Les blips apparaissent au passage de la ligne. Les distances sont correctes.',
 2, 3, '{"code","creativity","autonomy"}');

-- TRACK 3: Mouvement
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('db310000-0000-0000-0000-000000000001', 'da300000-0000-0000-0000-000000000001',
 'Vélocité et accélération',
 'position += velocity, velocity += acceleration. Le cœur de la physique de jeu.',
 'Crée une simulation (canvas HTML) :

1. **Balle** : un cercle avec position (x, y) et vélocité (vx, vy)
2. **Mouvement** : à chaque frame, position += velocity
3. **Rebond** : quand la balle touche un mur, inverse la vélocité (vx = -vx)
4. **Gravité** : ajoute une accélération constante vers le bas (vy += 0.5 chaque frame)
5. **Friction** : à chaque rebond, réduit la vélocité (vx *= 0.9, vy *= 0.9)
6. **Multi-balles** : lance 10 balles avec des vélocités aléatoires',
 '10 balles rebondissent avec gravité et friction. Elles finissent par s''arrêter.',
 2, 1, '{"code","creativity"}'),

('db320000-0000-0000-0000-000000000001', 'da300000-0000-0000-0000-000000000001',
 'Projectiles et trajectoires',
 'Tir parabolique, angle de lancement, portée.',
 'Crée un simulateur de tir :

1. **Canon** : un point de lancement avec un angle ajustable (flèches clavier)
2. **Tir** : au clic/espace, lance un projectile avec vélocité initiale (v0*cos(angle), v0*sin(angle))
3. **Trajectoire** : affiche la trace du projectile (points)
4. **Gravité** : le projectile suit une parabole
5. **Cible** : place une cible à une distance aléatoire — le joueur doit ajuster l''angle
6. **Puissance** : slider ou touches pour ajuster la puissance de tir
7. **Score** : compte les tirs réussis / ratés',
 'Le projectile suit une trajectoire parabolique réaliste. Le joueur peut ajuster angle et puissance.',
 2, 2, '{"code","creativity","autonomy"}'),

('db330000-0000-0000-0000-000000000001', 'da300000-0000-0000-0000-000000000001',
 'Projet : Angry Birds simplifié',
 'Lance des oiseaux avec un lance-pierre. Physique de projectile.',
 'Crée un Angry Birds simplifié (canvas) :

1. **Lance-pierre** : clic-glisser pour définir angle et puissance (comme un élastique)
2. **Oiseau** : cercle lancé en projectile (gravité + vélocité initiale)
3. **Structures** : 3-4 rectangles empilés (cibles)
4. **Collision** : détecte quand l''oiseau touche une structure
5. **Destruction** : les structures touchées tombent (gravité)
6. **Score** : nombre de structures détruites en N oiseaux
7. **Ligne de visée** : affiche la trajectoire prédite en pointillés',
 'Le lance-pierre fonctionne. La trajectoire est réaliste. Les structures se détruisent.',
 2, 3, '{"code","creativity","autonomy","versatility"}');

-- TRACK 4: Collisions
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('db410000-0000-0000-0000-000000000001', 'da400000-0000-0000-0000-000000000001',
 'Collision AABB et cercles',
 'Rectangle vs rectangle, cercle vs cercle, cercle vs rectangle.',
 'Crée un programme de détection de collision (canvas) :

1. **AABB** : 2 rectangles déplaçables avec les flèches. Détecte la collision (overlap sur x ET y)
2. **Cercle-Cercle** : 2 cercles. Collision si distance(centres) < r1 + r2
3. **Cercle-Rectangle** : trouve le point le plus proche du rectangle au centre du cercle
4. **Visuel** : les objets deviennent rouges quand ils se touchent
5. **Résolution** : quand collision détectée, repousse les objets pour qu''ils ne se chevauchent plus
6. **10 objets** : 10 cercles qui bougent et rebondissent entre eux',
 '10 cercles rebondissent les uns sur les autres. La détection est précise. Aucun chevauchement persistant.',
 3, 1, '{"code","craft"}'),

('db420000-0000-0000-0000-000000000001', 'da400000-0000-0000-0000-000000000001',
 'Réponse aux collisions',
 'Rebonds réalistes, conservation de l''énergie, masse.',
 'Améliore la simulation précédente :

1. **Masse** : chaque cercle a une masse (rayon proportionnel)
2. **Conservation d''énergie** : v1_final = ((m1-m2)*v1 + 2*m2*v2) / (m1+m2)
3. **Élasticité** : coefficient de restitution (0 = mou, 1 = rebond parfait)
4. **Spatial hash** : optimise la détection (ne vérifie que les voisins proches)
5. **Gravité** : ajoute la gravité — les cercles tombent et s''empilent
6. **Exercice** : simule un billard (15 boules, table avec bords, queue de billard au clic)',
 'Le billard fonctionne avec des rebonds réalistes. Les boules ralentissent avec la friction.',
 3, 2, '{"code","craft","creativity"}'),

('db430000-0000-0000-0000-000000000001', 'da400000-0000-0000-0000-000000000001',
 'Projet : Casse-briques (Breakout)',
 'Le classique : raquette, balle, briques. Physique de collision complète.',
 'Crée un Breakout complet (canvas) :

1. **Raquette** : rectangle en bas, contrôlé par la souris ou les flèches
2. **Balle** : rebondit sur les murs, la raquette, et les briques
3. **Briques** : grille de 8x5, chaque brique disparaît quand touchée
4. **Angle** : l''angle de rebond sur la raquette dépend du point d''impact (centre = vertical, bord = angle)
5. **Vitesse** : la balle accélère légèrement à chaque rebond
6. **Vies** : 3 vies, perdue si la balle tombe en bas
7. **Score** : points par brique (rangée du haut = plus de points)
8. **Niveaux** : 3 patterns de briques différents',
 'Breakout jouable avec 3 niveaux. Les rebonds sont réalistes. Le score fonctionne.',
 3, 3, '{"code","craft","creativity","autonomy","versatility"}');

-- TRACK 5: Forces
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('db510000-0000-0000-0000-000000000001', 'da500000-0000-0000-0000-000000000001',
 'Friction et résistance de l''air',
 'Friction cinétique, drag, terminal velocity.',
 'Crée une simulation (canvas) :

1. **Friction** : un objet glisse sur une surface. Force de friction = μ * N (mu * poids)
2. **Surfaces** : 3 zones avec friction différente (glace μ=0.05, bois μ=0.3, sable μ=0.8)
3. **Air drag** : force = -0.5 * ρ * v² * Cd * A (simplifié : drag = velocity * dragCoeff)
4. **Terminal velocity** : un objet en chute libre atteint une vitesse max
5. **Parachute** : au clic, le dragCoeff augmente x10 → l''objet ralentit
6. **Exercice** : simule une voiture qui accélère, atteint sa vitesse max (drag = moteur), et freine',
 'La voiture accélère, atteint un plateau (terminal velocity), et freine de manière réaliste.',
 3, 1, '{"code","craft"}'),

('db520000-0000-0000-0000-000000000001', 'da500000-0000-0000-0000-000000000001',
 'Ressorts et pendules',
 'Loi de Hooke, oscillations, pendule simple.',
 'Crée ces simulations :

1. **Ressort** : F = -k * (x - restLength). Un poids attaché à un ressort oscille
2. **Damping** : ajoute un amortissement (F_damping = -d * velocity) — l''oscillation s''atténue
3. **Pendule** : F = -g * sin(angle). Un pendule qui oscille
4. **Double pendule** : 2 pendules attachés bout à bout (mouvement chaotique)
5. **Elastic** : une chaîne de 10 points reliés par des ressorts (corde élastique)
6. **Interaction** : la souris peut tirer sur les points de la corde',
 'Le pendule oscille naturellement. Le double pendule est chaotique. La corde élastique rebondit.',
 3, 2, '{"code","creativity","autonomy"}'),

('db530000-0000-0000-0000-000000000001', 'da500000-0000-0000-0000-000000000001',
 'Projet : Système solaire',
 'Simulation gravitationnelle avec orbites.',
 'Crée un système solaire simplifié (canvas) :

1. **Gravité** : F = G * m1 * m2 / r². Chaque corps attire tous les autres
2. **Soleil** : gros cercle jaune au centre (fixe ou très lourd)
3. **Planètes** : 4-5 planètes avec des orbites différentes (vitesse initiale perpendiculaire)
4. **Traces** : chaque planète laisse une trace de son orbite
5. **Zoom** : molette pour zoomer/dézoomer
6. **Ajouter** : clic pour ajouter une planète (la direction du glisser = vélocité initiale)
7. **Échelle** : affiche la distance et la vitesse de chaque planète',
 'Les planètes orbitent autour du soleil. On peut ajouter des planètes avec le clic. Les orbites sont stables.',
 3, 3, '{"code","craft","creativity","autonomy","versatility"}');

-- TRACK 6: Projets simulations
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('db610000-0000-0000-0000-000000000001', 'da600000-0000-0000-0000-000000000001',
 'Pong avec physique',
 'Le classique Pong avec une vraie physique de rebond.',
 'Crée un Pong complet :

1. **2 raquettes** : haut/bas pour joueur 1, flèches pour joueur 2 (ou IA)
2. **Balle** : rebondit avec angle qui dépend du point d''impact sur la raquette
3. **Spin** : si la raquette bouge en frappant, la balle prend un spin (courbe)
4. **Accélération** : la balle accélère légèrement à chaque échange
5. **Score** : premier à 11 points gagne
6. **IA** : le joueur 2 est une IA qui suit la balle (avec un délai pour ne pas être parfaite)',
 'Pong jouable à 2 ou contre l''IA. Le spin fonctionne. L''IA est battable mais compétente.',
 3, 1, '{"code","creativity","autonomy"}'),

('db620000-0000-0000-0000-000000000001', 'da600000-0000-0000-0000-000000000001',
 'Platformer physics',
 'Gravité, saut, collision avec le sol et les plateformes.',
 'Crée un mini-platformer :

1. **Personnage** : rectangle contrôlé par les flèches (gauche/droite) et espace (saut)
2. **Gravité** : le personnage tombe
3. **Plateformes** : 5-6 rectangles fixes à différentes hauteurs
4. **Collision sol** : le personnage se pose sur les plateformes (collision AABB par le bas)
5. **Saut** : velocity.y = -jumpForce au moment du saut (pas de double saut)
6. **Coyote time** : le joueur peut sauter pendant 100ms après avoir quitté une plateforme
7. **Camera** : la vue suit le personnage horizontalement',
 'Le personnage saute entre les plateformes. La gravité est naturelle. Le coyote time fonctionne.',
 3, 2, '{"code","craft","creativity","autonomy"}'),

('db630000-0000-0000-0000-000000000001', 'da600000-0000-0000-0000-000000000001',
 'Système de particules',
 'Émetteurs, durée de vie, forces, explosions.',
 'Crée un système de particules (canvas) :

1. **Particule** : position, velocity, lifetime, color, size
2. **Émetteur** : à la position de la souris, émet 5 particules par frame
3. **Lifetime** : chaque particule vit 1-3 secondes, fade out avant de mourir
4. **Gravité** : les particules tombent
5. **Modes** : 1.Fontaine (vers le haut), 2.Explosion (dans toutes les directions), 3.Fumée (vers le haut + drag), 4.Feu (orange→rouge→noir)
6. **Performance** : maximum 1000 particules, recycle les mortes
7. **Clic** : clic gauche = fontaine, clic droit = explosion',
 'Le système de particules tourne à 60fps avec 1000 particules. Les 4 modes visuels sont distincts.',
 3, 3, '{"code","craft","creativity","autonomy","versatility"}');
