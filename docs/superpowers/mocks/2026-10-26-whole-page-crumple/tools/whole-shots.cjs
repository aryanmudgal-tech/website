// Frame strip of the whole-page crumple: wraps the artifact page in a skeleton, scrolls through runway r1.
const { chromium } = require('/Users/aryanmudgal/.npm/_npx/9833c18b2d85bc59/node_modules/playwright');
const fs = require('fs'), path = require('path');
const exe = '/Users/aryanmudgal/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const dir = path.resolve(__dirname, '../../page-crumple');
const [w, h, runway = 'r1', tag = 'd'] = [...process.argv.slice(2, 4).map(Number), ...process.argv.slice(4)];
(async () => {
  const body = fs.readFileSync(path.join(dir, 'whole-page-crumple.html'), 'utf8');
  fs.writeFileSync(path.join(dir, '_preview.html'), '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0}img{max-width:100%}</style></head><body>' + body + '</body></html>');
  const b = await chromium.launch({ headless: true, executablePath: exe });
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  p.on('pageerror', e => console.log('pageerror', e.message));
  await p.goto('file://' + path.join(dir, '_preview.html'), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const top = await p.evaluate(id => document.getElementById(id).getBoundingClientRect().top + scrollY, runway);
  // runway entry 0% is when its top reaches the viewport bottom
  const start = top - h, out = [];
  for (const q of [-0.3, 0, 0.12, 0.3, 0.45, 0.6, 0.72, 0.85, 1.0, 1.25]) {
    await p.evaluate(y => scrollTo(0, y), Math.round(start + q * h));
    await p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await p.waitForTimeout(120);
    const f = path.join(dir, `_shot-${tag}-${runway}-${String(Math.round(q * 100)).padStart(3, '0')}.png`);
    await p.screenshot({ path: f });
    out.push(f);
  }
  console.log('scrollWidth', await p.evaluate(() => document.documentElement.scrollWidth));
  await b.close();
  console.log(out.join('\n'));
})();
