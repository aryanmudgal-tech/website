# Portfolio Editorial Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Aryan Mudgal's existing one-page portfolio as a recruiter-first, proof-led editorial site with one accessible trajectory interaction.

**Architecture:** Astro renders a static, single-page site from typed portfolio data and focused presentational components. Native CSS owns layout, responsive behavior, theming, and reduced-motion handling; one small browser script owns the trajectory selection state. Node's built-in test runner checks the source and built HTML without adding a test framework.

**Tech Stack:** Astro 7.1.3 or newer compatible patch, TypeScript, native CSS, Node `node:test`, static image assets.

## Global Constraints

- Preserve the factual content and existing proof/contact links listed in `docs/superpowers/specs/2026-07-20-portfolio-editorial-atlas-design.md`.
- Use "MIDL-accepted," "1,500+ followers," and "four hackathon recognitions"; do not claim the paper is published or ARMIE is a win.
- Use only the real photographs in `assets/`; do not load `lofi.mp3` or generated imagery.
- Use one cobalt accent and a single light/dark token system; no gradients, glows, glass, or generic equal-card rows.
- The served page contains zero em dash or en dash characters.
- Core content works without JavaScript; the trajectory is a progressive enhancement.
- No preloader, WebGL, audio, custom cursor, game, marquee, horizontal scroll hijack, or automatic credits crawl.
- Navigation exposes Work, Projects, Research, Leadership, Recognition, About, and Contact at every viewport.
- Honor `prefers-reduced-motion` and `prefers-color-scheme`.
- Do not modify or delete the pre-existing untracked `.agents/`, `.claude/skills/`, or `skills-lock.json` files.

---

## File structure

- `package.json`: Astro and test/build scripts.
- `astro.config.mjs`: static output configuration.
- `tsconfig.json`: strict Astro TypeScript configuration.
- `src/data/portfolio.ts`: typed source of truth for experience, projects, trajectory, research, leadership, recognition, and links.
- `src/layouts/BaseLayout.astro`: metadata, JSON-LD, skip link, page shell, and shared script hooks.
- `src/components/SiteNav.astro`: conventional responsive navigation.
- `src/components/Hero.astro`: positioning, calls to action, hero image, and proof band.
- `src/components/Experience.astro`: professional experience rows.
- `src/components/Projects.astro`: lead project and project matrix.
- `src/components/Trajectory.astro`: progressive timeline markup and keyboard-enhanced selection.
- `src/components/Research.astro`: research records.
- `src/components/Leadership.astro`: asymmetric impact metrics.
- `src/components/Recognition.astro`: institutional recognition photo strip.
- `src/components/About.astro`: Litos, interests, gratitude, and current context.
- `src/components/SiteFooter.astro`: contact and external profiles.
- `src/pages/index.astro`: composition and section order.
- `src/pages/404.astro`: branded recovery page.
- `src/styles/global.css`: tokens, responsive grid, components, motion, focus, and theme handling.
- `public/assets/*.jpg`: deployable copies of the existing photographs.
- `public/favicon.svg`: small geometric AM mark.
- `tests/portfolio-source.test.mjs`: pre-build content, semantic, and anti-slop contract.
- `tests/portfolio-build.test.mjs`: checks the generated `dist/index.html` and `dist/404.html`.
- `README.md`: local development and site structure.

### Task 1: Establish the test and build contract

**Files:**
- Create: `tests/portfolio-source.test.mjs`
- Create: `tests/portfolio-build.test.mjs`
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`

**Interfaces:**
- Consumes: the approved design specification.
- Produces: `npm test`, `npm run build`, and `npm run check` commands used by every later task.

- [ ] **Step 1: Write the failing source acceptance test**

Use `node:test` to require the future page composition and data source, check all conventional navigation labels and section IDs, require content anchors such as Linde, MIDL, Dots, $500K+, and 30,000+, and reject theatre/technical anti-pattern tokens from the served source.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/portfolio-source.test.mjs`

Expected: FAIL because `src/pages/index.astro` and `src/data/portfolio.ts` do not exist yet.

- [ ] **Step 3: Add the minimal Astro configuration**

Create a package with `dev`, `build`, `test`, and `check` scripts. Configure Astro for static output and extend `astro/tsconfigs/strict`.

- [ ] **Step 4: Add the built-output test**

Read `dist/index.html` and assert semantic landmarks, one `h1`, metadata, JSON-LD, real image references, no empty links, no unwanted runtime libraries, and valid trajectory buttons. Read `dist/404.html` and assert a route back to `/`.

- [ ] **Step 5: Install the declared dependency and record a lockfile**

Run: `npm install`

Expected: a `package-lock.json` matching `package.json`.

### Task 2: Model and render the recruiter summary layer

