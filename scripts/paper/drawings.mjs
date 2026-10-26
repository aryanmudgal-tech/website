// Pencil and line drawings for the Paste-Up paper, drawn stroke by stroke with perfect-freehand. Seeded.
// Ported from docs/superpowers/mocks/2026-10-26-paste-up/tools/drawings.mjs. Classes became attributes,
// so every file works on its own as a CSS mask.
import { pline, pstroke, scribble, tick, rng, noise1, toD } from './art.mjs';

const P = d => `<path d="${d}"/>`;

/** A firm line: two passes a hair apart, as when a line is gone over. */
function firm(ax, ay, bx, by, seed, o = {}) {
  const r = rng(seed);
  const L = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / L, ny = (bx - ax) / L;
  const off = 0.35 + r() * 0.3;
  return P(pline(ax, ay, bx, by, seed, { size: 1.3, ...o })) +
    P(pline(ax + nx * off, ay + ny * off, bx + nx * off * 0.6, by + ny * off * 0.6, seed + 17, { size: 0.95, overA: r() * 1.2, overB: r() * 2.2, press: [0.35, 0.65], ...o }));
}

function dot(cx, cy, rad, seed) {
  const r = rng(seed), pts = [];
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2, rr = rad * (0.88 + r() * 0.24);
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return `<path d="M${pts.join('L')}Z"/>`;
}

/** Dots, as a floor plan: walls with a door gap, the swing, an interior wall, a table, a dimension line, tactile dots. viewBox 0 0 180 140. */
export function floorPlan() {
  let s = 1000;
  const g = [];
  // light construction lines first, as a draughtsman lays them in
  const faint = [];
  faint.push(P(pline(4, 20, 177, 20.4, s++, { size: 0.55, press: [0.3, 0.5], bow: 0.2, overA: 0, overB: 0 })));
  faint.push(P(pline(14.3, 132, 13.8, 6, s++, { size: 0.55, press: [0.3, 0.5], bow: 0.2, overA: 0, overB: 0 })));
  faint.push(P(pline(104, 12, 104.3, 84, s++, { size: 0.5, press: [0.3, 0.45], overA: 0, overB: 0 })));
  // walls: M14 20 H166 V124 H76 M52 124 H14 V20
  g.push(firm(14, 20, 166, 20, s++, { overA: 3.2, overB: 3.6 }));
  g.push(firm(166, 20, 166, 124, s++, { overA: 2.4, overB: 3.0 }));
  g.push(firm(166, 124, 76, 124, s++, { overA: 2.6, overB: 0.6 }));
  g.push(firm(52, 124, 14, 124, s++, { overA: 0.4, overB: 3.4 }));
  g.push(firm(14, 124, 14, 20, s++, { overA: 2.0, overB: 3.8 }));
  // door leaf and its swing (dashed, light)
  g.push(P(pline(52, 124, 52, 100, s++, { size: 1.1, overA: 0, overB: 0.8 })));
  const swing = [];
  for (let a = 0.03; a < Math.PI / 2 - 0.04; a += 0.21) {
    const a2 = Math.min(Math.PI / 2 - 0.01, a + 0.12);
    const p = t => [52 + 24 * Math.sin(t), 124 - 24 * Math.cos(t)];
    const [x1, y1] = p(a), [x2, y2] = p(a2);
    swing.push(`<path d="M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}"/>`);
  }
  // interior wall
  g.push(firm(104, 20, 104, 70, s++, { overA: 0.3, overB: 2.2 }));
  // table
  g.push(P(pline(118, 84, 148, 84, s++, { size: 1.05, overA: 1.6, overB: 2.4 })));
  g.push(P(pline(148, 84, 148, 104, s++, { size: 1.05, overA: 1.2, overB: 1.8 })));
  g.push(P(pline(148, 104, 118, 104, s++, { size: 1.05, overA: 1.4, overB: 2.2 })));
  g.push(P(pline(118, 104, 118, 84, s++, { size: 1.05, overA: 1.0, overB: 2.0 })));
  // dimension line with architect's ticks
  const dim = [];
  dim.push(P(pline(14, 9, 166, 9, s++, { size: 0.7, press: [0.4, 0.6], overA: 2, overB: 2.5, bow: 0.15 })));
  dim.push(P(pline(14, 4.5, 14, 13.5, s++, { size: 0.7, press: [0.4, 0.6], overA: 0, overB: 0 })));
  dim.push(P(pline(166, 4.5, 166, 13.5, s++, { size: 0.7, press: [0.4, 0.6], overA: 0, overB: 0 })));
  dim.push(P(pline(11.6, 11.6, 16.6, 6.4, s++, { size: 1.0, press: [0.6, 0.8], overA: 0, overB: 0, taperA: 0.5, taperB: 0.5 })));
  dim.push(P(pline(163.6, 11.6, 168.6, 6.4, s++, { size: 1.0, press: [0.6, 0.8], overA: 0, overB: 0, taperA: 0.5, taperB: 0.5 })));
  // tactile dots, pressed in pairs
  const dots = [];
  for (const [x, y] of [[30, 40], [34, 40], [130, 40], [134, 40], [60, 104], [64, 104]]) dots.push(dot(x, y, 1.6, s++));
  return `<g opacity=".36">${faint.join('')}</g><g>${g.join('')}</g><g opacity=".72"><g fill="none" stroke="#000" stroke-width="1.05" stroke-linecap="round">${swing.join('')}</g>${dim.join('')}</g><g>${dots.join('')}</g>`;
}

