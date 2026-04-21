-- Seed the active season (Sept 2025 → Sept 2026).
-- Run after 003_seasons_rankings.sql.
-- Idempotent via ON CONFLICT on slug.

INSERT INTO seasons (slug, name, starts_at, ends_at, status) VALUES
  ('2025-2026', 'Saison 2025-2026', '2025-09-01 00:00:00+00', '2026-09-01 00:00:00+00', 'active')
ON CONFLICT (slug) DO NOTHING;
