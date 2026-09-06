# Me in Every Photo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio as a recruiter-first one-page resume whose single signature is a sticky, face-registered photo frame that dissolves through eleven real photographs as the reader scrolls, with every claim sourced.

**Architecture:** Astro 7 static site on GitHub Pages, no framework, no external script. `src/data/portfolio.ts` is the typed source of truth (claims carry receipts); `src/data/rooms.ts` is the photo manifest with hand-set focal points; `scripts/crop-rooms.mjs` (Sharp) turns untracked source photos into committed 3:2 crops; `Frame.astro` renders the rooms with CSS scroll-driven animations (`timeline-scope` plus `view-timeline-name`); every section renders from data and carries a Source link per claim. Tests protect outcomes (first-screen facts, receipts, a11y, mobile overflow, image budget) instead of forbidding creativity.

**Tech Stack:** Astro 7.1 (`astro:assets` Picture), Node 24 (type stripping for tests), Sharp 0.34 (dev only), CSS scroll-driven animations, native popover, Google Fonts (Newsreader, Instrument Sans), node:test.

**Spec:** `docs/superpowers/specs/2026-09-06-me-in-every-photo-design.md`. Read it first; every fact below comes from it.

**Branch:** `v3-me-in-every-photo` (already created; the spec is committed there). Never commit to `main` in this plan. Commit messages carry no Co-Authored-By or generator trailers (user's global CLAUDE.md).

**Local toolchain:** the default `node` on this Mac is v20 and cannot run Astro 7. Every command below assumes:

```bash
export PATH=/opt/homebrew/opt/node@24/bin:$PATH
```

---

## File structure

Created:
- `.nvmrc` (Node major for local and CI)
- `src/data/rooms.ts` (photo manifest: source file, focal point, caption, receipt, chapter)
- `scripts/crop-rooms.mjs` (Sharp pipeline: rooms, full-size popover copies, og image, resume copy)
- `src/assets/rooms/*.jpg` (11 committed 3:2 crops, 1440px wide max), `src/assets/full/*.jpg` (committed popover originals, 1600px max)
- `public/og.jpg`, `public/resume.pdf`
- `src/components/Frame.astro` (the sticky frame, rooms, popovers)
- `src/components/ChapterFigure.astro` (inline captioned figure for a room; fallback and phone)
- `src/components/Ledger.astro` (three hero proofs)
- `src/components/Source.astro` (one receipt link with new-tab semantics)

Rewritten:
- `src/data/portfolio.ts` (all content; new types `Receipt`, `Experience`, `Project`, `RouteEvent`, `ResearchItem`, `LeadershipItem`, `Recognition`, `LedgerRow`, `AboutLine`)
- `src/styles/global.css` (new design system; the old file is replaced wholesale)
- `src/layouts/BaseLayout.astro` (fonts, og image, twitter card, JSON-LD, theme colors)
- `src/components/SiteNav.astro` (text wordmark, phone popover menu, aria-current observer)
- `src/components/Hero.astro`, `Experience.astro`, `Projects.astro`, `Trajectory.astro` (renders the Route list), `Research.astro`, `Leadership.astro`, `Recognition.astro`, `About.astro`, `SiteFooter.astro`
- `src/pages/index.astro` (wraps main and footer in `.rooms` with the Frame)
- `src/pages/404.astro` (same layout, new classes)
- `tests/portfolio-source.test.mjs`, `tests/portfolio-build.test.mjs`, `tests/github-pages-workflow.test.mjs`
- `.github/workflows/deploy-pages.yml` (Node 24, pull_request trigger, gated deploy, tests in CI)
- `astro.config.mjs` (adds `site`), `package.json` (v3, engines, scripts, sharp), `.gitignore` (Pictures/), `README.md`

Deleted:
- `assets/` (tracked root folder with 7 duplicate photos and `lofi.mp3`)
- `public/assets/` (7 photos, replaced by `src/assets/rooms`)
- `scripts/prepare-sites-build.mjs` (Cloudflare worker GitHub Pages never runs)

---

### Task 1: Toolchain, gitignore, dependencies

**Files:**
- Create: `.nvmrc`
- Modify: `.gitignore`, `package.json`, `astro.config.mjs`
- Delete: `scripts/prepare-sites-build.mjs`, `assets/`, `public/assets/`

- [ ] **Step 1: Pin Node and ignore the raw photo folder**

```bash
printf '24\n' > .nvmrc
printf 'node_modules/\ndist/\n.astro/\n.DS_Store\n*.log\nPictures/\n' > .gitignore
```

- [ ] **Step 2: Rewrite package.json**

```json
{
  "name": "aryan-mudgal-portfolio",
  "version": "3.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=24"
  },
  "scripts": {
    "dev": "astro dev",
    "build": "node scripts/clean-dist.mjs && astro build",
    "preview": "astro preview",
    "rooms": "node scripts/crop-rooms.mjs",
    "test": "node --test tests/portfolio-source.test.mjs tests/github-pages-workflow.test.mjs",
    "test:build": "node --test tests/portfolio-build.test.mjs",
    "check": "npm run test && npm run build && npm run test:build"
  },
  "devDependencies": {
    "astro": "^7.1.3"
  }
}
```

- [ ] **Step 3: Install Sharp as a dev dependency**

Run: `npm install --save-dev sharp@^0.34.0`
Expected: `package.json` gains `"sharp": "^0.34.x"` under devDependencies; `package-lock.json` updates; no errors.

- [ ] **Step 4: Add the site URL to the Astro config**

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://aryanmudgal-tech.github.io",
  output: "static",
  base: process.env.BASE_URL || "/",
  outDir: "./dist/client",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  compressHTML: true,
});
```

- [ ] **Step 5: Remove the Cloudflare worker script and the duplicate photo folders**

```bash
git rm -q scripts/prepare-sites-build.mjs
git rm -rq assets public/assets
ls scripts public
```
Expected: `scripts` contains only `clean-dist.mjs`; `public` contains only `favicon.svg`.

- [ ] **Step 6: Commit**

```bash
git add -A .nvmrc .gitignore package.json package-lock.json astro.config.mjs scripts public assets
git commit -m "chore: move to Node 24, add sharp, drop the worker script and duplicate photos"
```

---

### Task 2: Photo sources, the rooms manifest, and the crop pipeline

**Files:**
- Modify (untracked, on disk only): `Pictures/**` (rename five screenshot files whose names contain a narrow no-break space)
- Create: `src/data/rooms.ts`, `scripts/crop-rooms.mjs`
- Output (committed): `src/assets/rooms/*.jpg`, `src/assets/full/*.jpg`, `public/og.jpg`, `public/resume.pdf`

- [ ] **Step 1: Give every source photo an ASCII name**

The macOS screenshot names contain U+202F before "PM"; scripts written from the visible name fail on them. Rename with globs:

```bash
cd Pictures
mv MIT-win/Screenshot*10.13.37*.png MIT-win/mit-armie-arm.png
mv MIT-win/Screenshot*10.13.10*.png MIT-win/mit-armie-team.png
mv YC-hackathon/Screenshot*10.14.32*.png YC-hackathon/yc-safeline-stage.png
mv YC-hackathon/Screenshot*10.14.44*.png YC-hackathon/yc-safeline-portal.png
mv stanford-win/Screenshot*10.12.29*.png stanford-win/stanford-wod-selfie.png
git show HEAD~1:assets/hack-streamfair.jpg > CMU-win/cmu-streamfair-stage.jpg
cp ~/Documents/Resumes/swe/aryan-mudgal-newgrad.pdf resume.pdf
cd ..
find Pictures -type f -not -name .DS_Store | sort
```
Expected: no filename contains a space other than the two "Screenshot" MIT files already renamed; `Pictures/CMU-win/cmu-streamfair-stage.jpg` is 1500x1974; `Pictures/resume.pdf` exists.

- [ ] **Step 2: Write the rooms manifest**

`src/data/rooms.ts`:

```ts
export type Focal = { readonly x: number; readonly y: number };

export type Receipt = {
  readonly label: string;
  readonly href: string;
};

export type ChapterId =
  | "hero"
  | "dots"
  | "armie"
  | "streamfair"
  | "wod"
  | "safeline"
  | "research"
  | "chancellor"
  | "pillar"
  | "pbk"
  | "contact";

export type Room = {
  /** Output filename stem and the value of data-room on the chapter that owns it. */
  readonly id: ChapterId;
  /** Path under Pictures/ (untracked). */
  readonly source: string;
  /** Face center as fractions of the source width and height. */
  readonly focal: Focal;
  /** "contain" letterboxes on the paper color instead of cropping (used for the drawing). */
  readonly fit?: "cover" | "contain";
  readonly alt: string;
  readonly caption: string;
  readonly receipt: Receipt;
};

export type Extra = {
  readonly id: string;
  readonly source: string;
  readonly alt: string;
  readonly caption: string;
  /** The room whose popover shows this extra. */
  readonly room: ChapterId;
};

export const rooms: readonly Room[] = [
  {
    id: "hero",
    source: "LA-hacks/IMG_9046.jpg",
    focal: { x: 0.65, y: 0.5 },
    alt: "Aryan demoing the Dots iOS app on a phone to two people at a table at LA Hacks, with a Create Prototype Present sign behind him",
    caption: "LA Hacks, UCLA, April 2026. Demoing Dots. 1st, Catalyst for Care track.",
    receipt: { label: "Devpost", href: "https://devpost.com/software/dots-y5r21j" },
  },
  {
    id: "dots",
    source: "LA-hacks/IMG_9063.jpg",
    focal: { x: 0.595, y: 0.32 },
    alt: "Team Dots holding two award boxes and a shirt under the LA Hacks 2026 banner at Pauley Pavilion",
    caption: "LA Hacks, UCLA, April 2026. Team Dots with two track awards.",
    receipt: { label: "Devpost", href: "https://devpost.com/software/dots-y5r21j" },
  },
  {
    id: "armie",
    source: "MIT-win/mit-armie-arm.png",
    focal: { x: 0.59, y: 0.42 },
    alt: "A teammate holding the 3D-printed ARMIE robot arm with red servos while Aryan gestures at it during MIT Reality Hack",
    caption: "MIT Reality Hack, January 2026. Building ARMIE, the robot arm.",
    receipt: { label: "Devpost", href: "https://devpost.com/software/armie" },
  },
  {
    id: "streamfair",
    source: "CMU-win/cmu-streamfair-stage.jpg",
    focal: { x: 0.506, y: 0.625 },
    alt: "Aryan and two teammates on stage at TartanHacks under a slide reading RIPPLE 1st place, Water Mellon",
    caption: "TartanHacks, Carnegie Mellon, February 2026. 1st, Ripple track.",
    receipt: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/StreamFair" },
  },
  {
    id: "wod",
    source: "stanford-win/stanford-wod-selfie.png",
    focal: { x: 0.27, y: 0.475 },
    alt: "Aryan grinning in a selfie with a teammate and the game-console prize boxes after winning the Moonlake track at Immerse The Bay",
    caption: "Immerse The Bay, Stanford XR, November 2025. Best Creation on Moonlake.",
    receipt: { label: "Devpost", href: "https://devpost.com/software/c-o-r-e" },
  },
  {
    id: "safeline",
    source: "YC-hackathon/yc-safeline-stage.png",
    focal: { x: 0.53, y: 0.37 },
    alt: "Aryan presenting Safeline with a microphone on a small stage between two projector screens showing an incident report portal",
    caption: "YC Voice Agents Hackathon, San Francisco, May 2026. Demoing Safeline.",
    receipt: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/safeline" },
  },
  {
    id: "research",
    source: "Research/research-portrait.jpg",
    focal: { x: 0.53, y: 0.22 },
    alt: "Aryan in a black hoodie standing in a lab room at the University at Buffalo",
    caption: "University at Buffalo, 2025. Research assistant, fetomaternal hemorrhage detection.",
    receipt: { label: "Resume", href: "resume.pdf" },
  },
  {
    id: "chancellor",
    source: "Chancellors-award/Chancellors-award-Albany.jpeg",
    focal: { x: 0.545, y: 0.19 },
    alt: "Aryan holding the SUNY Chancellor's Award for Student Excellence certificate between SUNY Chancellor John B. King Jr. and a University at Buffalo administrator in front of a SUNY backdrop",
    caption: "Albany, 27 April 2026. SUNY Chancellor's Award for Student Excellence, with Chancellor John B. King Jr.",
    receipt: { label: "SUNY", href: "https://www.suny.edu/suny-news/press-releases/4-26/4-27-26-3/case.html" },
  },
  {
    id: "pillar",
    source: "Pillars-award/innovative-student-leader-award-3.png",
    focal: { x: 0.53, y: 0.23 },
    alt: "Aryan holding the Pillar of Leadership plaque for the Innovative Student Leadership Award in front of a University at Buffalo backdrop",
    caption: "University at Buffalo, April 2026. Award for Innovative Student Leadership.",
    receipt: { label: "UB Student Life", href: "https://www.buffalo.edu/studentlife/who-we-are/departments/engagement/leadership-awards.html" },
  },
  {
    id: "pbk",
    source: "phi-beta-kappa.png",
    focal: { x: 0.615, y: 0.6 },
    alt: "Aryan shaking hands at the Phi Beta Kappa induction while a slide reads Aryan Mudgal, Major: Computer Science",
    caption: "University at Buffalo, 2026. Phi Beta Kappa induction.",
    receipt: { label: "UB Arts and Sciences", href: "https://arts-sciences.buffalo.edu/phi-beta-kappa.html" },
  },
  {
    id: "contact",
    source: "Chancellors-award/scribble.png",
    focal: { x: 0.49, y: 0.485 },
    fit: "contain",
    alt: "A pencil self-portrait of Aryan in a suit with a handwritten arrow labelled me in every photo",
    caption: "Pencil, drawn on the train to Albany, April 2026. Me in every photo.",
    receipt: { label: "Drawn by Aryan", href: "#about" },
  },
];

