# Semantic Particle Morphs and Text Contrast Design

Date: 2026-07-22
Status: Approved interaction direction; awaiting written-spec confirmation

## Goal

Make the Camera Dive transitions unmistakable by morphing the particle glyphs into a chapter-specific visual language as the user scrolls. At the same time, strengthen the reading hierarchy so headings and supporting text remain immediately legible over the animated brain.

The update must preserve the current six chapters, all portfolio content, normal document scrolling, Canvas 2D implementation, reduced-motion fallback, responsive particle budgets, and deployment behavior.

## Chapter shape language

Each chapter owns one settled particle shape. The shape is a visual metaphor for the chapter rather than an arbitrary decoration.

| Scene | Settled shape | Meaning |
| --- | --- | --- |
| Hero | Open triangle | Direction, curiosity, and forward motion |
| Work | Square | Systems, infrastructure, and reliability |
| Projects | Diamond | Pressure, experimentation, and ideas being refined |
| Research | Outlined ring | Detection, microscopy, and faint signals becoming visible |
| Leadership | Hexagon | Networks, organization, and collective scale |
| About | Soft organic dot | People, personality, and a relaxed final pullback |

The existing six cluster and camera destinations remain unchanged. Shape identity is added to the same scene progress so geometry, camera movement, node emphasis, bridge lines, and color all describe one continuous transition.

## Morph behavior

Every particle receives deterministic size, orientation, and phase values from the existing seeded model. The engine draws a particle using the two shapes adjacent to the current scroll position:

1. At an exact chapter center, only that chapter's settled shape is visible.
2. Between chapter centers, the outgoing glyph fades and contracts while the incoming glyph expands and becomes opaque.
3. Both glyphs share the same projected particle center, preventing positional popping.
4. Rotation interpolates through the shortest useful angle so squares become diamonds deliberately rather than switching instantly.
5. Research uses outlined rings. About uses restrained filled circular dots. All other shapes remain outlined.
6. The existing bridge edges continue to draw toward the destination cluster while the incoming shape becomes dominant.

The morph must be visible throughout ordinary wheel, trackpad, touch, keyboard, and scrollbar navigation. It remains derived from native scroll position; there is no scroll interception or synthetic smoothing.

## Canvas architecture

The particle model stays deterministic and independent from drawing. A pure chapter-shape function maps scene progress to `fromShape`, `toShape`, and `amount`. A reusable glyph renderer draws triangle, square, diamond, ring, hexagon, or dot from a common center and radius.

The renderer must:

- avoid allocating per-particle objects inside the draw loop;
- keep the current 420, 800, and 1400 particle budgets;
- keep the 1.5 device-pixel-ratio cap;
- skip expensive drawing while scroll progress is unchanged;
- preserve visibility, resize, teardown, context-failure, and reduced-motion behavior;
- keep all colors within the approved palette.

Reduced-motion mode renders one static whole-brain frame using the Hero triangle language. It does not animate or cycle through shapes.

## Text hierarchy and contrast

Text becomes the dominant foreground layer without hiding the brain everywhere.

- Chapter headings and primary evidence titles remain white and receive the strongest contrast.
- Supporting body text moves from the quiet gray treatment to the brighter secondary gray where it carries substantive information.
- Metadata can remain quiet gray because it is supplementary.
- Reading blocks use localized black scrims with higher opacity than the current desktop treatment. The scrims remain flat and translucent with no gradient or glass blur.
- Scrims gain enough internal padding to prevent particles from touching letterforms visually.
- Localized black scrims reduce particle interference behind key reading blocks, while the brain remains visible at full intensity in open negative space.
- Links, focus states, and the primary email action retain their existing Iris and Saffron hierarchy.

Target contrast is WCAG AA for normal text and large headings against the effective black reading surface. Text must remain readable at desktop, tablet, and 320–390px mobile widths.

## Component impact

- `src/lib/particle-brain.mjs`: add pure shape-state mapping and glyph paths; integrate the morph into particle drawing.
- `src/styles/layout.css`: strengthen localized reading surfaces and body-copy contrast.
- `src/styles/tokens.css`: reuse existing palette tokens; add semantic contrast tokens only if necessary.
- Existing Astro chapter markup should not change unless a small class hook is required for localized contrast.

No new dependency, WebGL renderer, copied Dala asset, custom cursor, or scroll library is allowed.

## Verification

Automated checks will verify:

1. Exact scene progress resolves to the six expected shapes.
2. Midpoint progress exposes both adjacent shapes with a clamped morph amount.
3. Glyph drawing supports all six shapes without non-finite geometry.
4. The existing deterministic model, bridge, leadership halo, budgets, lifecycle, palette, content, build, base-path, and Sites checks remain green.
5. Styles use stronger black reading surfaces and brighter substantive copy without gradients or unapproved colors.

Browser checks will verify:

1. Shape changes are visibly continuous between every adjacent chapter.
2. The settled shape matches the chapter meaning.
3. Heading and body text remain readable while particles move behind surrounding negative space.
4. Desktop and 390px mobile layouts have no horizontal overflow.
5. Reduced-motion mode remains static and readable.

## Acceptance criteria

- A user can identify that particle shapes are changing during scroll without stopping exactly at a chapter boundary.
- All six chapters settle into their specified semantic shape.
- Text is visually dominant and comfortably readable in every chapter.
- The brain remains recognizable and present rather than being hidden by full-screen opaque panels.
- `npm run check` passes with zero failures.
