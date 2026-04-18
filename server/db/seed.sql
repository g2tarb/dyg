-- ==========================================
-- DYG Seed Data — 14 developers (2 per archetype)
-- ==========================================

-- ARCHITECTES (dominant: code + autonomy)
INSERT INTO developers (id, name, avatar_url, bio, archetype, price_range, github_username, languages) VALUES
('a1000000-0000-0000-0000-000000000001', 'Kael Andersen', '/src/assets/portraits/kael.png',
 'Développeur Unity depuis 8 ans. Architecte systèmes multijoueur, son code réseau est une référence.',
 'architect', 'high', 'kael-dev',
 '["C#", "Unity", "C++", "Rust"]'),
('a1000000-0000-0000-0000-000000000002', 'Yumi Nakamura', '/src/assets/portraits/yumi.png',
 'Spécialiste moteur de jeu. Elle a construit 3 frameworks custom avant de rejoindre un studio AAA.',
 'architect', 'high', 'yumi-engine',
 '["C++", "Vulkan", "Rust", "Python"]');

-- SHIPPERS (dominant: velocity + autonomy)
INSERT INTO developers (id, name, avatar_url, bio, archetype, price_range, github_username, languages) VALUES
('a2000000-0000-0000-0000-000000000001', 'Marcus Rivera', '/src/assets/portraits/marcus.png',
 '12 game jams en 2 ans. Chaque prototype fonctionne. Chaque deadline est tenue.',
 'shipper', 'medium', 'marcus-ships',
 '["GDScript", "Godot", "JavaScript", "Lua"]'),
('a2000000-0000-0000-0000-000000000002', 'Lina Bergström', '/src/assets/portraits/lina.png',
 'Du concept au store en 6 semaines. Elle code, elle ship, elle recommence.',
 'shipper', 'medium', 'lina-fast',
 '["C#", "Unity", "TypeScript", "Dart"]');

-- ARTISANS (dominant: craft + code)
INSERT INTO developers (id, name, avatar_url, bio, archetype, price_range, github_username, languages) VALUES
('a3000000-0000-0000-0000-000000000001', 'Théo Mercier', '/src/assets/portraits/theo.png',
 'Chaque shader est une oeuvre. Son pixel art a plus de personnalité que la plupart des jeux 3D.',
 'artisan', 'high', 'theo-craft',
 '["GLSL", "C#", "Unity", "Aseprite"]'),
('a3000000-0000-0000-0000-000000000002', 'Sakura Hayashi', '/src/assets/portraits/sakura.png',
 'Sound designer et dev. Ses jeux se jouent autant avec les oreilles qu''avec les mains.',
 'artisan', 'medium', 'sakura-audio',
 '["C#", "Unity", "FMOD", "Wwise", "Python"]');

-- CRÉATIFS (dominant: creativity + versatility)
INSERT INTO developers (id, name, avatar_url, bio, archetype, price_range, github_username, languages) VALUES
('a4000000-0000-0000-0000-000000000001', 'Enzo Da Silva', '/src/assets/portraits/enzo.png',
 'Game designer et développeur. Ses game jams finissent toujours avec un concept que personne n''avait vu venir.',
 'creative', 'medium', 'enzo-creates',
 '["GDScript", "Godot", "Lua", "JavaScript"]'),
('a4000000-0000-0000-0000-000000000002', 'Nora Eriksen', '/src/assets/portraits/nora.png',
 'Narrative designer qui code ses propres outils. Ses dialogues sont procéduraux et personne ne s''en rend compte.',
 'creative', 'low', 'nora-narrative',
 '["Ink", "C#", "Unity", "Python", "Twine"]');

-- EXPLORATEURS (dominant: versatility + creativity)
INSERT INTO developers (id, name, avatar_url, bio, archetype, price_range, github_username, languages) VALUES
('a5000000-0000-0000-0000-000000000001', 'Amir Okafor', '/src/assets/portraits/amir.png',
 'Frontend, backend, shaders, IA — il a touché à tout et il recommence. Généraliste assumé.',
 'explorer', 'low', 'amir-explores',
 '["JavaScript", "Python", "C#", "Rust", "GLSL", "Lua"]'),
('a5000000-0000-0000-0000-000000000002', 'Clara Moreau', '/src/assets/portraits/clara.png',
 'Ex-développeuse web reconvertie game dev. Elle apporte des patterns que l''industrie du jeu n''a pas encore.',
 'explorer', 'low', 'clara-polyglot',
 '["TypeScript", "React", "C#", "Godot", "GDScript"]');

-- COMMANDOS (dominant: velocity + collaboration)
INSERT INTO developers (id, name, avatar_url, bio, archetype, price_range, github_username, languages) VALUES
('a6000000-0000-0000-0000-000000000001', 'Jin Park', '/src/assets/portraits/jin.png',
 'Lead d''équipes game jam. Il synchronise 4 devs en 48h et le jeu tourne à la fin.',
 'commando', 'medium', 'jin-lead',
 '["C#", "Unity", "JavaScript", "Python"]'),
