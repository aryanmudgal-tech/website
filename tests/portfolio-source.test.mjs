import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";
import * as portfolio from "../src/data/portfolio.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function readIfPresent(relativePath) {
  return existsSync(join(root, relativePath)) ? read(relativePath) : "";
}

function sourceBundle() {
  return [
    "src/data/portfolio.ts",
    "src/layouts/BaseLayout.astro",
    "src/components/SiteNav.astro",
    "src/components/Hero.astro",
    "src/components/Experience.astro",
    "src/components/Projects.astro",
    "src/components/Trajectory.astro",
    "src/components/Research.astro",
    "src/components/Leadership.astro",
    "src/components/Recognition.astro",
    "src/components/About.astro",
    "src/components/SiteFooter.astro",
    "src/pages/index.astro",
    "src/styles/global.css",
  ].map(read).join("\n");
}

function cameraDiveSource() {
  return [
    "src/components/ParticleBrain.astro",
    "src/lib/particle-brain.mjs",
    "src/pages/index.astro",
    "src/components/Hero.astro",
    "src/components/Experience.astro",
    "src/components/Projects.astro",
    "src/components/Research.astro",
    "src/components/Leadership.astro",
    "src/components/About.astro",
    "src/styles/global.css",
    "src/styles/tokens.css",
    "src/styles/layout.css",
    "src/styles/motion.css",
    "package.json",
  ].map(readIfPresent).join("\n");
}

function styleSource() {
  return [
    "src/styles/global.css",
    "src/styles/tokens.css",
    "src/styles/layout.css",
    "src/styles/motion.css",
  ].map(readIfPresent).join("\n");
}

function servedFiles(directory = join(root, "src")) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return servedFiles(path);
    if (!/\.(?:astro|css|js|jsx|mjs|ts|tsx)$/.test(entry.name)) return [];
    return [{ path, source: readFileSync(path, "utf8") }];
  });
}

function servedSource() {
  return servedFiles().map((file) => file.source).join("\n");
}

function hexFromChannels(red, green, blue) {
  return `#${[red, green, blue]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function normalizeHex(color) {
  const value = color.slice(1);
  if (value.length === 3 || value.length === 4) {
    return `#${value.slice(0, 3).split("").map((digit) => digit.repeat(2)).join("")}`;
  }
  return `#${value.slice(0, 6)}`;
}

function normalizeRgb(body) {
  const channels = body.split("/")[0].trim().split(/[\s,]+/).filter(Boolean).slice(0, 3);
  assert.equal(channels.length, 3, `unsupported rgb() color: ${body}`);
  return hexFromChannels(...channels.map((channel) => (
    channel.endsWith("%") ? Number.parseFloat(channel) * 2.55 : Number.parseFloat(channel)
  )));
}

function normalizeHsl(body) {
  const channels = body.split("/")[0].trim().split(/[\s,]+/).filter(Boolean).slice(0, 3);
  assert.equal(channels.length, 3, `unsupported hsl() color: ${body}`);
  const hue = ((Number.parseFloat(channels[0]) % 360) + 360) % 360;
  const saturation = Number.parseFloat(channels[1]) / 100;
  const lightness = Number.parseFloat(channels[2]) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const segment = hue / 60;
  const secondary = chroma * (1 - Math.abs((segment % 2) - 1));
  const [red, green, blue] = segment < 1 ? [chroma, secondary, 0]
    : segment < 2 ? [secondary, chroma, 0]
      : segment < 3 ? [0, chroma, secondary]
        : segment < 4 ? [0, secondary, chroma]
          : segment < 5 ? [secondary, 0, chroma]
            : [chroma, 0, secondary];
  const match = lightness - chroma / 2;
  return hexFromChannels((red + match) * 255, (green + match) * 255, (blue + match) * 255);
}

const namedCssColors = new Set(`
  aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue
  blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk
  crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki
  darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
  darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue
  dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite
  gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki
  lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
  lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen
  lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen
  magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen
  mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream
  mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
  palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum
  powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown
  seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen
  steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen
`.trim().split(/\s+/));

