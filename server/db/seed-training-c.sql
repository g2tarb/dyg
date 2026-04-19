-- ==========================================
-- DYG Training — C Curriculum
-- 7 tracks, 21 exercises
-- ==========================================

INSERT INTO training_tracks (id, name, description, level, sort_order) VALUES
('ca100000-0000-0000-0000-000000000001', 'C — Les bases', 'Printf, scanf, variables, types, opérateurs. Le langage le plus proche de la machine.', 1, 30),
('ca200000-0000-0000-0000-000000000001', 'C — Contrôle de flux', 'If/else, switch, for, while, do-while. La logique en C.', 1, 31),
('ca300000-0000-0000-0000-000000000001', 'C — Fonctions & Pointeurs', 'Prototypes, passage par référence, pointeurs, arithmétique de pointeurs.', 2, 32),
('ca400000-0000-0000-0000-000000000001', 'C — Tableaux & Strings', 'Arrays, strings (char*), manipulation mémoire, buffer overflow.', 2, 33),
('ca500000-0000-0000-0000-000000000001', 'C — Structs & Mémoire', 'Struct, typedef, malloc, free, linked lists. La gestion mémoire manuelle.', 3, 34),
('ca600000-0000-0000-0000-000000000001', 'C — Fichiers & Avancé', 'fopen, fread, fwrite, argc/argv, Makefile, multi-fichiers.', 3, 35),
('ca700000-0000-0000-0000-000000000001', 'C — Projets', 'Calculatrice, mini-shell, jeu de la vie. Les boss en C pur.', 3, 36);

-- TRACK 1: Les bases
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('cb110000-0000-0000-0000-000000000001', 'ca100000-0000-0000-0000-000000000001',
 'Hello World et types',
 'Premier programme C : compilation, printf, variables, types primitifs.',
 'Crée un fichier main.c :

1. **Hello World** : #include <stdio.h>, int main(), printf("Hello DYG!\n"), return 0
2. **Compilation** : compile avec gcc main.c -o main && ./main
3. **Variables** : déclare int age, float taille, char initiale, char nom[50]
4. **Printf formaté** : affiche chaque variable avec %d, %f, %c, %s
5. **Scanf** : demande le nom et l''âge avec scanf("%s", nom) et scanf("%d", &age)
6. **Sizeof** : affiche la taille en octets de chaque type avec sizeof()
7. **Overflow** : montre ce qui se passe quand un int dépasse sa limite (2147483647 + 1)',
 'Le programme compile sans warning, affiche les types et leurs tailles, et gère l''input utilisateur.',
 1, 1, '{"code"}'),

('cb120000-0000-0000-0000-000000000001', 'ca100000-0000-0000-0000-000000000001',
 'Opérateurs et casting',
 'Arithmétique, logique, bit à bit, cast explicite.',
 'Crée un programme qui démontre :

1. **Arithmétique** : +, -, *, /, % — attention à la division entière (7/2 = 3, pas 3.5)
2. **Cast** : (float)7 / 2 = 3.5 — montre la différence
3. **Incrémentation** : i++, ++i, i--, --i — montre la différence pre/post
4. **Bit à bit** : &, |, ^, ~, <<, >> — affiche en binaire avec une fonction maison
5. **Logique** : &&, ||, ! — avec des exemples concrets
6. **Ternaire** : int max = (a > b) ? a : b
7. **Exercice** : convertisseur de températures (Celsius ↔ Fahrenheit) avec scanf',
 'Le convertisseur fonctionne dans les deux sens. Les opérations bit à bit sont comprises.',
 1, 2, '{"code","craft"}'),

('cb130000-0000-0000-0000-000000000001', 'ca100000-0000-0000-0000-000000000001',
 'Compilation et flags',
 'GCC, flags de compilation, warnings, Makefile basique.',
 'Crée un projet multi-fichiers :

1. **Flags** : compile avec -Wall -Wextra -Werror — corrige tous les warnings
2. **Debug** : compile avec -g, utilise gdb ou lldb pour debugger
3. **Optimisation** : compare -O0, -O2, -O3 sur un calcul lourd (boucle 1M itérations)
4. **Makefile** : crée un Makefile avec les règles all, clean, re
5. **Header** : crée un utils.h avec les prototypes et utils.c avec les implémentations
6. **Exercice** : programme qui calcule la factorielle de N (demandé à l''utilisateur)

Le Makefile doit compiler le projet en une commande : make',
 'Le Makefile compile le projet. Les flags -Wall -Werror passent sans erreur.',
 1, 3, '{"code","autonomy"}');

