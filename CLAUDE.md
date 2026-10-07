# DYG — Do Your Game

Plateforme qui scanne un profil GitHub et génère une identité de développeur
(scoring 8 piliers, 8 archétypes, bio IA), avec entraînement, projets d'équipe et
portfolio.

Repo : github.com/g2tarb/dyg — Prod : https://dyg-olfu.onrender.com
Branche `main` = scanner GitHub publié. Branche `archive/full-platform-2026-06-14`
= plateforme complète. **Toujours demander sur quelle branche on travaille.**

## Stack réelle (ne jamais en dévier sans le proposer et le justifier)

- **Frontend** : JavaScript vanilla pur, SPA, ZÉRO framework (pas de React/Vue).
  Router à hash maison, store observable maison. Build : Vite 8.0.8.
- **Backend** : Fastify 5.8.5 (Node.js 22+, ESM). Base : PostgreSQL 16 via `pg`
  8.20.0 (pool). Validation : Zod 4.3.6.
- **Auth** : GitHub OAuth2 (`@fastify/oauth2` 8.2.0) + JWT en cookie HttpOnly (30 j).
- **Chiffrement** : AES-256-GCM via `node:crypto` (tokens GitHub au repos).
- **Logs** : Pino 10.3.1 avec redaction. **IA** : Google Gemini (bio).
  **Email** : Resend.
- **Conteneur** : Docker multi-stage node:22-alpine. **Hébergement** : Render + Neon.

Philosophie assumée : bundle minuscule, contrôle total du DOM, zéro dette de
framework. On garde cet esprit : dépendances externes minimales, chacune justifiée.

## Arborescence (respecter cette structure)

```
server/  index.js (bootstrap), config/env.js (Zod + fallback dev), constants/,
         db/ (connection.js, schema.sql 36 tables, migrations/ 001→010, seed*.sql),
         routes/ (13 modules), schemas/validation.js, services/ (19),
         utils/ (crypto.js, errors.js)

src/     main.js, router.js, store.js, pages/ (18), components/ (11),
         i18n/ (FR+EN), styles/ (1 globale + 1 par page),
         utils/ (sanitize.js, theme.js), assets/
```

## Conventions frontend (à suivre à l'identique)

- Une route = `(container, params) => cleanupFn`. Le cleanup DOIT libérer listeners
  et intervals. Jamais de fuite.
- Enregistrer toute nouvelle route dans `main.js`. Patterns dynamiques `/profile/:id`.
- Store : `setState(key, value)` notifie uniquement les abonnés de cette clé.
- i18n : dictionnaires plats `'clé.sous_clé': 'valeur'`. TOUTE chaîne visible par
  l'utilisateur doit exister en FR ET EN, lignes synchronisées. Jamais de texte en
  dur dans une page.
- CSS : une feuille globale + une feuille par page. Pas de librairie CSS.
- XSS : toute donnée d'origine utilisateur passe par `src/utils/sanitize.js` avant
  insertion DOM. Jamais d'`innerHTML` avec données non échappées.

## Conventions backend (à suivre à l'identique)

- Ordre des plugins dans `server/index.js` : Helmet → compression → ETag → CORS →
  rate limit → hook ban IP → hook request-id → cookie → JWT → OAuth2 → error
  handler → routes → robots/sitemap/health → cron → static. **Respecter cet ordre.**
- Gestion d'erreur centralisée (un seul `setErrorHandler`) : 429
  `TOO_MANY_REQUESTS`, 422 `VALIDATION_FAILED` (ZodError, détail par champ),
  `DygError` → son `statusCode`, 500 `INTERNAL_SERVER_ERROR` avec
  `reference: requestId`. Une erreur non gérée ne fuit JAMAIS de stack au client.
- Erreurs typées (`server/utils/errors.js`) : utiliser `DygError` et ses
  sous-classes (`ValidationError`, `NotFoundError`, `UnauthorizedError`,
  `ForbiddenError`, `ConflictError`, `IntegrationError`). Ne pas lancer d'`Error`
  brut dans le métier.
- Validation Zod systématique : env (`config/env.js`) et payloads
  (`schemas/validation.js`). Pas d'entrée non validée.
- Requêtes SQL via le pool `pg`, toujours paramétrées (`$1`, `$2`). Jamais de
  concaténation de chaînes dans une requête.

## Sécurité (acquis du projet — maintenir, ne jamais régresser)

Déjà en place, à préserver et à étendre : Helmet, CORS liste blanche stricte en prod
(`credentials: true`, méthodes GET/POST/PATCH/DELETE/OPTIONS), rate limit
100 req/min/IP avec ban 15 min, JWT HttpOnly, tokens GitHub chiffrés AES-256-GCM
(`iv:tag:ciphertext`), Pino redaction (authorization, cookie, password, token,
access_token, scores), `bodyLimit` 1 Mo, regex de validation du pseudo GitHub avant
tout appel externe, `AbortSignal.timeout` sur les appels GitHub, `sanitizeForPrompt`
contre l'injection de prompt Gemini, tables `audit_logs` et `reports`.

Règles : secrets uniquement via variables d'env, jamais dans le code ni les logs.
`ENCRYPTION_KEY` = exactement 64 hex ; en prod, absence → `process.exit(1)`. Le
fallback de clé dev est volontairement faible et ne doit JAMAIS servir en prod.

