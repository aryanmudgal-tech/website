// Tiles screenshots into a 2-column contact sheet. usage: node strip.mjs out.png a.png b.png ...
import sharp from 'sharp';
const [out, ...files] = process.argv.slice(2);
const tw = 620;
const tiles = [];
for (const f of files) tiles.push(await sharp(f).resize({ width: tw }).png().toBuffer());
const th = (await sharp(tiles[0]).metadata()).height;
const cols = 2, rows = Math.ceil(tiles.length / cols);
await sharp({ create: { width: cols * (tw + 10), height: rows * (th + 10), channels: 4, background: '#333' } })
  .composite(tiles.map((b, k) => ({ input: b, left: (k % cols) * (tw + 10) + 5, top: Math.floor(k / cols) * (th + 10) + 5 })))
  .png().toFile(out);
console.log(out);
