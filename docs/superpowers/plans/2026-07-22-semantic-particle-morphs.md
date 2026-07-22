# Semantic Particle Morphs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every small particle in the existing brain morph into a chapter-specific semantic micro-shape during native scroll while increasing text contrast without obscuring the brain.

**Architecture:** Keep the seeded brain model, six camera clusters, bridge edges, and Canvas lifecycle intact. Add a pure shape-state layer that maps continuous scene progress to two adjacent micro-glyphs, then render those glyphs at each existing particle center with crossfaded opacity, scale, and rotation. Strengthen localized black reading surfaces and substantive body-copy color in CSS; do not change chapter content or create a full-screen overlay.

**Tech Stack:** Astro 7.1.3, native Canvas 2D, native CSS, Node test runner. No new runtime dependency.

## Global Constraints

- The brain remains a point cloud made from hundreds of discrete small particles; never draw one giant continuous chapter shape.
- Scene shapes are exactly: Hero triangle, Work square, Projects diamond, Research outlined ring, Leadership hexagon, About filled circular dot.
- Shape state, camera, cluster emphasis, bridge lines, and color all derive from the same continuous native-scroll progress.
- Preserve the 420, 800, and 1400 particle budgets and the `1.5` device-pixel-ratio cap.
- Preserve reduced motion, visibility pausing, resize debounce, teardown, Canvas context fallback, and unchanged-progress draw skipping.
- Preserve the approved palette and keep `#15846e` confined to Canvas.
- Do not add WebGL, Three.js, GSAP, ScrollTrigger, Lenis, scroll interception, custom cursors, audio, gradients, or copied Dala material.
- Preserve every portfolio fact, link, image, metadata field, nested anchor, GitHub Pages base path, and Sites build surface.

---

### Task 1: Lock the semantic micro-shape contract

**Files:**
- Modify: `tests/particle-brain.test.mjs`
- Modify: `tests/portfolio-source.test.mjs`

**Interfaces:**
- Consumes: existing exports from `src/lib/particle-brain.mjs`.
- Produces: failing contracts for `PARTICLE_SHAPES`, `particleShapeState(progress)`, and per-particle glyph rendering.

- [ ] **Step 1: Add the pure shape-state tests**

Add these imports and assertions to `tests/particle-brain.test.mjs`:

```js
import {
  PARTICLE_SHAPES,
  particleShapeState,
} from "../src/lib/particle-brain.mjs";

test("the six chapters expose the approved semantic micro-shapes", () => {
  assert.deepEqual(PARTICLE_SHAPES, [
    "triangle",
    "square",
    "diamond",
    "ring",
    "hexagon",
    "dot",
  ]);

  PARTICLE_SHAPES.forEach((shape, index) => {
    assert.deepEqual(particleShapeState(index), {
      fromShape: shape,
      toShape: shape,
      amount: 0,
    });
  });
});

test("shape state exposes a clamped continuous transition", () => {
  assert.deepEqual(particleShapeState(-1), {
    fromShape: "triangle",
    toShape: "triangle",
    amount: 0,
  });
  assert.deepEqual(particleShapeState(1.5), {
    fromShape: "square",
    toShape: "diamond",
    amount: 0.5,
  });
  assert.deepEqual(particleShapeState(Number.POSITIVE_INFINITY), {
    fromShape: "dot",
    toShape: "dot",
    amount: 0,
  });
});
```

- [ ] **Step 2: Add source contracts for discrete per-particle rendering**

Add a focused source test that requires all six glyph branches, two adjacent glyph draws, and glyph rendering inside the existing particle loop:

