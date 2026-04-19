-- ==========================================
-- DYG Training — Python Curriculum
-- 9 tracks, 27 exercises
-- ==========================================

INSERT INTO training_tracks (id, name, description, level, sort_order) VALUES
('tp100000-0000-0000-0000-000000000001', 'Python — Les bases', 'Print, input, variables, types, concaténation. Tes premiers programmes.', 1, 20),
('tp200000-0000-0000-0000-000000000001', 'Python — Logique & Boucles', 'If/else, for, while, opérateurs logiques, compréhensions de liste.', 1, 21),
('tp300000-0000-0000-0000-000000000001', 'Python — Fonctions', 'Paramètres, return, scope, *args, **kwargs, annotations de type.', 1, 22),
('tp400000-0000-0000-0000-000000000001', 'Python — Listes, Tuples, Dicts', 'Structures de données, slices, méthodes, compréhensions avancées.', 2, 23),
('tp500000-0000-0000-0000-000000000001', 'Python — POO', 'Classes, __init__, héritage, méthodes statiques, surcharge, polymorphisme.', 2, 24),
('tp600000-0000-0000-0000-000000000001', 'Python — Fichiers & Erreurs', 'Lecture/écriture fichiers, CSV, Pandas, try/except, logging.', 2, 25),
('tp700000-0000-0000-0000-000000000001', 'Python — APIs & Web', 'Requests, JSON, APIs REST, web scraping, variables d''environnement.', 3, 26),
('tp800000-0000-0000-0000-000000000001', 'Python — Bases de données', 'SQLite, TinyDB, requêtes SQL, CRUD complet.', 3, 27),
('tp900000-0000-0000-0000-000000000001', 'Python — Projets', 'Chiffre de César, Pendu, Quiz, Bot, Scraper. Les boss finaux.', 3, 28);

-- ==========================================
-- TRACK 1: Les bases (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ep110000-0000-0000-0000-000000000001', 'tp100000-0000-0000-0000-000000000001',
 'Premier programme Python',
 'Print, input, variables, types primitifs. Les fondations.',
 'Crée un fichier main.py :

1. **Print** : affiche "Bonjour, DYG !" et un retour à la ligne avec \n
2. **Input** : demande le nom et l''âge de l''utilisateur avec input()
3. **Variables** : stocke les réponses dans `nom` et `age`. Crée une constante `VERSION = "1.0"`
4. **Concaténation** : affiche "Bonjour {nom}, tu as {age} ans !" avec f-string
5. **Types** : affiche type(nom), type(age). Convertis age en int avec int()
6. **Opérations** : calcule et affiche l''année de naissance (2026 - age)
7. **Commentaires** : commente chaque section avec des # explicatifs

Le programme doit tourner sans erreur dans le terminal : python main.py',
 'Le programme interagit avec l''utilisateur, affiche son nom, son âge, et son année de naissance.',
 1, 1, '{"code"}'),

('ep120000-0000-0000-0000-000000000001', 'tp100000-0000-0000-0000-000000000001',
 'Types et opérations',
 'Strings, nombres, conversions, opérations math, fonctions built-in.',
 'Crée un programme "Calculatrice de base" :

1. **String methods** : sur "  Hello World  " → strip(), upper(), lower(), replace(), split(), len()
2. **Math** : import math → math.sqrt(16), math.ceil(4.1), math.floor(4.9), math.pi, round()
3. **Random** : import random → random.randint(1, 100), random.choice(["a", "b", "c"])
4. **Conversions** : int("42"), float("3.14"), str(42), bool(0), bool(1), bool("")
5. **Slicing** : sur "Python" → [0], [-1], [0:3], [::-1] (reverse)
6. **Exercice** : demande un prix HT et un taux de TVA → affiche le prix TTC et l''arrondi à 2 décimales

Tout dans le terminal, pas d''interface graphique.',
 'La calculatrice affiche le prix TTC correctement arrondi. Les méthodes string et math sont maîtrisées.',
 1, 2, '{"code","craft"}'),

