-- ==========================================
-- DYG Training — JavaScript Curriculum
-- 9 tracks, 27 exercises
-- ==========================================

INSERT INTO training_tracks (id, name, description, level, sort_order) VALUES
('tj100000-0000-0000-0000-000000000001', 'JS — Variables & Opérateurs', 'Let, const, types, concaténation, opérations mathématiques. Les fondations.', 1, 10),
('tj200000-0000-0000-0000-000000000001', 'JS — Fonctions', 'Déclaration, paramètres, return, scope, arrow functions, closures.', 1, 11),
('tj300000-0000-0000-0000-000000000001', 'JS — Logique & Boucles', 'If/else, switch, for, while, ternaires. La logique de programmation.', 1, 12),
('tj400000-0000-0000-0000-000000000001', 'JS — Tableaux & Objets', 'Arrays, méthodes, destructuring, spread, Set, Map. Les structures de données.', 2, 13),
('tj500000-0000-0000-0000-000000000001', 'JS — Le DOM', 'Sélectionner, modifier, ajouter, supprimer des éléments. Communiquer avec la page.', 2, 14),
('tj600000-0000-0000-0000-000000000001', 'JS — Événements', 'Click, submit, propagation, setTimeout, setInterval. L''interactivité.', 2, 15),
('tj700000-0000-0000-0000-000000000001', 'JS — POO (Classes)', 'Classes, constructeurs, héritage, getters/setters. La programmation orientée objet.', 3, 16),
('tj800000-0000-0000-0000-000000000001', 'JS — Async & API', 'Promises, async/await, fetch, localStorage. Le JS moderne.', 3, 17),
('tj900000-0000-0000-0000-000000000001', 'JS — Projets', 'Calculatrice, générateur de citations, app météo, thème persistant. Les boss.', 3, 18);

-- ==========================================
-- TRACK 1: Variables & Opérateurs (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ej110000-0000-0000-0000-000000000001', 'tj100000-0000-0000-0000-000000000001',
 'Variables et types',
 'Déclare des variables, comprends let vs const, et manipule les types primitifs.',
 'Crée un fichier script.js lié à une page HTML :

1. **Déclare** : une constante `NOM` (ton nom), un let `age` (ton âge), un let `estEtudiant` (boolean)
2. **Concaténation** : crée une phrase avec template literals : `Je m''appelle ${NOM}, j''ai ${age} ans`
3. **Types** : utilise typeof sur chaque variable et affiche le résultat avec console.log
4. **Conversion** : convertis une string "42" en nombre (parseInt), un nombre en string (String())
5. **Opérations** : calcule et affiche : addition, soustraction, multiplication, division, modulo, puissance (**)
6. **Bonus** : utilise prompt() pour demander le nom et l''âge, puis affiche la phrase

Tout doit s''afficher dans la console (F12 → Console).',
 'La console affiche les variables, leurs types, les conversions et les opérations. Aucune erreur.',
 1, 1, '{"code"}'),

('ej120000-0000-0000-0000-000000000001', 'tj100000-0000-0000-0000-000000000001',
 'Strings et méthodes',
 'Maîtrise les chaînes de caractères : méthodes, recherche, transformation.',
 'Crée un programme qui manipule des strings :

1. **Méthodes** : sur la string "  Hello World  ", applique et affiche : trim(), toUpperCase(), toLowerCase(), length
2. **Recherche** : sur "JavaScript est génial", utilise : includes("génial"), indexOf("est"), startsWith("Java"), endsWith("nial")
3. **Extraction** : utilise slice(0, 4), substring(4, 10), split(" ")
4. **Remplacement** : replace("World", "DYG"), replaceAll("a", "@")
5. **Template literals** : crée une card HTML en string : `<div class="card"><h2>${nom}</h2><p>${bio}</p></div>`
6. **Exercice** : demande un email avec prompt(), vérifie qu''il contient "@" et ".", affiche "Email valide" ou "Email invalide"',
 'Toutes les méthodes de string sont utilisées correctement. L''exercice email fonctionne.',
 1, 2, '{"code","craft"}'),

