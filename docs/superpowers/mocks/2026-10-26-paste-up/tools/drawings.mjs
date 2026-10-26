// Pencil drawings for the Paste-Up mock, drawn stroke by stroke with perfect-freehand. Seeded.
import { pline, pstroke, scribble, tick, rng, noise1 } from './art.mjs';

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
    swing.push(`<path class="stk" d="M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}"/>`);
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
  return `<g class="faint">${faint.join('')}</g><g>${g.join('')}</g><g class="light">${swing.join('')}${dim.join('')}</g><g>${dots.join('')}</g>`;
}

/** The paper production log the Linde app replaced: a printed form with handwritten entries. viewBox 0 0 200 92. */
export function productionLog() {
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
    for (const w of scribble(14 + (i % 2) * 1.5, base, w1, s++, { xh: 2.6, letters: 3 })) hand.push(P(pstroke(w, s++, { size: 0.8, taperA: 1, taperB: 2 })));
    for (const w of scribble(55 + (i % 3), base, w2, s++, { xh: 2.6, letters: 5 })) hand.push(P(pstroke(w, s++, { size: 0.8, taperA: 1, taperB: 2 })));
  });
  for (const [i, ok] of [[0, 1], [1, 1], [3, 1]]) {
    const [, bot] = rows[i];
    hand.push(P(tick(126 + i * 0.7, bot - 9.4, 7.2, s++, { size: 1.15 })));
  }
  // a signature-ish initial at the foot
  for (const w of scribble(150, 87.5, 22, s++, { xh: 3.2, letters: 6, slant: 0.4 })) hand.push(P(pstroke(w, s++, { size: 0.85, taperA: 1, taperB: 4 })));
  return `<g class="printed">${printed.join('')}${heads.join('')}</g><g class="hand">${hand.join('')}</g>`;
}

/** ARYAN in Braille, embossed. viewBox 0 0 64 320. */
export function braille() {
  const letters = [[1], [1, 2, 3, 5], [1, 3, 4, 5, 6], [1], [1, 3, 4, 5]];
  const r = rng(23);
  const out = [];
  letters.forEach((dots, i) => {
    const ox = 18, oy = 28 + i * 58;
    for (const d of dots) {
      const col = d > 3 ? 1 : 0, row = (d - 1) % 3;
      const x = ox + col * 16 + (r() - 0.5) * 0.7, y = oy + row * 14 + (r() - 0.5) * 0.7, rad = 4.0 + r() * 0.35;
      out.push(`<circle cx="${(x + 0.8).toFixed(2)}" cy="${(y + 1).toFixed(2)}" r="${rad.toFixed(2)}" fill="rgba(27,26,23,.28)"/>`);
      out.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${rad.toFixed(2)}" fill="#F7F2E6"/>`);
      // the dome: a shaded crescent on the side away from the light, a glint on the near side
      const a0 = 0.15 * Math.PI, a1 = 1.2 * Math.PI, rr = rad - 0.55;
      out.push(`<path d="M${(x + rr * Math.cos(-a0 + 0.1)).toFixed(2)} ${(y + rr * Math.sin(-a0 + 0.1)).toFixed(2)}A${rr.toFixed(2)} ${rr.toFixed(2)} 0 0 1 ${(x + rr * Math.cos(a1 - 0.6)).toFixed(2)} ${(y + rr * Math.sin(a1 - 0.6)).toFixed(2)}" fill="none" stroke="rgba(27,26,23,.2)" stroke-width="1.1" stroke-linecap="round"/>`);
      out.push(`<circle cx="${(x - rad * 0.32).toFixed(2)}" cy="${(y - rad * 0.34).toFixed(2)}" r="${(rad * 0.18).toFixed(2)}" fill="#fff" opacity=".85"/>`);
    }
  });
  return out.join('');
}

/** About ticks: each one drawn separately, so no two match. viewBox 0 0 20 16. */
export function aboutTick(seed) {
  return P(tick(2.2, 5.2, 15, seed, { size: 1.9 }));
}
