# Portfolio Tonal Chapters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved content corrections and Tonal Chapters interaction system to Aryan Mudgal's recruiter-first portfolio without changing its architecture or public access state.

**Architecture:** Keep the existing Astro 7 static site, typed portfolio data, focused presentational components, and native CSS. Extend the current progressive-enhancement model with one small `IntersectionObserver` navigation script, while keeping all content readable without JavaScript and deploying only through the verified owner-only Sites path.

**Tech Stack:** Astro 7.1.3, TypeScript, native CSS, Node `node:test`, Sites hosting.

## Global Constraints

- Implement `docs/superpowers/specs/2026-07-20-portfolio-tonal-chapters-design.md` exactly.
- Preserve the route, anchor IDs, navigation labels, project URLs, metadata, Person JSON-LD, real images, skip link, light/dark modes, reduced-motion behavior, and Career Path keyboard support.
- Remove Litos and PPG Signal Accuracy from served content.
- Use `W.O.D.` as the only visible title for that project.
- Use the exact award titles `Award for Innovative Student Leadership` and `SUNY Chancellor's Award for Student Excellence`, both labeled 2026.
- Use 2023, 2024, 2025, and 2026 Career Path columns with no 2022 or Now column.
- Use no visible monospace font, no new dependency, no gradient, no glow, no scroll listener, no em dash or en dash, and no theatre-era pattern.
- Keep the final Sites deployment owner-only/private.
- Preserve unrelated untracked `.agents/`, `.claude/skills/`, `Pictures/`, and `skills-lock.json` files.

---

## File structure

- `src/data/portfolio.ts`: corrected typed content and Career Path chronology.
- `src/components/About.astro`: personal context without the Litos panel.
- `src/components/SiteNav.astro`: progressive current-section navigation state.
- `src/components/Experience.astro`: full-width Work chapter wrapper.
- `src/components/Trajectory.astro`: full-width Career Path chapter wrapper and preserved tab interaction.
- `src/components/Leadership.astro`: full-width Leadership chapter wrapper.
- `src/components/Recognition.astro`: visible award years.
- `src/styles/global.css`: humanist typography, chapter surfaces, active navigation, four-column Career Path, motion and responsive behavior.
- `tests/portfolio-source.test.mjs`: source contract for corrected content and anti-slop rules.
- `tests/portfolio-build.test.mjs`: built HTML contract for corrected content and navigation enhancement.
- `README.md`: current content and interaction description.

### Task 1: Lock the content and interaction contract

**Files:**
- Modify: `tests/portfolio-source.test.mjs`
- Modify: `tests/portfolio-build.test.mjs`

**Interfaces:**
- Consumes: approved design specification.
- Produces: failing regression tests for the requested content, typography, chapter surfaces, and current-section navigation.

- [ ] **Step 1: Replace stale preserved-content expectations**

Require `W.O.D.`, both exact award names, and the requested Career Path periods. Reject `C.O.R.E. / W.O.D.`, `University and SUNY honors`, `PPG signal accuracy`, and the Litos current-work strings.

- [ ] **Step 2: Add a typography and chapter-surface test**

Assert the stylesheet has `--chapter-work`, `--chapter-projects`, `--chapter-trajectory`, `--chapter-research`, `--chapter-leadership`, `--chapter-recognition`, and `--chapter-about`, plus dark-mode values. Reject `--font-mono`, `SFMono`, `Consolas`, `Liberation Mono`, and `monospace`.

- [ ] **Step 3: Add a current-section navigation test**

Assert `SiteNav.astro` contains `IntersectionObserver`, updates `aria-current`, and does not contain `window.addEventListener("scroll")`. Assert CSS includes `.site-nav a[aria-current="location"]`.

- [ ] **Step 4: Run source tests and verify RED**

Run: `node --test tests/portfolio-source.test.mjs`

Expected: FAIL on stale content, missing chapter tokens, remaining mono stack, and missing active navigation behavior.

### Task 2: Correct portfolio content and chronology

**Files:**
- Modify: `src/data/portfolio.ts`
- Modify: `src/components/About.astro`
- Modify: `src/components/Hero.astro`
- Modify: `src/components/Recognition.astro`
- Modify: `README.md`

**Interfaces:**
- Consumes: the Task 1 content assertions.
- Produces: corrected typed arrays and semantic content for all data-driven components.

- [ ] **Step 1: Correct the `TrajectoryEvent` type and columns**

Use:

```ts
column: "2023" | "2024" | "2025" | "2026";
```

and:

```ts
export const trajectoryColumns = ["2023", "2024", "2025", "2026"] as const;
```

- [ ] **Step 2: Rebuild Career Path in chronological DOM order**

Place Delegate first with `period: "2022-2025"` and `column: "2024"`; Senator in 2023; HCLTech in 2024; Meta Layer, W.O.D., and FMH in 2025; then all 2026 builds, both separate awards, and Linde. Remove PPG.

- [ ] **Step 3: Correct projects, research, and recognition data**

Rename the project to `W.O.D.`, remove the PPG research record, add `year: "2026"` to the first two Recognition records, and use the exact award titles.

- [ ] **Step 4: Remove only the Litos panel**

