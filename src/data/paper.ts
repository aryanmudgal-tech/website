/** Provenance manifest and job list for the paper assets (spec 6.3, 6.4). scripts/paper.mjs writes exactly these files. */
export type PaperAsset = {
  readonly file: string;                 // path under src/assets/paper/, or "public/og.jpg"
  readonly kind: "mask" | "pencil" | "line" | "colour" | "raster" | "rendered";
  readonly source: "code" | "aryan";
  readonly generator: string;            // exported function in scripts/paper/*.mjs
  readonly seed?: number;                // required for code; 0 for the deterministic generators
  readonly eps?: number;                 // simplification tolerance, default 0.1
  readonly size: readonly [number, number];
  readonly from?: { readonly path: string; readonly region?: readonly [number, number, number, number] };
  readonly tokens?: readonly string[];   // colour files: the tokens written in
  readonly budget: number;               // bytes, raw
};

const mask = (file: string, generator: string, seed: number, size: readonly [number, number], budget = 4000, eps?: number): PaperAsset =>
  ({ file, kind: "mask", source: "code", generator, seed, size, budget, ...(eps === undefined ? {} : { eps }) });

export const paperAssets: readonly PaperAsset[] = [
  mask("sky.outer.svg", "paper", 11, [416, 496], 4000, 0.25),
  mask("sky.inner.svg", "paper", 11, [416, 496], 4000, 0.25),
  mask("sky-sm.outer.svg", "paper", 12, [300, 320], 4000, 0.25),
  mask("sky-sm.inner.svg", "paper", 12, [300, 320], 4000, 0.25),
  mask("braille.outer.svg", "paper", 23, [64, 320]),
  mask("braille.inner.svg", "paper", 23, [64, 320]),
  mask("plan.outer.svg", "paper", 37, [144, 124]),
  mask("plan.inner.svg", "paper", 37, [144, 124]),
  mask("hand.outer.svg", "paper", 41, [156, 120]),
  mask("log.outer.svg", "paper", 43, [248, 114]),
  mask("graph.outer.svg", "paper", 47, [248, 112]),
  mask("band.outer.svg", "ribbonBand", 49, [48, 150]),
  mask("band.inner.svg", "ribbonBand", 49, [48, 150]),
  mask("edge-top.outer.svg", "edgeStrip", 51, [1200, 16], 8000),
  mask("edge-top.inner.svg", "edgeStrip", 51, [1200, 16], 8000),
  mask("edge-bottom.outer.svg", "edgeStrip", 53, [1200, 16], 8000),
  mask("edge-bottom.inner.svg", "edgeStrip", 53, [1200, 16], 8000),
  mask("solid.svg", "solidMask", 0, [1, 1], 200),
  mask("tape-a.svg", "tape", 61, [88, 26], 600),
  mask("tape-b.svg", "tape", 63, [64, 20], 600),
  mask("tape-c.svg", "tape", 65, [80, 22], 600),
  mask("tape-fig-l.svg", "tapeEnd", 67, [12, 46], 500),
  mask("tape-fig-r.svg", "tapeEnd", 68, [12, 46], 500),
  mask("play.svg", "playGlyph", 0, [20, 22], 300),
  { file: "plan.pencil.svg", kind: "pencil", source: "code", generator: "floorPlan", seed: 1000, size: [180, 140], budget: 14000 },
  { file: "log.pencil.svg", kind: "pencil", source: "code", generator: "productionLog", seed: 2000, eps: 0.5, size: [200, 92], budget: 16000 },
  { file: "route.pencil.svg", kind: "pencil", source: "code", generator: "route", seed: 3000, size: [1184, 112], budget: 12000 },
  { file: "route-sm.pencil.svg", kind: "pencil", source: "code", generator: "route", seed: 3100, size: [358, 72], budget: 8000 },
  ...[1, 2, 3, 4, 5].map((n): PaperAsset => ({ file: `tick-${n}.svg`, kind: "line", source: "code", generator: "aboutTick", seed: 4000 + n, size: [20, 16], budget: 1000 })),
  { file: "bracket.svg", kind: "line", source: "code", generator: "bracket", seed: 4100, size: [12, 100], budget: 1000 },
  { file: "graph.tile.svg", kind: "line", source: "code", generator: "graphTile", seed: 0, size: [60, 60], budget: 1000 },
  { file: "cells.svg", kind: "line", source: "code", generator: "cellField", seed: 5000, size: [744, 112], budget: 16000 },
  { file: "cells-sm.svg", kind: "line", source: "code", generator: "cellField", seed: 5100, size: [358, 72], budget: 8000 },
  { file: "grain.svg", kind: "colour", source: "code", generator: "grainTile", seed: 5, size: [160, 160], tokens: [], budget: 1000 },
  { file: "braille.dots.svg", kind: "colour", source: "code", generator: "braille", seed: 23, size: [64, 320], tokens: ["--fibre", "--on-stock"], budget: 6000 },
  { file: "tape-end-sky-l.svg", kind: "colour", source: "code", generator: "tapeEnd", seed: 71, size: [8, 40], tokens: ["--stock-sky"], budget: 500 },
  { file: "tape-end-sky-r.svg", kind: "colour", source: "code", generator: "tapeEnd", seed: 72, size: [8, 40], tokens: ["--stock-sky"], budget: 500 },
  { file: "tape-end-marigold-l.svg", kind: "colour", source: "code", generator: "tapeEnd", seed: 73, size: [8, 40], tokens: ["--stock-marigold"], budget: 500 },
  { file: "tape-end-marigold-r.svg", kind: "colour", source: "code", generator: "tapeEnd", seed: 74, size: [8, 40], tokens: ["--stock-marigold"], budget: 500 },
  { file: "hand.png", kind: "raster", source: "aryan", generator: "pencilAlpha", size: [240, 234], from: { path: "Pictures/Chancellors-award/scribble.png", region: [297, 16, 187, 182] }, budget: 16384 },
  { file: "arena.jpg", kind: "raster", source: "aryan", generator: "duotone", size: [840, 82], from: { path: "Pictures/LA-hacks/IMG_9046.jpg" }, budget: 28000 },
  { file: "cleancampus.jpg", kind: "raster", source: "aryan", generator: "duotone", size: [544, 177], from: { path: "Pictures/Clean-campus/clean-campus-drive.png" }, budget: 22000 },
  { file: "public/og.jpg", kind: "raster", source: "aryan", generator: "og", size: [1200, 630], from: { path: "Pictures/Pillars-award/innovative-student-leader-award-3.png" }, budget: 122880 },
];