('ej130000-0000-0000-0000-000000000001', 'tj100000-0000-0000-0000-000000000001',
 'Nombres et Math',
 'Opérations avancées, l''objet Math, génération de nombres aléatoires.',
 'Crée un programme mathématique :

1. **Math** : affiche Math.PI, Math.round(4.7), Math.floor(4.9), Math.ceil(4.1), Math.abs(-5), Math.max(1,5,3), Math.min(1,5,3)
2. **Aléatoire** : génère un nombre aléatoire entre 1 et 100 : Math.floor(Math.random() * 100) + 1
3. **Programme** : crée un jeu "devine le nombre" — le programme choisit un nombre entre 1-10, l''utilisateur devine avec prompt(), le programme dit "Plus grand", "Plus petit" ou "Bravo !"
4. **NaN** : montre un cas où NaN apparaît et comment le détecter avec isNaN()
5. **Infinity** : montre 1/0 et -1/0, et comment vérifier avec isFinite()

Le jeu doit fonctionner dans le navigateur avec prompt/alert.',
 'Le jeu de devinette fonctionne. Les méthodes Math sont comprises. NaN et Infinity sont gérés.',
 1, 3, '{"code","creativity"}');

-- ==========================================
-- TRACK 2: Fonctions (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ej210000-0000-0000-0000-000000000001', 'tj200000-0000-0000-0000-000000000001',
 'Fonctions : déclaration et paramètres',
 'Crée des fonctions, comprends les paramètres, le return, et le scope.',
 'Crée un fichier avec ces fonctions :

1. **Fonction simple** : `saluer(nom)` qui retourne "Bonjour, {nom} !"
2. **Paramètre par défaut** : `saluer(nom = "visiteur")` — fonctionne sans argument
3. **Return** : `calculerIMC(poids, taille)` qui retourne le BMI (poids / taille²)
4. **Multi-return** : `analyserNote(note)` qui retourne "Excellent" (>= 16), "Bien" (>= 12), "Passable" (>= 10), "Insuffisant"
5. **Scope** : démontre qu''une variable déclarée dans une fonction n''existe pas dehors (essaie de l''afficher → ReferenceError)
6. **Appels** : appelle chaque fonction avec différents arguments et affiche les résultats

Utilise console.log pour tout afficher.',
 'Chaque fonction fonctionne correctement avec différents arguments. Le scope est compris.',
 1, 1, '{"code"}'),

('ej220000-0000-0000-0000-000000000001', 'tj200000-0000-0000-0000-000000000001',
 'Arrow functions et callbacks',
 'Fonctions fléchées, fonctions anonymes, et callbacks.',
 'Réécris et crée des fonctions :

1. **Arrow function** : réécris `saluer` en arrow : `const saluer = (nom) => "Bonjour, " + nom`
2. **Arrow courte** : `const doubler = n => n * 2` (pas de parenthèses, pas de return)
3. **Callback** : crée `executerSur(tableau, callback)` qui applique une fonction sur chaque élément
4. **setTimeout** : affiche "Bonjour" après 2 secondes avec setTimeout et une arrow function
5. **Tableau + callback** : utilise [1,2,3,4,5].map(n => n * 2), .filter(n => n > 4), .reduce((acc, n) => acc + n, 0)
6. **Exercice** : crée une fonction `pipe(...fns)` qui enchaîne plusieurs fonctions : pipe(doubler, tripler)(5) → 30',
 'Les arrow functions sont maîtrisées. Les callbacks fonctionnent. La fonction pipe enchaîne correctement.',
 1, 2, '{"code","craft"}'),

