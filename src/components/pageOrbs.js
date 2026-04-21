/**
 * Page orbs — global fixed canvas with per-page movement patterns.
 * Common: 7 archetype colors, scroll → faster + white, glow, depth.
 * Each page gets its own movement formula.
 */

const ORB_COLORS = [
  [59, 130, 246], [34, 197, 94], [245, 197, 66],
  [168, 85, 247], [6, 182, 212], [239, 68, 68], [249, 115, 22],
  [236, 72, 153]
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

  const CAPTURE_COUNT = 8;
  const orbs = [];
  for (let i = 0; i < 21; i++) {
    const phase = (Math.PI * 2 / 21) * i;
    const captured = i < CAPTURE_COUNT;
    orbs.push({
      color: ORB_COLORS[i % ORB_COLORS.length],
      angle: phase + Math.random() * 0.5,
      rx: 90 + Math.random() * 320,
      ry: 30 + Math.random() * 120,
      speed: 0.1 + Math.random() * 0.2,
      size: 1.5 + Math.random() * 3.5,
      phase: Math.random(),
      captureSlot: captured ? (Math.PI * 2 / CAPTURE_COUNT) * i : 0,
      capturable: captured
    });
  }

  // --- Button magnetism: 8 orbs get pulled into orbit around hovered .btn-primary ---
  let activeBtn = null;
  let captureTarget = null;
  let lastCaptureTarget = null; // kept during fade-out so orbs lerp back smoothly
  let captureStrength = 0;
  const hasHover = window.matchMedia('(hover: hover)').matches;

  function refreshTarget() {
    if (activeBtn && document.body.contains(activeBtn)) {
      const rect = activeBtn.getBoundingClientRect();
      const pad = 22;
      captureTarget = {
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
        rx: rect.width / 2 + pad + 10,
        ry: rect.height / 2 + pad
      };
      lastCaptureTarget = captureTarget;
    } else {
      captureTarget = null;
    }
  }

  function onBtnOver(e) {
    const btn = e.target.closest('.btn-primary');
    if (btn && btn !== activeBtn) {
      activeBtn = btn;
      refreshTarget();
    }
  }

  function onBtnOut(e) {
    if (!activeBtn) return;
    const next = e.relatedTarget;
    if (next && activeBtn.contains(next)) return;
    activeBtn = null;
  }

  if (hasHover) {
    document.addEventListener('mouseover', onBtnOver, true);
    document.addEventListener('mouseout', onBtnOut, true);
  }

  // --- Archetype hover: tint all background orbs + pulse ---
  let archetypeOverride = null; // [r, g, b] or null
  let lastArchetypeOverride = null; // kept during fade-out so color lerps back
  let overrideStrength = 0;

  function hexToRgb(hex) {
    if (!hex || hex[0] !== '#') return null;
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
  }

  function onArchetypeHover(e) {
    const color = e.detail?.color;
    const rgb = color ? hexToRgb(color) : null;
    archetypeOverride = rgb;
    if (rgb) lastArchetypeOverride = rgb;
  }
  window.addEventListener('dyg:archetype-hover', onArchetypeHover);

  function onScroll() {
    const delta = window.scrollY - lastScrollY;
    scrollSpeed = Math.min(Math.abs(delta) * 0.12, 6);
    window.__dygScrollDir = delta >= 0 ? 1 : -1;
    window.__dygScrollSpeed = scrollSpeed;
    lastScrollY = window.scrollY;
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
    const dir = window.__dygScrollDir || 1;

    // Capture target tracks the hovered button every frame (handles scroll).
    refreshTarget();
    captureStrength = lerp(captureStrength, captureTarget ? 1 : 0, 0.08);
    overrideStrength = lerp(overrideStrength, archetypeOverride ? 1 : 0, 0.09);

    // Active targets survive a pending fade-out so orbs glide back instead of popping.
    const activeTarget = captureTarget || lastCaptureTarget;
    const activeOverride = archetypeOverride || lastArchetypeOverride;

    const now = performance.now();

    for (const orb of orbs) {
      orb.angle += orb.speed * speedMul * 0.01 * dir;

      const natural = patternFn(orb, cx, cy, w, h);
      let x = natural.x;
      let y = natural.y;

      let captureT = 0;
      if (orb.capturable && activeTarget && captureStrength > 0.005) {
        captureT = captureStrength;
        const capAngle = orb.captureSlot + orb.angle * 2;
        const capX = activeTarget.cx + Math.cos(capAngle) * activeTarget.rx;
        const capY = activeTarget.cy + Math.sin(capAngle) * activeTarget.ry;
        x = lerp(natural.x, capX, captureT);
        y = lerp(natural.y, capY, captureT);
      }

      const depth = (Math.sin(orb.angle) + 1) / 2;
      const baseScale = 0.35 + depth * 0.65;
      const baseAlpha = 0.2 + depth * 0.65;

      // Pulse (only active when archetype override is engaged)
      const pulseBeat = (Math.sin(now * 0.004 + orb.phase * 6.28) + 1) / 2; // 0..1
      const pulseBoost = overrideStrength * pulseBeat;
      const scale = lerp(baseScale, 1, captureT) * (1 + pulseBoost * 0.7);
      const alpha = Math.min(1, lerp(baseAlpha, 0.95, captureT) * (1 + pulseBoost * 0.5));

      // Color: native → override (archetype tint) → white (scroll)
      let baseR = orb.color[0], baseG = orb.color[1], baseB = orb.color[2];
      if (activeOverride && overrideStrength > 0.005) {
        baseR = lerp(orb.color[0], activeOverride[0], overrideStrength);
        baseG = lerp(orb.color[1], activeOverride[1], overrideStrength);
        baseB = lerp(orb.color[2], activeOverride[2], overrideStrength);
      }

      const r = Math.round(lerp(baseR, 255, white));
      const g = Math.round(lerp(baseG, 255, white));
      const b = Math.round(lerp(baseB, 255, white));

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

    // Release cached targets once fade-out is fully complete (avoids retaining stale rects).
    if (!captureTarget && captureStrength < 0.005) lastCaptureTarget = null;
    if (!archetypeOverride && overrideStrength < 0.005) lastArchetypeOverride = null;

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
    if (hasHover) {
      document.removeEventListener('mouseover', onBtnOver, true);
      document.removeEventListener('mouseout', onBtnOut, true);
    }
    window.removeEventListener('dyg:archetype-hover', onArchetypeHover);
    window.__dygScrollSpeed = 0;
  };
}
