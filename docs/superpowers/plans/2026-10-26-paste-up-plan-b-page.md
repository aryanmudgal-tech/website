# Paste-Up v4, Plan B: The Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land milestones 3 to 7 of `docs/superpowers/specs/2026-10-26-paste-up-design.md`: retire the dissolving frame, give every photo a print beside its claim, build the Paste-Up hero with its paste-in signature, the coloured sheets with their plates and the whole-page crumple, the footer slab, 404, print stylesheet and OG image, then QA.

**Architecture:** Astro components stay pure renderers of `src/data/*`. Plan A's tokens, fonts and paper assets are the materials; CSS paints paper with masks from `src/assets/paper/`. The page becomes a stack of `Sheet` components (8.4) whose crumple is CSS scroll-driven, fed by one pre-rendered strip per screen shape from `scripts/crumple/`. The approved references are `docs/superpowers/mocks/2026-10-26-paste-up/index.html` (hero, plates, sections) and `docs/superpowers/mocks/2026-10-26-whole-page-crumple/` (sheets, crumple, page colours).

**Tech Stack:** Astro 7 (`astro:assets` `Picture` and `Image`), plain CSS (masks, `@starting-style`, `animation-timeline: view()`), sharp, three.js and Playwright's Chromium for the offline crumple render only.

**How this plan specifies code:** the spec already fixes markup, class names, sizes, coordinates and tokens to the pixel (sections 5 to 8). Each task names the spec section it implements and gives the tests in full; the implementation follows the spec text and the two approved mocks. Every task ends with `npm run check` green, a commit and a push.

---

## Conventions

As Plan A: branch `v4-paste-up`, never `main`; `PATH=/opt/homebrew/opt/node@24/bin:$PATH`; commits authored as Aryan with no trailers, pushed after each commit; no em or en dashes; the visual probe from Plan A Task 9 (`scratchpad/m1/probe.cjs`, extended per milestone with the probes of spec 7.11) runs at the end of every milestone and its screenshots go to Aryan.

## File map

| File | Fate | Milestone |
|---|---|---|
| `src/data/rooms.ts` | `aspect` replaces `fit`; `ogRoom = "pillar"` | 3 |
| `scripts/crop-rooms.mjs` | aspects, fibre flatten, `withoutEnlargement`, no OG | 3 |
| `src/components/Print.astro`, `PhotoPopover.astro` | add | 3 |
| `src/components/Frame.astro`, `ChapterFigure.astro` | delete | 3 |
| `src/components/TitleBlock.astro`, `Collage.astro` | add | 4 |
| `src/components/Hero.astro`, `Ledger.astro`, `Source.astro` | change | 3, 4, 5 |
| `src/components/Plate.astro`, `Sheet.astro`, `src/lib/text.ts` | add | 5 |
| `scripts/crumple/*`, `src/assets/paper/crumple-*.avif`, `src/data/crumple.json`, `src/styles/crumple.css` | add | 5 |
| section components, `Video.astro`, `index.astro` | change | 3, 5 |
| `SiteFooter.astro`, `SiteNav.astro`, `404.astro`, `scripts/paper/images.mjs` (`og`) | change | 6 |
| `tests/lib/html.mjs` | add (`textOf`, `elements`) | 3 |

---

## Milestone 3: Frame retirement and prints

### Task 1: `aspect` and the crops (spec 6.5)
- [x] Source test (in "rooms stay twelve, captioned, and owned", renamed from "each room has a chapter..."): no room has `fit`; `aspect` is `"3:2" | "4:5" | "natural"`; `pillar` is `"4:5"`; `streamfair` and `contact` are `"natural"`; `ogRoom === "pillar"`; `extras.length === 8`. Run: fails on `aspect`.
- [x] `rooms.ts`: `fit?: "cover" | "contain"` becomes `aspect?: "3:2" | "4:5" | "natural"` (default `"3:2"`); set the three values; `ogRoom = "pillar"`; comments drop "frame".
- [x] `crop-rooms.mjs`: crop ratio per `aspect` (4/5 for pillar, full height); `"natural"` resizes `fit: "inside"` to 1440x1600 `withoutEnlargement`; flatten colour read from `--fibre` in `global.css` via `scripts/paper/tokens.mjs`; delete `writeOg`. Run `npm run rooms`; commit the regenerated `src/assets/rooms/*` and `src/assets/full/*`.

### Task 2: `Print` and `PhotoPopover` (spec 7.2, 4.3)
- [x] Create `PhotoPopover.astro` from `Frame.astro`'s popover markup (`div#photo-<id>.photo-popover[popover]`: full image, caption, `Source`, extras with captions, Close).
- [x] Create `Print.astro` with the props of 7.2 (`room` or `extra`, `variant`, `tilt`, `tapes`, `tone`, `loading`, `popover`). Rooms: `figure.print.print--<variant>[data-room]` > `div.print__frame` (tilted) > `button.print__open[popovertarget]` holding `<Picture>` (alt from `rooms.ts`) and `<span class="sr-only">Open full photo</span>`, `aria-hidden` tapes, `figcaption` with caption and inline `Source`; then `<PhotoPopover>` unless `popover={false}`. Extras: `figure.print[data-extra]` with the caption only, no button, no receipt. Widths and sizes per 6.5 Delivery; `loading="eager"` adds `fetchpriority="high"`.

