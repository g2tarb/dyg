const ARCHETYPES = {
  architect: {
    name: 'Architecte',
    dominants: ['code', 'autonomy'],
    description: 'Il pense en systèmes. Son code tient debout dans 5 ans.',
    color: '#3B82F6'
  },
  shipper: {
    name: 'Shipper',
    dominants: ['velocity', 'autonomy'],
    description: 'Il livre. Pas de réunion, pas d\'excuses. Le projet avance.',
    color: '#22C55E'
  },
  artisan: {
    name: 'Artisan',
    dominants: ['craft', 'code'],
    description: 'Chaque pixel, chaque fonction est poncée. Il livre du propre.',
    color: '#F5C542'
  },
  creative: {
    name: 'Créatif',
    dominants: ['creativity', 'versatility'],
    description: 'Ses projets n\'existent nulle part ailleurs. Il invente avant de construire.',
    color: '#A855F7'
  },
  explorer: {
    name: 'Explorateur',
    dominants: ['versatility', 'creativity'],
    description: 'Il touche à tout, il apprend vite. Là où les autres spécialisent, lui connecte.',
    color: '#06B6D4'
  },
  commando: {
    name: 'Commando',
    dominants: ['velocity', 'collaboration'],
    description: 'Rapide ET collectif. Le coéquipier idéal en game jam.',
    color: '#EF4444'
  },
  mentor: {
    name: 'Mentor',
    dominants: ['collaboration', 'craft'],
    description: 'Il élève le niveau de l\'équipe. Ses code reviews valent de l\'or.',
    color: '#F97316'
  }
};

const PILLARS = ['code', 'velocity', 'craft', 'collaboration', 'versatility', 'creativity', 'autonomy'];

export { ARCHETYPES, PILLARS };