/** The paper production log the Linde app replaced: a printed form with handwritten entries. viewBox 0 0 200 92. */
export function productionLog(eps = 0.15) {
  const EPS = eps;
  let s = 2000;
  const printed = [];
  const line = (x1, y1, x2, y2, w) => printed.push(`<path d="M${x1} ${y1}H${x2}" stroke-width="${w}"/>`);
  line(10, 16, 190, 16, 1.2);
  for (const y of [28, 40, 52, 64, 76]) line(10, y, 190, y, 0.6);
  printed.push(`<path d="M50 16V84M120 16V84" stroke-width=".6"/>`);
  // printed column heads, too small to read, as on a real form
  const heads = [];
  const r = rng(77);
  for (const [x0, n] of [[13, 5], [54, 8], [124, 6]]) {
    let x = x0;
    for (let i = 0; i < n; i++) { const w = 1.1 + r() * 0.9; heads.push(`<rect x="${x.toFixed(1)}" y="10.2" width="${(w * 0.8).toFixed(1)}" height="2.3"/>`); x += w + 0.55; if (i === 2 && n > 6) x += 1.8; }
  }
  // handwriting
  const hand = [];
  const rows = [[16, 28], [28, 40], [40, 52], [52, 64], [64, 76]];
  rows.forEach(([top, bot], i) => {
    const base = bot - 3.1;
    const w1 = 16 + ((i * 7) % 13), w2 = 22 + ((i * 11) % 30);
    for (const w of scribble(14 + (i % 2) * 1.5, base, w1, s++, { xh: 2.6, letters: 3 })) hand.push(P(pstroke(w, s++, { size: 0.8, taperA: 1, taperB: 2, eps: EPS })));
    for (const w of scribble(55 + (i % 3), base, w2, s++, { xh: 2.6, letters: 4 })) hand.push(P(pstroke(w, s++, { size: 0.8, taperA: 1, taperB: 2, eps: EPS })));
  });
  for (const [i, ok] of [[0, 1], [1, 1], [3, 1]]) {
    const [, bot] = rows[i];
    hand.push(P(tick(126 + i * 0.7, bot - 9.4, 7.2, s++, { size: 1.15, eps: EPS })));
  }
  // a signature-ish initial at the foot
  for (const w of scribble(150, 87.5, 22, s++, { xh: 3.2, letters: 6, slant: 0.4 })) hand.push(P(pstroke(w, s++, { size: 0.85, taperA: 1, taperB: 4, eps: EPS })));
  return `<g opacity=".46"><g fill="none" stroke="#000">${printed.join('')}</g>${heads.join('')}</g><g opacity=".86">${hand.join('')}</g>`;
}

