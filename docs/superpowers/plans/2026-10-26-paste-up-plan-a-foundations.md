# Paste-Up v4, Plan A: Foundations and Paper Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land milestones 1 and 2 of `docs/superpowers/specs/2026-10-26-paste-up-design.md`: the copy freeze, the title-block data, the v4 tokens, fonts and type on the still-running v3 layout, then the seeded paper-art pipeline with every generated asset committed and tested.

**Architecture:** Milestone 1 changes data exports, `BaseLayout.astro`, `SiteNav.astro` and `global.css` only, guarded by new source and build tests; the v3 frame keeps running. Milestone 2 adds `scripts/paper.mjs` with its generators in `scripts/paper/`, a hand-authored manifest `src/data/paper.ts`, the committed outputs in `src/assets/paper/`, and `tests/paper.test.mjs`, which regenerates every code-drawn file and compares bytes. No page uses the paper assets until Plan B.

**Tech Stack:** Astro 7 static output, Node 24 (type stripping lets tests import `.ts`), `node:test`, sharp 0.34, perfect-freehand 1.2.2 (pinned exactly), plain CSS.

---

## Conventions for every task

- Branch `v4-paste-up`. Never push to `main`, never merge, never run the deploy workflow by hand.
- Node: prefix every command with `PATH=/opt/homebrew/opt/node@24/bin:$PATH` (the shell default is Node 20, which Astro 7 refuses).
- Commits are authored as Aryan (machine gitconfig) with **no** `Co-Authored-By`, `Claude-Session` or "Generated with" lines. Push after every commit: `git push`.
- `npm test` runs the source, workflow and (from Task 12) paper tests. `npm run check` runs tests, build and built-output tests; every task that touches the page ends with it green.
- Copy rule: no em or en dashes anywhere in served copy, CSS or data.

## Deviations from the spec, decided while planning (record them in the spec in Task 17)

1. **Stock hex reuse.** `--page-marigold` and `--page-sky` (5.2b) share the hex of `--stock-marigold` and `--stock-sky`. The stocks-and-hex test (10.2) therefore allows a stock hex in its own `--stock-*` declaration, in any `--page-*` declaration, and `#005BBB` as the light `--accent`.
2. **Edge-strip seeds.** An edge's outer and inner masks must come from one tear to register, so `edge-top.outer.svg` and `edge-top.inner.svg` both use seed 51, and both bottom files use seed 53 (the spec listed 51, 52, 53, 54).
3. **Simplification and budgets, measured on 26 October 2026.** Pencil strokes are simplified by default (`STROKE_EPS` 0.12 px). The sky pieces use `eps` 0.25 to fit 4,000 B. The production log uses `eps` 0.5 (spec said 0.15) to fit 16 KB. `hand.png` is a 16-colour palette PNG; with the paper cut-off at L 206 (the scan's paper is 209 to 226) it is 3,983 B, inside the spec's 12 KB. The cell field draws each cell as one thin closed line, so `cells.svg` is about 13 KB.
4. **Fallback-face metrics** are measured now (Task 5) rather than at milestone 1.

## File map

| File | Responsibility | Task |
|---|---|---|
| `scripts/freeze-copy.mjs` | writes the v3 copy fixture | 1 |
| `tests/fixtures/copy-v3.json` | every served v3 string | 1 |
| `src/data/portfolio.ts` | gains `TitleRow` and `titleBlock` | 2 |
| `tests/lib/css.mjs` | a tiny CSS rule splitter for tests | 6 |
| `src/layouts/BaseLayout.astro` | font link, `theme-color` | 5 |
| `src/components/SiteNav.astro` | `data-label` on nav links | 7 |
| `src/styles/global.css` | tokens, fallback faces, type, focus, nav | 5, 6, 7 |
| `tests/portfolio-source.test.mjs` | freeze, title block, dashes, type, stocks and hex, package, marigold | 1 to 7, 10, 16 |
| `tests/portfolio-build.test.mjs` | no theme toggle, scripts inline | 8, 15 |
| `package.json` | perfect-freehand, version, scripts | 10, 12 |
| `scripts/paper/art.mjs`, `drawings.mjs`, `svg.mjs`, `images.mjs`, `tokens.mjs`, `jobs.mjs` | generators and recipes | 11 |
| `src/data/paper.ts` | the provenance manifest and job list | 11 |
| `scripts/paper.mjs` | the CLI | 13 |
| `tests/paper.test.mjs` | provenance, determinism, budgets, SVG rules, token drift | 12 |
| `src/assets/paper/*` | generated, committed | 14 |
| `astro.config.mjs` | inline limit, `cssTarget` | 15 |

---

## Milestone 1: Foundations

### Task 1: Freeze the v3 copy

**Files:**
- Create: `scripts/freeze-copy.mjs`, `tests/fixtures/copy-v3.json`
- Modify: `tests/portfolio-source.test.mjs`

- [x] **Step 1: Confirm `src` is still v3**

Run: `git diff --stat 4d67042 HEAD -- src`
Expected: no output.

- [x] **Step 2: Write the failing test** (append to `tests/portfolio-source.test.mjs`)

```js
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
```

- [x] **Step 3: Run it and watch it fail**

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm test`
Expected: "copy matches the v3 freeze" fails with ENOENT on `tests/fixtures/copy-v3.json`; "the 1 of 2 receipt" passes.

- [x] **Step 4: Write the freezer**

```js
// Writes tests/fixtures/copy-v3.json: every served string of the v3 data, so v4 cannot change copy by accident.
// Run once before any data edit. Regenerate only in a commit that applies a content change Aryan approved.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const portfolio = await import("../src/data/portfolio.ts");
const { rooms, extras } = await import("../src/data/rooms.ts");
const pick = (object, keys) => Object.fromEntries(keys.map((key) => [key, object[key]]));

const copy = {
  portfolio: Object.fromEntries(Object.entries(portfolio).filter(([key]) => key !== "titleBlock")),
  rooms: rooms.map((room) => pick(room, ["id", "caption", "alt", "receipt", "source"])),
  extras: extras.map((extra) => pick(extra, ["id", "caption", "alt", "source", "room"])),
};
const file = join(root, "tests", "fixtures", "copy-v3.json");
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, `${JSON.stringify(copy, null, 2)}\n`);
console.log("wrote tests/fixtures/copy-v3.json");
```

- [x] **Step 5: Freeze, then run the tests**

Run: `PATH=/opt/homebrew/opt/node@24/bin:$PATH node scripts/freeze-copy.mjs && PATH=/opt/homebrew/opt/node@24/bin:$PATH npm test`
Expected: "wrote tests/fixtures/copy-v3.json", then all tests pass.

- [x] **Step 6: Commit**

```bash
git add scripts/freeze-copy.mjs tests/fixtures/copy-v3.json tests/portfolio-source.test.mjs
git commit -m "test: freeze the v3 copy before v4 touches the data"
git push
```

### Task 2: The title block

**Files:** Modify `src/data/portfolio.ts` (after `identity`), `tests/portfolio-source.test.mjs`

- [x] **Step 1: Failing test**

```js
test("the title block splits the fixation lines word for word", () => {
  const { titleBlock, identity } = portfolio;
  assert.deepEqual(titleBlock.map((row) => row.label), ["Study", "Work", "Next"]);
  assert.equal(titleBlock.flatMap((row) => row.long).join(" "), identity.fixationLine);
  assert.equal(titleBlock.flatMap((row) => row.short).join(" "), identity.fixationLineShort);
  assert.equal(titleBlock[2].long.length, 2);
  assert.equal(titleBlock[2].short.length, 2);
});
```

- [x] **Step 2: Run, expect failure** (`titleBlock` is undefined: "Cannot read properties of undefined (reading 'map')").

- [x] **Step 3: Add the export after `identity`**

```ts
/** The fixation lines as three labelled rows (spec 4.2). Splits the sentences; adds no words. */
export type TitleRow = {
  readonly label: "Study" | "Work" | "Next";
  readonly long: readonly string[];
  readonly short: readonly string[];
};

