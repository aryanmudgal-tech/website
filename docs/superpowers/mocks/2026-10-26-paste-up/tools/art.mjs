// Seeded generators for the Paste-Up mock: torn paper, pencil strokes, Braille, tapes.
// Everything is deterministic: same seed, same output.
import { getStroke } from 'perfect-freehand';

export function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

export function noise1(seed) {
  const r = rng(Math.imul(seed >>> 0, 2654435761) ^ 0x9e3779b9);
  const N = 2048, v = new Float64Array(N);
  for (let i = 0; i < N; i++) v[i] = r() * 2 - 1;
  return x => {
    const i = Math.floor(x), f = x - i;
    const a = v[((i % N) + N) % N], b = v[(((i + 1) % N) + N) % N];
    const t = f * f * f * (f * (f * 6 - 15) + 10);
    return a + (b - a) * t;
  };
}

export function fbm1(seed, oct = 3, lac = 2.13, gain = 0.52) {
  const ns = [];
  for (let k = 0; k < oct; k++) ns.push(noise1(seed + k * 977));
  return x => {
    let s = 0, a = 1, f = 1, n = 0;
    for (const fn of ns) { s += a * fn(x * f + 17.3 * f); n += a; a *= gain; f *= lac; }
    return s / n;
  };
}

const R1 = v => Math.round(v * 10) / 10;
const fmt = v => {
  const s = String(R1(v));
  return s.replace(/^(-?)0\./, '$1.');
};

export function toD(pts, close = true) {
  let [px, py] = [R1(pts[0][0]), R1(pts[0][1])];
  let d = `M${fmt(px)} ${fmt(py)}`;
  for (let i = 1; i < pts.length; i++) {
    const x = R1(pts[i][0]), y = R1(pts[i][1]);
    const dx = R1(x - px), dy = R1(y - py);
    if (dx === 0 && dy === 0) continue;
    const sx = fmt(dx), sy = fmt(dy);
    d += 'l' + sx + (sy.startsWith('-') ? '' : ' ') + sy;
    px = x; py = y;
  }
  return close ? d + 'z' : d;
}

