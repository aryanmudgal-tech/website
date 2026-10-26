// Builds site/mocks/paste-up.html. All art is generated here from fixed seeds.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { paper, tape, rng } from './art.mjs';
import { floorPlan, productionLog, braille, aboutTick } from './drawings.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, '../../mocks/paste-up.html');

const T = (o = {}) => ({ kind: 'torn', ...o });
const C = (o = {}) => ({ kind: 'cut', ...o });

// ---------- generated paper ----------
const P = {
  sky: paper(416, 496, 11, { t: T({ depth: 8, rimMax: 4.6 }), r: T({ depth: 6, rimMax: 3.4 }), b: T({ depth: 5, rimMax: 2.6 }), l: T({ depth: 5, rimMax: 3.2 }) }),
  braille: paper(64, 320, 23, { t: T({ depth: 6, rimMax: 4 }), b: T({ depth: 6, rimMax: 3.6 }), l: C(), r: C() }),
  plan: paper(144, 124, 37, { t: T({ depth: 6, rimMax: 4.2 }), l: T({ depth: 5, rimMax: 3.4 }), r: C(), b: C() }),
  hand: paper(156, 120, 41, { t: C(), r: T({ depth: 5, rim: false }), b: T({ depth: 6, rim: false }), l: T({ depth: 4, rim: false }) }),
  plateWork: paper(1184, 112, 51, { t: T({ depth: 8, wave: 70, rimMax: 4 }), b: T({ depth: 9, wave: 80, rimMax: 4.4 }), l: C(), r: C() }, 3.0, 0.16),
  plateProjects: paper(1184, 112, 53, { t: T({ depth: 9, wave: 74, rimMax: 4.4 }), b: T({ depth: 7, wave: 64, rimMax: 3.6 }), l: C(), r: C() }, 3.0, 0.16),
  plateRecognition: paper(1184, 112, 57, { t: T({ depth: 7, wave: 66, rimMax: 4 }), b: T({ depth: 9, wave: 84, rimMax: 4.4 }), l: C(), r: C() }, 3.0, 0.16),
  plateAbout: paper(1184, 112, 59, { t: T({ depth: 8, wave: 72, rimMax: 4.2 }), b: T({ depth: 8, wave: 70, rimMax: 4 }), l: C(), r: C() }, 3.0, 0.16),
  log: paper(200, 92, 71, { t: T({ depth: 4, rim: false }), r: T({ depth: 5, rim: false }), b: C(), l: C() }),
  graph: paper(220, 96, 73, { t: C(), r: T({ depth: 5, rim: false }), b: T({ depth: 4, rim: false }), l: C() }),
  band: paper(48, 150, 79, { t: T({ depth: 5, rimMax: 3 }), b: { kind: 'cut', notch: 15, skew: -0.6 }, l: C(), r: C() }),
  slab: paper(1600, 40, 83, { t: T({ depth: 14, wave: 90, turn: 0.3, rimMax: 5.2 }), r: C(), b: C(), l: C() }, 3.0, 0.16),
  sheet: paper(268, 330, 89, { t: C(), r: C(), b: T({ depth: 6, rim: false }), l: C() }),
};
const TAPE = {
  print: tape(88, 26, 61), hand: tape(64, 20, 63), dots: tape(80, 22, 65), pillar: tape(84, 24, 67),
  log: tape(56, 18, 69), graph: tape(52, 18, 75), sheetA: tape(78, 22, 85), sheetB: tape(70, 22, 87),
};

const paperSVG = (w, h, p, stock, extra = '') =>
  `<svg class="paper" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="fibre" d="${p.outer}"/>${stock ? `<path class="stock ${stock}" d="${p.inner}" filter="url(#grain)"/>` : ''}${extra}</svg>`;
const fibreSVG = (w, h, p, fill = '') =>
  `<svg class="paper" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="fibre" d="${p.outer}" filter="url(#grain)"/>${fill ? `<path d="${p.outer}" fill="${fill}"/>` : ''}</svg>`;
const tapeSVG = (cls, w, h, d) =>
  `<svg class="tape ${cls}" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false"><path d="${d}" filter="url(#grain)"/></svg>`;

// Torn ends for CSS tapes behind text: a polygon whose short ends are torn, in px from each end.
function tapePolygon(h, seed) {
  const r = rng(seed);
  const L = [], Rr = [];
  for (let y = 0; y <= h; y += 1.6 + r() * 2.2) {
    L.push(`${(0.6 + r() * 3.4).toFixed(1)}px ${Math.min(h, y).toFixed(1)}px`);
  }
  for (let y = 0; y <= h; y += 1.6 + r() * 2.2) {
    Rr.push(`calc(100% - ${(0.6 + r() * 3.4).toFixed(1)}px) ${Math.min(h, y).toFixed(1)}px`);
  }
  return `polygon(${[...Rr, `calc(100% - 1px) 100%`, `2px 100%`, ...L.reverse()].join(',')})`;
}

// Inline tape behind wrapping text: every line fragment (box-decoration-break: clone) gets two torn
// short ends and a plain middle, so a wrapped tape reads as strips of tape, not as a text selection.
function inlineTape(hex, seed, cap = 8, inset = 0) {
  const r = rng(seed);
  const end = mirror => {
    const pts = [];
    for (let y = 0; y <= 40; y += 3 + r() * 4) pts.push([0.3 + r() * 3.6, Math.min(40, y)]);
    pts.push([0.3 + r() * 3.6, 40]);
    const xs = p => (mirror ? (cap - p[0]) : p[0]).toFixed(1);
    const edge = pts.map(p => `${xs(p)} ${p[1].toFixed(1)}`).join(' L');
    const d = mirror ? `M0 0 L${edge} L0 40Z` : `M${cap} 0 L${edge} L${cap} 40Z`;
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${cap} 40' preserveAspectRatio='none'%3E%3Cpath d='${d}' fill='%23${hex}'/%3E%3C/svg%3E")`;
  };
  const mid = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1' preserveAspectRatio='none'%3E%3Crect width='1' height='1' fill='%23${hex}'/%3E%3C/svg%3E")`;
  const hgt = inset ? `calc(100% - ${2 * inset}px)` : '100%';
  return `${end(false)} left center / ${cap}px ${hgt} no-repeat, ${end(true)} right center / ${cap}px ${hgt} no-repeat, ${mid} center / calc(100% - ${2 * cap - 2}px) ${hgt} no-repeat`;
}

const grainURI =`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.62' numOctaves='2' seed='5' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .1  0 0 0 0 .08  0 0 0 0 .06  0 0 0 .14 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")`;

