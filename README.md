# Aryan Mudgal, portfolio (v3)

One page. A recruiter reads the facts and the proofs in the first screen; a sticky frame beside the text dissolves through eleven photographs of Aryan at the events on the page, face held to one point, driven by scroll with no JavaScript.

## Stack

Astro 7, static output, deployed to GitHub Pages by `.github/workflows/deploy-pages.yml`. No framework, no external script. Fonts from Google Fonts (Newsreader, Instrument Sans).

## Content

- `src/data/portfolio.ts` holds every fact. Each claim carries `receipts` (a URL, a photo or a document); three claims Aryan asked to keep without a public record are marked with `exception` and render without a Source link.
- `src/data/rooms.ts` is the photo manifest: source file, hand-set focal point, caption, receipt. Rooms map to chapters with `data-room`.
- Raw photos live in the untracked `Pictures/` folder. `npm run rooms` cuts 3:2 crops (face at 50%, 40% where the photo allows) into `src/assets/rooms/`, full-size popover copies into `src/assets/full/`, the social image into `public/og.jpg`, and copies the resume. Outputs are committed; sources are not.

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
