import { PILLARS } from '../constants/archetypes.js';

function calculateSynergy(members) {
  if (members.length === 0) return { synergy: 0, diversityBonus: 0, total: 0 };

  // Coverage: for each pillar, take the max score across all team members
  const pillarMaxes = PILLARS.map(pillar => {
    const scores = members.map(m => {
      const s = m.scores.find(sc => sc.pillar === pillar);
      return s ? s.score : 0;
    });
    return Math.max(...scores);
  });

  const coverage = pillarMaxes.reduce((sum, v) => sum + v, 0) / (PILLARS.length * 10) * 100;

  // Diversity bonus: +5% per unique archetype
  const uniqueArchetypes = new Set(members.map(m => m.archetype));
  const diversityBonus = (uniqueArchetypes.size - 1) * 5;

  const total = Math.min(100, Math.round(coverage + diversityBonus));

  return {
    synergy: Math.min(100, Math.round(coverage)),
    diversityBonus,
    total
  };
}

export { calculateSynergy };
