import { ARCHETYPES, PILLARS } from '../constants/archetypes.js';

const DUAL_THRESHOLD = 14; // Both dominant pillars must be 7+ (7+7=14)

function determineArchetype(scores) {
  const ranked = [];

  for (const [key, archetype] of Object.entries(ARCHETYPES)) {
    const dominantSum = archetype.dominants.reduce((sum, pillar) => {
      const s = scores.find(sc => sc.pillar === pillar);
      return sum + (s ? s.score : 0);
    }, 0);
    ranked.push({ key, dominantSum });
  }

  // Sort by dominant sum descending
  ranked.sort((a, b) => b.dominantSum - a.dominantSum);

  const primary = ranked[0]?.key || 'architect';

  // Secondary: must be a DIFFERENT archetype with both dominants at 7+ (sum >= 14)
  let secondary = null;
  for (const entry of ranked) {
    if (entry.key === primary) continue;
    if (entry.dominantSum >= DUAL_THRESHOLD) {
      secondary = entry.key;
      break;
    }
  }

  return { primary, secondary };
}

export { determineArchetype };