À chaque ajout de fonctionnalité : vérifier injection SQL, XSS, contrôle d'accès
(IDOR : l'utilisateur ne peut agir que sur ses propres ressources, vérif côté
serveur), rate limiting, taille des entrées. **Fournir une mini-checklist sécurité.**

## Tests (harnais en place)

Runner natif `node:test`, **zéro dépendance**. `server/index.js` exporte l'instance
`fastify` et ne lance `listen()`/crons que si lancé directement (`isMain`) — un
import de test assemble l'app pour `fastify.inject()` sans ouvrir de port.

- `npm test` — tests unitaires (`test/*.test.js`), sans base, déterministes.
- `npm run check` — résout les imports ESM des 38 modules-feuilles.
- `npm run test:setup` — (re)crée la base jetable `dyg_test` depuis `schema.sql`.
- `npm run test:int` — tests d'intégration (`test/integration/*.test.js`) sur
  `dyg_test` via `fastify.inject`, scan GitHub rejoué depuis les fixtures.
- `npm run bench:*` — banc de mesure de la distribution du scoring (cf. DYG-C2).

Règles : un test d'intégration refuse de tourner sur une base dont le nom ne
contient pas « test » (garde-fou anti-mutation de la dev DB). Les fixtures GitHub
(`scripts/fixtures/`) sont gitignorées (données perso de tiers) → les tests qui en
dépendent se skippent proprement sans elles. Pour toute faille corrigée : test qui
échoue AVANT le fix, passe APRÈS (Red → Green).

## RGPD (respecter le modèle existant)

Consentement explicite avant collecte de code (`users.data_consent`). Export
(`GET /api/auth/my-data-export`) et suppression (`DELETE /api/auth/account`) de
compte. Anonymisation du contenu ET des noms de fichiers avant stockage. Toute
nouvelle collecte de données doit respecter minimisation + consentement + durée de
conservation.

## Base de données (prudence absolue)

- `schema.sql` contient des `DROP TABLE ... CASCADE` : **DESTRUCTIF**. `db:reset`
  aussi.
- En production : JAMAIS `schema.sql`. Toute évolution de schéma = nouvelle
  migration incrémentale (`server/db/migrations/0XX_nom.sql`), numérotée à la suite
  de 010, idempotente si possible, testée sur une base de copie d'abord.
- Les tâches cron sont in-process (`setInterval` + `unref()`). Pour tout scale
  horizontal, prévoir un advisory lock PostgreSQL (limitation connue documentée).

## Moteur de scoring (ne pas casser la logique métier)

Le scoring V4 (base 1, max 10, 8+ rare) et la détermination d'archétype (deux
piliers dominants, test sur `minDominant` et pas seulement la somme) sont le cœur du
produit.

Avant toute modification du scoring (`services/github.js`, `services/scoring.js`),
**demander** : montrer l'impact sur la distribution cible (moyenne ~5, 8+ = top 15 %,
9+ = top 5 %) avant d'appliquer. Ne jamais pénaliser l'usage d'IA en soi — seulement
l'usage sans compréhension (règle IA Mastery).

## Méthode de travail

1. **Avant de coder** : reformuler la demande, dire quels fichiers seront touchés et
   pourquoi, signaler tout risque de régression (scoring, migrations, i18n, sécu).
   Poser des questions si quoi que ce soit est ambigu (3 max à la fois).
2. **Coder par étapes.** Code complet par fichier (pas de « … »), chemin exact,
   commandes d'install/test, résultat attendu. Attendre validation entre étapes
   importantes.
3. **Après chaque étape** : récap (fait / comment tester / prochaine étape) +
   checklist sécurité quand pertinent + rappel i18n si une chaîne UI a été ajoutée.

## Anti-hallucination

- Ne jamais inventer un endpoint, une table, un service, une colonne, un nom de
  fichier ou une option. En cas de doute sur l'existence d'une chose dans le repo,
  demander le fichier ou le dire explicitement.
- Ne jamais inventer de version de dépendance ni d'API Fastify/Zod/pg. En cas de
  doute, renvoyer vers la doc officielle.
- Rester dans le périmètre demandé ; les idées hors périmètre = propositions
  séparées, jamais ajoutées d'office.

## Pièges connus à rappeler

- Frontend servi sur **:5173** en dev, pas :3001 (qui ne sert que l'API).
- Sans `GITHUB_PAT` : 60 req/h → un scan sature. Avec : 5 000 req/h.
- Ne jamais placer le repo dans `~/Desktop` (iCloud évince `node_modules` → I/O
  figées). Repo dans `~/dev`.

## Écarts connus entre les règles et le code actuel

- `RESEND_API_KEY` et `RESEND_FROM` sont lus directement via `process.env` dans
  `server/services/email.js`, **hors du schéma Zod** de `config/env.js`, et sont
  absents de `.env.example`. `sendEmail()` est un no-op silencieux si l'un des deux
  manque. À régulariser pour respecter la règle « validation Zod systématique de
  l'env ».

## Format des réponses

Français, clair, structuré, avec le « pourquoi » avant chaque bloc de code et les
pièges fréquents signalés.