('a6000000-0000-0000-0000-000000000002', 'Sofia Petrov', '/src/assets/portraits/sofia.png',
 'QA dev. Elle casse ton jeu en 10 minutes, le patche en 20, et push avant la deadline.',
 'commando', 'low', 'sofia-qa',
 '["C#", "Unity", "Python", "Lua"]');

-- MENTORS (dominant: collaboration + craft)
INSERT INTO developers (id, name, avatar_url, bio, archetype, price_range, github_username, languages) VALUES
('a7000000-0000-0000-0000-000000000001', 'David Kowalski', '/src/assets/portraits/david.png',
 'Ses code reviews transforment les juniors en devs solides. 15 ans d''industrie, 0 ego.',
 'mentor', 'high', 'david-reviews',
 '["C++", "C#", "Unreal", "Unity", "Python"]'),
('a7000000-0000-0000-0000-000000000002', 'Fatou Diallo', '/src/assets/portraits/fatou.png',
 'Formatrice Unity et dev indé. Elle enseigne le jour, elle ship la nuit.',
 'mentor', 'medium', 'fatou-teaches',
 '["C#", "Unity", "GDScript", "Godot"]');

-- ==========================================
-- SCORES (7 piliers × 14 devs = 98 rows)
-- Pillars: code, velocity, craft, collaboration, versatility, creativity, autonomy
-- ==========================================

-- Kael Andersen (Architect) — code:9, autonomy:9
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a1000000-0000-0000-0000-000000000001', 'code', 9),
('a1000000-0000-0000-0000-000000000001', 'velocity', 5),
('a1000000-0000-0000-0000-000000000001', 'craft', 6),
('a1000000-0000-0000-0000-000000000001', 'collaboration', 4),
('a1000000-0000-0000-0000-000000000001', 'versatility', 5),
('a1000000-0000-0000-0000-000000000001', 'creativity', 4),
('a1000000-0000-0000-0000-000000000001', 'autonomy', 9);

-- Yumi Nakamura (Architect) — code:10, autonomy:8
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a1000000-0000-0000-0000-000000000002', 'code', 10),
('a1000000-0000-0000-0000-000000000002', 'velocity', 4),
('a1000000-0000-0000-0000-000000000002', 'craft', 7),
('a1000000-0000-0000-0000-000000000002', 'collaboration', 3),
('a1000000-0000-0000-0000-000000000002', 'versatility', 6),
('a1000000-0000-0000-0000-000000000002', 'creativity', 5),
('a1000000-0000-0000-0000-000000000002', 'autonomy', 8);

-- Marcus Rivera (Shipper) — velocity:9, autonomy:8
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a2000000-0000-0000-0000-000000000001', 'code', 6),
('a2000000-0000-0000-0000-000000000001', 'velocity', 9),
('a2000000-0000-0000-0000-000000000001', 'craft', 5),
('a2000000-0000-0000-0000-000000000001', 'collaboration', 6),
('a2000000-0000-0000-0000-000000000001', 'versatility', 5),
('a2000000-0000-0000-0000-000000000001', 'creativity', 4),
('a2000000-0000-0000-0000-000000000001', 'autonomy', 8);

-- Lina Bergström (Shipper) — velocity:10, autonomy:7
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a2000000-0000-0000-0000-000000000002', 'code', 7),
('a2000000-0000-0000-0000-000000000002', 'velocity', 10),
('a2000000-0000-0000-0000-000000000002', 'craft', 4),
('a2000000-0000-0000-0000-000000000002', 'collaboration', 5),
('a2000000-0000-0000-0000-000000000002', 'versatility', 6),
('a2000000-0000-0000-0000-000000000002', 'creativity', 3),
('a2000000-0000-0000-0000-000000000002', 'autonomy', 7);

-- Théo Mercier (Artisan) — craft:10, code:8
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a3000000-0000-0000-0000-000000000001', 'code', 8),
('a3000000-0000-0000-0000-000000000001', 'velocity', 3),
('a3000000-0000-0000-0000-000000000001', 'craft', 10),
('a3000000-0000-0000-0000-000000000001', 'collaboration', 4),
('a3000000-0000-0000-0000-000000000001', 'versatility', 3),
('a3000000-0000-0000-0000-000000000001', 'creativity', 7),
('a3000000-0000-0000-0000-000000000001', 'autonomy', 5);