('ej230000-0000-0000-0000-000000000001', 'tj200000-0000-0000-0000-000000000001',
 'Closures et fonctions avancées',
 'Comprends les closures, les IIFE, et la récursivité.',
 'Crée ces programmes :

1. **Closure compteur** : `creerCompteur()` qui retourne un objet { incrementer(), decrementer(), valeur() } — la valeur est privée dans la closure
2. **Closure config** : `creerSalutation(langue)` retourne une fonction — creerSalutation("fr")("Pierre") → "Bonjour Pierre", creerSalutation("en")("Pierre") → "Hello Pierre"
3. **Récursivité** : `factorielle(n)` — factorielle(5) → 120
4. **Récursivité** : `fibonacci(n)` — fibonacci(7) → 13
5. **IIFE** : utilise une IIFE pour créer un module avec des variables privées
6. **Exercice** : crée un `creerLimiteur(max)` qui retourne une fonction appelable max fois, puis retourne "Limite atteinte"',
 'Les closures capturent les variables correctement. La récursivité fonctionne. Le limiteur compte correctement.',
 2, 3, '{"code","autonomy"}');

-- ==========================================
-- TRACK 3: Logique (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ej310000-0000-0000-0000-000000000001', 'tj300000-0000-0000-0000-000000000001',
 'Conditions : if, else, switch',
 'Maîtrise toutes les formes de conditions en JavaScript.',
 'Crée ces programmes :

1. **If/else** : demande l''âge avec prompt → affiche "Mineur" ou "Majeur"
2. **Else if** : note sur 20 → "Excellent" (>=16), "Bien" (>=12), "Passable" (>=10), "Insuffisant"
3. **Ternaire** : `const statut = age >= 18 ? "Majeur" : "Mineur"` — affiche le résultat
4. **Switch** : jour de la semaine (1-7) → affiche le nom du jour + "Bon week-end !" si samedi/dimanche
5. **Opérateurs logiques** : démontre &&, ||, ! avec des exemples concrets (âge >= 18 && permis === true)
6. **Exercice** : crée un mini-quiz de 5 questions (prompt + vérification), compte le score, affiche le résultat final',
 'Toutes les conditions fonctionnent. Le quiz pose 5 questions et affiche le score.',
 1, 1, '{"code"}'),

('ej320000-0000-0000-0000-000000000001', 'tj300000-0000-0000-0000-000000000001',
 'Boucles : for, while, do-while',
 'Itère, parcours, et transforme avec les boucles.',
 'Crée ces programmes :

1. **For** : affiche les nombres de 1 à 100
2. **For inversé** : compte à rebours de 10 à 0, puis affiche "Décollage !"
3. **While** : demande un mot de passe avec prompt en boucle jusqu''à ce qu''il soit correct
4. **For...of** : parcours un tableau de fruits et affiche chaque fruit numéroté
5. **Break/continue** : parcours 1-50, skip les multiples de 3 (continue), arrête à 40 (break)
6. **Exercice** : FizzBuzz — de 1 à 100 : affiche "Fizz" si multiple de 3, "Buzz" si multiple de 5, "FizzBuzz" si les deux, sinon le nombre',
 'FizzBuzz fonctionne parfaitement. Les boucles while et for sont maîtrisées.',
 1, 2, '{"code","autonomy"}'),

('ej330000-0000-0000-0000-000000000001', 'tj300000-0000-0000-0000-000000000001',
 'Projet : Jeu du pendu en console',
 'Combine conditions et boucles pour créer un vrai jeu.',
 'Crée un jeu du pendu dans la console :

1. **Mot secret** : choisis un mot au hasard dans un tableau de 10 mots
2. **Affichage** : montre le mot avec des _ pour les lettres non trouvées ("_ _ a _ _ e")
3. **Boucle de jeu** : demande une lettre avec prompt, vérifie si elle est dans le mot
4. **Vies** : 6 essais max. Affiche le nombre de vies restantes
5. **Fin de jeu** : "Gagné !" si le mot est trouvé, "Perdu ! Le mot était : ..." sinon
6. **Anti-triche** : ignore les lettres déjà proposées, ignore les entrées de plus d''1 caractère

Le jeu doit être jouable entièrement avec prompt/alert.',
 'Un jeu du pendu fonctionnel avec gestion des vies, des lettres déjà jouées, et conditions de victoire/défaite.',
 1, 3, '{"code","creativity","autonomy"}');