function authoredColorValues(source) {
  const values = [];
  const properties = [
    "--[\\w-]+",
    "accent-color",
    "background(?:-color)?",
    "border(?:-(?:block|inline)(?:-(?:start|end))?|-(?:top|right|bottom|left))?(?:-color)?",
    "box-shadow",
    "caret-color",
    "color",
    "column-rule(?:-color)?",
    "fill",
    "filter",
    "outline(?:-color)?",
    "stroke",
    "text-decoration(?:-color)?",
    "text-shadow",
  ].join("|");
  const declarations = new RegExp(
    `(?:^|[;{\"'])\\s*(?:${properties})\\s*:\\s*([^;}\"']+)`,
    "gim",
  );
  const canvasAndDomAssignments =
    /(?:fillStyle|strokeStyle|shadowColor|color|backgroundColor|borderColor|outlineColor|boxShadow|textShadow)\s*=\s*["'`]([^"'`]+)["'`]/gi;

  for (const match of source.matchAll(declarations)) values.push(match[1]);
  for (const match of source.matchAll(canvasAndDomAssignments)) values.push(match[1]);
  return values;
}

function authoredCssPalette(source) {
  const colors = (source.match(/#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi) ?? []).map(normalizeHex);
  for (const match of source.matchAll(/rgba?\(([^)]*)\)/gi)) colors.push(normalizeRgb(match[1]));
  for (const match of source.matchAll(/hsla?\(([^)]*)\)/gi)) colors.push(normalizeHsl(match[1]));
  for (const value of authoredColorValues(source)) {
    for (const token of value.match(/[a-z]+/gi) ?? []) {
      const keyword = token.toLowerCase();
      if (!namedCssColors.has(keyword)) continue;
      assert.ok(["black", "white"].includes(keyword), `unapproved named CSS color: ${keyword}`);
      colors.push(keyword === "black" ? "#000000" : "#ffffff");
    }
  }
  assert.doesNotMatch(source, /\b(?:hwb|lab|lch|oklab|oklch|color|color-mix)\s*\(/i);
  return [...new Set(colors)].sort();
}

function functionBody(source, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const declaration = new RegExp(
    `(?:function\\s+${escapedName}\\s*\\([^)]*\\)|(?:const|let|var)\\s+${escapedName}\\s*=\\s*(?:\\([^)]*\\)|[A-Za-z_$][\\w$]*)\\s*=>)\\s*\\{`,
  );
  const match = declaration.exec(source);
  if (!match) return "";

  const openingBrace = match.index + match[0].lastIndexOf("{");
  let depth = 0;
  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(openingBrace + 1, index);
  }
  return "";
}

function schedulesAnimation(snippet, source, callbackName) {
  const callbackPattern = callbackName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`requestAnimationFrame\\(\\s*${callbackPattern}\\s*\\)`).test(snippet)) return true;

  for (const call of snippet.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) {
    const body = functionBody(source, call[1]);
    if (new RegExp(`requestAnimationFrame\\(\\s*${callbackPattern}\\s*\\)`).test(body)) return true;
  }
  return false;
}

test("recruiter-first sections exist in the approved order", () => {
  const page = read("src/pages/index.astro");
  const components = [
    "<Hero",
    "<Experience",
    "<Projects",
    "<Research",
    "<Leadership",
    "<About",
    "<SiteFooter",
  ];

  let previous = -1;
  for (const component of components) {
    const position = page.indexOf(component);
    assert.ok(position > previous, `${component} must appear after the previous section`);
    previous = position;
  }
});

test("navigation and section contracts are conventional and complete", () => {
  const data = read("src/data/portfolio.ts");
  const source = sourceBundle();
  const navItems = data.match(/export const navItems:[\s\S]*?=\s*\[([\s\S]*?)\];/)?.[1] ?? "";
  const labels = [...navItems.matchAll(/label:\s*["']([^"']+)["']/g)].map((match) => match[1]);

  assert.deepEqual(labels, ["Work", "Projects", "Research", "Leadership", "About", "Contact"]);

  for (const id of ["top", "work", "projects", "trajectory", "research", "leadership", "recognition", "about", "contact"]) {
    assert.match(source, new RegExp(`id=["']${id}["']`));
  }
});

