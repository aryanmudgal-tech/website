import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

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
  assert.match(brain, /<canvas\b/);
  assert.match(brain, /aria-hidden="true"/);
  for (const scene of ["hero", "work", "projects", "research", "leadership", "about"]) {
    assert.match(source, new RegExp(`data-brain-scene=["']${scene}["']`));
  }
});

test("particle runtime uses Canvas 2D with lifecycle and fallback safeguards", () => {
  const source = cameraDiveSource();

  assert.match(source, /getContext\(["']2d["']\)/);
  assert.match(source, /requestAnimationFrame/);
  assert.match(source, /document\.hidden/);
  assert.match(source, /matchMedia\(["']\(prefers-reduced-motion:\s*reduce\)["']\)/);
  assert.match(source, /Math\.min\([^)]*(?:window\.)?devicePixelRatio[^)]*,\s*1\.5\)/);
  assert.match(source, /brain-unavailable/);
});

test("global styles are split into tokens, layout, and motion modules", () => {
  const global = read("src/styles/global.css");

  for (const name of ["tokens", "layout", "motion"]) {
    assert.equal(existsSync(join(root, `src/styles/${name}.css`)), true, `${name}.css must exist`);
    assert.match(global, new RegExp(`(?:@import\\s+)?["']\\./${name}\\.css["']`));
  }

  const css = styleSource();
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
  assert.doesNotMatch(css, /(?:linear|radial|conic)-gradient/i);
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
  const source = `${sourceBundle()}\n${cameraDiveSource()}`;

  for (const banned of [
    /three\.js/i,
    /webgl/i,
    /\bgsap\b/i,
    /scrolltrigger/i,
    /\blenis\b/i,
    /<audio/i,
    /\bDala\b/i,
    /custom cursor/i,
    /cursor\s*:\s*none/i,
    /scroll hijack/i,
  ]) {
    assert.doesNotMatch(source, banned);
  }
  assert.doesNotMatch(source, /href=(?:["']{2}|["']#["'])/);
});

test("build dependency stays on the patched Astro line", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.equal(packageJson.devDependencies.astro, "^7.1.3");
});
