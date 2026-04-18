import { ARCHETYPES, PILLARS } from '../constants/archetypes.js';

function determineArchetype(scores) {
  let bestMatch = 'architect';
  let bestScore = -1;

  for (const [key, archetype] of Object.entries(ARCHETYPES)) {
    const dominantSum = archetype.dominants.reduce((sum, pillar) => {
      const s = scores.find(sc => sc.pillar === pillar);
      return sum + (s ? s.score : 0);
    }, 0);

    if (dominantSum > bestScore) {
      bestScore = dominantSum;
      bestMatch = key;
    }
  }

  return bestMatch;
}

export { determineArchetype };
