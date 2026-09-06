import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const componentFiles = [
  "src/layouts/BaseLayout.astro",
  "src/components/SiteNav.astro",
  "src/components/Frame.astro",
  "src/components/ChapterFigure.astro",
  "src/components/Ledger.astro",
  "src/components/Source.astro",
  "src/components/Video.astro",
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
  "src/pages/404.astro",
];
const components = () => componentFiles.map(read).join("\n");
const css = () => read("src/styles/global.css");

// Node 24 strips TypeScript types on import, so the data files are loaded as real modules.
const portfolio = await import(new URL("../src/data/portfolio.ts", import.meta.url).href);
const { rooms, extras } = await import(new URL("../src/data/rooms.ts", import.meta.url).href);

const KNOWN_EXCEPTIONS = new Set(["armie-honorable-mention", "men-in-green", "safeline-remarks"]);

function assertSourced(items, label) {
  for (const item of items) {
    const receipts = item.receipts ?? [];
    const sourced = receipts.length > 0 && receipts.every((receipt) => receipt.href && receipt.label);
    const excepted = item.exception !== undefined && KNOWN_EXCEPTIONS.has(item.exception);
    assert.ok(sourced || excepted, `${label}: "${item.title ?? item.name ?? item.company}" needs a receipt or a known exception`);
  }
}

test("sections keep the approved order and the frame wraps main and footer", () => {
  const page = read("src/pages/index.astro");
  let previous = -1;
  for (const marker of ['<div class="rooms"', "<Frame", "<main", "<Hero", "<Experience", "<Projects", "<Trajectory", "<Research", "<Leadership", "<Recognition", "<About", "</main>", "<SiteFooter", "</div>"]) {
    const position = page.indexOf(marker);
    assert.ok(position > previous, `${marker} must appear after the previous marker`);
    previous = position;
  }
});

test("navigation labels and section ids are complete", () => {
  const labels = portfolio.navItems.map((item) => item.label);
  assert.deepEqual(labels, ["Work", "Projects", "Research", "Leadership", "Recognition", "About", "Contact"]);
  const source = components();
  for (const id of ["top", "work", "projects", "trajectory", "research", "leadership", "recognition", "about", "contact", "main-content"]) {
    assert.match(source, new RegExp(`id=["']${id}["']`), `missing id ${id}`);
  }
});

