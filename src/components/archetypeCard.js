import { escapeHTML } from '../utils/sanitize.js';

const ARCHETYPE_DATA = {
  architect: {
    name: 'Architecte',
    description: 'Il pense en systèmes. Son code tient debout dans 5 ans.',
    color: '#3B82F6',
    image: '/assets/archetypes/architect.png'
  },
  shipper: {
    name: 'Shipper',
    description: 'Il livre. Pas de réunion, pas d\'excuses. Le projet avance.',
    color: '#22C55E',
    image: '/assets/archetypes/shipper.png'
  },
  artisan: {
    name: 'Artisan',
    description: 'Chaque pixel, chaque fonction est poncée. Il livre du propre.',
    color: '#F5C542',
    image: '/assets/archetypes/artisan.png'
  },
  creative: {
    name: 'Créatif',
    description: 'Ses projets n\'existent nulle part ailleurs. Il invente avant de construire.',
    color: '#A855F7',
    image: '/assets/archetypes/creative.png'
  },
  explorer: {
    name: 'Explorateur',
    description: 'Il touche à tout, il apprend vite. Là où les autres spécialisent, lui connecte.',
    color: '#06B6D4',
    image: '/assets/archetypes/explorer.png'
  },
  commando: {
    name: 'Commando',
    description: 'Rapide ET collectif. Le coéquipier idéal en game jam.',
    color: '#EF4444',
    image: '/assets/archetypes/commando.png'
  },
  mentor: {
    name: 'Mentor',
    description: 'Il élève le niveau de l\'équipe. Ses code reviews valent de l\'or.',
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