test("core proof and supported content are preserved", () => {
  const data = read("src/data/portfolio.ts");

  for (const fact of [
    "Linde",
    "Meta Layer Initiative",
    "HCLTech",
    "MIDL-accepted",
    "four hackathon recognitions",
    "Dots",
    "ARMIE",
    "StreamFair",
    "W.O.D.",
    "$500K+",
    "30,000+",
    "100,000+",
    "1,500+",
    "Award for Innovative Student Leadership",
    "SUNY Chancellor's Award for Student Excellence",
    "Phi Beta Kappa",
    "Gym",
    "Golf",
    "Badminton",
    "Acting and mimicry",
  ]) {
    assert.ok(data.includes(fact), `missing preserved fact: ${fact}`);
  }

  assert.doesNotMatch(data, /\bpublished\b/i);
  assert.doesNotMatch(data, /4(?:x|×)\s+hackathon\s+winner/i);
  assert.doesNotMatch(data, /3,000\+\s+followers/i);
});

test("every typed portfolio fact matches the approved content snapshot", () => {
  const { navItems: _navItems, ...facts } = portfolio;
  const factHash = createHash("sha256").update(JSON.stringify(facts)).digest("hex");

  assert.deepEqual(Object.keys(facts).sort(), [
    "experiences",
    "interests",
    "leadershipItems",
    "links",
    "places",
    "projects",
    "proofPoints",
    "recognitions",
    "researchItems",
    "trajectoryColumns",
    "trajectoryEvents",
    "trajectoryLanes",
  ]);
  assert.equal(factHash, "1937230be150f15ce5de31c3d61a31210ea60838c5d6c9b1e0d19141006db8ef");
});

test("public contact and project URLs remain exact", () => {
  const data = read("src/data/portfolio.ts");

  for (const url of [
    "mailto:aryanmudgal4493@gmail.com",
    "https://www.linkedin.com/in/aryan-mudgal",
    "https://github.com/aryanmudgal-tech",
    "https://devpost.com/software/dots-y5r21j",
    "https://devpost.com/software/armie",
    "https://drive.google.com/file/d/12grQ7uR837u36IkN1WaILOC0SHycm2rh/view?usp=sharing",
    "https://devpost.com/software/c-o-r-e",
  ]) {
    assert.ok(data.includes(`"${url}"`), `missing exact public URL: ${url}`);
  }
});