-- ==========================================
-- TRACK 4: Tableaux & Objets (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ej410000-0000-0000-0000-000000000001', 'tj400000-0000-0000-0000-000000000001',
 'Tableaux : méthodes essentielles',
 'push, pop, map, filter, reduce, find, sort — toutes les méthodes arrays.',
 'Crée un fichier qui manipule des tableaux :

1. **CRUD** : crée un tableau de 5 prénoms. push(), pop(), shift(), unshift(), splice() — affiche après chaque opération
2. **Recherche** : utilise indexOf(), includes(), find(), findIndex() pour trouver "Alice"
3. **Transform** : crée un tableau de nombres [1-10]. Utilise map(n => n²), filter(n => n > 25), reduce pour la somme
4. **Sort** : trie un tableau de noms alphabétiquement, trie un tableau de nombres (attention au sort numérique !)
5. **Chaîne** : sur un tableau de produits [{nom, prix}], filtre les prix > 20, trie par prix, map pour n''afficher que les noms
6. **Exercice** : crée une fonction `unique(tableau)` qui supprime les doublons (utilise Set ou filter+indexOf)',
 'Toutes les méthodes de tableau sont utilisées. La chaîne filter→sort→map fonctionne. La fonction unique marche.',
 2, 1, '{"code","craft"}'),

('ej420000-0000-0000-0000-000000000001', 'tj400000-0000-0000-0000-000000000001',
 'Objets et destructuring',
 'Objets littéraux, destructuring, spread, rest, Set, Map.',
 'Crée ces programmes :

1. **Objet** : crée un objet `dev` avec nom, age, langages (tableau), archetype. Accède avec . et []
2. **Destructuring** : `const { nom, age, ...reste } = dev` — affiche chaque valeur
3. **Spread** : clone l''objet avec `const dev2 = { ...dev, ville: "Paris" }` — prouve que c''est une copie
4. **Rest** : crée `function afficher(premier, ...autres)` — affiche le premier séparément
5. **Map** : crée une Map de scores (pilier → score), itère avec forEach
6. **Set** : crée un Set de langages, ajoute des doublons (ils sont ignorés), vérifie avec has()
7. **Exercice** : crée une fonction `merge(obj1, obj2)` qui fusionne deux objets (spread) en gérant les conflits (obj2 gagne)',
 'Destructuring, spread et rest sont compris. Map et Set sont utilisés correctement.',
 2, 2, '{"code","versatility"}'),

('ej430000-0000-0000-0000-000000000001', 'tj400000-0000-0000-0000-000000000001',
 'Projet : Gestionnaire de tâches (console)',
 'Un todo-list en console qui combine tableaux, objets, et fonctions.',
 'Crée un gestionnaire de tâches interactif :

1. **Structure** : chaque tâche = { id, titre, fait: false, priorite: "haute/moyenne/basse", date }
2. **Fonctions** : ajouterTache(titre, priorite), supprimerTache(id), toggleTache(id), listerTaches()
3. **Filtres** : tachesFaites(), tachesEnCours(), tachesParPriorite(priorite)
4. **Tri** : trierParDate(), trierParPriorite()
5. **Stats** : nombreTotal(), pourcentageFait(), prochaineTache() (la plus haute priorité non faite)
6. **Menu** : boucle avec prompt — 1.Ajouter, 2.Lister, 3.Terminer, 4.Supprimer, 5.Stats, 6.Quitter

Le programme tourne en boucle jusqu''à ce que l''utilisateur quitte.',
 'Un gestionnaire de tâches complet qui fonctionne en console. CRUD, filtres, tri, et stats.',
 2, 3, '{"code","craft","autonomy"}');

-- ==========================================
-- TRACK 5: DOM (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ej510000-0000-0000-0000-000000000001', 'tj500000-0000-0000-0000-000000000001',
 'Sélectionner et modifier le DOM',
 'querySelector, textContent, innerHTML, classList, style.',
 'Crée une page HTML avec du contenu statique, puis manipule-la avec JS :

1. **Sélection** : utilise getElementById, querySelector, querySelectorAll pour sélectionner des éléments
2. **Texte** : modifie le textContent d''un titre et l''innerHTML d''une section
3. **Classes** : ajoute, retire, toggle une classe avec classList.add/remove/toggle
4. **Style** : modifie le style.backgroundColor, style.color, style.fontSize d''un élément
5. **Attributs** : modifie le src d''une image, le href d''un lien, ajoute un data-attribute
6. **Exercice** : crée un bouton qui, au clic, change la couleur de fond de la page aléatoirement',
 'La page est manipulée dynamiquement. Le bouton change la couleur de fond.',
 2, 1, '{"code"}'),

