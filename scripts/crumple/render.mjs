// Renders the whole-page crumple once per screen shape with page3d.js in headless Chromium (WebGL), then writes
// each frame and its paper outline box (fractions of the sheet) to node_modules/.cache/crumple. Spec 6.7.
// usage: node scripts/crumple/render.mjs [d] [m]
// Chromium: Playwright's own build (npx playwright install chromium), or set CRUMPLE_CHROME to a Chromium binary.
import http from 'node:http';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from 'playwright';
import { PARAMS, frameTimes } from './params.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const CACHE = path.join(root, 'node_modules', '.cache', 'crumple');

// Sheet sizes in CSS px. The renderer works at 1x; pack.mjs makes the frames smaller.
export const SHEETS = {
  d: { texW: 1280, texH: 800, seg: 7, ballR: 92, aoR: 26, shStep: 2.6, shSoft: 3.2, seed: 21 },
  m: { texW: 390, texH: 844, seg: 4, ballR: 58, aoR: 16, shStep: 1.6, shSoft: 2.2, seed: 9 },
};
const PAGE = {
  cell: 0.105, creaseDensity: 1.25, pull: 0.45, wrinkle: 1.0, wrinkleBy: 0.3, wrinkleFloor: 0.0, wrinkleNear: 0.8,
  feedStart: 0.12, feedEnd: 0.0, feedPow: 1.2, enterF: 0.08, lam: 0.2, db: 0.24, pinch: 0.3, nearPull: 0.25, r0: 0.3,
  mapScale: 0.45, mapScale2: 0.085, mapAmp2: 0.12, mapUp: 0.0, lift: 0.03, gx: 0.5, gy: 0.52,
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const which = process.argv.slice(2).filter((a) => SHEETS[a]);
  const sizes = which.length ? which : Object.keys(SHEETS);
  mkdirSync(CACHE, { recursive: true });
  const white = path.join(CACHE, 'white.png');
  if (!existsSync(white)) await sharp({ create: { width: 64, height: 64, channels: 4, background: '#ffffff' } }).png().toFile(white);

  // Serves only the renderer, its two libraries and the blank texture.
  const allowed = ['/scripts/crumple/', '/node_modules/three/build/', '/node_modules/simplex-noise/dist/esm/'];
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png' };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    const file = url === '/white.png' ? white : path.join(root, url);
    if ((url !== '/white.png' && !allowed.some((prefix) => url.startsWith(prefix))) || url.includes('..') || !existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CRUMPLE_CHROME || undefined,
    args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  page.on('pageerror', (error) => console.log('[pageerror]', error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/scripts/crumple/render.html`);
  await page.waitForFunction(() => window.ready === true);

  const bbox = async (buf) => {
    const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    return { x0: x0 / info.width, y0: y0 / info.height, x1: (x1 + 1) / info.width, y1: (y1 + 1) / info.height };
  };

  for (const size of sizes) {
    const S = SHEETS[size];
    const prm = { ...PARAMS.common, ...PAGE, ...S, front: '/white.png', back: null, bandW: S.texW, bandH: S.texH, mx: 0, my: 0, scale: 1, frames: 18, rollFrames: 8 };
    prm.ts = frameTimes(prm.frames);
    const started = Date.now();
    const result = await page.evaluate((p) => window.renderFrames(p), prm);
    const dir = path.join(CACHE, size);
    mkdirSync(dir, { recursive: true });
    const all = [...result.frames, ...result.roll];
    const boxes = [];
    for (let i = 0; i < all.length; i++) {
      const buf = Buffer.from(all[i].split(',')[1], 'base64');
      writeFileSync(path.join(dir, `${String(i).padStart(2, '0')}.png`), buf);
      boxes.push(await bbox(buf));
    }
    writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ seed: S.seed, ts: prm.ts, crumple: result.frames.length, roll: result.roll.length, boxes, W: S.texW, H: S.texH }, null, 1));
    console.log(size, all.length, 'frames', `${((Date.now() - started) / 1000).toFixed(1)}s`);
  }
  await browser.close();
  server.close();
}