export const extras: readonly Extra[] = [
  { id: "dots-pitch", source: "LA-hacks/IMG_9044.jpg", alt: "Aryan mid-sentence, gesturing while pitching Dots to a judge at LA Hacks", caption: "Pitching Dots to a judge.", room: "dots" },
  { id: "dots-booth", source: "LA-hacks/IMG_9051.jpg", alt: "Team Dots with Fetch.ai staff at the Agentverse booth at LA Hacks", caption: "At the Fetch.ai Agentverse booth after placing third in the track.", room: "dots" },
  { id: "armie-team", source: "MIT-win/mit-armie-team.png", alt: "The four-person ARMIE team with badges at MIT Reality Hack", caption: "The ARMIE team.", room: "armie" },
  { id: "streamfair-team", source: "CMU-win/TeamPhoto.png", alt: "Aryan, Yash Nakadi and Ayush Srivastava under the Carnegie Mellon University sign", caption: "Water Mellon, under the sign that named the team.", room: "streamfair" },
  { id: "wod-team", source: "stanford-win/StanfordWin.JPG", alt: "The W.O.D. team with prizes and sponsor badges at Immerse The Bay", caption: "After the Moonlake track announcement.", room: "wod" },
  { id: "safeline-portal", source: "YC-hackathon/yc-safeline-portal.png", alt: "Aryan on stage with the Safeline report review portal on the projector", caption: "The Safeline report portal on the projector.", room: "safeline" },
  { id: "chancellor-ub", source: "Chancellors-award/Chancellors-award-UB.jpeg", alt: "Aryan in a dark green suit between two University at Buffalo administrators in front of a UB backdrop", caption: "The UB celebration, April 2026.", room: "chancellor" },
  { id: "pillar-pair", source: "Pillars-award/innovative-student-leader-award-1.png", alt: "Aryan and Shaurya Jain each holding a Pillar of Leadership plaque", caption: "With Shaurya Jain, who received the Exemplary Student Leader Award the same evening.", room: "pillar" },
];

/** The 1.91:1 social image is cut from this room. */
export const ogRoom: ChapterId = "hero";
```

- [ ] **Step 3: Write the crop pipeline**

`scripts/crop-rooms.mjs`:

```js
import { copyFile, mkdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { extras, ogRoom, rooms } from "../src/data/rooms.ts";

const root = resolve(import.meta.dirname, "..");
const sources = resolve(root, "Pictures");
const roomsOut = resolve(root, "src", "assets", "rooms");
const fullOut = resolve(root, "src", "assets", "full");
const publicOut = resolve(root, "public");

const ROOM_RATIO = 3 / 2;
const ROOM_MAX_WIDTH = 1440;
const FULL_MAX_SIDE = 1600;
const REGISTER = { x: 0.5, y: 0.4 };
const PAPER = { r: 243, g: 242, b: 238 };

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/** Largest crop of the given aspect ratio that keeps the focal point at the registration point when possible. */
function cropBox(width, height, ratio, focal, register) {
  let cropWidth = Math.min(width, Math.floor(height * ratio));
  let cropHeight = Math.floor(cropWidth / ratio);
  if (cropHeight > height) {
    cropHeight = height;
    cropWidth = Math.floor(height * ratio);
  }
  const left = clamp(Math.round(focal.x * width - register.x * cropWidth), 0, width - cropWidth);
  const top = clamp(Math.round(focal.y * height - register.y * cropHeight), 0, height - cropHeight);
  return { left, top, width: cropWidth, height: cropHeight };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function writeRoom(room) {
  const input = resolve(sources, room.source);
  if (!(await exists(input))) throw new Error(`missing source photo: ${room.source}`);
  const image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const width = meta.width;
  const height = meta.height;
  const out = resolve(roomsOut, `${room.id}.jpg`);

  if (room.fit === "contain") {
    const targetWidth = Math.min(ROOM_MAX_WIDTH, Math.round(Math.max(width, height * ROOM_RATIO)));
    const targetHeight = Math.round(targetWidth / ROOM_RATIO);
    await image
      .resize(targetWidth, targetHeight, { fit: "contain", background: PAPER, withoutEnlargement: false })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(out);
  } else {
    const box = cropBox(width, height, ROOM_RATIO, room.focal, REGISTER);
    await image
      .extract(box)
      .resize({ width: Math.min(ROOM_MAX_WIDTH, box.width), withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(out);
  }
  return out;
}

async function writeFull(item) {
  const input = resolve(sources, item.source);
  if (!(await exists(input))) throw new Error(`missing source photo: ${item.source}`);
  const out = resolve(fullOut, `${item.id}.jpg`);
  await sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: FULL_MAX_SIDE, height: FULL_MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  return out;
}

async function writeOg() {
  const room = rooms.find((candidate) => candidate.id === ogRoom);
  const input = resolve(sources, room.source);
  const image = sharp(input, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const box = cropBox(meta.width, meta.height, 1200 / 630, room.focal, { x: 0.5, y: 0.45 });
  const out = resolve(publicOut, "og.jpg");
  await image.extract(box).resize(1200, 630, { fit: "fill" }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  return out;
}

await mkdir(roomsOut, { recursive: true });
await mkdir(fullOut, { recursive: true });
await mkdir(publicOut, { recursive: true });

for (const room of rooms) {
  const out = await writeRoom(room);
  const written = await sharp(out).metadata();
  console.log(`room  ${room.id.padEnd(11)} ${written.width}x${written.height}`);
}
for (const item of [...rooms, ...extras]) {
  const out = await writeFull(item);
  const written = await sharp(out).metadata();
  console.log(`full  ${item.id.padEnd(16)} ${written.width}x${written.height}`);
}
console.log(`og    ${await writeOg()}`);

const resumeSource = resolve(sources, "resume.pdf");
if (await exists(resumeSource)) {
  await copyFile(resumeSource, resolve(publicOut, "resume.pdf"));
  console.log("resume copied to public/resume.pdf");
}
```

Sharp strips EXIF (including GPS) because `withMetadata()` is never called. `.rotate()` with no argument applies the EXIF orientation first, which fixes the sideways `IMG_9104.jpeg` class of files if one is ever added.

- [ ] **Step 4: Run the pipeline**

Run: `npm run rooms`
Expected: eleven `room` lines, each `NNNNx` with height = width x 2 / 3 (for example `hero 1032x688`, `chancellor 1440x960`, `contact 927x618`), nineteen `full` lines, an `og` line, and `resume copied`. If a line says `missing source photo`, fix the path in `rooms.ts`; do not create placeholders.

- [ ] **Step 5: Verify sizes and metadata**

```bash
du -sh src/assets/rooms src/assets/full public/og.jpg public/resume.pdf
node -e "import('sharp').then(async ({default: sharp}) => { const m = await sharp('src/assets/rooms/chancellor.jpg').metadata(); console.log('exif present:', Boolean(m.exif)); })"
```
Expected: rooms under 2.5 MB total, full under 6 MB, `exif present: false`.

- [ ] **Step 6: Commit**

```bash
git add src/data/rooms.ts scripts/crop-rooms.mjs src/assets/rooms src/assets/full public/og.jpg public/resume.pdf
git commit -m "feat: add photo manifest, crop pipeline, and committed room images"
```

---

### Task 3: Rewrite the tests to protect outcomes (they fail until Tasks 4 to 10 land)

**Files:**
- Rewrite: `tests/portfolio-source.test.mjs`, `tests/portfolio-build.test.mjs`, `tests/github-pages-workflow.test.mjs`

The old suite pins the v2 layout (trajectory tablist, 100dvh hero, chapter tokens, a hero filename, twelve tabs) and bans `<audio`. The new suite protects: first-screen facts, receipts on every claim, a11y attributes, the mobile overflow fix, motion gating, the one-accent rule, the image budget, and the existing library bans. TDD note: write all three files now, run them, watch them fail on the missing data and components, then make them pass task by task.

- [ ] **Step 1: Write the source test**

`tests/portfolio-source.test.mjs`:

```js
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
    assert.ok(row.anchor.startsWith("#recognition-"), `ledger row ${row.fraction} must point at its Recognition row`);
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
  assert.equal(rooms.length, 11);
  for (const room of rooms) {
    assert.match(source, new RegExp(`data-room=["']${room.id}["']`), `no chapter owns room ${room.id}`);
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
  assert.doesNotMatch(source, /[, –]/, "no em or en dashes in served copy");
  for (const banned of [/three\.js/i, /webgl/i, /scrolltrigger/i, /<canvas/i, /lofi\.mp3/i, /curtain/i, /intermission/i, /end credits/i, /custom cursor/i, /scroll hijack/i, /autoplay/i, /<iframe/i]) {
    assert.doesNotMatch(source, banned);
  }
});

test("package pins Astro 7, Node 24, and Sharp for the crop pipeline", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.equal(packageJson.devDependencies.astro, "^7.1.3");
  assert.match(packageJson.devDependencies.sharp, /^\^0\.3\d/);
  assert.equal(packageJson.engines.node, ">=24");
  assert.equal(read(".nvmrc").trim(), "24");
  assert.match(read(".gitignore"), /^Pictures\/$/m);
});
```

- [ ] **Step 2: Write the build test**

`tests/portfolio-build.test.mjs`:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");
const client = (relativePath) => `dist/client/${relativePath}`;
const portfolio = await import(new URL("../src/data/portfolio.ts", import.meta.url).href);

test("built homepage exposes semantic recruiter content and social metadata", () => {
  const html = read(client("index.html"));
  assert.match(html, /<title>Aryan Mudgal[^<]*<\/title>/);
  assert.match(html, /<meta name="description"/);
  assert.match(html, /<meta property="og:image" content="https:\/\/aryanmudgal-tech\.github\.io\/[^"]*og\.jpg"/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
  assert.doesNotMatch(html, /http:\/\/localhost/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"alumniOf"/);
  assert.match(html, /class="skip-link" href="#main-content"/);
  assert.match(html, /<nav[^>]*aria-label="Primary"/);
  assert.match(html, /<main id="main-content"/);
  assert.match(html, /<footer[^>]*id="contact"/);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
  for (const id of ["work", "projects", "trajectory", "research", "leadership", "recognition", "about", "contact"]) {
    assert.ok(html.includes(`id="${id}"`), `built page is missing #${id}`);
  }
});

test("built first screen carries the fixation lines, the ledger, and both actions", () => {
  const html = read(client("index.html"));
  const { identity, ledger } = portfolio;
  assert.ok(html.includes(identity.fixationLine), "long fixation line missing");
  assert.ok(html.includes(identity.fixationLineShort), "short fixation line missing");
  for (const row of ledger) {
    assert.ok(html.includes(row.fraction), `ledger fraction ${row.fraction} missing`);
  }
  assert.match(html, /Email Aryan/);
  assert.match(html, /Resume \(PDF\)/);
  assert.match(html, /href="[^"]*resume\.pdf"/);
});

test("built links are actionable and external links are safe", () => {
  const html = read(client("index.html"));
  assert.doesNotMatch(html, /href=(?:""|'')/);
  assert.doesNotMatch(html, /href=(?:"#"|'#')/);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<(?:canvas|iframe)\b/i);
  const externalLinks = html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? [];
  assert.ok(externalLinks.length >= 12, `expected at least 12 external receipts, found ${externalLinks.length}`);
  for (const link of externalLinks) {
    assert.match(link, /rel="noopener noreferrer"/);
  }
  assert.ok((html.match(/opens in a new tab/g) ?? []).length >= externalLinks.length);
});

