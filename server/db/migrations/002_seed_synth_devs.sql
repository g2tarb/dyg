-- Seed 2 Synth devs on an existing database.
-- Prerequisite: migration 001_add_synth_archetype.sql must be applied first.
-- Idempotent: ON CONFLICT guards against rerunning.

INSERT INTO developers (id, name, avatar_url, bio, archetype, price_range, github_username, languages) VALUES
('a8000000-0000-0000-0000-000000000001', 'Zara Mehta', '/assets/portraits/zara.png',
 'Orchestre Claude et Cursor depuis 2023. Ses prompts sont des specs, ses commits des narrations.',
 'synth', 'medium', 'zara-synth',
 '["TypeScript", "Python", "Rust", "Go"]'),
('a8000000-0000-0000-0000-000000000002', 'Luan Oliveira', '/assets/portraits/luan.png',
 'Apprenti devenu lead en 18 mois avec l''IA. Chaque feature qu''il ship est review-ready.',
 'synth', 'low', 'luan-ships',
 '["JavaScript", "Python", "Swift", "Kotlin"]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a8000000-0000-0000-0000-000000000001', 'code', 7),
('a8000000-0000-0000-0000-000000000001', 'velocity', 9),
('a8000000-0000-0000-0000-000000000001', 'craft', 9),
('a8000000-0000-0000-0000-000000000001', 'collaboration', 6),
('a8000000-0000-0000-0000-000000000001', 'versatility', 7),
('a8000000-0000-0000-0000-000000000001', 'creativity', 6),
('a8000000-0000-0000-0000-000000000001', 'autonomy', 8),
('a8000000-0000-0000-0000-000000000001', 'ia', 10),
('a8000000-0000-0000-0000-000000000002', 'code', 6),
('a8000000-0000-0000-0000-000000000002', 'velocity', 8),
('a8000000-0000-0000-0000-000000000002', 'craft', 8),
('a8000000-0000-0000-0000-000000000002', 'collaboration', 5),
('a8000000-0000-0000-0000-000000000002', 'versatility', 7),
('a8000000-0000-0000-0000-000000000002', 'creativity', 7),
('a8000000-0000-0000-0000-000000000002', 'autonomy', 7),
('a8000000-0000-0000-0000-000000000002', 'ia', 9)
ON CONFLICT (developer_id, pillar) DO NOTHING;
