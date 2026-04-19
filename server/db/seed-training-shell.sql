-- ==========================================
-- DYG Training — Shell / Terminal Curriculum
-- Inspiré de la piscine 42, exercices renommés
-- 6 tracks, 18 exercises
-- ==========================================

INSERT INTO training_tracks (id, name, description, level, sort_order) VALUES
('ae100000-0000-0000-0000-000000000001', 'Shell — Premiers pas', 'Navigation, fichiers, permissions. Apprends à vivre dans le terminal.', 1, 50),
('ae200000-0000-0000-0000-000000000001', 'Shell — Fichiers & Permissions', 'Chmod, tar, find, file. Maîtrise le système de fichiers Unix.', 1, 51),
('ae300000-0000-0000-0000-000000000001', 'Shell — Git essentiel', 'Init, add, commit, log, ignore. Le minimum vital pour tout dev.', 2, 52),
('ae400000-0000-0000-0000-000000000001', 'Shell — Pipes & Redirections', 'Pipe, grep, sed, awk, sort, uniq, wc. La puissance du terminal.', 2, 53),
('ae500000-0000-0000-0000-000000000001', 'Shell — Scripts Bash', 'Variables, conditions, boucles, fonctions. L''automatisation.', 3, 54),
('ae600000-0000-0000-0000-000000000001', 'Shell — Projets', 'Scripts d''automatisation complets. Le terminal comme outil de production.', 3, 55);