test("built images reserve space, describe themselves, and load in the right order", () => {
  const html = read(client("index.html"));
  const images = html.match(/<img\b[^>]*>/g) ?? [];
  assert.ok(images.length >= 22, `expected the rooms twice plus popovers, found ${images.length} images`);
  for (const image of images) {
    assert.match(image, /\bwidth="\d+"/);
    assert.match(image, /\bheight="\d+"/);
    assert.match(image, /\balt="/);
  }
  assert.equal((html.match(/fetchpriority="high"/g) ?? []).length, 1, "exactly one image is high priority");
  const lazy = images.filter((image) => /loading="lazy"/.test(image)).length;
  assert.equal(lazy, images.length - 1, "every image except the hero room is lazy");
  assert.ok((html.match(/<picture\b/g) ?? []).length >= 22);
  assert.match(html, /type="image\/avif"/);
});

test("built page states each award once in full and never repeats retired figures", () => {
  const html = read(client("index.html"));
  for (const fraction of ["1 of 2", "1 of 15"]) {
    const count = (html.match(new RegExp(fraction.replace(/ /g, "\\s"), "g")) ?? []).length;
    assert.ok(count <= 2, `${fraction} appears ${count} times; hero pointer plus Recognition only`);
  }
  for (const retired of ["$500K", "300 teams", "XR Hacks", "1,500+", "100,000+", "New Delhi", "PPG", "MIDL-accepted", "Hackathon recognitions"]) {
    assert.equal(html.includes(retired), false, `built page still contains ${retired}`);
  }
});

test("built frame has eleven rooms, popovers, and no hidden focusable content", () => {
  const html = read(client("index.html"));
  const frame = html.match(/<div class="frame"[\s\S]*?<\/aside>/)?.[0] ?? "";
  assert.ok(frame.length > 0, "frame markup missing");
  assert.equal((frame.match(/data-room="/g) ?? []).length, 11);
  assert.ok((html.match(/\spopover(?:\s|>)/g) ?? []).length >= 12, "one popover per room plus the phone menu");
  assert.ok((html.match(/popovertarget="/g) ?? []).length >= 12);
  assert.doesNotMatch(frame, /aria-hidden="true"/, "the frame must not hide its buttons from assistive technology");
  assert.match(html, /timeline-scope/);
});

test("built HTML stays small and the deploy folder has no server leftovers", () => {
  const html = read(client("index.html"));
  const gzipped = gzipSync(Buffer.from(html)).length;
  assert.ok(gzipped <= 20 * 1024, `index.html is ${gzipped} bytes gzipped; budget is 20 KB`);
  assert.equal(existsSync(join(root, "dist", "server")), false);
  assert.equal(existsSync(join(root, "dist", "client", "_headers")), false);
  assert.equal(existsSync(join(root, "dist", "client", "og.jpg")), true);
  assert.equal(existsSync(join(root, "dist", "client", "resume.pdf")), true);
});

test("built 404 page offers a route home", () => {
  const html = read(client("404.html"));
  assert.match(html, /Page not found/);
  assert.match(html, /href="(?:\/website)?\/"/);
  assert.match(html, /Return home/);
});
```

- [ ] **Step 3: Write the workflow test**

`tests/github-pages-workflow.test.mjs`:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(root, relativePath), "utf8");

test("GitHub Pages workflow builds on pull requests, deploys only on main, and uses Node 24", () => {
  const workflowPath = join(root, ".github/workflows/deploy-pages.yml");
  assert.equal(existsSync(workflowPath), true, "the repository needs a GitHub Pages workflow");
  const workflow = read(".github/workflows/deploy-pages.yml");
  const astroConfig = read("astro.config.mjs");

  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /node-version:\s*24/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /id:\s*pages/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /npm run test:build/);
  assert.match(workflow, /BASE_URL:\s*\$\{\{\s*steps\.pages\.outputs\.base_path\s*\}\}/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /path:\s*\.\/dist\/client/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /if:\s*github\.event_name != 'pull_request'/);
  assert.match(astroConfig, /base:\s*process\.env\.BASE_URL\s*\|\|\s*"\/"/);
  assert.match(astroConfig, /site:\s*"https:\/\/aryanmudgal-tech\.github\.io"/);
});

test("GitHub Pages build prefixes every asset with the repository base path", () => {
  execFileSync("npm", ["run", "build"], {
    cwd: root,
    env: { ...process.env, BASE_URL: "/website" },
    stdio: "pipe",
  });
  const index = read("dist/client/index.html");
  const page404 = read("dist/client/404.html");

  assert.doesNotMatch(index, /(?:src|href)="\/(?!website\/)/, "an absolute path is missing the base");
  assert.doesNotMatch(index, /srcset="\/(?!website\/)/, "a srcset entry is missing the base");
  assert.match(index, /href="\/website\/resume\.pdf"/);
  assert.match(index, /content="https:\/\/aryanmudgal-tech\.github\.io\/website\/og\.jpg"/);
  assert.match(page404, /href="\/website\/favicon\.svg"/);
});
```

- [ ] **Step 4: Run the suite and confirm it fails for the right reasons**

Run: `npm test 2>&1 | tail -30`
Expected: failures such as `Cannot find module '../src/data/portfolio.ts'` exports (`identity` undefined) and missing component files. No syntax errors in the test files themselves.

- [ ] **Step 5: Commit**

```bash
git add tests
git commit -m "test: replace layout pins with outcome contracts for v3"
```

---

### Task 4: Rewrite the data model with the confirmed facts

**Files:**
- Rewrite: `src/data/portfolio.ts`

- [ ] **Step 1: Write the data file**

```ts
import type { ChapterId, Receipt } from "./rooms";

export type { Receipt };

export type Link = { readonly label: string; readonly href: string };

/** Claims Aryan asked to keep although no public record exists. Each renders without a Source chip. */
export type KnownException = "armie-honorable-mention" | "men-in-green" | "safeline-remarks";

type Sourced = {
  readonly receipts: readonly Receipt[];
  readonly exception?: KnownException;
};

export type LedgerRow = {
  readonly fraction: string;
  readonly text: string;
  /** Anchor of the Recognition row that holds the full statement. */
  readonly anchor: string;
  readonly receipt: Receipt;
  readonly bold?: boolean;
};

export type Experience = Sourced & {
  readonly company: string;
  readonly role: string;
  readonly place: string;
  readonly period: string;
  readonly outcome: string;
  readonly detail: string;
  readonly myPart: string;
};

export type Project = Sourced & {
  readonly id: ChapterId;
  readonly name: string;
  readonly event: string;
  readonly date: string;
  readonly result: string;
  readonly pool?: string;
  readonly built: string;
  readonly myPart: string;
  readonly team: readonly string[];
  readonly aside?: string;
};

export type RouteEvent = {
  readonly period: string;
  readonly title: string;
  readonly href: string;
};

export type ResearchItem = Sourced & {
  readonly title: string;
  readonly role: string;
  readonly period: string;
  readonly summary: string;
  readonly detail: string;
};

export type LeadershipItem = Sourced & {
  readonly title: string;
  readonly role: string;
  readonly period: string;
  readonly summary: string;
};

export type Recognition = Sourced & {
  readonly id: ChapterId;
  readonly title: string;
  readonly fraction: string;
  readonly denominator: string;
  readonly context: string;
  readonly date: string;
  readonly watch?: Receipt;
};

export type AboutLine = {
  readonly text: string;
  readonly href?: string;
};

export const navItems: readonly Link[] = [
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Research", href: "#research" },
  { label: "Leadership", href: "#leadership" },
  { label: "Recognition", href: "#recognition" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const links = {
  email: "mailto:aryanmudgal4493@gmail.com",
  linkedin: "https://www.linkedin.com/in/aryan-mudgal",
  github: "https://github.com/aryanmudgal-tech",
  devpost: "https://devpost.com/aryanmudgal4493",
  resume: "resume.pdf",
} as const;

const source = {
  ubnowChancellor: { label: "UBNow", href: "https://www.buffalo.edu/ubnow/stories/2026/04/student-chancellors-awards.html" },
  sunyRelease: { label: "SUNY", href: "https://www.suny.edu/suny-news/press-releases/4-26/4-27-26-3/case.html" },
  ubLeadershipAwards: { label: "UB Student Life", href: "https://www.buffalo.edu/studentlife/who-we-are/departments/engagement/leadership-awards.html" },
  ubPbk: { label: "UB Arts and Sciences", href: "https://arts-sciences.buffalo.edu/phi-beta-kappa.html" },
  spectrumCleanCampus: { label: "The Spectrum", href: "https://www.ubspectrum.com/article/2024/12/clean-campus-has-students-step-up-to-clean-ub-one-weekend-at-a-time" },
  ceremonyVideo: { label: "Watch, 2:56", href: "https://www.youtube.com/watch?v=Aru9b8gWmtE&t=176s" },
  linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/aryan-mudgal" },
  resume: { label: "Resume", href: "resume.pdf" },
  devpostDots: { label: "Devpost", href: "https://devpost.com/software/dots-y5r21j" },
  githubDots: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/dots" },
  devpostArmie: { label: "Devpost", href: "https://devpost.com/software/armie" },
  githubArmie: { label: "GitHub", href: "https://github.com/liviaellen/ble-mithack" },
  githubStreamFair: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/StreamFair" },
  videoStreamFair: { label: "Demo video, sign-in required", href: "https://drive.google.com/file/d/12grQ7uR837u36IkN1WaILOC0SHycm2rh/view?usp=sharing" },
  devpostWod: { label: "Devpost", href: "https://devpost.com/software/c-o-r-e" },
  githubWod: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/stanford-xr-core" },
  githubSafeline: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/safeline" },
  githubPortal: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/Student-Issue-Portal" },
  githubLitos: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/Litos" },
} as const satisfies Record<string, Receipt>;

export const identity = {
  name: "Aryan Mudgal",
  fixationLine:
    "B.S. Computer Science, University at Buffalo, December 2026, GPA 3.93. Software Engineer Intern at Linde, Summer 2026; before that Meta Layer Initiative (2025) and HCLTech, Dubai (2024). Seeking new-grad software or forward-deployed engineering roles from January 2027. New York City, open to relocation.",
  fixationLineShort:
    "CS, University at Buffalo, Dec 2026. SWE Intern, Linde, 2026. Seeking new-grad SWE roles from Jan 2027. NYC, open to relocation.",
  description:
    "Aryan Mudgal: computer science at the University at Buffalo (December 2026), software engineer intern at Linde, two-time hackathon track winner, SUNY Chancellor's Award recipient. Seeking new-grad software roles in New York City.",
} as const;

/** One sentence per section; nav labels stay conventional, headings do the talking. */
export const headings = {
  work: "Three summers, one app that replaced paper on a plant floor",
  projects: "What I built in a day at UCLA, MIT, CMU and Stanford",
  trajectory: "Pune to Buffalo to New York City, as a list",
  research: "Counting fetal cells in maternal blood",
  leadership: "Elected twice, founded twice",
  recognition: "Two awards in one April, and a key",
  about: "Outside the work",
  contact: "Every claim above has a link",
} as const;

export const ledger: readonly LedgerRow[] = [
  {
    fraction: "1 of 2",
    text: "Award for Innovative Student Leadership, University at Buffalo, April 2026.",
    anchor: "#recognition-pillar",
    receipt: source.ubLeadershipAwards,
    bold: true,
  },
  {
    fraction: "1 of 15",
    text: "SUNY Chancellor's Award for Student Excellence, April 2026.",
    anchor: "#recognition-chancellor",
    receipt: source.sunyRelease,
  },
  {
    fraction: "Top 10%",
    text: "Phi Beta Kappa, University at Buffalo chapter, 2026.",
    anchor: "#recognition-pbk",
    receipt: source.ubPbk,
  },
];

export const experiences: readonly Experience[] = [
  {
    company: "Linde",
    role: "Software Engineer Intern",
    place: "Buffalo, NY",
    period: "Summer 2026",
    outcome: "Replaced paper production logging across a plant with an app that saves operators about three hours a day.",
    detail:
      "Built and shipped an ASP.NET Core MVC application from scratch. Designed the SQL Server schema, integrated Active Directory sign-in so floor laptops log in automatically, deployed on-prem via IIS, and built an Azure CI/CD pipeline for a second internal tool. In beta at the Palmer, Massachusetts site, slated to scale nationwide.",
    myPart: "The whole application, from schema to deployment.",
    receipts: [source.linkedin, source.resume],
  },
  {
    company: "Meta Layer Initiative",
    role: "Software Engineer Intern",
    place: "Remote",
    period: "Summer 2025",
    outcome: "Built the core browser extension: a persistent layer over any webpage where people and AI agents work side by side.",
    detail: "Shipped the extension that the initiative's human-AI collaboration work runs on. Code is private to the initiative.",
    myPart: "The extension itself.",
    receipts: [source.linkedin],
  },
  {
    company: "HCLTech",
    role: "Technical Analyst Intern",
    place: "Dubai, UAE",
    period: "May to August 2024",
    outcome: "Turned 50+ industry reports on AI in the MENA region into a strategy a Fortune 500 client acted on.",
    detail:
      "Analyzed 35+ customer journeys to align product localization with regional infrastructure standards, then delivered a 45-minute strategy presentation to C-suite stakeholders that shaped technology investment priorities across MENA markets.",
    myPart: "The research, the analysis, and the presentation.",
    receipts: [source.linkedin, source.resume],
  },
];

export const projects: readonly Project[] = [
  {
    id: "dots",
    name: "Dots",
    event: "LA Hacks, UCLA",
    date: "April 2026",
    result: "1st, Catalyst for Care track. 3rd, Agentverse track.",
    pool: "307 projects",
    built:
      "An iOS app built in 20 hours that turns floor plans or LiDAR room scans into Braille tactile maps and lets a blind user ask an AI voice agent about the space. On-device LiDAR scanning in Swift; a printable map for under 50 dollars instead of a compliance bill in the thousands.",
    myPart: "The iOS app and its full pipeline, the voice agent, and the backend that generates the Braille-map STL.",
    team: ["Ayush Srivastava", "Manav Sharma", "Abhi Ramtel"],
    aside: "One blind user tested it before the demo: my cousin.",
    receipts: [source.devpostDots, source.githubDots],
  },
  {
    id: "armie",
    name: "ARMIE",
    event: "MIT Reality Hack",
    date: "January 2026",
    result: "Honorable mention.",
    built: "Mixed-reality surgical training on Snap Spectacles paired with a 3D-printed robot arm, so a trainee's hands practice on something physical while the headset scores them.",
    myPart: "The anomaly-detection model, trained on existing neurosurgical training datasets.",
    team: ["Livia Ellen", "Lidia Likaya"],
    receipts: [source.devpostArmie, source.githubArmie],
    exception: "armie-honorable-mention",
  },
  {
    id: "streamfair",
    name: "StreamFair",
    event: "TartanHacks, Carnegie Mellon",
    date: "February 2026",
    result: "1st, Ripple track.",
    built:
      "A Chrome extension built in 24 hours for YouTube and Amazon Prime rentals: pay per second watched through XRPL and RLUSD micropayments instead of the full rental fee, and creators are paid for watch time.",
    myPart: "The extension and the payment flow.",
    team: ["Yash Nakadi", "Ayush Srivastava"],
    aside: "The team was Water Mellon. It is a Carnegie Mellon pun and nothing deeper.",
    receipts: [source.githubStreamFair, source.videoStreamFair],
  },
  {
    id: "wod",
    name: "W.O.D.",
    event: "Immerse The Bay, Stanford XR",
    date: "November 2025",
    result: "1st, Best Creation on Moonlake.",
    pool: "56 projects",
    built: "A playable VR world set in Tang-dynasty China, built in Moonlake by a two-person team over a weekend.",
    myPart: "World logic and the playable loop.",
    team: ["Ayush Srivastava"],
    receipts: [source.devpostWod, source.githubWod],
  },
  {
    id: "safeline",
    name: "Safeline",
    event: "YC Voice Agents Hackathon, San Francisco",
    date: "May 2026",
    result: "Did not place. The demo ran.",
    built: "A voice agent that drafts law-enforcement incident reports from a spoken account, built in a day.",
    myPart: "The voice pipeline and the report portal.",
    team: ["Ayush Srivastava"],
    aside: "Officers we spoke with said it would cut hours of documentation; the judges called the idea unique. Both are what people said in the room, not a citation.",
    receipts: [source.githubSafeline],
    exception: "safeline-remarks",
  },
];

export const route: readonly RouteEvent[] = [
  { period: "2020 to 2023", title: "Pune, India. Army family; ten schools before university.", href: "#about" },
  { period: "August 2023", title: "University at Buffalo, Computer Science.", href: "#top" },
  { period: "2023 to 2024", title: "Student Senator.", href: "#leadership" },
  { period: "Summer 2024", title: "HCLTech, Dubai.", href: "#work" },
  { period: "Sept 2024 to Oct 2025", title: "SUNY Student Assembly Delegate.", href: "#leadership" },
  { period: "2025", title: "Research assistant, fetomaternal hemorrhage detection.", href: "#research" },
  { period: "Summer 2025", title: "Meta Layer Initiative.", href: "#work" },
  { period: "November 2025", title: "W.O.D., Immerse The Bay.", href: "#projects" },
  { period: "January 2026", title: "ARMIE, MIT Reality Hack.", href: "#projects" },
  { period: "February 2026", title: "StreamFair, TartanHacks.", href: "#projects" },
  { period: "April 2026", title: "Dots, LA Hacks. Two awards in Buffalo and Albany the same month.", href: "#recognition" },
  { period: "Summer 2026", title: "Linde, Buffalo.", href: "#work" },
  { period: "December 2026", title: "Graduation. New York City from 2027.", href: "#contact" },
];

export const research: readonly ResearchItem[] = [
  {
    title: "Fetomaternal hemorrhage detection",
    role: "Research Assistant, University at Buffalo",
    period: "February to December 2025",
    summary: "Automated the cell-level work behind the Kleihauer-Betke test, a slide assay that counts fetal red cells in maternal blood.",
    detail:
      "Built a segmentation pipeline that seeds SAM2 with Grounding DINO detections, isolating 2.5 million individual cells into pixel-level masks and removing manual per-cell prompting. Ran Kleihauer-Betke slide data from a Cornell collaboration and improved detection accuracy from 89% to 92%. The condition is associated with around 4% of stillbirths.",
    receipts: [source.resume],
  },
];

export const leadership: readonly LeadershipItem[] = [
  {
    title: "SUNY Student Assembly",
    role: "Delegate",
    period: "September 2024 to October 2025",
    summary: "Elected voice for UB's roughly 30,000 students in the statewide assembly.",
    receipts: [source.spectrumCleanCampus, source.ubnowChancellor],
  },
  {
    title: "UB Student Association",
    role: "Student Senator",
    period: "2023 to 2024",
    summary: "Voted on more than 50,000 dollars in club funds.",
    receipts: [source.ubnowChancellor],
  },
  {
    title: "Men In Green",
    role: "Co-founder",
    period: "Agra, India, since July 2023",
    summary:
      "Screens Indian military-academy candidates for correctable medical disqualifiers. 450+ screened; 3 commissioned as officers who would otherwise have been turned away.",
    receipts: [],
    exception: "men-in-green",
  },
  {
    title: "Clean Campus",
    role: "Co-founder, with Chirag Ohri",
    period: "Since spring 2024",
    summary: "Ten cleanup drives, about 150 pounds of litter, chapters started at NYU and Boston University, about 500 dollars raised through UB's Get Seeded competition.",
    receipts: [source.spectrumCleanCampus],
  },
  {
    title: "Student Issue Portal",
    role: "Built it",
    period: "2024",
    summary: "A site for UB's roughly 30,000 students to report campus issues and follow up on them.",
    receipts: [source.githubPortal],
  },
];

export const recognitions: readonly Recognition[] = [
  {
    id: "pillar",
    title: "Award for Innovative Student Leadership",
    fraction: "1 of 2",
    denominator: "from 130+ nominations across UB's 20,000+ undergraduates",
    context: "The Pillar of Leadership award for the student whose initiative changed something at the university.",
    date: "University at Buffalo, April 2026",
    receipts: [source.ubLeadershipAwards],
  },
  {
    id: "chancellor",
    title: "SUNY Chancellor's Award for Student Excellence",
    fraction: "1 of 15",
    denominator: "at UB, 205 across the 64-campus SUNY system",
    context: "SUNY's highest student honor, presented in Albany by Chancellor John B. King Jr.",
    date: "Albany, 27 April 2026",
    receipts: [source.sunyRelease, source.ubnowChancellor],
    watch: source.ceremonyVideo,
  },
  {
    id: "pbk",
    title: "Phi Beta Kappa",
    fraction: "Top 10%",
    denominator: "of the graduating class, the chapter's criterion",
    context: "Inducted into the oldest academic honor society in the United States.",
    date: "University at Buffalo, 2026",
    receipts: [source.ubPbk],
  },
];

export const about: readonly AboutLine[] = [
  { text: "I do impressions, mostly Bollywood, on request." },
  { text: "Army kid: ten schools before university. Pune from 2020 to 2023, Buffalo since 2023." },
  { text: "Golf handicap 20. Badminton most weeks." },
  { text: "Geopolitics and public speaking, when nobody stops me." },
  { text: "Building Litos, a Chrome extension on the Chrome Web Store that shows what each Claude message costs you.", href: source.githubLitos.href },
];

export const colophon = {
  version: "v3, September 2026. v2 (July 2026) was a plain page. v1 (June 2026) had a projector and a mini-golf game.",
  photos: "Photos by event photographers and by me. The last one is pencil.",
  type: "Set in Newsreader and Instrument Sans.",
  corrections: "Figures aligned to UBNow, SUNY and Devpost, September 2026.",
} as const;

export const places = ["Pune", "Buffalo", "New York City"] as const;
```

- [ ] **Step 2: Verify the data loads and the data-only tests pass**

Run: `node -e "import('./src/data/portfolio.ts').then(m => console.log(m.identity.fixationLineShort.length, m.ledger.length, m.projects.length))"`
Expected: `128 3 5` (the short line must print 130 or less).

Run: `node --test tests/portfolio-source.test.mjs 2>&1 | grep -E "^(ok|not ok)"`
Expected: `ok` for "the first screen carries status...", "every claim has a receipt...", "retired figures...", "package pins..."; `not ok` for the component and CSS tests (they land in Tasks 5 to 9).

- [ ] **Step 3: Check every receipt URL answers**

```bash
node -e "
import('./src/data/portfolio.ts').then(async (m) => {
  const urls = new Set();
  const collect = (items) => items.forEach((i) => (i.receipts ?? []).forEach((r) => r.href.startsWith('http') && urls.add(r.href)));
  collect(m.experiences); collect(m.projects); collect(m.research); collect(m.leadership); collect(m.recognitions);
  m.ledger.forEach((r) => urls.add(r.receipt.href));
  for (const url of urls) {
    const res = await fetch(url, { method: 'GET', redirect: 'follow' }).catch((e) => ({ status: 'ERR ' + e.message }));
    console.log(String(res.status).padEnd(6), url);
  }
});
"
```
Expected: every line starts with `200`. A `404` means the receipt URL is wrong: find the correct page (UB Student Life leadership awards, UB Arts and Sciences Phi Beta Kappa, the SUNY release) with a web search and fix `source` in `portfolio.ts` and `rooms.ts`. Google Drive and YouTube may answer `200` with a consent page; that is acceptable.

- [ ] **Step 4: Commit**

```bash
git add src/data/portfolio.ts src/data/rooms.ts
git commit -m "feat: rewrite portfolio data with confirmed facts and receipts"
```

---

### Task 5: The design system and layout CSS

**Files:**
- Rewrite: `src/styles/global.css` (replace the whole file)

Rules the tests enforce: one `@supports (animation-timeline: view())` block holds every `animation` declaration and the keyframes, closed by a `}` at column zero; the reduced-motion block sets only timing functions, durations and scroll behavior; no `vh` units (use `dvh`); no `gap:` shorthand on `.hero`; one accent; no gradients, no backdrop-filter, no monospace, no Inter.

- [ ] **Step 1: Write the stylesheet**

`src/styles/global.css`:

```css
:root {
  color-scheme: light dark;
  --paper: #f3f2ee;
  --paper-2: #e9e7e1;
  --paper-3: #dcd9d1;
  --ink: #1c1b19;
  --ink-2: #44423d;
  --muted: #6b6861;
  --line: #d3cfc6;
  --line-2: #b8b3a8;
  --accent: #0b4fb3;
  --accent-text: #0a45a0;
  --accent-ink: #ffffff;
  --font-display: "Newsreader", "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  --font-text: "Instrument Sans", "Helvetica Neue", Arial, sans-serif;
  --shell: 80rem;
  --gutter: clamp(1rem, 4vw, 3rem);
  --measure: 46rem;
  --header-height: 3.75rem;
  --frame-w: clamp(18rem, 30vw, 30rem);
  --radius: 3px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --paper: #15171a;
    --paper-2: #1d2024;
    --paper-3: #262a2f;
    --ink: #eceae4;
    --ink-2: #c9c6bf;
    --muted: #918d85;
    --line: #2e3237;
    --line-2: #454a51;
    --accent: #8eb4f5;
    --accent-text: #9dbdf6;
    --accent-ink: #0b1220;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  background: var(--paper);
  scroll-padding-top: calc(var(--header-height) + 1rem);
}

body {
  margin: 0;
  min-width: 20rem;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-text);
  font-size: 1.0625rem;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

::selection {
  background: var(--accent);
  color: var(--accent-ink);
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

figure,
p,
h1,
h2,
h3,
dl,
dd {
  margin: 0;
}

ul,
ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

a {
  color: inherit;
  text-decoration-thickness: 0.06em;
  text-underline-offset: 0.16em;
}

button {
  color: inherit;
  font: inherit;
}

a,
button {
  -webkit-tap-highlight-color: transparent;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

h1,
h2,
h3 {
  font-family: var(--font-display);
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

h1 {
  font-size: clamp(2.6rem, 5.2vw, 4.25rem);
  font-weight: 500;
  letter-spacing: -0.02em;
}

h2 {
  font-size: clamp(1.7rem, 2.8vw, 2.4rem);
}

h3 {
  font-size: 1.35rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  z-index: 100;
  padding: 0.6rem 0.9rem;
  background: var(--accent);
  color: var(--accent-ink);
  border-radius: var(--radius);
  transform: translateY(-200%);
}

.skip-link:focus {
  transform: none;
}

.shell {
  width: 100%;
  max-width: var(--shell);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

.label {
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.meta {
  color: var(--muted);
  font-size: 0.95rem;
}

.num {
  font-family: var(--font-display);
  font-variant-numeric: tabular-nums;
}

.source {
  display: inline-block;
  font-size: 0.86rem;
  color: var(--accent-text);
  text-decoration-color: var(--line-2);
  padding-block: 0.35rem;
}

.source:hover {
  text-decoration-color: currentColor;
}

.receipts {
  display: flex;
  flex-wrap: wrap;
  column-gap: 1.1rem;
  row-gap: 0.1rem;
}

.action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius);
  font-weight: 600;
  text-decoration: none;
}

.action--primary {
  background: var(--accent);
  color: var(--accent-ink);
}

.action--primary:hover {
  filter: brightness(1.08);
}

.action--text {
  color: var(--accent-text);
  text-decoration: underline;
  text-decoration-thickness: 0.06em;
  text-underline-offset: 0.2em;
}

/* Header */

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--paper);
  border-bottom: 1px solid var(--line);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--header-height);
  column-gap: 1rem;
}

.wordmark {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 500;
  text-decoration: none;
}

.wordmark:hover {
  text-decoration: underline;
}

.site-nav ul {
  display: flex;
  flex-wrap: wrap;
  column-gap: 1.4rem;
}

.site-nav a {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  font-size: 0.95rem;
  text-decoration: none;
  color: var(--ink-2);
  border-bottom: 2px solid transparent;
}

.site-nav a:hover,
.site-nav a:active {
  color: var(--ink);
}

.site-nav a[aria-current="location"] {
  color: var(--ink);
  border-bottom-color: var(--accent);
}

.menu-button {
  display: none;
  min-height: 2.75rem;
  min-width: 2.75rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--line-2);
  border-radius: var(--radius);
  background: var(--paper);
  font-weight: 600;
}

.site-nav--menu {
  display: none;
}

/* Rooms: reading column plus the frame */

.rooms {
  width: 100%;
  max-width: var(--shell);
  margin-inline: auto;
  padding-inline: var(--gutter);
}

main {
  min-width: 0;
}

.frame-col {
  min-width: 0;
}

.frame {
  display: grid;
}

.room {
  grid-area: 1 / 1;
  opacity: 0;
  visibility: hidden;
}

.room--1 {
  opacity: 1;
  visibility: visible;
}

.room__open {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: var(--paper-3);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: zoom-in;
}

.room__open img {
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
}

.room__caption {
  margin-top: 0.6rem;
  min-height: 3.6rem;
  font-size: 0.86rem;
  line-height: 1.45;
  color: var(--muted);
}

.room__caption .source {
  padding-block: 0;
}

/* Popovers */

.photo-popover {
  width: min(96vw, 64rem);
  max-height: 92dvh;
  margin: auto;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: var(--paper);
  color: var(--ink);
  overflow: auto;
}

.photo-popover::backdrop {
  background: rgb(0 0 0 / 0.62);
}

.photo-popover__body {
  display: grid;
  row-gap: 1rem;
  padding: 1rem;
}

.photo-popover__body img {
  width: 100%;
  border-radius: var(--radius);
}

.photo-popover__caption {
  display: grid;
  row-gap: 0.25rem;
  font-size: 0.95rem;
}

.photo-popover__close {
  justify-self: end;
  min-height: 2.75rem;
  padding: 0.4rem 1rem;
  border: 1px solid var(--line-2);
  border-radius: var(--radius);
  background: var(--paper);
  font-weight: 600;
}

/* Hero */

.hero {
  display: grid;
  row-gap: 1.4rem;
  padding-block: clamp(2rem, 5vw, 4rem) 2rem;
}

.hero__copy {
  display: grid;
  row-gap: 1.2rem;
  max-width: var(--measure);
}

.fixation {
  font-size: 1.2rem;
  line-height: 1.45;
  color: var(--ink-2);
  text-wrap: pretty;
}

.fixation--short {
  display: none;
}

.ledger {
  border-top: 1px solid var(--line-2);
}

.ledger__row {
  display: grid;
  grid-template-columns: 7rem 1fr;
  column-gap: 1rem;
  align-items: baseline;
  padding-block: 0.7rem;
  border-bottom: 1px solid var(--line);
}

.ledger__fraction {
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  text-decoration: none;
}

.ledger__fraction:hover {
  text-decoration: underline;
}

.ledger__row--bold .ledger__fraction {
  color: var(--accent-text);
  font-weight: 600;
}

.ledger__text {
  font-size: 0.98rem;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  column-gap: 1.25rem;
  row-gap: 0.6rem;
  align-items: center;
}

.chapter-figure {
  display: none;
  margin-block: 1rem;
}

.chapter-figure img {
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  border-radius: var(--radius);
}

.chapter-figure figcaption {
  margin-top: 0.5rem;
  font-size: 0.86rem;
  color: var(--muted);
}

/* Chapters */

.chapter {
  padding-block: clamp(2.5rem, 6vw, 4rem) 1rem;
  border-top: 1px solid var(--line);
}

.chapter__head {
  display: grid;
  row-gap: 0.6rem;
  max-width: var(--measure);
  margin-bottom: 1.5rem;
}

.chapter__lede {
  color: var(--ink-2);
  max-width: var(--measure);
}

.row {
  display: grid;
  grid-template-columns: 10rem minmax(0, 1fr);
  column-gap: 1.5rem;
  row-gap: 0.5rem;
  padding-block: 1.3rem;
  border-top: 1px solid var(--line);
  max-width: calc(var(--measure) + 11.5rem);
}

.row__meta {
  display: grid;
  row-gap: 0.15rem;
  color: var(--muted);
  font-size: 0.92rem;
}

.row__meta strong {
  color: var(--ink);
  font-weight: 600;
}

.row__body {
  display: grid;
  row-gap: 0.55rem;
}

.row__body h3 {
  font-size: 1.25rem;
}

.row__body p {
  text-wrap: pretty;
}

.my-part {
  color: var(--ink-2);
}

.my-part strong {
  font-weight: 600;
  color: var(--ink);
}

/* Project cards */

.card {
  display: grid;
  row-gap: 0.6rem;
  padding-block: 1.6rem;
  border-top: 1px solid var(--line);
  max-width: calc(var(--measure) + 11.5rem);
}

.card__event {
  display: flex;
  flex-wrap: wrap;
  column-gap: 0.6rem;
  color: var(--muted);
  font-size: 0.92rem;
}

.card__result {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--accent-text);
}

.card__team {
  color: var(--muted);
  font-size: 0.92rem;
}

.card__aside {
  color: var(--ink-2);
  font-style: italic;
}

/* Route */

.route li {
  display: grid;
  grid-template-columns: 11rem 1fr;
  column-gap: 1.5rem;
  padding-block: 0.55rem;
  border-top: 1px solid var(--line);
  max-width: calc(var(--measure) + 12.5rem);
}

.route li:last-child {
  border-bottom: 1px solid var(--line);
}

.route__period {
  color: var(--muted);
  font-size: 0.92rem;
  font-variant-numeric: tabular-nums;
}

.route a {
  text-decoration-color: var(--line-2);
}

/* Recognition */

.award {
  display: grid;
  grid-template-columns: 10rem minmax(0, 1fr);
  column-gap: 1.5rem;
  row-gap: 0.4rem;
  padding-block: 1.5rem;
  border-top: 1px solid var(--line);
  max-width: calc(var(--measure) + 11.5rem);
}

.award__fraction {
  font-family: var(--font-display);
  font-size: 2.4rem;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--accent-text);
}

.award__body {
  display: grid;
  row-gap: 0.4rem;
}

.award__denominator {
  color: var(--ink-2);
}

/* About */

.about-lines {
  display: grid;
  row-gap: 0.8rem;
  max-width: var(--measure);
  font-size: 1.15rem;
  font-family: var(--font-display);
}

/* Footer */

.site-footer {
  padding-block: 3rem 4rem;
  border-top: 1px solid var(--line);
}

.site-footer__inner {
  display: grid;
  row-gap: 1.5rem;
  max-width: var(--measure);
}

.contact-link {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2.4vw, 1.9rem);
  color: var(--accent-text);
  text-decoration-thickness: 0.05em;
}

.profiles {
  display: flex;
  flex-wrap: wrap;
  column-gap: 1.25rem;
  row-gap: 0.4rem;
}

.profiles a {
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
}

.colophon {
  display: grid;
  row-gap: 0.3rem;
  color: var(--muted);
  font-size: 0.86rem;
}

/* 404 */

.not-found {
  display: grid;
  row-gap: 1rem;
  padding-block: 4rem;
  max-width: var(--measure);
}

/* Desktop: two columns, the frame stays stuck beside the reading column */

@media (min-width: 64rem) {
  .rooms {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--frame-w);
    column-gap: clamp(2rem, 4vw, 4rem);
    align-items: start;
  }

  .rooms > main,
  .rooms > .site-footer {
    grid-column: 1;
  }

  .frame-col {
    grid-column: 2;
    grid-row: 1 / span 2;
    position: sticky;
    top: calc(var(--header-height) + 1.5rem);
    padding-top: clamp(2rem, 5vw, 4rem);
  }
}

/* Phone and tablet: the frame docks as a strip under the header */

@media (max-width: 63.99rem) {
  .site-nav--inline {
    display: none;
  }

  .menu-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .site-nav--menu {
    display: block;
    position: fixed;
    inset: auto var(--gutter) auto auto;
    top: calc(var(--header-height) + 0.5rem);
    margin: 0;
    padding: 0.5rem;
    min-width: 12rem;
    border: 1px solid var(--line-2);
    border-radius: var(--radius);
    background: var(--paper);
    color: var(--ink);
  }

  .site-nav--menu ul {
    flex-direction: column;
    row-gap: 0;
  }

  .site-nav--menu a {
    min-height: 3rem;
    padding-inline: 0.75rem;
    width: 100%;
  }

  .frame-col {
    position: sticky;
    top: var(--header-height);
    z-index: 10;
    margin-inline: calc(-1 * var(--gutter));
    padding: 0.5rem var(--gutter) 0.4rem;
    background: var(--paper);
    border-bottom: 1px solid var(--line);
  }

  .room__open img {
    aspect-ratio: auto;
    height: 21dvh;
    min-height: 8.5rem;
    object-position: 50% 30%;
  }

  .room__caption {
    min-height: 0;
    margin-top: 0.35rem;
    font-size: 0.78rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
  }

  .fixation--long {
    display: none;
  }

  .fixation--short {
    display: block;
  }

  .fixation {
    font-size: 1.05rem;
  }

  .ledger__row {
    grid-template-columns: 5.5rem 1fr;
    min-height: 4.5rem;
  }

  .ledger__fraction {
    font-size: 1.35rem;
  }

  .hero__actions .action--primary {
    flex: 1 1 100%;
  }

  .row,
  .award,
  .route li {
    grid-template-columns: 1fr;
  }

  .award__fraction {
    font-size: 2rem;
  }
}

/* The dissolve: one scroll-driven timeline per room, no script */

@supports (animation-timeline: view()) {
  .rooms {
    timeline-scope: --r-hero, --r-dots, --r-armie, --r-streamfair, --r-wod, --r-safeline, --r-research, --r-chancellor, --r-pillar, --r-pbk, --r-contact;
  }

  [data-room="hero"] { view-timeline-name: --r-hero; }
  [data-room="dots"] { view-timeline-name: --r-dots; }
  [data-room="armie"] { view-timeline-name: --r-armie; }
  [data-room="streamfair"] { view-timeline-name: --r-streamfair; }
  [data-room="wod"] { view-timeline-name: --r-wod; }
  [data-room="safeline"] { view-timeline-name: --r-safeline; }
  [data-room="research"] { view-timeline-name: --r-research; }
  [data-room="chancellor"] { view-timeline-name: --r-chancellor; }
  [data-room="pillar"] { view-timeline-name: --r-pillar; }
  [data-room="pbk"] { view-timeline-name: --r-pbk; }
  [data-room="contact"] { view-timeline-name: --r-contact; }

  .room {
    animation: room-in linear both;
    animation-range: cover 24% cover 34%;
  }

  .room--1 {
    animation: none;
  }

  .room[data-room="dots"] { animation-timeline: --r-dots; }
  .room[data-room="armie"] { animation-timeline: --r-armie; }
  .room[data-room="streamfair"] { animation-timeline: --r-streamfair; }
  .room[data-room="wod"] { animation-timeline: --r-wod; }
  .room[data-room="safeline"] { animation-timeline: --r-safeline; }
  .room[data-room="research"] { animation-timeline: --r-research; }
  .room[data-room="chancellor"] { animation-timeline: --r-chancellor; }
  .room[data-room="pillar"] { animation-timeline: --r-pillar; }
  .room[data-room="pbk"] { animation-timeline: --r-pbk; }
  .room[data-room="contact"] { animation-timeline: --r-contact; }

  @keyframes room-in {
    from {
      opacity: 0;
      visibility: hidden;
    }
    to {
      opacity: 1;
      visibility: visible;
    }
  }
}

/* Without scroll-driven animations the frame is a plain photo and every chapter shows its own figure */

@supports not (animation-timeline: view()) {
  .frame-col {
    position: static;
  }

  .room:not(.room--1) {
    display: none;
  }

  .chapter-figure {
    display: block;
  }
}

@media (prefers-reduced-motion: reduce) {
  .room {
    animation-timing-function: steps(1, end);
  }

  html {
    scroll-behavior: auto;
  }
}

@media print {
  .site-header,
  .frame-col,
  .menu-button,
  .skip-link,
  [popover] {
    display: none;
  }

  body {
    background: #fff;
    color: #000;
    font-size: 10.5pt;
  }

  .chapter-figure {
    display: block;
    max-width: 22rem;
  }

  .source[href^="http"]::after,
  .contact-link::after,
  .profiles a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #444;
  }

  .chapter,
  .row,
  .card,
  .award {
    break-inside: avoid;
  }
}
```

- [ ] **Step 2: Run the CSS-only tests**

Run: `node --test tests/portfolio-source.test.mjs 2>&1 | grep -E "^(ok|not ok)"`
Expected: `ok` for "motion is gated...", "the visual system keeps one accent..."; other component tests still `not ok` until Tasks 6 to 9.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: v3 design system with the scroll-driven frame styles"
```

---

### Task 6: Layout shell and navigation

**Files:**
- Rewrite: `src/layouts/BaseLayout.astro`, `src/components/SiteNav.astro`

- [ ] **Step 1: Rewrite the layout**

`src/layouts/BaseLayout.astro`:

```astro
---
import "../styles/global.css";
import { publicAssetUrl } from "../lib/site-url";
import { identity, links } from "../data/portfolio";

interface Props {
  title?: string;
  description?: string;
}

const {
  title = "Aryan Mudgal | Software engineer, University at Buffalo, class of December 2026",
  description = identity.description,
} = Astro.props;

const site = Astro.site ?? new URL("https://aryanmudgal-tech.github.io");
const ogImage = new URL(publicAssetUrl("og.jpg"), site).href;
const canonical = new URL(publicAssetUrl(""), site).href;

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: identity.name,
  email: links.email,
  url: canonical,
  image: ogImage,
  jobTitle: "Software engineer",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "University at Buffalo",
  },
  award: [
    "Award for Innovative Student Leadership, University at Buffalo, 2026",
    "SUNY Chancellor's Award for Student Excellence, 2026",
    "Phi Beta Kappa, 2026",
  ],
  sameAs: [links.linkedin, links.github, links.devpost],
  knowsAbout: ["Software engineering", "Machine learning", "Computer vision", "Accessibility"],
};
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <meta name="theme-color" content="#f3f2ee" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#15171a" media="(prefers-color-scheme: dark)" />
    <link rel="canonical" href={canonical} />
    <meta property="og:type" content="profile" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />
    <link rel="icon" href={publicAssetUrl("favicon.svg")} type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap"
    />
    <title>{title}</title>
    <script type="application/ld+json" set:html={JSON.stringify(personSchema)} />
  </head>
  <body id="top">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Rewrite the navigation**

`src/components/SiteNav.astro`:

```astro
---
import { navItems } from "../data/portfolio";
---

<header class="site-header">
  <div class="site-header__inner shell">
    <a class="wordmark" href="#top">Aryan Mudgal</a>
    <nav class="site-nav site-nav--inline" aria-label="Primary">
      <ul role="list">
        {navItems.map((item) => (
          <li><a href={item.href}>{item.label}</a></li>
        ))}
      </ul>
    </nav>
    <button class="menu-button" type="button" popovertarget="site-menu">Menu</button>
    <nav id="site-menu" class="site-nav site-nav--menu" popover aria-label="Menu">
      <ul role="list">
        {navItems.map((item) => (
          <li><a href={item.href}>{item.label}</a></li>
        ))}
      </ul>
    </nav>
  </div>
</header>

<script>
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.site-nav a[href^="#"]'));
  const destinations = links
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter((element): element is HTMLElement => element !== null);
  const unique = Array.from(new Set(destinations));

  function setCurrent(id: string | null) {
    links.forEach((link) => {
      if (id && link.hash === `#${id}`) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if (unique.length > 0) {
    const visibility = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        const current = [...visibility.entries()].filter(([, ratio]) => ratio > 0).sort((a, b) => b[1] - a[1])[0];
        setCurrent(current?.[0] ?? null);
      },
      { rootMargin: "-20% 0px -58% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    unique.forEach((element) => observer.observe(element));
  }

  const menu = document.getElementById("site-menu");
  if (menu && "hidePopover" in menu) {
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        try {
          (menu as HTMLElement & { hidePopover: () => void }).hidePopover();
        } catch {
          // already closed
        }
      });
    });
  }