('ep130000-0000-0000-0000-000000000001', 'tp100000-0000-0000-0000-000000000001',
 'Simulateur de crédits',
 'Combine input, calculs, et f-strings pour un programme utile.',
 'Crée un simulateur de crédit immobilier :

1. **Inputs** : montant emprunté, taux annuel (%), durée en années
2. **Calcul** : mensualité = M * (t/12) / (1 - (1 + t/12)^(-n*12)) où M=montant, t=taux, n=années
3. **Affichage** : mensualité, coût total du crédit, intérêts totaux payés
4. **Format** : affiche les montants avec 2 décimales et le symbole € (f"{montant:.2f} €")
5. **Comparaison** : demande un 2ème scénario (durée différente) et compare les deux
6. **Tableau** : affiche les 5 premières mensualités avec capital restant dû

Programme purement terminal.',
 'Le simulateur calcule correctement les mensualités. La comparaison entre 2 scénarios est claire.',
 1, 3, '{"code","craft","autonomy"}');

-- ==========================================
-- TRACK 2: Logique & Boucles (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ep210000-0000-0000-0000-000000000001', 'tp200000-0000-0000-0000-000000000001',
 'Conditions et opérateurs',
 'If/elif/else, opérateurs logiques, ternaires, comparaisons de strings.',
 'Crée un programme "Distributeur de mentions" :

1. **If/elif/else** : demande une note sur 20, affiche la mention (Très Bien >= 16, Bien >= 14, AB >= 12, Passable >= 10, Insuffisant)
2. **Opérateurs** : demande âge et permis (o/n) → "Vous pouvez conduire" si age >= 18 AND permis == "o"
3. **Ternaire** : `statut = "Majeur" if age >= 18 else "Mineur"` → affiche
4. **String** : demande un email → vérifie avec in, startswith, endswith si il est valide
5. **Imbriqué** : demande un nombre → affiche s''il est positif/négatif, pair/impair, divisible par 3
6. **Exercice** : crée un calculateur d''IMC → demande poids et taille → affiche l''IMC et la catégorie (maigreur, normal, surpoids, obésité)',
 'L''IMC est calculé correctement avec la bonne catégorie. Les conditions sont maîtrisées.',
 1, 1, '{"code"}'),

('ep220000-0000-0000-0000-000000000001', 'tp200000-0000-0000-0000-000000000001',
 'Boucles et itérations',
 'For, while, range, break, continue, compréhensions de liste.',
 'Crée ces programmes :

1. **For range** : affiche la table de multiplication d''un nombre demandé (1×7=7, 2×7=14, ...)
2. **For in** : parcours une liste de fruits et affiche chaque fruit numéroté
3. **While** : jeu "devine le nombre" — le programme choisit entre 1-100, le joueur devine (plus grand/plus petit)
4. **Break/Continue** : parcours 1-50, skip les multiples de 7, arrête à 40
5. **Compréhension** : `carres = [x**2 for x in range(1, 11)]` et `pairs = [x for x in range(100) if x % 2 == 0]`
6. **FizzBuzz** : 1-100, "Fizz" si multiple de 3, "Buzz" de 5, "FizzBuzz" des deux

Tout en terminal.',
 'FizzBuzz fonctionne. Le jeu de devinette tourne. Les compréhensions de liste sont utilisées.',
 1, 2, '{"code","autonomy"}'),

('ep230000-0000-0000-0000-000000000001', 'tp200000-0000-0000-0000-000000000001',
 'Projet : Pierre Feuille Ciseaux',
 'Combine aléatoire, boucles, et conditions pour un jeu complet.',
 'Crée un jeu Pierre Feuille Ciseaux :

1. **Choix** : le joueur tape "pierre", "feuille", ou "ciseaux"
2. **IA** : l''ordinateur choisit aléatoirement avec random.choice
3. **Règles** : pierre > ciseaux, ciseaux > feuille, feuille > pierre
4. **Score** : compte les victoires du joueur et de l''IA
5. **Manches** : demande combien de manches (3, 5, 7). Le premier à la majorité gagne
6. **Fin** : affiche le score final et "Victoire !" ou "Défaite..." ou "Égalité"
7. **Rejouer** : demande "Rejouer ? (o/n)"

Le jeu doit être jouable en boucle.',
 'Le PFC fonctionne avec score, manches configurables, et option de rejouer.',
 1, 3, '{"code","creativity","autonomy"}');