-- ==========================================
-- TRACK 1: Premiers pas (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('af110000-0000-0000-0000-000000000001', 'ae100000-0000-0000-0000-000000000001',
 'ft_navigate : Se déplacer dans le terminal',
 'pwd, ls, cd, mkdir, touch, rm. Les commandes de base pour naviguer.',
 'Crée un dossier de projet et démontre ces commandes :

1. **pwd** : affiche où tu es
2. **mkdir -p** : crée un dossier dyg_shell/ex01/src (avec les parents)
3. **cd** : entre dans le dossier, reviens en arrière (cd ..), va au home (cd ~)
4. **touch** : crée 5 fichiers (main.c, utils.c, main.h, utils.h, Makefile)
5. **ls -la** : liste tout (hidden + détails + permissions)
6. **rm -rf** : supprime le dossier src et tout son contenu
7. **Exercice** : crée un script create_project.sh qui prend un nom en argument et crée l''arborescence : nom/src/, nom/include/, nom/tests/, nom/Makefile, nom/README.md

Sauvegarde le script et les commandes dans un fichier commands.txt.',
 'Le script crée l''arborescence correcte. Toutes les commandes sont maîtrisées.',
 1, 1, '{"code","autonomy"}'),

('af120000-0000-0000-0000-000000000001', 'ae100000-0000-0000-0000-000000000001',
 'ft_copy_move : Copier, déplacer, renommer',
 'cp, mv, ln, cat, head, tail. Manipule tes fichiers comme un pro.',
 'Réalise ces opérations :

1. **cp** : copie un fichier (cp file.txt backup.txt), copie un dossier (cp -r src/ src_backup/)
2. **mv** : déplace un fichier dans un dossier (mv file.txt src/), renomme (mv old.txt new.txt)
3. **ln -s** : crée un lien symbolique vers un fichier
4. **cat** : affiche le contenu d''un fichier, concatène 2 fichiers (cat a.txt b.txt > merged.txt)
5. **head / tail** : affiche les 5 premières / dernières lignes (head -n 5, tail -n 5)
6. **Exercice** : crée un script ft_backup.sh qui copie tous les fichiers .c et .h d''un dossier vers un dossier backup/ avec la date dans le nom (backup_2026-04-19/)

Le script doit utiliser la commande date pour générer le nom du dossier.',
 'Le script de backup copie les bons fichiers avec la date dans le nom du dossier.',
 1, 2, '{"code","craft"}'),

('af130000-0000-0000-0000-000000000001', 'ae100000-0000-0000-0000-000000000001',
 'ft_echo_write : Écrire et lire dans des fichiers',
 'echo, >, >>, tee, wc. Écris dans des fichiers depuis le terminal.',
 'Réalise ces opérations :

1. **echo** : echo "Hello" > file.txt (écrase), echo "World" >> file.txt (ajoute)
2. **cat <<EOF** : écris un fichier multi-lignes avec heredoc
3. **tee** : echo "log" | tee output.txt (affiche ET écrit)
4. **wc** : compte les lignes (wc -l), mots (wc -w), caractères (wc -c) d''un fichier
5. **diff** : compare 2 fichiers et affiche les différences
6. **Exercice** : crée un script ft_create_header.sh qui génère un fichier .h avec les header guards automatiques : prend le nom en argument, génère #ifndef NOM_H, #define NOM_H, #endif',
 'Le script génère un header C valide avec les guards corrects (NOM_H en majuscules).',
 1, 3, '{"code","autonomy"}');

-- ==========================================
-- TRACK 2: Fichiers & Permissions (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('af210000-0000-0000-0000-000000000001', 'ae200000-0000-0000-0000-000000000001',
 'ft_permissions : chmod, chown, umask',
 'Comprends et modifie les permissions Unix.',
 'Réalise ces opérations :

1. **ls -l** : lis les permissions d''un fichier (rwxrwxrwx = user/group/other)
2. **chmod numérique** : chmod 755 script.sh (rwxr-xr-x), chmod 644 file.txt (rw-r--r--)
3. **chmod symbolique** : chmod u+x file (ajoute exec au user), chmod go-w file (retire write aux autres)
4. **Exercice** : crée un fichier avec les permissions exactes : -r--r-xr-x (chmod 155)
5. **umask** : affiche le umask actuel, calcule les permissions par défaut
6. **Script exécutable** : crée un script .sh, rends-le exécutable (chmod +x), exécute-le avec ./script.sh',
 'Les permissions sont comprises. Le fichier a exactement les permissions demandées.',
 1, 1, '{"code","autonomy"}'),

('af220000-0000-0000-0000-000000000001', 'ae200000-0000-0000-0000-000000000001',
 'ft_archive : tar, zip, find',
 'Compresse, décompresse, et cherche des fichiers.',
 'Réalise ces opérations :

1. **tar** : crée une archive (tar -czf archive.tar.gz dossier/), extrais (tar -xzf archive.tar.gz)
2. **find** : trouve tous les .c dans le dossier courant (find . -name "*.c")
3. **find + exec** : trouve et supprime tous les fichiers temporaires (find . -name "*~" -delete)
4. **find avancé** : trouve les fichiers modifiés dans les 24h (find . -mtime -1)
5. **file** : identifie le type d''un fichier (file image.png, file script.sh)
6. **Exercice** : crée un script ft_clean.sh qui trouve et supprime tous les fichiers #*# et *~ récursivement, affiche le nombre de fichiers supprimés',
 'Le script de nettoyage trouve et supprime les fichiers temporaires. Le compteur est correct.',
 1, 2, '{"code","craft","autonomy"}'),

('af230000-0000-0000-0000-000000000001', 'ae200000-0000-0000-0000-000000000001',
 'ft_file_magic : Identifier et manipuler les types de fichiers',
 'file, xxd, stat, du. Comprends ce qu''il y a dans un fichier.',
 'Réalise ces opérations :

1. **file** : crée 5 fichiers de types différents (.txt, .sh, .c, .py, vide) → identifie chacun avec file
2. **xxd** : affiche le contenu hexadécimal d''un fichier (xxd file | head)
3. **stat** : affiche les métadonnées complètes d''un fichier (taille, dates, inode)
4. **du** : affiche la taille d''un dossier (du -sh), de chaque sous-dossier (du -h --max-depth=1)
5. **Magic bytes** : crée un fichier dont file dit "42 file" (indice : les premiers octets définissent le type)
6. **Exercice** : crée un script ft_info.sh qui prend un chemin en argument et affiche : type (file), taille (du), permissions (stat), et dernière modification',
 'Le script affiche toutes les infos d''un fichier. Le magic bytes est compris.',
 2, 3, '{"code","craft","autonomy"}');

-- ==========================================
-- TRACK 3: Git essentiel (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('af310000-0000-0000-0000-000000000001', 'ae300000-0000-0000-0000-000000000001',
 'ft_git_init : Les bases de Git',
 'Init, add, commit, status, log. Le workflow Git de base.',
 'Crée un repo Git et pratique :

1. **git init** : initialise un repo
2. **git add** : ajoute des fichiers (git add file.c, git add ., git add -A)
3. **git commit** : commit avec un message clair (-m "Add main function")
4. **git status** : vérifie l''état du repo à chaque étape
5. **git log** : affiche l''historique (git log --oneline, git log --graph)
6. **Exercice** : crée un script ft_git_log.sh qui affiche les 5 derniers hash de commit (juste le hash, rien d''autre) — indice : git log --pretty=tformat:"%H" -5',
 'Le script affiche exactement les 5 derniers hash. Le workflow Git est maîtrisé.',
 2, 1, '{"code","collaboration"}'),

('af320000-0000-0000-0000-000000000001', 'ae300000-0000-0000-0000-000000000001',
 'ft_gitignore : Ignorer les bons fichiers',
 'Crée un .gitignore efficace pour chaque type de projet.',
 'Crée des .gitignore pour différents projets :

1. **C** : ignore *.o, *.a, *.out, *.d, les exécutables compilés
2. **Node.js** : ignore node_modules/, dist/, .env, *.log
3. **Python** : ignore __pycache__/, *.pyc, venv/, .env
4. **Global** : .DS_Store, Thumbs.db, *.swp, *~, #*#
5. **git check-ignore** : vérifie que les fichiers sont bien ignorés
6. **Exercice** : crée un script ft_gitignore.sh qui affiche la liste de tous les fichiers ignorés dans le repo courant — indice : git check-ignore *',
 'Les .gitignore sont corrects pour chaque langage. Le script liste les fichiers ignorés.',
 2, 2, '{"code","craft","collaboration"}'),

('af330000-0000-0000-0000-000000000001', 'ae300000-0000-0000-0000-000000000001',
 'ft_git_branch : Branches et merge',
 'Branch, checkout, merge, rebase, conflicts.',
 'Pratique le workflow de branches :

1. **Créer** : git branch feature, git checkout -b feature (raccourci)
2. **Lister** : git branch (locales), git branch -a (toutes)
3. **Merge** : crée 2 branches, modifie le même fichier, merge → résous le conflit
4. **Rebase** : refais la même chose avec rebase au lieu de merge — comprends la différence
5. **Delete** : git branch -d feature (après merge)
6. **Exercice** : crée un projet avec 3 branches (main, feature-login, feature-dashboard), merge les 2 features dans main sans conflit. Affiche le graph avec git log --oneline --graph --all',
 'Les 3 branches sont mergées proprement. Le graph montre l''historique complet.',
 2, 3, '{"code","collaboration","autonomy"}');

-- ==========================================
-- TRACK 4: Pipes & Redirections (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('af410000-0000-0000-0000-000000000001', 'ae400000-0000-0000-0000-000000000001',
 'ft_pipe : Le pipe Unix',
 'Enchaîne des commandes avec |. La philosophie Unix.',
 'Réalise ces pipelines :

1. **ls | wc -l** : compte le nombre de fichiers dans un dossier
2. **cat file.txt | grep "error"** : filtre les lignes contenant "error"
3. **cat file.txt | sort | uniq** : trie et supprime les doublons
4. **cat file.txt | sort | uniq -c | sort -rn | head -10** : top 10 des lignes les plus fréquentes
5. **ps aux | grep node** : trouve les processus Node.js
6. **Exercice** : crée un fichier avec 100 noms aléatoires. Avec UN SEUL pipeline, affiche le top 5 des prénoms les plus fréquents avec leur compte, triés du plus au moins fréquent',
 'Le pipeline affiche le bon classement. La philosophie "une commande = une tâche" est comprise.',
 2, 1, '{"code","craft"}'),

('af420000-0000-0000-0000-000000000001', 'ae400000-0000-0000-0000-000000000001',
 'ft_grep_sed : Chercher et remplacer',
 'grep, sed, awk. Les outils de traitement de texte Unix.',
 'Réalise ces opérations :

1. **grep** : cherche un mot dans tous les .c (grep -r "printf" *.c)
2. **grep -n** : affiche les numéros de ligne
3. **grep -c** : compte les occurrences
4. **grep -v** : affiche les lignes qui NE contiennent PAS le pattern
5. **sed** : remplace toutes les occurrences (sed "s/foo/bar/g" file.txt)
6. **sed in-place** : modifie le fichier directement (sed -i "s/old/new/g" file.txt)
7. **Exercice** : crée un script ft_replace.sh qui prend 3 arguments (ancien, nouveau, fichier) et remplace toutes les occurrences',
 'Le script de remplacement fonctionne. grep et sed sont maîtrisés.',
 2, 2, '{"code","craft","autonomy"}'),

('af430000-0000-0000-0000-000000000001', 'ae400000-0000-0000-0000-000000000001',
 'ft_awk_power : Traitement de données avec awk',
 'Awk : le couteau suisse du traitement de texte.',
 'Crée un fichier CSV de données (nom,age,ville,salaire) avec 20 lignes, puis :

1. **Colonnes** : awk -F"," ''{print $1, $4}'' data.csv → affiche nom et salaire
2. **Filtre** : awk -F"," ''$3 == "Paris"'' data.csv → lignes de Paris
3. **Calcul** : awk -F"," ''{sum += $4} END {print sum/NR}'' → salaire moyen
4. **Format** : awk -F"," ''{printf "%-20s %10s€\n", $1, $4}'' → tableau aligné
5. **Condition** : awk -F"," ''$4 > 3000 {count++} END {print count}'' → nombre au dessus de 3000
6. **Exercice** : crée un script ft_stats.sh qui prend un CSV en argument et affiche : nombre de lignes, salaire min, max, moyen, et la personne la mieux payée',
 'Le script affiche les bonnes stats. Awk est utilisé pour les calculs.',
 3, 3, '{"code","craft","versatility"}');

-- ==========================================
-- TRACK 5: Scripts Bash (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('af510000-0000-0000-0000-000000000001', 'ae500000-0000-0000-0000-000000000001',
 'ft_script_basics : Variables et conditions en Bash',
 'Variables, if/else, read, arguments. Les bases du scripting.',
 'Crée ces scripts :

1. **Variables** : NAME="DYG", echo "Hello $NAME", echo "Il y a $(ls | wc -l) fichiers"
2. **Arguments** : echo "Arg 1: $1, Arg 2: $2, Total: $#"
3. **Read** : read -p "Ton nom: " name → echo "Salut $name"
4. **If/else** : vérifie si un fichier existe (if [ -f "$1" ]; then ...)
5. **Conditions** : -d (dossier), -f (fichier), -x (exécutable), -z (string vide)
6. **Exercice** : crée ft_check.sh qui prend un chemin en argument et dit si c''est un fichier, un dossier, un lien symbolique, ou s''il n''existe pas',
 'Le script identifie correctement fichiers, dossiers, et liens.',
 3, 1, '{"code","autonomy"}'),

('af520000-0000-0000-0000-000000000001', 'ae500000-0000-0000-0000-000000000001',
 'ft_loops : Boucles et fonctions en Bash',
 'For, while, case, fonctions. Automatise tout.',
 'Crée ces scripts :

1. **For** : for file in *.c; do echo "$file"; done — liste tous les .c
2. **While** : while read line; do echo "$line"; done < file.txt — lit ligne par ligne
3. **Case** : case "$1" in start) echo "Starting";; stop) echo "Stopping";; *) echo "Usage: $0 {start|stop}";; esac
4. **Fonctions** : function ft_log() { echo "[$(date)] $1"; } — une fonction de logging
5. **Select** : select opt in "Option 1" "Option 2" "Quitter"; do ... done — menu interactif
6. **Exercice** : crée ft_batch_rename.sh qui renomme tous les fichiers d''un dossier en ajoutant un préfixe (ex: ft_batch_rename.sh "2026_" → renomme file.txt en 2026_file.txt)',
 'Le script de renommage fonctionne. Les boucles et fonctions sont maîtrisées.',
 3, 2, '{"code","craft","autonomy"}'),

('af530000-0000-0000-0000-000000000001', 'ae500000-0000-0000-0000-000000000001',
 'ft_deploy : Script de déploiement',
 'Un vrai script d''automatisation de déploiement.',
 'Crée ft_deploy.sh qui automatise un déploiement :

1. **Vérifications** : vérifie que git est clean (pas de changements non commités)
2. **Tests** : exécute les tests (make test ou npm test) — si fail, abort
3. **Build** : exécute le build (make ou npm run build)
4. **Tag** : crée un tag git avec le numéro de version (argument du script)
5. **Push** : git push origin main && git push --tags
6. **Log** : écrit dans deploy.log : date, version, hash du commit, status (success/fail)
7. **Rollback** : option --rollback qui revient au tag précédent (git checkout tags/v_previous)
8. **Couleurs** : messages en vert (succès), rouge (erreur), jaune (warning)

Le script doit être robuste : chaque étape vérifie le code de retour ($?).',
 'Le script déploie, tag, push, et log. Le rollback fonctionne. Les erreurs sont gérées.',
 3, 3, '{"code","craft","autonomy","versatility"}');

-- ==========================================
-- TRACK 6: Projets Shell (3 exercices)
-- ==========================================

INSERT INTO training_exercises (id, track_id, title, description, instructions, expected_result, level, sort_order, pillar_impact) VALUES
('af610000-0000-0000-0000-000000000001', 'ae600000-0000-0000-0000-000000000001',
 'ft_monitor : Monitoring système',
 'Un dashboard terminal qui affiche les stats du système.',
 'Crée ft_monitor.sh :

1. **CPU** : affiche l''utilisation CPU (top -l 1 ou /proc/stat sur Linux)
2. **RAM** : affiche la RAM utilisée/totale (free -h ou vm_stat sur Mac)
3. **Disque** : affiche l''espace disque (df -h)
4. **Processus** : top 5 processus par CPU (ps aux --sort=-%cpu | head -6)
5. **Réseau** : affiche l''IP locale (ifconfig ou ip addr)
6. **Boucle** : rafraîchit toutes les 2 secondes (while true; do clear; ...; sleep 2; done)
7. **Format** : bordures ASCII, couleurs ANSI, alignement propre',
 'Le dashboard affiche les stats en temps réel avec un format propre.',
 3, 1, '{"code","craft","autonomy"}'),

('af620000-0000-0000-0000-000000000001', 'ae600000-0000-0000-0000-000000000001',
 'ft_setup : Script d''installation de poste dev',
 'Automatise l''installation de ton environnement de développement.',
 'Crée ft_setup.sh qui installe un poste de dev :

1. **Détection OS** : if [[ "$OSTYPE" == "darwin"* ]] → Mac, elif [[ "$OSTYPE" == "linux-gnu"* ]] → Linux
2. **Package manager** : brew (Mac) ou apt (Linux)
3. **Installations** : git, node, python3, gcc, vim/nvim
4. **Config git** : git config --global user.name, user.email
5. **SSH key** : génère une clé SSH si elle n''existe pas (ssh-keygen)
6. **Dotfiles** : crée .bashrc/.zshrc avec des alias utiles (ll, gs, gc, gp)
7. **Vérification** : à la fin, affiche la version de chaque outil installé
8. **Idempotent** : le script peut tourner plusieurs fois sans casser (vérifie avant d''installer)',
 'Le script installe tout et affiche les versions. Il est idempotent (peut tourner 2 fois sans erreur).',
 3, 2, '{"code","craft","versatility","autonomy"}'),

('af630000-0000-0000-0000-000000000001', 'ae600000-0000-0000-0000-000000000001',
 'ft_cron_bot : Bot automatisé avec cron',
 'Un bot qui tourne automatiquement et envoie des rapports.',
 'Crée un système de bot automatisé :

1. **Script principal** : ft_daily_report.sh qui génère un rapport (date, disk usage, git status de tes projets, derniers commits)
2. **Cron** : configure crontab pour lancer le script tous les jours à 8h (0 8 * * * /path/to/ft_daily_report.sh)
3. **Email** : le rapport est envoyé par email (mail ou sendmail) ou sauvegardé dans un fichier
4. **Rotation** : garde les 7 derniers rapports, supprime les plus anciens
5. **Alertes** : si le disque est rempli à >80%, ajoute un WARNING dans le rapport
6. **Log** : chaque exécution est loguée avec le timestamp et le status

Le bot doit fonctionner en autonomie totale.',
 'Le bot génère des rapports quotidiens. La rotation fonctionne. Les alertes se déclenchent.',
 3, 3, '{"code","craft","autonomy","versatility"}');