export const titleBlock: readonly TitleRow[] = [
  { label: "Study", long: ["B.S. Computer Science, University at Buffalo, December 2026, GPA 3.93."], short: ["CS, University at Buffalo, Dec 2026."] },
  { label: "Work", long: ["Software Engineer Intern at Linde, Summer 2026; before that Meta Layer Initiative (2025) and HCLTech, Dubai (2024)."], short: ["SWE Intern, Linde, 2026."] },
  { label: "Next", long: ["Seeking new-grad software or forward-deployed engineering roles from January 2027.", "New York City, open to relocation."], short: ["Seeking new-grad SWE roles from Jan 2027.", "NYC, open to relocation."] },
];
```

- [x] **Step 4: `npm test` passes** (the freeze ignores `titleBlock`).
- [x] **Step 5: Commit** `feat: titleBlock splits the fixation lines into Study, Work and Next`, push.

### Task 3: Widen the dash ban to rooms and CSS

**Files:** Modify `tests/portfolio-source.test.mjs` (test "served source rejects theatre-era patterns, autoplay, and raw iframes")

- [x] **Step 1:** Replace `assert.doesNotMatch(source, /[—–]/, "no em or en dashes in served copy");` with
`assert.doesNotMatch(source + read("src/data/rooms.ts") + css(), /[—–]/, "no em or en dashes in served copy, captions or CSS");`
- [x] **Step 2:** `npm test` passes (none exist today, checked 26 October 2026).
- [x] **Step 3: Commit** `test: the dash ban covers captions and CSS`, push.

### Task 4: Type is Source Serif 4 and Instrument Sans (test first)

**Files:** Modify `tests/portfolio-source.test.mjs` (test "the visual system keeps one accent, theme and focus safeguards, and no template tells")

- [x] **Step 1: Add at the end of that test**

```js
  const layout = read("src/layouts/BaseLayout.astro");
  assert.match(styles, /"Source Serif 4"/);
  assert.match(styles, /"Instrument Sans"/);
  assert.doesNotMatch(styles + layout, /Newsreader/);
  assert.doesNotMatch(styles, /\bcursive\b|Kalam/i);
  const accents = [...styles.matchAll(/--accent:\s*([^;]+);/g)].map((match) => match[1].trim().toUpperCase());
  assert.ok(accents.length >= 2, "light and dark accents");
  for (const accent of accents) assert.ok(["#005BBB", "#7DB0FF"].includes(accent), `--accent is ${accent}`);
```

- [x] **Step 2: Run, expect failure** on `/"Source Serif 4"/`.

### Task 5: Fonts, fallback faces and v4 tokens

**Files:** Modify `src/layouts/BaseLayout.astro`, `src/styles/global.css`, `src/components/Video.astro` (none: the hexes live in CSS)

- [x] **Step 1: Font link.** In `BaseLayout.astro` replace the Google Fonts `href` with
`https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,20,400&display=swap`
and the two `theme-color` contents with `#FBF8F2` (light) and `#161512` (dark).

- [x] **Step 2: Tokens.** In `global.css` replace the light `:root { ... }` block and the dark `@media (prefers-color-scheme: dark) { :root { ... } }` block (everything before `*,`) with:

```css
/* Fallback faces, measured 26 October 2026 against the real fixation line, so the font swap does not move the first screen. */
@font-face { font-family: "Source Serif 4 Fallback"; src: local("Georgia"); size-adjust: 99.75%; ascent-override: 103.86%; descent-override: 33.58%; line-gap-override: 0%; }
@font-face { font-family: "Source Serif 4 Fallback Noto"; src: local("Noto Serif"); size-adjust: 93.71%; ascent-override: 110.55%; descent-override: 35.75%; line-gap-override: 0%; }
@font-face { font-family: "Instrument Sans Fallback"; src: local("Arial"), local("Helvetica"); size-adjust: 102.83%; ascent-override: 94.33%; descent-override: 24.31%; line-gap-override: 0%; }
@font-face { font-family: "Instrument Sans Fallback Roboto"; src: local("Roboto"); size-adjust: 104.01%; ascent-override: 93.26%; descent-override: 24.04%; line-gap-override: 0%; }

:root {
  color-scheme: light dark;
  /* theme tokens (spec 5.1) */
  --paper: #FBF8F2;
  --paper-2: #F3EDE1;
  --ink: #1B1A17;
  --ink-2: #45413A;
  --muted: #635E55;
  --line: #DDD5C6;
  --accent: #005BBB;
  --on-accent: #FFFFFF;
  --slab: #1B1A17;
  --lift: rgba(27, 26, 23, .26);
  --lift-far: rgba(27, 26, 23, .12);
  /* fixed tokens: paper, the same in both themes */
  --on-stock: #1B1A17;
  --fibre: #FFFDF6;
  --pencil: #2B2925;
  --tape: #E9DDC2;
  --graph-line: #A9C7E0;
  --on-slab: var(--fibre);
  --on-slab-muted: #CFC8BA;
  --stock-marigold: #F2A516;
  --stock-vermilion: #EC5B3B;
  --stock-sky: #9CC8EE;
  --stock-leaf: #2F9E5B;
  --stock-kraft: #D6BC92;
  --stock-ub: #005BBB;
  --page-marigold: #F2A516;
  --page-sky: #9CC8EE;
  --page-mint: #8FD3A8;
  --page-coral: #F59A80;
  --page-rose: #F2A9BF;
  --page-lilac: #CDB8F0;
  --page-ink-2: #312E29;
  --serif: "Source Serif 4", "Source Serif 4 Fallback", "Source Serif 4 Fallback Noto", Georgia, serif;
  --sans: "Instrument Sans", "Instrument Sans Fallback", "Instrument Sans Fallback Roboto", system-ui, sans-serif;
  /* layout; the v3 frame keeps --frame-w until Plan B retires it */
  --shell: 80rem;
  --gutter: 16px;
  --measure: 46rem;
  --header-height: 3.75rem;
  --frame-w: clamp(18rem, 30vw, 30rem);
  --radius: 3px;
}

@media (min-width: 48rem) {
  :root { --gutter: 32px; }
}

@media (min-width: 68.75rem) {
  :root { --gutter: 48px; }
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper: #161512;
    --paper-2: #201E1A;
    --ink: #F2EDE3;
    --ink-2: #CFC8BA;
    --muted: #A39C8E;
    --line: #3A362F;
    --accent: #7DB0FF;
    --on-accent: #0B1220;
    --slab: #25231F;
    --lift: rgba(0, 0, 0, .6);
    --lift-far: rgba(0, 0, 0, .35);
  }
}
```

- [x] **Step 3: Rename retired tokens** (exact, whole-file):

```bash
sed -i '' -e 's/var(--font-display)/var(--serif)/g' -e 's/var(--font-text)/var(--sans)/g' \
  -e 's/var(--accent-text)/var(--accent)/g' -e 's/var(--accent-ink)/var(--on-accent)/g' \
  -e 's/var(--paper-3)/var(--paper-2)/g' \
  -e 's/text-decoration-color: var(--line-2)/text-decoration-color: currentColor/g' \
  -e 's/var(--line-2)/var(--ink)/g' src/styles/global.css
```

- [x] **Step 4: Tokenise the v3 video hexes.** In `.video__badge` replace `background: rgb(20 20 20 / 0.72);` with `background: var(--fibre);` and `color: #fff;` with `color: var(--on-stock);`. In `.video__frame` and `.video__file` replace `background: #000;` with `background: var(--on-stock);`.

- [x] **Step 5: Focus.** Change `:focus-visible { outline: 2px solid var(--accent); ...}` to `outline: 3px solid var(--accent);`.

- [x] **Step 6: Run** `npm test`: Task 4's assertions now pass. Then `npm run check` green.

- [x] **Step 7: Commit** `feat: v4 tokens, Source Serif 4 with measured fallback faces`, push.

