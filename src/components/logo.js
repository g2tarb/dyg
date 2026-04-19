/**
 * DYG Animated Logo — White text with orbiting archetype-colored orbs
 */

const ORBS = [
  { color: '#3B82F6', delay: 0 },      // Architect
  { color: '#22C55E', delay: 0.9 },     // Shipper
  { color: '#F5C542', delay: 1.8 },     // Artisan
  { color: '#A855F7', delay: 2.7 },     // Creative
  { color: '#06B6D4', delay: 3.6 },     // Explorer
  { color: '#EF4444', delay: 4.5 },     // Commando
  { color: '#F97316', delay: 5.4 }      // Mentor
];

function createLogoSVG(size = 'md') {
  const sizes = {
    sm: { w: 60, h: 28, font: 16, orbR: 2.5, orbitRx: 28, orbitRy: 12 },
    md: { w: 90, h: 40, font: 24, orbR: 3, orbitRx: 42, orbitRy: 16 },
    lg: { w: 160, h: 70, font: 42, orbR: 4.5, orbitRx: 74, orbitRy: 28 }
  };

  const s = sizes[size] || sizes.md;
  const cx = s.w / 2;
  const cy = s.h / 2;
  const dur = 6.3; // full orbit duration in seconds

  const orbsSVG = ORBS.map((orb, i) => `
    <circle r="${s.orbR}" fill="${orb.color}" opacity="0.9">
      <animateMotion
        dur="${dur}s"
        repeatCount="indefinite"
        begin="${orb.delay}s"
        path="M ${s.orbitRx},0 A ${s.orbitRx},${s.orbitRy} 0 1,1 -${s.orbitRx},0 A ${s.orbitRx},${s.orbitRy} 0 1,1 ${s.orbitRx},0"
      />
    </circle>
    <circle r="${s.orbR * 2.5}" fill="${orb.color}" opacity="0.08" filter="url(#orb-blur)">
      <animateMotion
        dur="${dur}s"
        repeatCount="indefinite"
        begin="${orb.delay}s"
        path="M ${s.orbitRx},0 A ${s.orbitRx},${s.orbitRy} 0 1,1 -${s.orbitRx},0 A ${s.orbitRx},${s.orbitRy} 0 1,1 ${s.orbitRx},0"
      />
    </circle>
  `).join('');

  return `<svg class="dyg-logo-svg" viewBox="0 0 ${s.w} ${s.h}" width="${s.w}" height="${s.h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="orb-blur"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>
    <g transform="translate(${cx}, ${cy})">
      ${orbsSVG}
    </g>
    <text
      x="${cx}" y="${cy}"
      text-anchor="middle"
      dominant-baseline="central"
      font-family="'Bebas Neue', sans-serif"
      font-size="${s.font}"
      fill="#FAFAFA"
      letter-spacing="0.12em"
    >DYG</text>
  </svg>`;
}

/**
 * Replace SVG animateMotion with JS-driven animation.
 * Orbs speed up on scroll and turn white. Listens for dyg:archetype-hover to sync color.
 */
const ORB_COLORS_RGB = [
  [59, 130, 246], [34, 197, 94], [245, 197, 66],
  [168, 85, 247], [6, 182, 212], [239, 68, 68], [249, 115, 22]
];

function setupLogoAnimation(svgElement) {
  if (!svgElement) return null;

  const vb = svgElement.getAttribute('viewBox').split(' ').map(Number);
  const orbitRx = vb[2] * 0.47;
  const orbitRy = vb[3] * 0.43;

  const circles = Array.from(svgElement.querySelectorAll('circle'));
  svgElement.querySelectorAll('animateMotion').forEach(a => a.remove());

  const orbPairs = [];
  for (let i = 0; i < circles.length; i += 2) {
    if (i + 1 >= circles.length) break;
    orbPairs.push({
      solid: circles[i],
      glow: circles[i + 1],
      baseColor: ORB_COLORS_RGB[Math.floor(i / 2) % 7],
      angle: (Math.PI * 2 / 7) * Math.floor(i / 2)
    });
  }

  let overrideColor = null;
  let animFrame = null;

  function onHover(e) { overrideColor = e.detail?.color || null; }
  window.addEventListener('dyg:archetype-hover', onHover);

  function lerp(a, b, t) { return a + (b - a) * t; }
  function hexToRgb(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  }

  function animate() {
    const spd = window.__dygScrollSpeed || 0;
    const speedMul = 1 + spd * 3;
    const white = Math.min(spd / 3, 1);

    for (const orb of orbPairs) {
      orb.angle += 0.015 * speedMul;
      const x = Math.cos(orb.angle) * orbitRx;
      const y = Math.sin(orb.angle) * orbitRy;

      const base = overrideColor ? hexToRgb(overrideColor) : orb.baseColor;
      const r = Math.round(lerp(base[0], 255, white));
      const g = Math.round(lerp(base[1], 255, white));
      const b = Math.round(lerp(base[2], 255, white));
      const hex = `#${[r,g,b].map(v => v.toString(16).padStart(2,'0')).join('')}`;

      orb.solid.setAttribute('cx', x);
      orb.solid.setAttribute('cy', y);
      orb.solid.setAttribute('fill', hex);
      orb.glow.setAttribute('cx', x);
      orb.glow.setAttribute('cy', y);
      orb.glow.setAttribute('fill', hex);
    }
    animFrame = requestAnimationFrame(animate);
  }

  animate();

  return function cleanup() {
    cancelAnimationFrame(animFrame);
    window.removeEventListener('dyg:archetype-hover', onHover);
  };
}

export { createLogoSVG, setupLogoAnimation };