('ej520000-0000-0000-0000-000000000001', 'tj500000-0000-0000-0000-000000000001',
 'Ajouter et supprimer des éléments',
 'createElement, append, remove, insertBefore. Construis le DOM dynamiquement.',
 'Crée une page où tout le contenu est généré par JavaScript :

1. **Créer** : createElement("div"), définir son contenu et ses classes, puis append au body
2. **Liste dynamique** : un input + bouton. Au clic, crée un <li> avec le texte et l''ajoute à une <ul>
3. **Supprimer** : chaque <li> a un bouton "×" qui le supprime (remove())
4. **Template** : crée une fonction `creerCard(nom, bio, avatar)` qui retourne un élément DOM complet
5. **Générer** : à partir d''un tableau de 5 devs, génère 5 cards et les insère dans la page
6. **Exercice** : crée un mini "Twitter" — input + bouton, chaque tweet s''ajoute en haut de la liste avec la date',
 'La page se construit dynamiquement. Les tweets s''ajoutent et se suppriment. Les cards sont générées depuis un tableau.',
 2, 2, '{"code","craft"}'),

('ej530000-0000-0000-0000-000000000001', 'tj500000-0000-0000-0000-000000000001',
 'Projet : Todo List (DOM)',
 'Reprends le gestionnaire de tâches et crée une vraie interface web.',
 'Transforme le todo-list console en une vraie app web :

1. **HTML** : input + bouton "Ajouter" + select priorité + liste <ul id="tasks">
2. **Ajouter** : au clic du bouton, crée un <li> avec le texte, la priorité (badge coloré), et un bouton "×"
3. **Supprimer** : le bouton "×" supprime la tâche
4. **Toggle** : cliquer sur la tâche la barre (text-decoration: line-through + opacity: 0.5)
5. **Compteur** : affiche "X tâches restantes" qui se met à jour automatiquement
6. **Filtre** : 3 boutons (Toutes / Actives / Terminées) qui filtrent l''affichage
7. **Style** : design clean et moderne, animations sur ajout/suppression

Pas de framework. Vanilla JS + CSS.',
 'Une todo list web fonctionnelle avec ajout, suppression, toggle, filtres, et compteur. Design propre.',
 2, 3, '{"code","craft","creativity"}');

-- ==========================================
-- TRACK 6: Événements (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ej610000-0000-0000-0000-000000000001', 'tj600000-0000-0000-0000-000000000001',
 'addEventListener et types d''événements',
 'Click, input, submit, keydown, mouseover. Le gestionnaire d''événements.',
 'Crée une page interactive qui démontre 6 types d''événements :

1. **Click** : un bouton qui compte les clics et affiche le total
2. **Double-click** : un élément qui change de couleur au double-clic
3. **Input** : un champ texte qui affiche en temps réel ce que tu tapes (miroir)
4. **Keydown** : affiche la touche pressée et son code (event.key, event.code)
5. **Mouseover/out** : une grille de 16 carrés qui changent de couleur au survol (Etch-a-Sketch simple)
6. **Submit** : un formulaire qui affiche les données sans recharger la page (event.preventDefault())

Utilise addEventListener (pas onclick inline).',
 'Chaque événement fonctionne. Le formulaire ne recharge pas la page. L''Etch-a-Sketch marche.',
 2, 1, '{"code","creativity"}'),