</script>
```

- [ ] **Step 3: Confirm the nav test passes**

Run: `node --test tests/portfolio-source.test.mjs 2>&1 | grep -E "navigation exposes"`
Expected: `ok ... navigation exposes the current section without scroll listeners or swap hooks`

- [ ] **Step 4: Commit**

```bash
git add src/layouts/BaseLayout.astro src/components/SiteNav.astro
git commit -m "feat: layout with social metadata and a popover phone menu"
```

---

### Task 7: Source, Ledger, ChapterFigure, Frame, Hero, and the page shell

**Files:**
- Create: `src/components/Source.astro`, `src/components/Ledger.astro`, `src/components/ChapterFigure.astro`, `src/components/Frame.astro`
- Rewrite: `src/components/Hero.astro`, `src/pages/index.astro`
- Modify: `src/data/portfolio.ts` (the ceremony video label)

- [ ] **Step 1: The receipt link**

`src/components/Source.astro`:

```astro
---
import type { Receipt } from "../data/rooms";
import { publicAssetUrl } from "../lib/site-url";

interface Props {
  receipt: Receipt;
  /** Text before the colon. Pass an empty string to print the label alone. */
  prefix?: string;
  class?: string;
}

const { receipt, prefix = "Source", class: className } = Astro.props;
const external = receipt.href.startsWith("http");
const href = external || receipt.href.startsWith("#") ? receipt.href : publicAssetUrl(receipt.href);
const text = prefix ? `${prefix}: ${receipt.label}` : receipt.label;
---