-- Sakura Hayashi (Artisan) — craft:9, code:7
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a3000000-0000-0000-0000-000000000002', 'code', 7),
('a3000000-0000-0000-0000-000000000002', 'velocity', 4),
('a3000000-0000-0000-0000-000000000002', 'craft', 9),
('a3000000-0000-0000-0000-000000000002', 'collaboration', 6),
('a3000000-0000-0000-0000-000000000002', 'versatility', 5),
('a3000000-0000-0000-0000-000000000002', 'creativity', 6),
('a3000000-0000-0000-0000-000000000002', 'autonomy', 4);

-- Enzo Da Silva (Creative) — creativity:9, versatility:8
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a4000000-0000-0000-0000-000000000001', 'code', 5),
('a4000000-0000-0000-0000-000000000001', 'velocity', 6),
('a4000000-0000-0000-0000-000000000001', 'craft', 6),
('a4000000-0000-0000-0000-000000000001', 'collaboration', 5),
('a4000000-0000-0000-0000-000000000001', 'versatility', 8),
('a4000000-0000-0000-0000-000000000001', 'creativity', 9),
('a4000000-0000-0000-0000-000000000001', 'autonomy', 5);

-- Nora Eriksen (Creative) — creativity:10, versatility:7
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a4000000-0000-0000-0000-000000000002', 'code', 4),
('a4000000-0000-0000-0000-000000000002', 'velocity', 5),
('a4000000-0000-0000-0000-000000000002', 'craft', 7),
('a4000000-0000-0000-0000-000000000002', 'collaboration', 6),
('a4000000-0000-0000-0000-000000000002', 'versatility', 7),
('a4000000-0000-0000-0000-000000000002', 'creativity', 10),
('a4000000-0000-0000-0000-000000000002', 'autonomy', 4);

-- Amir Okafor (Explorer) — versatility:10, creativity:7
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a5000000-0000-0000-0000-000000000001', 'code', 6),
('a5000000-0000-0000-0000-000000000001', 'velocity', 5),
('a5000000-0000-0000-0000-000000000001', 'craft', 4),
('a5000000-0000-0000-0000-000000000001', 'collaboration', 5),
('a5000000-0000-0000-0000-000000000001', 'versatility', 10),
('a5000000-0000-0000-0000-000000000001', 'creativity', 7),
('a5000000-0000-0000-0000-000000000001', 'autonomy', 6);

-- Clara Moreau (Explorer) — versatility:9, creativity:8
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a5000000-0000-0000-0000-000000000002', 'code', 7),
('a5000000-0000-0000-0000-000000000002', 'velocity', 6),
('a5000000-0000-0000-0000-000000000002', 'craft', 5),
('a5000000-0000-0000-0000-000000000002', 'collaboration', 6),
('a5000000-0000-0000-0000-000000000002', 'versatility', 9),
('a5000000-0000-0000-0000-000000000002', 'creativity', 8),
('a5000000-0000-0000-0000-000000000002', 'autonomy', 5);

-- Jin Park (Commando) — velocity:8, collaboration:9
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a6000000-0000-0000-0000-000000000001', 'code', 6),
('a6000000-0000-0000-0000-000000000001', 'velocity', 8),
('a6000000-0000-0000-0000-000000000001', 'craft', 5),
('a6000000-0000-0000-0000-000000000001', 'collaboration', 9),
('a6000000-0000-0000-0000-000000000001', 'versatility', 5),
('a6000000-0000-0000-0000-000000000001', 'creativity', 4),
('a6000000-0000-0000-0000-000000000001', 'autonomy', 5);

-- Sofia Petrov (Commando) — velocity:9, collaboration:8
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a6000000-0000-0000-0000-000000000002', 'code', 7),
('a6000000-0000-0000-0000-000000000002', 'velocity', 9),
('a6000000-0000-0000-0000-000000000002', 'craft', 4),
('a6000000-0000-0000-0000-000000000002', 'collaboration', 8),
('a6000000-0000-0000-0000-000000000002', 'versatility', 4),
('a6000000-0000-0000-0000-000000000002', 'creativity', 3),
('a6000000-0000-0000-0000-000000000002', 'autonomy', 6);

-- David Kowalski (Mentor) — collaboration:9, craft:8
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a7000000-0000-0000-0000-000000000001', 'code', 7),
('a7000000-0000-0000-0000-000000000001', 'velocity', 4),
('a7000000-0000-0000-0000-000000000001', 'craft', 8),
('a7000000-0000-0000-0000-000000000001', 'collaboration', 9),
('a7000000-0000-0000-0000-000000000001', 'versatility', 6),
('a7000000-0000-0000-0000-000000000001', 'creativity', 5),
('a7000000-0000-0000-0000-000000000001', 'autonomy', 4);

