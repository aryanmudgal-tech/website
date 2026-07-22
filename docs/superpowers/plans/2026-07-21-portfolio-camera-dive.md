# Portfolio Camera Dive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Aryan Mudgal's portfolio around a scroll-scrubbed particle-brain Camera Dive while preserving every verified fact, link, accessibility contract, and deployment target.

**Architecture:** Keep Astro's static content and typed data as the stable layer. Add one dependency-free Canvas 2D engine behind six semantic scroll chapters; chapter markup exposes scene identifiers while the engine alone owns deterministic particles, interpolation, adaptive rendering, and failure handling.

**Tech Stack:** Astro 7.1.3, TypeScript/Astro components, native JavaScript modules, Canvas 2D, native CSS, Node `node:test`, GitHub Pages, Sites packaging.

## Global Constraints

- Implement `docs/superpowers/specs/2026-07-21-portfolio-camera-dive-design.md` exactly.
- Preserve all verified portfolio facts, public URLs, images, metadata, Person JSON-LD, favicon, skip link, 404 route, `publicAssetUrl()`, base-path behavior, and Sites worker packaging.
- Use Canvas 2D only; add no runtime dependency and do not use Three.js, WebGL, GSAP, ScrollTrigger, Lenis, synthetic scrolling, a custom scrollbar, audio, or a custom cursor.
- Keep all content server-rendered and readable without JavaScript.
- Keep the canvas decorative, pointer-transparent, and `aria-hidden="true"`.
- Use `#000000`, `#ffffff`, `#bdbdbd`, `#8d8d92`, `#8052ff`, `#ffb829`, and canvas-only `#15846e` as the complete palette.
- Respect `prefers-reduced-motion`, visible focus, keyboard navigation, touch scrolling, and WCAG AA intent.
- Preserve unrelated user-owned `.agents/`, `.claude/skills/`, `Pictures/`, and `skills-lock.json` files.

---

## File structure

- `src/lib/particle-brain.mjs`: pure deterministic model helpers plus the Canvas 2D runtime.
- `src/components/ParticleBrain.astro`: canvas/fallback markup and engine initialization.
- `src/pages/index.astro`: six-chapter composition and fixed canvas placement.
- `src/data/portfolio.ts`: reduced primary navigation only; factual records remain unchanged.
- `src/components/{SiteNav,Hero,Experience,Projects,Trajectory,Research,Leadership,Recognition,About,SiteFooter}.astro`: semantic Camera Dive chapter markup.
- `src/styles/{global,tokens,layout,motion}.css`: modular visual system and responsive/motion rules.
- `tests/particle-brain.test.mjs`: executable pure-helper unit tests.
- `tests/{portfolio-source,portfolio-build}.test.mjs`: source and production contracts for the new experience.
- `README.md`: current architecture, interaction, and verification guidance.

### Task 1: Lock the Camera Dive contract with failing tests