{
  external ? (
    <a class:list={["source", className]} href={href} target="_blank" rel="noopener noreferrer">
      {text}<span class="sr-only"> opens in a new tab</span>
    </a>
  ) : (
    <a class:list={["source", className]} href={href}>{text}</a>
  )
}
```

- [ ] **Step 2: Rename the ceremony video label so it reads as a sentence with an empty prefix**

In `src/data/portfolio.ts`, change the `ceremonyVideo` entry to:

```ts
  ceremonyVideo: { label: "Hear Aryan speak at the ceremony, 2:56", href: "https://www.youtube.com/watch?v=Aru9b8gWmtE&t=176s" },
```

- [ ] **Step 3: The ledger**

`src/components/Ledger.astro`:

```astro
---
import { ledger } from "../data/portfolio";
import Source from "./Source.astro";
---

<ol class="ledger" aria-label="Three proofs">
  {ledger.map((row) => (
    <li class:list={["ledger__row", row.bold && "ledger__row--bold"]}>
      <a class="ledger__fraction" href={row.anchor}>{row.fraction}</a>
      <span class="ledger__text">{row.text} <Source receipt={row.receipt} /></span>
    </li>
  ))}
</ol>
```

- [ ] **Step 4: The inline chapter figure**

`src/components/ChapterFigure.astro`:

```astro
---
import { Picture } from "astro:assets";
import type { ImageMetadata } from "astro";
import { rooms, type ChapterId } from "../data/rooms";
import Source from "./Source.astro";