/** aryan in uncontracted Braille, embossed. viewBox 0 0 64 320. fibre and ink are 6-digit hex token values. */
export function braille(fibre, ink) {
  const letters = [[1], [1, 2, 3, 5], [1, 3, 4, 5, 6], [1], [1, 3, 4, 5]];
  const r = rng(23);
  const out = [];
  letters.forEach((dots, i) => {
    const ox = 18, oy = 28 + i * 58;
    for (const d of dots) {
      const col = d > 3 ? 1 : 0, row = (d - 1) % 3;
      const x = ox + col * 16 + (r() - 0.5) * 0.7, y = oy + row * 14 + (r() - 0.5) * 0.7, rad = 4.0 + r() * 0.35;
      out.push(`<circle cx="${(x + 0.8).toFixed(2)}" cy="${(y + 1).toFixed(2)}" r="${rad.toFixed(2)}" fill="${ink}" fill-opacity=".28"/>`);
      out.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${rad.toFixed(2)}" fill="${fibre}"/>`);
      // the dome: a shaded crescent on the side away from the light, a glint on the near side
      const a0 = 0.15 * Math.PI, a1 = 1.2 * Math.PI, rr = rad - 0.55;
      out.push(`<path d="M${(x + rr * Math.cos(-a0 + 0.1)).toFixed(2)} ${(y + rr * Math.sin(-a0 + 0.1)).toFixed(2)}A${rr.toFixed(2)} ${rr.toFixed(2)} 0 0 1 ${(x + rr * Math.cos(a1 - 0.6)).toFixed(2)} ${(y + rr * Math.sin(a1 - 0.6)).toFixed(2)}" fill="none" stroke="${ink}" stroke-opacity=".2" stroke-width="1.1" stroke-linecap="round"/>`);
      out.push(`<circle cx="${(x - rad * 0.32).toFixed(2)}" cy="${(y - rad * 0.34).toFixed(2)}" r="${(rad * 0.18).toFixed(2)}" fill="${fibre}" fill-opacity=".85"/>`);
    }
  });
  return out.join('');
}

/** About ticks: each one drawn separately, so no two match. viewBox 0 0 20 16, and the whole stroke stays inside it,
 *  because a mask clips what falls outside its box. */
export function aboutTick(seed) {
  return P(tick(2, 3.4, 11.4, seed, { size: 1.7 }));
}

/** Pune to Buffalo to New York City: a solid pencil arc between two pressed stops, then a dashed leg to an open stop,
 *  over a faint construction line. No labels, no scale. viewBox 0 0 w h; stops at 6%, 72.6% and 93.9% of w. */
export function route(w, h, seed) {
  let s = seed;
  const base = h * 0.68, apex = h * 0.2;
  const xa = w * 0.061, xb = w * 0.726, xc = w * 0.939;
  const out = [];
  out.push(`<g opacity=".36">${P(pline(w * 0.02, base + 3, w * 0.98, base + 3.4, s++, { size: 0.55, press: [0.3, 0.5], bow: 0.15, overA: 0, overB: 0, eps: 0.1 }))}</g>`);
  const arc = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60, u = 1 - t, mx = (xa + xb) / 2;
    arc.push([u * u * xa + 2 * u * t * mx + t * t * xb, u * u * base + 2 * u * t * (2 * apex - base) + t * t * base]);
  }
  out.push(P(pstroke(arc, s++, { size: 1.5, press: [0.55, 0.85], taperA: 3, taperB: 3, eps: 0.1 })));
  const dash = Math.max(6, w * 0.012), gap = dash * 0.8;
  for (let x = xb + gap; x + dash < xc - gap; x += dash + gap) out.push(P(pline(x, base, x + dash, base + 0.2, s++, { size: 1.2, overA: 0, overB: 0, bow: 0.1, eps: 0.1 })));
  for (const x of [xa, xb]) {
    const r = rng(s++), pts = [];
    for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2, rr = 3.4 * (0.88 + r() * 0.24); pts.push(`${(x + Math.cos(a) * rr).toFixed(2)} ${(base + Math.sin(a) * rr).toFixed(2)}`); }
    out.push(`<path d="M${pts.join('L')}Z"/>`);
  }
  const ring = [];
  for (let i = 0; i <= 26; i++) { const a = (i / 24) * Math.PI * 2; ring.push([xc + Math.cos(a) * 3.6, base + Math.sin(a) * 3.6]); }
  out.push(P(pstroke(ring, s++, { size: 1.1, taperA: 1, taperB: 1, eps: 0.1 })));
  return out.join('');
}