const ext = (href, label) => `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}<span class="sr-only"> opens in a new tab</span></a>`;
const stub = (href, label, external = true) =>
  external
    ? `<a class="stub" href="${href}" target="_blank" rel="noopener noreferrer">Source: <span class="pub">${label}</span><span class="sr-only"> opens in a new tab</span></a>`
    : `<a class="stub" href="${href}">Source: <span class="pub">${label}</span></a>`;

const SRC = {
  ubLeadership: 'https://www.buffalo.edu/studentlife/life-on-campus/clubs-and-activities/event-calendars/ceremonies-and-celebrations/leadership-awards.html',
  suny: 'https://www.suny.edu/suny-news/press-releases/4-26/4-27-26-3/case.html',
  paper: 'https://drive.google.com/file/d/12K4Mb6QBVbpLYVfUZwRWAKymKw0D9aG-/view',
  linkedin: 'https://www.linkedin.com/in/aryan-mudgal',
  devpostDots: 'https://devpost.com/software/dots-y5r21j',
  githubDots: 'https://github.com/aryanmudgal-tech/dots',
  litos: 'https://github.com/aryanmudgal-tech/Litos',
  github: 'https://github.com/aryanmudgal-tech',
  devpost: 'https://devpost.com/aryanmudgal4493',
};

const nav = [['Work', '#work'], ['Projects', '#projects'], ['Research', '#research'], ['Leadership', '#leadership'], ['Recognition', '#recognition'], ['About', '#about'], ['Contact', '#contact']];

const work = [
  {
    company: 'Linde', role: 'Software Engineer Intern', place: 'Buffalo, NY', period: 'Summer 2026',
    outcome: 'Replaced paper production logging across a plant with an app that saves operators about three hours a day.',
    detail: 'Built and shipped an ASP.NET Core MVC application from scratch. Designed the SQL Server schema, integrated Active Directory sign-in so floor laptops log in automatically, deployed on-prem via IIS, and built an Azure CI/CD pipeline for a second internal tool. In beta at the Palmer, Massachusetts site, slated to scale nationwide.',
    myPart: 'The whole application, from schema to deployment.',
    stubs: [stub(SRC.linkedin, 'LinkedIn'), stub('resume.pdf', 'Resume', false)],
  },
  {
    company: 'Meta Layer Initiative', role: 'Software Engineer Intern', place: 'Remote', period: 'Summer 2025',
    outcome: 'Built the core browser extension: a persistent layer over any webpage where people and AI agents work side by side.',
    detail: "Shipped the extension that the initiative's human-AI collaboration work runs on. Code is private to the initiative.",
    myPart: 'The extension itself.',
    stubs: [stub(SRC.linkedin, 'LinkedIn')],
  },
  {
    company: 'HCLTech', role: 'Technical Analyst Intern', place: 'Dubai, UAE', period: 'May to August 2024',
    outcome: 'Turned 50+ industry reports on AI in the MENA region into a strategy a Fortune 500 client acted on.',
    detail: 'Analyzed 35+ customer journeys to align product localization with regional infrastructure standards, then delivered a 45-minute strategy presentation to C-suite stakeholders that shaped technology investment priorities across MENA markets.',
    myPart: 'The research, the analysis, and the presentation.',
    stubs: [stub(SRC.linkedin, 'LinkedIn'), stub('resume.pdf', 'Resume', false)],
  },
];

const index = [
  ['Dots', '1st, Catalyst for Care track. 3rd, Agentverse track.'],
  ['ARMIE', 'Honorable mention.'],
  ['StreamFair', '1st, Ripple track.'],
  ['W.O.D.', '1st, Best Creation on Moonlake.'],
  ['Safeline', 'Did not place. The demo ran.'],
];

const about = [
  'I do impressions, mostly Bollywood, on request.',
  'Army kid: ten schools before university. Pune from 2020 to 2023, Buffalo since 2023.',
  'Golf handicap 20. Badminton most weeks.',
  'Geopolitics and public speaking, when nobody stops me.',
  `Building Litos, a Chrome extension on the Chrome Web Store that shows what each Claude message costs you. ${ext(SRC.litos, 'GitHub')}`,
];