test("metadata, Person schema, and public asset helpers stay exact and base-path safe", () => {
  const layout = read("src/layouts/BaseLayout.astro");
  const assets = read("src/lib/site-url.ts");
  const hero = read("src/components/Hero.astro");
  const projects = read("src/components/Projects.astro");
  const recognition = read("src/components/Recognition.astro");

  for (const value of [
    "Aryan Mudgal | Engineer and researcher",
    "Aryan Mudgal builds applied AI systems across industrial operations, human-AI interaction, and healthcare.",
    '"@context": "https://schema.org"',
    '"@type": "Person"',
    'name: "Aryan Mudgal"',
    'email: "mailto:aryanmudgal4493@gmail.com"',
    'jobTitle: "Software engineer and researcher"',
    '"https://www.linkedin.com/in/aryan-mudgal"',
    '"https://github.com/aryanmudgal-tech"',
    '"Applied artificial intelligence"',
    '"Machine learning"',
    '"Human-AI interaction"',
    '"Medical AI"',
  ]) {
    assert.ok(layout.includes(value), `metadata surface is missing: ${value}`);
  }

  assert.match(layout, /<meta property="og:type" content="website"/);
  assert.match(layout, /<meta property="og:title" content=\{title\}/);
  assert.match(layout, /<meta property="og:description" content=\{description\}/);
  assert.match(layout, /<meta name="twitter:card" content="summary"/);
  assert.match(layout, /<meta name="twitter:title" content=\{title\}/);
  assert.match(layout, /<meta name="twitter:description" content=\{description\}/);
  assert.match(layout, /publicAssetUrl\("favicon\.svg"\)/);
  assert.match(assets, /import\.meta\.env\.BASE_URL/);
  assert.match(assets, /configuredBase\.endsWith\("\/"\)/);
  assert.match(assets, /path\.replace\(\/\^\\\/\+\//);
  assert.match(hero, /publicAssetUrl\("assets\/award-leader\.jpg"\)/);
  assert.match(projects, /publicAssetUrl\(project\.image\)/);
  assert.match(recognition, /publicAssetUrl\(recognition\.image\)/);
});

test("requested portfolio corrections are exact and stale content is absent", () => {
  const data = read("src/data/portfolio.ts");
  const about = read("src/components/About.astro");

  assert.match(data, /trajectoryColumns\s*=\s*\["2023",\s*"2024",\s*"2025",\s*"2026"\]/);
  assert.match(
    data,
    /period:\s*"2022-2025",\s*column:\s*"2024",\s*lane:\s*"Leadership",\s*title:\s*"SUNY Delegate"/s,
  );
  assert.match(data, /column:\s*"2023"\s*\|\s*"2024"\s*\|\s*"2025"\s*\|\s*"2026"/);
  assert.doesNotMatch(data, /trajectoryColumns\s*=\s*\[[^\]]*"2022"/);
  assert.match(
    data,
    /period:\s*"2023",\s*column:\s*"2023",\s*lane:\s*"Leadership",\s*title:\s*"Student Senator"/s,
  );
  assert.match(
    data,
    /period:\s*"2025",\s*column:\s*"2025",\s*lane:\s*"Research",\s*title:\s*"Fetal-maternal hemorrhage detection"/s,
  );
  assert.ok(
    (data.match(/title:\s*"Award for Innovative Student Leadership"/g) ?? []).length >= 2,
    "the exact innovative leadership award title must appear in Career Path and Recognition",
  );
  assert.ok(
    (data.match(/title:\s*"SUNY Chancellor's Award for Student Excellence"/g) ?? []).length >= 2,
    "the exact Chancellor's Award title must appear in Career Path and Recognition",
  );
  assert.ok((data.match(/year:\s*"2026"/g) ?? []).length >= 2, "both requested awards must show 2026");
  assert.match(about, /<h2 id="about-title">Outside the work<\/h2>/);

  for (const stale of [
    /C\.O\.R\.E\. \/ W\.O\.D\./i,
    /University and SUNY honors/i,
    /PPG signal accuracy/i,
    /Building Litos/i,
    /name:\s*"Litos"/i,
    /column:\s*"Now"/,
  ]) {
    assert.doesNotMatch(sourceBundle(), stale);
  }
});

test("trajectory is a complete server-rendered chronological list", () => {
  const source = read("src/components/Trajectory.astro");

  assert.match(source, /<ol\b/);
  assert.match(source, /trajectoryEvents\.map/);
  for (const field of ["period", "lane", "title", "outcome", "detail"]) {
    assert.match(source, new RegExp(`event\\.${field}`));
  }
  assert.doesNotMatch(source, /role="tab(?:list|panel)?"/);
  assert.doesNotMatch(source, /<script\b/);
});

test("markerless content keeps list semantics and avoids viewport-width overflow", () => {
  const source = sourceBundle();
  const css = styleSource();

  assert.ok((source.match(/role="list"/g) ?? []).length >= 6);
  assert.doesNotMatch(css, /\.proof-band\s*\{[^}]*width:\s*100vw/s);
});

test("Camera Dive source includes the fixed decorative brain and six scene markers", () => {
  const page = read("src/pages/index.astro");
  const brain = readIfPresent("src/components/ParticleBrain.astro");
  const source = cameraDiveSource();

  assert.equal(existsSync(join(root, "src/components/ParticleBrain.astro")), true);
  assert.match(page, /<ParticleBrain\s*\/>/);
  assert.match(brain, /<div\b(?=[^>]*class="particle-brain")(?=[^>]*aria-hidden="true")[^>]*>\s*<canvas\b/);
  const css = styleSource();
  const layerRule = css.match(/\.particle-brain\s*\{([^}]*)\}/s)?.[1] ?? "";
  const canvasRule = css.match(/\.particle-brain__canvas\s*\{([^}]*)\}/s)?.[1] ?? "";
  assert.match(layerRule, /position:\s*fixed/);
  assert.match(layerRule, /inset:\s*0/);
  assert.match(layerRule, /pointer-events:\s*none/);
  assert.match(canvasRule, /width:\s*100%/);
  assert.match(canvasRule, /height:\s*100%/);
  for (const scene of ["hero", "work", "projects", "research", "leadership", "about"]) {
    assert.match(source, new RegExp(`data-brain-scene=["']${scene}["']`));
  }
});