('ej620000-0000-0000-0000-000000000001', 'tj600000-0000-0000-0000-000000000001',
 'Propagation et délégation',
 'Bubbling, capturing, stopPropagation, event delegation.',
 'Crée ces démos :

1. **Bubbling** : 3 div imbriquées, chacune avec un click listener. Clique sur la plus interne → les 3 se déclenchent. Affiche l''ordre.
2. **stopPropagation** : ajoute stopPropagation sur la div du milieu → seules 2 se déclenchent
3. **Délégation** : une <ul> avec 10 <li>. UN SEUL addEventListener sur le <ul>, qui détecte quel <li> est cliqué (event.target)
4. **Délégation + ajout** : un bouton qui ajoute des <li>. Les nouveaux <li> sont AUSSI cliquables (grâce à la délégation)
5. **Timer** : un bouton "Start" qui lance un setInterval (compteur qui augmente chaque seconde) et un bouton "Stop" qui l''arrête
6. **Debounce** : un input de recherche qui n''affiche le résultat qu''après 300ms d''inactivité (setTimeout + clearTimeout)',
 'La délégation fonctionne même sur les éléments ajoutés dynamiquement. Le debounce fonctionne.',
 2, 2, '{"code","craft","autonomy"}'),

('ej630000-0000-0000-0000-000000000001', 'tj600000-0000-0000-0000-000000000001',
 'Projet : Chronomètre + Timer',
 'Un chronomètre avec start/stop/reset et un timer avec compte à rebours.',
 'Crée une double app chrono/timer :

**Chronomètre** :
1. Affichage : MM:SS:ms (centièmes)
2. Boutons : Start, Stop, Reset, Lap (enregistre un temps intermédiaire)
3. Liste des laps en dessous

**Timer** :
1. Input pour les minutes
2. Boutons : Start, Pause, Reset
3. Affichage compte à rebours MM:SS
4. Quand arrive à 0 : alerte + changement de couleur (rouge)
5. Progress bar qui diminue visuellement

**Design** : dark theme, police monospace pour les chiffres, animations fluides sur les boutons',
 'Chronomètre et timer fonctionnels. Les laps s''enregistrent. Le timer alerte à 0. Le design est soigné.',
 2, 3, '{"code","craft","creativity","autonomy"}');

-- ==========================================
-- TRACK 7: POO (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ej710000-0000-0000-0000-000000000001', 'tj700000-0000-0000-0000-000000000001',
 'Classes et constructeurs',
 'Crée des classes, comprends this, les méthodes, et l''encapsulation.',
 'Crée un système de personnages de jeu :

1. **Classe Personnage** : constructor(nom, pv, attaque), méthodes attaquer(cible), recevoirDegats(montant), estVivant()
2. **toString** : `"[Guerrier] Aragorn - 100 PV"`
3. **Getter** : get status() → "En forme" (>50% PV), "Blessé" (>25%), "Critique" (<25%), "Mort" (0)
4. **Setter** : set niveau(n) → vérifie que n est positif, sinon throw Error
5. **Méthode statique** : static creerAleatoire() → retourne un personnage avec des stats random
6. **Test** : crée 2 personnages et simule un combat tour par tour (boucle while les deux sont vivants)',
 'Le combat fonctionne tour par tour. Les getters et setters protègent les données. Le toString est propre.',
 3, 1, '{"code","creativity"}'),

('ej720000-0000-0000-0000-000000000001', 'tj700000-0000-0000-0000-000000000001',
 'Héritage et polymorphisme',
 'extends, super, surcharge de méthodes. L''héritage en pratique.',
 'Étends le système de personnages :

1. **Guerrier** extends Personnage : bonus d''attaque +50%, méthode coupSpecial() (double dégâts, 1 fois par combat)
2. **Mage** extends Personnage : méthode soigner(cible, montant), sort(cible) (dégâts magiques basés sur intelligence)
3. **Archer** extends Personnage : méthode tirPrecis(cible) (ignore l''armure), esquive passive (30% chance de dodge)
4. **Surcharge** : chaque sous-classe surcharge toString() et attaquer()
5. **instanceof** : vérifie le type de chaque personnage (personnage instanceof Guerrier)
6. **Combat** : crée une équipe de 3 (Guerrier, Mage, Archer) vs 3 ennemis. Combat automatique tour par tour.

Chaque classe doit appeler super() dans le constructeur.',
 'L''héritage fonctionne. Chaque classe a ses capacités uniques. Le combat d''équipe tourne.',
 3, 2, '{"code","craft","creativity"}'),