const css = String.raw`
:root {
  --paper:#FBF8F2; --paper-2:#F3EDE1; --ink:#1B1A17; --ink-2:#45413A; --muted:#635E55; --line:#DDD5C6;
  --accent:#005BBB; --on-accent:#FFFFFF;
  --on-stock:#1B1A17; --fibre:#FFFDF6; --pencil:#2B2925;
  --stock-marigold:#F2A516; --stock-vermilion:#EC5B3B; --stock-sky:#9CC8EE;
  --stock-leaf:#2F9E5B; --stock-kraft:#D6BC92; --stock-ub:#005BBB;
  --tape:#E9DDC2;
  --slab:#1B1A17; --on-slab:#FFFDF6; --slab-muted:#CFC8BA; --slab-link:#9CC8EE;
  --lift: rgba(27,26,23,.26); --lift-far: rgba(27,26,23,.12);
  --grain: ${grainURI};
  --serif: "Source Serif 4", Georgia, serif;
  --sans: "Instrument Sans", system-ui, sans-serif;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper:#161512; --paper-2:#201E1A; --ink:#F2EDE3; --ink-2:#CFC8BA; --muted:#A39C8E; --line:#3A362F;
    --accent:#7DB0FF; --on-accent:#0B1220;
    --slab:#25231F;
    --lift: rgba(0,0,0,.6); --lift-far: rgba(0,0,0,.35);
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --paper:#161512; --paper-2:#201E1A; --ink:#F2EDE3; --ink-2:#CFC8BA; --muted:#A39C8E; --line:#3A362F;
  --accent:#7DB0FF; --on-accent:#0B1220;
  --slab:#25231F;
  --lift: rgba(0,0,0,.6); --lift-far: rgba(0,0,0,.35);
  color-scheme: dark;
}

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; scroll-padding-top: 72px; }
body {
  margin: 0; background: var(--paper); color: var(--ink);
  font: 400 18px/28px var(--serif); font-optical-sizing: auto;
  font-variant-numeric: tabular-nums lining-nums;
  -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
  overflow-x: clip;
}
img { display: block; max-width: 100%; }
a { color: var(--accent); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
a:focus-visible, button:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
p { margin: 0; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.wrap { width: 100%; max-width: 1280px; margin-inline: auto; padding-inline: 48px; }
.defs { position: absolute; width: 0; height: 0; overflow: hidden; }

/* ---------- paper ---------- */
.paper { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.paper .fibre { fill: var(--fibre); }
.s-sky { fill: var(--stock-sky); } .s-leaf { fill: var(--stock-leaf); } .s-kraft { fill: var(--stock-kraft); }
.s-vermilion { fill: var(--stock-vermilion); } .s-marigold { fill: var(--stock-marigold); } .s-ub { fill: var(--stock-ub); }
.tape { position: absolute; overflow: visible; z-index: 3; }
.tape path { fill: var(--tape); fill-opacity: .9; }
.tape--verm path { fill: var(--stock-vermilion); fill-opacity: .55; }
.pencil { fill: var(--pencil); }
.pencil .faint { opacity: .36; } .pencil .light { opacity: .72; }
.pencil .stk { fill: none; stroke: var(--pencil); stroke-width: 1.05; stroke-linecap: round; }
.log .printed { stroke: var(--pencil); fill: none; opacity: .46; }
.log .printed rect { fill: var(--pencil); stroke: none; }
.log .hand { fill: var(--pencil); opacity: .86; }

/* ---------- nav ---------- */
.nav { position: sticky; top: 0; z-index: 40; background: var(--paper); border-bottom: 1px solid var(--ink); }
.nav__in { height: 56px; display: flex; align-items: center; justify-content: space-between; }
.nav__name { font: 600 20px/24px var(--serif); color: var(--ink); text-decoration: none; letter-spacing: -.005em; }
.nav__links { display: flex; gap: 26px; list-style: none; margin: 0; padding: 0; }
.nav__links a { position: relative; display: block; font: 400 15px/20px var(--sans); color: var(--ink); text-decoration: none; }
.nav__links a:hover { text-decoration: underline; text-underline-offset: 6px; }
.nav__links a[aria-current] { font-weight: 600; }
.nav__links a[aria-current]::after { content: ""; position: absolute; left: 0; right: 0; bottom: -9px; height: 3px; background: var(--ink); }
.menu-button { display: none; width: 64px; height: 36px; border: 1px solid var(--ink); background: var(--paper); color: var(--ink); font: 600 14px/1 var(--sans); border-radius: 0; cursor: pointer; }
.menu { margin: 0; inset: 52px 16px auto auto; border: 1px solid var(--ink); background: var(--paper); color: var(--ink); padding: 8px 0; min-width: 200px; }
.menu ul { list-style: none; margin: 0; padding: 0; }
.menu a { display: block; padding: 10px 18px; font: 500 16px/20px var(--sans); color: var(--ink); text-decoration: none; }

/* ---------- hero ---------- */
.hero { display: grid; grid-template-columns: 672px 1fr; column-gap: 48px; padding-top: 40px; padding-bottom: 0; }
.hero__facts { min-width: 0; }
h1 { margin: 0; font: 600 72px/72px var(--serif); font-variation-settings: "opsz" 60; letter-spacing: -.02em; }
.tb { margin: 20px 0 0; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink); }
.tb__row { display: grid; grid-template-columns: 80px 1fr; padding: 9px 0; }
.tb__row + .tb__row { border-top: 1px solid var(--line); }
.tb dt { font: 600 11.5px/16px var(--sans); text-transform: uppercase; letter-spacing: .1em; color: var(--muted); padding-top: 5px; }
.tb dd { margin: 0; font: 400 17px/25px var(--serif); }
.tb .short { display: none; }
mark.tape-sky {
  background: ${inlineTape('9CC8EE', 3131, 8, 1)};
  color: var(--on-stock); padding: 0 .42em; margin-inline: -.2em;
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
}
.ledger { list-style: none; margin: 22px 0 0; padding: 0; border-top: 2px solid var(--ink); border-bottom: 2px solid var(--ink); }
.ledger li { display: grid; grid-template-columns: 168px minmax(0, 1fr); column-gap: 24px; padding: 12px 0; align-items: baseline; }
.ledger li + li { border-top: 1px solid var(--line); }
.fig { font: 600 34px/40px var(--serif); font-variation-settings: "opsz" 40; white-space: nowrap; color: var(--ink); text-decoration: none; justify-self: start; letter-spacing: -.01em; }
.fig:hover { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 6px; }
.fig--tape { position: relative; z-index: 0; color: var(--on-stock); padding: 0 8px; margin-left: -8px; }
.fig--tape::before {
  content: ""; position: absolute; inset: -3px -6px; z-index: -1;
  background: var(--stock-marigold) var(--grain); background-blend-mode: multiply;
  rotate: -1.5deg;
  clip-path: ${tapePolygon(46, 4242)};
}
.fig--tape:focus-visible { outline: 3px solid var(--on-stock); outline-offset: 2px; box-shadow: 0 0 0 8px var(--fibre); }
.claim { font: 400 16px/22px var(--sans); }
.claim strong { font-weight: 600; }
.actions { display: flex; gap: 16px; margin-top: 24px; }
.btn { display: inline-flex; align-items: center; height: 48px; padding: 0 22px; background: var(--accent); color: var(--on-accent); font: 600 16px/20px var(--sans); text-decoration: none; }
.btn:hover { text-decoration: underline; text-underline-offset: 4px; }
.stub--resume { display: inline-flex; align-items: center; height: 48px; padding: 0 18px 0 20px; border: 1px solid var(--ink); border-left: 2px dashed var(--ink); background: var(--paper); color: var(--accent); font: 600 15px/20px var(--sans); }

/* the collage */
.hero-art { position: relative; width: 464px; height: 640px; margin-top: -24px; isolation: isolate; }
.print { position: absolute; inset: 0; margin: 0; z-index: 3; }
.print__frame { position: absolute; left: 64px; top: 52px; width: 356px; height: 440px; padding: 10px; background: var(--fibre); rotate: 1.2deg;
  box-shadow: 0 1px 1.5px var(--lift), 0 10px 22px -12px var(--lift); }
.print__frame img { width: 336px; height: 420px; object-fit: cover; object-position: 52% 50%; }
.print__frame .tape { width: 88px; height: 26px; left: 134px; top: -13px; rotate: -3deg; }
.print figcaption { position: absolute; left: 72px; top: 540px; width: 224px; font: 400 13px/19px var(--sans); color: var(--muted); }
.collage { position: absolute; inset: 0; pointer-events: none; }
.piece { position: absolute; filter: drop-shadow(0 1px 1px var(--lift)) drop-shadow(0 6px 10px var(--lift-far)); }
.p-sky { left: 24px; top: 28px; width: 416px; height: 496px; z-index: 1; filter: drop-shadow(0 1px 1px var(--lift)); }
.p-braille { left: -8px; top: 308px; width: 64px; height: 320px; z-index: 2; }
.p-plan { left: 312px; top: 488px; width: 144px; height: 124px; z-index: 4; }
.p-hand { left: 308px; top: 0; width: 156px; height: 120px; z-index: 5; }
.p-braille .dots, .p-plan .art { position: absolute; }
.p-braille .dots { inset: 0; width: 100%; height: 100%; }
.p-plan .art { left: 9px; top: 14px; width: 128px; height: 100px; }
.p-hand .crop { position: absolute; left: 19px; top: 6px; width: 118px; height: 110px; background: url(paste-up/hand.png) 50% 50% / contain no-repeat; }
.p-hand .tape { width: 64px; height: 20px; left: -20px; top: 2px; rotate: -20deg; }

/* signature: pasted up in front of you */
.collage .piece {
  rotate: var(--r);
  transition:
    translate 560ms cubic-bezier(.16,1,.3,1) var(--d, 0ms),
    rotate 560ms cubic-bezier(.16,1,.3,1) var(--d, 0ms),
    opacity 180ms linear var(--d, 0ms);
}
.collage .p-sky     { --r: -1deg; --d: 120ms; }
.collage .p-braille { --r: .5deg; --d: 300ms; }
.collage .p-plan    { --r: -2deg; --d: 480ms; }
.collage .p-hand    { --r: -5deg; --d: 660ms; }
@media (prefers-reduced-motion: no-preference) {
  @starting-style {
    .collage .piece { opacity: 0; translate: 0 -12px; rotate: calc(var(--r) + 3deg); }
  }
}

/* ---------- sections and plates ---------- */
.section { padding-top: 96px; }
.plate { position: relative; height: 112px; }
.plate__clip { position: absolute; inset: 0; overflow: hidden; }
.plate__paper { position: absolute; left: 0; top: 0; width: 1184px; height: 100%; filter: drop-shadow(0 1px .8px var(--lift)); }
.plate .scrap { position: absolute; z-index: 2; filter: drop-shadow(0 1px 1px var(--lift)) drop-shadow(0 4px 8px var(--lift-far)); }
.scrap--log { left: 64px; top: -7px; width: 200px; height: 92px; rotate: -2deg; }
.scrap--log .art { position: absolute; inset: 0; width: 100%; height: 100%; }
.scrap--log .tape { width: 56px; height: 18px; right: -18px; top: -5px; rotate: 24deg; }
.scrap--arena { right: 48px; top: 27px; width: 420px; height: 92px; rotate: 1deg; padding: 4px; background: var(--fibre); }
.scrap--arena .duo { width: 100%; height: 100%; background: var(--stock-vermilion); overflow: hidden; }
.scrap--arena img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; mix-blend-mode: multiply; opacity: .9; }
.scrap--graph { left: 72px; top: -9px; width: 220px; height: 96px; rotate: 2deg; }
.scrap--graph .tape { width: 52px; height: 18px; left: 84px; top: -8px; rotate: -4deg; }
.band { position: absolute; left: 68%; top: -10px; width: 48px; height: calc(100% + 24px); z-index: 2; rotate: .8deg; filter: drop-shadow(0 1px 1px var(--lift)) drop-shadow(0 5px 8px var(--lift-far)); }
h2 { margin: 32px 0 48px; font: 400 44px/50px var(--serif); font-variation-settings: "opsz" 48; letter-spacing: -.012em; max-width: 900px; text-wrap: balance; }
h3 { margin: 0; font: 600 26px/32px var(--serif); font-variation-settings: "opsz" 32; letter-spacing: -.008em; }

.stubs { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
a.stub { display: inline-flex; align-items: center; gap: .3em; height: 30px; padding: 0 12px 0 14px; border: 1px solid var(--ink); border-left: 2px dashed var(--ink); background: var(--paper); color: var(--accent); font: 500 13px/18px var(--sans); text-decoration: none; }
a.stub .pub { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.my-part strong { font-weight: 600; }

/* work */
.row { display: grid; grid-template-columns: 200px 600px; column-gap: 40px; align-items: start; }
.row + .row { margin-top: 48px; padding-top: 48px; border-top: 1px solid var(--line); }
.meta { display: grid; gap: 4px; align-content: start; font: 400 14px/20px var(--sans); color: var(--muted); text-wrap: balance; }
.meta > span { text-wrap: balance; }
.meta .co { font: 600 22px/28px var(--serif); color: var(--ink); margin-bottom: 2px; }
.meta .role { color: var(--ink-2); }
.body > * + * { margin-top: 16px; }
.row h3 { font-size: 24px; line-height: 32px; }

/* projects */
.lede { margin: -24px 0 40px; max-width: 640px; font: 400 20px/30px var(--serif); color: var(--ink-2); }
.index { list-style: none; margin: 0; padding: 0; max-width: 784px; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink); }
.index li { display: grid; grid-template-columns: 160px 1fr; padding: 10px 0; align-items: baseline; }
.index li + li { border-top: 1px solid var(--line); }
.index .nm { font: 600 18px/26px var(--serif); }
.index .rs { font: 400 17px/26px var(--serif); color: var(--ink-2); }
.card { display: grid; grid-template-columns: 200px 600px 304px; column-gap: 40px; align-items: start; margin-top: 64px; }
.result { margin-top: 8px !important; font: 600 18px/26px var(--serif); text-wrap: balance; }
.tape-mari { background: ${inlineTape('F2A516', 5151)}; color: var(--on-stock); padding: .1em .5em; margin-left: -.18em; -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.demo { margin: 24px 0 0; }
.demo__mat { position: relative; padding: 12px; background: var(--stock-vermilion) var(--grain); background-blend-mode: multiply; }
.demo__poster { position: relative; display: block; }
.demo__poster img { width: 576px; height: 324px; object-fit: cover; }
.demo__play { position: absolute; left: 50%; top: 50%; width: 56px; height: 56px; margin: -28px 0 0 -28px; border-radius: 50%; background: var(--fibre); display: grid; place-items: center; box-shadow: 0 1px 2px rgba(27,26,23,.3); }
.demo__badge { position: absolute; left: 12px; top: 12px; padding: 3px 8px; background: var(--fibre); color: var(--on-stock); font: 600 12px/16px var(--sans); }
.demo figcaption { margin-top: 10px; font: 400 13px/19px var(--sans); color: var(--muted); }
.aside { position: relative; font: italic 400 18px/28px var(--serif); color: var(--ink-2); padding-left: 0; }
.aside svg { position: absolute; left: -20px; top: 2px; width: 12px; height: calc(100% - 4px); overflow: visible; }
.aside path { fill: none; stroke: var(--muted); stroke-width: 1.2; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.margin-print { margin: 0; }
.mp__frame { position: relative; padding: 10px; background: var(--fibre); box-shadow: 0 1px 1.5px var(--lift), 0 10px 20px -12px var(--lift); }
.mp__frame img { width: 100%; height: auto; }
.mp__frame .tape { left: calc(50% - 40px); top: -10px; width: 80px; height: 22px; rotate: 2deg; }
.margin-print figcaption { margin-top: 14px; font: 400 13px/19px var(--sans); color: var(--muted); }
.card--dots .mp__frame { rotate: -1.2deg; }

/* recognition */
.award__line { font: 400 22px/30px var(--serif); text-wrap: balance; }
.award__fig { font: 600 64px/64px var(--serif); font-variation-settings: "opsz" 60; letter-spacing: -.02em; color: var(--ink); margin-right: 6px; }
.award__den { font-style: italic; color: var(--ink-2); }
.card--award { margin-top: 0; }
.card--award .mp__frame { rotate: 1deg; }
.card--award .mp__frame .tape { rotate: -2.5deg; left: calc(50% - 42px); width: 84px; height: 24px; }
.card--award h3 { margin-top: 18px; }

/* about */
.lines { list-style: none; margin: 0; padding: 0; max-width: 760px; }
.lines li { display: grid; grid-template-columns: 32px 1fr; padding: 12px 0; border-top: 1px solid var(--line); font: 400 22px/32px var(--serif); }
.lines li:last-child { border-bottom: 1px solid var(--line); }
.lines svg { width: 20px; height: 16px; margin-top: 8px; fill: var(--muted); overflow: visible; }

/* footer */
.foot { margin-top: 120px; position: relative; color: var(--on-slab); }
.foot__tear { position: relative; height: 40px; overflow: hidden; }
.foot__tear svg { position: absolute; left: 50%; bottom: -1px; width: 1600px; height: 40px; translate: -50% 0; }
.foot__tear .fibre { fill: var(--fibre); }
.foot__tear .stock { fill: var(--slab); }
.foot__slab { background: var(--slab); padding: 40px 0 72px; margin-top: -1px; }
.foot__in { display: grid; grid-template-columns: minmax(0, 1fr) 300px; column-gap: 64px; align-items: start; }
.foot h2 { margin: 0 0 28px; color: var(--on-slab); }
.foot a { color: var(--slab-link); }
.foot a:focus-visible { outline-color: var(--slab-link); }
.foot__email { overflow-wrap: anywhere; font: 400 34px/44px var(--serif); font-variation-settings: "opsz" 40; letter-spacing: -.01em; }
.foot__links { display: flex; flex-wrap: wrap; gap: 10px 28px; list-style: none; margin: 28px 0 0; padding: 0; font: 500 16px/22px var(--sans); }
.sheet { margin: 0; }
.sheet__paper { position: relative; width: 268px; height: 330px; rotate: -1.6deg; filter: drop-shadow(0 1px 1px rgba(0,0,0,.4)) drop-shadow(0 10px 16px rgba(0,0,0,.35)); }
.sheet__paper .drawing { position: absolute; left: 14px; top: 10px; width: 240px; height: 300px; background: url(paste-up/portrait.png) 50% 50% / contain no-repeat; }
.sheet__paper .tape--a { width: 78px; height: 22px; left: -14px; top: 10px; rotate: -32deg; }
.sheet__paper .tape--b { width: 70px; height: 22px; right: -12px; top: 8px; rotate: 28deg; }
.sheet figcaption { margin-top: 18px; font: 400 13px/19px var(--sans); color: var(--slab-muted); max-width: 268px; }

/* mock chrome */
.mock-pill { position: fixed; right: 12px; bottom: 12px; z-index: 60; display: flex; align-items: center; gap: 6px; padding: 4px 4px 4px 12px; background: var(--paper); color: var(--ink); border: 1px solid var(--ink); border-radius: 999px; font: 500 12px/16px var(--sans); box-shadow: 0 2px 8px var(--lift-far); }
.mock-pill button { height: 26px; padding: 0 10px; border: 1px solid transparent; border-radius: 999px; background: transparent; color: var(--ink); font: 600 12px/1 var(--sans); cursor: pointer; }
.mock-pill button[aria-pressed="true"] { background: var(--ink); color: var(--paper); }

/* ---------- between ---------- */
@media (max-width: 1279px) {
  .hero { grid-template-columns: minmax(0, 1fr) 464px; }
  .card { grid-template-columns: 200px minmax(0, 1fr) 260px; }
  .demo__poster img { width: 100%; height: auto; aspect-ratio: 16 / 9; }
}
@media (max-width: 1100px) {
  .wrap { padding-inline: 32px; }
  .hero { grid-template-columns: minmax(0, 1fr) 360px; column-gap: 40px; }
  .hero-art { zoom: .776; margin-top: 0; }
  .ledger li { grid-template-columns: 136px minmax(0, 1fr); column-gap: 16px; }
  .fig { font-size: 28px; line-height: 34px; }
  .print figcaption { font-size: 16px; line-height: 23px; }
  .row { grid-template-columns: 180px minmax(0, 1fr); }
  .card { grid-template-columns: 180px minmax(0, 1fr); }
  .card .margin-print { grid-column: 2; margin-top: 32px; max-width: 304px; }
  .foot__in { column-gap: 40px; }
  .foot__email { font-size: 26px; line-height: 34px; }
}

@media (max-width: 899px) {
  .nav__links { display: none; }
  .menu-button { display: block; }
  .hero { grid-template-columns: minmax(0, 1fr); }
  .hero-art { zoom: 1; margin: 48px auto 0; }
  .print figcaption { font-size: 13px; line-height: 19px; }
}

/* ---------- phone ---------- */
@media (max-width: 760px) {
  .wrap { padding-inline: 16px; }
  .nav__in { height: 52px; }
  .nav__name { font-size: 18px; line-height: 22px; }
  .hero { grid-template-columns: minmax(0, 1fr); padding-top: 20px; padding-bottom: 0; }
  h1 { font-size: 40px; line-height: 44px; }
  .tb .long { display: none; } .tb .short { display: inline; }
  .tb__row { grid-template-columns: 64px 1fr; }
  .tb dt { font-size: 11px; line-height: 14px; padding-top: 4px; }
  .tb dd { font-size: 15px; line-height: 21px; }
  .ledger { margin-top: 16px; }
  .ledger li { grid-template-columns: 96px minmax(0, 1fr); column-gap: 12px; }
  .fig { font-size: 22px; line-height: 26px; }
  .fig--tape { padding: 0 6px; margin-left: -4px; }
  .fig--tape::before { inset: -2px -3px; }
  .claim { font-size: 15px; line-height: 21px; }
  .actions { gap: 12px; margin-top: 16px; }
  .actions > a { flex: 1; justify-content: center; padding-inline: 10px; }
  .hero-art { width: 358px; height: 420px; margin: 32px auto 0; }
  .p-sky { left: 29px; top: 16px; width: 300px; height: 320px; }
  .print__frame { left: 69px; top: 28px; width: 220px; height: 275px; padding: 8px; }
  .print__frame img { width: 204px; height: 259px; }
  .print__frame .tape { width: 70px; height: 21px; left: 75px; top: -11px; }
  .print figcaption { left: 29px; top: 350px; width: 300px; }
  .p-hand { left: 226px; top: 0; width: 132px; height: 102px; }
  .p-hand .crop { left: 15px; top: 4px; width: 102px; height: 94px; }
  .p-hand .tape { width: 52px; height: 17px; left: -16px; top: 0; }
  .p-braille { left: 0; top: 120px; width: 48px; height: 220px; }
  .p-plan { left: 250px; top: 250px; width: 104px; height: 90px; }
  .p-plan .art { left: 6px; top: 10px; width: 92px; height: 72px; }
  .section { padding-top: 72px; }
  .plate { height: 72px; }
  .scrap--log { left: 20px; top: -5px; width: 120px; height: 56px; }
  .scrap--log .tape { width: 40px; height: 14px; right: -12px; top: -4px; }
  .scrap--arena { right: 16px; top: 20px; width: 180px; height: 56px; padding: 3px; }
  .scrap--graph { left: 24px; top: -6px; width: 140px; height: 60px; }
  .scrap--graph .tape { width: 40px; height: 14px; left: 50px; top: -6px; }
  .band { left: 68%; width: 32px; top: -8px; height: calc(100% + 18px); }
  h2 { font-size: 30px; line-height: 34px; margin: 24px 0 32px; }
  h3 { font-size: 22px; line-height: 28px; }
  .row h3 { font-size: 21px; line-height: 28px; }
  body { font-size: 17px; line-height: 26px; }
  .row, .card { grid-template-columns: minmax(0, 1fr); row-gap: 16px; }
  .row + .row { margin-top: 32px; padding-top: 32px; }
  .meta { grid-auto-flow: row; }
  .lede { margin: -12px 0 28px; font-size: 18px; line-height: 27px; }
  .index li { grid-template-columns: 112px 1fr; }
  .index .nm { font-size: 17px; }
  .index .rs { font-size: 16px; line-height: 24px; }
  .card { margin-top: 48px; }
  .card .margin-print { grid-column: auto; margin-top: 16px; max-width: none; }
  .card--dots .mp__frame, .card--award .mp__frame { rotate: 0deg; }
  .result { font-size: 17px; line-height: 24px; }
  .demo__poster img { width: 100%; height: auto; aspect-ratio: 16 / 9; }
  .demo__mat { padding: 8px; }
  .demo__play { width: 48px; height: 48px; margin: -24px 0 0 -24px; }
  .aside { margin-left: 20px; }
  .award__fig { font-size: 44px; line-height: 44px; }
  .award__line { font-size: 18px; line-height: 26px; }
  .lines li { font-size: 19px; line-height: 28px; grid-template-columns: 30px 1fr; }
  .lines svg { margin-top: 6px; }
  .foot { margin-top: 88px; }
  .foot__in { grid-template-columns: minmax(0, 1fr); row-gap: 48px; }
  .foot__email { font-size: 22px; line-height: 30px; word-break: break-word; }
  .foot__slab { padding-bottom: 88px; }
  .sheet { justify-self: center; }
}
@media (max-width: 760px) {
  .mock-pill { right: 8px; bottom: 8px; padding: 3px 3px 3px 10px; font-size: 11px; }
  .mock-pill button { height: 22px; padding: 0 8px; font-size: 11px; }
  .pill-name { display: none; }
}
@media (max-width: 380px) {
  .hero-art { zoom: .915; }
}
@media (max-width: 345px) {
  .hero-art { zoom: .8; }
}
`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Aryan Mudgal, Paste-Up mockup</title>
<meta name="description" content="Design mockup of the Paste-Up direction for Aryan Mudgal's portfolio.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..700&display=swap" rel="stylesheet">
<script>(function(){var t=new URLSearchParams(location.search).get('theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);})();</script>
<style>${css}</style>
</head>
<body>
<svg class="defs" aria-hidden="true" focusable="false">
  <filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency=".62" numOctaves="2" seed="5" stitchTiles="stitch" result="n"/>
    <feColorMatrix in="n" values="0 0 0 0 .1  0 0 0 0 .08  0 0 0 0 .06  0 0 0 .14 0" result="g"/>
    <feComposite in="g" in2="SourceGraphic" operator="in" result="gi"/>
    <feBlend in="gi" in2="SourceGraphic" mode="multiply"/>
  </filter>
  <filter id="graphite" x="-4%" y="-4%" width="108%" height="108%">
    <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="t"/>
    <feColorMatrix in="t" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 2.0" result="m"/>
    <feComposite in="SourceGraphic" in2="m" operator="in"/>
  </filter>
  <pattern id="graph" width="60" height="60" patternUnits="userSpaceOnUse">
    <path d="M12 0V60M24 0V60M36 0V60M48 0V60M0 12H60M0 24H60M0 36H60M0 48H60" stroke="#D3E3F0" stroke-width=".6" fill="none"/>
    <path d="M0 0V60M0 0H60" stroke="#A9C7E0" stroke-width=".9" fill="none"/>
  </pattern>
</svg>

<header class="nav">
  <div class="wrap nav__in">
    <a class="nav__name" href="#top">Aryan Mudgal</a>
    <nav aria-label="Primary">
      <ul class="nav__links" role="list">${nav.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul>
    </nav>
    <button class="menu-button" type="button" popovertarget="site-menu">Menu</button>
    <nav id="site-menu" class="menu" popover aria-label="Menu">
      <ul role="list">${nav.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul>
    </nav>
  </div>
</header>

<main id="top">
  <section class="wrap hero" aria-labelledby="name">
    <div class="hero__facts">
      <h1 id="name">Aryan Mudgal</h1>
      <dl class="tb">
        <div class="tb__row"><dt>Study</dt><dd><span class="long">B.S. Computer Science, University at Buffalo, December 2026, GPA 3.93.</span><span class="short">CS, University at Buffalo, Dec 2026.</span></dd></div>
        <div class="tb__row"><dt>Work</dt><dd><span class="long">Software Engineer Intern at Linde, Summer 2026; before that Meta Layer Initiative (2025) and HCLTech, Dubai (2024).</span><span class="short">SWE Intern, Linde, 2026.</span></dd></div>
        <div class="tb__row"><dt>Next</dt><dd><span class="long"><mark class="tape-sky">Seeking new-grad software or forward-deployed engineering roles from January 2027.</mark> New York City, open to relocation.</span><span class="short"><mark class="tape-sky">Seeking new-grad SWE roles from Jan 2027.</mark> NYC, open to relocation.</span></dd></div>
      </dl>
      <ol class="ledger" role="list">
        <li><a class="fig fig--tape" href="#recognition-pillar">1 of 2</a><p class="claim"><strong>Award for Innovative Student Leadership, University at Buffalo, April 2026.</strong> ${ext(SRC.ubLeadership, 'Source: UB Student Life')}</p></li>
        <li><a class="fig" href="#recognition-chancellor">1 of 15</a><p class="claim">SUNY Chancellor's Award for Student Excellence, April 2026. ${ext(SRC.suny, 'Source: SUNY')}</p></li>
        <li><a class="fig" href="#research">Co-author</a><p class="claim">DE-C3, a deep-learning Kleihauer-Betke test for fetomaternal hemorrhage, accepted at MIDL 2025. ${ext(SRC.paper, 'Source: Paper, PDF')}</p></li>
      </ol>
      <div class="actions">
        <a class="btn" href="mailto:aryanmudgal4493@gmail.com">Email Aryan</a>
        <a class="stub--resume" href="resume.pdf">Resume (PDF)</a>
      </div>
    </div>

    <div class="hero-art">
      <figure class="print">
        <div class="print__frame">
          <img src="img/full-pillar.jpg" width="1195" height="793" alt="Aryan holding the Pillar of Leadership plaque for the Innovative Student Leadership Award in front of a University at Buffalo backdrop" loading="eager" fetchpriority="high" decoding="async">
          ${tapeSVG('', 88, 26, TAPE.print)}
        </div>
        <figcaption>University at Buffalo, April 2026. Award for Innovative Student Leadership. ${ext(SRC.ubLeadership, 'Source: UB Student Life')}</figcaption>
      </figure>
      <div class="collage" aria-hidden="true">
        <div class="piece p-sky">${paperSVG(416, 496, P.sky, 's-sky')}</div>
        <div class="piece p-braille">${paperSVG(64, 320, P.braille, 's-leaf')}<svg class="dots" viewBox="0 0 64 320" focusable="false">${braille()}</svg></div>
        <div class="piece p-plan">${paperSVG(144, 124, P.plan, 's-kraft')}<svg class="art pencil" viewBox="0 0 180 140" focusable="false"><g filter="url(#graphite)">${floorPlan()}</g></svg></div>
        <div class="piece p-hand">${fibreSVG(156, 120, P.hand)}<div class="crop"></div>${tapeSVG('', 64, 20, TAPE.hand)}</div>
      </div>
    </div>
  </section>

  <section id="work" class="wrap section" aria-labelledby="work-title">
    <div class="plate plate--work" aria-hidden="true">
      <div class="plate__clip">
        <svg class="plate__paper" viewBox="0 0 1184 112" preserveAspectRatio="none" focusable="false"><path class="fibre" d="${P.plateWork.outer}" style="fill:var(--fibre)"/><path class="s-sky" d="${P.plateWork.inner}" filter="url(#grain)"/></svg>
      </div>
        <div class="scrap scrap--log">${fibreSVG(200, 92, P.log)}<svg class="art log" viewBox="0 0 200 92" focusable="false"><g filter="url(#graphite)">${productionLog()}</g></svg>${tapeSVG('', 56, 18, TAPE.log)}</div>
    </div>
    <h2 id="work-title">Three summers, one app that replaced paper on a plant floor</h2>
    ${work.map(j => `<article class="row">
      <div class="meta"><span class="co">${j.company}</span><span class="role">${j.role}</span><span>${j.place}</span><span>${j.period}</span></div>
      <div class="body">
        <h3>${j.outcome}</h3>
        <p>${j.detail}</p>
        <p class="my-part"><strong>My part.</strong> ${j.myPart}</p>
        <div class="stubs">${j.stubs.join('')}</div>
      </div>
    </article>`).join('\n    ')}
  </section>

  <section id="projects" class="wrap section" aria-labelledby="projects-title">
    <div class="plate plate--projects" aria-hidden="true">
      <div class="plate__clip">
        <svg class="plate__paper" viewBox="0 0 1184 112" preserveAspectRatio="none" focusable="false"><path d="${P.plateProjects.outer}" style="fill:var(--fibre)"/><path class="s-vermilion" d="${P.plateProjects.inner}" filter="url(#grain)"/></svg>
      </div>
        <div class="scrap scrap--arena"><div class="duo"><img src="paste-up/arena-ink.jpg" width="840" height="184" alt="" loading="lazy" decoding="async"></div></div>
    </div>
    <h2 id="projects-title">What I built in a day at UCLA, MIT, CMU and Stanford</h2>
    <p class="lede">Hackathon builds, each finished in a day or two and shown to judges. Team size and my part are stated on every card.</p>
    <ol class="index" role="list">
      ${index.map(([n, r]) => `<li><span class="nm">${n}</span><span class="rs">${r}</span></li>`).join('\n      ')}
    </ol>
    <article id="project-dots" class="card card--dots">
      <div class="meta"><span>LA Hacks, UCLA</span><span>April 2026</span><span>307 projects</span><span>Team: Ayush Srivastava, Manav Sharma, Abhi Ramtel.</span></div>
      <div class="body">
        <h3>Dots</h3>
        <p class="result"><span class="tape-mari">1st, Catalyst for Care track. 3rd, Agentverse track.</span></p>
        <p>An iOS app built in 20 hours that turns floor plans or LiDAR room scans into Braille tactile maps and lets a blind user ask an AI voice agent about the space. On-device LiDAR scanning in Swift; a printable map for under 50 dollars instead of a compliance bill in the thousands.</p>
        <figure class="demo">
          <div class="demo__mat">
            <a class="demo__poster" href="https://www.youtube.com/watch?v=gWNJgLeBlTY" target="_blank" rel="noopener noreferrer">
              <img src="paste-up/dots-poster.jpg" width="1029" height="579" alt="Video: Dots demo: a LiDAR scan becomes a Braille map and answers questions by voice." loading="lazy" decoding="async">
              <span class="demo__play" aria-hidden="true"><svg width="20" height="22" viewBox="0 0 20 22" focusable="false"><path d="M3 2.2 18 11 3 19.8Z" fill="#1B1A17"/></svg></span>
              <span class="demo__badge" aria-hidden="true">Plays when in view</span>
              <span class="sr-only"> opens in a new tab on YouTube</span>
            </a>
          </div>
          <figcaption>Dots demo: a LiDAR scan becomes a Braille map and answers questions by voice.</figcaption>
        </figure>
        <p class="my-part"><strong>My part.</strong> The iOS app and its full pipeline, the voice agent, and the backend that generates the Braille-map STL.</p>
        <p class="aside"><svg viewBox="0 0 12 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M10 2 C4 2 4 8 4 14 L4 40 C4 46 2 48 0 50 C2 52 4 54 4 60 L4 86 C4 92 4 98 10 98" filter="url(#graphite)"/></svg>One blind user tested it before the demo: my cousin.</p>
        <div class="stubs">${stub(SRC.devpostDots, 'Devpost')}${stub(SRC.githubDots, 'GitHub')}</div>
      </div>
      <figure class="margin-print">
        <div class="mp__frame">
          <img src="img/dots.jpg" width="993" height="662" alt="Team Dots holding two award boxes and a shirt under the LA Hacks 2026 banner at Pauley Pavilion" loading="lazy" decoding="async">
          ${tapeSVG('tape--verm', 80, 22, TAPE.dots)}
        </div>
        <figcaption>LA Hacks, UCLA, April 2026. Team Dots with two track awards. ${ext(SRC.devpostDots, 'Source: Devpost')}</figcaption>
      </figure>
    </article>
  </section>

  <section id="recognition" class="wrap section" aria-labelledby="recognition-title">
    <div class="plate plate--recognition" aria-hidden="true">
      <div class="plate__clip">
        <svg class="plate__paper" viewBox="0 0 1184 112" preserveAspectRatio="none" focusable="false"><path d="${P.plateRecognition.outer}" style="fill:var(--fibre)"/><path class="s-marigold" d="${P.plateRecognition.inner}" filter="url(#grain)"/></svg>
      </div>
      <div class="band">${paperSVG(48, 150, P.band, 's-ub')}</div>
    </div>
    <h2 id="recognition-title">Two awards in one April, and a key</h2>
    <article id="recognition-pillar" class="card card--award">
      <div class="meta"><span>University at Buffalo,<br>April 2026</span></div>
      <div class="body">
        <p class="award__line"><span class="award__fig">1 of 2</span> <span class="award__den">from 130+ nominations across UB's 20,000+ undergraduates</span></p>
        <h3>Award for Innovative Student Leadership</h3>
        <p>The Pillar of Leadership award for the student whose initiative changed something at the university.</p>
        <div class="stubs">${stub(SRC.ubLeadership, 'UB Student Life')}</div>
      </div>
      <figure class="margin-print">
        <div class="mp__frame">
          <img src="img/full-pillar-pair.jpg" width="991" height="791" alt="Aryan and Shaurya Jain each holding a Pillar of Leadership plaque" loading="lazy" decoding="async">
          ${tapeSVG('', 84, 24, TAPE.pillar)}
        </div>
        <figcaption>With Shaurya Jain, who received the Exemplary Student Leader Award the same evening.</figcaption>
      </figure>
    </article>
  </section>

  <section id="about" class="wrap section" aria-labelledby="about-title">
    <div class="plate plate--about" aria-hidden="true">
      <div class="plate__clip">
        <svg class="plate__paper" viewBox="0 0 1184 112" preserveAspectRatio="none" focusable="false"><path d="${P.plateAbout.outer}" style="fill:var(--fibre)"/><path class="s-kraft" d="${P.plateAbout.inner}" filter="url(#grain)"/></svg>
      </div>
        <div class="scrap scrap--graph">${fibreSVG(220, 96, P.graph, 'url(#graph)')}${tapeSVG('', 52, 18, TAPE.graph)}</div>
    </div>
    <h2 id="about-title">Outside the work</h2>
    <ul class="lines" role="list">
      ${about.map((t, i) => `<li><svg viewBox="0 0 20 16" aria-hidden="true" focusable="false">${aboutTick(300 + i * 13)}</svg><span>${t}</span></li>`).join('\n      ')}
    </ul>
  </section>
</main>

<footer id="contact" class="foot" aria-labelledby="contact-title">
  <div class="foot__tear" aria-hidden="true"><svg viewBox="0 0 1600 40" preserveAspectRatio="none" focusable="false"><path class="fibre" d="${P.slab.outer}"/><path class="stock" d="${P.slab.inner}"/></svg></div>
  <div class="foot__slab">
    <div class="wrap foot__in">
      <div>
        <h2 id="contact-title">Every claim above has a link</h2>
        <a class="foot__email" href="mailto:aryanmudgal4493@gmail.com">aryanmudgal4493@gmail.com</a>
        <ul class="foot__links" role="list">
          <li>${ext(SRC.linkedin, 'LinkedIn')}</li>
          <li>${ext(SRC.github, 'GitHub')}</li>
          <li>${ext(SRC.devpost, 'Devpost')}</li>
          <li><a href="resume.pdf">Resume (PDF)</a></li>
        </ul>
      </div>
      <figure class="sheet">
        <div class="sheet__paper">
          ${fibreSVG(268, 330, P.sheet)}
          <div class="drawing" role="img" aria-label="A pencil self-portrait of Aryan in a suit with a handwritten arrow labelled me in every photo"></div>
          ${tapeSVG('tape--a', 78, 22, TAPE.sheetA)}${tapeSVG('tape--b', 70, 22, TAPE.sheetB)}
        </div>
        <figcaption>Pencil, drawn on the train to Albany, April 2026. Me in every photo. <a href="#about">Drawn by Aryan</a></figcaption>
      </figure>
    </div>
  </div>
</footer>

<div class="mock-pill" role="group" aria-label="Mockup theme">
  <span>Mockup<span class="pill-name">: Paste-Up</span></span>
  <button type="button" data-set="light" aria-pressed="false">Light</button>
  <button type="button" data-set="dark" aria-pressed="false">Dark</button>
</div>
<script>(function(){var h=document.documentElement;function cur(){return h.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}var bs=document.querySelectorAll('.mock-pill button');function sync(){bs.forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-set')===cur()));});}bs.forEach(function(b){b.addEventListener('click',function(){h.setAttribute('data-theme',b.getAttribute('data-set'));sync();});});sync();})();</script>
</body>
</html>
`;

if (/[–—]/.test(html)) { console.error('dash found'); process.exit(1); }
writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + ' KB');
