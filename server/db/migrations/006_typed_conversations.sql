-- Typed conversations (DM, global, archetype, project).
-- Run after 005_friendships.sql.

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS type VARCHAR(20) NOT NULL DEFAULT 'dm'
    CHECK (type IN ('dm', 'global', 'archetype', 'project')),
  ADD COLUMN IF NOT EXISTS scope VARCHAR(64),
  ADD COLUMN IF NOT EXISTS name VARCHAR(100);

-- Only one system conversation per (type, scope) for global/archetype/project.
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_system
  ON conversations(type, scope)
  WHERE type IN ('global', 'archetype', 'project');

CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);

-- Seed the 1 global conversation + 8 archetype conversations.
INSERT INTO conversations (type, scope, name) VALUES
  ('global',    NULL,         'Global Community'),
  ('archetype', 'architect',  'Architect Division'),
  ('archetype', 'shipper',    'Shipper Division'),
  ('archetype', 'artisan',    'Artisan Division'),
  ('archetype', 'creative',   'Creative Division'),
  ('archetype', 'explorer',   'Explorer Division'),
  ('archetype', 'commando',   'Commando Division'),
  ('archetype', 'mentor',     'Mentor Division'),
  ('archetype', 'synth',      'Synth Division')
ON CONFLICT DO NOTHING;
