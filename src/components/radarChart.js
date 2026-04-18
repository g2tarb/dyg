const PILLAR_LABELS = {
  code: 'Code',
  velocity: 'Vélocité',
  craft: 'Craft',
  collaboration: 'Collab',
  versatility: 'Polyvalence',
  creativity: 'Créativité',
  autonomy: 'Autonomie'
};

const PILLARS_ORDER = ['code', 'velocity', 'craft', 'collaboration', 'versatility', 'creativity', 'autonomy'];

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 120;
const LEVELS = [0.25, 0.5, 0.75, 1];

function polarToCartesian(angle, radius) {
  // Start from top (-90deg), go clockwise
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad)
  };
}

function getAngle(index, total) {
  return (360 / total) * index;
}

function buildGridPath(level) {
  const total = PILLARS_ORDER.length;
  const points = [];
  for (let i = 0; i < total; i++) {
    const angle = getAngle(i, total);
    const p = polarToCartesian(angle, RADIUS * level);
    points.push(`${p.x},${p.y}`);
  }
  return `M${points.join('L')}Z`;
}

function buildDataPath(scores, scale = 1) {
  const total = PILLARS_ORDER.length;
  const points = [];
  for (let i = 0; i < total; i++) {
    const pillar = PILLARS_ORDER[i];
    const sc = scores.find(s => s.pillar === pillar);
    const value = sc ? sc.score / 10 : 0;
    const angle = getAngle(i, total);
    const p = polarToCartesian(angle, RADIUS * value * scale);
    points.push(`${p.x},${p.y}`);
  }
  return `M${points.join('L')}Z`;
}

/**
 * Create a radar chart SVG element
 * @param {Array} scores - [{pillar, score}]
 * @param {Object} options - { animate: bool, color: string, id: string }
 */
function createRadarChart(scores, options = {}) {
  const {
    animate = true,
    color = '#E8620A',
    accentColor = '#F5C542',
    id = 'radar-' + Math.random().toString(36).slice(2, 8)
  } = options;

  const total = PILLARS_ORDER.length;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute('width', SIZE);
  svg.setAttribute('height', SIZE);
  svg.classList.add('radar-chart');
  svg.id = id;

  // Gradient definition
  svg.innerHTML = `
    <defs>
      <linearGradient id="grad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.2"/>
      </linearGradient>
    </defs>
  `;

  // Grid levels
  LEVELS.forEach(level => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', buildGridPath(level));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(203, 213, 225, 0.08)');
    path.setAttribute('stroke-width', '1');
    svg.appendChild(path);
  });

  // Axis lines
  for (let i = 0; i < total; i++) {
    const angle = getAngle(i, total);
    const p = polarToCartesian(angle, RADIUS);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', CENTER);
    line.setAttribute('y1', CENTER);
    line.setAttribute('x2', p.x);
    line.setAttribute('y2', p.y);
    line.setAttribute('stroke', 'rgba(203, 213, 225, 0.06)');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  }

  // Data shape
  const dataPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const fullPath = buildDataPath(scores);

  if (animate) {
    // Start collapsed at center
    dataPath.setAttribute('d', buildDataPath(scores, 0));
    dataPath.dataset.targetPath = fullPath;
  } else {
    dataPath.setAttribute('d', fullPath);
  }

  dataPath.setAttribute('fill', `url(#grad-${id})`);
  dataPath.setAttribute('stroke', color);
  dataPath.setAttribute('stroke-width', '2');
  dataPath.setAttribute('stroke-linejoin', 'round');
  dataPath.classList.add('radar-chart__shape');
  svg.appendChild(dataPath);

  // Data points
  for (let i = 0; i < total; i++) {
    const pillar = PILLARS_ORDER[i];
    const sc = scores.find(s => s.pillar === pillar);
    const value = sc ? sc.score / 10 : 0;
    const angle = getAngle(i, total);
    const p = polarToCartesian(angle, RADIUS * value);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    if (animate) {
      circle.setAttribute('cx', CENTER);
      circle.setAttribute('cy', CENTER);
      circle.dataset.targetCx = p.x;
      circle.dataset.targetCy = p.y;
    } else {
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
    }
    circle.setAttribute('r', '3');
    circle.setAttribute('fill', color);
    circle.classList.add('radar-chart__point');
    svg.appendChild(circle);
  }

  // Labels
  for (let i = 0; i < total; i++) {
    const pillar = PILLARS_ORDER[i];
    const sc = scores.find(s => s.pillar === pillar);
    const value = sc ? sc.score : 0;
    const angle = getAngle(i, total);
    const p = polarToCartesian(angle, RADIUS + 28);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', p.x);
    text.setAttribute('y', p.y);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', 'rgba(203, 213, 225, 0.5)');
    text.setAttribute('font-family', 'IBM Plex Sans, sans-serif');
    text.setAttribute('font-size', '10');
    text.textContent = `${PILLAR_LABELS[pillar]} ${value}`;
    svg.appendChild(text);
  }

  return svg;
}

/**
 * Animate the radar chart from center to full values
 * Uses requestAnimationFrame for smooth animation without GSAP dependency
 */
function animateRadar(svgElement, duration = 800) {
  const shape = svgElement.querySelector('.radar-chart__shape');
  const points = svgElement.querySelectorAll('.radar-chart__point');
  if (!shape || !shape.dataset.targetPath) return;

  const targetPath = shape.dataset.targetPath;
  const startTime = performance.now();

  // Parse target points for circles
  const targetPositions = Array.from(points).map(p => ({
    cx: parseFloat(p.dataset.targetCx || CENTER),
    cy: parseFloat(p.dataset.targetCy || CENTER)
  }));

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function tick(now) {
    const elapsed = now - startTime;
    const rawProgress = Math.min(elapsed / duration, 1);
    const progress = easeOutCubic(rawProgress);

    // Interpolate shape path
    // We parse both start (center) and end paths and interpolate coordinates
    const startCoords = Array.from({ length: PILLARS_ORDER.length }, () => ({ x: CENTER, y: CENTER }));
    const endMatch = targetPath.match(/[\d.]+,[\d.]+/g);
    if (endMatch) {
      const endCoords = endMatch.map(pair => {
        const [x, y] = pair.split(',').map(Number);
        return { x, y };
      });

      const interpolated = startCoords.map((start, i) => {
        const end = endCoords[i] || start;
        return {
          x: start.x + (end.x - start.x) * progress,
          y: start.y + (end.y - start.y) * progress
        };
      });

      const pathStr = 'M' + interpolated.map(p => `${p.x},${p.y}`).join('L') + 'Z';
      shape.setAttribute('d', pathStr);
    }

    // Interpolate circle positions
    points.forEach((point, i) => {
      const target = targetPositions[i];
      const cx = CENTER + (target.cx - CENTER) * progress;
      const cy = CENTER + (target.cy - CENTER) * progress;
      point.setAttribute('cx', cx);
      point.setAttribute('cy', cy);
    });

    if (rawProgress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

/**
 * Create a team radar (envelope of max values)
 */
function createTeamRadar(members) {
  // Compute max per pillar across all members
  const maxScores = PILLARS_ORDER.map(pillar => {
    const values = members.map(m => {
      const s = m.scores.find(sc => sc.pillar === pillar);
      return s ? s.score : 0;
    });
    return { pillar, score: Math.max(0, ...values) };
  });

  return createRadarChart(maxScores, {
    animate: false,
    color: '#F5C542',
    accentColor: '#E8620A',
    id: 'team-radar'
  });
}

export { createRadarChart, animateRadar, createTeamRadar, PILLARS_ORDER, PILLAR_LABELS };
