import { escapeHTML } from '../utils/sanitize.js';

const ARCHETYPE_DATA = {
  architect: {
    name: 'Architect',
    description: 'Thinks in systems. Their code stands strong 5 years later.',
    color: '#3B82F6',
    image: '/assets/archetypes/architect.png'
  },
  shipper: {
    name: 'Shipper',
    description: 'Ships. No meetings, no excuses. The project moves forward.',
    color: '#22C55E',
    image: '/assets/archetypes/shipper.png'
  },
  artisan: {
    name: 'Artisan',
    description: 'Every pixel, every function is polished. Delivers clean work.',
    color: '#F5C542',
    image: '/assets/archetypes/artisan.png'
  },
  creative: {
    name: 'Creative',
    description: 'Their projects exist nowhere else. Invents before building.',
    color: '#A855F7',
    image: '/assets/archetypes/creative.png'
  },
  explorer: {
    name: 'Explorer',
    description: 'Touches everything, learns fast. Where others specialize, they connect.',
    color: '#06B6D4',
    image: '/assets/archetypes/explorer.png'
  },
  commando: {
    name: 'Commando',
    description: 'Fast AND collaborative. The ideal teammate in a game jam.',
    color: '#EF4444',
    image: '/assets/archetypes/commando.png'
  },
  mentor: {
    name: 'Mentor',
    description: 'Raises the team\'s level. Their code reviews are worth gold.',
    color: '#F97316',
    image: '/assets/archetypes/mentor.png'
  }
};

function createArchetypeCard(archetypeKey, avatarUrl, devName) {
  const data = ARCHETYPE_DATA[archetypeKey];
  if (!data) return null;

  const card = document.createElement('div');
  card.className = 'archetype-card';
  card.style.setProperty('--archetype-color', data.color);

  const safeName = escapeHTML(devName || '');

  card.innerHTML = `
    <div class="archetype-card__portrait">
      <img
        src="${escapeHTML(data.image)}"
        alt="${escapeHTML(data.name)}"
        onerror="this.style.display='none'"
      >
      <div class="archetype-card__portrait-fallback">${safeName ? safeName.charAt(0) : '?'}</div>
    </div>
    <div class="archetype-card__info">
      <span class="archetype-card__name">${escapeHTML(data.name)}</span>
      <span class="archetype-card__desc">${escapeHTML(data.description)}</span>
    </div>
  `;

  return card;
}

export { createArchetypeCard, ARCHETYPE_DATA };
