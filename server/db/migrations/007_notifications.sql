-- Universal notifications + project deadline.
-- Run after 006_typed_conversations.sql.

-- Allow per-project deadlines for reminders (nullable = no reminders).
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline_at TIMESTAMPTZ;

-- Universal notification table — any source (project, friend, message, war...).
-- `dedup_key` ensures the same notification cannot be created twice for the
-- same user (e.g. J-3 reminder for project X is unique).
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT,
  link VARCHAR(500),
  payload JSONB DEFAULT '{}',
  dedup_key VARCHAR(180),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, dedup_key)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);