-- ==========================================
-- TRACK 3: Fonctions (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ep310000-0000-0000-0000-000000000001', 'tp300000-0000-0000-0000-000000000001',
 'Fonctions : bases et scope',
 'Def, paramètres, return, scope local/global, valeurs par défaut.',
 'Crée un module de fonctions utilitaires :

1. **Simple** : `saluer(nom)` → retourne "Bonjour, {nom} !"
2. **Défaut** : `saluer(nom="visiteur")` → fonctionne sans argument
3. **Return** : `calculer_imc(poids, taille)` → retourne l''IMC
4. **Multi-return** : `min_max(liste)` → retourne un tuple (minimum, maximum)
5. **Scope** : démontre qu''une variable dans une fonction n''existe pas dehors
6. **Global** : montre comment modifier une variable globale avec `global`
7. **Docstring** : ajoute des docstrings à chaque fonction ("""Description""")

Crée un main.py qui importe et teste chaque fonction.',
 'Chaque fonction fonctionne avec différents arguments. Les docstrings sont complètes.',
 1, 1, '{"code","craft"}'),

('ep320000-0000-0000-0000-000000000001', 'tp300000-0000-0000-0000-000000000001',
 'Fonctions avancées : *args, **kwargs, type hints',
 'Arguments flexibles, annotations de type, fonctions lambda.',
 'Crée ces fonctions :

1. **args** : `somme(*nombres)` → retourne la somme de tous les arguments
2. **kwargs** : `creer_profil(**infos)` → retourne un dictionnaire avec toutes les infos passées
3. **Mix** : `configurer(nom, *options, **params)` → affiche le tout de manière structurée
4. **Lambda** : `doubler = lambda x: x * 2` et utilise avec map(), filter()
5. **Type hints** : `def calculer_prix(prix: float, tva: float = 0.20) -> float:` avec annotations
6. **Exercice** : crée `generer_mot_de_passe(longueur: int = 12, majuscules: bool = True, chiffres: bool = True, speciaux: bool = False) -> str`

Le générateur de mot de passe doit être configurable.',
 'Le générateur de mot de passe fonctionne avec toutes les options. Les type hints sont corrects.',
 2, 2, '{"code","craft","autonomy"}'),

('ep330000-0000-0000-0000-000000000001', 'tp300000-0000-0000-0000-000000000001',
 'Projet : Chiffre de César',
 'Crée un outil de chiffrement/déchiffrement avec des fonctions.',
 'Crée un programme de chiffrement César :

1. **Chiffrer** : `chiffrer(texte, decalage)` → décale chaque lettre de N positions dans l''alphabet
2. **Déchiffrer** : `dechiffrer(texte, decalage)` → inverse le décalage
3. **Alphabet** : gère les majuscules et minuscules, ignore les espaces et ponctuation
4. **Wrap** : après Z, revient à A (modulo 26)
5. **Menu** : 1.Chiffrer, 2.Déchiffrer, 3.Bruteforce (essaie les 26 décalages), 4.Quitter
6. **Bruteforce** : affiche les 26 possibilités pour trouver le bon décalage
7. **Module** : sépare les fonctions dans un fichier `cesar.py`, importe dans `main.py`

Le programme doit être interactif et tourner en boucle.',
 'Le chiffrement/déchiffrement fonctionne. Le bruteforce affiche les 26 possibilités. Le code est modulaire.',
 2, 3, '{"code","craft","creativity","autonomy"}');

-- ==========================================
-- TRACKS 4-9 (exercices résumés pour garder le fichier gérable)
-- ==========================================

-- TRACK 4: Listes, Tuples, Dicts
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ep410000-0000-0000-0000-000000000001', 'tp400000-0000-0000-0000-000000000001',
 'Listes : méthodes et manipulations',
 'Append, pop, sort, reverse, slices, compréhensions avancées.',
 'Crée un gestionnaire de notes d''élèves :\n\n1. Liste de 10 notes aléatoires (random.randint)\n2. Affiche : min, max, moyenne, médiane\n3. Trie croissant/décroissant\n4. Filtre les notes >= 10 avec compréhension\n5. Crée une liste de tuples (note, mention)\n6. Bonus : histogramme en ASCII (★ par note)',
 'Le gestionnaire de notes affiche toutes les stats correctement.', 2, 1, '{"code","craft"}'),

