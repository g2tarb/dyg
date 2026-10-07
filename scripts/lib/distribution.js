/**
 * Calcul et rendu de la distribution des scores sur un échantillon de profils.
 *
 * Sert de garde-fou au scoring : la cible documentée est une moyenne autour de 5,
 * 8+ dans le top 15 % et 9+ dans le top 5 %. Toute modification des formules doit
 * être comparée avant / après sur le même échantillon.
 */

import { PILLARS } from '../../server/constants/archetypes.js';

const TARGET = { mean: 5, pct8: 15, pct9: 5 };

function quantile(sorted, q) {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

/** Statistiques d'une série de scores 1..10. */
export function statsFor(values) {
  const n = values.length;
  if (n === 0) {
    return { n: 0, mean: 0, median: 0, min: 0, max: 0, pct8: 0, pct9: 0, histogram: {} };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);

  const histogram = {};
  for (let s = 1; s <= 10; s++) histogram[s] = 0;
  for (const v of values) {
    const bucket = Math.min(10, Math.max(1, Math.round(v)));
    histogram[bucket]++;
  }

  return {
    n,
    mean: sum / n,
    median: quantile(sorted, 0.5),
    min: sorted[0],
    max: sorted[n - 1],
    pct8: (values.filter(v => v >= 8).length / n) * 100,
    pct9: (values.filter(v => v >= 9).length / n) * 100,
    histogram
  };
}

/**
 * Agrège une liste de résultats de scan.
 * Chaque entrée attendue : { username, scores: [{pillar, score}], ... }
 */
export function buildDistribution(results) {
  const byPillar = {};
  for (const pillar of PILLARS) byPillar[pillar] = [];

  const allScores = [];
  const archetypes = {};
  const devStyles = {};
  let dual = 0;
  let triple = 0;

  for (const r of results) {
    for (const { pillar, score } of r.scores ?? []) {
      if (byPillar[pillar]) byPillar[pillar].push(score);
      allScores.push(score);
    }
    if (r.archetype) archetypes[r.archetype] = (archetypes[r.archetype] ?? 0) + 1;
    if (r.dev_style) devStyles[r.dev_style] = (devStyles[r.dev_style] ?? 0) + 1;
    if (r.secondary_archetype) dual++;
    if (r.tertiary_archetype) triple++;
  }

  const pillars = {};
  for (const pillar of PILLARS) pillars[pillar] = statsFor(byPillar[pillar]);

  return {
    profiles: results.length,
    overall: statsFor(allScores),
    pillars,
    archetypes,
    devStyles,
    dualRate: results.length ? (dual / results.length) * 100 : 0,
    tripleRate: results.length ? (triple / results.length) * 100 : 0
  };
}

function pad(s, w) { return String(s).padEnd(w); }
function num(v, d = 2) { return v.toFixed(d).padStart(6); }

function verdict(stats) {
  const flags = [];
  if (stats.mean > TARGET.mean + 1) flags.push('moyenne haute');
  if (stats.mean < TARGET.mean - 1) flags.push('moyenne basse');
  if (stats.pct8 > TARGET.pct8 + 10) flags.push('8+ trop fréquent');
  if (stats.pct9 > TARGET.pct9 + 8) flags.push('9+ trop fréquent');
  return flags.length ? flags.join(', ') : 'dans la cible';
}

function sparkline(histogram) {
  const blocks = ' ▁▂▃▄▅▆▇█';
  const values = Object.values(histogram);
  const max = Math.max(...values, 1);
  return values.map(v => blocks[Math.round((v / max) * 8)]).join('');
}

export function renderDistribution(dist, { title = 'Distribution' } = {}) {
  const lines = [];
  lines.push('');
  lines.push(`=== ${title} — ${dist.profiles} profils, ${dist.overall.n} scores ===`);
  lines.push('');
  lines.push(`Cible : moyenne ~${TARGET.mean}, 8+ = top ${TARGET.pct8} %, 9+ = top ${TARGET.pct9} %`);
  lines.push('');
  lines.push(`${pad('pilier', 14)}${pad('moy', 7)}${pad('méd', 7)}${pad('min', 5)}${pad('max', 5)}${pad('≥8 %', 8)}${pad('≥9 %', 8)}${pad('1..10', 12)}verdict`);
  lines.push('-'.repeat(100));

  for (const [pillar, s] of Object.entries(dist.pillars)) {
    lines.push(
      pad(pillar, 14) +
      num(s.mean) + ' ' +
      num(s.median) + ' ' +
      pad(s.min, 5) +
      pad(s.max, 5) +
      num(s.pct8, 1) + '  ' +
      num(s.pct9, 1) + '  ' +
      pad(sparkline(s.histogram), 12) +
      verdict(s)
    );
  }

  lines.push('-'.repeat(100));
  const o = dist.overall;
  lines.push(
    pad('GLOBAL', 14) + num(o.mean) + ' ' + num(o.median) + ' ' +
    pad(o.min, 5) + pad(o.max, 5) + num(o.pct8, 1) + '  ' + num(o.pct9, 1) +
    '  ' + pad(sparkline(o.histogram), 12) + verdict(o)
  );

  lines.push('');
  lines.push(`Archétypes multiples : dual ${dist.dualRate.toFixed(1)} % (cible 10-15 %), triple ${dist.tripleRate.toFixed(1)} % (cible 1-2 %)`);
  lines.push('');
  lines.push('Archétypes primaires : ' + (Object.entries(dist.archetypes).map(([k, v]) => `${k}=${v}`).join('  ') || '—'));
  lines.push('Styles de dev        : ' + (Object.entries(dist.devStyles).map(([k, v]) => `${k}=${v}`).join('  ') || '—'));
  lines.push('');

  return lines.join('\n');
}

/** Comparaison avant / après sur le même échantillon. */
export function renderComparison(before, after) {
  const lines = [];
  lines.push('');
  lines.push(`=== Comparaison — ${before.profiles} profils ===`);
  lines.push('');
  lines.push(`${pad('pilier', 14)}${pad('moy avant', 11)}${pad('moy après', 11)}${pad('delta', 9)}${pad('≥8 avant', 10)}${pad('≥8 après', 10)}delta`);
  lines.push('-'.repeat(80));

  for (const pillar of Object.keys(after.pillars)) {
    const b = before.pillars[pillar];
    const a = after.pillars[pillar];
    if (!b) continue;
    const dMean = a.mean - b.mean;
    const d8 = a.pct8 - b.pct8;
    const sign = (v) => (v > 0 ? '+' : '');
    lines.push(
      pad(pillar, 14) +
      num(b.mean) + '     ' +
      num(a.mean) + '   ' +
      pad(sign(dMean) + dMean.toFixed(2), 9) +
      num(b.pct8, 1) + '    ' +
      num(a.pct8, 1) + '   ' +
      sign(d8) + d8.toFixed(1)
    );
  }

  lines.push('-'.repeat(80));
  const dOverall = after.overall.mean - before.overall.mean;
  const d8Overall = after.overall.pct8 - before.overall.pct8;
  lines.push(
    pad('GLOBAL', 14) + num(before.overall.mean) + '     ' + num(after.overall.mean) +
    '   ' + pad((dOverall > 0 ? '+' : '') + dOverall.toFixed(2), 9) +
    num(before.overall.pct8, 1) + '    ' + num(after.overall.pct8, 1) +
    '   ' + (d8Overall > 0 ? '+' : '') + d8Overall.toFixed(1)
  );
  lines.push('');
  lines.push(`Dual  : ${before.dualRate.toFixed(1)} % → ${after.dualRate.toFixed(1)} %`);
  lines.push(`Triple: ${before.tripleRate.toFixed(1)} % → ${after.tripleRate.toFixed(1)} %`);
  lines.push('');

  return lines.join('\n');
}
