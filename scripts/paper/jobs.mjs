// Every paper asset's recipe, keyed by its path under src/assets/paper/. scripts/paper.mjs and
// tests/paper.test.mjs both run these, so the committed files and the recipes cannot drift apart.
import { join } from 'node:path';
import { paper, tape, tapeEnd, edgeStrip, ribbonBand, solidMask, playGlyph } from './art.mjs';
import { floorPlan, productionLog, braille, aboutTick, route, cellField, bracket, graphTile, grainTile } from './drawings.mjs';
import { maskDoc, pencilDoc, colourDoc, path } from './svg.mjs';
import { readFileSync } from 'node:fs';
import { pencilAlpha, duotone, ogCard } from './images.mjs';
import { readTokens } from './tokens.mjs';

const T = (o = {}) => ({ kind: 'torn', ...o });
const C = (o = {}) => ({ kind: 'cut', ...o });

const SIDES = {
  sky: { t: T({ depth: 8, rimMax: 4.6 }), r: T({ depth: 6, rimMax: 3.4 }), b: T({ depth: 5, rimMax: 2.6 }), l: T({ depth: 5, rimMax: 3.2 }) },
  braille: { t: T({ depth: 6, rimMax: 4 }), b: T({ depth: 6, rimMax: 3.6 }), l: C(), r: C() },
  plan: { t: T({ depth: 6, rimMax: 4.2 }), l: T({ depth: 5, rimMax: 3.4 }), r: C(), b: C() },
  hand: { t: C(), r: T({ depth: 5, rim: false }), b: T({ depth: 6, rim: false }), l: T({ depth: 4, rim: false }) },
  log: { t: T({ depth: 4, rim: false }), r: T({ depth: 5, rim: false }), b: C(), l: C() },
  graph: { t: C(), r: T({ depth: 5, rim: false }), b: T({ depth: 4, rim: false }), l: C() },
};

const piece = (sides, which) => (e) => {
  const [w, h] = e.size;
  return maskDoc(w, h, path(paper(w, h, e.seed, SIDES[sides], 1.7, e.eps ?? 0.1)[which]));
};
const doc = (fn) => (e) => maskDoc(...e.size, fn(e));
const fill = (token, side) => (e, tok) => colourDoc(...e.size, `<path fill="${tok[token]}" d="${tapeEnd(...e.size, e.seed, side)}"/>`);

export const codeJobs = {
  'sky.outer.svg': piece('sky', 'outer'), 'sky.inner.svg': piece('sky', 'inner'),
  'sky-sm.outer.svg': piece('sky', 'outer'), 'sky-sm.inner.svg': piece('sky', 'inner'),
  'braille.outer.svg': piece('braille', 'outer'), 'braille.inner.svg': piece('braille', 'inner'),
  'plan.outer.svg': piece('plan', 'outer'), 'plan.inner.svg': piece('plan', 'inner'),
  'hand.outer.svg': piece('hand', 'outer'),
  'log.outer.svg': piece('log', 'outer'),
  'graph.outer.svg': piece('graph', 'outer'),
  'band.outer.svg': doc((e) => path(ribbonBand(...e.size, e.seed).outer)),
  'band.inner.svg': doc((e) => path(ribbonBand(...e.size, e.seed).inner)),
  'edge-top.outer.svg': doc((e) => path(edgeStrip(...e.size, e.seed, 'top').outer)),
  'edge-top.inner.svg': doc((e) => path(edgeStrip(...e.size, e.seed, 'top').inner)),
  'edge-bottom.outer.svg': doc((e) => path(edgeStrip(...e.size, e.seed, 'bottom').outer)),
  'edge-bottom.inner.svg': doc((e) => path(edgeStrip(...e.size, e.seed, 'bottom').inner)),
  'solid.svg': doc(() => path(solidMask())),
  'tape-a.svg': doc((e) => path(tape(...e.size, e.seed))),
  'tape-b.svg': doc((e) => path(tape(...e.size, e.seed))),
  'tape-c.svg': doc((e) => path(tape(...e.size, e.seed))),
  'tape-fig-l.svg': doc((e) => path(tapeEnd(...e.size, e.seed, 'l'))),
  'tape-fig-r.svg': doc((e) => path(tapeEnd(...e.size, e.seed, 'r'))),
  'play.svg': doc(() => path(playGlyph())),
  'plan.pencil.svg': (e) => pencilDoc(...e.size, floorPlan()),
  'log.pencil.svg': (e) => pencilDoc(...e.size, productionLog(e.eps)),
  'route.pencil.svg': (e) => pencilDoc(...e.size, route(...e.size, e.seed)),
  'route-sm.pencil.svg': (e) => pencilDoc(...e.size, route(...e.size, e.seed)),
  'tick-1.svg': doc((e) => aboutTick(e.seed)), 'tick-2.svg': doc((e) => aboutTick(e.seed)),
  'tick-3.svg': doc((e) => aboutTick(e.seed)), 'tick-4.svg': doc((e) => aboutTick(e.seed)),
  'tick-5.svg': doc((e) => aboutTick(e.seed)),
  'bracket.svg': doc((e) => bracket(e.seed)),
  'graph.tile.svg': doc(() => graphTile()),
  'cells.svg': doc((e) => cellField(...e.size, e.seed, 110)),
  'cells-sm.svg': doc((e) => cellField(...e.size, e.seed, 34)),
  'grain.svg': () => `${grainTile()}\n`,
  'braille.dots.svg': (e, tok) => colourDoc(...e.size, braille(tok['--fibre'], tok['--on-stock'])),
  'tape-end-sky-l.svg': fill('--stock-sky', 'l'), 'tape-end-sky-r.svg': fill('--stock-sky', 'r'),
  'tape-end-marigold-l.svg': fill('--stock-marigold', 'l'), 'tape-end-marigold-r.svg': fill('--stock-marigold', 'r'),
};

export const aryanJobs = {
  'hand.png': (e, root) => pencilAlpha(join(root, e.from.path), { left: e.from.region[0], top: e.from.region[1], width: e.from.region[2], height: e.from.region[3] }, e.size),
  'arena.jpg': (e, root) => duotone(join(root, e.from.path), 840, [0, 0.03, 1, 0.18]),
  'cleancampus.jpg': (e, root) => duotone(join(root, e.from.path), 680, [0, 0.02, 0.8, 0.28], e.size),
  // The photo is the 4:5 crop that scripts/crop-rooms.mjs made of from.path for the ogRoom (src/data/rooms.ts).
  'public/og.jpg': async (e, root) => {
    const { ogRoom } = await import('../../src/data/rooms.ts');
    return ogCard({
      photo: readFileSync(join(root, 'src', 'assets', 'rooms', `${ogRoom}.jpg`)),
      hand: readFileSync(join(root, 'src', 'assets', 'paper', 'hand.png')),
      paper: (file) => readFileSync(join(root, 'src', 'assets', 'paper', file), 'utf8'),
      tokens: readTokens(readFileSync(join(root, 'src', 'styles', 'global.css'), 'utf8')),
    });
  },
};
