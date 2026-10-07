-- 012_token_version.sql
--
-- DYG-H2 : révocation des JWT. Un JWT a une durée de 30 jours et n'était pas
-- révocable — logout n'effaçait que le cookie, un token volé restait valide.
--
-- On ajoute un compteur de version par utilisateur, embarqué dans le payload du
-- JWT à la signature et comparé à chaque vérification (option `trusted` de
-- @fastify/jwt). Incrémenter la version invalide instantanément tous les tokens
-- déjà émis pour ce compte (logout, suppression, compromission).
--
-- Idempotente. À jouer à la suite de 011.
--   psql dyg < server/db/migrations/012_token_version.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;