```js
test("every brain node morphs between semantic micro-glyphs", () => {
  const engine = readIfPresent("src/lib/particle-brain.mjs");
  const renderBody = functionBody(engine, "renderFrame");
  const glyphBody = functionBody(engine, "drawParticleGlyph");
  const morphBody = functionBody(engine, "drawMorphedGlyph");

  for (const shape of ["triangle", "square", "diamond", "ring", "hexagon", "dot"]) {
    assert.match(glyphBody, new RegExp(`["']${shape}["']`));
  }
  assert.match(renderBody, /particleShapeState\(\s*frame\.clusterMix\s*\)/);
  assert.match(renderBody, /for\s*\(\s*const\s+point\s+of\s+particles\s*\)/);
  assert.match(renderBody, /drawMorphedGlyph\(\s*point\s*,\s*projected/);
  assert.ok((morphBody.match(/drawParticleGlyph\(/g) ?? []).length >= 2);
  assert.doesNotMatch(engine, /draw(?:Giant|Chapter|Scene)Shape/i);
});
```

- [ ] **Step 3: Run the focused tests and confirm RED**

Run:

```bash
node --test tests/particle-brain.test.mjs tests/portfolio-source.test.mjs
```

Expected: failures report missing `PARTICLE_SHAPES`, `particleShapeState`, and `drawParticleGlyph`; all pre-existing contracts remain green.

- [ ] **Step 4: Commit the failing contract**

```bash
git add tests/particle-brain.test.mjs tests/portfolio-source.test.mjs
git commit -m "test: lock semantic particle morphs"
```

---

### Task 2: Implement continuous per-particle glyph morphing

**Files:**
- Modify: `src/lib/particle-brain.mjs`
- Test: `tests/particle-brain.test.mjs`
- Test: `tests/portfolio-source.test.mjs`

**Interfaces:**
- Consumes: continuous `frame.clusterMix`, each particle's existing `phase`, `tone`, projected center, and radius.
- Produces: `PARTICLE_SHAPES`, `particleShapeState(progress)`, and internal `drawParticleGlyph(context, shape, x, y, radius, rotation, alpha, color, lineWidth)`.

- [ ] **Step 1: Add the pure shape-state implementation**

Place the immutable shape order near `SCENE_ZOOMS`:

```js
export const PARTICLE_SHAPES = Object.freeze([
  "triangle",
  "square",
  "diamond",
  "ring",
  "hexagon",
  "dot",
]);

export function particleShapeState(progress) {
  const maximum = PARTICLE_SHAPES.length - 1;
  const normalized = progress === Number.POSITIVE_INFINITY
    ? maximum
    : Number.isFinite(progress)
      ? progress
      : 0;
  const clamped = Math.min(Math.max(normalized, 0), maximum);
  const fromIndex = Math.floor(clamped);
  const toIndex = Math.min(fromIndex + 1, maximum);
  const amount = clamped - fromIndex;

  if (amount === 0 || fromIndex === toIndex) {
    return {
      fromShape: PARTICLE_SHAPES[fromIndex],
      toShape: PARTICLE_SHAPES[fromIndex],
      amount: 0,
    };
  }

  return {
    fromShape: PARTICLE_SHAPES[fromIndex],
    toShape: PARTICLE_SHAPES[toIndex],
    amount,
  };
}
```

- [ ] **Step 2: Run the pure tests and confirm GREEN**

Run:

```bash
node --test tests/particle-brain.test.mjs
```

Expected: all particle helper tests pass; the source glyph test remains RED.

- [ ] **Step 3: Add reusable glyph paths without per-frame allocation**

Add path helpers that operate directly on the existing Canvas context:

```js
function polygonPath(context, x, y, radius, sides, rotation) {
  for (let index = 0; index < sides; index += 1) {
    const angle = rotation + (index / sides) * Math.PI * 2;
    const pointX = x + Math.cos(angle) * radius;
    const pointY = y + Math.sin(angle) * radius;
    if (index === 0) context.moveTo(pointX, pointY);
    else context.lineTo(pointX, pointY);
  }
  context.closePath();
}

function drawParticleGlyph(context, shape, x, y, radius, rotation, alpha, color, lineWidth) {
  context.globalAlpha = alpha;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = lineWidth;
  context.beginPath();

  if (shape === "ring") {
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.stroke();
    return;
  }
  if (shape === "dot") {
    context.arc(x, y, Math.max(radius * 0.62, 0.7), 0, Math.PI * 2);
    context.fill();
    return;
  }

  const sides = shape === "triangle" ? 3 : shape === "hexagon" ? 6 : 4;
  polygonPath(context, x, y, radius, sides, rotation);
  context.stroke();
}

function glyphRotation(shape, phase) {
  const alternating = phase === 0 ? 0 : Math.PI;
  if (shape === "triangle") return -Math.PI / 2 + alternating;
  if (shape === "square") return Math.PI / 4;
  if (shape === "diamond") return 0;
  if (shape === "hexagon") return -Math.PI / 2 + alternating / 6;
  return 0;
}

