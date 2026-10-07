# DYG — Do Your Game

> Scanne ton GitHub en 10 secondes. Découvre ton archétype de développeur. Entraîne-toi. Livre de vrais projets. Construis un portfolio qu'on ne peut pas ignorer.

**Repo** : `github.com/g2tarb/dyg`
**Prod** : https://dyg-olfu.onrender.com (branche `main` — version scan GitHub)
**Statut** : Alpha — Early Access
**Par** : 4Dayvelopment (Scory)

---

## Table des matières

1. [Le problème et la réponse](#1-le-problème-et-la-réponse)
2. [Les deux branches du repo](#2-les-deux-branches-du-repo)
3. [Stack technique](#3-stack-technique)
4. [Démarrage rapide](#4-démarrage-rapide)
5. [Variables d'environnement](#5-variables-denvironnement)
6. [Architecture](#6-architecture)
7. [Le moteur de scoring](#7-le-moteur-de-scoring)
8. [Les 8 archétypes](#8-les-8-archétypes)
9. [Les pôles fonctionnels](#9-les-pôles-fonctionnels)
10. [Base de données](#10-base-de-données)
11. [API — Référence complète](#11-api--référence-complète)
12. [Routes frontend](#12-routes-frontend)
13. [Sécurité](#13-sécurité)
14. [Tâches de fond (cron in-process)](#14-tâches-de-fond-cron-in-process)
15. [Déploiement](#15-déploiement)
16. [Modèle économique](#16-modèle-économique)
17. [Dépannage](#17-dépannage)

---

## 1. Le problème et la réponse

**Le problème.** Les développeurs autodidactes ont des compétences mais aucune preuve. GitHub est illisible pour un recruteur. LinkedIn est déclaratif. Les plateformes de challenges testent de la théorie déconnectée du réel. Aucune plateforme ne mesure ce qu'un développeur *fait réellement* pour le transformer en quelque chose de vérifiable.

**La réponse.** DYG scanne un profil GitHub et génère une identité de développeur complète en 10 secondes :

- **Scoring sur 8 piliers** — Code, Velocity, Craft, Collaboration, Versatility, Creativity, Autonomy, IA Mastery (échelle 1–10)
- **8 archétypes** — Architect, Shipper, Artisan, Creative, Explorer, Commando, Mentor, Synth
- **Détection du style de dev** — Traditional, Vibe Coder ou IA Architect
- **Bio générée par IA** — basée sur les patterns de code réels, pas sur du déclaratif

**L'avantage concurrentiel.** Aucune plateforme existante ne combine analyse GitHub + système d'archétypes + projets d'équipe + peer review + portfolio vérifiable.

| Concurrent | Ce qu'il fait | Ce que DYG fait |
|---|---|---|
| LinkedIn | déclare les compétences | les **prouve** |
| GitHub | stocke le code | le **traduit** |
| LeetCode | teste la théorie | mesure la **réalité** |
| Toptal | interviewe une fois | score **en continu** |

---

## 2. Les deux branches du repo

Le repo contient deux versions distinctes du produit. C'est voulu.

### `main` — Scanner GitHub (en production)

Version publiée, recentrée sur une seule proposition de valeur : **scanner un GitHub sans créer de compte**. L'utilisateur arrive, saisit un pseudo GitHub, reçoit un score sur 8 axes, un archétype et des conseils. Pas d'inscription, pas de friction.

Commit de recentrage : `4a74311 refactor: recentre DYG sur le scan GitHub pour publication`

### `archive/full-platform-2026-06-14` — Plateforme complète (la plus poussée)

La plateforme à 3 pôles intégrale, archivée le 14 juin 2026. **+7 142 lignes** par rapport à `main`, 48 fichiers touchés. C'est la version documentée en détail dans ce README.

```bash
git checkout archive/full-platform-2026-06-14
```

Ce que l'archive ajoute par rapport à `main` :

| Ajout | Fichiers |
|---|---|
| Messagerie multicanale | `src/pages/messages.js`, `server/routes/messages.js`, `server/services/chat.js` |
| Système d'amis + blocage | `src/pages/friends.js`, `server/services/friendships.js` |
| Notifications universelles | `src/pages/notifications.js`, `server/services/notifications.js` |
| Inter-Division Wars | `src/pages/wars.js`, `server/services/wars.js`, `warScheduler.js` |
| Training (148 exercices) | `src/pages/training.js`, `server/routes/training.js`, `server/services/reviewer.js` |
| Projets d'équipe + briefs | `src/pages/projects.js`, `projectDetail.js`, `server/routes/projects.js` |
| Team Builder + synergie | `src/pages/teamBuilder.js`, `server/services/synergy.js` |
| Saisons + divisions + classement | `src/pages/leaderboard.js`, `server/services/seasons.js` |
| Coach IA idle | `src/components/idleCoach.js` |
| Bio Gemini | `server/services/gemini.js` (remplace `bio.js`) |

---

## 3. Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Frontend | Vanilla JavaScript SPA — **zéro framework** | — |
| Build | Vite | 8.0.8 |
| Backend | Fastify (Node.js, ESM) | 5.8.5 |
| Base de données | PostgreSQL | 16 |
| Driver DB | `pg` (pool) | 8.20.0 |
| Validation | Zod | 4.3.6 |
| Auth | GitHub OAuth2 + JWT HttpOnly | `@fastify/oauth2` 8.2.0 |
| Chiffrement | AES-256-GCM (tokens GitHub au repos) | `node:crypto` |
| Logs | Pino (structuré, avec redaction) | 10.3.1 |
| IA | Google Gemini API (génération de bio) | — |
| Email | Resend API | — |
| Conteneur | Docker multi-stage (node:22-alpine) | — |
| Hébergement | Render (prod) / Neon (DB serverless en prod) | — |

**Choix d'architecture notable** : le frontend est du JavaScript vanilla pur. Pas de React, pas de Vue, pas de bundler magique. Un router à hash maison (94 lignes), un store observable maison (165 lignes), et des modules de pages qui retournent une fonction de cleanup. En contrepartie : bundle minuscule, zéro dette de framework, contrôle total du DOM.

---

## 4. Démarrage rapide

### Prérequis

- Node.js 22+
- PostgreSQL 16 en local
- Un compte GitHub (pour l'OAuth App et le PAT)

### Installation

```bash
git clone https://github.com/g2tarb/dyg.git
cd dyg

# Pour la version la plus complète :
git checkout archive/full-platform-2026-06-14

npm install
```

### Base de données

```bash
# Démarrer PostgreSQL (macOS / Homebrew)
brew services start postgresql@16

# Créer la base
createdb dyg

# Schéma + données de départ (ATTENTION : db:reset fait DROP de tout)
npm run db:reset
```

Le script `db:reset` enchaîne :
1. `schema.sql` — 36 tables (avec `DROP TABLE IF EXISTS ... CASCADE` en tête)
2. `seed.sql` — développeurs fictifs avec portraits et scores (14 devs ; la migration `002` en ajoute 2 Synth, soit 2 par archétype au total)
3. `seed-training.sql` — pistes HTML/CSS
4. `seed-training-js.sql` — pistes JavaScript
5. `seed-training-python.sql` — pistes Python

Les seeds supplémentaires ne sont **pas** dans `db:reset`, à jouer à la main si besoin :

```bash
psql dyg < server/db/seed-training-c.sql
psql dyg < server/db/seed-training-shell.sql
psql dyg < server/db/seed-training-physics.sql
psql dyg < server/db/seed-training-js-advanced.sql
psql dyg < server/db/seed-projects.sql      # 15 briefs de projets
```

Les migrations `001` à `010` sont incrémentales et déjà incluses dans `schema.sql`. Elles servent à faire évoluer une base existante sans la détruire :

```bash
psql dyg < server/db/migrations/009_wars.sql   # exemple
```

### Lancer

```bash
npm run dev
```

Démarre deux processus en parallèle via `concurrently` :
- **Fastify** sur `:3001` (API) — avec `node --watch`
- **Vite** sur `:5173` (frontend) — avec proxy `/api`, `/auth`, `/sitemap.xml`, `/robots.txt` vers `:3001`

**Ouvre http://localhost:5173** — pas `:3001`, qui ne sert que l'API en dev.

### Autres scripts

| Script | Effet |
|---|---|
| `npm run dev` | API + frontend en watch |
| `npm run dev:server` | API seule |
| `npm run dev:client` | Vite seul |
| `npm run build` | Build Vite vers `dist/` |
| `npm start` | Prod — Fastify sert l'API **et** `dist/` |
| `npm run preview` | `build` puis `start` |
| `npm run db:init` | Schéma seul |
| `npm run db:seed` | Seed devs seul |
| `npm run db:reset` | Schéma + seeds principaux (destructif) |

---

## 5. Variables d'environnement

Copier `.env.example` vers `.env`. Le fichier `.env` est gitignoré — les secrets ne sont jamais commités.

| Variable | Requis | Format | Rôle |
|---|---|---|---|
| `DATABASE_URL` | **oui** | `postgresql://localhost:5432/dyg` | Connexion PostgreSQL |
| `JWT_SECRET` | **oui** | ≥ 32 caractères | Signature des JWT |
| `ENCRYPTION_KEY` | oui en prod | **exactement** 64 hex | AES-256-GCM pour les tokens GitHub |
| `GITHUB_PAT` | recommandé | `ghp_...` | Rate limit API GitHub : 60 req/h sans, 5 000 req/h avec |
| `GEMINI_API_KEY` | optionnel | — | Génération de bio IA ; sans, la bio est vide |
| `GH_CLIENT_ID` | pour le login | — | OAuth App GitHub |
| `GH_CLIENT_SECRET` | pour le login | — | OAuth App GitHub |
| `PORT` | non | défaut `3001` | Port Fastify |
| `BASE_URL` | non | défaut `http://localhost:5173` | Callback OAuth + sitemap |
| `CORS_ORIGIN` | non | liste séparée par virgules | Origines autorisées additionnelles |
| `NODE_ENV` | non | `development` \| `production` \| `test` | Bascule prod |

### Générer les secrets

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# ENCRYPTION_KEY (exactement 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Créer l'OAuth App GitHub

1. github.com/settings/developers → **New OAuth App**
2. Homepage URL : `http://localhost:5173`
3. **Authorization callback URL** : `http://localhost:5173/auth/github/callback`
4. Copier le Client ID, générer un Client Secret

Scopes demandés par l'app : `read:user`, `user:email`.

### Comportement sans secrets

La validation d'env (`server/config/env.js`) est tolérante en dev et stricte en prod :

- **En dev** : si la validation Zod échoue, un fallback applique des secrets de dev déterministes et le serveur démarre quand même.
- **En prod** : `ENCRYPTION_KEY` manquante → `process.exit(1)`.
- **OAuth non configuré** (`GH_CLIENT_ID` absent ou égal à `your_github_client_id`) : le plugin OAuth n'est pas enregistré, et `/auth/github` redirige vers `/#/?auth=not_configured`. Le login est inopérant mais le serveur tourne.

---

## 6. Architecture

```
dyg/
├── index.html                  Point d'entrée SPA
├── vite.config.js              Dev server + proxy vers :3001
├── Dockerfile                  Build multi-stage, HEALTHCHECK intégré
├── DYG_PROJECT_SHEET.md         Fiche produit (pitch)
│
├── server/                     ── BACKEND FASTIFY ──
│   ├── index.js                Bootstrap : plugins, hooks, error handler, cron, static
│   ├── config/env.js           Validation Zod de l'env + fallback dev
│   ├── constants/
│   │   ├── archetypes.js       8 archétypes + leurs piliers dominants + 8 piliers
│   │   └── shared.js
│   ├── db/
│   │   ├── connection.js       Pool pg
│   │   ├── schema.sql          36 tables + index
│   │   ├── migrations/         001 → 010, incrémentales
│   │   └── seed*.sql           Devs, 148 exercices, 15 briefs
│   ├── routes/                 13 fichiers de routes
│   ├── schemas/validation.js   Schémas Zod des payloads
│   ├── services/               19 services métier
│   └── utils/
│       ├── crypto.js           encrypt/decrypt AES-256-GCM
│       └── errors.js           DygError + 6 sous-classes typées
│
└── src/                        ── FRONTEND VANILLA ──
    ├── main.js                 Enregistre les 21 routes, init router
    ├── router.js               Router à hash, params dynamiques, cleanup par page
    ├── store.js                State observable + sync team debouncé
    ├── pages/                  18 pages
    ├── components/             11 composants (radarChart, synergyGauge, idleCoach...)
    ├── i18n/                   636 clés × 2 langues (FR / EN)
    ├── styles/                 19 feuilles CSS (1 globale + 1 par page)
    ├── utils/
    │   ├── sanitize.js         Échappement HTML (protection XSS)
    │   └── theme.js            Bascule clair/sombre
    └── assets/
        ├── archetypes/         8 illustrations
        └── portraits/          14 portraits de devs fictifs
```

### Frontend — comment ça marche

**Router** (`src/router.js`). Basé sur `window.location.hash`. Chaque route est une fonction `(container, params) => cleanupFn`. Le router :
- appelle le `cleanup` de la page précédente avant de monter la suivante (évite les fuites de listeners et d'intervals) ;
- match d'abord les routes exactes, puis les patterns dynamiques (`/profile/:id`) en comparant segment par segment ;
- enveloppe chaque handler dans un `try/catch` (`safeRun`) qui affiche un état d'erreur plutôt qu'une page blanche ;
- retombe sur un handler 404 configurable.

**Store** (`src/store.js`). Un objet `state` plus un registre de listeners par clé. `setState(key, value)` notifie les abonnés de cette clé uniquement. Spécificité : la team en cours de construction est synchronisée vers le serveur avec un **debounce**, et la réponse serveur met à jour le score de synergie affiché.

**i18n**. Dictionnaires plats `'clé.sous_clé': 'valeur'` — 636 clés en français et en anglais, synchronisées ligne pour ligne (752 lignes chacun).

### Backend — comment ça marche

`server/index.js` enregistre dans l'ordre : Helmet → compression → ETag → CORS → rate limit → hook de ban IP → hook request-id → cookie → JWT → OAuth2 → error handler → les 13 modules de routes → robots/sitemap/health → les intervals cron → le static en prod.

**Gestion d'erreur centralisée.** Un seul `setErrorHandler` traite quatre cas :

| Cas | Code HTTP | Payload |
|---|---|---|
| Rate limit dépassé | 429 | `{ error: 'TOO_MANY_REQUESTS' }` |
| `z.ZodError` | 422 | `{ error: 'VALIDATION_FAILED', details: fieldErrors }` |
| `DygError` (métier) | son `statusCode` | `{ error: code, message, details? }` |
| Non géré | 500 | `{ error: 'INTERNAL_SERVER_ERROR', reference: requestId }` |

Les erreurs non gérées ne fuient jamais de stack au client — seulement un `reference` corrélable avec les logs Pino.

**Erreurs typées** (`server/utils/errors.js`) : `DygError` et ses sous-classes `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`, `IntegrationError`.

---

## 7. Le moteur de scoring

Le cœur du produit. `server/services/github.js` (512 lignes) consomme l'API GitHub et calcule 8 scores de 1 à 10.

### Philosophie — Scoring V4

> Base 1, max 10. 8+ est rare. 9+ est exceptionnel.
> Distribution cible : moyenne ~5, 8+ = top 15 %, 9+ = top 5 %.

Chaque pilier part de `1` et accumule des bonus plafonnés, avec des malus explicites. Résultat arrondi puis borné à 10.

### Signaux collectés

Le scan agrège bien plus que le nombre de repos :

| Catégorie | Signaux |
|---|---|
| Volume | taille totale en Ko, repos substantiels, gros repos, nombre de repos |
| Étoiles | `totalStars` par palier (1 / 5 / 10 / 20 / 50 / 200) |
| Activité | jours actifs, repos des 6 derniers mois, du dernier mois, `pushEvents` |
| Collaboration | PR ouvertes, PR mergées, reviews, issues, commentaires, followers, forks, repos externes contribués |
| Langages | set de langages, octets par langage, ratio de dominance, présence front / back / devops, langage système, langage de niche |
| Qualité README | présence, instructions d'install, exemples d'usage, captures d'écran, longueur moyenne |
| Qualité des commits | taux de messages descriptifs, taux de messages génériques, commits moyens par push, gros pushes |
| Maturité | `maturityRate` — proportion de repos ayant réellement évolué dans le temps vs dépôts one-shot |
| Signaux IA | taux de commits co-signés par une IA (`aiRate`), qualité d'usage de l'IA |
| Structure | score moyen de structure de projet |
| Métadonnées | descriptions, topics, licences, homepages, ancienneté du compte |

### Détail par pilier

**CODE** — profondeur technique et volume de production.
`log2(taille/200)` plafonné à 2, + repos substantiels, + gros repos, + palier d'étoiles (jusqu'à 3), + qualité de code, + bonus README, + bonus profondeur (langage système +0,5 / langage de niche +0,5), + maturité, ± bonus IA (`excellent` +1, `poor` −0,5).

**VELOCITY** — vitesse et régularité de livraison.
Repos récents, burst du dernier mois, consistance des pushes (30 jours actifs pour le max), taux de productivité relatif à l'âge du compte, PR mergées, densité de commits, + 0,5 si les pushes sont granulaires (≤ 5 commits). **Pas de malus sur les gros pushes** — travailler hors-ligne puis pousser est un comportement normal.

**CRAFT** — qualité, finition, documentation, professionnalisme.
Taux de descriptions, taux de topics, licences, homepages, reviews données, qualité des descriptions, bonus README (install / usage / screenshot / longueur), qualité des messages de commit, **malus −0,5 si > 70 % de messages génériques**, ± bonus IA (`excellent` +1, `poor` −1).

**COLLABORATION** — jeu collectif et open source.
Forks, repos externes contribués, PR, reviews, issues et commentaires, paliers de followers (10 / 30 / 100).

**VERSATILITY** — diversité des langages et des domaines.
Nombre de langages (6+ pour le max), bonus de stack (front + back = +1,5, devops = +0,5), diversité des topics, bonus d'équilibrage selon le ratio de dominance du langage principal (< 0,4 → +1,5), **malus pour les monolingues** (1 langage → −1, 2 → −0,5).

**CREATIVITY** — originalité et invention.
Repos originaux, topics non communs, projets personnels (en excluant ceux dont la description contient `tutorial`, `course`, `udemy`), événements de création, **malus sur le ratio de forks** (> 70 % → −1,5), bonus d'itération sur la maturité.

**AUTONOMY** — autosuffisance et documentation.
Taux de repos originaux, repos documentés, repos structurés, ancienneté du compte (24 mois pour le max), repos solo, bonus README comme preuve d'autonomie, bonus de structure de projet.

**IA MASTERY** — qualité de l'usage de l'IA, pas sa quantité.

C'est le pilier le plus particulier. Échelle :

```
5  = neutre (aucun usage d'IA détecté → aucune pénalité)
<5 = mauvais usage de l'IA
>5 = bon usage de l'IA
10 = IA Architect
```

Si `aiRate > 0`, le score **repart de 1** et doit se mériter sur 6 signaux :

| Signal | Effet |
|---|---|
| Commits descriptifs malgré l'IA (> 50 %) | +2 (ou +1 si > 25 %) |
| Approche hybride (10 % ≤ aiRate ≤ 70 %) | +1,5 |
| … mais aiRate > 90 % | −1 |
| Documentation présente (≥ 2 README) | +1,5 (ou +0,75 si ≥ 1) |
| Bonne structure de projet (≥ 3,5) | +1 (ou +0,5 si ≥ 2) |
| Maturité des repos (> 50 %) | +1,5 (ou +0,75 si > 25 %) ; sinon −0,5 |
| Volume substantiel avec IA (≥ 5 repos) | +1 |
| **Malus** : commits génériques (> 70 %) **et** IA (> 30 %) | **−1,5** |

Autrement dit : utiliser l'IA n'est pas pénalisé — l'utiliser *sans comprendre ce qu'elle produit* l'est.

### Détection du style de dev

| Style | Conditions |
|---|---|
| `ia-architect` | `aiRate > 0,3` — confiance `high` si > 0,6 |
| `vibe-coder` | commits génériques > 0,6 **et** gros pushes **et** aucun README **et** maturité < 0,3 |
| `traditional` | commits descriptifs > 0,4 **et** pas de gros pushes **et** maturité > 0,4 |

Chaque style est accompagné d'un niveau de confiance `low` / `medium` / `high`.

### Qualité d'usage de l'IA

Sur la base d'un compteur de signaux positifs (`aiGoodSignals`) :

| Qualité | Seuil | Impact |
|---|---|---|
| `excellent` | ≥ 4 signaux | +1,5 pondération, bonus sur Code et Craft |
| `decent` | ≥ 2 signaux | +0,5 |
| `poor` | < 2 signaux | −1, malus sur Code et Craft |

### Détermination de l'archétype

`server/services/scoring.js`. Chaque archétype a deux **piliers dominants**. On calcule pour chacun la somme de ses deux dominants, on classe, et le plus haut devient l'archétype **primaire**.

Les archétypes **multiples** sont rares par construction :

| Niveau | Condition | Fréquence cible |
|---|---|---|
| **Secondaire** | les **deux** dominants ≥ 8 **et** somme ≥ 16 | ~10–15 % des devs |
| **Tertiaire** | un troisième archétype avec les deux dominants ≥ 9 **et** somme ≥ 18 | ~1–2 % — « legendary » |

Le point important : c'est `minDominant` qui est testé, pas seulement la somme. Un 10 + 6 ne déclenche pas de secondaire, alors que la somme (16) atteint le seuil. Il faut être bon sur **les deux** axes.

---

## 8. Les 8 archétypes

| Archétype | Piliers dominants | Couleur | Description |
|---|---|---|---|
| **Architect** | code + autonomy | `#3B82F6` | Pense en systèmes. Son code tient encore debout 5 ans plus tard. |
| **Shipper** | velocity + autonomy | `#22C55E` | Livre. Pas de réunions, pas d'excuses. Le projet avance. |
| **Artisan** | craft + code | `#F5C542` | Chaque pixel, chaque fonction est poli. Rend un travail propre. |
| **Creative** | creativity + versatility | `#A855F7` | Ses projets n'existent nulle part ailleurs. Invente avant de construire. |
| **Explorer** | versatility + velocity | `#06B6D4` | Touche à tout, apprend vite. Là où les autres se spécialisent, il relie. |
| **Commando** | velocity + collaboration | `#EF4444` | Rapide ET collaboratif. Le coéquipier idéal en game jam. |
| **Mentor** | collaboration + craft | `#F97316` | Élève le niveau de l'équipe. Ses code reviews valent de l'or. |
| **Synth** | ia + craft | `#EC4899` | Dirige l'IA comme un senior dirige des juniors. Livre vite sans perdre la rigueur. |

Synth est l'archétype ajouté par la migration `001_add_synth_archetype.sql` — il reconnaît une compétence qui n'existait pas dans les grilles de lecture classiques.

---

## 9. Les pôles fonctionnels

### Pôle 1 — Identité

**Onboarding / Scan** (`POST /api/onboarding/scan`)
Saisie d'un pseudo GitHub (validé par `/^[a-z0-9]([a-z0-9-]{0,37}[a-z0-9])?$/i`), scan, calcul des 8 piliers, détermination de l'archétype, génération de bio Gemini, création du profil développeur.

**Portfolio public** (`/#/u/:login`)
Page partageable : archétype, radar des 8 scores, projets livrés, réputation. Référencée dans le `sitemap.xml` généré dynamiquement depuis la base.

**Profil & paramètres**
Disponibilité (`available` / `in_project` / `unavailable`), consentement données (RGPD), préférences de notification (JSONB), export de ses données (`GET /api/auth/my-data-export`), suppression de compte (`DELETE /api/auth/account`).

**Badges** (`server/services/badges.js`)

| Badge | Déclencheur | Condition |
|---|---|---|
| `first-scan` | scan | premier scan |
| `first-project` | project_join | première participation |
| `first-ship` | project_ship | premier projet livré |
| `five-shipped` | project_ship | 5 projets au statut `shipped` |
| `perfect-review` | review_received | moyenne d'étoiles ≥ 5 |
| `dual-archetype` | scan | un archétype secondaire existe |
| `triple-archetype` | scan | un archétype tertiaire existe |
| `training-10` | training_submit | 10 soumissions |
| `ia-architect` | scan | `dev_style === 'ia-architect'` |

### Pôle 2 — Entraînement

**148 exercices** répartis sur **49 pistes** et 7 domaines (chiffres mesurés en base après chargement de tous les seeds) :

| Domaine | Pistes | Exercices | Niveaux |
|---|---|---|---|
| HTML / CSS | 9 | 29 | 1–3 |
| JavaScript | 9 | 27 | 1–3 |
| Python | 9 | 27 | 1–3 |
| C | 7 | 20 | 1–3 |
| Maths / Physique | 6 | 18 | 1–3 |
| Shell | 6 | 18 | 1–3 |
| JS Expert | 3 | 9 | 4–6 |
| **Total** | **49** | **148** | **1–6** |

Progression : HTML bases → Flexbox → Grid → Responsive → Animations ; Variables → Fonctions → DOM → POO → Async ; et pour JS Expert : Scope & Closures (4) → `this`/Prototypes/Coercion (5) → Event Loop & Metaprogramming (6). Contenu en français.

**Correction automatique** (`server/services/reviewer.js`)
L'utilisateur soumet une URL de repo GitHub. Le reviewer :
1. parse l'URL (`owner` / `repo`) ;
2. récupère l'arbre de fichiers via `git/trees/HEAD?recursive=1` (timeout 5 s) ;
3. détecte le type d'exercice depuis les extensions (`.html`, `.css`, `.js`, `.py`) ;
4. télécharge les fichiers clés et les analyse ;
5. attribue des étoiles et un feedback textuel.

Repo vide ou inaccessible → `1 étoile` avec le motif.

**Notation double** (schéma `training_submissions`)

| Type | Champ | Échelle | Signification |
|---|---|---|---|
| Étoiles **or** | `gold_stars` | 0–5 (entier) | Qualité du code |
| Étoiles **grises** | `gray_stars` | 0–5 (décimal, défaut 5.0) | Indépendance — part de 5 et **descend** à chaque indice consulté |

Demander de l'aide ne casse pas ton score de qualité, mais il est tracé séparément. `POST /api/training/exercises/:id/tip` consomme un indice.

### Pôle 3 — Collectif

**Projets d'équipe**
15 briefs prêts à lancer, par stack et par niveau :

| Stack | Briefs |
|---|---|
| `html-css` | Portfolio Photographe, Landing Page Startup, Site Restaurant Gastronomique, Site Agence Créative |
| `js-vanilla` | Dashboard Météo, Gestionnaire de Budget, Quiz App Interactive, Mini E-commerce Vanilla |
| `fullstack` | Dashboard Analytics SaaS, Plateforme de Blog avec CMS, Mini Trello, Mini Malt |
| `threejs` | Moteur de Particules 3D |
| `c` | Raytracer en C |
| `python` | CLI Tool (type httpie) |

Chaque brief porte un `deadline_days`, un `theme`, un `level` et des conseils associés. `POST /api/project-briefs/:id/launch` instancie un projet réel avec deadline.

**Team Builder & synergie** (`server/services/synergy.js`)

Le score de synergie mesure la **couverture d'équipe**, pas la somme des talents :

```
couverture = Σ(max du pilier parmi les membres) / (8 × 10) × 100
bonus diversité = (nombre d'archétypes uniques − 1) × 5
total = min(100, couverture + bonus diversité)
```

Pour chaque pilier, on prend le **meilleur** membre. Une équipe de quatre clones plafonne ; une équipe complémentaire monte. Le bonus de diversité récompense explicitement le mélange d'archétypes.

**Recommandations** (`server/services/recommend.js`)
Mélange de **similarité cosinus** (profils proches) et de **complémentarité** (profils qui comblent tes trous) sur les vecteurs de 8 piliers. `GET /api/auth/recommendations`.

**Peer review et évolution des scores** (`server/services/closing.js`)
À la clôture d'un projet, les coéquipiers se notent. Trois piliers seulement sont impactés : `collaboration`, `craft`, `velocity` — ceux qu'un coéquipier est légitime pour juger. Les scores du développeur évoluent, un `score_snapshot` est écrit pour garder l'historique.

**Système anti-abandon** (`server/services/ban.js`)
Bans progressifs, en mois :

| Abandons | Sanction |
|---|---|
| 1–2 | aucune |
| 3 | 1 mois |
| 4 | 3 mois |
| 5 | 6 mois |
| 6+ | 12 mois |

Décroissance : 12 mois sans abandon retirent 1 au compteur (`decayAbandons`, exécuté toutes les heures). L'erreur est pardonnée, la récidive non.

**Messagerie multicanale** (`server/services/chat.js`)

| Canal | Accès |
|---|---|
| Global | tout le monde |
| Archétype | membres du même archétype |
| Projet | membres du projet |
| DM | direct |

Garde-fous :
- **rate limit communautaire** : 10 secondes entre deux messages dans les canaux publics ;
- **plafond de cold DM** : `INVITATION_CAP = 2` — tu ne peux pas spammer un inconnu au-delà de 2 messages sans réponse ;
- blocage et refus appliqués côté serveur (`canSendDM`, `getDmPolicy`).

**Amis et blocage** (`server/services/friendships.js`)
Demande / acceptation / refus, retrait, blocage et déblocage. Un blocage neutralise la relation dans les deux sens (`isBlocked` est vérifié avant tout envoi).

**Notifications** (`server/services/notifications.js`)
Notifications typées en base, compteur de non-lues, marquage individuel ou global.

**Rappels de deadline** (`server/services/projectReminders.js`)
Paliers à `J-7`, `J-3`, `J-1`, `J-0` et `J+1` (retard, une seule fois). Idempotent : au redémarrage du serveur, les fenêtres manquées sont rattrapées.

### Pôle 4 — Compétition

**Saisons et divisions** (`server/services/seasons.js`)

Chaque développeur est inscrit dans une **division** correspondant à son archétype. Point clé : **la division est gelée à l'inscription**. Elle ne change pas si l'archétype évolue en cours de saison — pas de changement de ligue opportuniste.

Les points viennent de deux sources, chacune **plafonnée à 50 points par saison** :

| Source | Origine |
|---|---|
| `github_points` | activité GitHub réelle, synchronisée automatiquement |
| `dyg_points` | activité sur la plateforme (training, projets, wars) |

`awardPoints()` est transactionnel : `BEGIN`, `SELECT ... FOR UPDATE` sur l'inscription, écriture d'une ligne immuable dans `point_events` avec les points **réellement** appliqués. Si le plafond est atteint, un événement « capped » à 0 point est tout de même journalisé — la trace d'audit reste complète.

**Points GitHub automatiques** (`server/services/githubPoints.js`)
Synchronisation par lot toutes les 6 heures pour tous les inscrits : récupération des repos, scoring, comptage des jours actifs. Nécessite le token GitHub de l'utilisateur (chiffré en base).

**Inter-Division Wars** (`server/services/wars.js` + `warScheduler.js`)

Compétitions mensuelles entre les 8 divisions.

Paramètres : `TEAM_SIZE_MAX = 5`, `NUM_JUDGES = 5`.

Cycle de vie d'une war :

```
upcoming → staffing → running → judging → closed
```

| Phase | Ce qui se passe |
|---|---|
| `upcoming` | la war existe, pas encore ouverte |
| `staffing` | constitution des équipes (`joinTeam` / `leaveTeam`), recalcul de synergie |
| `running` | développement jusqu'à `deadline_at`, soumission du livrable (`repo_url` + `deliverable_url`) |
| `judging` | 5 jurés éligibles sont sélectionnés et invités, ils notent jusqu'à `judging_ends_at` |
| `closed` | `winner_team_id` est fixé |

Chaque war porte quatre horodatages (`starts_at`, `build_starts_at`, `deadline_at`, `judging_ends_at`) et un flag `ai_allowed` — certaines wars autorisent l'IA, d'autres non.

Le `warScheduler` tourne toutes les heures : `ensureCurrentMonthWar()` crée la war du mois si elle manque (brief choisi dans une liste selon l'index du mois), `tickWarLifecycle()` fait avancer les états selon les dates.

Deux types : `inter_division` (mensuelle, 8 divisions) et `dyg_war`.

**Classement** (`GET /api/leaderboard`)
Classement par division, trié sur `total_points`, indexé pour la pagination.

### Transverse

**Collecte de code anonymisée** (`server/services/collector.js`)
Avec consentement explicite (`users.data_consent`), DYG collecte des échantillons de code anonymisés depuis les contributions aux projets. Le contenu **et** les noms de fichiers sont anonymisés (`anonymize`, `anonymizeFilename`), le langage est détecté et stocké dans `code_samples`. L'utilisateur peut consulter le compte de ses échantillons et les supprimer à tout moment :

```
GET    /api/data/my-samples/count
DELETE /api/data/my-samples
```

**Coach IA idle** (`src/components/idleCoach.js`)
Composant frontend qui propose des conseils contextuels après une période d'inactivité.

---

## 10. Base de données

**36 tables** dans `schema.sql`. Toutes les clés primaires sont des `UUID` avec `gen_random_uuid()`. Tous les horodatages sont `TIMESTAMPTZ`.

### Vue d'ensemble par domaine

| Domaine | Tables |
|---|---|
| **Auth & identité** | `users`, `developers`, `developer_scores`, `score_snapshots` |
| **Équipes** | `teams`, `team_members` |
| **Projets** | `projects`, `project_members`, `project_briefs`, `project_brief_tips`, `contribution_events` |
| **Évaluation** | `peer_reviews`, `reputation`, `badges` |
| **Entraînement** | `training_tracks`, `training_exercises`, `training_tips`, `training_submissions` |
| **Social** | `conversations`, `conversation_participants`, `messages`, `friendships`, `user_blocks`, `notifications` |
| **Compétition** | `seasons`, `season_enrollments`, `point_events`, `wars`, `war_teams`, `war_members`, `war_judges`, `war_ratings` |
| **Modération & conformité** | `ban_history`, `reports`, `audit_logs`, `code_samples` |
| **Préférences** | `user_preferences` (migration 010) |

### Tables centrales

**`users`** — couche d'authentification.

| Colonne | Type | Note |
|---|---|---|
| `github_id` | `INTEGER UNIQUE NOT NULL` | identité GitHub |
| `github_login` | `VARCHAR(100)` | indexé |
| `access_token` | `TEXT NOT NULL` | **chiffré AES-256-GCM** |
| `data_consent` | `BOOLEAN` | RGPD — gouverne la collecte de code |
| `availability` | `VARCHAR(20)` | `available` / `in_project` / `unavailable` |
| `abandon_count` | `SMALLINT` | compteur anti-abandon |
| `notification_prefs` | `JSONB NOT NULL DEFAULT '{}'` | préférences granulaires |
| `banned_until`, `ban_count` | — | sanction en cours |

**`developers`** — profil public. Point d'architecture notable : `user_id` est nullable. Les 16 développeurs de démonstration (2 par archétype, issus de `seed.sql` + migration `002`) ont `user_id = NULL`, les vrais utilisateurs l'ont renseigné. Les deux cohabitent dans la même table, ce qui permet de peupler l'explorateur et le team builder sans faux comptes.

Les trois colonnes d'archétype (`archetype`, `secondary_archetype`, `tertiary_archetype`) portent chacune une contrainte `CHECK` sur la liste des 8 archétypes. `secondary` et `tertiary` sont nullables.

**`developer_scores`** — un enregistrement par pilier et par développeur, indexé sur `(developer_id)` et `(pillar)`.

**`wars`** — voir le détail du cycle de vie en [§9](#pôle-4--compétition). Contraintes `CHECK` sur `type` et `state`.

**`reputation`** — `gold_stars` (`SMALLINT`, 0–5) et `gray_stars` (`NUMERIC(2,1)`, 0–5, défaut 5.0).

### Migrations

| Fichier | Apport |
|---|---|
| `001_add_synth_archetype.sql` | l'archétype Synth |
| `002_seed_synth_devs.sql` | devs de démo Synth |
| `003_seasons_rankings.sql` | saisons, inscriptions, événements de points |
| `004_seed_current_season.sql` | saison courante |
| `005_friendships.sql` | amis + blocages |
| `006_typed_conversations.sql` | conversations typées |
| `007_notifications.sql` | notifications |
| `008_backfill_synth_cols.sql` | rattrapage des colonnes Synth |
| `009_wars.sql` | wars, équipes, jurés, notes |
| `010_user_preferences.sql` | préférences utilisateur |

Les migrations utilisent `CREATE TABLE IF NOT EXISTS` — elles sont rejouables sans danger. `schema.sql`, à l'inverse, commence par 36 `DROP TABLE IF EXISTS ... CASCADE` : **ne jamais le jouer sur une base contenant des données à garder**.

---

## 11. API — Référence complète

81 endpoints répartis sur 13 modules de routes, plus 4 routes d'infrastructure déclarées directement dans `server/index.js`.

### Auth & compte

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/auth/github` | Lance le flux OAuth |
| `GET` | `/auth/github/callback` | Callback — pose le cookie JWT |
| `POST` | `/api/auth/logout` | Supprime le cookie |
| `GET` | `/api/auth/me` | Utilisateur courant |
| `GET` | `/api/auth/consent` | État du consentement RGPD |
| `PATCH` | `/api/auth/consent` | Modifie le consentement |
| `GET` | `/api/auth/preferences` | Préférences de notification |
| `PATCH` | `/api/auth/preferences` | Modifie les préférences |
| `PATCH` | `/api/auth/availability` | Change la disponibilité |
| `GET` | `/api/auth/my-data-export` | Export RGPD de ses données |
| `DELETE` | `/api/auth/account` | Suppression de compte |
| `GET` | `/api/auth/recommendations` | Devs recommandés |
| `PATCH` | `/api/profile` | Modifie le profil |

### Onboarding & scan

| Méthode | Route | Rôle |
|---|---|---|
| `POST` | `/api/onboarding/scan` | Scanne un GitHub, calcule les 8 piliers |
| `POST` | `/api/onboarding/save-profile` | Persiste le profil scanné |

### Développeurs & portfolio

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/developers` | Liste filtrable |
| `GET` | `/api/developers/:id` | Détail d'un développeur |
| `GET` | `/api/users/:login/portfolio` | Portfolio public |
| `GET` | `/api/users/:login/reputation` | Réputation publique |

### Équipes

| Méthode | Route | Rôle |
|---|---|---|
| `POST` | `/api/teams` | Crée une équipe |
| `GET` | `/api/teams/:id` | Détail + synergie |
| `PATCH` | `/api/teams/:id` | Modifie l'équipe |

### Projets

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/project-briefs` | Les 15 briefs |
| `GET` | `/api/project-briefs/:id` | Détail d'un brief + conseils |
| `POST` | `/api/project-briefs/:id/launch` | Instancie un projet depuis un brief |
| `GET` | `/api/projects` | Liste des projets |
| `POST` | `/api/projects` | Crée un projet |
| `GET` | `/api/projects/:id` | Détail |
| `PATCH` | `/api/projects/:id` | Modifie |
| `POST` | `/api/projects/:id/join` | Rejoint |
| `POST` | `/api/projects/:id/leave` | Quitte — **incrémente `abandon_count`** |
| `GET` | `/api/projects/:id/reviews` | Peer reviews |
| `POST` | `/api/projects/:id/reviews` | Note un coéquipier |
| `POST` | `/api/projects/:id/reputation` | Attribue de la réputation |

### Entraînement

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/training/tracks` | Les 44 pistes |
| `GET` | `/api/training/tracks/:trackId/exercises` | Exercices d'une piste |
| `GET` | `/api/training/exercises/:id` | Détail d'un exercice |
| `POST` | `/api/training/exercises/:id/start` | Démarre |
| `POST` | `/api/training/exercises/:id/submit` | Soumet une URL de repo → correction auto |
| `POST` | `/api/training/exercises/:id/tip` | Consomme un indice — **baisse les étoiles grises** |
| `GET` | `/api/training/my-progress` | Progression personnelle |

### Messagerie

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/messages` | Liste des conversations |
| `GET` | `/api/messages/unread` | Compteur de non-lus |
| `GET` | `/api/messages/global` | Canal global |
| `GET` | `/api/messages/archetype` | Canal de son archétype |
| `GET` | `/api/messages/project/:projectId` | Canal projet |
| `GET` | `/api/messages/:conversationId` | Messages d'une conversation |
| `POST` | `/api/messages/:conversationId` | Poste dans une conversation |
| `POST` | `/api/messages/send` | Envoi direct (DM) |

### Amis

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/friends` | Liste d'amis |
| `GET` | `/api/friends/pending` | Demandes reçues |
| `GET` | `/api/friends/sent` | Demandes envoyées |
| `GET` | `/api/friends/blocked` | Utilisateurs bloqués |
| `GET` | `/api/friends/status/:userId` | Statut de la relation |
| `POST` | `/api/friends/request` | Envoie une demande |
| `POST` | `/api/friends/:id/accept` | Accepte |
| `POST` | `/api/friends/:id/decline` | Refuse |
| `DELETE` | `/api/friends/:userId` | Retire un ami |
| `POST` | `/api/friends/block` | Bloque |
| `POST` | `/api/friends/unblock` | Débloque |

### Notifications

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/notifications` | Liste paginée |
| `GET` | `/api/notifications/unread-count` | Compteur |
| `POST` | `/api/notifications/:id/read` | Marque comme lue |
| `POST` | `/api/notifications/read-all` | Tout marquer comme lu |

### Saisons & classement

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/seasons/current` | Saison active |
| `GET` | `/api/seasons/me` | Mon inscription, mes points |
| `GET` | `/api/leaderboard` | Classement par division |

### Wars

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/wars` | Liste filtrable (`state`, `type`) |
| `GET` | `/api/wars/current` | War en cours |
| `GET` | `/api/wars/divisions` | Les 8 divisions |
| `GET` | `/api/wars/:id` | Détail |
| `POST` | `/api/wars/:id/join` | Rejoint une équipe (max 5) |
| `POST` | `/api/wars/:id/leave` | Quitte |
| `POST` | `/api/wars/:id/teams/:teamId/submit` | Soumet le livrable |
| `POST` | `/api/wars/:id/judge/accept` | Accepte d'être juré |
| `POST` | `/api/wars/:id/judge/decline` | Refuse |
| `POST` | `/api/wars/:id/teams/:teamId/rate` | Note une équipe (juré) |

### Données & modération

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/data/my-samples/count` | Nombre de mes échantillons collectés |
| `DELETE` | `/api/data/my-samples` | Supprime mes échantillons |
| `POST` | `/api/report` | Signale un contenu ou un utilisateur |
| `GET` | `/api/admin/data/stats` | Statistiques (admin) |
| `GET` | `/api/admin/data/export/:archetype` | Export dataset par archétype (admin) |

### Infrastructure

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/health` | `{ status, db }` — teste `SELECT 1` |
| `GET` | `/robots.txt` | Bloque `/api/`, `/auth/`, `/admin/` |
| `GET` | `/sitemap.xml` | Généré depuis la base (pages statiques + portfolios) |

---

## 12. Routes frontend

21 routes déclarées dans `src/main.js`.

| Route | Page | Contenu |
|---|---|---|
| `/` | `landing.js` | Accueil, accroche, scan |
| `/onboarding` | `onboarding.js` | Flux de scan et de création de profil |
| `/search` | `search.js` | Explorateur de développeurs + filtres |
| `/profile/:id` | `profile.js` | Profil d'un développeur |
| `/u/:login` | `portfolio.js` | Portfolio public partageable |
| `/archetype/:key` | `archetypePage.js` | Page dédiée à un archétype |
| `/team` | `teamBuilder.js` | Construction d'équipe + jauge de synergie |
| `/projects` | `projects.js` | Briefs et projets |
| `/projects/:id` | `projectDetail.js` | Détail d'un projet |
| `/training` | `training.js` | Pistes et exercices |
| `/training/:exerciseId` | `training.js` | Un exercice |
| `/leaderboard` | `leaderboard.js` | Classement par division |
| `/wars` | `wars.js` | Liste des wars |
| `/wars/:id` | `wars.js` | Détail d'une war + notation juré |
| `/messages` | `messages.js` | Messagerie |
| `/messages/:id` | `messages.js` | Une conversation |
| `/messages/project/:projectId` | `messages.js` | Canal projet |
| `/friends` | `friends.js` | Amis et demandes |
| `/notifications` | `notifications.js` | Notifications |
| `/settings` | `settings.js` | Paramètres, RGPD, préférences |
| `/about` | `about.js` | À propos |
| *(fallback)* | `notFound.js` | 404 |

### Composants

| Composant | Rôle |
|---|---|
| `radarChart.js` | Radar des 8 piliers |
| `synergyGauge.js` | Jauge de synergie d'équipe |
| `devCard.js` | Carte développeur |
| `archetypeCard.js` | Carte archétype |
| `filters.js` | Filtres de l'explorateur |
| `idleCoach.js` | Coach IA contextuel après inactivité |
| `toast.js` | Notifications éphémères |
| `pageOrbs.js` | Décor animé de fond |
| `header.js` / `footer.js` / `logo.js` | Chrome de l'application |

---

## 13. Sécurité

### En-têtes — Helmet

CSP active **en production uniquement** (désactivée en dev pour ne pas gêner le HMR de Vite) :

```
default-src  'self'
script-src   'self' 'unsafe-inline'
style-src    'self' 'unsafe-inline' fonts.googleapis.com
font-src     'self' fonts.gstatic.com
img-src      'self' data: *.githubusercontent.com
connect-src  'self'
object-src   'none'
base-uri     'self'
form-action  'self'
```

Également : `frameguard: deny`, HSTS en prod (1 an, `includeSubDomains`, `preload`), `referrerPolicy: strict-origin-when-cross-origin`, `hidePoweredBy`.

Un hook `onSend` ajoute à chaque réponse :
```
X-Request-Id: <uuid>
Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()
```

### CORS

Liste blanche stricte en production :

```
https://dyg.dev        https://www.dyg.dev
https://dyg.gg         https://www.dyg.gg
https://dyg-olfu.onrender.com
```

Extensible via `CORS_ORIGIN` (valeurs séparées par des virgules). En dev, toutes les origines sont acceptées. `credentials: true`, méthodes limitées à `GET, POST, PATCH, DELETE, OPTIONS`.

### Rate limiting et ban IP

- 100 requêtes par minute et par IP
- `127.0.0.1` en liste blanche
- Dépassement → **l'IP est bannie 15 minutes** (`Map` en mémoire) et reçoit un `403`
- Nettoyage des bans expirés toutes les heures

Limitation connue : le ban est en mémoire, donc par instance. Il ne survit pas à un redémarrage et ne se partage pas entre réplicas.

### Authentification

- GitHub OAuth2 avec scopes minimaux : `read:user`, `user:email`
- JWT en **cookie HttpOnly**, expiration 30 jours
- Les tokens d'accès GitHub sont **chiffrés AES-256-GCM** avant stockage, au format `iv:tag:ciphertext`
- `decrypt()` tolère les valeurs non chiffrées (legacy) sans planter

Note sur le fallback de clé : si `ENCRYPTION_KEY` est absente ou mal formée, `crypto.js` dérive une clé via `scryptSync` sur une chaîne fixe. C'est **délibérément faible** et réservé au dev. En production, `env.js` arrête le processus si la clé manque.

### Validation

Zod partout : la configuration d'environnement (`config/env.js`) et les payloads d'API (`schemas/validation.js`). Les `ZodError` sont converties en `422` avec le détail par champ.

### XSS

`src/utils/sanitize.js` échappe le HTML côté client. L'application manipule le DOM directement — l'échappement est appliqué à toute donnée d'origine utilisateur avant insertion.

### Logs

Pino avec **redaction** sur :
```
req.headers.authorization
req.headers.cookie
body.password
body.token
body.access_token
body.scores
```
Censeur : `[REDACTED]`. Chaque requête porte un `requestId` (réutilise `x-request-id` s'il est fourni, sinon `randomUUID()`), ce qui permet de corréler une erreur 500 côté client avec sa stack côté serveur.

### Autres garde-fous

- `bodyLimit` à 1 Mo
- Validation du pseudo GitHub par regex avant tout appel externe
- Timeouts explicites sur les appels à l'API GitHub (`AbortSignal.timeout`)
- Sanitation des prompts envoyés à Gemini (`sanitizeForPrompt`) contre l'injection de prompt
- Table `audit_logs` pour la traçabilité
- Table `reports` pour la modération

### RGPD

- Consentement explicite requis avant toute collecte de code (`users.data_consent`)
- Export de ses données : `GET /api/auth/my-data-export`
- Suppression de compte : `DELETE /api/auth/account`
- Visibilité et suppression des échantillons collectés
- Anonymisation du contenu **et** des noms de fichiers avant stockage

---

## 14. Tâches de fond (cron in-process)

Quatre `setInterval` dans `server/index.js`, tous `unref()` pour ne pas retenir le process.

| Intervalle | Tâche | Détail |
|---|---|---|
| 1 h | GC + `decayAbandons()` | Purge les bans IP expirés ; 12 mois sans abandon → compteur −1 |
| 6 h | `syncGithubPointsAllEnrolled()` | Recalcule les points GitHub de tous les inscrits à la saison |
| 1 h | `runProjectReminders()` | Rappels de deadline J-7 / J-3 / J-1 / J-0 / J+1 |
| 1 h | `runWarScheduler()` | Crée la war du mois si absente, fait avancer les états |

Les rappels de projet et le scheduler de wars sont **aussi exécutés une fois au démarrage**, pour rattraper les fenêtres manquées pendant un redémarrage.

Limitation connue : ces tâches sont in-process. Avec plusieurs réplicas, elles s'exécuteraient en parallèle. Un verrou applicatif (advisory lock PostgreSQL) serait nécessaire pour un scale horizontal.

---

## 15. Déploiement

### Docker

Build multi-stage sur `node:22-alpine` :

**Étape 1 — builder** : `npm ci`, copie des sources, `npm run build`, puis listage de `dist/` (trace de debug volontairement conservée pour diagnostiquer les builds Render).

**Étape 2 — runtime** : `npm ci --omit=dev`, copie de `dist/` et `server/` uniquement. Les sources frontend ne partent pas en production.

```dockerfile
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/api/health')..."
CMD ["node", "server/index.js"]
```

### Mode production

Quand `NODE_ENV=production`, Fastify sert aussi le frontend :

- `@fastify/static` monté sur `/` avec `dist/` comme racine
- `setNotFoundHandler` renvoie `index.html` pour toute route inconnue (routing SPA), **sauf** `/api/*` et `/auth/*` qui retournent un `404` JSON

Un seul port, un seul service.

### Checklist avant mise en production

- [ ] `ENCRYPTION_KEY` définie, exactement 64 caractères hex
- [ ] `JWT_SECRET` ≥ 32 caractères, distinct de celui de dev
- [ ] `DATABASE_URL` pointe vers la base de prod
- [ ] `BASE_URL` correspond au domaine réel
- [ ] Callback de l'OAuth App GitHub mis à jour sur le domaine de prod
- [ ] `GITHUB_PAT` fourni (sinon 60 req/h, le scan sature immédiatement)
- [ ] Origine ajoutée à la liste blanche CORS ou à `CORS_ORIGIN`
- [ ] Migrations jouées sur la base de prod — **jamais `schema.sql`**
- [ ] `/api/health` renvoie `{ status: 'ok', db: 'connected' }`

---

## 16. Modèle économique

| Phase | Déclencheur | Revenu |
|---|---|---|
| Aujourd'hui | — | Gratuit — construire la traction |
| Palier 1 | 5 000+ utilisateurs | **DYG Pro** (~8 $/mois) — profil avancé, export, historique |
| Palier 2 | 10 000+ utilisateurs | **DYG Recruit** — les recruteurs paient pour chercher des profils vérifiés |
| Long terme | — | **Mode agence** — assembler des équipes scorées pour des projets clients |

---

## 17. Dépannage

**`relation "wars" does not exist` au démarrage**
La base est antérieure à la migration 009. Le serveur démarre quand même, seul le scheduler de wars échoue.
```bash
psql dyg < server/db/migrations/009_wars.sql
```
Vérifier aussi 010. Si plusieurs tables manquent, comparer :
```bash
psql dyg -c "\dt"
grep -cE "^CREATE TABLE" server/db/schema.sql   # doit renvoyer 36
```

**`Configuration invalide` au démarrage**
Zod a rejeté l'environnement. Les champs fautifs sont listés. En dev le serveur démarre malgré tout via le fallback ; en prod il s'arrête.

**`OAuth config: hasOAuth=false, GH_CLIENT_ID=MISSING`**
Le login GitHub est désactivé. `/auth/github` redirige vers `/#/?auth=not_configured`. Renseigner `GH_CLIENT_ID` et `GH_CLIENT_SECRET`.

**Rate limit GitHub atteint pendant un scan**
Sans `GITHUB_PAT` : 60 requêtes par heure. Un seul scan en consomme plusieurs. Ajouter un PAT (scope `public_repo` suffit) → 5 000 req/h.

**La page est blanche sur `:3001`**
Normal en dev. `:3001` ne sert que l'API. Le frontend est sur **`:5173`**.

**Bio toujours vide après un scan**
`GEMINI_API_KEY` manquante. Tout le reste du scan fonctionne — la génération de bio est la seule fonctionnalité dégradée.

**`pg_isready` → pas de réponse**
```bash
brew services start postgresql@16
```

**Erreurs fantômes, I/O figées, `node_modules` corrompu**
Ne jamais placer ce repo dans `~/Desktop` : iCloud évince les fichiers de `node_modules` (état *dataless*), ce qui gèle les I/O. Garder le repo dans `~/dev`.

---

## Chiffres clés

| Métrique | Valeur |
|---|---|
| Tables en base | 36 |
| Endpoints API | 81 (+ 4 d'infrastructure) |
| Modules de routes | 13 |
| Services métier | 19 |
| Routes frontend | 21 |
| Pages | 18 |
| Composants | 11 |
| Feuilles CSS | 19 |
| Clés i18n | 636 × 2 langues |
| Exercices d'entraînement | 148 |
| Pistes d'entraînement | 49 |
| Briefs de projet | 15 |
| Développeurs de démonstration | 16 (2 par archétype) |
| Piliers de scoring | 8 |
| Archétypes | 8 |
| Migrations | 10 |
| Frameworks frontend | **0** |

---

## Contact

**4Dayvelopment** — https://dyg.dev