-- TRACK 2: Contrôle de flux
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('cb210000-0000-0000-0000-000000000001', 'ca200000-0000-0000-0000-000000000001',
 'Conditions et switch',
 'If/else, switch/case, opérateurs de comparaison.',
 'Crée ces programmes :

1. **If/else** : demande un âge → affiche la catégorie (enfant <12, ado <18, adulte <65, senior)
2. **Switch** : demande un numéro de mois (1-12) → affiche le nom et le nombre de jours
3. **Nested if** : vérifie si une année est bissextile (divisible par 4, sauf par 100, sauf par 400)
4. **Menu** : un menu interactif avec switch : 1.Addition 2.Soustraction 3.Multiplication 4.Quitter
5. **Exercice** : résolveur d''équation du second degré (ax² + bx + c = 0) avec discriminant',
 'L''année bissextile est correcte. L''équation du second degré gère les 3 cas (2 solutions, 1, 0).',
 1, 1, '{"code"}'),

('cb220000-0000-0000-0000-000000000001', 'ca200000-0000-0000-0000-000000000001',
 'Boucles : for, while, do-while',
 'Itérations, boucles imbriquées, break, continue.',
 'Crée ces programmes :

1. **For** : affiche un triangle d''étoiles (1 étoile, 2 étoiles, ... N étoiles)
2. **While** : jeu "devine le nombre" (1-100, plus grand/plus petit, compte les essais)
3. **Do-while** : demande un mot de passe en boucle jusqu''à ce qu''il soit correct
4. **Imbriqué** : affiche la table de multiplication de 1 à 10 (formatée en colonnes)
5. **Break/Continue** : parcours 1-100, affiche uniquement les nombres premiers
6. **Exercice** : FizzBuzz en C (1-100)',
 'Les nombres premiers sont corrects. FizzBuzz fonctionne. Le triangle d''étoiles est aligné.',
 1, 2, '{"code","autonomy"}'),

('cb230000-0000-0000-0000-000000000001', 'ca200000-0000-0000-0000-000000000001',
 'Projet : Jeu de devinette avancé',
 'Combine boucles et conditions pour un jeu complet en C.',
 'Crée un jeu de devinette :

1. **Nombre aléatoire** : srand(time(NULL)) + rand() % 100 + 1
2. **Boucle de jeu** : le joueur a 7 essais max
3. **Indices** : "Plus grand", "Plus petit", "Chaud !" (±5), "Brûlant !" (±2)
4. **Score** : calcule un score basé sur le nombre d''essais (7=100pts, 1=700pts)
5. **Historique** : sauvegarde les 5 meilleurs scores (tableau statique)
6. **Rejouer** : demande "Rejouer ? (o/n)" après chaque partie',
 'Le jeu fonctionne avec les indices de température. Le score et le classement s''affichent.',
 1, 3, '{"code","creativity","autonomy"}');

-- TRACK 3: Fonctions & Pointeurs
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('cb310000-0000-0000-0000-000000000001', 'ca300000-0000-0000-0000-000000000001',
 'Fonctions et prototypes',
 'Déclaration, prototypes, passage par valeur, retour.',
 'Crée une bibliothèque mathématique :

1. **Prototypes** : déclare dans math_utils.h : int puissance(int base, int exp), int factorielle(int n), int pgcd(int a, int b), int est_premier(int n)
2. **Implémentation** : code chaque fonction dans math_utils.c
3. **Main** : main.c qui teste chaque fonction avec plusieurs valeurs
4. **Makefile** : compile le tout avec make
5. **Récursif** : implémente factorielle et pgcd en récursif
6. **Exercice** : ajoute fibonacci(int n) itératif ET récursif, compare les performances avec clock()',
 'La bibliothèque compile. Toutes les fonctions retournent les bons résultats. Fibonacci récursif est plus lent.',
 2, 1, '{"code","craft"}'),

('cb320000-0000-0000-0000-000000000001', 'ca300000-0000-0000-0000-000000000001',
 'Pointeurs et mémoire',
 'Adresses, déréférencement, passage par référence, pointeurs et tableaux.',
 'Crée ces programmes :

1. **Adresses** : déclare int x = 42. Affiche x, &x, et un pointeur int *p = &x
2. **Déréférencement** : modifie x via *p = 100. Affiche x (doit être 100)
3. **Passage par référence** : void swap(int *a, int *b) qui échange deux variables
4. **Tableau et pointeur** : montre que tab[i] == *(tab + i)
5. **Pointeur de pointeur** : int **pp — montre l''indirection double
6. **Exercice** : fonction void tri_bulle(int *tab, int taille) qui trie un tableau via pointeurs',
 'Le swap fonctionne. Le tri bulle trie correctement un tableau de 10 nombres aléatoires.',
 2, 2, '{"code","autonomy"}'),

