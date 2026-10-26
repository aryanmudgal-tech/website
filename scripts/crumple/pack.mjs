// Packs each screen shape's rendered frames into one horizontal AVIF strip with alpha, and writes
// src/data/crumple.json with the frame times and each frame's paper outline box. Spec 6.7.
import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CACHE } from './render.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const FRAME = { d: { w: 640, h: 400 }, m: { w: 270, h: 584 } };
const round = (v) => +v.toFixed(5);

const data = {};
for (const size of Object.keys(FRAME)) {
  const meta = JSON.parse(readFileSync(path.join(CACHE, size, 'meta.json'), 'utf8'));
  const n = meta.crumple + meta.roll, { w, h } = FRAME[size];
  const tiles = [];
  for (let i = 0; i < n; i++) {
    tiles.push({ input: await sharp(path.join(CACHE, size, `${String(i).padStart(2, '0')}.png`)).resize(w, h, { kernel: 'lanczos3' }).png().toBuffer(), left: i * w, top: 0 });
  }
  const file = path.join(root, 'src', 'assets', 'paper', `crumple-${size}.avif`);
  await sharp({ create: { width: n * w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(tiles).avif({ quality: 58, effort: 6 }).toFile(file);
  data[size] = {
    seed: meta.seed, frame: [w, h], crumple: meta.crumple, roll: meta.roll, ts: meta.ts,
    boxes: meta.boxes.map((b) => [round(b.x0), round(b.y0), round(b.x1), round(b.y1)]),
  };
  console.log(path.relative(root, file), n, 'frames', `${Math.round(statSync(file).size / 1024)} KB`);
}
writeFileSync(path.join(root, 'src', 'data', 'crumple.json'), `${JSON.stringify(data, null, 1)}\n`);
console.log('wrote src/data/crumple.json');