function interpolateRotation(from, to, amount) {
  const turn = Math.PI * 2;
  const delta = ((to - from + Math.PI) % turn + turn) % turn - Math.PI;
  return from + delta * amount;
}
```

Use the existing particle `phase` to alternate triangle and hexagon orientation. Do not use random values during rendering.

- [ ] **Step 4: Crossfade and scale adjacent micro-glyphs inside the particle loop**

At the start of `renderFrame(frame)`, derive one state for the whole scene:

```js
const shapeState = particleShapeState(frame.clusterMix);
const easedShapeAmount = shapeState.amount * shapeState.amount * (3 - 2 * shapeState.amount);
```

Inside `for (const point of particles)`, replace each shape-specific `strokeParticle` call with two glyph layers at the same `projected.x` and `projected.y`:

```js
function drawMorphedGlyph(point, projected, radius, shapeState, amount, color, alpha, lineWidth) {
  const fromAlpha = 1 - amount;
  const toAlpha = amount;
  const fromRadius = radius * (1 - amount * 0.16);
  const toRadius = radius * (0.84 + amount * 0.16);
  const glyphAngle = interpolateRotation(
    glyphRotation(shapeState.fromShape, point.phase),
    glyphRotation(shapeState.toShape, point.phase),
    amount,
  );

  drawParticleGlyph(
    context,
    shapeState.fromShape,
    projected.x,
    projected.y,
    fromRadius,
    glyphAngle,
    alpha * fromAlpha,
    color,
    lineWidth,
  );

  if (shapeState.toShape !== shapeState.fromShape && toAlpha > 0) {
    drawParticleGlyph(
      context,
      shapeState.toShape,
      projected.x,
      projected.y,
      toRadius,
      glyphAngle,
      alpha * toAlpha,
      color,
      lineWidth,
    );
  }
}
```

Call `drawMorphedGlyph(...)` once for the base gray or Verdant node, once when Iris cluster emphasis is present, and once when Saffron transition or Leadership emphasis is present. Keep the current alpha and line-width formulas from the three existing `strokeParticle(...)` calls. Keep colors, bridge drawing, and projected particle centers unchanged. At exact scene progress, the helper draws only the settled glyph to avoid doubling Canvas work.

- [ ] **Step 5: Run focused tests and confirm GREEN**

Run:

```bash
node --test tests/particle-brain.test.mjs tests/portfolio-source.test.mjs
```

Expected: all helper and source tests pass with zero failures.

- [ ] **Step 6: Commit the engine morph**

```bash
git add src/lib/particle-brain.mjs tests/particle-brain.test.mjs tests/portfolio-source.test.mjs
git commit -m "feat: morph semantic particle glyphs"
```

---

### Task 3: Strengthen localized reading contrast

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/layout.css`
- Modify: `tests/portfolio-source.test.mjs`

**Interfaces:**
- Consumes: existing `.section-heading`, evidence-panel, hero-copy, nested-chapter, and substantive-copy selectors.
- Produces: stronger localized black reading surfaces and brighter substantive text without changing markup or hiding the brain globally.

- [ ] **Step 1: Add failing contrast contracts**

Add this test to `tests/portfolio-source.test.mjs`:

```js
test("reading surfaces prioritize text over the particle field", () => {
  const tokens = readIfPresent("src/styles/tokens.css");
  const layout = readIfPresent("src/styles/layout.css");

  assert.match(tokens, /--reading-surface:\s*rgb\(0 0 0 \/ 0\.9\)/);
  assert.match(tokens, /--reading-surface-strong:\s*rgb\(0 0 0 \/ 0\.96\)/);
  assert.match(
    layout,
    /\.section-heading,[\s\S]*?background:\s*var\(--reading-surface\)/,
  );
  assert.match(
    layout,
    /\.experience__outcome\s*>\s*p[\s\S]*?color:\s*var\(--text-secondary\)/,
  );
  assert.doesNotMatch(layout, /backdrop-filter|(?:linear|radial|conic)-gradient/i);
});
```

- [ ] **Step 2: Run the focused contrast test and confirm RED**

Run:

```bash
node --test --test-name-pattern="reading surfaces prioritize" tests/portfolio-source.test.mjs
```

Expected: failure reports missing reading-surface tokens and localized desktop surface use.

- [ ] **Step 3: Add semantic contrast tokens**

