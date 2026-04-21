-- Inter-Division Wars (monthly) + scaffolding for future DYG Wars (5v5 ladder).
-- Run after 008_backfill_synth_cols.sql.

-- A war is a time-boxed competition with multiple teams.
-- Lifecycle: upcoming → staffing → running → judging → closed
--
-- inter_division : 8 teams (one per archetype division), monthly, 2 weeks build
-- dyg_war        : 5v5 ladder (future — phase scale), placeholder for forward-compat
CREATE TABLE IF NOT EXISTS wars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL DEFAULT 'inter_division'
    CHECK (type IN ('inter_division', 'dyg_war')),
  title VARCHAR(100) NOT NULL,
  brief TEXT NOT NULL,
  theme VARCHAR(50),
  state VARCHAR(20) NOT NULL DEFAULT 'upcoming'
    CHECK (state IN ('upcoming', 'staffing', 'running', 'judging', 'closed')),
  ai_allowed BOOLEAN NOT NULL DEFAULT true,
  season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,          -- staffing opens
  build_starts_at TIMESTAMPTZ NOT NULL,    -- build phase starts (staffing closes)
  deadline_at TIMESTAMPTZ NOT NULL,        -- build ends, judging starts
  judging_ends_at TIMESTAMPTZ NOT NULL,    -- judging ends, results published
  winner_team_id UUID,                     -- set when closing, FK added below
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wars_state ON wars(state);
CREATE INDEX IF NOT EXISTS idx_wars_deadline ON wars(deadline_at);
CREATE INDEX IF NOT EXISTS idx_wars_type ON wars(type);

-- One team per war (+ division for inter_division).
CREATE TABLE IF NOT EXISTS war_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  war_id UUID NOT NULL REFERENCES wars(id) ON DELETE CASCADE,
  division VARCHAR(20)
    CHECK (division IS NULL OR division IN (
      'architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth'
    )),
  name VARCHAR(100) NOT NULL,
  repo_url TEXT,
  deliverable_url TEXT,
  synergy_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0
    CHECK (synergy_multiplier > 0 AND synergy_multiplier <= 2.0),
  raw_score NUMERIC(5,2),       -- avg of judge ratings (0-10)
  ia_penalty NUMERIC(3,2) NOT NULL DEFAULT 0.0
    CHECK (ia_penalty >= 0 AND ia_penalty <= 1.0),
  final_score NUMERIC(5,2),     -- raw_score * synergy_multiplier * (1 - ia_penalty)
  is_winner BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (war_id, division)
);

CREATE INDEX IF NOT EXISTS idx_war_teams_war ON war_teams(war_id);
CREATE INDEX IF NOT EXISTS idx_war_teams_division ON war_teams(division);

-- Members of a team. Diversity is incentivized, not enforced.
CREATE TABLE IF NOT EXISTS war_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  war_team_id UUID NOT NULL REFERENCES war_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member'
    CHECK (role IN ('lead', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (war_team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_war_members_user ON war_members(user_id);
CREATE INDEX IF NOT EXISTS idx_war_members_team ON war_members(war_team_id);

-- Judges are selected from top-rated devs, excluding anyone with an accepted
-- friendship to any war participant (anti-collusion).
-- Stays anonymous until the war closes (revealed = true).
CREATE TABLE IF NOT EXISTS war_judges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  war_id UUID NOT NULL REFERENCES wars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  revealed BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (war_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_war_judges_war ON war_judges(war_id);
CREATE INDEX IF NOT EXISTS idx_war_judges_user ON war_judges(user_id);

-- Individual ratings per judge × team. No concertation phase (V1).
CREATE TABLE IF NOT EXISTS war_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  war_team_id UUID NOT NULL REFERENCES war_teams(id) ON DELETE CASCADE,
  judge_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score NUMERIC(4,1) NOT NULL CHECK (score >= 0 AND score <= 10),
  comment TEXT CHECK (comment IS NULL OR char_length(comment) <= 1000),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (war_team_id, judge_user_id)
);

CREATE INDEX IF NOT EXISTS idx_war_ratings_team ON war_ratings(war_team_id);
CREATE INDEX IF NOT EXISTS idx_war_ratings_judge ON war_ratings(judge_user_id);

-- Forward-reference: winner_team_id can now point to war_teams.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'wars_winner_team_id_fkey'
  ) THEN
    ALTER TABLE wars
      ADD CONSTRAINT wars_winner_team_id_fkey
      FOREIGN KEY (winner_team_id) REFERENCES war_teams(id) ON DELETE SET NULL;
  END IF;
END$$;
