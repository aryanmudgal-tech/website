import { writeFileSync } from 'node:fs';
import { paper, tape } from './art.mjs';
const T = { kind: 'torn' };
const sky = paper(416, 496, 11, { t: { ...T, depth: 8 }, r: { ...T, depth: 6 }, b: { ...T, depth: 4, rimMax: 2.4 }, l: { ...T, depth: 5, rimMax: 3 } });
const plan = paper(144, 124, 37, { t: { ...T, depth: 6 }, l: { ...T, depth: 5 }, r: { kind: 'cut' }, b: { kind: 'cut' } });
const tp = tape(88, 26, 61);
const grain = `<filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".62" numOctaves="2" seed="5" stitchTiles="stitch" result="n"/><feColorMatrix in="n" values="0 0 0 0 .1  0 0 0 0 .08  0 0 0 0 .06  0 0 0 .14 0" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/><feBlend in="gi" in2="SourceGraphic" mode="multiply"/></filter>`;
const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#FBF8F2">
<svg width="0" height="0" style="position:absolute">${grain}</svg>
<div style="position:relative;width:600px;height:640px">
<svg style="position:absolute;left:40px;top:40px;filter:drop-shadow(0 1px 1.2px rgba(27,26,23,.25))" width="416" height="496" viewBox="0 0 416 496"><path d="${sky.outer}" fill="#FFFDF6"/><path d="${sky.inner}" fill="#9CC8EE" filter="url(#grain)"/></svg>
<svg style="position:absolute;left:380px;top:470px;rotate:-2deg;filter:drop-shadow(0 1px 1.2px rgba(27,26,23,.25))" width="144" height="124" viewBox="0 0 144 124"><path d="${plan.outer}" fill="#FFFDF6"/><path d="${plan.inner}" fill="#D6BC92" filter="url(#grain)"/></svg>
<svg style="position:absolute;left:200px;top:26px;rotate:-3deg" width="88" height="26" viewBox="0 0 88 26"><path d="${tp}" fill="#E8DABD" fill-opacity=".9" filter="url(#grain)"/></svg>
</div>`;
writeFileSync(new URL('./test-tear.html', import.meta.url), html);
console.log(sky.outer.length, sky.inner.length, plan.outer.length);