### Task 3: Every room once, beside its claim (spec 4.3)
- [x] Hero: `div.hero-art` holds `<Print room="pillar" variant="hero" loading="eager" popover={false} />`; `<PhotoPopover room="pillar" />` follows outside `div.hero-art`.
- [x] Projects: margin prints per 7.6 (Dots: `dots` then `hero`); Research: `research`; Leadership Clean Campus row: `cleancampus`; Recognition: `pillar-pair` extra in the pillar row, `chancellor`, `pbk`; footer: `contact`. Card grid of 5.4 (`200px 600px 304px`) with the margin column; phone stacks prints after the body.
- [x] `data-room` only on prints. Delete `Frame.astro`, `ChapterFigure.astro`, the `.rooms` wrapper, the frame CSS (`.frame-col`, `.frame`, `.room*`, `timeline-scope`, both `@supports` frame blocks, the `--r-*` names); keep a `@media (prefers-reduced-motion: reduce)` block (`html { scroll-behavior: auto }`).

### Task 4: Milestone 3 tests (spec 10.1 items 1 to 3, 10 to 12; 10.2 CSS budget, hidden subtrees)
- [x] `tests/lib/html.mjs`:

```js
// HTML helpers for the build tests. No dependency; written for our own built HTML.
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };
export function textOf(html) {
  return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e) => ENTITIES[e] ?? (e[0] === "#" ? String.fromCodePoint(e[1] === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : m))
    .replace(/\s+/g, " ").trim();
}
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
/** Outer HTML of every element whose opening tag passes test(tag, name). */
export function elements(html, test) {
  const out = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g;
  const open = [];
  let m;
  while ((m = re.exec(html))) {
    const [tag, closing, rawName, , selfClose] = m;
    const name = rawName.toLowerCase();
    if (closing) {
      for (let i = open.length - 1; i >= 0; i--) if (open[i].name === name) { const [start] = open.splice(i, 1); if (start.keep) out.push(html.slice(start.at, re.lastIndex)); open.length = i; break; }
    } else if (VOID.has(name) || selfClose) {
      if (test(tag, name)) out.push(tag);
    } else {
      open.push({ name, at: m.index, keep: test(tag, name) });
    }
  }
  return out;
}
```

- [x] Source tests: `componentFiles` drops `Frame` and `ChapterFigure`, adds `Print` and `PhotoPopover`; "sections keep the approved order" with markers `["<SiteNav", "<main", "<Hero", "<Experience", "<Projects", "<Trajectory", "<Research", "<Leadership", "<Recognition", "<About", "</main>", "<SiteFooter"]` and no `<Frame|class="rooms"`; "rooms stay twelve, captioned, and owned" per 10.1 item 3.
- [x] Build tests: images 37, `<picture>` 33, one eager (inside `figure.print--hero`), `lazy === images - 1`; "each room renders once beside its claim" per 10.1 item 11 (owners table, no `data-room` on section, article, footer or popover, `photo-<id>` once with `popover`, no popover inside `hero-art`, extras captions in their popovers, `pillar-pair` in `#recognition-pillar` without `Source:`, at least 13 `popovertarget`); built CSS 18 KB gzip or less; hidden subtrees contain no `<a`, `<button`, `tabindex`, `<input`, `popover` or `<img` with non-empty alt.
- [x] `npm run check` green; visual probe; commit `feat: retire the frame; every photo is a print beside its claim`, push.

## Milestone 4: Hero and signature (spec 7.1, 8.1 to 8.3)

### Task 5: Title block, ledger and actions
- [x] `TitleBlock.astro`: `dl.tb` > three `div.tb__row` > `dt` + `dd` with `span.tb__long` and `span.tb__short`; the first Next sentence in `span.hl--sky` in both.
- [x] `Ledger.astro`: `ol.ledger[role=list][aria-label="Three proofs"]` > `li` > `a.fig` (`a.fig.fig--tape` on the bold row) + `p.claim` (bold row in `strong`) + inline `Source`.
- [x] Actions: `a.action--primary` "Email Aryan" and `a.stub.stub--resume` "Resume (PDF)".
- [x] CSS: 7.1 grids, rules and sizes; `.fig--tape::before` with the three-layer mask; `.hl--sky` and `.hl--marigold` per 6.6; the hero rule test becomes `/\.hero(?:\b|__)[^{]*\{[^}]*(?<![a-z-])gap:/s`.
- [x] Build test 10.1 item 9 (title-block joins in the built HTML, three `<dt>`, `hl--sky` holds exactly the first Next sentence); "text tapes never hidden".