-- Fatou Diallo (Mentor) — collaboration:10, craft:7
INSERT INTO developer_scores (developer_id, pillar, score) VALUES
('a7000000-0000-0000-0000-000000000002', 'code', 6),
('a7000000-0000-0000-0000-000000000002', 'velocity', 5),
('a7000000-0000-0000-0000-000000000002', 'craft', 7),
('a7000000-0000-0000-0000-000000000002', 'collaboration', 10),
('a7000000-0000-0000-0000-000000000002', 'versatility', 5),
('a7000000-0000-0000-0000-000000000002', 'creativity', 6),
('a7000000-0000-0000-0000-000000000002', 'autonomy', 5);

-- ==========================================
-- DEMO USERS (fake, for portfolio showcase)
-- ==========================================

INSERT INTO users (id, github_id, github_login, email, avatar_url, name, access_token) VALUES
('b1000000-0000-0000-0000-000000000001', 900001, 'jin-lead', 'jin@demo.dyg', '/src/assets/portraits/jin.png', 'Jin Park', 'demo-token'),
('b1000000-0000-0000-0000-000000000002', 900002, 'clara-polyglot', 'clara@demo.dyg', '/src/assets/portraits/clara.png', 'Clara Moreau', 'demo-token'),
('b1000000-0000-0000-0000-000000000003', 900003, 'enzo-creates', 'enzo@demo.dyg', '/src/assets/portraits/enzo.png', 'Enzo Da Silva', 'demo-token'),
('b1000000-0000-0000-0000-000000000004', 900004, 'theo-craft', 'theo@demo.dyg', '/src/assets/portraits/theo.png', 'Théo Mercier', 'demo-token');

-- Link demo users to existing developer profiles
UPDATE developers SET user_id = 'b1000000-0000-0000-0000-000000000001' WHERE id = 'a6000000-0000-0000-0000-000000000001';
UPDATE developers SET user_id = 'b1000000-0000-0000-0000-000000000002' WHERE id = 'a5000000-0000-0000-0000-000000000002';
UPDATE developers SET user_id = 'b1000000-0000-0000-0000-000000000003' WHERE id = 'a4000000-0000-0000-0000-000000000001';
UPDATE developers SET user_id = 'b1000000-0000-0000-0000-000000000004' WHERE id = 'a3000000-0000-0000-0000-000000000001';

-- ==========================================
-- DEMO PROJECTS
-- ==========================================

INSERT INTO projects (id, name, description, repo_url, status, creator_id, max_members, started_at, ended_at) VALUES
('c1000000-0000-0000-0000-000000000001',
 'Dungeon Crawler Roguelike',
 'Un roguelike en pixel art avec génération procédurale de donjons. 4 classes jouables, loot system, permadeath.',
 'https://github.com/dyg-demo/dungeon-crawler',
 'shipped',
 'b1000000-0000-0000-0000-000000000001', 4,
 '2026-02-10', '2026-03-28'),
('c1000000-0000-0000-0000-000000000002',
 'Multiplayer Card Game',
 'Jeu de cartes compétitif en ligne. Matchmaking ELO, deck builder, animations fluides.',
 'https://github.com/dyg-demo/card-arena',
 'building',
 'b1000000-0000-0000-0000-000000000003', 5,
 '2026-04-01', NULL),
('c1000000-0000-0000-0000-000000000003',
 'Narrative Engine',
 'Moteur de dialogues branching avec éditeur visuel. Export JSON, intégration Unity/Godot.',
 'https://github.com/dyg-demo/narrative-engine',
 'review',
 'b1000000-0000-0000-0000-000000000002', 3,
 '2026-03-15', NULL),
('c1000000-0000-0000-0000-000000000004',
 'Game Jam Toolkit',
 'Boîte à outils pour game jams : templates, asset pipeline, CI/CD, deploy one-click.',
 NULL,
 'open',
 'b1000000-0000-0000-0000-000000000004', 5,
 NULL, NULL);

-- Project members
INSERT INTO project_members (project_id, user_id, role) VALUES
-- Dungeon Crawler (shipped)
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'lead'),
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'member'),
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 'member'),
-- Card Game (building)
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 'lead'),
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'member'),
-- Narrative Engine (review)
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'lead'),
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'member'),
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004', 'member'),
-- Game Jam Toolkit (open)
('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'lead');

-- Score snapshot for shipped project
INSERT INTO score_snapshots (user_id, project_id, pillar_scores, archetype_before, archetype_after) VALUES
('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001',
 '{"code":7,"velocity":9,"craft":6,"collaboration":10,"versatility":6,"creativity":5,"autonomy":6}',
 'commando', 'commando'),
('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001',
 '{"code":8,"velocity":7,"craft":6,"collaboration":7,"versatility":10,"creativity":9,"autonomy":6}',
 'explorer', 'explorer'),
('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001',
 '{"code":9,"velocity":4,"craft":10,"collaboration":5,"versatility":4,"creativity":8,"autonomy":6}',
 'artisan', 'artisan');