interface Props {
  room: ChapterId;
}

const { room: id } = Astro.props;
const room = rooms.find((candidate) => candidate.id === id);
if (!room) throw new Error(`unknown room ${id}`);

const images = import.meta.glob<{ default: ImageMetadata }>("../assets/rooms/*.jpg", { eager: true });
const image = images[`../assets/rooms/${id}.jpg`]?.default;
if (!image) throw new Error(`missing crop for room ${id}; run npm run rooms`);
const widths = [480, 960, 1440].filter((width) => width < image.width).concat(image.width);
---

<figure class="chapter-figure">
  <Picture
    src={image}
    widths={widths}
    sizes="(min-width: 64rem) 46rem, 100vw"
    formats={["avif", "webp"]}
    alt={room.alt}
    loading="lazy"
    decoding="async"
  />
  <figcaption>{room.caption} <Source receipt={room.receipt} /></figcaption>
</figure>
```

- [ ] **Step 5: The frame**

`src/components/Frame.astro`:

```astro
---
import { Picture } from "astro:assets";
import type { ImageMetadata } from "astro";
import { extras, rooms } from "../data/rooms";
import Source from "./Source.astro";

const roomImages = import.meta.glob<{ default: ImageMetadata }>("../assets/rooms/*.jpg", { eager: true });
const fullImages = import.meta.glob<{ default: ImageMetadata }>("../assets/full/*.jpg", { eager: true });