Remove `currentWork`, preserve `interests` and `places`, and render:

```astro
<h2 id="about-title">Outside the work</h2>
```

inside the retained About section.

- [ ] **Step 5: Render award years and align the hero caption**

Render `recognition.year` before each recognition title when present. Update the hero's award description to the exact Innovative Student Leadership wording.

- [ ] **Step 6: Run source tests and verify the content assertions pass**

Run: `node --test tests/portfolio-source.test.mjs`

Expected: content assertions pass; visual and navigation assertions may still fail until Tasks 3 and 4.

### Task 3: Implement the humanist Tonal Chapters visual system

**Files:**
- Modify: `src/components/Experience.astro`
- Modify: `src/components/Trajectory.astro`
- Modify: `src/components/Leadership.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: existing section classes and Task 2's four Career Path columns.
- Produces: full-width chapter surfaces and a single-family humanist typography system.

- [ ] **Step 1: Make chapter backgrounds full-width**

For Work, Career Path, and Leadership, remove `shell` from the section element and add one inner `.shell` wrapper without changing the section ID or accessible heading relationship.

- [ ] **Step 2: Replace typography tokens**

Remove `--font-mono` and use the same humanist sans family for display and body. Replace each visible mono declaration with `var(--font-sans)`, lower excessive tracking, and retain tabular numerals where values or dates need alignment.

- [ ] **Step 3: Add solid chapter tokens**

Define these light-mode tokens:

```css
--chapter-work: #edf1f4;
--chapter-projects: #e4e9ef;
--chapter-trajectory: #eef1f6;
--chapter-research: #e2e9ee;
--chapter-leadership: #ebedf2;
--chapter-recognition: #e3e6ef;
--chapter-about: #eef0f3;
```

Define dark counterparts within the existing color-scheme media query, all within the same charcoal-blue family.

- [ ] **Step 4: Apply chapter surfaces and edge movement**

Apply each token to its matching full-width section. Add a restrained top-edge reveal using a pseudo-element animated only through opacity and transform inside the existing no-preference motion gate.

- [ ] **Step 5: Update the Career Path grid**

Use four equal year columns for both the axis and event-cell grids. Keep the 72rem fallback to the chronological list.

- [ ] **Step 6: Run source tests and verify visual assertions pass**

Run: `node --test tests/portfolio-source.test.mjs`

Expected: chapter, typography, responsive, and anti-slop assertions pass; active-nav assertions may remain for Task 4.

### Task 4: Add current-section navigation feedback

**Files:**
- Modify: `src/components/SiteNav.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `navItems` href values and existing section IDs.
- Produces: `initSectionNavigation()` progressive enhancement with visible and semantic current-section state.

- [ ] **Step 1: Implement observation without scroll listeners**

Create an `IntersectionObserver` with a center-weighted root margin. Observe only destinations represented by primary navigation links. When an observed section becomes the best visible candidate, set `aria-current="location"` on its matching link and remove the attribute from the others.

- [ ] **Step 2: Preserve behavior across Astro swaps**

Call the initializer once and on `astro:after-swap`. Store and disconnect the previous observer before reinitializing so listeners do not accumulate.

- [ ] **Step 3: Style active navigation**

Add a transform-based underline and stronger ink color for `.site-nav a[aria-current="location"]`. Keep hover, active, focus-visible, mobile overflow, and reduced-motion behavior intact.

- [ ] **Step 4: Run source tests and verify GREEN**

Run: `node --test tests/portfolio-source.test.mjs`

Expected: all source tests pass with zero failures.

### Task 5: Validate the production artifact and private release

**Files:**
- Modify: `tests/portfolio-build.test.mjs`
- Modify: `README.md`
- Generated: `dist/**`

**Interfaces:**
- Consumes: the complete source implementation.
- Produces: a verified Sites archive and owner-only deployment.

- [ ] **Step 1: Build and run built-output tests**

Run: `npm run build`

Run: `node --test tests/portfolio-build.test.mjs`

Expected: Astro emits the Sites-compatible client and worker output, and all built-output assertions pass.

- [ ] **Step 2: Run the full verification command**

Run: `npm run check`

Expected: zero source-test failures, Astro compiler failures, or built-output test failures without adding a new checking dependency.

- [ ] **Step 3: Run the anti-slop and copy audit**

Search served source for removed content, mono stacks, gradients, glow, em dash, en dash, scroll listeners, theatre language, and heavy runtime patterns. Confirm every visible string is concrete and grammatically sound.

- [ ] **Step 4: Review the implementation**

Request a focused code/design review for content accuracy, accessibility, interaction cleanup, responsive behavior, and compliance with this plan. Fix every Critical or Important finding and rerun the covering tests.

- [ ] **Step 5: Commit, push, package, and save the exact validated source**

Commit only tracked project changes plus the new spec and plan. Obtain a fresh short-lived Sites source credential, push the exact branch head, package the build, and save a new site version using that same commit SHA.

- [ ] **Step 6: Verify owner-only access and deploy privately**

Confirm the access policy has only the owner and no groups, deploy with the private deployment path, and poll until the deployment succeeds or fails. Do not change the access policy to public.