### Task 6: Stocks and hex stay in their place

**Files:** Create `tests/lib/css.mjs`; modify `tests/portfolio-source.test.mjs`

- [x] **Step 1: The splitter**

```js
// Splits our own stylesheet into rules, each with the at-rule preludes around it. Not a general CSS parser:
// it needs balanced braces and no braces inside strings, which global.css satisfies.
export function rules(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  const stack = [];
  let buffer = "";
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === "{") {
      const prelude = buffer.trim();
      buffer = "";
      if (prelude.startsWith("@") && !/^@(?:font-face|page)\b/.test(prelude)) {
        stack.push(prelude);
        continue;
      }
      let depth = 1;
      let j = i + 1;
      for (; j < source.length && depth; j++) {
        if (source[j] === "{") depth++;
        else if (source[j] === "}") depth--;
      }
      out.push({ selector: prelude, body: source.slice(i + 1, j - 1), context: [...stack] });
      i = j - 1;
    } else if (char === "}") {
      stack.pop();
      buffer = "";
    } else if (char === ";") {
      buffer = "";
    } else {
      buffer += char;
    }
  }
  return out;
}

export function declarations(rule) {
  return rule.body.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const colon = part.indexOf(":");
    return [part.slice(0, colon).trim(), part.slice(colon + 1).trim()];
  });
}
```

- [x] **Step 2: The test** (import at the top: `import { rules, declarations } from "./lib/css.mjs";`)

```js
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
```

- [x] **Step 3: Run** `npm test`. Expected: pass (stocks are declared and not yet used; the video hexes were tokenised in Task 5). If it fails on a hex, the message names the rule; tokenise it.
- [x] **Step 4: Commit** `test: stocks paint only their selectors and hex stays in the token blocks`, push.

### Task 7: Type scale, nav and ledger on the v3 layout

**Files:** Modify `src/components/SiteNav.astro`, `src/styles/global.css`

- [x] **Step 1: Reserve bold width in the nav.** In both `navItems.map` blocks of `SiteNav.astro` change `<li><a href={item.href}>{item.label}</a></li>` to `<li><a href={item.href} data-label={item.label}>{item.label}</a></li>`.

- [x] **Step 2: Append before `@media print` in `global.css`:**

```css
/* v4 type on the v3 layout (spec 5.3). Plan B moves each rule into its rebuilt component. */

body { font: 400 18px/28px var(--serif); font-optical-sizing: auto; font-variant-numeric: tabular-nums lining-nums; }
h1 { font: 600 72px/72px var(--serif); font-variation-settings: "opsz" 60; letter-spacing: -0.02em; }
h2 { font: 400 44px/50px var(--serif); font-variation-settings: "opsz" 48; letter-spacing: -0.012em; max-width: 900px; text-wrap: balance; }
h3 { font: 600 26px/32px var(--serif); font-variation-settings: "opsz" 32; letter-spacing: -0.008em; }

.wordmark { font: 600 20px/24px var(--serif); letter-spacing: -0.005em; }
.site-nav a { display: inline-flex; flex-direction: column; justify-content: center; font: 400 15px/20px var(--sans); border-bottom: 3px solid transparent; }
.site-nav a::after { content: attr(data-label) / ""; height: 0; overflow: hidden; visibility: hidden; font-weight: 600; pointer-events: none; }
.site-nav a[aria-current="location"] { color: var(--ink); font-weight: 600; border-bottom-color: var(--ink); }
.site-nav--menu a { font: 500 16px/20px var(--sans); }

.label { font: 600 11.5px/16px var(--sans); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.fixation { font: 400 17px/25px var(--serif); color: var(--ink); }
.ledger { border-top-color: var(--ink); }
.ledger__row { grid-template-columns: 168px minmax(0, 1fr); align-items: start; }
.ledger__fraction { font: 600 34px/40px var(--serif); font-variation-settings: "opsz" 40; letter-spacing: -0.01em; white-space: nowrap; }
.ledger__text { font: 400 16px/22px var(--sans); }
.ledger__row--bold .ledger__text { font-weight: 600; }
.action--primary { min-height: 48px; font: 600 16px/20px var(--sans); }
.action--text { min-height: 48px; font: 600 15px/20px var(--sans); }

.meta, .row__meta, .card__event, .card__team { font: 400 14px/20px var(--sans); color: var(--muted); }
.row__meta strong { font: 600 22px/28px var(--serif); color: var(--ink); }
.row__body h3 { font: 600 24px/32px var(--serif); }
.chapter__lede { font: 400 20px/30px var(--serif); color: var(--ink-2); }
.card__result { font: 600 18px/26px var(--serif); }
.card__aside { font: italic 400 18px/28px var(--serif); color: var(--ink-2); }
.source { font: 500 13px/18px var(--sans); }
.video__caption, .room__caption, .chapter-figure figcaption, .photo-popover__caption { font: 400 13px/19px var(--sans); color: var(--muted); }
.video__badge { font: 600 12px/16px var(--sans); }
.route__period { font: 400 15px/22px var(--sans); color: var(--muted); }
.route a { font: 400 18px/28px var(--serif); }
.award__fraction { font: 600 64px/64px var(--serif); font-variation-settings: "opsz" 60; letter-spacing: -0.02em; }
.award__denominator { font: italic 400 22px/30px var(--serif); color: var(--ink-2); }
.about-lines { font: 400 22px/32px var(--serif); }
.contact-link { font: 400 34px/44px var(--serif); font-variation-settings: "opsz" 40; }
.profiles a { font: 500 16px/22px var(--sans); }
.colophon { font: 400 13px/19px var(--sans); }
.not-found h1 { font: 600 56px/60px var(--serif); }
.chapter { padding-top: 96px; }

@media (min-width: 64rem) and (max-width: 68.74rem) {
  .ledger__row { grid-template-columns: 136px minmax(0, 1fr); }
  .ledger__fraction { font-size: 28px; line-height: 34px; }
  .contact-link { font-size: 26px; line-height: 34px; }
}

@media (max-width: 47.99rem) {
  body { font-size: 17px; line-height: 26px; }
  h1 { font-size: 40px; line-height: 44px; }
  h2 { font-size: 30px; line-height: 34px; }
  h3 { font-size: 22px; line-height: 28px; }
  .wordmark { font-size: 18px; line-height: 22px; }
  .fixation { font-size: 15px; line-height: 21px; }
  .ledger__row { grid-template-columns: 112px minmax(0, 1fr); }
  .ledger__fraction { font-size: 22px; line-height: 26px; }
  .ledger__text { font-size: 15px; line-height: 21px; }
  .row__meta strong { font-size: 20px; line-height: 26px; }
  .row__body h3 { font-size: 21px; line-height: 28px; }
  .chapter__lede { font-size: 18px; line-height: 27px; }
  .card__result { font-size: 17px; line-height: 24px; }
  .card__aside { font-size: 17px; line-height: 26px; }
  .route__period { font-size: 14px; line-height: 20px; }
  .route a { font-size: 17px; line-height: 26px; }
  .award__fraction { font-size: 44px; line-height: 44px; }
  .award__denominator { font-size: 18px; line-height: 26px; }
  .about-lines { font-size: 19px; line-height: 28px; }
  .contact-link { font-size: 22px; line-height: 30px; }
  .not-found h1 { font-size: 40px; line-height: 44px; }
  .chapter { padding-top: 72px; }
}
```

- [x] **Step 3:** `npm run check` green.
- [x] **Step 4: Commit** `feat: v4 type scale, nav bar and ledger on the v3 layout`, push.

### Task 8: No theme toggle ships

**Files:** Modify `tests/portfolio-build.test.mjs`

- [x] **Step 1:** Add

```js
test("no theme toggle ships", () => {
  assert.doesNotMatch(read(client("index.html")), /data-theme/);
});
```

- [x] **Step 2:** `npm run check` green. **Commit** `test: the built page has no theme toggle`, push.

