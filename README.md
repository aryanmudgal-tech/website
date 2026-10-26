# Aryan Mudgal, portfolio (v4, Paste-Up)

One page. A recruiter reads the facts and the proofs in the first screen: a title block (Study, Work, Next), three sourced figures and two actions, with a paper collage pasted around the Pillar of Leadership photo. Every section after the hero is printed on its own sheet of coloured paper, and every photo sits beside the claim it proves. When you reach the end of a sheet it crumples into a ball and rolls away, revealing the next sheet underneath, driven by scroll in CSS with no JavaScript.

## Stack

Astro 7, static output, deployed to GitHub Pages by `.github/workflows/deploy-pages.yml`. No framework. Two small inline scripts: the nav's current section and the in-view demo videos. Fonts from Google Fonts (Source Serif 4, Instrument Sans).

## Content

- `src/data/portfolio.ts` holds every fact. Each claim carries `receipts` (a URL, a photo or a document); three claims Aryan asked to keep without a public record are marked with `exception` and render without a Source link.
- `src/data/rooms.ts` is the photo manifest: source file, hand-set focal point, aspect, caption, receipt. Each room renders once, as a taped print beside the card that owns it, with its full photo in a popover.
- Raw photos live in the untracked `Pictures/` folder. `npm run rooms` cuts the crops into `src/assets/rooms/` and full-size popover copies into `src/assets/full/`, and copies the resume. Outputs are committed; sources are not.

## Paper

- `npm run paper` draws every paper piece (torn edges, tapes, pencil drawings, grain) from seeded generators in `scripts/paper/`, makes the duotones and the handwriting from Aryan's photos, and composes the social card `public/og.jpg`. `src/data/paper.ts` records how each file was made, and `tests/paper.test.mjs` regenerates the code-drawn files byte for byte and holds the budgets.
- `npm run crumple` renders the whole-page crumple with three.js in headless Chromium (`scripts/crumple/`), packs one 25-frame AVIF strip per screen shape, and writes `src/data/crumple.json` and `src/styles/crumple.css`. It needs Playwright's Chromium (`npx playwright install chromium`), or set `CRUMPLE_CHROME` to a Chromium binary. The site build never runs it.
- The crumple runs only where scroll-driven animation is supported and motion is welcome. Elsewhere, and in print, the sheets are an ordinary page of coloured sections of the same height.

## Commands

Node 24 is required (`.nvmrc`). On a Mac with Homebrew: `export PATH=/opt/homebrew/opt/node@24/bin:$PATH`.

- `npm run dev`
- `npm run rooms` (after adding or re-cropping a photo)
- `npm run paper` (after changing a paper generator or a stock colour)
- `npm run crumple` (after changing the crumple model)
- `npm test` (source contracts, paper and the Pages workflow)
- `npm run build`
- `npm run test:build` (built output)
- `npm run check` (all three)

## Design notes

`docs/superpowers/specs/2026-10-26-paste-up-design.md` records the v4 design: decisions, facts, the visual system, the paper pipeline, layout, motion, accessibility, budgets and the test contracts. `docs/superpowers/plans/` holds the implementation plans. The approved mocks are in `docs/superpowers/mocks/`. v3's design is `docs/superpowers/specs/2026-09-06-me-in-every-photo-design.md`.
