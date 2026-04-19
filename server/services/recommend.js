import pool from '../db/connection.js';

// Cosine similarity between two score vectors
function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  return mag === 0 ? 0 : dot / mag;
}

// Complementarity score: how well another dev fills your gaps
function complementarity(myScores, theirScores) {
  let score = 0;
  for (let i = 0; i < myScores.length; i++) {
    // If I'm weak (< 5) and they're strong (> 7), that's complementary
    if (myScores[i] < 5 && theirScores[i] >= 7) score += 2;
    // If we're both strong in different areas
    if (myScores[i] >= 7 && theirScores[i] < 5) score += 1;
  }
  return score;
}

const PILLAR_ORDER = ['code', 'velocity', 'craft', 'collaboration', 'versatility', 'creativity', 'autonomy'];

async function getRecommendations(userId, limit = 5) {
  // Get user's scores
  const userDev = await pool.query(`
    SELECT d.id, d.archetype, ds.pillar, ds.score
    FROM developers d
    JOIN developer_scores ds ON ds.developer_id = d.id
    WHERE d.user_id = $1
  `, [userId]);

  if (userDev.rows.length === 0) return [];

  const myScores = PILLAR_ORDER.map(p => {
    const s = userDev.rows.find(r => r.pillar === p);
    return s ? s.score : 5;
  });
  const myArchetype = userDev.rows[0].archetype;

  // Get all other devs with scores
  const others = await pool.query(`
    SELECT d.id, d.user_id, d.name, d.avatar_url, d.archetype, d.github_username,
           json_agg(json_build_object('pillar', ds.pillar, 'score', ds.score)) AS scores
    FROM developers d
    JOIN developer_scores ds ON ds.developer_id = d.id
    WHERE d.user_id != $1 AND d.user_id IS NOT NULL
    GROUP BY d.id
  `, [userId]);

  // Score each dev
  const ranked = others.rows.map(dev => {
    const theirScores = PILLAR_ORDER.map(p => {
      const s = dev.scores.find(sc => sc.pillar === p);
      return s ? s.score : 5;
    });

    const similarity = cosineSimilarity(myScores, theirScores);
    const complement = complementarity(myScores, theirScores);
    const diverseArchetype = dev.archetype !== myArchetype ? 2 : 0;

    // Complementarity matters more than similarity for team building
    const totalScore = complement * 3 + diverseArchetype * 2 + (1 - similarity) * 1;

    return {
      id: dev.id,
      user_id: dev.user_id,
      name: dev.name,
      avatar_url: dev.avatar_url,
      archetype: dev.archetype,
      github_username: dev.github_username,
      match_score: Math.round(totalScore * 10) / 10,
      reason: complement > 3 ? 'complements_your_gaps' : diverseArchetype ? 'different_archetype' : 'balanced'
    };
  });

  ranked.sort((a, b) => b.match_score - a.match_score);
  return ranked.slice(0, limit);
}

export { getRecommendations };