### Task 9: Milestone 1 visual check (scratchpad, not committed)

- [x] **Step 1:** Build with the dist base path and serve it: `BASE_URL=/ PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run build`, then shoot `dist/client/index.html` with Playwright's Chromium (`~/.npm/_npx/9833c18b2d85bc59/node_modules/playwright`, executable `~/Library/Caches/ms-playwright/chromium-1243/...`) at 1280x800, 1024x768, 390x844 and 320x640 in light and dark, recording `document.documentElement.scrollWidth` at each.
- [x] **Step 2:** Pass when `scrollWidth` equals the viewport width at all four sizes, the h1 sits on one line at 1280 and two at 390, "Co-author" does not wrap, and Email sits above the fold at 390x844.
- [x] **Step 3:** CLS with late fonts: route `fonts.gstatic.com` with a 1,500 ms delay, collect `layout-shift` entries with a `PerformanceObserver` (`buffered: true`), and require a total at or below 0.05 at 1280x800 and 390x844.
- [x] **Step 4:** Show Aryan the screenshots.

---

## Milestone 2: Paper pipeline

### Task 10: Pin perfect-freehand

**Files:** Modify `package.json`, `tests/portfolio-source.test.mjs` (test "package pins Astro 7, Node 24, and Sharp for the crop pipeline")

- [x] **Step 1: Failing test.** Add to that test:

```js
  assert.equal(packageJson.devDependencies["perfect-freehand"], "1.2.2");
  assert.equal(packageJson.dependencies, undefined);
```

- [x] **Step 2:** `npm test` fails on perfect-freehand.
- [x] **Step 3:** `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm install --save-dev --save-exact perfect-freehand@1.2.2`, then set `"version": "4.0.0"` and add `"paper": "node scripts/paper.mjs"` to `scripts`.
- [x] **Step 4:** `npm test` passes. **Commit** `chore: pin perfect-freehand 1.2.2 for the paper pipeline`, push.

### Task 11: Generators, recipes and the manifest

**Files:** Create `scripts/paper/art.mjs`, `scripts/paper/drawings.mjs`, `scripts/paper/svg.mjs`, `scripts/paper/images.mjs`, `scripts/paper/tokens.mjs`, `scripts/paper/jobs.mjs`, `src/data/paper.ts`

- [x] **Step 1: `art.mjs`.** Copy `docs/superpowers/mocks/2026-10-26-paste-up/tools/art.mjs`, then:
  - export `rdp` and `edgeModel`;
  - after `const R1 = ...` add `export const STROKE_EPS = 0.12;` and give `strokeToD(stroke, eps = 0)` a first line `if (eps > 0) stroke = rdp(stroke, eps);`;
  - `pline` and `pstroke` pass `o.eps ?? STROKE_EPS` as `strokeToD`'s second argument; `tick` passes `eps: o.eps ?? STROKE_EPS` to `pstroke`;
  - append `edgeStrip`, `tapeEnd`, `ribbonBand`, `solidMask` and `playGlyph`:

```js
/**
 * A periodic torn edge for a strip w x h that tiles with repeat-x. The tear runs along one long side:
 * side 'top' keeps the paper below the tear, 'bottom' keeps the paper above it. The first 60px
 * cross-fade from the tear's own continuation past w, so the strip's two ends meet at the same depth.
 */
export function edgeStrip(w, h, seed, side, o = {}) {
  const fade = 60;
  const E = edgeModel(w + fade, seed, { kind: 'torn', depth: o.depth ?? 7, wave: o.wave ?? 70, rimMax: o.rimMax ?? 4 });
  const periodic = f => s => {
    if (s >= fade) return f(s);
    const t = s / fade, k = t * t * (3 - 2 * t);
    return f(s + w) * (1 - k) + f(s) * k;
  };
  const build = which => {
    const g = periodic(E[which]);
    const y = s => (side === 'top' ? g(s) : h - g(s));
    const pts = [];
    for (let s = 0; s < w; s += 1.5) pts.push([s, y(s)]);
    pts.push([w, y(0)]);
    if (side === 'top') pts.push([w, h], [0, h]); else pts.push([w, 0], [0, 0]);
    return toD(rdp(pts, o.eps ?? 0.16));
  };
  return { outer: build('outer'), inner: build('inner') };
}

/** One torn end of a tape, w x h. side 'l' tears the left edge, 'r' the right; the other edge is straight. */
export function tapeEnd(w, h, seed, side) {
  const r = rng(seed), nz = noise1(seed + 2);
  const edge = [];
  for (let y = 0; y < h; y += 1.2 + r() * 2.4) edge.push(0.3 + Math.abs(nz(y / 1.7)) * (w * 0.35) + r() * (w * 0.12));
  edge.push(0.3 + r() * (w * 0.3));
  const step = h / (edge.length - 1);
  const pts = side === 'l'
    ? [[w, 0], ...edge.map((x, i) => [x, i * step]), [w, h]]
    : [[0, 0], ...edge.map((x, i) => [w - x, i * step]), [0, h]];
  return toD(pts);
}

/** The Recognition ribbon: a torn top, cut sides and a notched foot. Returns { outer, inner }. */
export function ribbonBand(w, h, seed) {
  return paper(w, h, seed, {
    t: { kind: 'torn', depth: 5, rimMax: 3 },
    b: { kind: 'cut', notch: 15, skew: -0.6 },
    l: { kind: 'cut' }, r: { kind: 'cut' },
  });
}

/** A full square, the solid middle layer of three-part masks. */
export function solidMask() {
  return 'M0 0h1v1H0z';
}

/** The video play glyph: a triangle with softened corners, 20 x 22. */
export function playGlyph() {
  return 'M3 1.6c0-1 1-1.5 1.8-1l13.9 8.9c.8.5.8 1.6 0 2.1L4.8 20.5c-.8.5-1.8 0-1.8-1z';
}
```

- [x] **Step 2: `drawings.mjs`.** Copy the mock's `tools/drawings.mjs`, then turn its CSS classes into SVG attributes so each file works alone as a mask:
  - import `toD` too;
  - `floorPlan`: swing segments lose `class="stk"`; the return wraps them as `<g fill="none" stroke="#000" stroke-width="1.05" stroke-linecap="round">...</g>` inside the light group; `class="faint"` becomes `opacity=".36"`, `class="light"` becomes `opacity=".72"`;
  - `productionLog(eps = 0.15)` takes an `eps` used by every `pstroke` and `tick` call; the second scribble per row uses `letters: 4`; the printed group becomes `<g opacity=".46"><g fill="none" stroke="#000">lines</g>heads</g>` and the hand group `<g opacity=".86">`;
  - `braille(fibre, ink)` takes token hex: shadow circles `fill="${ink}" fill-opacity=".28"`, dot faces `fill="${fibre}"`, the crescent `stroke="${ink}" stroke-opacity=".2"`, the glint `fill="${fibre}" fill-opacity=".85"`;
  - append `route`, `cellField`, `bracket`, `graphTile` and `grainTile`:

```js
/** Pune to Buffalo to New York City: a solid pencil arc between two pressed stops, then a dashed leg to an open stop,
 *  over a faint construction line. No labels, no scale. Stops at 6.1%, 72.6% and 93.9% of w. */
export function route(w, h, seed) {
  let s = seed;
  const base = h * 0.68, apex = h * 0.2;
  const xa = w * 0.061, xb = w * 0.726, xc = w * 0.939;
  const out = [];
  out.push(`<g opacity=".36">${P(pline(w * 0.02, base + 3, w * 0.98, base + 3.4, s++, { size: 0.55, press: [0.3, 0.5], bow: 0.15, overA: 0, overB: 0, eps: 0.1 }))}</g>`);
  const arc = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60, u = 1 - t, mx = (xa + xb) / 2;
    arc.push([u * u * xa + 2 * u * t * mx + t * t * xb, u * u * base + 2 * u * t * (2 * apex - base) + t * t * base]);
  }
  out.push(P(pstroke(arc, s++, { size: 1.5, press: [0.55, 0.85], taperA: 3, taperB: 3, eps: 0.1 })));
  const dash = Math.max(6, w * 0.012), gap = dash * 0.8;
  for (let x = xb + gap; x + dash < xc - gap; x += dash + gap) out.push(P(pline(x, base, x + dash, base + 0.2, s++, { size: 1.2, overA: 0, overB: 0, bow: 0.1, eps: 0.1 })));
  for (const x of [xa, xb]) {
    const r = rng(s++), pts = [];
    for (let i = 0; i < 11; i++) { const a = (i / 11) * Math.PI * 2, rr = 3.4 * (0.88 + r() * 0.24); pts.push(`${(x + Math.cos(a) * rr).toFixed(2)} ${(base + Math.sin(a) * rr).toFixed(2)}`); }
    out.push(`<path d="M${pts.join('L')}Z"/>`);
  }
  const ring = [];
  for (let i = 0; i <= 26; i++) { const a = (i / 24) * Math.PI * 2; ring.push([xc + Math.cos(a) * 3.6, base + Math.sin(a) * 3.6]); }
  out.push(P(pstroke(ring, s++, { size: 1.1, taperA: 1, taperB: 1, eps: 0.1 })));
  return out.join('');
}

/** A field of freehand cells, Poisson-disc spaced, about one in ten filled at half strength. Depicts no data.
 *  Each cell is one wobbly closed line, so 110 cells stay near 13 KB. */
export function cellField(w, h, seed, count) {
  const r = rng(seed), nz = noise1(seed + 1);
  const cells = [];
  for (let tries = 0; cells.length < count && tries < count * 60; tries++) {
    const d = 10 + r() * 6, x = 6 + r() * (w - 12), y = 6 + r() * (h - 12);
    if (cells.every(c => Math.hypot(c.x - x, c.y - y) > (c.d + d) / 2 + 3)) cells.push({ x, y, d });
  }
  const lines = [], fills = [];
  for (const c of cells) {
    const rx = c.d / 2, ry = rx * (0.78 + r() * 0.3), rot = r() * Math.PI, pts = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2, k = 1 + 0.09 * nz(c.x * 0.3 + i * 0.7);
      const ex = Math.cos(a) * rx * k, ey = Math.sin(a) * ry * k;
      pts.push([c.x + ex * Math.cos(rot) - ey * Math.sin(rot), c.y + ex * Math.sin(rot) + ey * Math.cos(rot)]);
    }
    const d = toD(pts);
    lines.push(d);
    if (r() < 0.1) fills.push(d);
  }
  return `<g fill-opacity=".5">${fills.map(P).join('')}</g><g fill="none" stroke="#000" stroke-width=".9" stroke-linejoin="round">${lines.map(P).join('')}</g>`;
}

/** The aside bracket, 12 x 100: the mock's brace path, drawn freehand. */
export function bracket(seed) {
  const seg = (p0, p1, p2, p3, n) => Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1), u = 1 - t;
    return [u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0], u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1]];
  });
  const pts = [
    ...seg([10, 2], [4, 2], [4, 8], [4, 14], 8), ...seg([4, 14], [4, 22], [4, 32], [4, 40], 8).slice(1),
    ...seg([4, 40], [4, 46], [2, 48], [0, 50], 6).slice(1), ...seg([0, 50], [2, 52], [4, 54], [4, 60], 6).slice(1),
    ...seg([4, 60], [4, 68], [4, 78], [4, 86], 8).slice(1), ...seg([4, 86], [4, 92], [4, 98], [10, 98], 8).slice(1),
  ];
  return P(pstroke(pts, seed, { size: 1.3, press: [0.55, 0.8], taperA: 2, taperB: 2, eps: 0.08 }));
}

/** Graph paper, 60 x 60: minor lines at .55, major lines at full strength. */
export function graphTile() {
  return '<g fill="none" stroke="#000"><path stroke-width=".6" stroke-opacity=".55" d="M12 0V60M24 0V60M36 0V60M48 0V60M0 12H60M0 24H60M0 36H60M0 48H60"/><path stroke-width=".9" d="M0 0V60M0 0H60"/></g>';
}

/** The grain tile, 160 x 160: our own turbulence frequency and a fixed brown multiply matrix, no colour literal. */
export function grainTile() {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".62" numOctaves="2" seed="5" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .08  0 0 0 0 .06  0 0 0 .14 0"/></filter><rect width="160" height="160" filter="url(#n)"/></svg>';
}
```

- [x] **Step 3: `svg.mjs`**

```js
// SVG document writers for the paper assets. Masks carry no colour; colour files carry 6-digit token hex.
const head = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">`;

export const path = (d) => `<path d="${d}"/>`;

/** A mask: default black fill, no colour literal. */
export function maskDoc(w, h, body) {
  return `${head(w, h)}${body}</svg>\n`;
}

/** A pencil mask: the body under the graphite filter, so the mask's alpha carries the pencil texture. */
export function pencilDoc(w, h, body) {
  return `${head(w, h)}<filter id="g" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="t"/><feColorMatrix in="t" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 2.0" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter><g filter="url(#g)">${body}</g></svg>\n`;
}

/** A coloured file: the body sets its own fills from token hex. */
export function colourDoc(w, h, body) {
  return `${head(w, h)}${body}</svg>\n`;
}
```

- [x] **Step 4: `images.mjs`**

```js
// Raster jobs from Aryan's own photos (source: "aryan"). They read Pictures/, which is untracked,
// so they run only on Aryan's machine; their outputs are committed.
import sharp from 'sharp';

/** Pencil on paper to a black-plus-alpha palette PNG, used as a mask, so it sits on any paper without a white box. */
export async function pencilAlpha(src, region, size) {
  const { data, info } = await sharp(src).extract(region).greyscale()
    .resize(size[0], size[1], { kernel: 'lanczos3' }).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    // the scan's paper sits at L 209 to 226 (measured 26 October 2026), so 206 is the clear point: paper drops out, ink stays
    const a = Math.pow(Math.max(0, Math.min(1, (206 - data[i * info.channels]) / 142)), 0.82);
    out[i * 4 + 3] = Math.round(a * 255);
  }
  // black plus alpha, quantised to a 16-colour palette: the alpha is all the mask needs
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png({ palette: true, colours: 16, compressionLevel: 9, effort: 10 }).toBuffer();
}

/**
 * A one-ink duotone plate: greyscale, normalised, levels and gamma lifted so it multiplies cleanly onto a stock.
 * crop is [x0, y0, x1, y1] as fractions of the image after resizing to width.
 */
export async function duotone(src, width, crop, size, quality = 74) {
  // sharp keeps only the last resize of a pipeline, so the first resize gets its own pass
  const { data: base, info: bi } = await sharp(src).resize({ width: Math.round(width) }).toBuffer({ resolveWithObject: true });
  const left = Math.round(crop[0] * bi.width), top = Math.round(crop[1] * bi.height);
  const w = Math.round((crop[2] - crop[0]) * bi.width), h = Math.round((crop[3] - crop[1]) * bi.height);
  let img = sharp(base).extract({ left, top, width: w, height: h }).greyscale().normalise({ lower: 1, upper: 99 });
  if (size) img = img.resize(size[0], size[1], { fit: 'fill' });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < px.length; i++) px[i] = Math.round(255 * Math.pow(Math.min(1, Math.max(0, (data[i * info.channels] / 255 - 0.05) / 0.85)), 0.42));
  return sharp(px, { raw: { width: info.width, height: info.height, channels: 1 } }).jpeg({ quality, mozjpeg: true }).toBuffer();
}
```

- [x] **Step 5: `tokens.mjs`**

```js
// Reads token values from the first :root block of global.css, so generated colours follow the CSS.
export function readTokens(css) {
  const block = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!block) throw new Error('no :root block in global.css');
  const tokens = {};
  for (const [, name, value] of block[1].matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) tokens[name] = value.trim();
  return tokens;
}
```

- [x] **Step 6: `jobs.mjs`.** One recipe per manifest file. `codeJobs[file](entry, tokens)` returns the file's text; `aryanJobs[file](entry, root)` returns a Buffer. The torn pieces use the mock's side options; `eps` comes from the manifest.

```js
// Every paper asset's recipe, keyed by its path under src/assets/paper/. scripts/paper.mjs and
// tests/paper.test.mjs both run these, so the committed files and the recipes cannot drift apart.
import { join } from 'node:path';
import { paper, tape, tapeEnd, edgeStrip, ribbonBand, solidMask, playGlyph } from './art.mjs';
import { floorPlan, productionLog, braille, aboutTick, route, cellField, bracket, graphTile, grainTile } from './drawings.mjs';
import { maskDoc, pencilDoc, colourDoc, path } from './svg.mjs';
import { pencilAlpha, duotone } from './images.mjs';