('ep420000-0000-0000-0000-000000000001', 'tp400000-0000-0000-0000-000000000001',
 'Dictionnaires et tuples',
 'Clés, valeurs, items, imbrication, tuples immuables.',
 'Crée un annuaire téléphonique :\n\n1. Dictionnaire contacts = {nom: {"tel": "...", "email": "...", "ville": "..."}}\n2. CRUD : ajouter, rechercher, modifier, supprimer un contact\n3. Recherche par ville : affiche tous les contacts d''une ville\n4. Export : affiche tous les contacts formatés\n5. Stats : nombre total, villes uniques, contacts par ville\n6. Menu interactif en boucle',
 'L''annuaire fonctionne avec toutes les opérations CRUD et les recherches.', 2, 2, '{"code","craft","autonomy"}'),

('ep430000-0000-0000-0000-000000000001', 'tp400000-0000-0000-0000-000000000001',
 'Projet : Compteur de mots',
 'Analyse un texte : mots les plus fréquents, statistiques complètes.',
 'Crée un analyseur de texte :\n\n1. Demande un texte (ou lit un fichier)\n2. Compte : nombre de mots, caractères, phrases, paragraphes\n3. Fréquence : les 10 mots les plus utilisés (dictionnaire)\n4. Ignore les mots communs ("le", "la", "de", "et")\n5. Affiche un classement formaté\n6. Bonus : calcule le temps de lecture estimé (200 mots/min)',
 'L''analyseur donne des stats précises et le classement des mots est correct.', 2, 3, '{"code","craft","creativity"}');

-- TRACK 5: POO
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ep510000-0000-0000-0000-000000000001', 'tp500000-0000-0000-0000-000000000001',
 'Classes et __init__',
 'Crée des classes, comprends self, __init__, __str__, attributs et méthodes.',
 'Crée un système de gestion de bibliothèque :\n\n1. Classe Livre : titre, auteur, annee, disponible\n2. __str__ : "[Dispo] Le Petit Prince - Saint-Exupéry (1943)"\n3. Méthodes : emprunter(), rendre()\n4. Classe Bibliotheque : liste de livres\n5. Méthodes : ajouter_livre(), rechercher(titre), livres_disponibles(), livres_empruntes()\n6. Menu interactif : ajouter, rechercher, emprunter, rendre, lister',
 'La bibliothèque fonctionne avec CRUD complet et gestion des emprunts.', 2, 1, '{"code","craft"}'),

('ep520000-0000-0000-0000-000000000001', 'tp500000-0000-0000-0000-000000000001',
 'Héritage et polymorphisme',
 'extends, super(), surcharge, méthodes statiques et de classe.',
 'Crée un système de personnages RPG :\n\n1. Classe Personnage : nom, pv, attaque, defense\n2. Guerrier(Personnage) : coup_special(), bonus defense\n3. Mage(Personnage) : sort(), mana\n4. Archer(Personnage) : tir_precis(), esquive\n5. Méthode de classe : Personnage.creer_aleatoire(classe)\n6. Combat tour par tour entre 2 personnages',
 'Le combat fonctionne. Chaque classe a ses capacités uniques. L''héritage est correct.', 3, 2, '{"code","creativity"}'),

('ep530000-0000-0000-0000-000000000001', 'tp500000-0000-0000-0000-000000000001',
 'Projet : Qui veut gagner des millions',
 'Un quiz POO complet avec niveaux, paliers, et jokers.',
 'Crée le jeu QVGDM :\n\n1. Classe Question : texte, choix (A/B/C/D), bonne_reponse\n2. Classe Jeu : liste de 15 questions, palier actuel, gains\n3. Paliers : 100€ → 200€ → 500€ → 1000€ → ... → 1M€\n4. Paliers sécurisés : 1000€ et 32000€\n5. À chaque question : affiche les choix, demande la réponse\n6. "Voulez-vous continuer ou empocher ?" après chaque bonne réponse\n7. Mauvaise réponse → retombe au dernier palier sécurisé',
 'Le quiz fonctionne avec les paliers, les paliers sécurisés, et l''option d''empocher.', 3, 3, '{"code","craft","creativity","autonomy"}');

-- TRACK 6: Fichiers & Erreurs
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ep610000-0000-0000-0000-000000000001', 'tp600000-0000-0000-0000-000000000001',
 'Lecture et écriture de fichiers',
 'Open, read, write, with, chemins relatifs/absolus.',
 'Crée un programme de journal :\n\n1. Écrire une entrée (date + texte) dans journal.txt\n2. Lire toutes les entrées\n3. Rechercher par mot-clé\n4. Compter le nombre d''entrées\n5. Exporter en format structuré\n6. Utilise "with open" pour chaque opération',
 'Le journal sauvegarde et lit correctement. La recherche fonctionne.', 2, 1, '{"code","autonomy"}'),

