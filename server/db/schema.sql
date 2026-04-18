DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS developer_scores CASCADE;
DROP TABLE IF EXISTS developers CASCADE;

CREATE TABLE developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX idx_dev_scores_dev_id ON developer_scores(developer_id);
CREATE INDEX idx_dev_scores_pillar ON developer_scores(pillar);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_developers_archetype ON developers(archetype);