const T = (o = {}) => ({ kind: 'torn', ...o });
const C = (o = {}) => ({ kind: 'cut', ...o });

const SIDES = {
  sky: { t: T({ depth: 8, rimMax: 4.6 }), r: T({ depth: 6, rimMax: 3.4 }), b: T({ depth: 5, rimMax: 2.6 }), l: T({ depth: 5, rimMax: 3.2 }) },
  braille: { t: T({ depth: 6, rimMax: 4 }), b: T({ depth: 6, rimMax: 3.6 }), l: C(), r: C() },
  plan: { t: T({ depth: 6, rimMax: 4.2 }), l: T({ depth: 5, rimMax: 3.4 }), r: C(), b: C() },
  hand: { t: C(), r: T({ depth: 5, rim: false }), b: T({ depth: 6, rim: false }), l: T({ depth: 4, rim: false }) },
  log: { t: T({ depth: 4, rim: false }), r: T({ depth: 5, rim: false }), b: C(), l: C() },
  graph: { t: C(), r: T({ depth: 5, rim: false }), b: T({ depth: 4, rim: false }), l: C() },
};

const piece = (sides, which) => (e) => {
  const [w, h] = e.size;
  return maskDoc(w, h, path(paper(w, h, e.seed, SIDES[sides], 1.7, e.eps ?? 0.1)[which]));
};
const doc = (fn) => (e) => maskDoc(...e.size, fn(e));
const fill = (token, side) => (e, tok) => colourDoc(...e.size, `<path fill="${tok[token]}" d="${tapeEnd(...e.size, e.seed, side)}"/>`);

export const codeJobs = {
  'sky.outer.svg': piece('sky', 'outer'), 'sky.inner.svg': piece('sky', 'inner'),
  'sky-sm.outer.svg': piece('sky', 'outer'), 'sky-sm.inner.svg': piece('sky', 'inner'),
  'braille.outer.svg': piece('braille', 'outer'), 'braille.inner.svg': piece('braille', 'inner'),
  'plan.outer.svg': piece('plan', 'outer'), 'plan.inner.svg': piece('plan', 'inner'),
  'hand.outer.svg': piece('hand', 'outer'),
  'log.outer.svg': piece('log', 'outer'),
  'graph.outer.svg': piece('graph', 'outer'),
  'band.outer.svg': doc((e) => path(ribbonBand(...e.size, e.seed).outer)),
  'band.inner.svg': doc((e) => path(ribbonBand(...e.size, e.seed).inner)),
  'edge-top.outer.svg': doc((e) => path(edgeStrip(...e.size, e.seed, 'top').outer)),
  'edge-top.inner.svg': doc((e) => path(edgeStrip(...e.size, e.seed, 'top').inner)),
  'edge-bottom.outer.svg': doc((e) => path(edgeStrip(...e.size, e.seed, 'bottom').outer)),
  'edge-bottom.inner.svg': doc((e) => path(edgeStrip(...e.size, e.seed, 'bottom').inner)),
  'solid.svg': doc(() => path(solidMask())),
  'tape-a.svg': doc((e) => path(tape(...e.size, e.seed))),
  'tape-b.svg': doc((e) => path(tape(...e.size, e.seed))),
  'tape-c.svg': doc((e) => path(tape(...e.size, e.seed))),
  'tape-fig-l.svg': doc((e) => path(tapeEnd(...e.size, e.seed, 'l'))),
  'tape-fig-r.svg': doc((e) => path(tapeEnd(...e.size, e.seed, 'r'))),
  'play.svg': doc(() => path(playGlyph())),
  'plan.pencil.svg': (e) => pencilDoc(...e.size, floorPlan()),
  'log.pencil.svg': (e) => pencilDoc(...e.size, productionLog(e.eps)),
  'route.pencil.svg': (e) => pencilDoc(...e.size, route(...e.size, e.seed)),
  'route-sm.pencil.svg': (e) => pencilDoc(...e.size, route(...e.size, e.seed)),
  'tick-1.svg': doc((e) => aboutTick(e.seed)), 'tick-2.svg': doc((e) => aboutTick(e.seed)),
  'tick-3.svg': doc((e) => aboutTick(e.seed)), 'tick-4.svg': doc((e) => aboutTick(e.seed)),
  'tick-5.svg': doc((e) => aboutTick(e.seed)),
  'bracket.svg': doc((e) => bracket(e.seed)),
  'graph.tile.svg': doc(() => graphTile()),
  'cells.svg': doc((e) => cellField(...e.size, e.seed, 110)),
  'cells-sm.svg': doc((e) => cellField(...e.size, e.seed, 34)),
  'grain.svg': () => `${grainTile()}\n`,
  'braille.dots.svg': (e, tok) => colourDoc(...e.size, braille(tok['--fibre'], tok['--on-stock'])),
  'tape-end-sky-l.svg': fill('--stock-sky', 'l'), 'tape-end-sky-r.svg': fill('--stock-sky', 'r'),
  'tape-end-marigold-l.svg': fill('--stock-marigold', 'l'), 'tape-end-marigold-r.svg': fill('--stock-marigold', 'r'),
};

export const aryanJobs = {
  'hand.png': (e, root) => pencilAlpha(join(root, e.from.path), { left: e.from.region[0], top: e.from.region[1], width: e.from.region[2], height: e.from.region[3] }, e.size),
  'arena.jpg': (e, root) => duotone(join(root, e.from.path), 840, [0, 0.03, 1, 0.18]),
  'cleancampus.jpg': (e, root) => duotone(join(root, e.from.path), 680, [0, 0.02, 0.8, 0.28], e.size),
};
```

- [x] **Step 7: `src/data/paper.ts`**

```ts
/** Provenance manifest and job list for the paper assets (spec 6.3, 6.4). scripts/paper.mjs writes exactly these files. */
export type PaperAsset = {
  readonly file: string;                 // path under src/assets/paper/, or "public/og.jpg"
  readonly kind: "mask" | "pencil" | "line" | "colour" | "raster" | "rendered";
  readonly source: "code" | "aryan";
  readonly generator: string;            // exported function in scripts/paper/*.mjs
  readonly seed?: number;                // required for code; 0 for the deterministic generators
  readonly eps?: number;                 // simplification tolerance, default 0.1
  readonly size: readonly [number, number];
  readonly from?: { readonly path: string; readonly region?: readonly [number, number, number, number] };
  readonly tokens?: readonly string[];   // colour files: the tokens written in
  readonly budget: number;               // bytes, raw
};

const mask = (file: string, generator: string, seed: number, size: readonly [number, number], budget = 4000, eps?: number): PaperAsset =>
  ({ file, kind: "mask", source: "code", generator, seed, size, budget, ...(eps === undefined ? {} : { eps }) });

