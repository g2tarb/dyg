DROP TABLE IF EXISTS user_blocks CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS point_events CASCADE;
DROP TABLE IF EXISTS season_enrollments CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;
DROP TABLE IF EXISTS training_submissions CASCADE;
DROP TABLE IF EXISTS training_tips CASCADE;
DROP TABLE IF EXISTS training_exercises CASCADE;
DROP TABLE IF EXISTS training_tracks CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS project_brief_tips CASCADE;
DROP TABLE IF EXISTS project_briefs CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS ban_history CASCADE;
DROP TABLE IF EXISTS reputation CASCADE;
DROP TABLE IF EXISTS code_samples CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversation_participants CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS peer_reviews CASCADE;
DROP TABLE IF EXISTS score_snapshots CASCADE;
DROP TABLE IF EXISTS contribution_events CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS developer_scores CASCADE;
DROP TABLE IF EXISTS developers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Auth layer
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id INTEGER UNIQUE NOT NULL,
  github_login VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  avatar_url TEXT,
  name VARCHAR(100),
  access_token TEXT NOT NULL,
  data_consent BOOLEAN DEFAULT FALSE,
  availability VARCHAR(20) DEFAULT 'available'
    CHECK (availability IN ('available', 'in_project', 'unavailable')),
  abandon_count SMALLINT DEFAULT 0,
  banned_until TIMESTAMPTZ,
  ban_count SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Developer profiles (seed devs have user_id NULL, real users have it set)
CREATE TABLE developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  archetype VARCHAR(20) NOT NULL
    CHECK (archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth')),
  secondary_archetype VARCHAR(20)
    CHECK (secondary_archetype IS NULL OR secondary_archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth')),
  tertiary_archetype VARCHAR(20)
    CHECK (tertiary_archetype IS NULL OR tertiary_archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth')),
  tagline VARCHAR(100),
  price_range VARCHAR(20) NOT NULL DEFAULT 'medium',
  github_username VARCHAR(100),
  languages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE developer_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  pillar VARCHAR(20) NOT NULL
    CHECK (pillar IN ('code', 'velocity', 'craft', 'collaboration', 'versatility', 'creativity', 'autonomy', 'ia')),
  score SMALLINT NOT NULL CHECK (score >= 1 AND score <= 10),
  UNIQUE(developer_id, pillar)
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL DEFAULT 'My Team',
  synergy_score NUMERIC(4,1) DEFAULT 0,
  diversity_bonus NUMERIC(4,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  UNIQUE(team_id, developer_id)
);

-- Pôle Construire
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  repo_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'staffing', 'building', 'review', 'shipped', 'archived')),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  max_members SMALLINT DEFAULT 5,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE contribution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL,
  payload JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE score_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  pillar_scores JSONB NOT NULL,
  archetype_before VARCHAR(20),
  archetype_after VARCHAR(20),
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Peer reviews (closing ritual)
CREATE TABLE peer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pillar VARCHAR(20) NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, reviewer_id, reviewee_id, pillar)
);

-- Reputation (post-project reviews)
CREATE TABLE reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stars SMALLINT NOT NULL CHECK (stars >= 1 AND stars <= 5),
  comment TEXT CHECK (char_length(comment) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, reviewer_id, reviewee_id)
);

CREATE INDEX idx_reputation_reviewee ON reputation(reviewee_id);
CREATE INDEX idx_reputation_project ON reputation(project_id);

-- Ban history
CREATE TABLE ban_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  ban_duration_months SMALLINT NOT NULL,
  banned_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training system
CREATE TABLE training_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  level SMALLINT NOT NULL,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_exercises (
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

CREATE TABLE training_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES training_exercises(id) ON DELETE CASCADE,
  sort_order SMALLINT NOT NULL,
  content TEXT NOT NULL
);

CREATE TABLE training_submissions (
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

CREATE INDEX idx_training_submissions_user ON training_submissions(user_id);
CREATE INDEX idx_training_exercises_track ON training_exercises(track_id);

-- Project briefs (templates for team projects by level)
CREATE TABLE project_briefs (
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

CREATE TABLE project_brief_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES project_briefs(id) ON DELETE CASCADE,
  sort_order SMALLINT NOT NULL,
  content TEXT NOT NULL
);

CREATE INDEX idx_project_briefs_level ON project_briefs(level);
CREATE INDEX idx_project_brief_tips_brief ON project_brief_tips(brief_id);

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_key VARCHAR(50) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_key)
);

CREATE INDEX idx_badges_user ON badges(user_id);

-- Reports (moderation)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('user', 'message', 'comment', 'project')),
  target_id UUID NOT NULL,
  reason VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports(status);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  target_type VARCHAR(30),
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI training data pipeline
CREATE TABLE code_samples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  archetype VARCHAR(20) NOT NULL
    CHECK (archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor', 'synth')),
  sample_type VARCHAR(30) NOT NULL
    CHECK (sample_type IN ('commit_diff', 'commit_message', 'pr_description', 'code_review', 'file_structure')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  language VARCHAR(50),
  anonymized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_code_samples_archetype ON code_samples(archetype);
CREATE INDEX idx_code_samples_type ON code_samples(sample_type);
CREATE INDEX idx_code_samples_user ON code_samples(user_id);
CREATE INDEX idx_code_samples_lang ON code_samples(language);

-- Messagerie
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL DEFAULT 'dm'
    CHECK (type IN ('dm', 'global', 'archetype', 'project')),
  scope VARCHAR(64),
  name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_conversations_system
  ON conversations(type, scope)
  WHERE type IN ('global', 'archetype', 'project');
CREATE INDEX idx_conversations_type ON conversations(type);

CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 2000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_github_login ON users(github_login);
CREATE INDEX idx_developers_user_id ON developers(user_id);
CREATE INDEX idx_dev_scores_dev_id ON developer_scores(developer_id);
CREATE INDEX idx_dev_scores_pillar ON developer_scores(pillar);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_developers_archetype ON developers(archetype);
CREATE INDEX idx_projects_creator ON projects(creator_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_contribution_events_project ON contribution_events(project_id);
CREATE INDEX idx_contribution_events_user ON contribution_events(user_id);
CREATE INDEX idx_score_snapshots_user ON score_snapshots(user_id);
CREATE INDEX idx_peer_reviews_project ON peer_reviews(project_id);
CREATE INDEX idx_peer_reviews_reviewee ON peer_reviews(reviewee_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_conv_participants_user ON conversation_participants(user_id);

-- ==========================================
-- Seasons & division rankings
-- ==========================================

CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(60) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'active', 'ended')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seasons_status ON seasons(status);

CREATE TABLE season_enrollments (
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

CREATE INDEX idx_enrollments_ranking ON season_enrollments(season_id, division, total_points DESC);
CREATE INDEX idx_enrollments_user ON season_enrollments(user_id);

CREATE TABLE point_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES season_enrollments(id) ON DELETE CASCADE,
  source VARCHAR(20) NOT NULL CHECK (source IN ('github', 'dyg')),
  event_type VARCHAR(40) NOT NULL,
  points NUMERIC(5,1) NOT NULL,
  details JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_point_events_enrollment ON point_events(enrollment_id, occurred_at DESC);
CREATE INDEX idx_point_events_source ON point_events(enrollment_id, source);

-- ==========================================
-- Friendships & blocks
-- ==========================================

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

CREATE INDEX idx_friendships_requester ON friendships(requester_id, status);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id, status);

CREATE TABLE user_blocks (
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);