// Ramer-Douglas-Peucker on a closed list (endpoints kept).
function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9;
    let best = -1, bi = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / L;
      if (d > best) { best = d; bi = i; }
    }
    if (best > eps) { keep[bi] = 1; stack.push([a, bi], [bi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

/**
 * One side of a piece of paper.
 * kind 'torn': a hand tear. Depth is measured inward from the nominal edge.
 *   outer = the fibre layer (fuzzy, with stray fibres), inner = the coloured face (smoother, set back by a rim that swells and thins).
 * kind 'cut': a scissor or guillotine cut, nearly straight, no rim.
 */
function edgeModel(len, seed, o = {}) {
  if (o.kind === 'cut' || !o.kind) {
    const bow = noise1(seed), wob = noise1(seed + 9);
    const d = s => 0.35 + (o.bow ?? 0.5) * (0.5 + 0.5 * bow(s / 240)) + 0.12 * wob(s / 9);
    return { outer: d, inner: d };
  }
  // A tear is a path whose heading wanders: integrate a slowly turning angle, then fit it inside [0, depth].
  const W = o.wave ?? 46, turn = o.turn ?? 0.26, Dmax = o.depth ?? 7;
  const macro = fbm1(seed + 2, 3), mid = noise1(seed + 3), micro = noise1(seed + 4), micro2 = noise1(seed + 14);
  const rimN = fbm1(seed + 5, 2), rimMicro = noise1(seed + 6);
  const H = 0.5, N = Math.ceil(len / H) + 2;
  const walk = new Float64Array(N), ang = new Float64Array(N);
  let d = 0;
  for (let i = 0; i < N; i++) {
    const s = i * H;
    const a = turn * macro(s / W) + 0.07 * mid(s / 6);
    ang[i] = a; d += Math.tan(a) * H; walk[i] = d;
  }
  // detrend so the two ends sit at similar depths, then normalise into [0, Dmax]
  const slope = (walk[N - 1] - walk[0]) / (N - 1);
  let lo = 1e9, hi = -1e9;
  for (let i = 0; i < N; i++) { walk[i] -= slope * i; lo = Math.min(lo, walk[i]); hi = Math.max(hi, walk[i]); }
  const k = (hi - lo) > Dmax ? Dmax / (hi - lo) : 1;
  for (let i = 0; i < N; i++) walk[i] = (walk[i] - lo) * k;
  const at = (arr, s) => { const x = Math.max(0, Math.min(N - 1.001, s / H)); const i = Math.floor(x), f = x - i; return arr[i] + (arr[i + 1] - arr[i]) * f; };
  const r = rng(seed + 7);
  const hairs = [];
  for (let s = r() * 10; s < len; s += 2 + r() * (o.hairGap ?? 14)) hairs.push([s, 0.3 + r() * (o.hairLen ?? 1.5), 0.3 + r() * 0.7]);
  const base = 1.8;
  const outer = s => {
    let v = at(walk, s) + base + (o.fuzz ?? 0.3) * micro(s / 1.2);
    for (const [p, l, w] of hairs) { const t = Math.abs(s - p) / w; if (t < 1) v -= l * (1 - t * t); }
    return Math.max(0, v);
  };
  const rimMin = o.rimMin ?? 0.5, rimMax = o.rimMax ?? 4.2;
  const inner = s => {
    // the coloured face tears back further where the tear runs against the grain
    const a = at(ang, s) / turn;
    const q = Math.min(1, Math.max(0, 0.38 + 0.9 * rimN(s / (o.rimWave ?? 26)) + 0.35 * a));
    return at(walk, s) + base + rimMin + (rimMax - rimMin) * Math.pow(q, 1.5) + 0.42 * Math.abs(micro2(s / 0.9)) + 0.2 * rimMicro(s / 2.6);
  };
  if (o.rim === false) return { outer, inner: outer };
  return { outer, inner };
}

/** Torn or cut rectangle. sides: { t, r, b, l } each an edge option object. Returns { outer, inner } path data. */
export function paper(w, h, seed, sides, step = 1.7, eps = 0.1) {
  const lens = { t: w, r: h, b: w, l: h };
  const E = {};
  let k = 0;
  for (const side of ['t', 'r', 'b', 'l']) E[side] = edgeModel(lens[side], seed * 131 + (k++) * 1009, sides[side] || { kind: 'cut' });
  const build = which => {
    const f = side => E[side][which];
    const TL = [f('l')(h), f('t')(0)], TR = [w - f('r')(0), f('t')(w)];
    const BR = [w - f('r')(h), h - f('b')(0)], BL = [f('l')(0), h - f('b')(w)];
    const r = rng(seed * 7 + (which === 'outer' ? 1 : 2));
    const pts = [TL];
    const walk = (from, to, st, emit) => { for (let s = from + st * (0.5 + r() * 0.9); s < to - st * 0.4; s += st * (0.5 + r() * 0.9)) emit(s); };
    const st = side => (sides[side] && sides[side].kind === 'torn') ? step : 24;
    walk(TL[0], TR[0], st('t'), s => pts.push([s, f('t')(s)]));
    pts.push(TR);
    walk(TR[1], BR[1], st('r'), s => pts.push([w - f('r')(s), s]));
    pts.push(BR);
    if (sides.b && sides.b.notch) pts.push([w / 2 + (sides.b.skew ?? 0), h - sides.b.notch]);
    else walk(w - BR[0], w - BL[0], st('b'), s => pts.push([w - s, h - f('b')(s)]));
    pts.push(BL);
    walk(h - BL[1], h - TL[1], st('l'), s => pts.push([f('l')(s), h - s]));

    return toD(rdp(pts, eps));
  };
  return { outer: build('outer'), inner: build('inner') };
}

/** Masking tape: long edges almost straight, short ends torn in a fibrous zigzag. */
export function tape(w, h, seed) {
  const r = rng(seed), nz = noise1(seed + 2);
  const end = (x0, dir) => {
    // masking tape tears in uneven fibrous teeth, leaning one way
    const lean = (r() * 2 - 1) * 3.6;
    const pts = [];
    let y = 0;
    while (y < h) {
      const t = y / h;
      const tooth = Math.abs(nz(y / 1.7)) * 2.4 + (r() < 0.18 ? r() * 1.6 : 0);
      pts.push([x0 + dir * (lean * (t - 0.5) + 2.2 + tooth), y]);
      y += 0.8 + r() * 1.6;
    }
    pts.push([x0 + dir * (lean * 0.5 + 2.2 + r()), h]);
    return pts;
  };
  const right = end(w, -1), left = end(0, 1).reverse();
  const pts = [];
  pts.push([left[left.length - 1][0], 0.15]);
  for (const p of right) pts.push(p);
  for (const p of left) pts.push(p);
  return toD(pts);
}

// perfect-freehand outline to SVG path
function strokeToD(stroke) {
  if (!stroke.length) return '';
  const avg = (a, b) => (a + b) / 2;
  let d = `M${R1(stroke[0][0])} ${R1(stroke[0][1])}Q`;
  for (let i = 0; i < stroke.length; i++) {
    const [x0, y0] = stroke[i], [x1, y1] = stroke[(i + 1) % stroke.length];
    d += `${R1(x0)} ${R1(y0)} ${R1(avg(x0, x1))} ${R1(avg(y0, y1))} `;
  }
  return d.trim().replace(/ -/g, '-') + 'Z';
}

/** A pencil line from A to B with overshoot, a slight bow, pressure drift and tapered ends. */
export function pline(ax, ay, bx, by, seed, o = {}) {
  const r = rng(seed), nz = noise1(seed + 3);
  const L = Math.hypot(bx - ax, by - ay) || 1;
  const ux = (bx - ax) / L, uy = (by - ay) / L, nx = -uy, ny = ux;
  const oa = o.overA ?? (r() * 2.4), ob = o.overB ?? (1 + r() * 3);
  const A = [ax - ux * oa, ay - uy * oa], B = [bx + ux * ob, by + uy * ob];
  const LL = L + oa + ob;
  const n = Math.max(4, Math.ceil(LL / 2.5));
  const bow = (r() * 2 - 1) * (o.bow ?? 0.5) * Math.min(1.6, LL / 70);
  const jit = o.jitter ?? 0.14;
  const p0 = o.press?.[0] ?? 0.45, p1 = o.press?.[1] ?? 0.8;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const off = bow * Math.sin(Math.PI * t) + jit * nz(t * LL / 7);
    pts.push([A[0] + (B[0] - A[0]) * t + nx * off, A[1] + (B[1] - A[1]) * t + ny * off, p0 + (p1 - p0) * (0.5 + 0.5 * nz(t * 2.2 + 11))]);
  }
  return strokeToD(getStroke(pts, {
    size: o.size ?? 1.25, thinning: o.thinning ?? 0.55, smoothing: 0.62, streamline: 0.3, simulatePressure: false, last: true,
    start: { taper: Math.min(o.taperA ?? 7, LL * 0.25) }, end: { taper: Math.min(o.taperB ?? 3, LL * 0.12) },
  }));
}

/** A freehand stroke through given points (already sampled), with pressure from noise. */
export function pstroke(points, seed, o = {}) {
  const nz = noise1(seed + 5);
  const p0 = o.press?.[0] ?? 0.4, p1 = o.press?.[1] ?? 0.85;
  const pts = points.map((p, i) => [p[0], p[1], p0 + (p1 - p0) * (0.5 + 0.5 * nz(i * 0.21 + 3))]);
  return strokeToD(getStroke(pts, {
    size: o.size ?? 1.1, thinning: o.thinning ?? 0.6, smoothing: 0.55, streamline: o.streamline ?? 0.25, simulatePressure: false, last: true,
    start: { taper: o.taperA ?? 4 }, end: { taper: o.taperB ?? 6 },
  }));
}

/** Illegible cursive: words of joined letters, each letter one pen oscillation (humps, loops, ascenders, descenders). */
export function scribble(x0, base, width, seed, o = {}) {
  const r = rng(seed), drift = noise1(seed + 3);
  const xh = o.xh ?? 3;
  const slant = o.slant ?? 0.3;
  const words = [];
  let x = x0;
  while (x < x0 + width - xh) {
    const pts = [];
    let px = x;
    const n = 2 + Math.floor(r() * (o.letters ?? 5));
    // lead-in
    pts.push([px - xh * 0.5, base + 0.2]);
    for (let li = 0; li < n && px < x0 + width - xh * 0.6; li++) {
      const type = r();
      let hgt = xh * (0.8 + r() * 0.35), lw = xh * (0.62 + r() * 0.4), loop = r() * 0.08, sign = -1;
      if (type < 0.15) { hgt = xh * (2.0 + r() * 0.45); loop = 0.2 + r() * 0.08; lw *= 0.85; }
      else if (type < 0.22) { sign = 1; hgt = xh * (1.2 + r() * 0.3); loop = 0.18; }
      else if (type < 0.42) { loop = 0.24 + r() * 0.06; }
      const steps = 9;
      for (let k = 1; k <= steps; k++) {
        const t = k / steps, ang = t * Math.PI * 2;
        const lift = hgt * (0.5 - 0.5 * Math.cos(ang));
        const y = base + sign * lift + drift(px / 9) * 0.35;
        const xx = px + lw * t - loop * lw * Math.PI * 2 * 0.16 * Math.sin(ang) * 2.2;
        pts.push([xx + (base - y) * slant, y]);
      }
      px += lw;
    }
    // trailing flick
    pts.push([px + xh * 0.45, base - xh * 0.35]);
    words.push(pts);
    x = px + xh * (1.0 + r() * 1.1);
  }
  return words;
}

/** A quick check mark: short stroke down, long stroke up, never the same twice. */
export function tick(x, y, sz, seed, o = {}) {
  const r = rng(seed);
  const a = [x + r() * sz * 0.08, y + sz * (0.32 + r() * 0.22)];
  const b = [x + sz * (0.26 + r() * 0.16), y + sz * (0.8 + r() * 0.18)];
  const c = [x + sz * (0.88 + r() * 0.26), y - sz * (r() * 0.2)];
  const bulge = (r() * 2 - 1) * 0.14 * sz, sag = (r() * 2 - 1) * 0.08 * sz;
  const pts = [];
  for (let t = 0; t <= 1.0001; t += 0.14) pts.push([a[0] + (b[0] - a[0]) * t + Math.sin(t * Math.PI) * sag, a[1] + (b[1] - a[1]) * t]);
  for (let t = 0.08; t <= 1.0001; t += 0.06) pts.push([b[0] + (c[0] - b[0]) * t - Math.sin(t * Math.PI) * bulge * 0.5, b[1] + (c[1] - b[1]) * t + Math.sin(t * Math.PI) * bulge]);
  return pstroke(pts, seed + 1, { size: (o.size ?? 1.6) * (0.85 + r() * 0.3), thinning: 0.6, press: [0.8, 0.45], taperA: 1 + r() * 2, taperB: sz * (0.35 + r() * 0.3) });
}