/** A field of freehand cells, Poisson-disc spaced, about one in ten filled at half strength. Depicts no data.
 *  Each cell is one wobbly closed line, so 110 cells stay near 12 KB. */
export function cellField(w, h, seed, count) {
  const r = rng(seed), nz = noise1(seed + 1);
  const cells = [];
  for (let tries = 0; cells.length < count && tries < count * 60; tries++) {
    const d = 10 + r() * 6, x = 6 + r() * (w - 12), y = 6 + r() * (h - 12);
    if (cells.every(c => Math.hypot(c.x - x, c.y - y) > (c.d + d) / 2 + 3)) cells.push({ x, y, d });
  }
  const lines = [], fills = [];
  for (const c of cells) {
    const rx = c.d / 2, ry = rx * (0.78 + r() * 0.3), rot = r() * Math.PI, pts = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, k = 1 + 0.09 * nz(c.x * 0.3 + i * 0.7);
      const ex = Math.cos(a) * rx * k, ey = Math.sin(a) * ry * k;
      pts.push([c.x + ex * Math.cos(rot) - ey * Math.sin(rot), c.y + ex * Math.sin(rot) + ey * Math.cos(rot)]);
    }
    const d = toD(pts);
    lines.push(d);
    if (r() < 0.1) fills.push(d);
  }
  return `<g fill-opacity=".5">${fills.map(P).join('')}</g><g fill="none" stroke="#000" stroke-width=".9" stroke-linejoin="round">${lines.map(P).join('')}</g>`;
}

/** The aside bracket, 12 x 100: the mock's brace path, drawn freehand. */
export function bracket(seed) {
  const seg = (p0, p1, p2, p3, n) => Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1), u = 1 - t;
    return [u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0], u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1]];
  });
  const pts = [
    ...seg([10, 2], [4, 2], [4, 8], [4, 14], 8), ...seg([4, 14], [4, 22], [4, 32], [4, 40], 8).slice(1),
    ...seg([4, 40], [4, 46], [2, 48], [0, 50], 6).slice(1), ...seg([0, 50], [2, 52], [4, 54], [4, 60], 6).slice(1),
    ...seg([4, 60], [4, 68], [4, 78], [4, 86], 8).slice(1), ...seg([4, 86], [4, 92], [4, 98], [10, 98], 8).slice(1),
  ];
  return P(pstroke(pts, seed, { size: 1.3, press: [0.55, 0.8], taperA: 2, taperB: 2, eps: 0.08 }));
}

/** Graph paper, 60 x 60: minor lines at .55, major lines at full strength. */
export function graphTile() {
  return '<g fill="none" stroke="#000"><path stroke-width=".6" stroke-opacity=".55" d="M12 0V60M24 0V60M36 0V60M48 0V60M0 12H60M0 24H60M0 36H60M0 48H60"/><path stroke-width=".9" d="M0 0V60M0 0H60"/></g>';
}

/** The grain tile, 160 x 160: our own turbulence frequency and a fixed brown multiply matrix, no colour literal. */
export function grainTile() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".62" numOctaves="2" seed="5" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .08  0 0 0 0 .06  0 0 0 .14 0"/></filter><rect width="160" height="160" filter="url(#n)"/></svg>';
}
