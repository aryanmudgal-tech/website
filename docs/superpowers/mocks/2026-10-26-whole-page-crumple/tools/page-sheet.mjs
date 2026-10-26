// Contact sheet of whole-page crumple frames on a kraft desk. usage: node page-sheet.mjs d 0,3,6,9,12,15,17,21
import sharp from 'sharp';
import path from 'node:path';
const [size = 'd', list = '0,3,6,9,12,15,17,21'] = process.argv.slice(2);
const ids = list.split(',').map(Number);
const dir = path.join('out', 'page', size);
const tw = size === 'd' ? 400 : 160;
const tiles = [];
for (const i of ids) tiles.push(await sharp(path.join(dir, String(i).padStart(2, '0') + '.png')).resize({ width: tw }).png().toBuffer());
const th = (await sharp(tiles[0]).metadata()).height;
const cols = size === 'd' ? 4 : 8, rows = Math.ceil(tiles.length / cols);
await sharp({ create: { width: cols * (tw + 8), height: rows * (th + 8), channels: 4, background: '#C9B48D' } })
  .composite(tiles.map((b, k) => ({ input: b, left: (k % cols) * (tw + 8) + 4, top: Math.floor(k / cols) * (th + 8) + 4 })))
  .png().toFile(`out/page-sheet-${size}.png`);
console.log(`out/page-sheet-${size}.png`);
