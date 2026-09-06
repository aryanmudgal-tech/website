# Me in Every Photo: portfolio v3 design

## Status

Approved by Aryan Mudgal on 6 September 2026 after a 30-agent research and concept workflow (audit, ten research sweeps, eight concepts, five judges, synthesis). His answers to the 58 open questions are folded in below. Items still pending from him are listed at the end and do not block weekend 1.

Working title for the concept: "Me in Every Photo" (his own caption on a pencil self-portrait, cleared for public use). The workflow's synthesis calls the same design "One Face, Nine Rooms".

## North star

Wow a recruiter and tell them who Aryan is inside five seconds, on a phone and a laptop. Proofs, pictures and engagement everywhere. A playful theme that is his, not a generic creative-developer persona. No AI slop. Easy to maintain from a phone or a laptop.

## Design read

A conventional, recruiter-ordered one-page resume whose single deviant element is a frame in which real photographs of Aryan dissolve into one another with his face registered to one point, driven by scroll, with no JavaScript. Everything else is quiet on purpose: the research the workflow gathered says first impressions punish visual complexity (Tuch et al. 2012), memory rewards exactly one isolate against a plain background (von Restorff, via Hunt 1995), recruiters trust what they can verify in one tap (Marlow and Dabbish 2013), and the peak and the end dominate how a visit is remembered (Alaybek et al. 2022). The typed layer proves builder and researcher. The frame proves he shows up everywhere looking like he belongs. The last photo is the pencil self-portrait.

The voice layer proposed by the workflow (a four-voice switch) does not ship in v3.0. See "Voice policy".

## What stays from v2

- Astro 7 static output to GitHub Pages with the BASE_URL plumbing in `.github/workflows/deploy-pages.yml` and `src/lib/site-url.ts`.
- `src/data/portfolio.ts` as the single typed source of truth, components as pure renderers.
- Section order and anchor ids: Hero, Work, Projects, Route, Research, Leadership, Recognition, About, Contact. Nav labels unchanged.
- Accessibility scaffolding: skip link, landmarks, alt text with width and height on every image, `aria-current` nav via IntersectionObserver, reduced-motion handling, light and dark tokens under `color-scheme: light dark`.
- Honesty labels ("Team scope" versus "My part"), and the bans on Three.js, WebGL, canvas, custom cursors, infinite animation, gradients, the lofi track, and theatre-era vocabulary.

## Content: the facts that ship

Every sentence of body copy is a `Claim` with at least one `Receipt` (a URL, a photo, or a named source). Where Aryan asked to keep a claim that has no public record, the exception is recorded here and the claim renders without a Source chip.

### Identity and hero

- Name: Aryan Mudgal.
- Fixation line (desktop): "B.S. Computer Science, University at Buffalo, December 2026, GPA 3.93. Software Engineer Intern at Linde, Summer 2026; before that Meta Layer Initiative (2025) and HCLTech, Dubai (2024). Seeking new-grad software or forward-deployed engineering roles from January 2027. New York City, open to relocation."
- Fixation line (phone, capped at 130 characters by a test): "CS, University at Buffalo, Dec 2026. SWE Intern, Linde, Summer 2026. Seeking new-grad SWE roles from Jan 2027. NYC, open to relocation."
- Work authorization and sponsorship: not mentioned, per Aryan.
- Ledger (three rows, one bold; bold row chosen by ln(pool / winners) computed only with sourced denominators):
  1. "1 of 2" Award for Innovative Student Leadership, University at Buffalo, April 2026. Denominators: 130+ nominations (UB Student Life) and 20,000+ undergraduates (UB enrollment figures, cite the UB page). Source: UB Student Life.
  2. "1 of 15" SUNY Chancellor's Award for Student Excellence, 27 April 2026; 15 at UB, 205 statewide. Sources: SUNY press release, UBNow. Extra receipt: the UB video "Celebrating Student Excellence" on YouTube (youtu.be/Aru9b8gWmtE), Aryan speaking at 2:56.
  3. Phi Beta Kappa, 2026, inducted. Source: UB Arts and Sciences inductee list. This row is swapped for the MIDL paper the day Aryan supplies the paper's title and public link with his name on the author list (see pending).
