-- Notification preferences per user. Default: all enabled.
-- Run after 009_wars.sql.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notification_prefs JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Shape: { email_project_reminders: bool, email_dms: bool, in_app_friend_requests: bool }
-- Missing keys → treated as true (opt-out model).
