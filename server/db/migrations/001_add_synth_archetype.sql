-- Add 'synth' archetype (IA + Craft dominants)
-- Run on existing databases: psql $DATABASE_URL < server/db/migrations/001_add_synth_archetype.sql

ALTER TABLE developers DROP CONSTRAINT IF EXISTS developers_archetype_check;
ALTER TABLE developers ADD CONSTRAINT developers_archetype_check
  CHECK (archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth'));

ALTER TABLE developers DROP CONSTRAINT IF EXISTS developers_secondary_archetype_check;
ALTER TABLE developers ADD CONSTRAINT developers_secondary_archetype_check
  CHECK (secondary_archetype IS NULL OR secondary_archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth'));

ALTER TABLE developers DROP CONSTRAINT IF EXISTS developers_tertiary_archetype_check;
ALTER TABLE developers ADD CONSTRAINT developers_tertiary_archetype_check
  CHECK (tertiary_archetype IS NULL OR tertiary_archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth'));

ALTER TABLE code_samples DROP CONSTRAINT IF EXISTS code_samples_archetype_check;
ALTER TABLE code_samples ADD CONSTRAINT code_samples_archetype_check
  CHECK (archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth'));