export const paperAssets: readonly PaperAsset[] = [
  mask("sky.outer.svg", "paper", 11, [416, 496], 4000, 0.25),
  mask("sky.inner.svg", "paper", 11, [416, 496], 4000, 0.25),
  mask("sky-sm.outer.svg", "paper", 12, [300, 320], 4000, 0.25),
  mask("sky-sm.inner.svg", "paper", 12, [300, 320], 4000, 0.25),
  mask("braille.outer.svg", "paper", 23, [64, 320]),
  mask("braille.inner.svg", "paper", 23, [64, 320]),
  mask("plan.outer.svg", "paper", 37, [144, 124]),
  mask("plan.inner.svg", "paper", 37, [144, 124]),
  mask("hand.outer.svg", "paper", 41, [156, 120]),
  mask("log.outer.svg", "paper", 43, [248, 114]),
  mask("graph.outer.svg", "paper", 47, [248, 112]),
  mask("band.outer.svg", "ribbonBand", 49, [48, 150]),
  mask("band.inner.svg", "ribbonBand", 49, [48, 150]),
  mask("edge-top.outer.svg", "edgeStrip", 51, [1200, 16], 8000),
  mask("edge-top.inner.svg", "edgeStrip", 51, [1200, 16], 8000),
  mask("edge-bottom.outer.svg", "edgeStrip", 53, [1200, 16], 8000),
  mask("edge-bottom.inner.svg", "edgeStrip", 53, [1200, 16], 8000),
  mask("solid.svg", "solidMask", 0, [1, 1], 200),
  mask("tape-a.svg", "tape", 61, [88, 26], 600),
  mask("tape-b.svg", "tape", 63, [64, 20], 600),
  mask("tape-c.svg", "tape", 65, [80, 22], 600),
  mask("tape-fig-l.svg", "tapeEnd", 67, [12, 46], 500),
  mask("tape-fig-r.svg", "tapeEnd", 68, [12, 46], 500),
  mask("play.svg", "playGlyph", 0, [20, 22], 300),
  { file: "plan.pencil.svg", kind: "pencil", source: "code", generator: "floorPlan", seed: 1000, size: [180, 140], budget: 14000 },
  { file: "log.pencil.svg", kind: "pencil", source: "code", generator: "productionLog", seed: 2000, eps: 0.5, size: [200, 92], budget: 16000 },
  { file: "route.pencil.svg", kind: "pencil", source: "code", generator: "route", seed: 3000, size: [1184, 112], budget: 12000 },
  { file: "route-sm.pencil.svg", kind: "pencil", source: "code", generator: "route", seed: 3100, size: [358, 72], budget: 8000 },
  ...[1, 2, 3, 4, 5].map((n): PaperAsset => ({ file: `tick-${n}.svg`, kind: "line", source: "code", generator: "aboutTick", seed: 4000 + n, size: [20, 16], budget: 1000 })),
  { file: "bracket.svg", kind: "line", source: "code", generator: "bracket", seed: 4100, size: [12, 100], budget: 1000 },
  { file: "graph.tile.svg", kind: "line", source: "code", generator: "graphTile", seed: 0, size: [60, 60], budget: 1000 },
  { file: "cells.svg", kind: "line", source: "code", generator: "cellField", seed: 5000, size: [744, 112], budget: 16000 },
  { file: "cells-sm.svg", kind: "line", source: "code", generator: "cellField", seed: 5100, size: [358, 72], budget: 8000 },
  { file: "grain.svg", kind: "colour", source: "code", generator: "grainTile", seed: 5, size: [160, 160], tokens: [], budget: 1000 },
  { file: "braille.dots.svg", kind: "colour", source: "code", generator: "braille", seed: 23, size: [64, 320], tokens: ["--fibre", "--on-stock"], budget: 6000 },
  { file: "tape-end-sky-l.svg", kind: "colour", source: "code", generator: "tapeEnd", seed: 71, size: [8, 40], tokens: ["--stock-sky"], budget: 500 },
  { file: "tape-end-sky-r.svg", kind: "colour", source: "code", generator: "tapeEnd", seed: 72, size: [8, 40], tokens: ["--stock-sky"], budget: 500 },
  { file: "tape-end-marigold-l.svg", kind: "colour", source: "code", generator: "tapeEnd", seed: 73, size: [8, 40], tokens: ["--stock-marigold"], budget: 500 },
  { file: "tape-end-marigold-r.svg", kind: "colour", source: "code", generator: "tapeEnd", seed: 74, size: [8, 40], tokens: ["--stock-marigold"], budget: 500 },
  { file: "hand.png", kind: "raster", source: "aryan", generator: "pencilAlpha", size: [240, 234], from: { path: "Pictures/Chancellors-award/scribble.png", region: [297, 16, 187, 182] }, budget: 12000 },
  { file: "arena.jpg", kind: "raster", source: "aryan", generator: "duotone", size: [840, 82], from: { path: "Pictures/LA-hacks/IMG_9046.jpg" }, budget: 28000 },
  { file: "cleancampus.jpg", kind: "raster", source: "aryan", generator: "duotone", size: [544, 177], from: { path: "Pictures/Clean-campus/clean-campus-drive.png" }, budget: 22000 },
  { file: "public/og.jpg", kind: "raster", source: "aryan", generator: "og", size: [1200, 630], from: { path: "Pictures/Pillars-award/innovative-student-leader-award-3.png" }, budget: 122880 },
];
```

- [x] **Step 8:** Commit after Task 14 together with the generated files (the generators alone produce nothing to test).

### Task 12: The paper tests (before the CLI and the files)

**Files:** Create `tests/paper.test.mjs`; modify `package.json` (`test` script)

- [x] **Step 1: Write the test**

```js
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { paperAssets } from "../src/data/paper.ts";
import { codeJobs } from "../scripts/paper/jobs.mjs";
import { readTokens } from "../scripts/paper/tokens.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(root, "src", "assets", "paper");
const at = (asset) => (asset.file.startsWith("public/") ? join(root, asset.file) : join(DIR, asset.file));
const tokens = readTokens(readFileSync(join(root, "src", "styles", "global.css"), "utf8"));
const inFolder = paperAssets.filter((asset) => !asset.file.startsWith("public/"));

test("the manifest lists exactly the files in src/assets/paper and how each was made", () => {
  assert.deepEqual(readdirSync(DIR).sort(), inFolder.map((asset) => asset.file).sort());
  assert.ok(paperAssets.some((asset) => asset.file === "public/og.jpg"));
  for (const asset of paperAssets) {
    assert.ok(asset.generator, `${asset.file} names a generator`);
    if (asset.source === "code") assert.equal(typeof asset.seed, "number", `${asset.file} has a seed`);
    if (asset.source === "aryan") assert.ok(asset.from?.path.startsWith("Pictures/"), `${asset.file} comes from Pictures/`);
    if (asset.kind === "colour") assert.ok(Array.isArray(asset.tokens) && (asset.tokens.length > 0 || asset.file === "grain.svg"), `${asset.file} lists its tokens`);
  }
});

test("every code-drawn file regenerates byte for byte", () => {
  for (const asset of paperAssets.filter((a) => a.source === "code" && a.kind !== "rendered")) {
    const job = codeJobs[asset.file];
    assert.ok(job, `no recipe for ${asset.file}`);
    assert.equal(readFileSync(at(asset), "utf8"), job(asset, tokens), `${asset.file} is stale or hand-edited; run npm run paper`);
  }
});

test("paper stays inside its budgets", () => {
  let all = 0, masks = 0, lines = 0;
  for (const asset of paperAssets) {
    const size = statSync(at(asset)).size;
    assert.ok(size <= asset.budget, `${asset.file} is ${size} B; budget ${asset.budget}`);
    if (asset.budget <= 1000) assert.ok(size < 1024, `${asset.file} must inline`);
    if (asset.file.startsWith("public/")) continue;
    all += size;
    if (asset.kind === "mask") masks += size;
    if (asset.kind === "pencil" || asset.kind === "line") lines += size;
  }
  assert.ok(all <= 240 * 1024, `src/assets/paper is ${all} B`);
  assert.ok(masks <= 60 * 1024, `masks total ${masks} B`);
  assert.ok(lines <= 90 * 1024, `pencil and line files total ${lines} B`);
});

