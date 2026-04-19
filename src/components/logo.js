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

export { createLogoSVG };