function roomImage(id: string): ImageMetadata {
  const image = roomImages[`../assets/rooms/${id}.jpg`]?.default;
  if (!image) throw new Error(`missing crop for room ${id}; run npm run rooms`);
  return image;
}

function fullImage(id: string): ImageMetadata {
  const image = fullImages[`../assets/full/${id}.jpg`]?.default;
  if (!image) throw new Error(`missing full-size copy for ${id}; run npm run rooms`);
  return image;
}

const roomWidths = (image: ImageMetadata) => [480, 960, 1440].filter((width) => width < image.width).concat(image.width);
const fullWidths = (image: ImageMetadata) => [800, 1600].filter((width) => width < image.width).concat(image.width);
---

<aside class="frame-col" aria-label="Photographs from the events on this page">
  <div class="frame">
    {rooms.map((room, index) => {
      const image = roomImage(room.id);
      return (
        <figure class={`room room--${index + 1}`} data-room={room.id}>
          <button class="room__open" type="button" popovertarget={`photo-${room.id}`} aria-label={`Open full photo: ${room.caption}`}>
            <Picture
              src={image}
              widths={roomWidths(image)}
              sizes="(min-width: 64rem) 30rem, 100vw"
              formats={["avif", "webp"]}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              fetchpriority={index === 0 ? "high" : "low"}
              decoding="async"
            />
          </button>
          <figcaption class="room__caption">{room.caption} <Source receipt={room.receipt} /></figcaption>
        </figure>
      );
    })}
  </div>

  {rooms.map((room) => {
    const full = fullImage(room.id);
    const roomExtras = extras.filter((extra) => extra.room === room.id);
    return (
      <div id={`photo-${room.id}`} class="photo-popover" popover>
        <div class="photo-popover__body">
          <Picture
            src={full}
            widths={fullWidths(full)}
            sizes="min(96vw, 64rem)"
            formats={["avif", "webp"]}
            alt={room.alt}
            loading="lazy"
            decoding="async"
          />
          <p class="photo-popover__caption">
            <span>{room.caption}</span>
            <Source receipt={room.receipt} />
          </p>
          {roomExtras.map((extra) => {
            const extraImage = fullImage(extra.id);
            return (
              <figure>
                <Picture
                  src={extraImage}
                  widths={fullWidths(extraImage)}
                  sizes="min(96vw, 64rem)"
                  formats={["avif", "webp"]}
                  alt={extra.alt}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption class="photo-popover__caption">{extra.caption}</figcaption>
              </figure>
            );
          })}
          <button class="photo-popover__close" type="button" popovertarget={`photo-${room.id}`} popovertargetaction="hide">Close</button>
        </div>
      </div>
    );
  })}
</aside>
```

- [ ] **Step 6: The hero**

`src/components/Hero.astro`:

```astro
---
import { identity, links } from "../data/portfolio";
import { publicAssetUrl } from "../lib/site-url";
import Ledger from "./Ledger.astro";
import ChapterFigure from "./ChapterFigure.astro";
---

<section class="hero" aria-labelledby="hero-title" data-room="hero">
  <div class="hero__copy">
    <h1 id="hero-title">{identity.name}</h1>
    <p class="fixation fixation--long">{identity.fixationLine}</p>
    <p class="fixation fixation--short">{identity.fixationLineShort}</p>
    <Ledger />
    <div class="hero__actions">
      <a class="action action--primary" href={links.email}>Email Aryan</a>
      <a class="action action--text" href={publicAssetUrl(links.resume)}>Resume (PDF)</a>
    </div>
  </div>
  <ChapterFigure room="hero" />
</section>
```

- [ ] **Step 7: The page shell**

`src/pages/index.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import SiteNav from "../components/SiteNav.astro";
import Frame from "../components/Frame.astro";
import Hero from "../components/Hero.astro";
import Experience from "../components/Experience.astro";
import Projects from "../components/Projects.astro";
import Trajectory from "../components/Trajectory.astro";
import Research from "../components/Research.astro";
import Leadership from "../components/Leadership.astro";
import Recognition from "../components/Recognition.astro";
import About from "../components/About.astro";
import SiteFooter from "../components/SiteFooter.astro";
---

<BaseLayout>
  <SiteNav />
  <div class="rooms">
    <Frame />
    <main id="main-content">
      <Hero />
      <Experience />
      <Projects />
      <Trajectory />
      <Research />
      <Leadership />
      <Recognition />
      <About />
    </main>
    <SiteFooter />
  </div>
</BaseLayout>
```

- [ ] **Step 8: Run the source tests**

Run: `node --test tests/portfolio-source.test.mjs 2>&1 | grep -E "^(ok|not ok)"`
Expected: "sections keep the approved order..." and "each room has a chapter..." still `not ok` only because Tasks 8 and 9 have not written the section components yet (missing files throw in `components()`). Everything else `ok`.

- [ ] **Step 9: Commit**

```bash
git add src/components/Source.astro src/components/Ledger.astro src/components/ChapterFigure.astro src/components/Frame.astro src/components/Hero.astro src/pages/index.astro src/data/portfolio.ts
git commit -m "feat: frame, ledger, hero, and the rooms page shell"
```

---

### Task 8: Work, Projects, Route, Research

**Files:**
- Rewrite: `src/components/Experience.astro`, `src/components/Projects.astro`, `src/components/Trajectory.astro`, `src/components/Research.astro`

- [ ] **Step 1: Work**

`src/components/Experience.astro`:

```astro
---
import { experiences, headings } from "../data/portfolio";
import Source from "./Source.astro";
---

<section id="work" class="chapter" aria-labelledby="work-title">
  <header class="chapter__head">
    <span class="label">Work</span>
    <h2 id="work-title">{headings.work}</h2>
  </header>
  {experiences.map((job) => (
    <article class="row">
      <div class="row__meta">
        <strong>{job.company}</strong>
        <span>{job.role}</span>
        <span>{job.period}</span>
        <span>{job.place}</span>
      </div>
      <div class="row__body">
        <h3>{job.outcome}</h3>
        <p>{job.detail}</p>
        <p class="my-part"><strong>My part:</strong> {job.myPart}</p>
        <div class="receipts">
          {job.receipts.map((receipt) => <Source receipt={receipt} />)}
        </div>
      </div>
    </article>
  ))}
</section>
```

- [ ] **Step 2: Projects**

`src/components/Projects.astro`:

```astro
---
import { projects, headings } from "../data/portfolio";
import Source from "./Source.astro";
import ChapterFigure from "./ChapterFigure.astro";
---

<section id="projects" class="chapter" aria-labelledby="projects-title">
  <header class="chapter__head">
    <span class="label">Projects</span>
    <h2 id="projects-title">{headings.projects}</h2>
    <p class="chapter__lede">Hackathon builds, each finished in a day or two and shown to judges. Team size and my part are stated on every card.</p>
  </header>
  {projects.map((project) => (
    <article class="card" id={`project-${project.id}`} data-room={project.id}>
      <p class="card__event">
        <span>{project.event}</span>
        <span>{project.date}</span>
        {project.pool && <span>{project.pool}</span>}
      </p>
      <h3>{project.name}</h3>
      <p class="card__result">{project.result}</p>
      <ChapterFigure room={project.id} />
      <p>{project.built}</p>
      <p class="my-part"><strong>My part:</strong> {project.myPart}</p>
      <p class="card__team">Team: {project.team.join(", ")}.</p>
      {project.aside && <p class="card__aside">{project.aside}</p>}
      <div class="receipts">
        {project.receipts.map((receipt) => <Source receipt={receipt} />)}
      </div>
    </article>
  ))}
</section>
```

- [ ] **Step 3: Route (the component keeps its filename)**

`src/components/Trajectory.astro`:

```astro
---
import { route, headings } from "../data/portfolio";
---

<section id="trajectory" class="chapter" aria-labelledby="trajectory-title">
  <header class="chapter__head">
    <span class="label">Route</span>
    <h2 id="trajectory-title">{headings.trajectory}</h2>
  </header>
  <ol class="route">
    {route.map((event) => (
      <li>
        <span class="route__period">{event.period}</span>
        <a href={event.href}>{event.title}</a>
      </li>
    ))}
  </ol>
</section>
```

- [ ] **Step 4: Research**

`src/components/Research.astro`:

```astro
---
import { research, headings } from "../data/portfolio";
import Source from "./Source.astro";
import ChapterFigure from "./ChapterFigure.astro";
---

<section id="research" class="chapter" aria-labelledby="research-title" data-room="research">
  <header class="chapter__head">
    <span class="label">Research</span>
    <h2 id="research-title">{headings.research}</h2>
  </header>
  {research.map((item) => (
    <article class="row">
      <div class="row__meta">
        <strong>{item.role}</strong>
        <span>{item.period}</span>
      </div>
      <div class="row__body">
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        <p>{item.detail}</p>
        <ChapterFigure room="research" />
        <div class="receipts">
          {item.receipts.map((receipt) => <Source receipt={receipt} />)}
        </div>
      </div>
    </article>
  ))}
</section>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Experience.astro src/components/Projects.astro src/components/Trajectory.astro src/components/Research.astro
git commit -m "feat: work, projects, route, and research sections from data"
```

---

### Task 9: Leadership, Recognition, About, Footer, 404, README

**Files:**
- Rewrite: `src/components/Leadership.astro`, `src/components/Recognition.astro`, `src/components/About.astro`, `src/components/SiteFooter.astro`, `src/pages/404.astro`, `README.md`

- [ ] **Step 1: Leadership**

`src/components/Leadership.astro`:

```astro
---
import { leadership, headings } from "../data/portfolio";
import Source from "./Source.astro";
---

