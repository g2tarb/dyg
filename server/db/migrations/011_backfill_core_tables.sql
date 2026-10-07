-- 011_backfill_core_tables.sql
--
-- Rattrapage des tables et colonnes qui n'existent que dans schema.sql et n'ont
-- jamais eu de migration incrémentale dédiée. Une base créée avant l'ajout de ces
-- objets (ou initialisée depuis un schema.sql plus ancien) est incomplète : les
-- services ban.js, badges.js, reviewer.js, closing.js et les routes training /
-- project-briefs / report échouent avec « relation does not exist ».
--
-- Ne couvre PAS les tables wars (wars, war_teams, war_members, war_judges,
-- war_ratings) : elles sont déjà fournies par 009_wars.sql, qui est idempotent.
-- Jouer 009 avant celle-ci si les tables wars manquent aussi.
--
-- Idempotente : rejouable sans effet de bord.
--
--   psql dyg < server/db/migrations/009_wars.sql
--   psql dyg < server/db/migrations/010_user_preferences.sql
--   psql dyg < server/db/migrations/011_backfill_core_tables.sql

BEGIN;

-- ==========================================
-- Colonnes manquantes sur les tables existantes
-- ==========================================

-- Système anti-abandon et bans progressifs (server/services/ban.js).
-- Sans ces colonnes, recordAbandon() et isUserBanned() échouent.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS abandon_count SMALLINT DEFAULT 0;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS banned_until TIMESTAMPTZ;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS ban_count SMALLINT DEFAULT 0;

-- Accroche courte affichée sur la carte développeur.
ALTER TABLE developers
  ADD COLUMN IF NOT EXISTS tagline VARCHAR(100);

-- ==========================================
-- Réputation (peer reviews post-projet)
-- ==========================================

CREATE TABLE IF NOT EXISTS reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stars SMALLINT NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment TEXT CHECK (char_length(comment) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, reviewer_id, reviewee_id)
);

CREATE INDEX IF NOT EXISTS idx_reputation_reviewee ON reputation(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reputation_project ON reputation(project_id);

-- ==========================================
-- Historique des bans
-- ==========================================

CREATE TABLE IF NOT EXISTS ban_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  ban_duration_months SMALLINT NOT NULL,
  banned_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Entraînement
-- ==========================================

CREATE TABLE IF NOT EXISTS training_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  level SMALLINT NOT NULL,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES training_tracks(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  expected_result TEXT,
  level SMALLINT NOT NULL DEFAULT 1,
  sort_order SMALLINT DEFAULT 0,
  pillar_impact VARCHAR(20)[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES training_exercises(id) ON DELETE CASCADE,
  sort_order SMALLINT NOT NULL,
  content TEXT NOT NULL
);

-- gray_stars part à 5.0 et descend à chaque indice consulté (tips_used).
CREATE TABLE IF NOT EXISTS training_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES training_exercises(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  repo_url TEXT,
  gold_stars SMALLINT DEFAULT 0 CHECK (gold_stars >= 0 AND gold_stars <= 5),
  gray_stars NUMERIC(2,1) DEFAULT 5.0 CHECK (gray_stars >= 0 AND gray_stars <= 5),
  tips_used SMALLINT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'submitted', 'reviewed')),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exercise_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_training_submissions_user ON training_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_training_exercises_track ON training_exercises(track_id);

-- ==========================================
-- Briefs de projet (templates d'équipe par niveau)
-- ==========================================

CREATE TABLE IF NOT EXISTS project_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  brief TEXT NOT NULL,
  stack VARCHAR(50) NOT NULL DEFAULT 'html-css',
  level SMALLINT NOT NULL CHECK (level >= 1 AND level <= 10),
  deadline_days SMALLINT NOT NULL DEFAULT 14,
  max_members SMALLINT DEFAULT 4,
  theme VARCHAR(50),
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_brief_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES project_briefs(id) ON DELETE CASCADE,
  sort_order SMALLINT NOT NULL,
  content TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_briefs_level ON project_briefs(level);
CREATE INDEX IF NOT EXISTS idx_project_brief_tips_brief ON project_brief_tips(brief_id);

-- ==========================================
-- Badges
-- ==========================================

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_key VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_key)
);

CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_id);

-- ==========================================
-- Signalements (modération)
-- ==========================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('user', 'message', 'comment', 'project')),
  target_id UUID NOT NULL,
  reason VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

COMMIT;
