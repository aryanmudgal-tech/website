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
| Hero | Three.js projector stage: volumetric beam, drifting dust, orbiting props (clapperboard that snaps, dumbbell, golf flag, shuttlecock, DNA helix) |
| Act I | **Litos** — now filming, script page redacted (“NO SPOILERS”) |
| Act II | Research trilogy (horizontal reel): MIDL-accepted FMH detection, PPG accuracy, early wound detection |
| Act III | Filmography with real titles: Software Engineer Intern (Linde · Meta Layer Initiative), Technical Analyst (HCLTech) |
| Act IV | The Ensemble, mad simple: 30,000+ (SUNY Delegate), $500K+ (Senator), Men In Green, Clean Campus, Civic Platform |
| Intermission | **The 19th Hole** — drag from the ball to aim, release to putt |
| Behind the Scenes | Gym · Golf · Badminton · Acting & Mimicry (rotating impressions) |
| Awards | Festival laurels + hackathon wins with project names: Dots (LA Hacks · UCLA), ARyan (Reality Hack · MIT), StreamFair (TartanHacks · CMU), XR Hacks (Stanford) |
| Closing credits | Rolling credits + casting call (contact) |

Palette: premiere-night indigo with marquee gold, coral, electric cyan, neon pink,
and bright green — each act carries its own accent color.

🎬 Easter egg: type `action` anywhere.

## Editing content

All copy is plain HTML in `index.html` — search for the section comments
(`ACT I`, `AWARDS`, etc.). Placeholders to fill in when ready:

- **Hackathon demo videos** — the three `btn-watch` links in the Awards strip
  are `href="#"` until the real video URLs go in (a TODO comment marks the spot).
  Until then, clicking shows a “trailer hits theaters soon” toast.
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