**Files:**
- Create: `tests/particle-brain.test.mjs`
- Modify: `tests/portfolio-source.test.mjs`
- Modify: `tests/portfolio-build.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: the approved design specification.
- Produces: executable expectations for `createBrainModel(options)`, `interpolateScene(frames, progress)`, `particleBudget(width, reducedMotion)`, the six scene markers, and built semantic output.

- [ ] **Step 1: Add the particle helper test command**

Set `test` to run `tests/particle-brain.test.mjs` before the two existing source suites:

```json
"test": "node --test tests/particle-brain.test.mjs tests/portfolio-source.test.mjs tests/github-pages-workflow.test.mjs"
```

- [ ] **Step 2: Write deterministic model tests**

Import the planned helpers from `src/lib/particle-brain.mjs` and assert: identical seed/options return identical first twenty particles; different seeds differ; every point has finite `x`, `y`, `cluster`, `tone`, and `phase`; budgets equal `420` for reduced motion and small viewports below 640px, `800` below 1024px, and `1400` otherwise; interpolation clamps progress and returns finite `x`, `y`, `zoom`, and `clusterMix`.

- [ ] **Step 3: Replace outgoing visual assertions**

Require `ParticleBrain.astro`, `<canvas`, `aria-hidden="true"`, `data-brain-scene` values `hero`, `work`, `projects`, `research`, `leadership`, and `about`, Canvas 2D `getContext("2d")`, `requestAnimationFrame`, `document.hidden`, a capped device-pixel ratio, `brain-unavailable`, and the three modular stylesheets. Reject the prohibited runtimes from Global Constraints.

- [ ] **Step 4: Update built-output assertions**

Require one decorative canvas, all preserved anchors and facts, one `h1`, semantic landmarks, and external-link protections. Remove the obsolete ban on `<canvas>` and the exact twelve-tab Career Path contract while still requiring the complete chronological labels in server-rendered HTML.

- [ ] **Step 5: Run tests and verify RED**

Run: `npm test`

Expected: FAIL because `particle-brain.mjs`, `ParticleBrain.astro`, scene markers, and modular styles do not exist.

### Task 2: Build the deterministic particle-brain engine

**Files:**
- Create: `src/lib/particle-brain.mjs`
- Create: `src/components/ParticleBrain.astro`
- Test: `tests/particle-brain.test.mjs`

**Interfaces:**
- Consumes: elements matching `[data-brain-scene]` and their ordered `data-brain-scene` names.
- Produces: `createBrainModel({ seed, count })`, `particleBudget(width, reducedMotion)`, `interpolateScene(frames, progress)`, and `initParticleBrain(canvas, sceneElements)`.

- [ ] **Step 1: Implement pure deterministic helpers**

Use a seeded Mulberry32 generator. Generate particles by rejection-sampling two overlapping ellipses with a lower taper, assign the closest of six fixed cluster centers, and alternate triangle direction through `phase`. Implement clamped linear interpolation across scene frames.

- [ ] **Step 2: Verify helper tests GREEN**

Run: `node --test tests/particle-brain.test.mjs`

Expected: all helper tests pass with zero failures.

- [ ] **Step 3: Implement the Canvas 2D runtime**

Size the backing store with `Math.min(devicePixelRatio || 1, 1.5)`. In each animation frame, derive continuous scene progress from the centers of the ordered scene elements, interpolate camera frames, clear the canvas, transform model coordinates, draw low-opacity connections for nearby active-cluster particles, then draw outlined triangles whose brightness and size respond to cluster distance and transition progress.

- [ ] **Step 4: Add lifecycle and fallback behavior**

Pause when `document.hidden`, use a resize timer of 120ms, cancel the animation frame during teardown, render one static whole-brain frame for reduced motion, and add `brain-unavailable` to `<html>` when `getContext("2d")` returns null.

- [ ] **Step 5: Integrate the component**

Render:

```astro
<div class="particle-brain" aria-hidden="true">
  <canvas class="particle-brain__canvas" data-particle-brain></canvas>
  <div class="particle-brain__fallback"></div>
</div>
```

Initialize it from a bundled module and keep the canvas outside `<main>` so it remains a fixed visual layer.

### Task 3: Recompose the portfolio into Camera Dive chapters

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/data/portfolio.ts`
- Modify: `src/components/SiteNav.astro`
- Modify: `src/components/Hero.astro`
- Modify: `src/components/Experience.astro`
- Modify: `src/components/Projects.astro`
- Modify: `src/components/Trajectory.astro`
- Modify: `src/components/Research.astro`
- Modify: `src/components/Leadership.astro`
- Modify: `src/components/Recognition.astro`
- Modify: `src/components/About.astro`
- Modify: `src/components/SiteFooter.astro`

**Interfaces:**
- Consumes: the existing typed arrays and `data-brain-scene` names required by Task 2.
- Produces: six server-rendered chapter destinations and all preserved nested IDs.

- [ ] **Step 1: Add the fixed visual layer and scene order**

Place `<ParticleBrain />` after `<SiteNav />`. Mark Hero, Experience, Projects, Research, Leadership, and About with the six ordered scene values. Nest Trajectory inside the Research scene and Recognition inside the Leadership scene; keep SiteFooter after About for the pullback close.

- [ ] **Step 2: Reduce primary navigation**

Use Work, Projects, Research, Leadership, About, and Contact while preserving nested `#trajectory` and `#recognition` anchors. Keep `IntersectionObserver` current-section behavior and `aria-current="location"`.