('ej730000-0000-0000-0000-000000000001', 'tj700000-0000-0000-0000-000000000001',
 'Projet : Fight Simulator (DOM)',
 'Combine POO + DOM pour un simulateur de combat visuel.',
 'Crée un Fight Simulator avec interface web :

1. **Sélection** : 2 panels. Chaque joueur choisit une classe (Guerrier/Mage/Archer) et un nom
2. **Affichage** : chaque personnage a une barre de PV (div avec width en %), nom, classe, stats
3. **Combat** : bouton "Attaquer" pour chaque joueur (tour par tour alternant)
4. **Actions** : chaque classe a 2 boutons (attaque normale + attaque spéciale)
5. **Log** : un historique de combat en bas ("Aragorn attaque Gandalf pour 25 dégâts")
6. **Fin** : quand un joueur tombe à 0 PV, animation de victoire + bouton "Revanche"

Design : dark theme, barres de vie colorées (vert→jaune→rouge), animations sur les attaques.',
 'Un fight simulator jouable dans le navigateur. Les classes sont distinctes. Les barres de vie s''animent.',
 3, 3, '{"code","craft","creativity","autonomy"}');

-- ==========================================
-- TRACK 8: Async & API (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ej810000-0000-0000-0000-000000000001', 'tj800000-0000-0000-0000-000000000001',
 'Promises et async/await',
 'Comprends l''asynchrone : callbacks, promises, then/catch, async/await.',
 'Crée ces programmes :

1. **Promise** : crée une fonction `attendre(ms)` qui retourne une Promise résolue après ms millisecondes
2. **Then/catch** : enchaîne 3 attendre() avec .then() pour afficher un message toutes les secondes
3. **Async/await** : réécris le même enchaînement avec async/await — beaucoup plus lisible
4. **Promise.all** : lance 3 attendre() en parallèle et affiche "Tout terminé" quand les 3 sont finis
5. **Promise.race** : lance 3 attendre(random) et affiche laquelle finit en premier
6. **Error handling** : crée une fonction qui rejette 50% du temps, gère l''erreur avec try/catch',
 'Les promises fonctionnent. Async/await est utilisé. Promise.all et race sont compris.',
 3, 1, '{"code","autonomy"}'),

('ej820000-0000-0000-0000-000000000001', 'tj800000-0000-0000-0000-000000000001',
 'Fetch et API REST',
 'Récupère et envoie des données avec fetch. Consomme une API.',
 'Utilise l''API JSONPlaceholder (jsonplaceholder.typicode.com) :

1. **GET** : fetch /posts, affiche les 10 premiers posts dans la page (titre + body)
2. **GET avec ID** : fetch /posts/1, affiche le détail d''un post
3. **POST** : crée un nouveau post avec fetch (method: POST, body: JSON.stringify)
4. **Error handling** : gère le cas où l''API ne répond pas (try/catch + message d''erreur dans la page)
5. **Loading state** : affiche "Chargement..." pendant le fetch, puis le contenu
6. **Exercice** : crée un champ de recherche qui filtre les posts par titre en temps réel (fetch all + filter)',
 'Les données s''affichent. Le POST fonctionne. Le loading state est visible. La recherche filtre.',
 3, 2, '{"code","versatility"}'),

('ej830000-0000-0000-0000-000000000001', 'tj800000-0000-0000-0000-000000000001',
 'Projet : App Météo',
 'Crée une app météo avec une API réelle, géolocalisation, et localStorage.',
 'Crée une app météo complète :

1. **API** : utilise OpenWeatherMap (api.openweathermap.org, clé gratuite) ou wttr.in (pas de clé)
2. **Recherche** : input ville + bouton → affiche température, description, icône météo
3. **Géolocalisation** : bouton "Ma position" → navigator.geolocation → affiche la météo locale
4. **LocalStorage** : sauvegarde la dernière ville recherchée, la pré-charge au démarrage
5. **Design** : background qui change selon la météo (soleil = jaune, pluie = gris, nuit = sombre)
6. **Prévisions** : affiche les 3 prochains jours (si l''API le permet)
7. **Error handling** : ville introuvable → message d''erreur élégant

Dark theme, icônes météo, transitions fluides.',
 'Une app météo fonctionnelle avec recherche, géolocalisation, et persistence localStorage. Design qui s''adapte à la météo.',
 3, 3, '{"code","craft","creativity","autonomy","versatility"}');

