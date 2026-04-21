-- Seasons & division rankings foundation.
-- Run after 002_seed_synth_devs.sql.

-- One season per academic year (Sept → Sept).
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(60) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'active', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seasons_status ON seasons(status);

-- Enrollment = one row per (user, season). Division frozen at enrollment time.
-- github_points and dyg_points each capped at 50 → total 100 max per season.
CREATE TABLE IF NOT EXISTS season_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  division VARCHAR(20) NOT NULL
    CHECK (division IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth')),
  github_points NUMERIC(6,1) NOT NULL DEFAULT 0
    CHECK (github_points >= 0 AND github_points <= 50),
  dyg_points NUMERIC(6,1) NOT NULL DEFAULT 0
    CHECK (dyg_points >= 0 AND dyg_points <= 50),
  total_points NUMERIC(6,1) GENERATED ALWAYS AS (github_points + dyg_points) STORED,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(season_id, user_id)
);

-- Leaderboard query: WHERE season_id = $1 AND division = $2 ORDER BY total_points DESC
CREATE INDEX IF NOT EXISTS idx_enrollments_ranking
  ON season_enrollments(season_id, division, total_points DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_user
  ON season_enrollments(user_id);

-- Audit trail: every point awarded is a row here. Aggregates into season_enrollments.
CREATE TABLE IF NOT EXISTS point_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES season_enrollments(id) ON DELETE CASCADE,
  source VARCHAR(20) NOT NULL CHECK (source IN ('github', 'dyg')),
  event_type VARCHAR(40) NOT NULL,
  -- Accepted event_types (non-exhaustive, evolves with scoring rules):
  --   github: daily_push, repo_created, repo_substantial, repo_starred
  --   dyg:    exercise_completed, project_shipped, peer_review_given,
  --           war_participation, war_win, interdiv_participation, interdiv_win
  points NUMERIC(5,1) NOT NULL,
  details JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_events_enrollment
  ON point_events(enrollment_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_events_source
  ON point_events(enrollment_id, source);
