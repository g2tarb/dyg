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
    CHECK (archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor')),
  price_range VARCHAR(20) NOT NULL DEFAULT 'medium',
  github_username VARCHAR(100),
  languages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE developer_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  pillar VARCHAR(20) NOT NULL
    CHECK (pillar IN ('code', 'velocity', 'craft', 'collaboration', 'versatility', 'creativity', 'autonomy')),
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
    CHECK (archetype IN ('architect', 'shipper', 'artisan', 'creative', 'explorer', 'commando', 'mentor')),
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
