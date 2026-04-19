/**
 * Full-page orbiting particles — fixed canvas covering the viewport.
 * Scroll-responsive: faster on scroll, turn white on fast scroll.
 * Exposes scroll speed globally via window.__dygScrollSpeed.
 */

const ORB_COLORS = [
  [59, 130, 246],   // architect
  [34, 197, 94],    // shipper
  [245, 197, 66],   // artisan
  [168, 85, 247],   // creative
  [6, 182, 212],    // explorer
  [239, 68, 68],    // commando
  [249, 115, 22]    // mentor
];

export function initHeroOrbs(canvas) {
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
      size: 1.5 + Math.random() * 3.5
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

    ctx.clearRect(0, 0, w, h);

    scrollSpeed *= 0.92;
    window.__dygScrollSpeed = scrollSpeed;

    const speedMul = 1 + scrollSpeed * 3;
    const white = Math.min(scrollSpeed / 3, 1);

    for (const orb of orbs) {
      orb.angle += orb.speed * speedMul * 0.01;

      const x = cx + Math.cos(orb.angle) * orb.rx;
      const y = cy + Math.sin(orb.angle) * orb.ry;

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
  animFrame = requestAnimationFrame(animate);

  return function cleanup() {
    cancelAnimationFrame(animFrame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', resize);
    window.__dygScrollSpeed = 0;
  };
}
