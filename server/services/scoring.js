import { ARCHETYPES, PILLARS } from '../constants/archetypes.js';

const DUAL_THRESHOLD = 14;   // Both dominant pillars 7+ (7+7=14)
const TRIPLE_THRESHOLD = 16; // At least one 9 and one 7 (9+7=16) — extremely rare

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

  // Secondary: different archetype with both dominants 7+ (sum >= 14)
  let secondary = null;
  // Tertiary: different archetype with at least 2x9 and 1x7+ (sum >= 16, max >= 9, min >= 7)
  let tertiary = null;

  const extras = ranked.filter(e => e.key !== primary);

  for (const entry of extras) {
    if (!secondary && entry.dominantSum >= DUAL_THRESHOLD && entry.minDominant >= 7) {
      secondary = entry.key;
      continue;
    }
    if (secondary && !tertiary && entry.dominantSum >= DUAL_THRESHOLD && entry.minDominant >= 7) {
      // Triple requires: the secondary already qualifies, AND this third one has sum >= 16 with a 9
      if (entry.dominantSum >= TRIPLE_THRESHOLD && entry.maxDominant >= 9) {
        tertiary = entry.key;
      }
    }
  }

  // Also check: can secondary be promoted to triple-level?
  // Triple = primary + 2 other archetypes qualifying
  // We already have secondary. For tertiary, need another archetype at sum >= 16 with a 9
  if (secondary && !tertiary) {
    for (const entry of extras) {
      if (entry.key === secondary) continue;
      if (entry.dominantSum >= TRIPLE_THRESHOLD && entry.maxDominant >= 9 && entry.minDominant >= 7) {
        tertiary = entry.key;
        break;
      }
    }
  }

  return { primary, secondary, tertiary };
}

export { determineArchetype };