('ep620000-0000-0000-0000-000000000001', 'tp600000-0000-0000-0000-000000000001',
 'CSV et gestion d''erreurs',
 'Fichiers CSV, try/except, exceptions custom, logging.',
 'Crée un gestionnaire de budget :\n\n1. Stocke les dépenses dans un fichier CSV (date, catégorie, montant, description)\n2. Ajouter, lister, filtrer par catégorie, total par mois\n3. Try/except sur toutes les entrées utilisateur\n4. Exception custom : MontantInvalide si montant < 0\n5. Logging : log chaque opération dans budget.log\n6. Pandas : lis le CSV avec pandas et affiche des stats',
 'Le budget se sauvegarde en CSV. Les erreurs sont gérées proprement. Les logs tracent tout.', 2, 2, '{"code","craft","autonomy"}'),

('ep630000-0000-0000-0000-000000000001', 'tp600000-0000-0000-0000-000000000001',
 'Projet : Clone de Bitwarden (local)',
 'Un gestionnaire de mots de passe avec fichier chiffré.',
 'Crée un password manager local :\n\n1. Stocke les credentials dans un fichier JSON\n2. Master password demandé au lancement\n3. CRUD : ajouter, lister, rechercher, modifier, supprimer\n4. Générateur de mot de passe intégré\n5. Copie dans le clipboard (pyperclip)\n6. Chiffrement basique du fichier (base64 minimum)',
 'Le password manager fonctionne avec master password et stockage persistant.', 3, 3, '{"code","craft","creativity","autonomy"}');

-- TRACK 7: APIs & Web
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ep710000-0000-0000-0000-000000000001', 'tp700000-0000-0000-0000-000000000001',
 'Requêtes API avec requests',
 'GET, POST, JSON, headers, gestion d''erreurs API.',
 'Utilise l''API JSONPlaceholder :\n\n1. GET /posts : affiche les 10 premiers posts\n2. GET /posts/1 : affiche un post détaillé\n3. POST /posts : crée un post (title, body, userId)\n4. Gère les erreurs HTTP (status_code != 200)\n5. Parse le JSON et affiche de manière formatée\n6. Exercice : affiche les posts d''un utilisateur spécifique',
 'Les requêtes GET et POST fonctionnent. Les erreurs sont gérées.', 3, 1, '{"code","versatility"}'),

('ep720000-0000-0000-0000-000000000001', 'tp700000-0000-0000-0000-000000000001',
 'Web scraping avec BeautifulSoup',
 'Crawler un site, extraire des données, respecter le robots.txt.',
 'Crée un scraper de news :\n\n1. Installe requests + beautifulsoup4\n2. Récupère le HTML d''un site public (ex: news.ycombinator.com)\n3. Extrais les titres avec find_all()\n4. Extrais les liens\n5. Sauvegarde dans un fichier CSV\n6. Respecte le robots.txt du site',
 'Le scraper extrait les titres et liens correctement et les sauvegarde en CSV.', 3, 2, '{"code","versatility","autonomy"}'),

('ep730000-0000-0000-0000-000000000001', 'tp700000-0000-0000-0000-000000000001',
 'Projet : Alerte prix Bitcoin par email',
 'API crypto + envoi d''email automatique.',
 'Crée un système d''alerte :\n\n1. API CoinGecko (gratuite) pour le prix du Bitcoin\n2. Seuil configurable (alerte si prix < X ou > Y)\n3. Envoie un email avec smtplib si le seuil est franchi\n4. Variables d''environnement pour les credentials (os.environ)\n5. Log chaque vérification\n6. Planifiable avec time.sleep en boucle',
 'L''alerte vérifie le prix et envoie un email quand le seuil est franchi.', 3, 3, '{"code","craft","creativity","autonomy","versatility"}');

-- TRACK 8: Bases de données
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ep810000-0000-0000-0000-000000000001', 'tp800000-0000-0000-0000-000000000001',
 'SQLite : CRUD complet',
 'Créer une DB, tables, INSERT, SELECT, UPDATE, DELETE.',
 'Crée un carnet de contacts en SQLite :\n\n1. Crée la DB contacts.db\n2. Table : id, nom, email, telephone, ville, created_at\n3. INSERT : ajouter un contact\n4. SELECT : lister, rechercher par nom, filtrer par ville\n5. UPDATE : modifier un contact\n6. DELETE : supprimer un contact\n7. Menu interactif CRUD complet',
 'Le carnet CRUD fonctionne avec SQLite. Les données persistent entre les exécutions.', 3, 1, '{"code","autonomy"}'),

