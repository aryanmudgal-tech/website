// Image processing for the Paste-Up mock (sharp). Outputs into site/mocks/paste-up/.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const IMG = path.resolve(here, '../../mocks/img');
const OUT = path.resolve(here, '../../mocks/paste-up');

// Pencil on paper -> graphite with alpha, so it sits on any paper without a white box.
async function pencilAlpha(src, region, out, width) {
  let img = sharp(src).extract(region).greyscale();
  if (width) img = img.resize({ width, kernel: 'lanczos3' });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  const lo = 64, hi = 236;
  for (let i = 0; i < info.width * info.height; i++) {
    const L = data[i];
    let a = (hi - L) / (hi - lo);
    a = Math.max(0, Math.min(1, a));
    a = Math.pow(a, 0.82);
    rgba[i * 4] = 0x2f; rgba[i * 4 + 1] = 0x2c; rgba[i * 4 + 2] = 0x28; rgba[i * 4 + 3] = Math.round(a * 255);
  }
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png({ compressionLevel: 9, palette: false }).toFile(out);
  return info;
}

const jobs = [];
// "me in every photo" and its arrow, from Aryan's drawing (the source region in the spec, trimmed clear of the hair)
jobs.push(pencilAlpha(path.join(IMG, 'portrait-pencil.jpg'), { left: 383, top: 20, width: 240, height: 234 }, path.join(OUT, 'hand.png')));
// the whole drawing for the footer sheet
jobs.push(pencilAlpha(path.join(IMG, 'portrait-pencil.jpg'), { left: 0, top: 0, width: 640, height: 800 }, path.join(OUT, 'portrait.png')));
// Dots demo poster: drop the letterbox bars, 16:9
jobs.push(sharp(path.join(IMG, 'full-dots-pitch.jpg')).extract({ left: 0, top: 24, width: 1029, height: 579 }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, 'dots-poster.jpg')));
// Projects plate: the LA Hacks arena in ink, to be multiplied onto vermilion
jobs.push((async () => {
  const meta = await sharp(path.join(IMG, 'full-hero.jpg')).metadata();
  // The stands, not the faces: crop near the top so the rows of seats carry the strip, then lift the
  // tones so the multiply onto vermilion reads as one ink over red paper instead of a murky photo.
  const W = 840, scale = W / meta.width, H = Math.round(meta.height * scale), h = 184;
  const top = Math.round((H - h) * 0.06);
  const { data, info } = await sharp(path.join(IMG, 'full-hero.jpg')).resize({ width: W }).extract({ left: 0, top, width: W, height: h })
    .greyscale().normalise({ lower: 1, upper: 99 }).raw().toBuffer({ resolveWithObject: true });
  const lo = 0.05, hi = 0.9, g = 0.42;
  const px = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < px.length; i++) px[i] = Math.round(255 * Math.pow(Math.min(1, Math.max(0, (data[i * info.channels] / 255 - lo) / (hi - lo))), g));
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 1 } }).jpeg({ quality: 74, mozjpeg: true }).toFile(path.join(OUT, 'arena-ink.jpg'));
})());
const res = await Promise.all(jobs);
console.log(res.map(r => r && (r.width + 'x' + r.height)).join(' '));
