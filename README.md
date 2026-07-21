# Aryan Mudgal portfolio

A proof-first portfolio for recruiters and hiring managers. The site presents professional experience, selected builds, research, leadership, recognition, current work, and contact information in a fast editorial scan with optional depth.

## Run locally

```sh
npm install
npm run dev
```

Astro prints the local address. Open that address in a browser.

## Verify and build

```sh
npm test
npm run build
npm run test:build
```

The complete verification sequence is also available as:

```sh
npm run check
```

The static production site is generated in `dist/client/`, with a small asset-serving worker in `dist/server/` for Sites hosting.

## Site structure

| Section | Purpose |
|---|---|
| Hero and proof band | Establishes Aryan's direction and five credibility signals in the first viewport |
| Work | Shows the Linde, Meta Layer Initiative, and HCLTech experience in recruiter-first order |
| Projects | Presents Dots, ARMIE, StreamFair, and C.O.R.E. with visible proof links |
| Trajectory | Connects work, builds, research, and leadership through one keyboard-operable interaction |
| Research | Separates the MIDL-accepted work from two ongoing medical-AI projects |
| Leadership | Gives student representation, budget, nonprofit, and civic work clear scale |
| Recognition | Pairs the three institutional honors with real photographs and exact selection data |
| About | Covers Litos, personal interests, locations, and collaborator gratitude |
| Contact | Provides direct email, LinkedIn, and GitHub paths |

## Editing content

Factual content and external links live in `src/data/portfolio.ts`. Page composition lives in `src/pages/index.astro`, and visual tokens and responsive layouts live in `src/styles/global.css`.

Photographs are sourced from `assets/` and copied to `public/assets/` for the static build. The previous soundtrack is intentionally not loaded.

## Design and accessibility constraints

- Semantic landmarks, ordered headings, a skip link, and visible focus states.
- Every key fact is visible without hover.
- The core page remains readable without client JavaScript.
- The trajectory supports pointer input, arrow keys, Home, and End.
- All multi-column layouts collapse below 48rem.
- Every primary navigation link remains available on mobile.
- Light and dark system themes use the same cobalt accent family.
- Reduced-motion preferences remove nonessential movement.
- No preloader, WebGL, sound, custom cursor, game, marquee, or scroll hijacking.

## Project notes

The implementation specification is in `docs/superpowers/specs/2026-07-20-portfolio-editorial-atlas-design.md`. The corresponding build plan is in `docs/superpowers/plans/2026-07-20-portfolio-editorial-atlas.md`.