### Task 6: Collage and the paste-in
- [x] `Collage.astro`: `div.hero-art` > the pillar print, then `div.collage[aria-hidden=true]` with four empty `div.piece` (`p-sky`, `p-braille`, `p-plan`, `p-hand`) at the 7.1 coordinates (desktop, zoom tiers, phone); pieces painted per 6.6 (fibre `::before`, stock `::after` with grain, `.art` pencil layers, `braille.dots.svg` as a background); tapes `aria-hidden`.
- [x] The `@starting-style` signature of 8.1 and its phone rules (8.2), inside `@media (prefers-reduced-motion: no-preference)`.
- [x] Source tests: collage limits (10.2), every `@starting-style` inside `prefers-reduced-motion: no-preference` (10.1 item 4). Build tests: facts precede art (hero), inline SVG 1,024 B or less, Safari prefixes present.
- [x] Probe: arrow line within 16px of the face and the keep-out box at 1280x800, 1024x768, 390x844; Email above the fold (7.11). Commit `feat: Paste-Up hero with the paste-in signature`, push.

## Milestone 5: Pages, plates, sections and the crumple (spec 5.2b, 7.3 to 7.9, 8.4)

### Task 7: Sections
- [ ] `src/lib/text.ts` (`numeralRuns`, `researchParagraphs`) with its source tests (10.2).
- [ ] `Source.astro` `variant: "inline" | "stub"`; stubs in `div.stubs` per 7.4; receipts test.
- [ ] Work, Projects (index, `hl--marigold` results, `Video mat="demo"`, asides with the bracket), Route, Research (split detail), Leadership (`h3.meta-lead`, `#leadership-<slug>`, numerals), Recognition (`award__line`, plain-mat video), About (ticks) per 7.5 to 7.9; `Video.astro` mats, play glyph, poster fade and poster click (7.4).
- [ ] Build tests: facts precede art (cards), exceptions and stubs, the delete test (10.2).

### Task 8: Plates
- [ ] `Plate.astro` with the 7.3 table: masks from the edge strips (`--edge-x` per plate), the subject piece or `plate__art`, the duotones through `<Image>`, the Research note; tablet rules. Images become 39.
- [ ] Build test "Plates" (10.2); source test "no pencil on marigold" now has real rules to check.

### Task 9: The crumple strips
- [ ] `scripts/crumple/` from the prototype tools: `page3d.js`, `render.mjs` (headless Chromium via Playwright, devDependency `playwright` pinned), `pack.mjs` (25-frame AVIF strips, `src/assets/paper/crumple-d.avif` 640x400 frames and `crumple-m.avif` 270x584 frames, plus `src/data/crumple.json`), `css.mjs` (writes `src/styles/crumple.css`); devDependencies `three@0.169.0`, `simplex-noise@4.0.3`; script `"crumple"`. Add the strips to `paper.ts` as `kind: "rendered"`; paper tests check strip width and frame counts (6.7).

### Task 10: Sheets and the crumple
- [ ] `Sheet.astro` (7.2) and `index.astro` wrapping Hero to About and the footer in nine sheets with page colours of 5.2b and runways `r1` to `r8`; `body { timeline-scope: --r1, ..., --r8 }`.
- [ ] CSS from the approved prototype: hold, arrive, outline mask, creases, content shrink, roll, preload, portrait switch, all inside both gates; page colour rules of 5.2b (ink text, `--page-ink-2`, ink links and focus, `--fibre` stubs).
- [ ] Tests of 10.3 "New for the pages and the crumple": sheets and runways in order, gates, page colours and their contrast, crumple data; the probe: same document height with and without reduced motion, no horizontal overflow through every runway.
- [ ] Probe frame strips of every crumple at 1280x800 and 390x844 against the prototype; commit `feat: coloured sheets that crumple between sections`, push.

## Milestone 6: Footer, 404, print, OG (spec 7.10, 5.6 to 5.8)

### Task 11
- [ ] `SiteFooter.astro` slab with the torn edge, the contact print as a fibre sheet with two tapes, the colophon (v3 strings until Aryan answers Pending 2), `div#page-end`; `SiteNav.astro` second observer (10.1 item 6).
- [ ] `404.astro` per 5.7; the print stylesheet per 5.6; `og` job in `scripts/paper/images.mjs` per 5.8, registered in `aryanJobs` for `public/og.jpg`; `npm run paper`; README describes v4.
- [ ] Probe: Contact current at maximum scroll; OG not blank at the face. Commit, push.

## Milestone 7: QA (spec 11)

### Task 12
- [ ] Probes at all ten sizes, light and dark; keyboard pass; Lighthouse and axe on the built page; every budget of section 9 measured and recorded in the spec; screenshots to Aryan. Aryan reviews the branch; nothing merges to `main` without Aryan's go-ahead.