('cb330000-0000-0000-0000-000000000001', 'ca300000-0000-0000-0000-000000000001',
 'Projet : Calculatrice en notation polonaise inverse',
 'Une calculatrice RPN avec pile (stack) implémentée en C.',
 'Crée une calculatrice RPN :

1. **Stack** : implémente une pile avec un tableau (push, pop, peek, is_empty)
2. **RPN** : "3 4 + 2 *" = (3+4)*2 = 14
3. **Opérations** : +, -, *, /, % (modulo)
4. **Parsing** : lis l''entrée mot par mot (strtok), si nombre → push, si opérateur → pop 2, calcule, push résultat
5. **Erreurs** : gère la division par 0 et la pile vide
6. **Boucle** : le programme tourne jusqu''à "quit"',
 'La calculatrice RPN fonctionne. "3 4 + 2 *" retourne 14. Les erreurs sont gérées.',
 2, 3, '{"code","craft","creativity","autonomy"}');

-- TRACKS 4-7 (résumés)
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('cb410000-0000-0000-0000-000000000001', 'ca400000-0000-0000-0000-000000000001',
 'Tableaux statiques et dynamiques', 'Arrays, allocation dynamique, realloc.', 'Crée un tableau dynamique qui grandit automatiquement :\n\n1. malloc pour allouer\n2. realloc pour agrandir quand plein\n3. free pour libérer\n4. Fonctions : init(), push(), get(), size(), destroy()\n5. Test avec 100 insertions\n6. Vérifie avec valgrind (pas de memory leak)', 'Le tableau dynamique fonctionne sans memory leak.', 2, 1, '{"code","craft"}'),

('cb420000-0000-0000-0000-000000000001', 'ca400000-0000-0000-0000-000000000001',
 'Strings en C', 'char*, strlen, strcpy, strcat, strcmp, strtok.', 'Crée un programme de manipulation de strings :\n\n1. Implémente my_strlen, my_strcpy, my_strcmp from scratch\n2. Concaténation : my_strcat\n3. Recherche : my_strstr (trouve une sous-chaîne)\n4. Inverse : my_strrev\n5. Exercice : programme qui compte les mots dans une phrase', 'Toutes les fonctions string custom marchent comme les originales.', 2, 2, '{"code","autonomy"}'),

('cb430000-0000-0000-0000-000000000001', 'ca400000-0000-0000-0000-000000000001',
 'Projet : Mini grep', 'Cherche un pattern dans un fichier (comme grep).', 'Crée un mini-grep :\n\n1. ./my_grep "pattern" fichier.txt\n2. Affiche les lignes qui contiennent le pattern\n3. Option -n : affiche le numéro de ligne\n4. Option -i : ignore la casse\n5. Option -c : compte les occurrences\n6. Gère les erreurs (fichier inexistant)', 'my_grep fonctionne comme le vrai grep pour les options basiques.', 2, 3, '{"code","craft","autonomy"}'),

('cb510000-0000-0000-0000-000000000001', 'ca500000-0000-0000-0000-000000000001',
 'Structs et typedef', 'Structures, typedef, pointeurs de struct, listes chaînées.', 'Crée une liste chaînée :\n\n1. struct Node { int data; struct Node *next; }\n2. Fonctions : push_front, push_back, pop_front, print_list, free_list\n3. Recherche : find(list, value)\n4. Tri : sort_list (insertion sort)\n5. Reverse : reverse_list\n6. Test avec 10 éléments', 'La liste chaînée fonctionne avec toutes les opérations. Pas de memory leak.', 3, 1, '{"code","craft"}'),

('cb520000-0000-0000-0000-000000000001', 'ca500000-0000-0000-0000-000000000001',
 'Gestion mémoire avancée', 'malloc, calloc, realloc, free, détection de fuites.', 'Crée un allocateur mémoire simplifié :\n\n1. Wrapper : void *my_malloc(size_t size) qui log chaque allocation\n2. Wrapper : void my_free(void *ptr) qui log chaque libération\n3. Compteur : affiche le nombre d''allocations/libérations à la fin\n4. Détection : warning si des allocations ne sont pas libérées\n5. Test avec un programme qui alloue et libère des structs', 'Le tracker détecte les memory leaks et affiche un rapport à la fin.', 3, 2, '{"code","craft","autonomy"}'),