- [ ] **Step 3: Rewrite headings without changing factual claims**

Use the chapter headings `Systems that find the signal.`, `Built under pressure.`, `Earlier signals, better decisions.`, `Scale through people.`, and `Outside the work.` Keep all existing detail text, periods, capability labels, recognition data, and links below those headings.

- [ ] **Step 4: Simplify Career Path progressively**

Replace the desktop tab map with a server-rendered chronological node list using the existing twelve events. Keep periods, lanes, outcomes, and details visible without interaction; remove the component script and obsolete tab-only classes.

- [ ] **Step 5: Run source tests**

Run: `npm test`

Expected: particle and structural content assertions pass; visual-system assertions for the three modular stylesheets remain RED until Task 4.

### Task 4: Replace the visual system with the Dala-inspired dark stage

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/layout.css`
- Create: `src/styles/motion.css`
- Replace: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/404.astro`

**Interfaces:**
- Consumes: chapter and evidence-panel class names from Task 3.
- Produces: the complete black-stage layout, typography, responsive behavior, focus states, and reduced-motion presentation.

- [ ] **Step 1: Define exact tokens and reset**

Define the approved palette, type stacks, `--shell: 80rem`, fluid spacing, `--z-brain: 0`, `--z-content: 10`, `--z-nav: 20`, black color-scheme, semantic reset, skip-link, `:focus-visible`, and a fixed pointer-transparent noise layer.

- [ ] **Step 2: Build chapter pacing and evidence panels**

Each `.story-chapter` uses `min-height: clamp(46rem, 125dvh, 72rem)` and a twelve-column shell. Alternate copy between the left and right six columns so the current brain cluster remains visible. Evidence panels use translucent black only, no filled card color, with real imagery, typographic hierarchy, and 24px media radii.

- [ ] **Step 3: Style the fixed brain and navigation**

The canvas fills the viewport below the content. Navigation remains transparent, becomes a compact black strip after scrolling through CSS-supported state, exposes current links, and collapses to a horizontally scrollable list below 48rem without hiding destinations.

- [ ] **Step 4: Add progressive motion and safeguards**

Content reveals use transform/opacity only. Reduced motion disables reveals, leaves all content visible, and keeps the static brain fallback. At 64rem and 48rem, shorten chapters, widen panels, reduce display type, and move text onto an opaque-enough black scrim for readability.

- [ ] **Step 5: Update metadata surfaces and run tests**

Set theme color to black in all modes and restyle the 404 page in the same system. Run `npm test` and expect zero failures.

### Task 5: Validate the complete production experience

**Files:**
- Modify: `README.md`
- Modify: `tests/portfolio-build.test.mjs` only if the production compiler exposes a genuine serialization difference.
- Generated: `dist/**`

**Interfaces:**
- Consumes: the complete Camera Dive implementation.
- Produces: a verified GitHub Pages and Sites-compatible production artifact.

- [ ] **Step 1: Document the new interaction**

Describe the six scenes, Canvas 2D progressive enhancement, reduced-motion fallback, content editing source, and verification commands. Remove the outgoing Tonal Chapters description.

- [ ] **Step 2: Run the full verification command**

Run: `npm run check`

Expected: particle tests, source tests, Astro production build, built-output tests, base-path checks, and Sites worker tests all pass with zero failures.

- [ ] **Step 3: Inspect desktop and mobile views**

Start the existing Astro development server, inspect the hero plus every chapter at a desktop viewport and a narrow mobile viewport, confirm the camera/node state changes during scroll, verify no horizontal overflow, and confirm content remains readable when motion is reduced.

- [ ] **Step 4: Run the final source audit**

Confirm there is no Dala copy or asset, no prohibited runtime, no empty link, no missing image alternative, no uncapped device-pixel ratio, no unguarded canvas context, and no user-owned untracked file in the diff.

- [ ] **Step 5: Review the branch and retain it for user inspection**

Run a focused code/design review against the specification. Fix every Critical or Important finding, rerun `npm run check`, and keep the feature branch available for the user rather than merging or pushing without direction.