- Actions: Email (mailto), Resume (PDF at `public/resume.pdf`, copied from his one-page resume; note: the PDF carries his phone number, which he has accepted by supplying it), and nothing else. No play button in v3.0.
- Hero photo (room 1): `IMG_9046.jpg`, LA Hacks, UCLA, April 2026, demoing Dots. Caption: "LA Hacks, UCLA, April 2026. Demoing Dots. 1st, Catalyst for Care track. Source: Devpost."

### Work (h2: "Three summers, one shipped app")

1. Linde, Software Engineer Intern, Buffalo, NY, Summer 2026. Built and shipped an ASP.NET Core MVC application from scratch that replaced paper production logging across the plant, saving operators about three hours a day. Designed the SQL Server schema, integrated Active Directory sign-in for domain-joined floor laptops, deployed on-prem via IIS, and built an Azure CI/CD pipeline for a second internal tool. In beta at the Palmer, Massachusetts site; slated to scale nationwide after. My part: the whole application. Receipt: LinkedIn; a system diagram from Aryan when it arrives (becomes a room). The v2 "ML alert system" story is retired; it is not what shipped.
2. Meta Layer Initiative, Software Engineer Intern, Summer 2025. Built the core browser extension: a persistent layer over any webpage where people and AI agents work side by side. Receipt: LinkedIn; a one-line confirmation from founder Daveed Benjamin when supplied. The GitHub repo is not linked (Aryan's request). No screenshots (NDA).
3. HCLTech, Technical Analyst Intern, Dubai, UAE, May to August 2024. Researched AI trends across the MENA region for a Fortune 500 client across 50+ industry reports, analyzed 35+ customer journeys for product localization, and delivered a 45-minute strategy presentation to C-suite stakeholders. Receipt: LinkedIn.

### Projects (h2: "What I built in a day at UCLA, MIT, CMU and Stanford")

Each card: outcome headline, venue and date, photo, "My part", team names, receipts. Team members may be named (Aryan confirmed consent for everyone in the photos and in the credits).

1. Dots, LA Hacks, UCLA, April 2026. 1st, Catalyst for Care track; 3rd, Agentverse track (Fetch.ai). 307 projects (Devpost gallery). An iOS app built in 20 hours that turns floor plans or LiDAR room scans into Braille tactile maps and lets a blind user ask an AI voice agent about the space; on-device LiDAR scanning in Swift; cuts an ADA compliance step from thousands of dollars to under 50. My part: the iOS app and its full pipeline, the voice agent, and the backend that generates the Braille-map STL. Human detail: one blind user tested it, Aryan's cousin. Receipts: Devpost (dots-y5r21j), GitHub, the Vercel demo. Photos: `IMG_9063` (team with awards, room 2), `IMG_9046` (demo, room 1), `IMG_9044` (pitch) and `IMG_9051` (Fetch.ai booth) as popover extras.
2. ARMIE, MIT Reality Hack, January 2026. AR surgical training paired with a 3D-printed robot arm. Honorable mention. My part: anomaly-detection ML on existing neurosurgical training datasets. Receipts: Devpost (armie), GitHub (liviaellen/ble-mithack). Exception: "Honorable mention" has no public record; Aryan asked to keep it. It renders as plain text with no denominator and no Source chip. Photos: robot-arm build shot (room 3), team photo (popover).
3. StreamFair, TartanHacks, Carnegie Mellon, February 2026. 1st, Ripple track. A Chrome extension built in 24 hours for YouTube and Amazon Prime rentals: pay per second watched via XRPL and RLUSD micropayments instead of the full rental fee; creators are paid for watch time. Team: Yash Nakadi, Ayush Srivastava; team name "Water Mellon" was a Carnegie Mellon pun. Receipts: GitHub (aryanmudgal-tech/StreamFair), demo video (Google Drive, labelled "sign-in required"). Photos: stage slide reading "RIPPLE 1st place, Water Mellon" (room 4), CMU team photo (popover).
4. W.O.D., Immerse The Bay 2025 (Stanford XR), November 2025. 1st, Best Creation on Moonlake; 56 projects. A playable VR world set in Tang-dynasty China, built in Moonlake by a two-person team (with Ayush Srivastava). Receipts: Devpost (c-o-r-e), GitHub (aryanmudgal-tech/stanford-xr-core), Moonlake link. Photos: the console-prize selfie (room 5), team photo (popover). A gameplay recording exists and may be added later.
5. Safeline, YC Voice Agents Hackathon, San Francisco, May 2026. A voice agent that drafts law-enforcement incident reports, built in a day. Did not place; the demo ran. Officers Aryan spoke with said it would cut hours of documentation; judges called the idea unique (both in-room remarks, no public record; rendered as Aryan's own account). Not related to Litos. Receipts: GitHub (aryanmudgal-tech/safeline) and the two YC photos. Photos: mic-in-hand stage shot (room 6), portal screenshot (popover).

Not included, per Aryan: Redial, Mirror, Quant Club.

### Route (h2: "2020 to 2026, as a list")

A compact dated list, no tabs, no grid, no hidden content: Pune 2020 to 2023 (army family, ten schools before university), Buffalo from August 2023, the roles and wins above by date, New York City as the target from 2027. The v2 trajectory tablist and its 2,866px phone footprint are retired (the trade is acknowledged: two audits argued to rebuild it touch-first; the interactivity research argues against a second interactive system on facts a recruiter needs least).

### Research (h2: "Counting fetal cells in maternal blood")

Research Assistant, University at Buffalo, February to December 2025. Fetomaternal hemorrhage detection: built an automated segmentation pipeline that seeds SAM2 with Grounding DINO detections, isolating 2.5 million cells into pixel-level masks and removing manual per-cell prompting; ran Kleihauer-Betke slide data from a Cornell collaboration, improving detection accuracy from 89% to 92%. Receipt: the resume; the paper's title and link once confirmed (see pending). No de-identified tile or poster (PI consent not sought). Photo: `Research/research-portrait.jpg` as the Research room. The unhealthy-wound-detection and PPG items are removed entirely.

### Leadership (h2: "Elected twice, founded twice")

- SUNY Student Assembly Delegate, September 2024 to October 2025: elected voice for UB's roughly 30,000 students. Receipts: The Spectrum (December 2024), UBNow.
- Student Senator, 2023 to 2024: voted on more than $50,000 in club funds. Receipt: UBNow (April 2026). The v2 "$500K+" figure is retired.
- Men In Green, co-founder, Agra, India, since July 2023: screens Indian military-academy candidates for correctable medical disqualifiers; 450+ screened, 3 commissioned as officers who would otherwise have been disqualified. Exception: no public record; Aryan asked to keep it. Renders without a Source chip; a photo becomes a room when one exists.
- Clean Campus, co-founder with Chirag Ohri, founded spring 2024: 10 cleanup drives, about 150 pounds of litter, spread to New York University and Boston University, about $500 raised through UB's Get Seeded competition (The Spectrum, 3 December 2024, Maximilian Malawista). Quote available: "It shouldn't matter if the weekend staff are not working, students should still want a sense of cleanliness." Receipts: The Spectrum article, UBNow. The "1,500+ followers" and "100,000+ reach" figures are retired; Aryan's "100,000+ impressions" is not printed because it has no public source.
- Student Issue Portal: built a site for UB's roughly 30,000 students to report campus issues and follow up. Receipts: GitHub, the UB Honors post. No public URL.
- Student Engagement Event Intern, UB: one line, added when Aryan supplies the source.

### Recognition (h2: "Two awards in one April, and a key")

Each award appears in full exactly once, here. Hero ledger rows are one-line pointers to these rows.

- Award for Innovative Student Leadership (Pillar of Leadership), UB, April 2026. 1 of 2 from 130+ nominations among 20,000+ undergraduates. Photos: plaque shot `innovative-student-leader-award-3.png` (room), the two-recipient photo with Shaurya Jain `innovative-student-leader-award-1.png` (popover, consented). Source: UB Student Life.
- SUNY Chancellor's Award for Student Excellence, Albany, 27 April 2026. 1 of 15 at UB, 205 statewide. Photos: `Chancellors-award-Albany.jpeg` (7474 by 4985, with SUNY Chancellor John B. King Jr., certificate legible; room), the UB-backdrop photo (popover). Receipts: SUNY press release, UBNow, the YouTube ceremony video at 2:56 ("Hear Aryan at the ceremony").
- Phi Beta Kappa, 2026. Inducted; the chapter's criterion is the top tenth of the class. Photo: `phi-beta-kappa.png` (room). Source: UB Arts and Sciences.
- UB Honors Scholar: one line without a denominator until sourced.

### About (h2: "Outside the work")

Four first-person sentences, in this order, each with a checkable detail:
1. "I do impressions, mostly Bollywood, on request." (No audio in v3.0; see Voice policy.)
2. "Army kid: ten schools before university. Pune from 2020 to 2023, Buffalo since 2023."
3. "Golf handicap 20. Badminton most weeks."
4. "Geopolitics and public speaking, when nobody stops me."
Then one line on Litos: "Building Litos, a Chrome extension on the Chrome Web Store that shows how much you have used it." with the GitHub link.
One joke, self-enhancing and containing proof, to be pre-tested with Aryan's five named readers before it ships; candidate: "Handicap 20 on the course. Two track wins at LA Hacks. I know which one I practice." The earlier "four voices" joke is dropped: it was not true.

### Contact (h2: "Every claim above has a link")

Email at 24px, LinkedIn, GitHub, Devpost, Resume (PDF). Room 10: `scribble.png`, caption "Pencil, drawn on the train to Albany, April 2026. Me in every photo." Colophon: typefaces; "photos by event photographers and by me"; "v3, September 2026. v2 (July 2026) was a plain page. v1 (June 2026) had a projector and a mini-golf game."; a corrections line in neutral wording ("Figures aligned to UBNow and Devpost, September 2026") with no old values printed.

### Places

`places` becomes Pune, Buffalo, New York City. New Delhi is removed; Aryan did not live there.

## The signature: the frame

- Desktop (64rem and up): `<div class="rooms">` wraps `<main>` and the footer in a two-column grid, `grid-template-columns: minmax(0, 1fr) clamp(18rem, 30vw, 30rem)`. The frame occupies column 2, spans all rows, `position: sticky; top: calc(header + 1.5rem)`, aspect ratio 3:2 (about 480 by 320 on a 1440 laptop). Landscape because the hero source is 1063 by 688 pixels; a portrait crop would upscale 1.75x on a retina screen.
- Rooms, in order: 1 LA Hacks demo (`IMG_9046`), 2 Dots team (`IMG_9063`), 3 ARMIE arm, 4 StreamFair stage, 5 W.O.D. selfie, 6 Safeline stage, 7 Research portrait, 8 Chancellor's Award Albany, 9 Innovative Student Leadership plaque, 10 Phi Beta Kappa, 11 pencil self-portrait. Work, Route and Leadership have no photo and keep the previous room. A Linde system diagram becomes a Work room when supplied.
- Mechanism: `.rooms { timeline-scope: --r1 ... --rN }`; each chapter that owns a photo declares `view-timeline-name: --rk`; each room image runs `animation: room-in linear both; animation-timeline: --rk; animation-range: cover 30% cover 37%` inside `@supports (animation-timeline: view())`. Later rooms stack above earlier ones. No script animates anything.
- Face registration: each room has a hand-set focal point (fx, fy) in `portfolio.ts`. `scripts/crop-rooms.mjs` (Sharp) produces one 3:2 crop per room with the face at (50%, 40%), maximum 1440px wide, from `Pictures/` into `src/assets/rooms/`; Astro's `<Picture>` emits AVIF and JPEG with `widths` and `sizes`. Sharp strips EXIF (the camera files may carry GPS).
- Tap or click on the frame opens the uncropped photo, caption and source in a native `<div popover>`; the button is `<button popovertarget>` with an `aria-label` carrying the caption. The frame is not `aria-hidden`.
- Phone (below 64rem): the frame docks as a sticky strip at the top, 21dvh tall, same CSS, face at (50%, 42%). Aryan chooses between this and a horizontal snap-scrolling strip after seeing the docked version; the docked strip is the launch default. Inline captioned figures per chapter remain in the HTML for the no-support fallback and are hidden when the frame is active, using `<picture>` sources whose non-matching breakpoint points at a one-pixel data URI, so exactly one copy of each photo downloads per device.
- Degradation: no `animation-timeline` support (Firefox, Safari 17 and 18) shows room 1 in the frame and the inline figures; `prefers-reduced-motion: reduce` turns each dissolve into a hard cut with `steps(1, end)`; no JavaScript loses only the popover (the frame becomes a plain link to the full image); no popover support (older iOS) falls back to the same link.
- Compositor: Chrome 116+ and Safari 26.4+; main thread in Safari 26.0 to 26.3.

## Voice policy

Aryan is comfortable with recordings of his voice being public. He declined to record the scripted hero read and the genre-voice takes the workflow proposed. The impressions he is known for are of real public figures (Shah Rukh Khan, Salman Khan, Amitabh Bachchan, Narendra Modi, Donald Trump). The humor research the workflow relied on (Bitterly, Brooks and Schweitzer 2017) is explicit that humor which misses with a hiring audience lowers perceived competence below the no-joke baseline, and impressions of political figures are the highest-risk class. Decision for v3.0: no audio ships. The frame carries the wow. If Aryan later records impressions, the recommendation is an opt-in "Impressions" strip limited to the Bollywood actors, each clip five to eight seconds with a transcript, shipped only after his five named readers (Kamel Basaran, Ed Matrack, Eric Mikida, Daniel Jenden, and one more) rate each as landing and appropriate for a VP of Engineering. Political figures stay off the hiring site unless Aryan overrides this in writing. The public YouTube clip of him speaking at the SUNY ceremony (2:56) is linked from the Chancellor's row as the existing voice artifact.

## Anti-slop commitments

Banned in this build: gradients, glassmorphism, bento grids, marquees, smooth-scroll libraries, magnetic cursors, split-text reveals, preloader counters, noise overlays, count-up numbers, "Hi, I'm Aryan, I build things", emoji, "trusted by" rows, stock or generated imagery, hobby chip lists, 01/02/03 eyebrows, humblebrags, "humbled to", any chat box, a second accent color, a second deviant element. Kept from v2: the Three.js, WebGL, canvas, custom-cursor, infinite-animation and lofi bans.

Typography: one display face with character for headings and numerals, one text serif for body, system fallbacks declared, `font-variant-numeric: tabular-nums` on the ledger. No monospace. Exact faces are chosen in the plan; self-hosted or Google Fonts with `font-display: swap`.

Color: one warm-neutral paper ground, one ink, one accent blue (the UB and SUNY backdrop blue) used for links and the single primary button, light and dark token sets under `color-scheme: light dark`. Photos keep a 1px `--line` border in dark mode.

## Technical plan

- Astro 7 static, GitHub Pages, no framework, no external script. `astro.config.mjs` gains `site` so absolute og:image and canonical work; the og:image is a 1.91:1 crop of room 1; Twitter card `summary_large_image`.
- `src/data/portfolio.ts`: adds `fixationLine`, `fixationLineShort`, `ledger` (three rows with fraction, label, source, bold flag), `rooms` (id, source file, focal point, caption, source link, chapter id), `Claim` and `Receipt` types with `receipts: readonly [Receipt, ...Receipt[]]`, `team` names per project, `h2` per section. `experiences`, `projects`, `researchItems`, `leadershipItems`, `recognitions` are rewritten to the facts above.
- Components keep their filenames. `Trajectory.astro` renders the compact Route list. New: `Frame.astro` (rooms and popovers), `Ledger.astro`.
- `scripts/crop-rooms.mjs` with Sharp (new devDependency): reads focal points, writes `src/assets/rooms/*.jpg` at 1440px and `src/assets/og.jpg`; idempotent; run manually when a focal point changes and outputs committed. `Pictures/` is added to `.gitignore`; only resized, metadata-stripped copies are committed.
- Inline scripts (two, under 3 KB gzipped total): the existing `aria-current` nav observer, and a popover close-on-link-click helper for the phone menu (`<nav popover>` opened by `<button popovertarget>`). No `astro:after-swap` listeners.
- Print stylesheet: the page prints as a sourced one-page resume with each href after its link.
- JSON-LD Person: `alumniOf`, `award`, `jobTitle` updated; Devpost added to `sameAs`; image is the headshot.
- Node: the deploy workflow moves to Node 24; `.nvmrc` says 24; `actions/cache` for `node_modules/.astro`. A `pull_request` trigger runs build and tests; the deploy job is gated with `if: github.event_name != 'pull_request'`.
- 404 page, README and this spec describe v3.

## Tests

Rewritten in one commit to protect outcomes rather than forbid creativity. Kept: section order, nav labels present, single h1, skip link, JSON-LD present, the library and vocabulary bans, the gradient and `cursor: none` bans, no infinite animation, no monospace, at least six `role="list"`, no `astro:after-swap`. Retired: the trajectory tablist contract, the 100dvh hero, the 72rem hide rule, the seven chapter tokens, the hero filename pin, the twelve-tab count, the `<audio` ban, the Cloudflare worker assertions.

New source and build assertions:
- `fixationLineShort` is at most 130 characters; both fixation lines and the three ledger rows appear in the built hero HTML.
- Every `Claim` has at least one receipt with an `href` or a photo (data imported with Node 24 type stripping).
- Every `<img>` has `alt`, `width` and `height`; exactly one `fetchpriority="high"` per breakpoint copy of room 1; all other images `loading="lazy"`.
- No horizontal overflow at 390px: the narrow hero rule uses `row-gap`, and no element sets a width in `vw` above 100 or a negative margin wider than the shell.
- No `NNvh` unit (regex `(?<![a-z])\d*\.?\d+vh\b`); `dvh` and `svh` allowed.
- Every `animation:` declaration sits inside `@supports (animation-timeline: view())`; the `prefers-reduced-motion: reduce` block declares only timing functions, durations and `scroll-behavior`.
- Exactly one accent hue token; a darkened text variant of the same hue is allowed.
- Each award denominator string appears at most twice in the built HTML (hero pointer plus Recognition).
- `Pictures/` is git-ignored; no file under `src/assets/sources` exceeds 1600px on its long side.
- Retired strings do not appear in the build: "$500K", "300 teams", "XR Hacks", "Fetch.ai, 3rd" in the old form, "1,500+", "100,000+", "New Delhi", "PPG", "wound".

## Acceptance criteria

1. On a 1440 by 900 laptop and a 390 by 844 phone, without scrolling, a reader sees: the name, the fixation line, three sourced proofs, Email, Resume, and a photo of Aryan with a legible venue; the Work heading is cut by the fold.
2. Scrolling from Work to Contact dissolves the frame through the eleven rooms with the face at one point; Firefox shows room 1 plus inline figures; reduced motion shows hard cuts.
3. Every claim on the page has a Source link or is one of the three recorded exceptions (ARMIE honorable mention, Men In Green, Safeline in-room remarks), and none of the retired figures appear.
4. Page weight on desktop first load under 900 KB including all room images; HTML under 16 KB gzipped; no external scripts; Lighthouse accessibility 100 and no axe violations, including no focusable element inside an `aria-hidden` subtree.
5. `npm run check` passes on Node 24 locally and in CI; the deploy job does not run on pull requests.
6. The live site's phone hero no longer clips the name.

## Phasing

- Weekend 1 (this build): everything above except the voice layer, the Linde diagram room, the MIDL ledger row and the pre-tested joke. Delivered on branch `v3-me-in-every-photo`, previewed with screenshots before any merge to main.
- Week 2: the joke after the five-reader test; the Linde diagram room; the MIDL row once confirmed; the phone frame decision (docked versus swipe); og:image review; consent-gated extras already cleared.
- Later: optional Impressions strip per the voice policy; W.O.D. gameplay recording; custom domain (planned, not yet purchased) and collapsing the `/website/` base path.

## Pending from Aryan (not blocking weekend 1)

1. The exact title and public link of the MIDL paper that lists him as an author. The only paper file found locally (`KB_test_paper_draft_MIDL2025.pdf`, "DE-C3: Robust Kleihauer-Betke Test via Data-Efficient Contrastive Cell Classification") does not include his name among its eight authors. Until confirmed, the hero ledger uses Phi Beta Kappa and Research describes the work without a paper claim.
2. The Linde system diagram.
3. A source for "Student Engagement Event Intern".
4. The Clean Campus co-founder URL Aryan mentioned, and whether a drive photo exists.
5. The W.O.D. gameplay recording, and whether a Safeline repo exists.
6. The five-reader verdict on the one joke.
7. The phone-frame choice after seeing the docked strip on his own phone.
