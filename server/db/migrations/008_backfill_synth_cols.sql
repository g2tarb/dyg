-- Idempotent backfill for DBs that predate the Synth archetype rollout.
-- Safe to run on any existing database — does nothing if already up to date.
--
-- What this fixes:
--   - developers.secondary_archetype / tertiary_archetype columns may be missing
--     on older DBs (the schema.sql in main has them, but Neon setups deployed
--     before that chantier are still on the old 7-archetype shape).
--   - developer_scores.pillar CHECK constraint may not list 'ia'.
--   - developers.archetype (+ secondary/tertiary) + code_samples.archetype
--     CHECK constraints may not list 'synth'.
--
-- Run in this order if you start fresh on a pre-Synth DB:
--   008 → 001 → 002 → 003 → 004 → 005 → 006 → 007
-- If you already ran 001–007, this migration is still safe (everything is
-- guarded by IF NOT EXISTS / DROP IF EXISTS).

-- 1. Ensure the dual/triple archetype columns exist.
ALTER TABLE developers ADD COLUMN IF NOT EXISTS secondary_archetype VARCHAR(20);
ALTER TABLE developers ADD COLUMN IF NOT EXISTS tertiary_archetype VARCHAR(20);

-- 2. Ensure archetype CHECK constraints include 'synth'.
ALTER TABLE developers DROP CONSTRAINT IF EXISTS developers_archetype_check;
ALTER TABLE developers ADD CONSTRAINT developers_archetype_check
  CHECK (archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth'));

ALTER TABLE developers DROP CONSTRAINT IF EXISTS developers_secondary_archetype_check;
ALTER TABLE developers ADD CONSTRAINT developers_secondary_archetype_check
  CHECK (secondary_archetype IS NULL OR secondary_archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth'));

ALTER TABLE developers DROP CONSTRAINT IF EXISTS developers_tertiary_archetype_check;
ALTER TABLE developers ADD CONSTRAINT developers_tertiary_archetype_check
  CHECK (tertiary_archetype IS NULL OR tertiary_archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth'));

-- 3. developer_scores pillar CHECK must include 'ia' (the 8th pillar).
ALTER TABLE developer_scores DROP CONSTRAINT IF EXISTS developer_scores_pillar_check;
ALTER TABLE developer_scores ADD CONSTRAINT developer_scores_pillar_check
  CHECK (pillar IN ('code', 'velocity', 'craft', 'collaboration', 'versatility', 'creativity', 'autonomy', 'ia'));

-- 4. code_samples.archetype CHECK must include 'synth'.
ALTER TABLE code_samples DROP CONSTRAINT IF EXISTS code_samples_archetype_check;
ALTER TABLE code_samples ADD CONSTRAINT code_samples_archetype_check
  CHECK (archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth'));