-- ==========================================
-- TRACK 9: Projets finaux JS (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ej910000-0000-0000-0000-000000000001', 'tj900000-0000-0000-0000-000000000001',
 'Générateur de citations',
 'Un générateur de citations aléatoires avec catégories et partage.',
 'Crée un générateur de citations :

1. **Données** : un tableau de 20+ citations avec auteur, texte, catégorie
2. **Affichage** : card centrale avec la citation, l''auteur, et la catégorie (badge)
3. **Bouton** : "Nouvelle citation" → affiche une citation aléatoire avec animation (fade out → fade in)
4. **Filtres** : boutons par catégorie (Motivation, Humour, Tech, Philosophie)
5. **Favoris** : bouton ♥ qui ajoute la citation aux favoris (localStorage), page favoris
6. **Partage** : bouton "Copier" qui copie la citation dans le clipboard (navigator.clipboard)
7. **Design** : fond qui change de couleur à chaque citation, typo élégante serif',
 'Le générateur fonctionne avec filtres, favoris persistants, et copie clipboard.',
 3, 1, '{"code","craft","creativity"}'),

('ej920000-0000-0000-0000-000000000001', 'tj900000-0000-0000-0000-000000000001',
 'Thème persistant + préférences',
 'Un site avec dark/light mode, taille de texte, et préférences sauvegardées.',
 'Crée un site de blog avec des préférences utilisateur :

1. **Dark/Light** : toggle qui switch le thème (CSS variables) et sauvegarde dans localStorage
2. **Taille texte** : slider qui change la font-size de 14px à 22px, sauvegardé
3. **Police** : sélecteur entre 3 polices (serif, sans-serif, mono), sauvegardé
4. **Couleur accent** : 5 choix de couleur accent (orange, bleu, vert, violet, rouge), sauvegardé
5. **Au chargement** : toutes les préférences sont restaurées depuis localStorage
6. **Reset** : bouton qui efface toutes les préférences et recharge la page
7. **Panneau settings** : un panel slide-in depuis la droite (toggle avec un bouton ⚙)

Le site doit avoir du vrai contenu (3 articles) pour voir l''effet des préférences.',
 'Toutes les préférences persistent entre les sessions. Le panel settings slide élégamment.',
 3, 2, '{"code","craft","autonomy"}'),

('ej930000-0000-0000-0000-000000000001', 'tj900000-0000-0000-0000-000000000001',
 'Mini e-commerce (JS complet)',
 'Le boss final JS. Un mini-store avec panier, filtres, et localStorage.',
 'Crée un mini e-commerce complet en vanilla JS :

1. **Produits** : tableau de 12 produits (id, nom, prix, image, catégorie, stock)
2. **Catalogue** : grille de produits générée par JS, bouton "Ajouter au panier" sur chaque
3. **Filtres** : par catégorie (boutons), par prix (range input), recherche par nom (input)
4. **Tri** : par prix croissant/décroissant, par nom, par popularité
5. **Panier** : icône avec badge (nombre d''articles), panel slide qui montre les produits, quantités modifiables, suppression, total calculé
6. **LocalStorage** : le panier persiste entre les sessions
7. **Checkout** : page récapitulative avec formulaire (nom, email, adresse), validation JS, confirmation

Le tout en vanilla JS. Pas de framework, pas de librairie. Design premium.',
 'Un mini e-commerce complet fonctionnel : catalogue, filtres, tri, panier persistant, checkout. Le boss final est terminé.',
 3, 3, '{"code","craft","creativity","autonomy","versatility"}');