<section id="leadership" class="chapter" aria-labelledby="leadership-title">
  <header class="chapter__head">
    <span class="label">Leadership</span>
    <h2 id="leadership-title">{headings.leadership}</h2>
  </header>
  {leadership.map((item) => (
    <article class="row">
      <div class="row__meta">
        <strong>{item.title}</strong>
        <span>{item.role}</span>
        <span>{item.period}</span>
      </div>
      <div class="row__body">
        <p>{item.summary}</p>
        {item.receipts.length > 0 && (
          <div class="receipts">
            {item.receipts.map((receipt) => <Source receipt={receipt} />)}
          </div>
        )}
      </div>
    </article>
  ))}
</section>
```

- [ ] **Step 2: Recognition**

`src/components/Recognition.astro`:

```astro
---
import { recognitions, headings } from "../data/portfolio";
import Source from "./Source.astro";
import ChapterFigure from "./ChapterFigure.astro";
---

<section id="recognition" class="chapter" aria-labelledby="recognition-title">
  <header class="chapter__head">
    <span class="label">Recognition</span>
    <h2 id="recognition-title">{headings.recognition}</h2>
  </header>
  {recognitions.map((award) => (
    <article class="award" id={`recognition-${award.id}`} data-room={award.id}>
      <p class="award__fraction">{award.fraction}</p>
      <div class="award__body">
        <h3>{award.title}</h3>
        <p class="award__denominator">{award.denominator}. {award.date}.</p>
        <p>{award.context}</p>
        <ChapterFigure room={award.id} />
        <div class="receipts">
          {award.receipts.map((receipt) => <Source receipt={receipt} />)}
          {award.watch && <Source receipt={award.watch} prefix="" />}
        </div>
      </div>
    </article>
  ))}
</section>
```

- [ ] **Step 3: About**

`src/components/About.astro`:

```astro
---
import { about, headings } from "../data/portfolio";
import Source from "./Source.astro";
---

<section id="about" class="chapter" aria-labelledby="about-title">
  <header class="chapter__head">
    <span class="label">About</span>
    <h2 id="about-title">{headings.about}</h2>
  </header>
  <ul class="about-lines" role="list">
    {about.map((line) => (
      <li>
        {line.text}
        {line.href && <Source receipt={{ label: "GitHub", href: line.href }} prefix="" />}
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 4: Footer with colophon**

`src/components/SiteFooter.astro`:

```astro
---
import { colophon, headings, links } from "../data/portfolio";
import { publicAssetUrl } from "../lib/site-url";
import ChapterFigure from "./ChapterFigure.astro";
---

<footer id="contact" class="site-footer" aria-labelledby="contact-title" data-room="contact">
  <div class="site-footer__inner">
    <span class="label">Contact</span>
    <h2 id="contact-title">{headings.contact}</h2>
    <a class="contact-link" href={links.email}>aryanmudgal4493@gmail.com</a>
    <nav class="profiles" aria-label="Profiles and documents">
      <a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<span class="sr-only"> opens in a new tab</span></a>
      <a href={links.github} target="_blank" rel="noopener noreferrer">GitHub<span class="sr-only"> opens in a new tab</span></a>
      <a href={links.devpost} target="_blank" rel="noopener noreferrer">Devpost<span class="sr-only"> opens in a new tab</span></a>
      <a href={publicAssetUrl(links.resume)}>Resume (PDF)</a>
    </nav>
    <ChapterFigure room="contact" />
    <div class="colophon">
      <p>{colophon.version}</p>
      <p>{colophon.photos}</p>
      <p>{colophon.type}</p>
      <p>{colophon.corrections}</p>
      <p>© 2026 Aryan Mudgal</p>
    </div>
  </div>
</footer>
```

- [ ] **Step 5: 404**

`src/pages/404.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import { siteBaseUrl } from "../lib/site-url";
---

<BaseLayout title="Page not found | Aryan Mudgal" description="The requested page could not be found.">
  <main id="main-content" class="not-found shell">
    <p class="label">404</p>
    <h1>Page not found</h1>
    <p>The link may have moved. The portfolio is one page, and it is right here.</p>
    <a class="action action--primary" href={siteBaseUrl}>Return home</a>
  </main>
</BaseLayout>
```

- [ ] **Step 6: README**

`README.md`:

```markdown
# Aryan Mudgal, portfolio (v3)

One page. A recruiter reads the facts and the proofs in the first screen; a sticky frame beside the text dissolves through eleven photographs of Aryan at the events on the page, face held to one point, driven by scroll with no JavaScript.

## Stack

Astro 7, static output, deployed to GitHub Pages by `.github/workflows/deploy-pages.yml`. No framework, no external script. Fonts from Google Fonts (Newsreader, Instrument Sans).

## Content

- `src/data/portfolio.ts` holds every fact. Each claim carries `receipts` (a URL, a photo or a document); three claims Aryan asked to keep without a public record are marked with `exception` and render without a Source link.
- `src/data/rooms.ts` is the photo manifest: source file, hand-set focal point, caption, receipt. Rooms map to chapters with `data-room`.
- Raw photos live in the untracked `Pictures/` folder. `npm run rooms` cuts 3:2 crops (face at 50%, 40%) into `src/assets/rooms/`, full-size popover copies into `src/assets/full/`, the social image into `public/og.jpg`, and copies the resume. Outputs are committed; sources are not.

## Commands

Node 24 is required (`.nvmrc`). On a Mac with Homebrew: `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`.

- `npm run dev`
- `npm run rooms` (after adding or re-cropping a photo)
- `npm test` (source contracts and the Pages workflow)
- `npm run build`
- `npm run test:build` (built output)
- `npm run check` (all three)

## Design notes

`docs/superpowers/specs/2026-09-06-me-in-every-photo-design.md` records the design, the confirmed facts, the receipts, the accepted exceptions, the voice policy and the anti-slop bans. `docs/superpowers/plans/2026-09-06-me-in-every-photo.md` is the implementation plan.
```

- [ ] **Step 7: Run the source suite; it should be green**

Run: `npm test 2>&1 | tail -20`
Expected: every source test `ok`. The workflow test still fails on `node-version: 24` and `pull_request` until Task 10.

- [ ] **Step 8: Commit**

```bash
git add src/components/Leadership.astro src/components/Recognition.astro src/components/About.astro src/components/SiteFooter.astro src/pages/404.astro README.md
git commit -m "feat: leadership, recognition, about, footer, 404, and README for v3"
```

---

### Task 10: CI workflow, full build, and browser verification

**Files:**
- Rewrite: `.github/workflows/deploy-pages.yml`
- Modify: `.claude/launch.json` (add a preview server entry)

- [ ] **Step 1: Rewrite the workflow**

`.github/workflows/deploy-pages.yml`:

```yaml
name: Build and deploy GitHub Pages

on:
  push:
    branches:
      - main
  pull_request:
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: github-pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Configure GitHub Pages
        id: pages
        uses: actions/configure-pages@v5

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Source and workflow contracts
        run: npm test

      - name: Build the Astro site
        run: npm run build
        env:
          BASE_URL: ${{ steps.pages.outputs.base_path }}

      - name: Built output contracts
        run: npm run test:build

      - name: Upload GitHub Pages artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: ./dist/client

  deploy:
    if: github.event_name != 'pull_request'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Run the whole check**

Run: `npm run check 2>&1 | tail -40`
Expected: all source and workflow tests `ok`; the build prints eleven or more image optimizations and `2 page(s) built`; all build tests `ok`, including the 20 KB gzip budget. If the gzip budget fails, drop the `960` width from `roomWidths` in `Frame.astro` and rerun.

- [ ] **Step 3: Add a preview server entry and open it**

Add to `.claude/launch.json` `configurations`:

```json
{
  "name": "preview",
  "runtimeExecutable": "/opt/homebrew/opt/node@24/bin/npm",
  "runtimeArgs": ["run", "preview", "--", "--port", "4321", "--host", "127.0.0.1"],
  "port": 4321
}
```

Open it with the Browser pane (`preview_start` with `name: "preview"`). Do not use Bash to run the server.

- [ ] **Step 4: Verify in the browser, desktop**

At the pane's native size and at 1440x900:
- Screenshot the first viewport. Expect: name, long fixation line, three ledger rows with the first fraction bold and blue, Email and Resume, the frame at right showing the LA Hacks demo with the face upper-center, the Work heading cut by the fold.
- Run in the console: `Array.from(document.querySelectorAll('.room')).map(r => getComputedStyle(r).opacity).join(',')` after `window.scrollTo(0, document.querySelector('#recognition-chancellor').offsetTop - innerHeight * 0.4)`. Expect the chancellor room at or near `1` and earlier rooms at `1`, later ones `0`.
- Click the frame; the popover opens with the full photo, caption, Source and Close. Escape closes it.
- `document.documentElement.scrollWidth <= innerWidth` is `true`.
- Console has no errors.

- [ ] **Step 5: Verify in the browser, phone**

Resize to the mobile preset (375x812) and reload:
- Screenshot the first viewport. Expect: header with Menu, the docked frame strip (21dvh), name, the short fixation line, three ledger rows, a full-width Email button, Resume, and the Work heading cut by the fold.
- `document.documentElement.scrollWidth <= innerWidth` is `true` (this is the v2 bug).
- Tap Menu: the popover lists seven links; tapping one closes it and scrolls.
- Scroll to Recognition: the strip shows the Albany photo with the face visible.

- [ ] **Step 6: Accessibility pass**

In the console:

```js
const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js'; document.head.append(s);
await new Promise(r => s.onload = r);
const results = await axe.run();
results.violations.map(v => `${v.id}: ${v.nodes.length}`);
```
Expected: `[]`. Fix any violation in the component that produced it and rebuild.

- [ ] **Step 7: Page weight**

From the pane's network log after a fresh desktop load: total transferred under 900 KB, with the eleven room images as AVIF. If over, lower `quality` in `crop-rooms.mjs` to 78 and rerun `npm run rooms` and the build.

- [ ] **Step 8: Reset the pane and commit**

Reset the viewport to desktop, then:

```bash
git add .github/workflows/deploy-pages.yml .claude/launch.json
git commit -m "ci: build and test on pull requests, deploy only from main, Node 24"
```

---

### Task 11: Hand-off

- [ ] **Step 1: Send Aryan the proof**

Send the desktop and phone first-viewport screenshots and a scrolled screenshot with `SendUserFile`. State what is on the branch and what is not (no audio, no Linde diagram, no MIDL row, no joke), and list the pending items from the spec.

- [ ] **Step 2: Ask before merging**

Merging `v3-me-in-every-photo` into `main` publishes the site. Ask Aryan for an explicit yes. If yes: `git checkout main && git merge --ff-only v3-me-in-every-photo && git push origin main`, then confirm the Pages deployment is green and the live phone hero no longer clips.

- [ ] **Step 3: Update memory**

Record in the project memory: v3 shipped or pending merge, the branch name, the pending items, and that `Pictures/` is untracked and must never be committed.

---

## Self-review against the spec

- Hero first screen, fixation lines, ledger, actions: Task 4 data, Task 7 components, Task 5 CSS. Covered.
- Frame mechanics, 3:2 crops, registration, popovers, no aria-hidden, one eager image: Tasks 2, 5, 7. Covered.
- Phone docked strip, menu popover, no horizontal overflow: Tasks 5, 6, 10. Covered.
- Degradation (no support, reduced motion, no JS): Task 5 `@supports not` block, reduced-motion block; popover buttons degrade to inert buttons without support, so the spec's "plain link" fallback is not implemented. Accepted for weekend 1 because every photo is also inline via `ChapterFigure` when the frame is inactive.
- Receipts on every claim and the three exceptions: Tasks 3, 4. Covered.
- Corrections (retired figures): Tasks 3, 4. Covered.
- Print stylesheet, JSON-LD, og image, canonical: Tasks 5, 6, 2. Covered.
- Node 24, gitignore, EXIF strip, PR trigger, gated deploy: Tasks 1, 2, 10. Covered.
- 404, README, spec reference: Task 9. Covered.
- Voice policy: nothing ships; no task. Covered by omission on purpose.
- Not in this plan: the Linde diagram room, the MIDL ledger swap, the pre-tested joke, the hotfix commit on `main`, the custom domain. Each waits on Aryan and is listed in the spec's pending items.