Add to `:root` in `src/styles/tokens.css`:

```css
--reading-surface: rgb(0 0 0 / 0.9);
--reading-surface-strong: rgb(0 0 0 / 0.96);
```

These values introduce no new palette color; they change only black alpha.

- [ ] **Step 4: Apply stronger localized reading surfaces**

In `src/styles/layout.css`:

```css
.hero__copy,
.section-heading,
.recognition-heading,
.trajectory-heading {
  padding: clamp(1.25rem, 2.5vw, 2rem);
  background: var(--reading-surface);
}

.experience-list,
.work-evidence,
.project-lead,
.project-tile,
.research-feature,
.research-notes,
.nested-chapter,
.leadership-mosaic,
.recognition-item,
.about-human {
  background: var(--reading-surface);
}

.experience,
.trajectory-node,
.research-note,
.leadership-item,
.recognition-item__copy {
  background: var(--reading-surface-strong);
}
```

Replace duplicated `rgb(0 0 0 / 0.8)`, `0.82`, `0.88`, `0.9`, `0.92`, and `0.94` reading-surface declarations only where they sit behind text. Do not change the fixed header, proof band, images, particle canvas, or open negative-space areas. Keep metadata on `--text-quiet`; keep substantive paragraphs on `--text-secondary`.

- [ ] **Step 5: Run source tests and confirm GREEN**

Run:

```bash
npm test
```

Expected: every source, particle, palette, content, workflow, and contrast test passes.

- [ ] **Step 6: Commit the contrast pass**

```bash
git add src/styles/tokens.css src/styles/layout.css tests/portfolio-source.test.mjs
git commit -m "style: strengthen portfolio reading contrast"
```

---

### Task 4: Document and validate the complete interaction

**Files:**
- Modify: `README.md`
- Generated: `dist/**`

**Interfaces:**
- Consumes: complete semantic particle morph and contrast implementation.
- Produces: verified local, GitHub Pages, and Sites-compatible production output.

- [ ] **Step 1: Document the semantic micro-shapes**

Update the README interaction section with this mapping and the discrete-particle constraint:

```md
Each of the six scroll scenes keeps the brain as a field of hundreds of small particles. Individual particle glyphs morph continuously through triangle, square, diamond, ring, hexagon, and dot states; the renderer never replaces the brain with one large chapter icon.
```

- [ ] **Step 2: Run the complete production verification**

Run:

```bash
npm run check
```

Expected: all particle/helper/source/workflow tests pass, Astro builds both routes, and all built-output tests pass.

- [ ] **Step 3: Run the final source audit**

Run:

```bash
rg -n "three\.js|WebGL|ScrollTrigger|Lenis|drawGiant|gradient|cursor:\s*url|href=\"\"" src README.md
git diff --check main...HEAD
git status --short
```

Expected: no prohibited runtime, giant-shape renderer, gradient, custom cursor, or empty link; only intentional authored mentions of prohibited technologies may appear in documentation. User-owned untracked files remain outside the branch diff.

- [ ] **Step 4: Inspect desktop and mobile scroll transitions**

At `1440 × 900` and `390 × 844`, verify:

- Hero settles into many small triangles.
- Work settles into many small squares.
- Projects visibly rotates/crossfades squares into many small diamonds.
- Research settles into many small outlined rings.
- Leadership settles into many small connected hexagons with the existing Saffron halo.
- About settles into many small dots while retaining the brain silhouette.
- Mid-scroll screenshots show both adjacent micro-glyphs at shared particle centers.
- Headings and substantive body copy remain dominant over localized black scrims.
- `document.documentElement.scrollWidth === document.documentElement.clientWidth`.
- Browser console contains no warnings or errors.

- [ ] **Step 5: Verify reduced motion**

With `prefers-reduced-motion: reduce`, confirm the canvas draws one static whole-brain frame made from small Hero triangles and all text is visible without reveal animation.

- [ ] **Step 6: Commit documentation**

```bash
git add README.md
git commit -m "docs: explain semantic particle shapes"
```

- [ ] **Step 7: Request final branch review**

Review the full branch against `docs/superpowers/specs/2026-07-22-semantic-particle-morphs-design.md`. Fix every Critical or Important finding, rerun `npm run check`, and retain the branch for user inspection rather than merging or pushing without direction.
