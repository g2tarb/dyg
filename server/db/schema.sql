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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Developer profiles (seed devs have user_id NULL, real users have it set)
CREATE TABLE developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  archetype VARCHAR(20) NOT NULL,
  price_range VARCHAR(20) NOT NULL DEFAULT 'medium',
  github_username VARCHAR(100),
  languages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE developer_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  pillar VARCHAR(20) NOT NULL,
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