('ep820000-0000-0000-0000-000000000001', 'tp800000-0000-0000-0000-000000000001',
 'TinyDB : base de données JSON',
 'Alternative NoSQL légère pour les petits projets.',
 'Crée un système de bookmarks :\n\n1. TinyDB stocke dans bookmarks.json\n2. Chaque bookmark : url, titre, tags (liste), date_ajout\n3. CRUD complet\n4. Recherche par tag\n5. Export en HTML (page de liens cliquables)\n6. Import depuis un fichier texte (une URL par ligne)',
 'Les bookmarks se sauvegardent en JSON. L''export HTML est navigable.', 3, 2, '{"code","craft"}'),

('ep830000-0000-0000-0000-000000000001', 'tp800000-0000-0000-0000-000000000001',
 'Projet : Gestionnaire de tâches persistant',
 'Todo-list avec SQLite, priorités, dates, et stats.',
 'Crée un todo-list avancé avec SQLite :\n\n1. Table : id, titre, priorite, fait, date_creation, date_echeance\n2. CRUD complet\n3. Filtres : par priorité, par statut, en retard (date_echeance < aujourd''hui)\n4. Stats : total, faites, en retard, taux de complétion\n5. Export CSV\n6. Purge : supprimer les tâches terminées de plus de 30 jours',
 'Le todo-list persiste en SQLite avec filtres, stats, et export.', 3, 3, '{"code","craft","autonomy"}');

-- TRACK 9: Projets finaux Python
INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('ep910000-0000-0000-0000-000000000001', 'tp900000-0000-0000-0000-000000000001',
 'Jeu du Pendu complet',
 'Le pendu avec ASCII art, catégories, et scores persistants.',
 'Crée un pendu complet :\n\n1. Dictionnaire de 50+ mots par catégorie (animaux, pays, tech)\n2. Le joueur choisit une catégorie\n3. Affichage ASCII art du pendu (7 étapes)\n4. Lettres déjà jouées affichées\n5. Score sauvegardé dans un fichier (wins/losses)\n6. Tableau des meilleurs scores\n7. Option "indice" : révèle une lettre (1 seul indice par partie)',
 'Le pendu est jouable avec catégories, ASCII art, et scores persistants.', 3, 1, '{"code","creativity","autonomy"}'),

('ep920000-0000-0000-0000-000000000001', 'tp900000-0000-0000-0000-000000000001',
 'Scraper + Dashboard (terminal)',
 'Scrape des données et affiche un dashboard dans le terminal.',
 'Crée un dashboard terminal :\n\n1. Scrape 3 sources (météo, crypto, news) avec requests/BeautifulSoup\n2. Affiche dans le terminal avec des bordures ASCII (╔═══╗)\n3. Rafraîchissement automatique toutes les 60 secondes\n4. Sauvegarde l''historique dans SQLite\n5. Alertes configurables (prix crypto > seuil)\n6. Log des erreurs de scraping',
 'Le dashboard affiche des données en temps réel avec un design terminal soigné.', 3, 2, '{"code","craft","creativity","versatility"}'),

('ep930000-0000-0000-0000-000000000001', 'tp900000-0000-0000-0000-000000000001',
 'Bot automatisé (le boss final Python)',
 'Un bot qui scrape, analyse, et envoie des rapports automatiquement.',
 'Crée un bot de veille techno :\n\n1. Scrape Hacker News ou dev.to pour les articles trending\n2. Filtre par mots-clés configurables (Python, JavaScript, AI, etc.)\n3. Stocke les articles dans SQLite (évite les doublons)\n4. Génère un rapport quotidien (top 10 articles)\n5. Envoie le rapport par email\n6. Variables d''env pour les credentials\n7. Logging complet\n8. Gestion d''erreurs robuste (try/except partout)\n\nLe bot doit pouvoir tourner en tâche planifiée.',
 'Le bot scrape, filtre, stocke, et envoie un rapport. Le boss final Python est terminé.',
 3, 3, '{"code","craft","creativity","autonomy","versatility"}');
