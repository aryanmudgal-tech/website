import { writeFileSync } from 'node:fs';
import { paper, tape } from './art.mjs';
import { floorPlan, productionLog, braille, aboutTick } from './drawings.mjs';
const T = { kind: 'torn' };
const plan = paper(144, 124, 37, { t: { ...T, depth: 6 }, l: { ...T, depth: 5 }, r: { kind: 'cut' }, b: { kind: 'cut' } });
const log = paper(200, 92, 71, { t: { ...T, depth: 4, rim: false }, r: { ...T, depth: 4, rim: false }, b: { kind: 'cut' }, l: { kind: 'cut' } });
const br = paper(64, 320, 23, { t: { ...T, depth: 6 }, b: { ...T, depth: 5 } });
const hand = paper(156, 120, 41, { t: { kind: 'cut' }, r: { ...T, depth: 5, rim: false }, b: { ...T, depth: 6, rim: false }, l: { ...T, depth: 4, rim: false } });
const grain = `<filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".62" numOctaves="2" seed="5" stitchTiles="stitch" result="n"/><feColorMatrix in="n" values="0 0 0 0 .1  0 0 0 0 .08  0 0 0 0 .06  0 0 0 .14 0" result="g"/><feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/><feBlend in="gi" in2="SourceGraphic" mode="multiply"/></filter>
<filter id="graphite" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="t"/><feColorMatrix in="t" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 2.0" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter>`;
const sh = 'filter:drop-shadow(0 1px 1.2px rgba(27,26,23,.25))';
const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#FBF8F2">
<svg width="0" height="0" style="position:absolute">${grain}</svg>
<style>.pen{fill:#2B2925}.pen .faint{opacity:.38}.pen .light{opacity:.7}.log .printed{stroke:#2B2925;opacity:.5;fill:none}.log .printed rect{fill:#2B2925;stroke:none}.log .hand{fill:#2B2925;opacity:.88}</style>
<div style="position:relative;width:700px;height:400px">
<div style="position:absolute;left:30px;top:30px;width:144px;height:124px;rotate:-2deg;${sh}"><svg width="144" height="124" viewBox="0 0 144 124" style="position:absolute;inset:0"><path d="${plan.outer}" fill="#FFFDF6"/><path d="${plan.inner}" fill="#D6BC92" filter="url(#grain)"/></svg>
<svg viewBox="0 0 180 140" style="position:absolute;left:8px;top:12px;width:128px;height:100px" class="pen" filter="url(#graphite)"><g filter="url(#graphite)">${floorPlan()}</g></svg></div>
<div style="position:absolute;left:220px;top:30px;width:200px;height:92px;rotate:-2deg;${sh}"><svg width="200" height="92" viewBox="0 0 200 92" style="position:absolute;inset:0"><path d="${log.outer}" fill="#FFFDF6" filter="url(#grain)"/></svg>
<svg viewBox="0 0 200 92" style="position:absolute;inset:0" class="log"><g filter="url(#graphite)">${productionLog()}</g></svg></div>
<div style="position:absolute;left:460px;top:30px;width:64px;height:320px;rotate:.5deg;${sh}"><svg width="64" height="320" viewBox="0 0 64 320" style="position:absolute;inset:0"><path d="${br.outer}" fill="#FFFDF6"/><path d="${br.inner}" fill="#2F9E5B" filter="url(#grain)"/></svg>
<svg viewBox="0 0 64 320" style="position:absolute;inset:0">${braille()}</svg></div>
<div style="position:absolute;left:220px;top:180px;width:156px;height:120px;rotate:-5deg;${sh}"><svg width="156" height="120" viewBox="0 0 156 120" style="position:absolute;inset:0"><path d="${hand.outer}" fill="#FFFDF6" filter="url(#grain)"/></svg>
<div style="position:absolute;left:19px;top:5px;width:118px;height:110px;background:url(../../mocks/paste-up/hand.png) center/contain no-repeat"></div></div>
<div style="position:absolute;left:30px;top:220px;color:#635E55">${[1,2,3,4,5].map(i=>`<svg viewBox="0 0 20 16" width="20" height="16" style="fill:currentColor;display:block;margin:8px 0">${aboutTick(500+i*7)}</svg>`).join('')}</div>
</div>`;
writeFileSync(new URL('./test-draw.html', import.meta.url), html);
