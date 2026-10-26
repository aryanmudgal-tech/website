import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";
import { rules, declarations } from "./lib/css.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

const componentFiles = [
  "src/layouts/BaseLayout.astro",
  "src/components/SiteNav.astro",
  "src/components/Print.astro",
  "src/components/PhotoPopover.astro",
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
const { rooms, extras, ogRoom } = await import(new URL("../src/data/rooms.ts", import.meta.url).href);

const KNOWN_EXCEPTIONS = new Set(["armie-honorable-mention", "men-in-green", "safeline-remarks"]);

function assertSourced(items, label) {
  for (const item of items) {
    const receipts = item.receipts ?? [];
    const sourced = receipts.length > 0 && receipts.every((receipt) => receipt.href && receipt.label);
    const excepted = item.exception !== undefined && KNOWN_EXCEPTIONS.has(item.exception);
    assert.ok(sourced || excepted, `${label}: "${item.title ?? item.name ?? item.company}" needs a receipt or a known exception`);
  }
}

test("sections keep the approved order", () => {
  const page = read("src/pages/index.astro");
  let previous = -1;
  for (const marker of ["<SiteNav", "<main", "<Hero", "<Experience", "<Projects", "<Trajectory", "<Research", "<Leadership", "<Recognition", "<About", "</main>", "<SiteFooter"]) {
    const position = page.indexOf(marker);
    assert.ok(position > previous, `${marker} must appear after the previous marker`);
    previous = position;
  }
  assert.doesNotMatch(page, /<Frame|class="rooms"/);
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

test("rooms stay twelve, captioned, and owned", () => {
  assert.equal(rooms.length, 12);
  assert.equal(extras.length, 8);
  for (const room of rooms) {
    assert.doesNotMatch(room.caption, /\b1 of \d+/, `room ${room.id} caption repeats a denominator`);
    assert.ok(room.alt.length >= 30, `room ${room.id} alt is too short`);
    assert.equal("fit" in room, false, `room ${room.id} still has fit`);
    assert.ok(room.aspect === undefined || ["3:2", "4:5", "natural"].includes(room.aspect), `room ${room.id} aspect ${room.aspect}`);
  }
  assert.equal(rooms.find((room) => room.id === "pillar").aspect, "4:5");
  for (const id of ["streamfair", "contact"]) assert.equal(rooms.find((room) => room.id === id).aspect, "natural");
  assert.equal(ogRoom, "pillar");
  for (const extra of extras) assert.ok(rooms.some((room) => room.id === extra.room), `extra ${extra.id} points at an unknown room`);
  const source = components();
  for (const id of ["pillar", "hero", "research", "contact"]) assert.match(source, new RegExp(`<Print[^>]*\\broom=["']${id}["']`), `no print for room ${id}`);
  assert.match(read("src/components/Projects.astro"), /room=\{project\.id\}/);
  assert.match(read("src/components/Recognition.astro"), /room=\{award\.id\}/);
  assert.match(read("src/components/Leadership.astro"), /room=\{item\.roomId\}/);
  assert.match(read("src/components/Print.astro"), /data-room=\{room\}/);
  assert.match(read("src/components/Print.astro"), /popovertarget=\{`photo-\$\{room\}`\}/);
  const styles = css();
  for (const room of rooms) assert.equal(styles.includes(`--r-${room.id}`), false, `frame timeline --r-${room.id} remains`);
});

// Animations are allowed anywhere; the only motion rule left is that reduced motion is handled.
test("reduced motion is still handled and no vh units remain", () => {
  const styles = css();
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/, "missing reduced-motion block");
  assert.doesNotMatch(styles, /(?<![a-z])\d*\.?\d+vh\b/, "use dvh or svh, never vh");
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
  const layout = read("src/layouts/BaseLayout.astro");
  assert.match(styles, /"Source Serif 4"/);
  assert.match(styles, /"Instrument Sans"/);
  assert.doesNotMatch(styles + layout, /Newsreader/);
  assert.doesNotMatch(styles, /\bcursive\b|Kalam/i);
  const accents = [...styles.matchAll(/--accent:\s*([^;]+);/g)].map((match) => match[1].trim().toUpperCase());
  assert.ok(accents.length >= 2, "light and dark accents");
  for (const accent of accents) assert.ok(["#005BBB", "#7DB0FF"].includes(accent), `--accent is ${accent}`);
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

test("served source rejects theatre-era patterns, autoplay, and raw iframes", () => {
  const source = components() + read("src/data/portfolio.ts");
  assert.doesNotMatch(source + read("src/data/rooms.ts") + css(), /[—–]/, "no em or en dashes in served copy, captions or CSS");
  for (const banned of [/lofi\.mp3/i, /curtain/i, /intermission/i, /end credits/i, /custom cursor/i, /scroll hijack/i, /<(?:video|audio)\b[^>]*\bautoplay\b/i, /<iframe/i]) {
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
  assert.equal(packageJson.devDependencies["perfect-freehand"], "1.2.2");
  assert.equal(packageJson.dependencies, undefined);
  assert.match(read(".gitignore"), /^Pictures\/$/m);
});

const fixtureCopy = () => JSON.parse(read("tests/fixtures/copy-v3.json"));
const MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December";
const COLOPHON_TYPE_V4 = "Set in Source Serif 4 and Instrument Sans.";
const COLOPHON_VERSION_V4 = new RegExp(`^v4, (?:${MONTHS}) 2026\\. v3 \\(September 2026\\) dissolved its photos as you scrolled\\. v2 \\(July 2026\\) was a plain page\\. v1 \\(June 2026\\) had a projector and a mini-golf game\\.$`);
const pick = (object, keys) => Object.fromEntries(keys.map((key) => [key, object[key]]));

test("copy matches the v3 freeze", () => {
  const fixture = fixtureCopy();
  const current = JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(portfolio).filter(([key]) => key !== "titleBlock"))));
  const { colophon, ...rest } = current;
  const { colophon: frozen, ...frozenRest } = fixture.portfolio;
  assert.deepEqual(rest, frozenRest);
  assert.ok(colophon.type === frozen.type || colophon.type === COLOPHON_TYPE_V4, `colophon.type changed: ${colophon.type}`);
  assert.ok(colophon.version === frozen.version || COLOPHON_VERSION_V4.test(colophon.version), `colophon.version changed: ${colophon.version}`);
  assert.deepEqual({ ...colophon, type: 0, version: 0 }, { ...frozen, type: 0, version: 0 });
  assert.deepEqual(JSON.parse(JSON.stringify(rooms.map((room) => pick(room, ["id", "caption", "alt", "receipt", "source"])))), fixture.rooms);
  assert.deepEqual(JSON.parse(JSON.stringify(extras.map((extra) => pick(extra, ["id", "caption", "alt", "source", "room"])))), fixture.extras);
});

test("the 1 of 2 receipt is the same everywhere it renders", () => {
  const ledgerReceipt = portfolio.ledger[0].receipt;
  const award = portfolio.recognitions.find((item) => item.id === "pillar").receipts[0];
  const room = rooms.find((item) => item.id === "pillar").receipt;
  for (const other of [award, room]) {
    assert.equal(other.label, ledgerReceipt.label);
    assert.equal(other.href, ledgerReceipt.href);
  }
});

test("the title block splits the fixation lines word for word", () => {
  const { titleBlock, identity } = portfolio;
  assert.deepEqual(titleBlock.map((row) => row.label), ["Study", "Work", "Next"]);
  assert.equal(titleBlock.flatMap((row) => row.long).join(" "), identity.fixationLine);
  assert.equal(titleBlock.flatMap((row) => row.short).join(" "), identity.fixationLineShort);
  assert.equal(titleBlock[2].long.length, 2);
  assert.equal(titleBlock[2].short.length, 2);
});

// Spec 5.2: the only selectors each stock may paint (::before and ::after are ignored when matching).
const STOCK_SELECTORS = {
  marigold: [".fig--tape", ".hl--marigold", ".plate--recognition"],
  sky: [".p-sky", ".hl--sky", ".plate--work"],
  leaf: [".p-braille", ".plate--leadership", ".plate--leadership .duo"],
  kraft: [".p-plan", ".plate--route", ".plate--about"],
  vermilion: [".plate--projects", ".plate--projects .duo", ".video--demo .video__mat", ".tape--vermilion"],
  ub: [".plate--research", ".plate__band"],
};

test("stocks are declared once, paint only their selectors, and hex stays in the token blocks", () => {
  const all = rules(css());
  const isLightRoot = (rule) => rule.selector === ":root" && rule.context.length === 0;
  const isDarkRoot = (rule) => rule.selector === ":root" && rule.context.some((c) => c.includes("prefers-color-scheme: dark"));
  const isSlab = (rule) => rule.selector.split(",").some((s) => s.trim() === ".slab");
  const isPrint = (rule) => rule.context.some((c) => c.startsWith("@media print"));
  for (const rule of all) {
    if (isLightRoot(rule) || isDarkRoot(rule) || isSlab(rule) || isPrint(rule)) continue;
    assert.doesNotMatch(rule.body, /#[0-9a-fA-F]{3,8}\b|%23/, `hex literal in ${rule.selector}`);
  }
  const light = all.filter(isLightRoot).flatMap(declarations);
  const stockHex = {};
  for (const name of Object.keys(STOCK_SELECTORS)) {
    const property = `--stock-${name}`;
    const found = light.filter(([key]) => key === property);
    assert.equal(found.length, 1, `${property} is declared once in :root`);
    stockHex[name] = found[0][1].toLowerCase();
    for (const rule of all.filter((r) => !isLightRoot(r))) {
      assert.ok(!declarations(rule).some(([key]) => key === property), `${property} redeclared in ${rule.selector}`);
    }
  }
  for (const [name, hex] of Object.entries(stockHex)) {
    const reuse = all.flatMap((rule) => declarations(rule)
      .filter(([, value]) => value.toLowerCase().includes(hex))
      .map(([key]) => (isDarkRoot(rule) ? `dark ${key}` : key)))
      .filter((key) => key !== `--stock-${name}` && !key.startsWith("--page-") && !(hex === "#005bbb" && key === "--accent"));
    assert.deepEqual(reuse, [], `${hex} is reused outside --stock-${name}`);
  }
  for (const rule of all) {
    for (const [key, value] of declarations(rule)) {
      const uses = [...value.matchAll(/var\(--stock-([a-z]+)\)/g)].map((match) => match[1]);
      if (!uses.length) continue;
      assert.ok(key === "background" || key === "background-color", `var(--stock-*) in ${key} of ${rule.selector}`);
      for (const name of uses) {
        for (const selector of rule.selector.split(",").map((s) => s.trim().replace(/::(?:before|after)/g, ""))) {
          assert.ok(STOCK_SELECTORS[name].some((allowed) => selector === allowed || selector.endsWith(allowed)), `${selector} may not use --stock-${name}`);
        }
      }
    }
  }
  for (const selector of [".fig--tape", ".hl--sky", ".hl--marigold"]) {
    for (const rule of all.filter((r) => r.selector === selector)) assert.match(rule.body, /color:\s*var\(--on-stock\)/, `${selector} sets ink on its stock`);
  }
});

test("no pencil or line art sits on marigold", async () => {
  const { paperAssets } = await import(new URL("../src/data/paper.ts", import.meta.url).href);
  const files = paperAssets.filter((asset) => asset.kind === "pencil" || asset.kind === "line").map((asset) => asset.file);
  for (const rule of rules(css())) {
    if (files.some((file) => rule.body.includes(file))) assert.doesNotMatch(rule.selector, /--recognition|fig--tape|hl--marigold/, `${rule.selector} puts pencil on marigold`);
  }
});