test("paper SVGs are inert decoration, and colour comes only from tokens", () => {
  for (const asset of inFolder.filter((a) => a.file.endsWith(".svg"))) {
    const svg = readFileSync(at(asset), "utf8");
    assert.doesNotMatch(svg, /<text|<a[\s>]|<script|<foreignObject|href="http|\son[a-z]+=/i, `${asset.file} holds active content`);
    assert.doesNotMatch(svg, /rgba\(/, `${asset.file} uses rgba`);
    const literals = [...svg.matchAll(/(?:fill|stroke|stop-color|color)="([^"]+)"/g)].map((m) => m[1]);
    const hexes = [...svg.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
    if (["mask", "pencil", "line"].includes(asset.kind)) {
      for (const value of literals) assert.ok(["#000", "black", "none"].includes(value), `${asset.file} colours ${value}`);
      for (const hex of hexes) assert.equal(hex, "#000", `${asset.file} colours ${hex}`);
    }
    if (asset.kind === "colour") {
      const allowed = (asset.tokens ?? []).map((name) => tokens[name].toUpperCase());
      for (const hex of hexes) {
        assert.match(hex, /^#[0-9a-fA-F]{6}$/, `${asset.file}: ${hex} is not 6-digit`);
        assert.ok(allowed.includes(hex.toUpperCase()), `${asset.file}: ${hex} is not one of ${asset.tokens}`);
      }
    }
  }
});
```

- [x] **Step 2:** In `package.json` set `"test": "node --test tests/portfolio-source.test.mjs tests/github-pages-workflow.test.mjs tests/paper.test.mjs"`.
- [x] **Step 3: Run** `npm test`. Expected: the manifest test fails with ENOENT on `src/assets/paper` (no files yet).

### Task 13: The CLI

**Files:** Create `scripts/paper.mjs`

```js
// Generates the paper assets listed in src/data/paper.ts (spec 6.2). It writes only listed files.
//   node scripts/paper.mjs              every job; aryan jobs need Pictures/ (Aryan's machine)
//   node scripts/paper.mjs --code-only  code-drawn files only
//   node scripts/paper.mjs --check      regenerate code-drawn files in memory and fail on any difference
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { paperAssets } from "../src/data/paper.ts";
import { aryanJobs, codeJobs } from "./paper/jobs.mjs";
import { readTokens } from "./paper/tokens.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(root, "src", "assets", "paper");
const codeOnly = process.argv.includes("--code-only");
const check = process.argv.includes("--check");
const tokens = readTokens(readFileSync(join(root, "src", "styles", "global.css"), "utf8"));
const target = (asset) => (asset.file.startsWith("public/") ? join(root, asset.file) : join(DIR, asset.file));
mkdirSync(DIR, { recursive: true });

let stale = 0;
for (const asset of paperAssets) {
  if (asset.source === "code") {
    const job = codeJobs[asset.file];
    if (!job) throw new Error(`no recipe for ${asset.file}`);
    const text = job(asset, tokens);
    if (check) {
      if (!existsSync(target(asset)) || readFileSync(target(asset), "utf8") !== text) { console.log(`stale ${asset.file}`); stale++; }
    } else {
      writeFileSync(target(asset), text);
      console.log(`wrote ${asset.file} (${Buffer.byteLength(text)} B)`);
    }
  } else if (!codeOnly && !check) {
    const job = aryanJobs[asset.file];
    if (!job) { console.log(`skip ${asset.file}: its generator "${asset.generator}" arrives in milestone 6`); continue; }
    if (!existsSync(join(root, asset.from.path))) throw new Error(`${asset.from.path} is missing; aryan jobs run on Aryan's machine`);
    const buffer = await job(asset, root);
    writeFileSync(target(asset), buffer);
    console.log(`wrote ${asset.file} (${buffer.length} B)`);
  }
}
if (check && stale) { console.error(`${stale} stale file(s); run npm run paper`); process.exit(1); }
```

### Task 14: Generate, test, commit

- [x] **Step 1:** `PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run paper`. Expected: a "wrote" line for each of the 45 files in the folder and "skip public/og.jpg".
- [x] **Step 2:** `npm test`: all paper tests pass. `node scripts/paper.mjs --check` exits 0.
- [x] **Step 3: Commit** the generators, manifest, CLI, test and assets: `feat: seeded paper pipeline with its manifest, recipes and committed assets`, push.

### Task 15: Inline limit, Safari prefixes, grain token, scripts stay inline

**Files:** Modify `astro.config.mjs`, `src/styles/global.css`, `tests/portfolio-build.test.mjs`

- [x] **Step 1: Build test first**

```js
test("both component scripts stay inline", () => {
  const html = read(client("index.html"));
  const inline = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map((match) => match[1]);
  assert.ok(inline.some((body) => body.includes("site-menu")), "the nav script is inline");
  assert.ok(inline.some((body) => body.includes("youtube-nocookie.com")), "the video script is inline");
  const files = readdirSync(join(root, "dist", "client", "_astro"));
  assert.ok(!files.some((name) => /^(?:SiteNav|Video)\.astro.*\.js$/.test(name)), "no component script file");
});
```

- [x] **Step 2:** `npm run check`: passes on the default config (it guards the next step).
- [x] **Step 3:** Add to `defineConfig`:

```js
  vite: {
    build: {
      // Small SVGs inline into the CSS; undefined leaves every other file, including Astro's
      // processed <script> blocks, on the 4,096 B default, so both component scripts stay inline.
      assetsInlineLimit: (file, content) => (file.endsWith(".svg") ? content.length < 1024 : undefined),
      // Keep the prefixes Safari still needs (-webkit-box-decoration-break, -webkit-mask-*).
      cssTarget: ["chrome111", "edge111", "firefox114", "safari16.4", "ios16.4"],
    },
  },
```

- [x] **Step 4:** In the light `:root` add `--grain: url(../assets/paper/grain.svg);` after `--sans`.
- [x] **Step 5:** `npm run check` green. **Commit** `build: inline small SVGs, keep Safari prefixes, grain token`, push.

### Task 16: No pencil or line art on marigold

**Files:** Modify `tests/portfolio-source.test.mjs`

```js
test("no pencil or line art sits on marigold", async () => {
  const { paperAssets } = await import(new URL("../src/data/paper.ts", import.meta.url).href);
  const files = paperAssets.filter((asset) => asset.kind === "pencil" || asset.kind === "line").map((asset) => asset.file);
  for (const rule of rules(css())) {
    if (files.some((file) => rule.body.includes(file))) assert.doesNotMatch(rule.selector, /--recognition|fig--tape|hl--marigold/, `${rule.selector} puts pencil on marigold`);
  }
});
```

- [x] `npm test` passes (no CSS uses the files yet). **Commit** `test: no pencil or line art on marigold`, push.

### Task 17: Contact sheet for Aryan, and the spec deviations

- [x] **Step 1:** In the session scratchpad (not the repo), build a page that shows every piece with the production approach: each torn piece as a wrapper with `filter: drop-shadow(0 1px 1px var(--lift)) drop-shadow(0 6px 10px var(--lift-far))`, its `::before` masked by the outer file in `--fibre` and its `::after` masked by the inner file in its stock with the grain multiplied; pencil files as masks coloured `--pencil` on kraft and fibre; the cell field on UB blue; the ticks, bracket and graph tile on paper; the two text-tape caps around a wrapped sentence; the duotones multiplied on vermilion and leaf. Screenshot it at 1x and 2x in Chromium; check the duotones at full size for any head or face.
- [x] **Step 2:** Show Aryan the sheet; milestone 3 starts after "not mechanical".
- [x] **Step 3:** Record the four deviations above in the spec (10.2 stocks-and-hex rule, the edge seeds in 6.4, the eps and budget values in 6.4, fallback metrics in 5.3). **Commit** `docs: record Plan A's measured values in the spec`, push.
