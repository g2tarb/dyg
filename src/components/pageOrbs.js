/**
 * Page orbs — global fixed canvas with per-page movement patterns.
 * Common: 7 archetype colors, scroll → faster + white, glow, depth.
 * Each page gets its own movement formula.
 */

const ORB_COLORS = [
  [59, 130, 246], [34, 197, 94], [245, 197, 66],
  [168, 85, 247], [6, 182, 212], [239, 68, 68], [249, 115, 22]
];

// Movement patterns — each returns {x, y} from orb state + canvas size
const PATTERNS = {
  // Landing: classic elliptical orbits
  orbit(orb, cx, cy) {
    return {
      x: cx + Math.cos(orb.angle) * orb.rx,
      y: cy + Math.sin(orb.angle) * orb.ry
    };
  },

  // Search/About: lissajous-like floating drift
  drift(orb, cx, cy) {
    return {
      x: cx + Math.sin(orb.angle * 0.7 + orb.phase) * orb.rx,
      y: cy + Math.cos(orb.angle * 0.5 + orb.phase * 1.3) * orb.ry
    };
  },

  // Training: sine wave flowing across screen
  wave(orb, cx, cy, w, h) {
    const progress = ((orb.angle * orb.rx * 0.04) % w + w) % w;
    return {
      x: progress,
      y: cy + Math.sin(orb.angle * 2 + orb.phase) * orb.ry * 0.8
    };
  },

  // Profile/Portfolio: spiral that breathes in and out
  spiral(orb, cx, cy) {
    const breath = 0.3 + Math.sin(orb.angle * 0.12) * 0.7;
    const r = orb.rx * breath;
    return {
      x: cx + Math.cos(orb.angle) * r,
      y: cy + Math.sin(orb.angle) * r * (orb.ry / Math.max(1, orb.rx))
    };
  },

  // Team: pulsing expand/contract from center
  pulse(orb, cx, cy) {
    const p = 0.4 + Math.sin(orb.angle * 0.25 + orb.phase) * 0.6;
    return {
      x: cx + Math.cos(orb.angle + orb.phase) * orb.rx * p,
      y: cy + Math.sin(orb.angle + orb.phase) * orb.ry * p
    };
  },

  // Projects: slow structured grid-like motion
  grid(orb, cx, cy) {
    return {
      x: cx + Math.sin(orb.angle * 0.3 + orb.phase) * orb.rx,
      y: cy + Math.cos(orb.angle * 0.2 + orb.phase * 0.7) * orb.ry
    };
  },

  // Messages: gentle rain falling down
  rain(orb, cx, cy, w, h) {
    const x = cx + Math.sin(orb.phase * 6.28) * orb.rx * 0.8;
    const y = ((orb.angle * orb.ry * 0.25 + orb.phase * h) % h + h) % h;
    return { x, y };
  },

  // Onboarding: vortex/funnel pulling inward
  vortex(orb, cx, cy) {
    const cycle = (orb.angle * 0.5) % (Math.PI * 2);
    const r = orb.rx * (cycle / (Math.PI * 2));
    return {
      x: cx + Math.cos(orb.angle * 1.5) * r,
      y: cy + Math.sin(orb.angle * 1.5) * r * (orb.ry / Math.max(1, orb.rx))
    };
  },

  // Settings/misc: slow rising bubbles
  rise(orb, cx, cy, w, h) {
    const x = cx + Math.sin(orb.phase * 6.28 + orb.angle * 0.15) * orb.rx * 0.7;
    const y = h - ((orb.angle * orb.ry * 0.2 + orb.phase * h) % h);
    return { x, y };
  }
};

// Route → pattern mapping
function patternForRoute(path) {
  if (path === '/') return 'orbit';
  if (path === '/search') return 'drift';
  if (path === '/onboarding') return 'vortex';
  if (path === '/team') return 'pulse';
  if (path === '/projects') return 'grid';
  if (path === '/training') return 'wave';
  if (path === '/messages') return 'rain';
  if (path === '/about') return 'rise';
  if (path === '/settings') return 'drift';
  if (path.startsWith('/profile/')) return 'spiral';
  if (path.startsWith('/u/')) return 'spiral';
  if (path.startsWith('/projects/')) return 'grid';
  if (path.startsWith('/archetype/')) return 'orbit';
  if (path.startsWith('/training/')) return 'wave';
  if (path.startsWith('/messages/')) return 'rain';
  return 'drift';
}

let currentPattern = 'orbit';

export function setOrbPattern(patternName) {
  if (PATTERNS[patternName]) currentPattern = patternName;
}

export function syncPatternToRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const path = hash.split('?')[0];
  setOrbPattern(patternForRoute(path));
}

export function initPageOrbs(canvas) {
  const ctx = canvas.getContext('2d');
  let animFrame = null;
  let scrollSpeed = 0;
  let lastScrollY = window.scrollY;

  const orbs = [];
  for (let i = 0; i < 21; i++) {
    const phase = (Math.PI * 2 / 21) * i;
    orbs.push({
      color: ORB_COLORS[i % 7],
      angle: phase + Math.random() * 0.5,
      rx: 90 + Math.random() * 320,
      ry: 30 + Math.random() * 120,
      speed: 0.1 + Math.random() * 0.2,
      size: 1.5 + Math.random() * 3.5,
      phase: Math.random()
    });
  }

  function onScroll() {
    const delta = Math.abs(window.scrollY - lastScrollY);
    scrollSpeed = Math.min(delta * 0.12, 6);
    lastScrollY = window.scrollY;
    window.__dygScrollSpeed = scrollSpeed;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animate() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const cx = w / 2;
    const cy = h / 2;
    const patternFn = PATTERNS[currentPattern] || PATTERNS.orbit;

    ctx.clearRect(0, 0, w, h);

    scrollSpeed *= 0.92;
    window.__dygScrollSpeed = scrollSpeed;

    const speedMul = 1 + scrollSpeed * 3;
    const white = Math.min(scrollSpeed / 3, 1);

    for (const orb of orbs) {
      orb.angle += orb.speed * speedMul * 0.01;

      const { x, y } = patternFn(orb, cx, cy, w, h);

      const depth = (Math.sin(orb.angle) + 1) / 2;
      const scale = 0.35 + depth * 0.65;
      const alpha = 0.2 + depth * 0.65;

      const r = Math.round(lerp(orb.color[0], 255, white));
      const g = Math.round(lerp(orb.color[1], 255, white));
      const b = Math.round(lerp(orb.color[2], 255, white));

      const sz = orb.size * scale;
      const gr = sz * 6;

      const glow = ctx.createRadialGradient(x, y, 0, x, y, gr);
      glow.addColorStop(0, `rgba(${r},${g},${b},${(alpha * 0.18).toFixed(3)})`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, gr, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.8, sz), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
      ctx.fill();
    }

    animFrame = requestAnimationFrame(animate);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resize);
  resize();
  syncPatternToRoute();
  animFrame = requestAnimationFrame(animate);

  return function cleanup() {
    cancelAnimationFrame(animFrame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', resize);
    window.__dygScrollSpeed = 0;
  };
}
