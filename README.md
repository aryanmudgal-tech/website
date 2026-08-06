# Aryan Mudgal portfolio

A recruiter-first portfolio built as a six-scene Camera Dive. A procedural particle brain remains behind the complete server-rendered page while normal scrolling moves through Aryan's work, projects, research, leadership, and personal story.

## Run locally

```sh
npm install
npm run dev
```

Astro prints the local address. Open that address in a browser.

## Verify and build

Run the complete verification sequence before shipping:

```sh
npm run check
```

It runs the particle helper tests, source contracts, GitHub Pages base-path build check, Astro production build, built-output contracts, and Sites worker test. The static production site is generated in `dist/client/`, with a small asset-serving worker in `dist/server/` for Sites hosting.

The individual commands remain available when diagnosing a failure:

```sh
npm test
npm run build
npm run test:build
```

## Six scenes

| Scene | Destination | Purpose |
|---|---|---|
| 1. Whole brain | Hero | Introduces Aryan, the primary email action, and five recruiter proof points |
| 2. Signal systems | Work | Shows Linde, Meta Layer Initiative, and HCLTech in recruiter-first order |
| 3. Built under pressure | Projects | Presents Dots, ARMIE, StreamFair, and W.O.D. with real images and proof links |
| 4. Earlier signals | Research and Trajectory | Connects medical-AI research with a fully visible twelve-node chronology |
| 5. Scale through people | Leadership and Recognition | Covers representation, budget, nonprofit, civic work, and three institutional honors |
| 6. Pullback | About and Contact | Returns to the whole brain around interests, places, gratitude, email, LinkedIn, and GitHub |

The fixed, pointer-transparent canvas is progressive enhancement. It uses only native Canvas 2D and a deterministic local particle model; the page content, links, landmarks, and nested anchors remain complete when JavaScript or canvas is unavailable. If a 2D context cannot be created, the site keeps its text-first black layout.

With `prefers-reduced-motion: reduce`, the engine draws one static whole-brain frame and the CSS removes reveal movement. The site does not intercept wheel, touch, keyboard, or anchor navigation.

## Semantic particle shapes

Each of the six scroll scenes keeps the brain as a field of hundreds of small particles. Individual particle glyphs morph continuously through triangle, square, diamond, ring, hexagon, and dot states; the renderer never replaces the brain with one large chapter icon.

| Scene | Micro-particle glyph | Visual role |
|---|---|---|
| Hero | Open triangle | Direction, curiosity, and forward motion |
| Work | Square | Systems, infrastructure, and reliability |
| Projects | Diamond | Pressure, experimentation, and refinement |
| Research | Outlined ring | Detection, microscopy, and faint signals |
| Leadership | Hexagon | Networks, organization, and collective scale |
| About | Filled dot | People, personality, and a relaxed final pullback |

During a scroll transition, the outgoing micro-glyph contracts and fades while the incoming micro-glyph expands and appears at the same particle center. This keeps the change visible without positional popping, while preserving the recognizable particle-built brain at every chapter.

## Editing content

Factual content, chronology records, navigation labels, image metadata, and external links live in `src/data/portfolio.ts`. The six-scene composition lives in `src/pages/index.astro`; semantic chapter markup lives in `src/components/`; particle generation and camera behavior live in `src/lib/particle-brain.mjs`.

`src/styles/global.css` is the stylesheet entrypoint. Edit colors and spacing in `src/styles/tokens.css`, layout and responsive rules in `src/styles/layout.css`, and reveal or reduced-motion behavior in `src/styles/motion.css`.

Photographs are sourced from `assets/` and copied to `public/assets/` for the static build.

## Design and accessibility constraints

- Semantic landmarks, ordered headings, a skip link, and visible focus states.
- Every key fact is visible without hover.
- The core page remains readable without client JavaScript.
- The twelve-node trajectory is a server-rendered ordered list and needs no interaction to read.
- All multi-column layouts collapse below 48rem.
- Every primary navigation link remains available on mobile.
- Reduced-motion preferences keep a static whole-brain frame and remove nonessential movement.
- No preloader, WebGL, Three.js, GSAP, sound, custom cursor, marquee, or scroll hijacking.

## Project notes

The approved Camera Dive specification is in `docs/superpowers/specs/2026-07-21-portfolio-camera-dive-design.md`. The corresponding build plan is in `docs/superpowers/plans/2026-07-21-portfolio-camera-dive.md`.