('cb530000-0000-0000-0000-000000000001', 'ca500000-0000-0000-0000-000000000001',
 'Projet : Gestionnaire de contacts (structs)', 'CRUD complet avec structs et fichier binaire.', 'Crée un carnet de contacts :\n\n1. struct Contact { char nom[50]; char tel[20]; char email[100]; }\n2. CRUD : ajouter, lister, chercher, modifier, supprimer\n3. Sauvegarde : fwrite/fread dans un fichier binaire contacts.dat\n4. Chargement : charge les contacts au démarrage\n5. Tri : trie par nom\n6. Menu interactif', 'Les contacts persistent entre les exécutions. Le CRUD est complet.', 3, 3, '{"code","craft","autonomy"}'),

('cb610000-0000-0000-0000-000000000001', 'ca600000-0000-0000-0000-000000000001',
 'Fichiers et I/O', 'fopen, fclose, fprintf, fscanf, fgets, modes r/w/a.', 'Crée un logger :\n\n1. Écrit des logs formatés dans un fichier (date + niveau + message)\n2. Niveaux : INFO, WARNING, ERROR\n3. Rotation : quand le fichier dépasse 1000 lignes, archive et crée un nouveau\n4. Lecture : fonction qui affiche les N dernières lignes\n5. Recherche : fonction qui cherche par niveau ou par mot-clé', 'Le logger écrit, lit, et cherche dans les fichiers correctement.', 3, 1, '{"code","autonomy"}'),

('cb620000-0000-0000-0000-000000000001', 'ca600000-0000-0000-0000-000000000001',
 'Arguments et multi-fichiers', 'argc/argv, projet multi-fichiers, header guards.', 'Crée un outil CLI :\n\n1. ./tool --help affiche l''aide\n2. ./tool --upper "hello" → HELLO\n3. ./tool --lower "HELLO" → hello\n4. ./tool --reverse "hello" → olleh\n5. ./tool --count "hello world" → 2 mots\n6. Projet en 4 fichiers : main.c, parser.c, string_ops.c, et leurs .h\n7. Header guards (#ifndef) sur chaque .h', 'L''outil CLI fonctionne avec tous les flags. Le projet compile proprement.', 3, 2, '{"code","craft","versatility"}'),

('cb710000-0000-0000-0000-000000000001', 'ca700000-0000-0000-0000-000000000001',
 'Mini-shell', 'Un shell basique qui exécute des commandes.', 'Crée un mini-shell :\n\n1. Affiche un prompt "dyg> "\n2. Lit une commande avec fgets\n3. Parse la commande (split par espaces)\n4. Fork + execvp pour exécuter la commande\n5. Builtin : cd, pwd, exit\n6. Gestion du Ctrl+C (signal SIGINT)\n7. Historique des 10 dernières commandes', 'Le shell exécute ls, cat, echo. cd et pwd fonctionnent. Ctrl+C ne kill pas le shell.', 3, 1, '{"code","craft","creativity","autonomy"}'),

('cb720000-0000-0000-0000-000000000001', 'ca700000-0000-0000-0000-000000000001',
 'Jeu de la vie de Conway', 'Simulation cellulaire en terminal.', 'Crée le Game of Life :\n\n1. Grille 40x20 de cellules (vivantes/mortes)\n2. Règles de Conway : naissance (3 voisins), survie (2-3), mort (sinon)\n3. Affichage : clear screen + print à chaque génération\n4. Vitesse : configurable avec usleep()\n5. Patterns prédéfinis : glider, blinker, toad\n6. Input : charger un pattern depuis un fichier .cells\n7. Pause/play avec une touche', 'Le jeu de la vie tourne avec les bonnes règles. Les patterns classiques fonctionnent.', 3, 2, '{"code","creativity","autonomy","versatility"}'),

('cb730000-0000-0000-0000-000000000001', 'ca700000-0000-0000-0000-000000000001',
 'Serveur TCP basique', 'Socket, bind, listen, accept. Le réseau en C.', 'Crée un serveur echo TCP :\n\n1. socket() → bind() → listen() → accept()\n2. Le serveur reçoit un message et le renvoie en majuscules\n3. Multi-client : fork() pour chaque connexion\n4. Client : programme client.c qui se connecte et envoie un message\n5. Protocole : le client envoie "QUIT" pour fermer la connexion\n6. Log : affiche l''IP de chaque client qui se connecte', 'Le serveur accepte plusieurs clients. Les messages sont renvoyés en majuscules.', 3, 3, '{"code","craft","creativity","autonomy","versatility"}');
