/**
 * Dynamic theme — accent color cycles through archetype colors on scroll
 * On archetype/profile pages, locks to that archetype's color instead.
 */

const ARCHETYPE_COLORS = {
  architect: '#3B82F6',
  shipper: '#22C55E',
  artisan: '#F5C542',
  creative: '#A855F7',
  explorer: '#06B6D4',
  commando: '#EF4444',
  mentor: '#F97316'
};

// Scroll palette — cycles through all 7 archetype colors
const SCROLL_PALETTE = [
  [59, 130, 246],   // architect  #3B82F6
  [34, 197, 94],    // shipper    #22C55E
  [245, 197, 66],   // artisan    #F5C542
  [168, 85, 247],   // creative   #A855F7
  [6, 182, 212],    // explorer   #06B6D4
  [239, 68, 68],    // commando   #EF4444
  [249, 115, 22]    // mentor     #F97316
];

let locked = false;       // true when on archetype/profile page
let scrollRAF = null;

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(c1, c2, t) {
  return [
    lerp(c1[0], c2[0], t),
    lerp(c1[1], c2[1], t),
    lerp(c1[2], c2[2], t)
  ];
}

function applyColor(hex) {
  const root = document.documentElement;
  root.style.setProperty('--color-active', hex);
  root.style.setProperty('--color-active-dim', hex + '26');
  root.style.setProperty('--color-active-glow', `0 0 40px ${hex}25`);
}

/**
 * Get interpolated color from scroll position (0 to 1)
 */
function getScrollColor(progress) {
  const total = SCROLL_PALETTE.length;
  const scaled = progress * total;
  const index = Math.floor(scaled) % total;
  const next = (index + 1) % total;
  const t = scaled - Math.floor(scaled);

  const rgb = lerpColor(SCROLL_PALETTE[index], SCROLL_PALETTE[next], t);
  return rgbToHex(rgb[0], rgb[1], rgb[2]);
}

function onScroll() {
  if (locked) return;
  if (scrollRAF) return; // throttle to 1 per frame

  scrollRAF = requestAnimationFrame(() => {
    scrollRAF = null;
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) {
      applyColor(rgbToHex(...SCROLL_PALETTE[0]));
      return;
    }
    const progress = Math.min(1, scrollY / maxScroll);
    applyColor(getScrollColor(progress));
  });
}

function setArchetypeTheme(archetypeKey) {
  const color = ARCHETYPE_COLORS[archetypeKey];
  if (color) {
    locked = true;
    applyColor(color);
  }
}

function resetTheme() {
  locked = false;
  onScroll(); // immediately set color from current scroll pos
}

function setActiveColor(color) {
  locked = true;
  applyColor(color);
}

function detectThemeFromRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);

  // /archetype/:key — lock to archetype color
  if (parts[0] === 'archetype' && parts[1] && ARCHETYPE_COLORS[parts[1]]) {
    setArchetypeTheme(parts[1]);
    return;
  }

  // All other pages — scroll-driven color
  resetTheme();
}

function initTheme() {
  // Set initial color
  applyColor(rgbToHex(...SCROLL_PALETTE[0]));

  // Scroll listener
  window.addEventListener('scroll', onScroll, { passive: true });

  // Route changes
  window.addEventListener('hashchange', detectThemeFromRoute);
  detectThemeFromRoute();
}

export { initTheme, setArchetypeTheme, resetTheme, setActiveColor, ARCHETYPE_COLORS };