test("the first screen carries status, target, and three sourced proofs", () => {
  const { identity, ledger } = portfolio;
  assert.ok(identity.fixationLineShort.length <= 130, `short fixation line is ${identity.fixationLineShort.length} chars`);
  for (const fact of ["University at Buffalo", "December 2026", "Linde", "New York City"]) {
    assert.ok(identity.fixationLine.includes(fact), `fixation line missing ${fact}`);
  }
  for (const fact of ["Dec 2026", "Linde", "NYC"]) {
    assert.ok(identity.fixationLineShort.includes(fact), `short fixation line missing ${fact}`);
  }
  assert.doesNotMatch(identity.fixationLine, /authoriz|sponsor/i);
  assert.equal(ledger.length, 3);
  assert.equal(ledger.filter((row) => row.bold).length, 1, "exactly one ledger row is bold");
  assert.deepEqual(ledger.slice(0, 2).map((row) => row.fraction), ["1 of 2", "1 of 15"]);
  for (const row of ledger) {
    assert.ok(row.receipt.href.startsWith("http"), `ledger row ${row.fraction} needs an absolute source`);
    assert.match(row.anchor, /^#(?:recognition-[a-z]+|research)$/, `ledger row ${row.fraction} must point at its Recognition row or at Research`);
  }
});

test("every claim has a receipt or a documented exception", () => {
  assertSourced(portfolio.experiences, "experience");
  assertSourced(portfolio.projects, "project");
  assertSourced(portfolio.research, "research");
  assertSourced(portfolio.leadership, "leadership");
  assertSourced(portfolio.recognitions, "recognition");
  const exceptions = [...portfolio.projects, ...portfolio.leadership].map((item) => item.exception).filter(Boolean);
  assert.deepEqual(new Set(exceptions), KNOWN_EXCEPTIONS, "exactly the three agreed exceptions are used");
});

test("retired figures and stories are gone from the source", () => {
  const source = components() + read("src/data/portfolio.ts") + read("src/data/rooms.ts");
  for (const retired of ["$500K", "300 teams", "XR Hacks", "1,500+", "100,000+", "New Delhi", "PPG", "wound", "MIDL-accepted", "Hackathon recognitions", "licensed to a partner", "prioritized alerts"]) {
    assert.equal(source.includes(retired), false, `retired string still present: ${retired}`);
  }
  assert.doesNotMatch(source, /4(?:x|×)\s+hackathon\s+winner/i);
  assert.doesNotMatch(source, /\bpublished\b/i);
});

test("each room has a chapter, a CSS timeline, and a caption without a denominator", () => {
  const source = components();
  const styles = css();
  assert.equal(rooms.length, 12);
  const dynamicRooms = new Set([
    ...portfolio.projects.map((project) => project.id),
    ...portfolio.recognitions.map((award) => award.id),
    ...portfolio.leadership.map((item) => item.roomId).filter(Boolean),
  ]);
  assert.match(read("src/components/Projects.astro"), /data-room=\{project\.id\}/);
  assert.match(read("src/components/Recognition.astro"), /data-room=\{award\.id\}/);
  assert.match(read("src/components/Leadership.astro"), /data-room=\{item\.roomId\}/);
  for (const room of rooms) {
    if (!dynamicRooms.has(room.id)) {
      assert.match(source, new RegExp(`data-room=["']${room.id}["']`), `no chapter owns room ${room.id}`);
    }
    assert.ok(styles.includes(`--r-${room.id}`), `no timeline for room ${room.id}`);
    assert.doesNotMatch(room.caption, /\b1 of \d+/, `room ${room.id} caption repeats a denominator`);
    assert.ok(room.alt.length >= 30, `room ${room.id} alt is too short`);
  }
  assert.ok(styles.includes("timeline-scope:"));
  for (const extra of extras) {
    assert.ok(rooms.some((room) => room.id === extra.room), `extra ${extra.id} points at an unknown room`);
  }
});

test("motion is gated, reduced motion only changes timing, and no vh units remain", () => {
  const styles = css();
  const supportsStart = styles.indexOf("@supports (animation-timeline: view())");
  assert.ok(supportsStart > -1, "the frame animation must sit inside an @supports block");
  const outside = styles.slice(0, supportsStart) + styles.slice(styles.indexOf("\n}\n", supportsStart) + 3);
  assert.doesNotMatch(outside, /(?<![-a-z])animation(?:-name)?\s*:/, "animations must live inside the @supports block");
  const reduced = styles.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(reduced, "missing reduced-motion block");
  for (const property of reduced[1].match(/[a-z-]+(?=\s*:)/g) ?? []) {
    assert.ok(["animation-timing-function", "animation-duration", "transition-duration", "scroll-behavior"].includes(property), `reduced motion may not set ${property}`);
  }
  assert.doesNotMatch(styles, /(?<![a-z])\d*\.?\d+vh\b/, "use dvh or svh, never vh");
  assert.doesNotMatch(styles, /animation-iteration-count:\s*infinite/i);
});

test("the visual system keeps one accent, theme and focus safeguards, and no template tells", () => {
  const styles = css();
  assert.match(styles, /--accent:/);
  assert.doesNotMatch(styles, /--accent-(?:2|secondary|alt|b):/);
  assert.match(styles, /@media \(prefers-color-scheme: dark\)/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /@media \(min-width: 64rem\)/);
  assert.match(styles, /@media \(max-width: 63\.99rem\)/);
  assert.match(styles, /@media print/);
  assert.doesNotMatch(styles, /(?:linear|radial|conic)-gradient/i);
  assert.doesNotMatch(styles, /cursor:\s*none/i);
  assert.doesNotMatch(styles, /backdrop-filter/i);
  for (const font of [/--font-mono/i, /SFMono/i, /Consolas/i, /\bmonospace\b/i, /\bInter\b/]) {
    assert.doesNotMatch(styles, font);
  }
  assert.doesNotMatch(styles, /\.hero\b[^{]*\{[^}]*(?<![a-z-])gap:/s, "the hero grid must use row-gap, never the gap shorthand");
});

test("navigation exposes the current section without scroll listeners or swap hooks", () => {
  const nav = read("src/components/SiteNav.astro");
  assert.match(nav, /IntersectionObserver/);
  assert.match(nav, /aria-current/);
  assert.match(nav, /popovertarget="site-menu"/);
  assert.doesNotMatch(nav, /window\.addEventListener\(["']scroll["']/);
  assert.doesNotMatch(components(), /astro:after-swap/);
});

test("every section heading is a sentence, not a bucket label", () => {
  for (const [id, heading] of Object.entries(portfolio.headings)) {
    assert.ok(heading.split(" ").length >= 3, `heading for ${id} reads as a label: ${heading}`);
    assert.doesNotMatch(heading, /^(Work|Projects|Research|Leadership|Recognition|About|Contact)$/);
  }
});

test("served source rejects theatre-era and heavy-runtime patterns", () => {
  const source = components() + read("src/data/portfolio.ts");
  assert.doesNotMatch(source, /[—–]/, "no em or en dashes in served copy");
  for (const banned of [/three\.js/i, /webgl/i, /scrolltrigger/i, /<canvas/i, /lofi\.mp3/i, /curtain/i, /intermission/i, /end credits/i, /custom cursor/i, /scroll hijack/i, /<(?:video|audio)\b[^>]*\bautoplay\b/i, /<iframe/i]) {
    assert.doesNotMatch(source, banned);
  }
  // Demos may play muted when scrolled into view, never on load, and never with sound without a tap.
  const video = read("src/components/Video.astro");
  assert.match(video, /IntersectionObserver/);
  assert.match(video, /youtube-nocookie\.com/);
  assert.match(video, /mute=\$\{muted \? 1 : 0\}/);
  assert.match(video, /prefers-reduced-motion: reduce/);
  assert.match(video, /preload="none"/);
});

test("package pins Astro 7, Node 24, and Sharp for the crop pipeline", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.equal(packageJson.devDependencies.astro, "^7.1.3");
  assert.match(packageJson.devDependencies.sharp, /^\^0\.3\d/);
  assert.equal(packageJson.engines.node, ">=24");
  assert.equal(read(".nvmrc").trim(), "24");
  assert.match(read(".gitignore"), /^Pictures\/$/m);
});
