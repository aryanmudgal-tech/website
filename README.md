# Aryan Mudgal — “A One-Man Show”

A cinematic, 3D-animated portfolio told as a film production: projects are **Acts**,
research papers are **festival posters**, experience is a **filmography**, awards are
**laurels**, contact is the **closing credits** — and halfway through there's a real
**INTERMISSION: a playable 3-hole mini-golf game** whose obstacles are a film slate,
dumbbells (leg day), and a badminton net. Gym, golf, badminton, and the acting bug —
all in the build.

## Run it

Everything lives in a single `index.html` (Three.js + GSAP via CDN — needs internet).

- **Easiest:** double-click `index.html`.
- **Best:** serve it locally —
  ```sh
  python3 -m http.server 4173
  # → http://localhost:4173
  ```

## The tour

| Section | What it is |
|---|---|
| Preloader | 3…2…1 film-leader countdown |
| Hero | Three.js projector stage: volumetric beam, drifting dust, orbiting props (clapperboard that snaps, dumbbell, golf flag, shuttlecock, DNA helix). **The props are grabbable** — drag one and flick it; it tumbles off with your throw speed, then drifts home to its orbit. Background music: real lofi — “Silent Moonlight” by Dontcry & Allem Iversom (CC BY-SA 4.0, credited in the end-credits crawl), starts on first interaction at medium volume. Synthesized foley on top (Web Audio): throws whoosh with flick speed, props chime as they re-dock. `♪ sound` toggle in the hero, preference remembered |
| Act I | **The Awards Season** — compact stat cards that look complete on their own; hover (tap on mobile) and the card *expands*: a connected panel unfurls below it over the page (no layout shift), revealing the photo in a framed border with a spark lapping it while the rest of the row dims. Awards: Student Innovative Leader 1 of 2 / 20,000 · Chancellor’s 1 of 15 / 8,000 · Phi Beta Kappa Top 10%. Festival wins: Dots (1st of 1,000 — Catalyst for Care + Fetch.ai 3rd), ARMIE (HM of 300 teams, MIT), StreamFair (1st of 800, Ripple track, CMU), C.O.R.E. (1st of 200, MoonLake track, Stanford) — each with demo links |
| Act II | **Litos** — now filming, script page redacted (“NO SPOILERS”) |
| Intermission | **The 19th Hole** — drag from the ball to aim, release to putt |
| Act III | Research trilogy (horizontal reel): MIDL-accepted FMH detection, PPG accuracy, early wound detection |
| Act IV | The Ensemble: 30,000+ (SUNY Delegate), $500K+ (Senator), Men In Green, Clean Campus (100K+ impressions), Civic Platform (30K+ students) |
| Act V | Filmography, three roles: Software Engineer Intern — Linde (Summer 2026, ML for remote plant operators), Software Engineer Intern — Meta Layer Initiative (Summer 2025, browser extension for human-AI interaction), Technical Analyst — HCLTech (Summer 2024) |
| Behind the Scenes | Gym · Golf · Badminton · Acting & Mimicry (rotating impressions) |
| Closing credits | A real film **end-credits crawl** — a letterboxed cinema screen, text scrolling up on a seamless loop (pause on hover), crediting family, friends, mentors, communities + locations (New Delhi · Buffalo · San Francisco) — then a casting call (contact) |

Palette: premiere-night indigo with marquee gold, coral, electric cyan, neon pink,
and bright green — each act carries its own accent color.

🎬 Easter egg: type `action` anywhere.

## Editing content

All copy is plain HTML in `index.html` — search for the section comments
(`ACT I`, `ACT II`, etc.). Photos used by the site live in `assets/`
(web-sized JPEGs); the 26MB originals stay local in `Pictures/` (gitignored).

Placeholders to fill in when ready:

- **LinkedIn / GitHub buttons** in the closing credits currently point at the
  generic homepages — drop in your profile URLs.
- **Litos** copy is intentionally “under embargo” — replace when it launches.

Game tuning lives in the `HOLES` array (tees, cups, pars, obstacles) inside the
module script.

## Deploying

It's one static file — GitHub Pages, Netlify Drop, or Vercel all work as-is.

## Notes

- Custom cursor & magnetic buttons disable themselves on touch devices.
- `prefers-reduced-motion` is respected (animations collapse, content stays).
- Hero and game render only while on screen; DPR is capped for battery sanity.
- No build step, no dependencies to install, no tracking.