**Files:**
- Create: `src/data/portfolio.ts`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/SiteNav.astro`
- Create: `src/components/Hero.astro`
- Create: `src/pages/index.astro`
- Create: `public/favicon.svg`

**Interfaces:**
- Consumes: the content contract in Task 1.
- Produces: typed `links`, `proofPoints`, and `experiences` exports plus the document shell used by every section.

- [ ] **Step 1: Run the source test and confirm the missing-file failure**

Run: `node --test tests/portfolio-source.test.mjs`

Expected: FAIL on missing page/data sources.

- [ ] **Step 2: Add typed portfolio data**

Define explicit types and readonly arrays for links, proof points, experiences, projects, trajectory events, research, leadership, recognition, and interests. Copy only supported facts and existing URLs.

- [ ] **Step 3: Build the semantic page shell and navigation**

Add metadata, Person JSON-LD, skip link, `header`, `nav`, `main`, and footer hooks. Use text navigation that remains horizontally scrollable on narrow screens.

- [ ] **Step 4: Build the hero and proof band**

Render the concise positioning, `View projects`, `Email Aryan`, the real hero photograph, and five proof statements. Keep hero body copy under 20 words.

- [ ] **Step 5: Run the source test**

Run: `node --test tests/portfolio-source.test.mjs`

Expected: remaining failures identify the unimplemented portfolio sections, not the foundation or summary layer.

### Task 3: Render the evidence sections

**Files:**
- Create: `src/components/Experience.astro`
- Create: `src/components/Projects.astro`
- Create: `src/components/Research.astro`
- Create: `src/components/Leadership.astro`
- Create: `src/components/Recognition.astro`
- Create: `src/components/About.astro`
- Create: `src/components/SiteFooter.astro`
- Modify: `src/pages/index.astro`
- Copy: `assets/*.jpg` to `public/assets/`

**Interfaces:**
- Consumes: typed arrays from `src/data/portfolio.ts`.
- Produces: complete `#work`, `#projects`, `#research`, `#leadership`, `#recognition`, `#about`, and `#contact` sections.

- [ ] **Step 1: Render experience before every secondary section**

Use one emphasized Linde row followed by Meta Layer Initiative and HCLTech. Keep dates, roles, and outcomes visible in each row.

- [ ] **Step 2: Render selected builds with proof links**

Use Dots as the lead feature and render ARMIE, StreamFair, and C.O.R.E. in an asymmetric matrix. Include problem/build/result labels where the source supports them and avoid sole-ownership wording.

- [ ] **Step 3: Render research and leadership**

Prioritize the MIDL-accepted record, label ongoing research accurately, and pair every leadership metric with its context.

- [ ] **Step 4: Render recognition and personal context**

Show all three institutional recognition photographs and facts. Present Litos, interests, locations, and collaborator gratitude without film language.

- [ ] **Step 5: Render contact**

Use one repeated contact label, `Email Aryan`, plus LinkedIn and GitHub links. Do not add a form.

- [ ] **Step 6: Run the source test**

Run: `node --test tests/portfolio-source.test.mjs`

Expected: PASS for content and section-order checks.

### Task 4: Add the trajectory progressive enhancement

**Files:**
- Create: `src/components/Trajectory.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/portfolio-source.test.mjs`

**Interfaces:**
- Consumes: `trajectoryEvents` from `src/data/portfolio.ts`.
- Produces: `.trajectory-event` buttons, `#trajectory-detail`, and the `initTrajectory()` browser behavior.

- [ ] **Step 1: Extend the source test for trajectory behavior**

Assert `role="tablist"`, buttons with `role="tab"`, one server-selected item, a live detail region, and handlers for ArrowLeft, ArrowRight, Home, and End.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test --test-name-pattern="trajectory" tests/portfolio-source.test.mjs`

Expected: FAIL because the component is absent.

- [ ] **Step 3: Implement the timeline markup and script**

Render all event labels and outcomes in the button markup. Update the adjacent panel and ARIA state on selection. Move focus for keyboard selection and leave every event readable in the source HTML.

- [ ] **Step 4: Run the focused and full source tests**

Run: `node --test tests/portfolio-source.test.mjs`

Expected: PASS.

### Task 5: Implement the anti-slop visual system

**Files:**
- Create: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`
- Test: `tests/portfolio-source.test.mjs`

**Interfaces:**
- Consumes: component class names from Tasks 2 through 4.
- Produces: the complete light/dark token system, responsive layouts, and reduced-motion behavior.

- [ ] **Step 1: Extend tests for theme and motion safeguards**

Assert one accent token, a dark color-scheme media query, reduced-motion media query, visible focus selectors, `min-height: 100dvh`, and the absence of gradients, glows, cursor replacement, and perpetual animation keywords.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test --test-name-pattern="visual system" tests/portfolio-source.test.mjs`

Expected: FAIL because the stylesheet is absent.

- [ ] **Step 3: Implement tokens and base typography**

Use cool paper/charcoal surfaces, cobalt accent, system sans/mono stacks, a 90rem container, fluid type, visible focus, and documentary photography for material depth.

- [ ] **Step 4: Implement eight distinct section compositions**

Use asymmetric split, evidence band, editorial rows, lead-feature plus matrix, timeline grid, research columns, metric mosaic, photo strip, and compact personal/contact compositions. Do not repeat equal three-card grids.

- [ ] **Step 5: Implement responsive and motion states**

Collapse every high-variance layout below 48rem, retain the full navigation with horizontal overflow, use only transform/opacity transitions, and disable them under reduced motion.

- [ ] **Step 6: Run the source test**

Run: `node --test tests/portfolio-source.test.mjs`

Expected: PASS.

### Task 6: Build, validate, and document

**Files:**
- Create: `src/pages/404.astro`
- Modify: `README.md`
- Test: `tests/portfolio-build.test.mjs`

**Interfaces:**
- Consumes: the complete site.
- Produces: verified `dist/` output and concise local documentation.

- [ ] **Step 1: Add the branded 404 page**

Use the same layout and one clear `Return home` link. Avoid adding a new visual language.

- [ ] **Step 2: Replace README drift**

Document the portfolio purpose, section architecture, local commands, static build output, accessibility safeguards, and factual-edit source file.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: Astro completes static generation for `/` and `/404.html` with no errors.

- [ ] **Step 4: Run built-output tests**

Run: `node --test tests/portfolio-build.test.mjs`

Expected: PASS.

- [ ] **Step 5: Run the complete verification command**

Run: `npm run check`

Expected: source tests pass, the Astro build succeeds, and built-output tests pass.

- [ ] **Step 6: Review the final page copy and anti-slop contract**

Search served source for unsupported claims, em dash/en dash characters, theatre language, stale navigation, empty links, external script tags, audio, canvas, WebGL, and unused game code. Correct every finding before completion.
