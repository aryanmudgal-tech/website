import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
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

test("recruiter-first sections exist in the approved order", () => {
  const page = read("src/pages/index.astro");
  const components = [
    "<Hero",
    "<Experience",
    "<Projects",
    "<Trajectory",
    "<Research",
    "<Leadership",
    "<Recognition",
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

  for (const label of ["Work", "Projects", "Research", "Leadership", "Recognition", "About", "Contact"]) {
    assert.match(data, new RegExp(`label: ["']${label}["']`));
  }

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
    "C.O.R.E.",
    "$500K+",
    "30,000+",
    "100,000+",
    "1,500+",
    "Student Innovative Leader",
    "SUNY Chancellor's Award",
    "Phi Beta Kappa",
    "Litos",
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

test("trajectory is progressive, selected server-side, and keyboard operable", () => {
  const source = read("src/components/Trajectory.astro");
  const css = read("src/styles/global.css");

  assert.match(source, /role="tablist"/);
  assert.match(source, /role="tab"/);
  assert.match(source, /aria-selected=\{index === 0/);
  assert.match(source, /id="trajectory-detail"/);
  assert.match(source, /aria-live="polite"/);
  for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) {
    assert.ok(source.includes(key), `trajectory must handle ${key}`);
  }
  assert.match(source, /classList\.add\("trajectory-ready"\)/);
  assert.match(source, /class="trajectory-fallback"/);
  assert.match(source, /trajectory-fallback__detail/);
  assert.match(source, /event\.detail/);
  assert.match(css, /\.trajectory-enhanced\s*\{[^}]*display:\s*none/s);
  assert.match(css, /\.trajectory-ready\s+\.trajectory-enhanced\s*\{[^}]*display:\s*grid/s);
  assert.match(css, /\.trajectory-ready\s+\.trajectory-fallback\s*\{[^}]*display:\s*none/s);
  assert.doesNotMatch(read("src/layouts/BaseLayout.astro"), /classList\.add\("js"\)/);
});

test("markerless content keeps list semantics and avoids viewport-width overflow", () => {
  const source = sourceBundle();
  const css = read("src/styles/global.css");

  assert.ok((source.match(/role="list"/g) ?? []).length >= 6);
  assert.doesNotMatch(css, /\.proof-band\s*\{[^}]*width:\s*100vw/s);
});

test("visual system includes responsive, focus, theme, and motion safeguards", () => {
  const css = read("src/styles/global.css");

  assert.match(css, /--accent:/);
  assert.doesNotMatch(css, /--accent-(?:2|secondary|alt):/);
  assert.match(css, /@media\s*\(prefers-color-scheme:\s*dark\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /min-height:\s*100dvh/);
  assert.match(css, /@media\s*\(max-width:\s*47\.99rem\)/);
  assert.match(css, /@media\s*\(max-width:\s*64rem\)[\s\S]*?\.trajectory-ready\s+\.trajectory-enhanced\s*\{[^}]*display:\s*none/);
  for (const state of [".wordmark:hover", ".site-nav a:active", ".site-footer__meta a:hover"]) {
    assert.ok(css.includes(state), `missing interaction feedback: ${state}`);
  }
  assert.doesNotMatch(css, /(?:linear|radial|conic)-gradient/i);
  assert.doesNotMatch(css, /cursor:\s*none/i);
  assert.doesNotMatch(css, /animation-iteration-count:\s*infinite/i);
});

test("served source rejects theatre-era and heavy-runtime patterns", () => {
  const source = sourceBundle();

  assert.doesNotMatch(source, /[—–]/);
  for (const banned of [
    /three\.js/i,
    /webgl/i,
    /scrolltrigger/i,
    /<canvas/i,
    /<audio/i,
    /lofi\.mp3/i,
    /curtain/i,
    /intermission/i,
    /end credits/i,
    /custom cursor/i,
    /scroll hijack/i,
  ]) {
    assert.doesNotMatch(source, banned);
  }
});

test("build dependency stays on the patched Astro line", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.equal(packageJson.devDependencies.astro, "^7.1.3");
});
