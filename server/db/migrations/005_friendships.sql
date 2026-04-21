-- Friendships & user blocks.
-- Run after 004_seed_current_season.sql.

-- A friendship request goes from requester to addressee.
-- Accepted = both users are friends (bidirectional semantic).
-- Declined = locked, addressee ne sera plus sollicité (sauf si la relation est nettoyée plus tard).
CREATE TABLE IF NOT EXISTS friendships (
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

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id, status);

-- User blocks are directional: A blocks B does NOT imply B blocks A.
-- Used to hide a blocker's messages from the blocked user in community chats.
CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);