test("particle runtime uses Canvas 2D with lifecycle and fallback safeguards", () => {
  const source = cameraDiveSource();
  const engine = readIfPresent("src/lib/particle-brain.mjs");

  assert.match(source, /getContext\(["']2d["']\)/);
  assert.match(source, /requestAnimationFrame/);
  assert.match(source, /document\.hidden/);
  assert.match(source, /matchMedia\(["']\(prefers-reduced-motion:\s*reduce\)["']\)/);
  assert.match(source, /Math\.min\([^)]*(?:window\.)?devicePixelRatio[^)]*,\s*1\.5\)/);
  assert.match(source, /brain-unavailable/);
  assert.match(engine, /IntersectionObserver/);
  assert.match(engine, /\.isIntersecting/);
  assert.match(engine, /\.observe\(\s*canvas\s*\)/);
  assert.match(engine, /setTimeout\([\s\S]{0,300},\s*120\s*\)/);
  assert.match(engine, /clearTimeout/);
  assert.match(engine, /cancelAnimationFrame/);
  assert.match(engine, /\.disconnect\(\)/);
  assert.match(engine, /removeEventListener\(\s*["']resize["']/);

  const reducedBranch = engine.match(
    /if\s*\(\s*reducedMotion\.matches\s*\)\s*\{([\s\S]*?)\n\s*\}/,
  )?.[1] ?? "";
  assert.notEqual(reducedBranch, "", "runtime must branch for reduced motion");
  assert.match(reducedBranch, /interpolateScene\(\s*[^,]+,\s*0\s*\)/);
  assert.equal((reducedBranch.match(/(?:draw|render)\w*\s*\(/gi) ?? []).length, 1);
  assert.doesNotMatch(reducedBranch, /requestAnimationFrame/);
});

test("render loop derives normalized scene progress and couples visibility to animation work", () => {
  const engine = readIfPresent("src/lib/particle-brain.mjs");

  const interpolation = engine.match(
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*interpolateScene\(\s*[^,]+,\s*([A-Za-z_$][\w$]*)\s*\)/,
  );
  assert.ok(interpolation, "the rendered frame must interpolate from a computed progress value");
  const [, frameName, progressName] = interpolation;
  const progressAssignment = engine.match(
    new RegExp(`(?:const|let|var)\\s+${progressName}\\s*=\\s*([^;]+)`),
  );
  assert.ok(progressAssignment, "the interpolation progress must be assigned from scene geometry");
  assert.doesNotMatch(progressAssignment[1].trim(), /^-?(?:\d+(?:\.\d+)?|\.\d+)$/);

  const progressHelper = progressAssignment[1].match(/^\s*([A-Za-z_$][\w$]*)\s*\(/)?.[1];
  const geometryFlow = progressHelper ? functionBody(engine, progressHelper) : progressAssignment[1];
  assert.notEqual(geometryFlow, "", "the geometry-to-progress calculation must be inspectable");
  assert.match(geometryFlow, /getBoundingClientRect\(\)/);
  assert.match(geometryFlow, /\.top\b/);
  assert.match(geometryFlow, /\.height\b/);
  assert.match(geometryFlow, /\/\s*2\b/);
  assert.ok(
    (geometryFlow.match(/(?<![*/])\/(?![*/])/g) ?? []).length >= 2
      && (geometryFlow.match(/(?<![-=])-(?![-=>])/g) ?? []).length >= 2,
    "scene progress must divide a relative position by a geometry-derived interval",
  );
  assert.match(geometryFlow, /return\s+[^;\n]*\+[^;\n]*/);
  assert.doesNotMatch(geometryFlow, /Math\.(?:ceil|floor|round)\s*\(/);

  const renderCall = new RegExp(`\\b(?:draw|render)[\\w$]*\\s*\\([^;)]*\\b${frameName}\\b`);
  assert.match(engine.slice(interpolation.index), renderCall);

  const animationCallbacks = [...engine.matchAll(/requestAnimationFrame\(\s*([A-Za-z_$][\w$]*)\s*\)/g)];
  const callbackName = animationCallbacks
    .map((match) => match[1])
    .find((name) => functionBody(engine, name).includes(interpolation[0]));
  assert.ok(callbackName, "interpolation and rendering must run inside the animation callback");
  const loopBody = functionBody(engine, callbackName);
  const renderPosition = loopBody.search(renderCall);
  assert.ok(renderPosition >= 0, "the interpolated frame must flow into the animation callback's renderer");

  const visibilityAssignment = engine.match(
    /([A-Za-z_$][\w$]*)\s*=\s*(?:[A-Za-z_$][\w$]*|[A-Za-z_$][\w$]*\s*\[\s*0\s*\])\.isIntersecting/,
  );
  assert.ok(visibilityAssignment, "IntersectionObserver visibility must feed the animation gate");
  const visibilityName = visibilityAssignment[1];
  const beforeRender = loopBody.slice(0, renderPosition);
  assert.match(beforeRender, /document\.hidden/);
  const offscreenExpression = `(?:!\\s*${visibilityName}\\b|${visibilityName}\\s*===\\s*false\\b)`;
  assert.match(beforeRender, new RegExp(offscreenExpression));
  assert.match(
    beforeRender,
    /if\s*\([^)]*document\.hidden[^)]*\)\s*\{?\s*return/,
    "hidden document state must return before rendering",
  );
  assert.match(
    beforeRender,
    new RegExp(`if\\s*\\([^)]*${offscreenExpression}[^)]*\\)\\s*\\{?\\s*return`),
    "offscreen canvas state must return before rendering",
  );
  assert.equal(
    schedulesAnimation(loopBody.slice(renderPosition), engine, callbackName),
    true,
    "animation scheduling must occur only after the hidden/offscreen gate and rendering",
  );

  const observerRestart = engine.slice(visibilityAssignment.index, visibilityAssignment.index + 800);
  assert.match(
    observerRestart,
    new RegExp(`if\\s*\\(\\s*${visibilityName}(?:\\s*===\\s*true)?\\s*\\)`),
  );
  assert.equal(
    schedulesAnimation(observerRestart, engine, callbackName),
    true,
    "the observer must restart animation when the canvas becomes visible",
  );

  const visibilityListener = engine.match(
    /addEventListener\(\s*["']visibilitychange["'][\s\S]{0,800}/,
  )?.[0] ?? "";
  assert.notEqual(visibilityListener, "", "runtime must listen for document visibility changes");
  assert.match(
    visibilityListener,
    /(?:!\s*document\.hidden|document\.visibilityState\s*===\s*["']visible["'])/,
  );
  assert.equal(
    schedulesAnimation(visibilityListener, engine, callbackName),
    true,
    "visibilitychange must restart animation when the document becomes visible",
  );
});

test("global styles are split into tokens, layout, and motion modules", () => {
  const global = read("src/styles/global.css");

  for (const name of ["tokens", "layout", "motion"]) {
    assert.equal(existsSync(join(root, `src/styles/${name}.css`)), true, `${name}.css must exist`);
    assert.match(global, new RegExp(`^\\s*@import\\s+(?:url\\()?['"]\\./${name}\\.css['"]\\)?\\s*;`, "m"));
  }

  const css = styleSource();
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /(?:linear|radial|conic)-gradient/i);
});

test("palette scan rejects named colors across authored styling contexts", () => {
  for (const source of [
    ".card { --accent: red; }",
    ".card { border: 1px solid red; }",
    ".card { box-shadow: 0 0 1rem red; }",
    '<div style="outline: 2px solid red">',
    'context.fillStyle = "red";',
    'context.shadowColor = "red";',
    'element.style.backgroundColor = "red";',
  ]) {
    assert.throws(() => authoredCssPalette(source), /unapproved named CSS color: red/);
  }
  assert.deepEqual(authoredCssPalette(".ink { color: black; background: white; }"), [
    "#000000",
    "#ffffff",
  ]);
});

test("served source uses only the exact approved Camera Dive palette", () => {
  const css = styleSource();
  const engine = readIfPresent("src/lib/particle-brain.mjs");
  const canvasFiles = new Set([
    join(root, "src/components/ParticleBrain.astro"),
    join(root, "src/lib/particle-brain.mjs"),
  ]);
  const approved = new Set(["#000000", "#15846e", "#8052ff", "#8d8d92", "#bdbdbd", "#ffb829", "#ffffff"]);
  const authored = new Set();

  for (const file of servedFiles()) {
    for (const color of authoredCssPalette(file.source)) {
      assert.equal(approved.has(color), true, `unapproved color ${color} in ${file.path}`);
      if (color === "#15846e") {
        assert.equal(canvasFiles.has(file.path), true, `#15846e is canvas-only: ${file.path}`);
      }
      authored.add(color);
    }
  }

  assert.deepEqual(authoredCssPalette(css), ["#000000", "#8052ff", "#8d8d92", "#bdbdbd", "#ffb829", "#ffffff"]);
  assert.deepEqual([...authored].sort(), [...approved].sort());
  assert.match(engine, /["']#15846e["']/i);
});

test("primary navigation exposes the current section without scroll listeners", () => {
  const nav = read("src/components/SiteNav.astro");
  const css = styleSource();

  assert.match(nav, /IntersectionObserver/);
  assert.match(nav, /aria-current/);
  assert.match(nav, /astro:after-swap/);
  assert.match(nav, /setCurrent\(current\?\.\[0\] \?\? null\)/);
  assert.match(css, /\.site-nav a\[aria-current="location"\]/);
  assert.doesNotMatch(nav, /window\.addEventListener\(["']scroll["']/);
});

test("served source rejects prohibited runtimes and interaction patterns", () => {
  const source = servedSource();
  const packageJson = JSON.parse(read("package.json"));

  const dependencyNames = [
    packageJson.dependencies ?? {},
    packageJson.devDependencies ?? {},
    packageJson.optionalDependencies ?? {},
    packageJson.peerDependencies ?? {},
    packageJson.bundleDependencies ?? [],
    packageJson.bundledDependencies ?? [],
  ].flatMap((dependencyGroup) => (
    Array.isArray(dependencyGroup) ? dependencyGroup : Object.keys(dependencyGroup)
  ));
  assert.deepEqual(dependencyNames, ["astro"], "Astro must remain the sole package dependency");
  assert.equal(packageJson.devDependencies.astro, "^7.1.3");

  for (const banned of [
    /(?:from\s*|import\s*)["']three(?:\/[^"']*)?["']/i,
    /import\s*\(\s*["']three(?:\/[^"']*)?["']\s*\)/i,
    /require\(\s*["']three(?:\/[^"']*)?["']\s*\)/i,
    /webgl/i,
    /\bgsap\b/i,
    /scrolltrigger/i,
    /\blenis\b/i,
    /<audio/i,
    /\bDala\b/i,
    /custom cursor/i,
    /cursor\s*:\s*none/i,
    /cursor\s*:\s*url\s*\(/i,
    /scroll hijack/i,
    /::-(?:webkit-)?scrollbar/i,
    /scrollbar-(?:color|width)/i,
    /addEventListener\(\s*["'](?:wheel|mousewheel|touchmove)["']/i,
    /(?:window\.)?scroll(?:To|By)\s*\(/i,
    /\.scrollIntoView\s*\(/i,
    /\.scrollTop\s*=/i,
  ]) {
    assert.doesNotMatch(source, banned);
  }
  assert.doesNotMatch(source, /href=(?:["']{2}|["']#["'])/);
});

test("build dependency stays on the patched Astro line", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.equal(packageJson.devDependencies.astro, "^7.1.3");
});
