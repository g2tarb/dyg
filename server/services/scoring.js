import { ARCHETYPES, PILLARS } from '../constants/archetypes.js';

// Dual: both dominant pillars must be 8+ (sum >= 16) — should be ~10-15% of devs
const DUAL_THRESHOLD = 16;
const DUAL_MIN_PILLAR = 8;

// Triple: on top of dual, a third archetype with both dominants 9+ (sum >= 18) — should be ~1-2%
const TRIPLE_THRESHOLD = 18;
const TRIPLE_MIN_PILLAR = 9;

function determineArchetype(scores) {
  const ranked = [];

  for (const [key, archetype] of Object.entries(ARCHETYPES)) {
    const dominantScores = archetype.dominants.map(pillar => {
      const s = scores.find(sc => sc.pillar === pillar);
      return s ? s.score : 0;
    });
    const dominantSum = dominantScores.reduce((a, b) => a + b, 0);
    const maxDominant = Math.max(...dominantScores);
    const minDominant = Math.min(...dominantScores);

    ranked.push({ key, dominantSum, maxDominant, minDominant });
  }

  ranked.sort((a, b) => b.dominantSum - a.dominantSum);

  const primary = ranked[0]?.key || 'architect';

  let secondary = null;
  let tertiary = null;

  const extras = ranked.filter(e => e.key !== primary);

  // Secondary: BOTH dominants must be 8+ (not just the sum)
  for (const entry of extras) {
    if (entry.minDominant >= DUAL_MIN_PILLAR && entry.dominantSum >= DUAL_THRESHOLD) {
      secondary = entry.key;
      break;
    }
  }

  // Tertiary: a THIRD archetype with BOTH dominants 9+ — legendary
  if (secondary) {
    for (const entry of extras) {
      if (entry.key === secondary) continue;
      if (entry.minDominant >= TRIPLE_MIN_PILLAR && entry.dominantSum >= TRIPLE_THRESHOLD) {
        tertiary = entry.key;
        break;
      }
    }
  }

  return { primary, secondary, tertiary };
}

export { determineArchetype };
