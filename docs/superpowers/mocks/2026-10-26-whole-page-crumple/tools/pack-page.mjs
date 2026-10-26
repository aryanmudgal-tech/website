// Packs the whole-page crumple frames into one horizontal AVIF strip per screen shape.
import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
const OUT = { d: { w: 640, h: 400 }, m: { w: 270, h: 584 } };
for (const size of Object.keys(OUT)) {
  const dir = path.join('out', 'page', size);
  const meta = JSON.parse(readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  const n = meta.crumple + meta.roll, { w, h } = OUT[size];
  const tiles = [];
  for (let i = 0; i < n; i++) tiles.push({ input: await sharp(path.join(dir, String(i).padStart(2, '0') + '.png')).resize(w, h, { kernel: 'lanczos3' }).png().toBuffer(), left: i * w, top: 0 });
  const file = path.join('out', `page-${size}.avif`);
  await sharp({ create: { width: n * w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(tiles).avif({ quality: 58, effort: 6 }).toFile(file);
  writeFileSync(path.join('out', `page-${size}.json`), JSON.stringify({ n, ...meta }));
  console.log(file, n, 'frames', Math.round(statSync(file).size / 1024) + ' KB');
}
