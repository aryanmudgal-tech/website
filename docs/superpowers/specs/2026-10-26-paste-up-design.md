# Paste-Up: portfolio v4 design

## 1. Status

Approved by Aryan Mudgal on 26 October 2026. Their words: "Go with Paste-Up. Use your defaults for the other decisions and write the spec." This spec replaces the visual layer of the v3 design (`2026-09-06-me-in-every-photo-design.md`). It keeps v3's content model, honesty devices and static architecture. The approved mockup is `docs/superpowers/mocks/2026-10-26-paste-up/index.html`. Its generators are in that folder's `tools/`.

Work happens on branch `v4-paste-up`. Main and the live site do not change until Aryan approves the finished branch (section 11).

Later the same day Aryan asked for two more things, folded in as decisions 8 and 9: "remove the tests that ban the animations. we can have animations" (done in commit `8b5fc4b`, "test: allow animations"), and paper animation between sections as you scroll. Section 10 describes the tests as they stand at `8b5fc4b`.

### Decisions (approved 26 October 2026)

1. **Direction:** Paste-Up.
2. **The frame retires.** The sticky dissolving photo frame goes: `Frame.astro`, `timeline-scope`, the `--r-*` view timelines and the docked phone strip. All 12 rooms stay. Each renders once, beside the claim it proves. The 8 extras stay in popovers.
3. **Title block.** The fixation line renders as three labelled rows, Study, Work and Next, word for word. "New York City, open to relocation." sits inside Next, and no row claims where Aryan lives. The short line splits the same way on phones. The rows join back exactly to `identity.fixationLine` and `identity.fixationLineShort` (section 4.2).
4. **No receipt tiers.** A receipt looks the same whatever its source. The three agreed exceptions render without a receipt, as in v3.
5. **Photos.**
   - Recognition's pillar row shows the photo with Shaurya Jain. It carries its `rooms.ts` caption word for word and no receipt link of its own.
   - The Pillar portrait moves to the hero.
   - **Chosen here:** the LA Hacks demo shot (room `hero`) becomes the **second print in the Dots card**, not a popover extra. That keeps every room a room (`rooms.length === 12`) and keeps the extras at exactly 8. The shot renders visibly beside the Dots result, with its own caption and Devpost receipt.
6. **Fonts:** Source Serif 4 replaces Newsreader. Instrument Sans stays.
7. **Copy.**
   - Every existing heading and sentence in `portfolio.ts` stays unchanged.
   - New microcopy is limited to UI labels, all listed in the "New copy" table (section 4.4).
   - The Route heading is not reworded.
8. **Animations are allowed.** The test bans on scroll-timeline gating, the reduced-motion property list, infinite animation, three.js, WebGL, ScrollTrigger, `<canvas>` and `<script src>` are gone (commit `8b5fc4b`). A reduced-motion block is still required.
9. **Section transitions.** Aryan wants "a paper crumbling as we scroll and then becoming the different picture" and chose **between sections**: as each plate scrolls into view, the previous section's paper crumples, tears or folds away and reveals the plate's own stock and picture (section 8.4). Three prototypes were built; the technique is Pending 10, default **tear**.

**Out of scope:** any new claim; diagrams of the Linde app or the research pipeline; voice features.

### Pending (detail in section 12)

1. A better source for "1 of 2" (the "Source: UB Student Life" receipt).
2. The New copy table (section 4.4), including the two colophon lines. Decision 6 makes `colophon.type` false and v4 makes `colophon.version` stale; rows 6 and 7 propose replacements.
3. An optional higher-resolution Pillar portrait.
4. The re-aimed handwriting scrap.
5. The two duotone crops.
6. The research illustration and its note.
7. The `identity.description` observation.
8. A check on Aryan's own phone.
9. Whether the code-drawn pencil art needs a disclosure like the Research note.
10. Which section transition: crumple, tear or fold (section 8.4). Default: tear.

Milestone 0 does not gate milestones 1 to 4. Pending 10 must be answered before milestone 5, which builds the plates and their transitions. Pending 2 must be answered before milestone 6, which owns the colophon.

## 2. North star and design read

The north star is unchanged from v3. A recruiter should see, inside five seconds and on a phone or a laptop, what Aryan has done and where each claim is sourced.

Aryan asked to keep that clarity and said the UI "is not the best": they want it simple but more engaging, brighter and more vibrant. They pointed at the hand-made, paper-and-pencil feel of Anthropic's Claude Opus 5.5 launch page.

Paste-Up answers both halves with one rule: **facts stay on plain ivory paper, and colour lives in paper that is pasted beside them.**

- **The hero.** The record is typed on the left. The right holds a collage built around Aryan's own photo and handwriting:
  - the award portrait in full colour;
  - their handwritten "me in every photo" with its arrow on their face;
  - Aryan's name in embossed, uncontracted Braille (five letter cells, no capital sign; drawn in code);
  - a pencil-style floor plan of Dots (drawn in code).
- **The plates.** Every section opens on a torn plate of coloured stock carrying one subject drawn from that section's evidence. Colour therefore lasts the whole page instead of living inside one photo.
- **Colour never sets text.** Text sits on paper. The only text on a stock is ink on three tapes.

The design borrows the language of the Anthropic pages: paper, torn edges, pencil, flat colour blocks, serif type and generous white space. It borrows no asset, font, layout or illustration. There are no flanking strips, no centre panel and no scroll growth, no pencil sits on marigold, and the grain uses its own frequency.

It is the art director's first choice of the three finalists and the most direct answer to "artistic, hand-drawn". The trade is more parts to keep in taste. That trade is why most of this spec is about materials and their limits.

## 3. What stays from v3, and what retires

### Stays

- **Architecture.**
  - Astro 7 static output on GitHub Pages, with the `BASE_URL` plumbing in `.github/workflows/deploy-pages.yml`, `astro.config.mjs` and `src/lib/site-url.ts`.
  - Node 24 (`.nvmrc`, CI).
  - No framework, and v4 adds no external script. The two inline scripts are the nav observer with the menu-close helper (`SiteNav.astro`) and the in-view video loader (`Video.astro`). Since `8b5fc4b` no test bans `<script src>`; a narrower build test keeps these two scripts inline (section 10.2).
  - `npm run check` (source tests, build, built-output tests) is the gate.
- **Data model.**
  - `src/data/portfolio.ts` is the single source of truth.
  - `src/data/rooms.ts` is the photo manifest: 12 rooms and 8 extras.
  - Components are pure renderers.
  - `Pictures/` stays untracked. Only resized, metadata-stripped copies are committed.
  - Two small data changes, neither of them copy: `Room.fit` becomes `Room.aspect` (section 6.5), and `ogRoom` becomes `"pillar"`. One new data export, `titleBlock`, splits the fixation lines (section 4.2). One new manifest, `src/data/paper.ts`, lists the generated paper (section 6).
  - `places` stays an unrendered export, copy-frozen. `identity.description` keeps rendering, unchanged, in the meta description, `og:description` and `twitter:description` (see Pending 7).
- **Receipts and honesty devices.**
  - Every receipt label, word for word ("Source: UBNow", "Source: Devpost").
  - Each external receipt opens in a new tab with the screen-reader text " opens in a new tab".
  - "My part" on every Work and Project item, team names, "Did not place. The demo ran.", and asides that flag hearsay.
  - The three exceptions (`armie-honorable-mention`, `men-in-green`, `safeline-remarks`) render without a receipt.
  - The ledger: three rows, one bold, each figure an anchor to its full row.
  - "1 of 2" and "1 of 15" each appear at most twice: the hero pointer plus Recognition.
- **Section order and ids.**

  | Section | id |
  |---|---|
  | Hero | `section.hero`, no id, as in v3 |
  | Work | `#work` |
  | Projects | `#projects`, with cards `#project-<id>` |
  | Route | `#trajectory` |
  | Research | `#research` |
  | Leadership | `#leadership`, with rows `#leadership-<slug>` (new ids: the title lowercased, each run of other characters a hyphen, for example `#leadership-men-in-green`) |
  | Recognition | `#recognition`, with rows `#recognition-pillar`, `#recognition-chancellor` and `#recognition-pbk` |
  | About | `#about` |
  | Contact | `footer#contact` |

  Also `body#top` and `main#main-content`.
- **Nav labels.** Work, Projects, Research, Leadership, Recognition, About, Contact.
- **Accessibility scaffolding.**
  - The skip link and landmarks, with sections labelled by their h2.
  - `aria-current` from an IntersectionObserver.
  - The popover phone menu.
  - Width, height and alt on every image.
  - Reduced-motion handling, and `color-scheme: light dark`.
- **Bans.** Everything in v3's anti-slop list stays banned:
  - gradients, glassmorphism, bento grids, marquees, smooth-scroll libraries, magnetic or custom cursors;
  - split-text reveals, preloaders, noise overlays on the reading surface, count-up numbers;
  - "Hi, I'm" openers, emoji, "trusted by" rows, stock or generated imagery of people;
  - a second interactive hue and audio.

  v3's list also banned Three.js, WebGL, canvas and infinite animation. At Aryan's request commit `8b5fc4b` removed those test bans (decision 8). v4's motion is CSS (section 8), but a later change may use them.

  Paste-Up adds its own bans:
  - no handwriting font (the only legible handwriting is Aryan's; the production log's marks are illegible code-drawn scribble);
  - no public-domain scans;
  - no pencil or line work on marigold;
  - no text on a plate;
  - no Anthropic asset or typeface.

### Retires

- **The frame.** `Frame.astro`, the `.rooms` two-column wrapper, `timeline-scope`, the twelve `--r-<id>` view timelines and the `room-in` keyframes go. So do the `@supports (animation-timeline: view())` dissolve, the docked 21dvh phone strip and the 12 eager frame images.
- **`ChapterFigure.astro`.** It is deleted. `Print.astro` replaces it (section 7.2).
- **Newsreader.** Source Serif 4 takes every serif role.
- **The blue-black dark theme.** `#15171a` and its cool greys go. Dark mode becomes the same papers on a desk at night (section 5.1).
- **Old tokens and pieces.**
  - `--accent-text`, `--paper-3` and `--line-2`: UB blue passes AA on paper without a text variant.
  - The uppercase eyebrow labels above each h2: the plates take their place.
  - The bottom-left dark video badge.
- **The letterboxed crops** of the pencil drawing and the StreamFair stage: prints use the photo's natural aspect instead (audit bug 5).

## 4. Content

### 4.1 Facts

No fact changes. Every value in `portfolio.ts` and every caption, alt and receipt in `rooms.ts` ships as it is at commit `4d67042` (`git diff 4d67042 HEAD -- src` is empty, checked 26 October 2026). The only possible exceptions are the two colophon lines in section 4.4, which change only on Aryan's yes, and the "1 of 2" receipt once Aryan supplies a better source (section 4.5).

A copy-freeze test enforces this (section 10.2). The open sourcing question on the "1 of 2" receipt is a content item, not a design change (section 12).

### 4.2 Title block

`portfolio.ts` gains one export. It splits the existing lines and adds no words:

```ts
export type TitleRow = {
  readonly label: "Study" | "Work" | "Next";
  readonly long: readonly string[];   // sentences, desktop
  readonly short: readonly string[];  // sentences, phone
};

export const titleBlock: readonly TitleRow[] = [
  { label: "Study", long: ["B.S. Computer Science, University at Buffalo, December 2026, GPA 3.93."], short: ["CS, University at Buffalo, Dec 2026."] },
  { label: "Work", long: ["Software Engineer Intern at Linde, Summer 2026; before that Meta Layer Initiative (2025) and HCLTech, Dubai (2024)."], short: ["SWE Intern, Linde, 2026."] },
  { label: "Next", long: ["Seeking new-grad software or forward-deployed engineering roles from January 2027.", "New York City, open to relocation."], short: ["Seeking new-grad SWE roles from Jan 2027.", "NYC, open to relocation."] },
];
```

The rows render like this:

| Label | Desktop (`.long`) | Phone (`.short`) |
|---|---|---|
| Study | B.S. Computer Science, University at Buffalo, December 2026, GPA 3.93. | CS, University at Buffalo, Dec 2026. |
| Work | Software Engineer Intern at Linde, Summer 2026; before that Meta Layer Initiative (2025) and HCLTech, Dubai (2024). | SWE Intern, Linde, 2026. |
| Next | Seeking new-grad software or forward-deployed engineering roles from January 2027. New York City, open to relocation. | Seeking new-grad SWE roles from Jan 2027. NYC, open to relocation. |

The join, checked against the data on 26 October 2026 (both `true`):

```ts
titleBlock.flatMap((row) => row.long).join(" ")  === identity.fixationLine       // 304 characters
titleBlock.flatMap((row) => row.short).join(" ") === identity.fixationLineShort  // 128 characters
```

Within Next, only the first sentence sits on the sky tape. "New York City, open to relocation." and "NYC, open to relocation." stay on paper. That sentence says where Aryan wants to work, and no label says where they live (they are in Buffalo until December 2026).

### 4.3 Room ownership

Every room renders exactly once, as a print (`figure.print[data-room]`), inside its owning section and beside the claim it proves. Each room print opens its own popover (`#photo-<id>`). The popover holds the uncropped photo, the caption, the receipt and that room's extras.

| Room | Owning section and element | Beside the claim | Caption and receipt |
|---|---|---|---|
| `pillar` | Hero, `div.hero-art` print, 4:5 | Ledger row "1 of 2", Award for Innovative Student Leadership | `rooms.ts` pillar caption; Source: UB Student Life |
| `hero` (LA Hacks demo) | Projects, `#project-dots`, second margin print | "1st, Catalyst for Care track. 3rd, Agentverse track." | `rooms.ts` hero caption; Source: Devpost |
| `dots` | Projects, `#project-dots`, first margin print | the Dots result | `rooms.ts`; Source: Devpost |
| `armie` | Projects, `#project-armie` margin | "Honorable mention." and the build | `rooms.ts`; Source: Devpost |
| `streamfair` | Projects, `#project-streamfair` margin, natural aspect | "1st, Ripple track." | `rooms.ts`; Source: GitHub |
| `wod` | Projects, `#project-wod` margin | "1st, Best Creation on Moonlake." | `rooms.ts`; Source: Devpost |
| `safeline` | Projects, `#project-safeline` margin | "Did not place. The demo ran." | `rooms.ts`; Source: GitHub |
| `research` | Research row margin | the DE-C3 research item | `rooms.ts`; Source: Resume |
| `cleancampus` | Leadership, Clean Campus row margin | the Clean Campus summary | `rooms.ts`; Source: The Spectrum |
| `chancellor` | Recognition, `#recognition-chancellor` margin | "1 of 15", SUNY Chancellor's Award | `rooms.ts`; Source: SUNY |
| `pbk` | Recognition, `#recognition-pbk` margin | "Top 10%", Phi Beta Kappa | `rooms.ts`; Source: UB Arts and Sciences |
| `contact` | Contact, footer sheet, natural aspect | "Every claim above has a link" and the colophon line "The last one is pencil." | `rooms.ts`; Source: Drawn by Aryan (to `#about`), as in v3 |

The 8 extras:

| Extra | Popover | Also inline? |
|---|---|---|
| `dots-pitch` | `#photo-dots` | no |
| `dots-booth` | `#photo-dots` | no |
| `armie-team` | `#photo-armie` | no |
| `streamfair-team` | `#photo-streamfair` | no |
| `wod-team` | `#photo-wod` | no |
| `safeline-portal` | `#photo-safeline` | no |
| `chancellor-ub` | `#photo-chancellor` | no |
| `pillar-pair` | `#photo-pillar` (opened from the hero print) | **yes**: Recognition's pillar row print, `figure.print[data-extra="pillar-pair"]`. Caption word for word: "With Shaurya Jain, who received the Exemplary Student Leader Award the same evening." No receipt link: the UB Student Life page does not name Shaurya Jain (checked 26 October 2026). The row's own stub is the award's receipt, and its sourcing is pending (section 4.5). The figure has no button, because the hero print already opens its popover. Image source `src/assets/full/pillar-pair.jpg` (section 6.5). |

**Decorative crops** (aria-hidden, listed in the paper manifest, not rooms):

- the handwriting scrap, from the `contact` source drawing;
- the LA Hacks arena duotone, from the `hero` source, seats only (crop checked at full size on 26 October 2026, section 6.4);
- the Clean Campus duotone, from the `cleancampus` source, trees and buildings only, no faces;
- the OG image, from the source of the room named by `ogRoom` (`pillar`).

The arena strip on the Projects plate and the `hero` print in the Dots card come from one photo. The strip shows only empty seats, so the print stays the only place Aryan's face from that shot appears.

### 4.4 New copy

Aryan reads this table during spec review. Nothing else on the page is new. These existing v3 strings are kept as they are and are not new:

- "Email Aryan" and "Resume (PDF)";
- "Source: ..." (including "Source: Drawn by Aryan" in the footer), and "Open full photo" as part of a changed accessible name (row 8);
- "Close", "Menu" and "Skip to content";
- "Plays when in view" and "Open the video file";
- the " opens in a new tab" strings and "Three proofs";
- the Projects lede, the 404 strings and "Team: ...".

The frame's label "Photographs from the events on this page" and the section eyebrows retire.

| # | Where | Text | Kind | Default |
|---|---|---|---|---|
| 1 | Title block, row 1 label | Study | UI label, new | ships |
| 2 | Title block, row 2 label | Work | UI label, new | ships |
| 3 | Title block, row 3 label | Next | UI label, new | ships |
| 4 | Run-in label on Work and Project items | My part. | UI label, punctuation changed from "My part:" (the mock's run-in style) | ships |
| 5 | Note under the Research plate | An illustration, not study data. Drawn in code. | Label for a drawing | Ships only with the cell-field illustration. If Aryan declines either, both go (section 12, Pending 6). |
| 6 | `colophon.type` | Set in Source Serif 4 and Instrument Sans. | Replaces "Set in Newsreader and Instrument Sans.", which decision 6 makes false | Held at the v3 string until Aryan answers at milestone 0; ships only on Aryan's yes. |
| 7 | `colophon.version` | v4, {merge month} 2026. v3 (September 2026) dissolved its photos as you scrolled. v2 (July 2026) was a plain page. v1 (June 2026) had a projector and a mini-golf game. | Replaces "v3, September 2026. v2 (July 2026) was a plain page. v1 (June 2026) had a projector and a mini-golf game." | Held at the v3 string until Aryan answers at milestone 0; ships only on Aryan's yes. {merge month} is the month the branch merges to main, written in at milestone 7. |
| 8 | Room print button, accessible name | {alt} Open full photo | UI label, changed from v3's `aria-label` "Open full photo: {caption}" | ships |

Rows 6 and 7 are not UI labels, so decision 7 does not cover them. They exist only because shipping v4 makes the current sentences untrue. The colophon commit lands in milestone 6, after Aryan's answer. If Aryan declines row 6, Aryan picks the replacement (another wording, or no type line); the v3 type line, false once Newsreader is gone, is not merged to main. Rows 6 and 7 are the only `portfolio.ts` strings the copy-freeze test lets differ without a fixture change (section 10.2).

### 4.5 Pending content item

**The "1 of 2" receipt.** The receipt "Source: UB Student Life" points at the Pillars of Leadership page (`source.ubLeadershipAwards` in `portfolio.ts`, a module-private constant, and the pillar receipt in `rooms.ts`). It renders in four places:

- on ledger row "1 of 2" (`ledger[0].receipt`);
- on the hero print caption (the `rooms.ts` pillar receipt);
- in the `#photo-pillar` popover (the same `rooms.ts` receipt);
- on the Recognition pillar stub (the pillar recognition's `receipts[0]`).

When checked on 26 October 2026, that page did not name Aryan, the Innovative Student Leadership award or the 130+ nominations. Aryan should supply a page that does. This spec does not invent one, and the link ships unchanged until a replacement arrives. When one arrives, `source.ubLeadershipAwards` (label and href), the `rooms.ts` pillar receipt and `tests/fixtures/copy-v3.json` change in one commit that names Aryan's approval. A test keeps `ledger[0].receipt`, the pillar recognition's `receipts[0]` and the `rooms.ts` pillar receipt equal in label and href (section 10.2).

## 5. Visual system

### 5.1 Tokens

All tokens live in `src/styles/global.css`.

- Theme tokens are declared in `:root` and redeclared once in `@media (prefers-color-scheme: dark) { :root { ... } }`.
- The production site has no theme toggle and no `data-theme`. The mock's pill and `?theme=` script do not ship.
- Hex literals may appear only in those two blocks, in `.slab` (section 7.10) and in the `@media print` block (section 5.6). A test enforces this (section 10.2).

**Theme tokens**

| Token | Light | Dark | Role |
|---|---|---|---|
| `--paper` | #FBF8F2 | #161512 | page, sheet, stub fill, popovers |
| `--paper-2` | #F3EDE1 | #201E1A | the plain video mat |
| `--ink` | #1B1A17 | #F2EDE3 | text, rules, nav bar, stub borders, menu border |
| `--ink-2` | #45413A | #CFC8BA | lede, denominators, asides, role lines, index results |
| `--muted` | #635E55 | #A39C8E | meta, captions, About ticks, the aside bracket |
| `--line` | #DDD5C6 | #3A362F | hairlines between rows (decorative only) |
| `--accent` | #005BBB | #7DB0FF | UB blue: links, the Email button, focus |
| `--on-accent` | #FFFFFF | #0B1220 | Email button text, selection text |
| `--slab` | #1B1A17 | #25231F | the footer slab |
| `--lift` | rgba(27,26,23,.26) | rgba(0,0,0,.6) | near shadow of pieces and prints |
| `--lift-far` | rgba(27,26,23,.12) | rgba(0,0,0,.35) | far shadow |

**Fixed tokens** (paper, so the same in both themes)

| Token | Value | Role |
|---|---|---|
| `--on-stock` | #1B1A17 | text on a stock, the "1 of 2" figure, the play glyph, badge text, the backing behind a video player |
| `--fibre` | #FFFDF6 | fibre fringe, scraps, print borders, Braille dots, badge, focus halo, the footer sheet |
| `--pencil` | #2B2925 | pencil art and the handwriting crop |
| `--tape` | #E9DDC2 | masking tape, at 90% opacity |
| `--graph-line` | #A9C7E0 | graph tile lines on the About scrap |
| `--on-slab` | `var(--fibre)` | text on the slab |
| `--on-slab-muted` | #CFC8BA | colophon and caption on the slab |
| `--stock-marigold` | #F2A516 | see 5.2 |
| `--stock-vermilion` | #EC5B3B | see 5.2 |
| `--stock-sky` | #9CC8EE | see 5.2 |
| `--stock-leaf` | #2F9E5B | see 5.2 |
| `--stock-kraft` | #D6BC92 | see 5.2 |
| `--stock-ub` | #005BBB | see 5.2 |

**The slab.** The footer is a dark sheet in both themes. Inside it, `.slab { --accent: #7DB0FF; --on-accent: #0B1220; }` reuses the dark-theme accent. This replaces the mock's `--slab-link: #9CC8EE`, which reused the sky stock hex. There is still one interactive hue; every `--accent:` declaration is #005BBB or #7DB0FF. Light `--accent` and `--stock-ub` share #005BBB on purpose; the hex test allows exactly that one repeat (section 10.2).

**Fonts and grain** are also declared in `:root`:

```css
--serif: "Source Serif 4", "Source Serif 4 Fallback", "Source Serif 4 Fallback Noto", Georgia, serif;
--sans: "Instrument Sans", "Instrument Sans Fallback", "Instrument Sans Fallback Roboto", system-ui, sans-serif;
--grain: url(../assets/paper/grain.svg);
```

The four fallback faces are defined in section 5.3. A family whose `local()` source is missing on a device is skipped, so each platform lands on the first metric-matched face it has.

**Contrast.** WCAG 2.x ratios, computed from these hex values on 26 October 2026. The "worst grain" column darkens the stock by the grain's maximum multiply (factor 0.874), the darkest speck that text can land on.

| Text or mark | On | Light | Dark |
|---|---|---|---|
| `--ink` | `--paper` | 16.42 | 15.65 |
| `--ink` | `--paper-2` | 14.93 | 14.26 |
| `--ink-2` | `--paper` | 9.57 | 10.98 |
| `--ink-2` | `--paper-2` | 8.70 | 10.00 |
| `--muted` | `--paper` | 6.07 | 6.70 |
| `--muted` | `--paper-2` | 5.52 | 6.10 |
| `--accent` (links, stubs) | `--paper` | 6.16 | 8.28 |
| `--accent` | `--paper-2` (the plain video mat) | 5.60 | 7.55 |
| `--on-accent` | `--accent` (Email button, selection) | 6.53 | 8.49 |
| `--on-slab` | `--slab` | 17.10 | 15.41 |
| `--on-slab-muted` | `--slab` | 10.46 | 9.43 |
| slab `--accent` #7DB0FF | `--slab` | 7.89 | 7.12 |
| `--on-stock` | `--fibre` (video badge) | 17.10 | 17.10 |

| Text on a stock (both themes) | Nominal | Worst grain | Used for text? |
|---|---|---|---|
| `--on-stock` on marigold | 8.43 | 6.46 | yes: "1 of 2" tape, result tapes |
| `--on-stock` on sky | 9.87 | 7.53 | yes: the Next tape |
| `--on-stock` on kraft | 9.50 | 7.24 | no |
| `--on-stock` on vermilion | 5.08 | 4.00 | never (fails AA under grain) |
| `--on-stock` on leaf | 5.11 | 4.02 | never (fails AA under grain) |
| `--on-stock` on UB blue | 2.66 | 2.22 | never |
| `--accent` on marigold | 3.16 | | never: links never sit on a stock |

**Non-text contrast.**

| Element | Ratio |
|---|---|
| Focus ring (`--accent` vs `--paper`) | 6.16 light, 8.28 dark |
| Focus on the "1 of 2" tape: ink outline vs marigold | 8.43 |
| Same: ink outline vs its fibre halo | 17.10 |
| Same: fibre halo vs dark paper | 17.94 |
| Nav current bar and stub borders (ink vs paper) | 16.42 light, 15.65 dark |
| Pencil on fibre (decorative) | 14.26 |
| Pencil on kraft (decorative) | 7.93 |
| Pencil on sky (decorative) | 8.23 |

`--line` hairlines measure 1.38 light and 1.52 dark. They are decorative, and no control relies on them: interactive borders use `--ink`.

### 5.2 The six stocks

Stocks are paper. They never change between themes, never colour text, outlines, underlines, strokes or shadows, and appear only as `background-color` (with the grain layered on top). Text on a stock is always `var(--on-stock)`.

| Stock | Exactly these jobs (selectors) | Notes |
|---|---|---|
| Marigold | the "1 of 2" tape (`.fig--tape::before`); the five result tapes (`.hl--marigold`); the Recognition plate (`.plate--recognition`) | No pencil or line art ever sits on marigold, so nothing echoes the Opus construction-line strip. |
| Sky | the hero collage block (`.p-sky`); the Next tape (`.hl--sky`); the Work plate (`.plate--work`) | |
| Leaf | the Braille strip (`.p-braille`); the Leadership plate and its duotone box (`.plate--leadership`, `.plate--leadership .duo`) | |
| Kraft | the plan scrap (`.p-plan`); the Route plate (`.plate--route`); the About plate (`.plate--about`) | Tapes are not kraft: they use `--tape`. |
| Vermilion | the Projects plate and its duotone box (`.plate--projects`, `.plate--projects .duo`); the demo mats (`.video--demo .video__mat`); print tapes inside `#projects` (`.tape--vermilion`) | |
| UB blue | the Research plate (`.plate--research`); the Recognition ribbon band (`.plate__band`) | |

Pencil and line art may sit only on fibre, kraft or sky (pencil), on paper (the About ticks and the aside bracket, in `--muted`) or on UB blue (fibre lines of the cell field). The ceremony video in Recognition uses the plain mat (`--paper-2` with a 1px `--line` border), not a stock.

**Two kinds of tape, two class names.** `.tape` is always decoration: an empty element, `aria-hidden`, hidden in print. The text tapes that carry facts (the Next sentence and the five results) are `span.hl--sky` and `span.hl--marigold`, a separate block. An `.hl--*` element never carries the class `tape` or `aria-hidden`, and a build test checks it (section 10.2). They are `span`, not `mark`, because screen readers announce `mark` as "highlight", and the tape is decoration, not emphasis.

### 5.3 Type

The Google Fonts link replaces v3's in `BaseLayout.astro`. The preconnects stay.

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,20,400&display=swap" />
```

- Source Serif 4 is loaded roman with the optical size axis (8 to 60) and weights 400 to 700. Italic is loaded at weight 400 and a fixed optical size of 20, for asides (18px) and denominators (22px).
- Instrument Sans is loaded at weights 400 to 700, roman only.
- Measured on 26 October 2026 (latin woff2, Chrome user agent, HEAD requests to fonts.gstatic.com): Instrument Sans 29,904 B, Source Serif 4 roman 122,168 B, italic at opsz 20 19,664 B. Total 171,736 B. The italic with the full opsz range would cost 50,560 B, and narrowing the roman weights saves nothing, because Google serves the same file for 400 to 600 and 400 to 700.
- `body` sets `font: 400 18px/28px var(--serif); font-optical-sizing: auto; font-variant-numeric: tabular-nums lining-nums`.
- **Fallback faces,** so the swap does not move the first screen. Each has its own `size-adjust`, `ascent-override` and `descent-override`, measured at milestone 1:
  - `"Source Serif 4 Fallback"`: `src: local("Georgia")` (Apple and Windows);
  - `"Source Serif 4 Fallback Noto"`: `src: local("Noto Serif")` (Android, which has no Georgia);
  - `"Instrument Sans Fallback"`: `src: local("Arial"), local("Helvetica")`;
  - `"Instrument Sans Fallback Roboto"`: `src: local("Roboto")`.

  The ledger claims, labels, stubs and buttons are sans, and the ledger sets where the actions sit, so the sans fallback matters as much as the serif one. Milestone 1 measures CLS with the font requests blocked.

**Type scale**

| Role | Face and weight | Desktop size/line | Phone (below 48rem) | Notes |
|---|---|---|---|---|
| Nav name | serif 600 | 20/24 | 18/22 | -0.005em |
| Nav links | sans 400 | 15/20 | menu items sans 500 16/20 | current item 600 with a 3px ink bar; bold width reserved so neighbours do not shift |
| h1 | serif 600 | 72/72 | 40/44 | opsz 60, -0.02em |
| Title-block label (`dt`) | sans 600, uppercase, 0.1em, `--muted` | 11.5/16 | 11/14 | |
| Title-block value (`dd`) | serif 400 | 17/25 | 15/21 | |
| Ledger figure | serif 600, nowrap | 34/40 | 22/26 | opsz 40, -0.01em; 28/34 between 64rem and 68.75rem |
| Ledger claim | sans 400, bold row 600 | 16/22 | 15/21 | |
| Email button | sans 600 | 16/20, 48px tall | same | |
| Resume stub | sans 600 | 15/20, 48px tall | same | |
| Row stub | sans 500 | 13/18, 30px tall | same | |
| h2 | serif 400 | 44/50 | 30/34 | opsz 48, -0.012em, max-width 900px, `text-wrap: balance` |
| h3 | serif 600 | 26/32 | 22/28 | opsz 32, -0.008em |
| Work outcome h3, Research title | serif 600 | 24/32 | 21/28 | |
| Meta lead (company) | serif 600 | 22/28 | 20/26 | |
| Meta lead (Leadership title, Research role) | serif 600 | 20/26 | 19/25 | |
| Meta lines | sans 400, `--muted` (role `--ink-2`) | 14/20 | same | |
| Body | serif 400 | 18/28 | 17/26 | |
| Projects lede, Research summary | serif 400, `--ink-2` | 20/30 | 18/27 | |
| Index name | serif 600 | 18/26 | 17/26 | |
| Index result | serif 400, `--ink-2` | 17/26 | 16/24 | |
| Project result (on tape) | serif 600 | 18/26 | 17/24 | |
| Aside | serif italic 400, `--ink-2` | 18/28 | 17/26 | |
| Captions | sans 400, `--muted` | 13/19 | same | |
| Video badge | sans 600 | 12/16 | same | |
| Route period | sans 400, `--muted` | 15/22 | 14/20 | |
| Route title | serif 400 | 18/28 | 17/26 | |
| Recognition figure | serif 600 | 64/64 | 44/44 | opsz 60, -0.02em |
| Recognition denominator | serif italic 400, `--ink-2` | 22/30 | 18/26 | |
| About lines | serif 400 | 22/32 | 19/28 | |
| Footer email | serif 400 | 34/44 | 22/30 | opsz 40; 26/34 between 64rem and 68.75rem |
| Footer links | sans 500 | 16/22 | same | |
| Colophon | sans 400, `--on-slab-muted` | 13/19 | same | |
| 404 h1 | serif 600 | 56/60 | 40/44 | |

### 5.4 Spacing and grid

**Scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96 px.

**Container.**

- `.shell`: `max-width: 1280px; margin-inline: auto;`.
- Padding is 48px from 68.75rem up, 32px from 48rem to 68.74rem, and 16px below 48rem.
- That gives a content width of 1184px at 1280.

**Grids** (desktop):

| Grid | Columns | Gaps |
|---|---|---|
| Hero | `672px 464px` | `column-gap: 48px` (never the `gap` shorthand on any `.hero*` rule) |
| Row (Work) | `200px 600px` | `column-gap: 40px` |
| Route row, inside an 840px list | `200px 1fr` | `column-gap: 40px` |
| Card (Projects, Research, Leadership, Recognition) | `200px 600px 304px` | `column-gap: 40px` |

Every grid uses `align-content: start` and `align-items: start` (audit bug 1).

**Section rhythm:**

| Step | Desktop | Phone |
|---|---|---|
| Section `padding-top` | 96px | 72px |
| Plate height | 112px | 72px |
| Gap from plate to h2 | 40px | 28px |
| h2 to first row | 48px | 32px |
| Between rows | 48px, then a 1px `--line` rule, then 48px (Projects and Recognition cards use 64px; Leadership rows use 32px, section 7.9) | 32px (Projects and Recognition cards 48px; Leadership 32px) |

The mock used 32px from plate to h2. It grows to 40 because plate pieces now overhang the plate's bottom edge by up to 16px.

**Breakpoints:**

| Range | Changes |
|---|---|
| 80rem and up (1280px) | the full desktop grids |
| 73rem to 79.99rem | hero `minmax(0, 1fr) 464px`; card `200px minmax(0, 1fr) 260px` |
| 68.75rem to 72.99rem | hero `minmax(0, 1fr) 360px` with `column-gap: 40px` and `div.hero-art { zoom: .776 }`; card `200px minmax(0, 1fr) 260px` |
| 64rem to 68.74rem | 32px gutters; hero as in the tier above; ledger figure column 136px; rows and cards `180px minmax(0, 1fr)`, with margin prints moving under the body in column 2 at max-width 304px |
| `@media (max-width: 63.99rem)` | the nav collapses to Menu; the hero is one column, with `div.hero-art` centred at full size after the actions (margin-top 48px); rows and cards as in the tier above; the footer is one column |
| below 48rem (`max-width: 47.99rem`) | phone (sections 5.3, 7.1); everything one column |
| 24.37rem and below (389.9px) | `div.hero-art { zoom: .915 }` |
| 22.49rem and below (359.8px) | `div.hero-art { zoom: .8 }` |

`@media (min-width: 64rem)` holds the two-column hero. The mock kept the inline nav and a two-column hero down to 900px. This spec moves both to 64rem, and the v3 breakpoints stay. The mock was never reviewed between 900 and 1023.

**The facts column stays at least 560px wide** wherever the hero has two columns: 560px at 1024 (1024 minus 64 gutters, 40 gap and 360 art), 604px at 1100, 560px at 1168 (1168 minus 96, 48 and 464) and 672px at 1280.

**The phone zoom tiers** keep the 358px `div.hero-art` inside the content width (the viewport minus 32px): at zoom 1 it fits from 390px, at .915 (327.6px) from 360px, and at .8 (286.4px) from 319px.

### 5.5 Grain

Grain is one tile, `src/assets/paper/grain.svg`, 160x160:

- `feTurbulence type="fractalNoise" baseFrequency=".62" numOctaves="2" seed="5" stitchTiles="stitch"` (our own frequency, not Anthropic's .9);
- then `feColorMatrix values="0 0 0 0 .1  0 0 0 0 .08  0 0 0 0 .06  0 0 0 .14 0"`.

It is applied only as a `background-image` layer over a stock or fibre `background-color`, with `background-blend-mode: multiply` and `background-size: 160px`. It lives on stocks, scraps, tapes and the footer sheet. Never on `body`, never on `--paper` and never behind text, with three exceptions: the "1 of 2" tape and the `.hl--sky` and `.hl--marigold` text tapes. Their worst-case contrast is in 5.1.

### 5.6 Print stylesheet

`@media print` turns the page into a sourced resume:

- **Hidden:** the nav, Menu and skip link, `[popover]`, `.collage`, `.plate`, `.plate-note`, `.tape`, every `.print`, every `.video`, and the footer tear and sheet.
- **Page:** `body { background: #fff; color: #000; font: 10.5pt/1.4 var(--serif); }`.
- **Stocks and slab:** stock backgrounds and grain are removed, so the `.hl--*` text tapes and the "1 of 2" figure print as plain text. The slab prints as white with black text.
- **Hrefs:** `.source[href^="http"]::after`, `.stub[href^="http"]::after`, `.contact-link::after` and `.profiles a[href^="http"]::after` print `" (" attr(href) ")"` at 0.8em in #444.
- **Title block:** a Letter or A4 page lays out at about 720 to 740 CSS px, below 48rem, so print restates `.tb__long { display: inline } .tb__short { display: none }`. The resume prints the full sentences.
- **Structure:** the title block and ledger keep their rules. `.row`, `.card` and `.award` use `break-inside: avoid`.
- **Hex:** the print colours (#fff, #000, #444) are the only hex literals outside the two `:root` blocks and `.slab`, and the hex test allows them inside `@media print` (section 10.2).

### 5.7 The 404 page

`src/pages/404.astro` keeps its strings ("404", "Page not found", "The link may have moved. The portfolio is one page, and it is right here.", "Return home") and its `siteBaseUrl` link.

- **Layout:** `main.not-found.shell` with `padding-block: 96px`. The label "404" uses the title-block label style. The h1 is 56/60 (phone 40/44). The paragraph is body type, and "Return home" uses the Email button style.
- **Decoration:** one static kraft plan scrap (the hero's `.p-plan`, outside any `.collage`, so it never animates), `aria-hidden`, absolutely placed at the right from 48rem up and hidden below.

### 5.8 The OG image

`public/og.jpg`, 1200x630, JPEG quality 82, at most 120 KB. `scripts/paper.mjs` generates it (job `og`) by rendering an SVG composition with sharp. librsvg does not load file hrefs from an SVG passed as a buffer, so the job embeds the pillar crop and `hand.png` as base64 `data:` URIs inside the composition SVG.

- **Ground:** `--paper` light.
- **Pieces, in z-order:**

  | Piece | Size | Position (top left) | Rotation |
  |---|---|---|---|
  | Torn sky block | 620x520 | (330, 79) | -1deg |
  | Leaf Braille strip | 64x320 | (300, 274) | 0.5deg |
  | Pillar print, 4:5, 10px fibre border (image 360x450) | 380x470 | (420, 104) | 1.2deg |
  | Kraft plan scrap | 144x124 | (760, 480) | -2deg |
  | Handwriting scrap, art box 113x110 at (21, 6) as in the hero | 156x120 | (628, 22) | 2deg |

- **The face and the arrow.** The face centre lands at about (612, 218): 50% across and 23% down the 360x450 image, moved 2.5px by the print's tilt. By calculation from the hero geometry (7.1), the arrow's extended line passes through it and the tip stops 100px short. The scrap stays inside the canvas and clear of the head box (x 559 to 665, y 141 to 280). Milestone 6 checks that the arrow line passes within 16px of the face centre.
- **No text.** The card's `og:title` carries the name. The face sits inside every platform's centre crop.
- **Data:** `ogRoom` becomes `"pillar"`, and the `og` job reads its photo from `rooms.find((r) => r.id === ogRoom).source`, so `ogRoom` stays meaningful. `crop-rooms.mjs` stops writing `og.jpg`.
- **Checks at milestone 6:** a visual check of `og.jpg`, and a pixel check that the image is not blank at the face position (a photo, not the ground colour).
- **Head tags:** `og:image:width` and `og:image:height` stay 1200 and 630. JSON-LD `image` keeps pointing at `og.jpg`.

`theme-color` metas become #FBF8F2 (light) and #161512 (dark).

## 6. Materials and the asset pipeline

### 6.1 Principles

1. **Everything is generated once, seeded, and committed.** Nothing is drawn at runtime: no rough.js, no canvas, no client SVG generation.
2. **Shapes are colour-free.** Every torn edge, tape, scrap and pencil drawing ships as a monochrome SVG (or alpha PNG) used as a CSS `mask-image`. Its colour comes from a token through `background-color: var(--...)`. A token change recolours everything with no regeneration.
3. **The two text tapes (`.hl--sky`, `.hl--marigold`) are the one exception** (section 6.6). They need coloured end caps, and `scripts/paper.mjs` writes those colours from the tokens in `global.css`. No person types a stock hex anywhere except its `:root` declaration.
4. **No inline torn paths in HTML.** The mock carried about 175 KB of inline `<svg>`. The build ships none of it inline: built `index.html` carries at most 1,024 bytes of inline SVG (section 10.2).

### 6.2 The generator

`scripts/paper.mjs` ports the mock's `tools/art.mjs`, `tools/drawings.mjs` and `tools/images.mjs`, with input paths fixed to the repo.

**Layout:**

| File | Contents |
|---|---|
| `scripts/paper.mjs` | CLI: `node scripts/paper.mjs [--code-only] [--check]` |
| `scripts/paper/art.mjs` | `rng`, `noise1`, `fbm1`, `toD`, `paper`, `tape`, `pline`, `pstroke`, `scribble`, `tick` (from the mock), plus new `edgeStrip` (a periodic torn edge: both ends at the same depth, cross-faded over the last 60px, so it tiles with `repeat-x`), `tapeEnd` (one torn tape end), `ribbonBand` (the band with its notched foot), `solidMask` and `playGlyph` |
| `scripts/paper/drawings.mjs` | `floorPlan`, `productionLog`, `braille`, `aboutTick` (from the mock), plus new `route`, `cellField`, `bracket`, `graphTile` and `grainTile` |
| `scripts/paper/images.mjs` | `pencilAlpha`, `duotone`, `og` (sharp) |
| `scripts/paper/svg.mjs` | document writers: `maskDoc`, `pencilDoc` (adds the graphite filter), `colourDoc` |

**Job list.** The generator reads `src/data/paper.ts`, writes each listed file, and refuses to write a file the manifest does not list.

**Tokens.** It reads token values from the first `:root { ... }` block of `src/styles/global.css` with a regex.

**Inputs from Aryan's own material** come from `Pictures/` (untracked), so jobs with `source: "aryan"` run only on Aryan's machine. Like `npm run rooms`, they run by hand and their outputs are committed. `--code-only` skips them.

**Package changes.**

- `package.json` gains `"perfect-freehand": "1.2.2"` in `devDependencies`, pinned exactly: the mock's art was generated with 1.2.2, 1.2.3 exists, and byte-for-byte determinism depends on the exact version. That is the only new package: the mock's `roughjs` and `simplex-noise` were installed but never imported. There is still no `dependencies` key.
- New scripts: `"paper": "node scripts/paper.mjs"`, and `tests/paper.test.mjs` added to `test`.
- `version` becomes `"4.0.0"`.

**Formats.**

- `maskDoc` writes `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 W H" preserveAspectRatio="none"><path d="..."/></svg>`: default black fill, no colour literal.
- `pencilDoc` adds the mock's graphite filter (`feTurbulence baseFrequency="1.1" numOctaves="2" seed="4"`, alpha matrix `0 0 0 -2.2 2.0`, `feComposite operator="in"`) inside the file. The mask's alpha carries the graphite texture.
- Paths use the mock's `toD` (relative commands, one decimal) and Ramer-Douglas-Peucker simplification. `eps` is a per-job manifest field, 0.1 by default (0.15 for the production log).

**Determinism.**

- The same seed gives the same bytes on Node 24.
- `--check` regenerates every `source: "code"` file in memory and compares bytes with the committed file.
- `tests/paper.test.mjs` runs the same comparison in `npm test`, so CI catches a hand-edited or stale asset.

### 6.3 The provenance manifest

`src/data/paper.ts` is hand-authored and is the job list:

```ts
export type PaperAsset = {
  readonly file: string;                 // path under src/assets/paper/, or "public/og.jpg"
  readonly kind: "mask" | "pencil" | "line" | "colour" | "raster";
  readonly source: "code" | "aryan";
  readonly generator: string;            // exported function in scripts/paper/*.mjs, named in 6.4
  readonly seed?: number;                // required when source is "code"; 0 for the deterministic generators (solidMask, playGlyph, graphTile)
  readonly eps?: number;                 // RDP tolerance, default 0.1
  readonly size: readonly [number, number];
  readonly from?: { readonly path: string; readonly region?: readonly [number, number, number, number] }; // required when source is "aryan"; path under Pictures/
  readonly tokens?: readonly string[];   // required when kind is "colour" (grain.svg has []): the tokens written in
  readonly budget: number;               // bytes, raw
};
export const paperAssets: readonly PaperAsset[] = [ /* the rows of 6.4 */ ];
```

**Kinds.** `mask`: torn shapes, tapes, edge strips, `solid.svg`, `play.svg`. `pencil`: the floor plan, the production log, the route. `line`: the ticks, the bracket, `graph.tile.svg`, the cell field. `colour`: `grain.svg`, `braille.dots.svg`, the four text-tape end caps. `raster`: `hand.png`, `arena.jpg`, `cleancampus.jpg`, `og.jpg` (outside the mask and pencil totals).

**Colour literals in generated files** are 6-digit hex, each equal to a listed token's value. Opacity goes in `fill-opacity` or `stop-opacity`, never `rgba()`, so the drift check can compare hex to hex.

### 6.4 Every generated asset

All files live under `src/assets/paper/` unless noted. Seeds follow the mock where it set them. Every row names its generator. Budgets are raw bytes. Every file with a budget of 1,000 B or less inlines into the CSS (Totals, below).

**Masks** (`kind: "mask"`, colour-free, budget 4,000 B each unless noted)

| File | Size | Seed | Generator | Used by |
|---|---|---|---|---|
| `sky.outer.svg`, `sky.inner.svg` | 416x496 | 11 | `paper` | `.p-sky` desktop (fibre fringe, sky face) |
| `sky-sm.outer.svg`, `sky-sm.inner.svg` | 300x320 | 12 | `paper` | `.p-sky` phone |
| `braille.outer.svg`, `braille.inner.svg` | 64x320, torn top and bottom | 23 | `paper` | `.p-braille` (also 48x240 on phone, a uniform 0.75 scale) |
| `plan.outer.svg`, `plan.inner.svg` | 144x124 | 37 | `paper` | `.p-plan` (also 104x90 on phone) |
| `hand.outer.svg` | 156x120 | 41 | `paper` | the handwriting scrap (fibre only) |
| `log.outer.svg` | 248x114 | 43 | `paper` | the Work plate scrap (fibre only) |
| `graph.outer.svg` | 248x112 | 47 | `paper` | the About plate scrap (fibre only) |
| `band.outer.svg`, `band.inner.svg` | 48x150, notched foot | 49 | `ribbonBand` | the Recognition ribbon band |
| `edge-top.outer.svg`, `edge-top.inner.svg`, `edge-bottom.outer.svg`, `edge-bottom.inner.svg` | 1200x16, periodic | 51, 52, 53, 54 | `edgeStrip` | every plate and the footer tear, tiled with `repeat-x`; budget 8,000 B each |
| `solid.svg` | 1x1 | 0 | `solidMask` | the middle layer of the plate and "1 of 2" tape masks (gradients stay banned); budget 200 B |
| `tape-a.svg` | 88x26 | 61 | `tape` | print tapes; budget 600 B |
| `tape-b.svg` | 64x20 | 63 | `tape` | scrap tapes; budget 600 B |
| `tape-c.svg` | 80x22 | 65 | `tape` | margin print tapes; budget 600 B |
| `tape-fig-l.svg`, `tape-fig-r.svg` | 12x46 | 67, 68 | `tapeEnd` | the two torn ends of the "1 of 2" tape (section 7.1); budget 500 B each |
| `play.svg` | 20x22 | 0 | `playGlyph` | the video play glyph; budget 300 B |

**Pencil and line drawings** (alpha masks, all drawn in code)

| File | Kind | Size | Seed | Generator | Colour (CSS) | Sits on | Budget |
|---|---|---|---|---|---|---|---|
| `plan.pencil.svg`, the floor plan of Dots (mock geometry: walls with a door gap, swing, interior wall, table, dimension line, tactile dots) | pencil | 180x140 | 1000 | `floorPlan` | `--pencil` | kraft | 14 KB |
| `log.pencil.svg`, a paper production log of the kind the Linde app replaced (printed form, illegible scribble, three ticks) | pencil | 200x92 | 2000 | `productionLog`, `eps` 0.15 | `--pencil` | fibre | 16 KB (the mock's inline version was 70 KB: fewer scribble letters, coarser simplification) |
| `route.pencil.svg` and `route-sm.pencil.svg`, Pune to Buffalo to New York City | pencil | 1184x112 and 358x72 | 3000, 3100 | `route` | `--pencil` | kraft | 12 KB and 8 KB |
| `tick-1.svg` to `tick-5.svg`, About ticks (mock `aboutTick`) | line | 20x16 | 4001 to 4005 | `aboutTick` | `--muted` | paper | 1,000 B each |
| `bracket.svg`, the aside bracket (mock path, perfect-freehand outline) | line | 12x100 | 4100 | `bracket` | `--muted` | paper | 1,000 B |
| `graph.tile.svg`, minor lines at alpha .55, major at 1 (mock geometry) | line | 60x60 | 0 | `graphTile` | `--graph-line` | fibre | 1,000 B |
| `cells.svg` and `cells-sm.svg`, the cell field | line | 744x112 and 358x72 | 5000, 5100 | `cellField` | `--fibre` at 85% | UB blue | 16 KB and 8 KB |

The route drawing is one solid pencil arc from a pressed stop at x 72 (Pune) to a pressed stop at x 860 (Buffalo). A dashed pencil leg follows to an open stop at x 1112 (New York City), over a faint straight construction line. It has no labels and no scale. Solid means done and dashed means planned, matching route rows 1 to 12 and row 13.

The cell field is about 110 Poisson-disc cells, each a wobbly freehand ellipse 10 to 16px across. About one in ten is filled at alpha .5. It is captioned by the plate note (section 4.4 row 5). It depicts no data, and no count appears anywhere.

The floor plan, the production log and the route are drawn in code, not by Aryan. Whether they need a disclosure like the Research note is Pending 9.

**Coloured** (`kind: "colour"`, colours written from tokens as 6-digit hex)

| File | Size | Seed | Generator | Tokens written in | Budget |
|---|---|---|---|---|---|
| `grain.svg` | 160x160 | 5 | `grainTile` | none, `tokens: []` (a fixed grain matrix, no colour literal) | 1,000 B |
| `braille.dots.svg`, Aryan's name in uncontracted Braille, five letter cells: a (1), r (1,2,3,5), y (1,3,4,5,6), a (1), n (1,3,4,5); dome crescent and glint as in the mock | 64x320 | 23 | `braille` | `--fibre` (dot face and glint); `--on-stock` with `fill-opacity` .28 (shadow) and .2 (crescent) | 6 KB |
| `tape-end-sky-l.svg`, `tape-end-sky-r.svg` | 8x40 | 71, 72 | `tapeEnd` | `--stock-sky` | 500 B each |
| `tape-end-marigold-l.svg`, `tape-end-marigold-r.svg` | 8x40 | 73, 74 | `tapeEnd` | `--stock-marigold` | 500 B each |

The mock filled Braille dots with #F7F2E6. The build uses `--fibre` (#FFFDF6) so every colour in a generated file is a token. The strip has no capital sign, so a Braille reader reads lowercase "aryan". A capital-word sign would need two more cells in a strip sized for five; the strip is decoration and `aria-hidden`, so it keeps the mock's five cells.

**From Aryan's own material** (`source: "aryan"`, `kind: "raster"`)

| File | Generator | From | Treatment | Budget |
|---|---|---|---|---|
| `hand.png` | `pencilAlpha` | `Pictures/Chancellors-award/scribble.png` (497x618), region left 297, top 16, 187x182 (the mock's region scaled from its 640x800 copy) | Greyscale, alpha = ((236 minus L) / 172) to the power 0.82, Lanczos to 240x234, grey plus alpha PNG. Used as a mask coloured `--pencil`, so it is never inverted, and always shown at its own aspect (section 7.1). | 12 KB |
| `arena.jpg` | `duotone` | `Pictures/LA-hacks/IMG_9046.jpg` (1063x688) | Resize to 840 wide (840x544). Crop 840x82 from 3% to 18% of the height (rows 16 to 98): seats and the dark roof, above every head. The first draft's 27% band (rows 16 to 147) caught the top of a stranger's head from about row 107, and the mock's 38% strip caught the back of another; both bands were rendered at full size and checked on 26 October 2026. Then greyscale, normalise 1 to 99, levels .05 to .9, gamma .42, JPEG q74. | 28 KB |
| `cleancampus.jpg` | `duotone` | `Pictures/Clean-campus/clean-campus-drive.png` | Crop x 0 to 80%, y 2% to 28%: tree line and UB buildings, above both heads and clear of the "Clean Campus" watermark at the top right. Same tone treatment, 544x177, JPEG q74. | 22 KB |
| `public/og.jpg` | `og` | the source of room `ogRoom` (`Pictures/Pillars-award/innovative-student-leader-award-3.png`), plus `hand.png` and the masks above | section 5.8 | 120 KB |

**The two crops of Aryan's drawing:**

- the handwriting crop, `hand.png`, made by `paper.mjs`;
- the full drawing, room `contact`, made by `npm run rooms` (section 6.5), so it stays a room with its caption and receipt.

**Totals.**

- `src/assets/paper/` at most 240 KB raw.
- Masks at most 60 KB raw in total.
- Pencil and line files at most 90 KB raw in total.
- Browsers fetch every mask and background image of every rendered element at load, wherever it sits on the page. All paper assets fetched at load transfer at most 110 KB, measured from a cold load's network log, and count inside the 600 KB first-load total (section 9).
- GitHub Pages serves HTTP/2 and gzips SVG. It also sends `cache-control: max-age=600` for hashed `_astro` files, so the separate mask files revalidate on a return visit after ten minutes. That is a known cost of shipping masks as files.

**`astro.config.mjs`** gains two build settings:

```js
vite: {
  build: {
    // Small SVGs inline into the CSS. Undefined leaves every other file, including
    // Astro's processed <script> blocks, on the 4,096 B default, so the two
    // component scripts stay inline.
    assetsInlineLimit: (file, content) => (file.endsWith(".svg") ? content.length < 1024 : undefined),
    // Astro builds CSS for esnext, and Lightning CSS then drops prefixes that
    // Safari still needs. These targets keep -webkit-box-decoration-break and
    // add the -webkit-mask-* properties.
    cssTarget: ["chrome111", "edge111", "firefox114", "safari16.4", "ios16.4"],
  },
},
```

- A bare `assetsInlineLimit: 1024` would also move the Video script (1,320 B minified) and the nav script out to `<script src>` files, because Astro uses the same limit to decide whether to inline a component script. A build of a copy confirmed the function form keeps both inline.
- Without `cssTarget`, a build turns `-webkit-box-decoration-break: clone; box-decoration-break: clone` into the unprefixed form only, which Safari ignores, and adds no `-webkit-mask-*`, so Chrome 111 to 119 would draw every pencil layer as a solid box. Hand-written CSS uses unprefixed mask properties and lets the build add the prefixes.
- Files that inline: every file with a budget of 1,000 B or less (the tapes, the tape ends and end caps, the ticks, the bracket, `graph.tile.svg`, `solid.svg`, `play.svg` and the grain). Larger files ship as hashed files.

### 6.5 Room crops (`scripts/crop-rooms.mjs`)

**`Room.aspect` replaces `Room.fit`.** `fit?: "cover" | "contain"` becomes `aspect?: "3:2" | "4:5" | "natural"`, defaulting to `"3:2"`.

| Aspect | Rooms | Output |
|---|---|---|
| `"3:2"` | the other nine rooms | Keeps the v3 crop (face registered at 50%, 40%; `minCover` honoured). |
| `"4:5"` | `pillar` | Same `cropBox` with ratio 4/5. The source is 1195x793, so the crop uses the full height: 634x793, left edge 316, face at 23% of the height. |
| `"natural"` | `streamfair`, `contact` | No crop and no letterbox. sharp `resize({ width: 1440, height: 1600, fit: "inside", withoutEnlargement: true })`, so the 497x618 drawing is never enlarged. |

**Flatten colour.** The colour used to flatten transparent sources (and the drawing) becomes `--fibre`, read from `global.css` the same way `paper.mjs` reads tokens. v3 used the hard-coded #f3f2ee. The drawing therefore sits on its cream sheet in both themes.

**OG.** `writeOg` is deleted (section 5.8).

**Delivery.**

- Prints use Astro `<Picture>` with AVIF and WebP.
- Hero print: `widths [336, 480, 634]`, `sizes "(max-width: 47.99rem) 204px, 336px"`.
- Margin prints: `widths [284, 568, 716]` capped at the source width, `sizes "(max-width: 47.99rem) calc(100vw - 32px), 284px"`.
- Footer print (`contact`): `widths [240, 480, 720]` capped at the source width, `sizes "240px"`.
- Extra prints (today only `pillar-pair`): source `src/assets/full/<id>.jpg` (991 wide for `pillar-pair`), natural aspect, the margin widths and sizes, capped at the source width.
- Popovers keep v3's full-size `widths [800, 1600]`.

### 6.6 How each piece ships, and how colour reaches tapes

A piece is one element with up to two pseudo-elements, plus a child only where pencil art or a tape needs its own colour.

```css
.piece { position: absolute; filter: drop-shadow(0 1px 1px var(--lift)) drop-shadow(0 6px 10px var(--lift-far)); }
.piece::before, .piece::after { content: ""; position: absolute; inset: 0; mask-size: 100% 100%; mask-repeat: no-repeat; }
.p-sky::before { background-color: var(--fibre); mask-image: url(../assets/paper/sky.outer.svg); }
.p-sky::after  { background: var(--grain) 0 0 / 160px, var(--stock-sky); background-blend-mode: multiply; mask-image: url(../assets/paper/sky.inner.svg); }
.tape          { position: absolute; background: var(--grain) 0 0 / 160px, var(--tape); background-blend-mode: multiply; opacity: .9; mask: url(../assets/paper/tape-a.svg) 0 0 / 100% 100% no-repeat; }
.tape--vermilion { background-color: var(--stock-vermilion); opacity: .55; }

@supports (mask-image: none) or (-webkit-mask-image: none) {
  .art       { position: absolute; background-color: var(--pencil); mask-size: 100% 100%; mask-repeat: no-repeat; }
  .art--plan { inset: 14px 8px 10px 9px; mask-image: url(../assets/paper/plan.pencil.svg); }
}
```

- **Inner and outer masks share the piece's full box** (`inset: 0` on both pseudo-elements). The generator writes the outer tear and the inner face into one viewBox, and the fibre rim already lives in that geometry, so shrinking the inner box would break the registration.
- **Elements whose only shape is a mask** (every `.art` pencil layer, the About ticks, the aside bracket, the cell field and the play glyph's `::after`) sit inside `@supports (mask-image: none) or (-webkit-mask-image: none)` and are not rendered otherwise. Without that guard they would be solid blocks of `--pencil`, `--muted` or `--fibre`.
- **Prefixes** come from the build target (section 6.4). Hand-written CSS uses the unprefixed mask properties.

**Shadows.** `filter: drop-shadow` sits on the unmasked wrapper. A filter on the masked element itself would be masked away.

**Plates** are full width. They are masked from the periodic edge strips:

```css
.plate::before, .plate::after {
  mask-image: url(../assets/paper/edge-top.outer.svg), url(../assets/paper/solid.svg), url(../assets/paper/edge-bottom.outer.svg);
  mask-position: var(--edge-x, 0) top, center, var(--edge-x, 0) bottom;
  mask-size: 1200px 16px, 100% calc(100% - 28px), 1200px 16px;
  mask-repeat: repeat-x, no-repeat, repeat-x;
}
```

`::after` uses the `inner` strips and the stock. Each plate sets its own `--edge-x` (0, -180, -340, -520, -700, -860, -1020px), so no two plates show the same tear. The footer tear uses the same strips on a full-bleed element, so it tiles at any width.

**The two text tapes (`.hl--sky` for Next, `.hl--marigold` for the results)** wrap across lines, so their torn ends must repeat on every line fragment. They use background layers with `box-decoration-break: clone`. Safari supports only `-webkit-box-decoration-break`, and the `cssTarget` of section 6.4 keeps that form in the built CSS (a built-CSS test checks it, section 10.2). The middle colour comes straight from the token:

```css
.hl--sky {
  color: var(--on-stock);
  padding: .04em 8px;
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
  background:
    url(../assets/paper/tape-end-sky-l.svg) left center / 8px calc(100% - 2px) no-repeat padding-box,
    url(../assets/paper/tape-end-sky-r.svg) right center / 8px calc(100% - 2px) no-repeat padding-box,
    var(--grain) 0 0 / 160px content-box,
    var(--stock-sky) content-box;
  background-blend-mode: normal, normal, multiply, normal;
}
```

`.hl--marigold` is the same with the marigold caps and `var(--stock-marigold)`.

Only the four 8x40 end caps carry a colour. `paper.mjs` writes it from the `--stock-sky` and `--stock-marigold` values in `global.css`, and `tests/paper.test.mjs` fails if a cap's fill differs from the current token (token drift).

This replaces the mock's three data-URI layers per tape, which hard-coded `%239CC8EE` and `%23F2A516` in the CSS.

## 7. Layout and components

### 7.0 Where the mock and its spec disagree

The mock wins unless it breaks a decision in section 1.

| Topic | Mock spec | Mock | This spec |
|---|---|---|---|
| Actions at 1280x800 | about y 620 to 670 | y 673 to 721 | mock |
| Tape colour | `rgba(214,188,146,.75)`, called kraft | `--tape` #E9DDC2 at 90% | mock; tapes are no longer a kraft-stock job |
| Braille dot fill | `--fibre` | #F7F2E6 | spec, so generated colours stay tokens |
| Phone print image | 204x255 | 204x259 | mock |
| Footer | out of scope | ink slab with torn edge and drawing | mock, with the link colour fixed (5.1) |
| Ribbon band | `::after`, 56 wide, flush | piece 48 wide, overhanging, notched | mock |
| Demo media | poster | stand-in photo poster | neither: v3's in-view muted player, poster fading on load (7.4) |
| Nav collapse | not set | at 899px | 64rem (5.4) |
| Grain delivery | data-URI in CSS | SVG filter on inline paths plus a CSS variable | file tile (5.5) |
| "1 of 2" tape shape | short `clip-path` polygon | long generated polygon with fixed-depth ends | three mask layers: `tape-fig-l.svg`, `solid.svg`, `tape-fig-r.svg`, so the torn ends keep their depth at any width (7.1) |
| Hero collage | as specified | as specified | re-aimed handwriting, print lowered 40px (7.1) |

### 7.1 Hero

**Markup order** (facts precede art): `section.hero` > `div.hero__facts` (h1, `TitleBlock`, `Ledger`, actions), then `div.hero-art` (`Print room="pillar" variant="hero" popover={false}`, then `div.collage`), then `PhotoPopover room="pillar"` (`div#photo-pillar[popover]`).

The pillar popover sits outside `div.hero-art` on purpose. `div.hero-art` carries `zoom` at narrow widths (5.4), and the top layer escapes transforms and clipping but not `zoom`: a popover inside a `zoom: .776` parent renders at 77.6% (checked in Chrome 152). A build test keeps every `[popover]` out of `div.hero-art`, and a probe checks that the open `#photo-pillar` reports `currentCSSZoom === 1` at 1024x768 and 375x667.

**The left column** at 1280x800, measured in the approved mock (Chromium, page y):

| Element | x | y |
|---|---|---|
| Nav | | 0 to 56 |
| h1 "Aryan Mudgal" | 48 to 720 | 97 to 169 |
| Title block | | 189 to 372 |
| Study row | | 190 to 233 |
| Work row | | 233 to 302 |
| Next row | | 302 to 371 |
| Ledger | | 394 to 649 |
| Ledger row 1 | | 396 to 479 |
| Ledger row 2 | | 479 to 563 |
| Ledger row 3 | | 563 to 647 |
| Email Aryan | 48 to 182 | 673 to 721 |
| Resume (PDF) | 198 to 342 | 673 to 721 |

At 1024x768 (the zoom tier) Email sits at y 705 to 753.

**Title block.**

- Markup: `dl.tb` > three `div.tb__row` (grid `80px 1fr`, padding 9px 0), each with a `dt` and a `dd`.
- The `dd` holds `span.tb__long` and `span.tb__short`. Their sentences are joined by single spaces. The first Next sentence is wrapped in `span.hl--sky` (section 5.2).
- Rules: `border-block: 1px solid var(--ink)`, with rows separated by `--line`.
- Desktop shows `.tb__long`. Below 48rem, `.tb__short` shows and the rows use `64px 1fr`.

**Ledger.**

- Markup: `ol.ledger[role=list][aria-label="Three proofs"]` > `li` (grid `168px minmax(0, 1fr)`, `column-gap: 24px`, padding 12px 0, `align-items: baseline`). Rules: `border-block: 2px solid var(--ink)`, hairlines between rows.
- The figure is `a.fig` (ink, nowrap, no underline until hover). The bold row's figure is `a.fig.fig--tape`. Its marigold tape is a `::before` with `rotate: -1.5deg`, masked by three layers: `mask-image: url(tape-fig-l.svg), url(solid.svg), url(tape-fig-r.svg)`, `mask-size: 12px 100%, calc(100% - 24px) 100%, 12px 100%`, `mask-position: left, center, right`, no repeat. The torn ends keep a fixed 12px depth whether the figure is about 130px wide (desktop, 34px type) or about 80px (phone, 22px type). The text stays straight.
- The claim is `p.claim`, with the bold row in `strong`, followed by an inline receipt (7.4).
- "Co-author" fits the 168px column at 34px (audit bug 2).
- Phone: `96px minmax(0, 1fr)`, `column-gap: 12px`.

**Actions.**

- Layout: `div.hero__actions`, flex, `column-gap: 16px`, 24px below the ledger.
- `a.action--primary` "Email Aryan": 48px tall, padding 0 22px, square corners, `--accent` background, `--on-accent` text.
- `a.stub--resume` "Resume (PDF)": 48px tall, padding 0 18px 0 20px, 1px ink border with a 2px dashed ink left border, `--paper` fill, `--accent` underlined text.
- Phone: each `flex: 1`, `column-gap: 12px`.

**`div.hero-art` at 1280x800.**

- The box is 464x680, page x 768 to 1232, y 73 to 753, with `margin-top: -24px`, `isolation: isolate` and `overflow-x: clip` on `.hero`.
- Coordinates are relative to `div.hero-art`; page coordinates are in brackets.
- The print and the Braille, plan and hand pieces are new positions. The mock had the print at top 52 and the hand scrap at (308, 0, rotated -5deg), whose arrow pointed at Aryan's chest.

| z | Element | Box | Rotate | Detail |
|---|---|---|---|---|
| 1 | `.piece.p-sky` | left 24, top 48, 416x496 [792 to 1208, 121 to 617] | -1deg | sky stock, fibre fringe, no drawing |
| 2 | `.piece.p-braille` | left -8, top 340, 64x320 [760 to 824, 413 to 733] | 0.5deg | leaf stock plus `braille.dots.svg` |
| 3 | `figure.print.print--hero` (content, never animates) | frame left 64, top 92, 356x440 [832 to 1188, 165 to 605]; image 336x420 inside a 10px fibre border | 1.2deg | one tape 88x26 at frame left 84, top -13, -3deg |
| 4 | `.piece.p-plan` | left 312, top 524, 144x124 [1080 to 1224, 597 to 721] | -2deg | kraft stock plus `.art--plan` |
| 5 | `.piece.p-hand` | left 264, top 8, 156x120 [1032 to 1188, 81 to 201] | 2deg | fibre scrap; `.art--hand` (the `hand.png` mask, `--pencil`) at left 21, top 6, 113x110, which is the crop's own 240:234 aspect, so Aryan's pencil is never stretched; a tape 64x20 on its top-left corner at -20deg |
| | `figcaption` of the print | left 72, top 580, 224 wide [840 to 1064, 653 to about 710] | none | on paper, captions style: "University at Buffalo, April 2026. Award for Innovative Student Leadership." plus an inline "Source: UB Student Life" |

**The face and the arrow.**

- The 4:5 crop puts the face centre at 50% across and 23% down the image. That is page (1010, 272).
- **Keep-out box:** no piece may touch x 960 to 1060, y 200 to 330 (the head).
- **The arrow:** its shaft is measured from `hand.png` at 55 degrees below horizontal, pointing left, with the tip at (40, 228) of the 240x234 crop. At this placement, by calculation, its extended line passes the face centre within about 7px, and the tip stops about 100px short of it.
- **Rule for the build:** at 1280x800, 1024x768 and 390x844, the arrow's extended line passes within 16px of the face centre, no piece enters the keep-out box, and the hand scrap stays inside the hero's clip. The builder may nudge left, top or rotation (within -2deg to 6deg) to hold the rule after real fonts load. The probe in 7.11 measures it.

**Phone (390x844, below 48rem).** The order stays the DOM order: facts first, then `div.hero-art` at 358 wide, centred.

**Left column on the phone,** measured in the mock:

| Element | x | y |
|---|---|---|
| Nav | | 0 to 52 |
| h1 | | 73 to 117 |
| Title block | | 137 to 279 |
| Ledger | | 295 to 598 |
| Email Aryan | 16 to 188 | 614 to 662 |
| Resume (PDF) | 200 to 374 | 614 to 662 |

`div.hero-art` is 358x456, starting 24px below the actions (page y 686).

| Element | Box (relative) [page] | Rotate |
|---|---|---|
| `.p-sky` | left 29, top 44, 300x320 [45 to 345, 730 to 1050] | -1deg |
| print frame | left 69, top 64, 220x275 (image 204x259, 8px border) [85 to 305, 750 to 1025]; tape 70x21 at frame left 44, top -11 | 1.2deg |
| `.p-hand` | left 185, top -14, 132x102; `.art--hand` at left 18, top 4, 96x94 (the crop's own aspect) [201 to 333, 672 to 774] | 2deg |
| `.p-braille` | left 0, top 140, 48x240, a uniform 0.75 scale of the desktop strip [16 to 64, 826 to 1066] | 0.5deg |
| `.p-plan` | left 250, top 300, 104x90 [266 to 370, 986 to 1076] | -2deg |
| caption | left 29, top 392, 300 wide [45 to 345, 1078 to about 1135] | none |

On the phone:

- The face centre is about (195, 818), and the head keep-out box is x 165 to 225, y 775 to 870.
- At the 844 fold, a visitor sees the whole handwriting scrap, the top of the sky block and the top 94px of the print with Aryan's face. The scrap starts 10px below the buttons.
- At 320 wide, the actions sit at y 740 to 788 (no fold requirement). The page width stays 320.

### 7.2 Components to add, change and delete

| File | Fate | Props and data |
|---|---|---|
| `src/components/TitleBlock.astro` | **add** | none; reads `titleBlock` |
| `src/components/Collage.astro` | **add** | none. Renders `div.hero-art` with `<Print room="pillar" variant="hero" loading="eager" popover={false} />` and the `aria-hidden` `div.collage` with exactly four `.piece` divs (`p-sky`, `p-braille`, `p-plan`, `p-hand`). Nothing focusable, no `<img>`, no text, no popover. |
| `src/components/Plate.astro` | **add** | `name: "work" \| "projects" \| "route" \| "research" \| "leadership" \| "recognition" \| "about"`. Holds the plate table of 7.3 as a constant. Renders `div.plate.plate--<name>[aria-hidden=true]` with its subject: one `.piece`, or one `div.plate__art` for Route and Research. The Research plate also renders `p.plate-note` inside the same hidden wrapper. Every plate except Work also renders `div.plate__cover` in the previous plate's stock (taken from the same constant, in page order) for the section transition of 8.4. Duotones render through Astro `<Image>` with `alt=""`, `loading="lazy"`, `width` and `height`. |
| `src/components/Print.astro` | **add** (replaces `ChapterFigure.astro`) | Props below. Renders `figure.print.print--<variant>[data-room]` (or `[data-extra]`). Inside: a fibre `div.print__frame`; for rooms, a `button.print__open[popovertarget="photo-<id>"]` holding the `<Picture>` (alt from `rooms.ts`) and `<span class="sr-only">Open full photo</span>`; `aria-hidden` tapes; and a figcaption with the caption and an inline receipt (rooms) or the caption alone (extras). For rooms it also renders `<PhotoPopover>` as the figure's next sibling, unless `popover={false}`. |
| `src/components/PhotoPopover.astro` | **add** | `{ room: ChapterId }`. Renders `div#photo-<id>.photo-popover[popover]`, moved from `Frame.astro`: the full image, caption, receipt, extras and Close. Used by Print, and by Hero for `pillar` outside `div.hero-art` (7.1). |
| `src/lib/text.ts` | **add** | Plain TypeScript with no imports, so the Node 24 tests can import it. `numeralRuns(text: string): { text: string; num: boolean }[]` splits on `/\d[\d,]*\+?/g`. `researchParagraphs(detail: string): [string, string]` splits on `/(?<=\.) (?=[A-Z])/` and returns sentences 1 and 2, then 3 and 4. Leadership.astro and Research.astro use them. |
| `src/components/Frame.astro` | **delete** | |
| `src/components/ChapterFigure.astro` | **delete** | |
| `src/components/Hero.astro` | change | facts, then `<Collage />`, then `<PhotoPopover room="pillar" />` |
| `src/components/Ledger.astro` | change | markup in 7.1 |
| `src/components/Source.astro` | change | adds `variant: "inline" \| "stub"` (default `"inline"`). A stub renders `Source: <span class="stub__pub">{label}</span>`, so the text content is still "Source: {label}". The `prefix` prop and its default "Source" stay. |
| `src/components/Video.astro` | change | adds `mat: "demo" \| "plain"`; poster fade and poster click (7.4) |
| `Experience.astro`, `Projects.astro`, `Trajectory.astro`, `Research.astro`, `Leadership.astro`, `Recognition.astro`, `About.astro` | change | each opens with `<Plate name=... />`; layouts in 7.3 to 7.9; `data-room` moves off sections and articles and onto prints only |
| `src/components/SiteFooter.astro` | change | slab, sheet, `<Print room="contact" variant="footer" />`, colophon, `div#page-end` (7.10) |
| `src/components/SiteNav.astro` | change | ink current bar; a second IntersectionObserver on `#page-end` (7.10, audit bug 6) |
| `src/layouts/BaseLayout.astro` | change | font link, `theme-color` values |
| `src/pages/index.astro` | change | `SiteNav`, `main#main-content` (Hero to About), `SiteFooter`; no `.rooms` wrapper |
| `src/pages/404.astro` | change | 5.7 |
| `src/data/portfolio.ts` | change | adds `titleBlock` (milestone 1); the colophon strings change only after Aryan's answer (4.4, milestone 6) |
| `src/data/rooms.ts` | change | `aspect` replaces `fit`; `ogRoom = "pillar"`; comments drop "frame" |
| `src/data/paper.ts` | **add** | manifest (6.3) |
| `scripts/freeze-copy.mjs` | **add** | writes `tests/fixtures/copy-v3.json` (10.2) |

**`Print.astro` props:**

```ts
type PrintProps = {
  room?: ChapterId;                 // exactly one of room and extra
  extra?: string;
  variant: "hero" | "margin" | "footer";
  tilt?: number;                    // degrees; default from the table below
  tapes?: readonly { w: number; h: number; x: number; y: number; rotate: number }[]; // default: one tape per variant
  tone?: "plain" | "vermilion";     // tape colour; default "vermilion" inside #projects, "plain" (--tape) elsewhere
  loading?: "eager" | "lazy";       // "eager" also sets fetchpriority="high"; default "lazy"
  popover?: boolean;                // default true for rooms
};
```

- Tilt applies to `.print__frame`, never to the figure, so captions stay level.
- Default tilts: pillar 1.2, dots -1.2, hero 1.4, armie 1, streamfair -1, wod 1.2, safeline -1, research -1, cleancampus 1, chancellor -1, pbk 1.2, `pillar-pair` 1, contact -1.6.
- The footer passes two tapes (7.10). Every other print uses its variant's one default tape.

### 7.3 Plates

Each plate is `aria-hidden`, holds no text and no link, and carries one subject drawn from that section's own evidence. A subject is an element with class `piece` (a scrap, a duotone or the band) or `plate__art` (the Route and Research drawings, drawn on the plate itself).

To read as pasted objects, not coloured dividers:

- every `.piece` subject overhangs at least one plate edge by 8 to 16px; the `plate__art` drawings are exempt, because they are drawn on the plate;
- subjects alternate between the left, the right and the full width, so consecutive plates never repeat a composition.

The budget is at most two subjects per plate; v4 uses one, leaving room for a later photo.

| Section | Stock | Subject (desktop, relative to the plate) | Phone (plate 72 tall) |
|---|---|---|---|
| Work | sky | Production-log scrap: fibre, `log.outer.svg`, 248x114 at left 56, top -12, -2deg; `log.pencil.svg` inset 8px; tape 56x18 at its top right, 24deg | 132x61 at left 14, top -8 |
| Projects | vermilion | LA Hacks arena duotone: `arena.jpg` (`object-fit: cover`) multiplied on a vermilion `.duo` box inside a 4px fibre frame, 456x100 at right 40, top 24, 1deg | 196x52 at right 12, top 28 (overhang 8) |
| Route | kraft | `div.plate__art`: the pencil route drawn on the plate itself (`route.pencil.svg`) | `route-sm.pencil.svg` |
| Research | UB blue | `div.plate__art`: the cell field in fibre lines (`cells.svg`, 744x112), anchored right. `p.plate-note` sits 8px below the plate on paper, right-aligned, captions style: "An illustration, not study data. Drawn in code." | `cells-sm.svg`, anchored right; the note below, left-aligned |
| Leadership | leaf | Clean Campus duotone: `cleancampus.jpg` multiplied on a leaf `.duo` box inside a 4px fibre frame, 376x100 at left 64, top -10, -1.5deg; tape 60x18 | 180x50 at left 12, top -8 |
| Recognition | marigold | UB-blue ribbon band (`.piece.plate__band`): 48 wide at left 68%, top -10, height plate plus 24, 0.8deg, notched foot. Nothing else, and no line art. | 32 wide, same offsets |
| About | kraft | Graph-paper scrap: fibre, `graph.outer.svg`, `graph.tile.svg` lines intersected with the scrap shape (`mask-composite: intersect`), 248x112 at left 72, top -12, 2deg; tape 52x18 | 140x62 at left 20, top -8 |

**Between the phone and desktop sizes** (48rem to 79.99rem, content 704 to 1183px wide):

- Scraps, duotones and the band keep their desktop px sizes and their left or right offsets (the band keeps 68%).
- The route is never stretched or cut: `mask-size: contain; mask-position: left center`. `route-sm.pencil.svg` below 48rem and `route.pencil.svg` from 48rem, each scaled uniformly to the plate's width (704x67 at 768 wide).
- The cell field keeps its own size, anchored right. Where the plate is narrower than 744px, its left part is clipped by `.plate { overflow-x: clip }`; the field has no ends to lose.
- The same rules hold on phones narrower than 390px.

The Research note is the only text in any plate component. It describes a hidden drawing, so it is hidden with it. It sits on paper, not on the stock.

### 7.4 Receipts and video

**Receipts** differ only by position, never by source.

- **Inline, inside a sentence:** an `--accent` link with a 1px underline at offset 3px, in the surrounding face. Used in:
  - ledger claims and print captions;
  - the About Litos line ("GitHub");
  - the Safeline caption ("Open the video file");
  - the footer drawing caption ("Source: Drawn by Aryan", through `Source.astro` with its default prefix, as in v3).
- **Stub, at the end of a row:** `a.stub`, 30px tall, padding 0 12px 0 14px, a 1px ink border with a 2px dashed ink left border, `--paper` fill, `--accent` text in sans 500 13/18, the publisher underlined.
  - Layout: `div.stubs`, flex, `column-gap: 8px`, `row-gap: 8px`, 16px below the row's last paragraph.
  - Used in Work, Projects, Research, Leadership and Recognition rows.

The exceptions render nothing in place of a receipt: no chip, no "No public link" and no tier class.

- Only an item whose `receipts` array is empty renders no `div.stubs`. Today that is Men In Green (`men-in-green`).
- ARMIE (`armie-honorable-mention`) and Safeline (`safeline-remarks`) have receipts, so their cards render their stubs as usual (Devpost and GitHub for ARMIE, GitHub for Safeline). Their exceptions mean only that "Honorable mention." and the Safeline aside carry no receipt of their own.

**Video.** `Video.astro` keeps v3's behaviour: the in-view muted player, the reduced-motion branch and `youtube-nocookie.com`.

```html
<figure class="video video--youtube video--demo" data-video="youtube" data-id data-start data-title>
  <div class="video__mat">
    <div class="video__screen">            <!-- position: relative; aspect-ratio: 16 / 9 -->
      <a class="video__poster" href="https://www.youtube.com/watch?v=..." target="_blank" rel="noopener noreferrer">
        <img src="https://i.ytimg.com/vi/<id>/hqdefault.jpg" width="480" height="360" alt="Video: {title}" loading="lazy" decoding="async" />
        <span class="video__play" aria-hidden="true"></span>
        <span class="video__badge" aria-hidden="true">Plays when in view</span>
        <span class="sr-only"> opens in a new tab on YouTube</span>
      </a>
    </div>
  </div>
  <figcaption class="video__caption">{title}</figcaption>
</figure>
```

- **Demo mat:** `--stock-vermilion` plus grain, padding 12px (phone 8px).
- **Plain mat** (the ceremony video in Recognition): `--paper-2`, a 1px `--line` border, padding 12px.
- **Poster:** `object-fit: cover`, which trims the thumbnail's letterbox bars.
- **Play glyph:** a 56px `--fibre` circle (48px on phone), centred, with `play.svg` masked in `--on-stock`.
- **Badge:** top left, inset 12px, `--fibre` with `--on-stock` text, padding 3px 8px. Under `prefers-reduced-motion: reduce` the in-view player never mounts, so the badge is hidden there (8.3); it would otherwise state behaviour that does not happen.
- **Player and file backing:** `.video__frame` and `.video__file` use `background: var(--on-stock)` in place of v3's #000, and the badge uses tokens in place of v3's #fff, so no hex sits outside the token blocks (milestone 1 makes this change on the v3 layout).

**Script change: the poster fades out on load.**

1. When the figure is half in view, `mountYoutube` still creates the iframe, but inserts it inside `.video__screen` beneath the poster (`position: absolute; inset: 0`). The poster stays visible.
2. On the iframe's `load` event, plus 200ms, the figure gets `data-ready`. CSS fades `.video__poster` to `opacity: 0` (`transition: opacity 240ms linear`, `pointer-events: none`).
3. On `transitionend`, or after a 300ms fallback, `poster.hidden = true`.
4. `unmountYoutube` removes the iframe and `data-ready` and sets `poster.hidden = false`.
5. **A click on the poster while a muted iframe is still loading** removes that iframe and mounts again with `mute=0`. In v3, `mountYoutube` returns early when an iframe exists, so that click would do nothing and the visitor would get no sound.

The iframe's `load` event fires when YouTube's embed document loads, not when the first frame paints, so this reduces the black slab of audit bug 10 rather than removing it. Milestone 5 checks the fade in Chrome, Safari and Firefox. Under reduced motion there is no autoplay, as in v3, and the fade takes 0s.

**The Safeline file video** keeps its native `<video muted playsinline loop preload="none" poster>`. Its mat is `display: inline-block` around the portrait video (max-height 544px, so 306 wide), not full width.

### 7.5 Work (`#work`)

- **Plate:** Work.
- **h2:** "Three summers, one app that replaced paper on a plant floor".
- **Rows:** three `article.row` on the row grid (200 and 600).
- **Meta column** (`row-gap: 4px`, `align-content: start`):
  - company in the serif meta lead;
  - role in sans 14/20 `--ink-2`;
  - place, then period, in sans 14/20 `--muted`. This is the mock's order: "Buffalo, NY", then "Summer 2026".
- **Body column** (16px between blocks):
  - h3 outcome (24/32);
  - detail;
  - `p.my-part` with `<strong>My part.</strong>` and the text;
  - stubs.
- No prints: Work owns no room, and the Linde diagram is out of scope.
- **Phone:** meta above body.

### 7.6 Projects (`#projects`)

- **Plate:** Projects.
- **h2:** "What I built in a day at UCLA, MIT, CMU and Stanford".
- **Lede,** unchanged from `Projects.astro`: "Hackathon builds, each finished in a day or two and shown to judges. Team size and my part are stated on every card." 40px below it comes the index.

**Index.**

- Markup: `ol.index[role=list]`, max-width 784px, `border-block: 1px solid var(--ink)`, hairlines between rows.
- Rows: `160px 1fr`, padding 10px 0. Phone: `112px 1fr`.
- Each row is the project name as a link to `#project-<id>`, then its result from `portfolio.ts`. The result is plain, with no tape.

**Five cards.** `article#project-<id>.card` on the card grid, 64px apart with a hairline between.

- **Meta column:** event, date, pool when present, then "Team: {names}." (v3's rendering of `team`).
- **Body column:**
  1. h3 name;
  2. `p.result` > `span.hl--marigold` with the result. The tape is identical on all five, including "Honorable mention." and "Did not place. The demo ran.", and is not rotated.
  3. `built`;
  4. the demo, when present (`<Video mat="demo">`);
  5. "My part.";
  6. `p.aside`, when present: italic, with `bracket.svg` masked in `--muted` on a `::before` 20px to its left at full paragraph height (Dots, StreamFair, Safeline);
  7. stubs.
- **Margin column:**

  | Card | Prints |
  |---|---|
  | Dots | two: room `dots` (-1.2deg), then room `hero` 32px below (1.4deg) |
  | ARMIE | `armie` (1deg) |
  | StreamFair | `streamfair`, natural aspect (-1deg) |
  | W.O.D. | `wod` (1.2deg) |
  | Safeline | `safeline` (-1deg) |

  Prints use a 10px fibre border and a vermilion tape (`tape-c.svg`, 80x22, top centre, at most 3deg). The caption sits 14px below the frame.
- **Phone:** the card stacks as meta, h3, result, built, demo (full width), my part, aside, stubs, then the prints, full width and unrotated.

### 7.7 Route (`#trajectory`)

- **Plate:** Route.
- **h2,** unchanged: "Pune to Buffalo to New York City, as a list".
- **List:** `ol.route[role=list]`, max-width 840px, `border-block: 1px solid var(--ink)`. Rows are separated by `li + li { border-top: 1px solid var(--line) }`, so there is no double rule at the end (audit bug 9).
- **Row:** grid `200px 1fr`, padding 10px 0.
  - The period is sans 15/22 `--muted`, tabular.
  - The title is a serif 18/28 ink link with a 1px `--line` underline that turns ink on hover. Links stay `--accent` for focus.
- **Phone:** the period sits above the title.
- All 13 rows and their hrefs come from `route` unchanged. The plate's dashed final leg is the only "planned" mark, and it is decoration.

### 7.8 Research (`#research`)

- **Plate:** Research, with the note.
- **h2:** "Counting fetal cells in maternal blood".
- **One `article.card`:**
  - **Meta:** the role in the serif meta lead ("Research Assistant, University at Buffalo"), then the period.
  - **Body:** h3 title (24/32), the summary as a lead (20/30 `--ink-2`), then the detail split by `researchParagraphs` (`src/lib/text.ts`) into two paragraphs (sentences 1 and 2, then 3 and 4), then stubs (Paper, PDF; Resume). The split is rendering only: a source test joins the paragraphs with a single space and compares them with `research[0].detail`.
  - **Margin:** the `research` print.

The cell field on the plate is the only drawing. No pipeline diagram ships.

### 7.9 Leadership (`#leadership`), Recognition (`#recognition`) and About (`#about`)

**Leadership.**

- **Plate:** Leadership. **h2:** "Elected twice, founded twice".
- **Rows:** six `article#leadership-<slug>.card` rows, 32px apart with hairlines. Margin column on the Clean Campus row only (the `cleancampus` print). The other rows span 200 and 600.
- **Meta:** title as `h3.meta-lead` (serif 600 20/26; v3 used `<strong>`, so this is a markup change, not copy), role (`--ink-2`), period (`--muted`). Every card with a print therefore has an h3 before it.
- **Body:** the summary, rendered through `numeralRuns` (`src/lib/text.ts`), with each numeral (`/\d[\d,]*\+?/g`: 30,000; 50,000; 450+; 3; 150; 500; 30,000) in `span.num` at weight 600. The text content is unchanged.
- **Stubs:** none on Men In Green (`#leadership-men-in-green` has no `div.stubs`).

**Recognition.**

- **Plate:** Recognition. **h2:** "Two awards in one April, and a key".
- **Rows:** three `article#recognition-<id>.card`, 64px apart.
- **Meta:** the date, followed by a full stop as in v3 ("University at Buffalo, April 2026.").
- **Body:**
  - `p.award__line`: `span.award__fig` (64/64 serif 600 ink), a space, then `span.award__den` (italic 22/30 `--ink-2`), then a full stop, as v3 ended the denominator. The denominator continues on the figure's baseline and wraps beneath, so "1 of 2 from 130+ nominations across UB's 20,000+ undergraduates." reads as one phrase. v3's punctuation is kept, so this is not new copy. Figures are never on a tape here.
  - h3 title (margin-top 18px);
  - context;
  - the ceremony video (`<Video mat="plain">`) in the chancellor row;
  - stubs.
- **Margin:**
  - pillar row: the `pillar-pair` extra print (1deg, `--tape`, caption only);
  - chancellor row: the `chancellor` print;
  - PBK row: the `pbk` print.

**About.**

- **Plate:** About. **h2:** "Outside the work".
- **List:** `ul.lines[role=list]`, max-width 760px. Each `li` is a grid `32px 1fr`, padding 12px 0, with a hairline above (and below the last). Text is serif 22/32.
- **Ticks:** `li::before` holds `tick-<n>.svg` (20x16, margin-top 8px) masked in `--muted`. Each line gets its own tick, so no two match.
- **Line 5** ends with the inline "GitHub" link to Litos.

### 7.10 Contact and footer (`footer#contact`)

- **Edge:** `footer.site-footer.slab`, 120px below About (phone 88px). It opens with `div.slab__tear[aria-hidden=true]`: 40px tall, full bleed, the periodic edge strips in `--fibre` (fringe) and `--slab`.
- **Slab:** `--slab` background, padding 40px 0 72px (phone 40px 0 88px).
- **Inner grid:** `minmax(0, 1fr) 300px`, `column-gap: 64px`, from 64rem up. One column below 64rem, `row-gap: 48px`, so the 34/44 address never breaks mid-word in a narrow column.
  - **Left:**
    - h2 "Every claim above has a link" in `--on-slab`, margin 0 0 28px;
    - the email `a.contact-link` (34/44, slab accent, `overflow-wrap: anywhere`);
    - `nav.profiles[aria-label="Profiles and documents"]` with LinkedIn, GitHub, Devpost and Resume (PDF) (sans 500 16/22, `column-gap: 28px`, `row-gap: 10px`, each at least 44px tall).
  - **Right:** `<Print room="contact" variant="footer" />` as a fibre sheet 268x330 rotated -1.6deg.
    - The drawing (natural aspect) sits at 240 wide inside it.
    - Two tapes: 78x22 at the top left (-32deg) and 70x22 at the top right (28deg).
    - The caption is `--on-slab-muted` with the inline "Source: Drawn by Aryan" (`Source.astro`, default prefix), and the same receipt shows in `#photo-contact`.
    - The sheet is never inverted in dark mode.
- **Colophon:** full width, 48px below, sans 13/19 `--on-slab-muted`: the four `colophon` lines, then "© 2026 Aryan Mudgal".
- **Page end:** `div#page-end` (empty, 1px) closes the footer. The section observer cannot see it: its `rootMargin` of `-20% 0px -58% 0px` limits it to a band from 20% to 42% of the viewport height, and a 1px element at the end of the document never enters that band. So SiteNav adds a second IntersectionObserver on `#page-end` with the default root margin and `threshold: 0`. While it intersects, Contact is current and the section map is ignored; when it stops, the section map decides again. A probe checks Contact at maximum scroll (7.11).
- **Dark mode:** the only change is `--slab` #25231F, which reads as a sheet on the darker desk.

### 7.11 Nav, popovers and layout probes

**Nav.**

- Desktop: `header.site-header`, sticky, 56px, `--paper` fill, a 1px ink bottom border. The name sits at x 48, and seven links end at x 1232, `column-gap: 26px`.
- The current link (`aria-current="location"`) is weight 600 with a 3px ink bar 6px below. Each link reserves its bold width with a hidden bold copy of its label, so the row never shifts: `a { display: inline-flex; flex-direction: column } a::before { content: attr(data-label); display: block; height: 0; overflow: hidden; visibility: hidden; font-weight: 600 }`. `visibility: hidden` keeps the copy out of the accessible name, so screen readers hear each label once.
- Below 64rem: 52px, a "Menu" button 64x36 with a 1px ink border and square corners, and the popover menu at `inset: 52px 16px auto auto`. The menu has a 1px ink border and `--paper` fill, items 16/20 with padding 12px 18px (at least 44px tall).

**Popovers** keep v3's structure: the full image, caption plus receipt, extras with captions, and "Close". Restyled: `--paper` fill, a 1px ink border, square corners, padding 16px, backdrop `rgb(0 0 0 / .62)`, `max-height: 92dvh`.

**Layout probes** run at each milestone's visual check, in the session browser or with the locally cached Playwright (not a dependency and not in CI). They measure at 1280x800, 1180x800, 1100x800, 1024x768, 768x1024, 390x844, 384x832, 375x667, 360x780 and 320x640, light and dark:

- from milestone 1: `document.documentElement.scrollWidth === innerWidth`, and no text element's right edge past the viewport;
- from milestone 3: the open `#photo-pillar` reports `currentCSSZoom === 1` at 1024x768 and 375x667;
- from milestone 4: the hero coordinates above; Email's bottom edge at or above the fold at 1280x800, 1180x800, 1100x800, 1024x768 and 390x844, and at or above y 664 at 390x844 (320x640 has no fold requirement, 7.1); the arrow rule and the head keep-out boxes;
- from milestone 6: at maximum scroll at 1280x800 and 390x844, the Contact link carries `aria-current="location"`.

## 8. Motion

### 8.1 The signature: pasted up in front of you

On first paint, everything is already in place: the sheet, every fact, the Pillar print, its caption and the plates. Then the four decorative pieces land one after another, each from 12px above and 3 degrees off. It is a one-time CSS transition from `@starting-style`, with no JavaScript and no scroll stage. The stagger is a per-piece `--d` inside the transition shorthand, so specificity can never reset it.

```css
.collage .piece {
  rotate: var(--r);
  transition:
    translate 560ms cubic-bezier(.16, 1, .3, 1) var(--d),
    rotate 560ms cubic-bezier(.16, 1, .3, 1) var(--d),
    opacity 180ms linear var(--d);
}
.collage .p-sky     { --r: -1deg;  --d: 120ms; }
.collage .p-braille { --r: .5deg;  --d: 300ms; }
.collage .p-plan    { --r: -2deg;  --d: 480ms; }
.collage .p-hand    { --r: 2deg;   --d: 660ms; }

@media (prefers-reduced-motion: no-preference) {
  @starting-style {
    .collage .piece { opacity: 0; translate: 0 -12px; rotate: calc(var(--r) + 3deg); }
  }
}
```

The last piece lands by 1,220ms. The print, the text and the tapes never move. Plates change only through the section transition of 8.4.

### 8.2 Phones

Below 48rem the collage starts 24px under the actions, so only the handwriting scrap and the top of the sky block are above the 844 fold. The signature plays only where it can be seen:

```css
@media (max-width: 47.99rem) {
  .collage .p-sky  { --d: 60ms; }
  .collage .p-hand { --d: 240ms; }
  .collage .p-braille, .collage .p-plan { transition: none; }
}
```

With no transition, `@starting-style` has no effect, so the Braille strip and the plan scrap are simply there when the visitor scrolls down. The handwriting lands by 800ms, while the first screen is being read.

### 8.3 Fallbacks

- **Reduced motion:** the `@starting-style` block sits inside `prefers-reduced-motion: no-preference`, so the board is finished on first paint. No override block is needed. The reduced-motion block sets the poster fade to 0s, turns off smooth scrolling and hides the video badge, because the in-view player never mounts under reduced motion. It is written across several lines, with its closing brace alone at column 0, so a brace-scanning test can read it:

  ```css
  @media (prefers-reduced-motion: reduce) {
    .video__poster { transition-duration: 0s; }
    .video__badge { display: none; }
    html { scroll-behavior: auto; }
  }
  ```

- **Browsers without `@starting-style`** (Safari before 17.5, Firefox before 129) ignore the block and show the finished board.
- **Browsers without masks:** the torn pieces show as plain rectangles of the right colour. Elements whose only shape is a mask (pencil layers, ticks, the bracket, the cell field, the play glyph) are not rendered (section 6.6). Facts are unaffected.

### 8.4 Section transitions

Decision 9. Every plate after the first (Projects, Route, Research, Leadership, Recognition, About: six transitions) opens covered by a copy of the previous plate's stock. As the plate scrolls into view, that cover goes away like paper and reveals the plate's own stock and subject: sky to vermilion, vermilion to kraft, kraft to UB blue, UB blue to leaf, leaf to marigold, marigold to kraft. The Work plate, first after the hero, has no cover.

**Techniques.** Three prototypes were built on the real plates and copy (crumple, tear, fold); Aryan picks one (Pending 10), and the chosen prototype is committed to `docs/superpowers/mocks/` as the reference for milestone 5.

- **Tear (default).** The cover rips along a seeded tear line near the plate's subject: the two pieces pull apart (one lifts and turns a few degrees, the other drops), with white fibre along both torn edges and a soft shadow, and the plate shows through the widening gap. The pieces are the same cover with complementary `clip-path` or mask tear paths generated by `scripts/paper.mjs` and listed in `src/data/paper.ts`. Adds about 0 KB of images.
- **Fold.** The cover folds up on horizontal creases (`rotateX` panels with perspective, darkening as they turn), then the folded packet slides away. Adds under 40 KB of SVG.
- **Crumple.** The cover balls up and drops out of frame. A live crumple would need WebGL, so the frames are pre-rendered offline by a build tool (committed output, listed in `paper.ts` with `source: "code"`) and played with `background-position` on `steps()`. Budget: 700 KB for all six transitions on desktop, smaller frames on phones.

**Rules whatever the technique.**

- The cover is `div.plate__cover`, `aria-hidden="true"`, with no text and nothing focusable, clipped to its plate (`overflow: clip`), never over text. It covers the plate's stock and subject inside the plate box; any part of the subject that overhangs the plate edge (7.3) shows from the start, like a scrap pasted over the seam.
- Motion is scroll-driven CSS: `animation-timeline: view()` on the plate with an `animation-range` taken from the chosen prototype. A probe at milestone 5 checks the cover is gone when the section's `h2` top is still at or below 50% of the viewport height, at 1280x800 and 390x844.
- Only `transform` (and `translate`, `rotate`), `opacity`, `clip-path`, mask position or size, and `background-position` animate.
- The keyframes sit inside `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)`. Outside either, `.plate__cover` is `display: none` and the plate shows its own stock at rest. Firefox without scroll-driven animations gets that static page.
- Phones play the same transition, simplified if needed, with no horizontal overflow.

**Everything else stays still.** Transitions exist on `.collage .piece` (8.1), `.video__poster` (the 240ms opacity fade in 7.4) and the plate covers. Hover changes are instant, underline and colour only. The in-view muted video behaviour from v3 is unchanged. Nothing is JavaScript-driven.

## 9. Accessibility and performance

### Decoration and alt text

- **Hidden decoration:** `div.collage`, every `div.plate` (including the Research note), every `.tape`, `.slab__tear`, `.video__play` and `.video__badge` are `aria-hidden="true"`. None contains a link, button, `tabindex`, text other than the Research note, or an `<img>` with non-empty alt.
- **Text tapes are never hidden.** `span.hl--sky` and `span.hl--marigold` carry facts (the Next sentence and the five results). They never carry the class `tape` or `aria-hidden`, and no hidden subtree contains a result or a title-block sentence (tested, section 10.2).
- **Inline SVG,** if any ships, carries `aria-hidden="true"` and `focusable="false"` and contains no `<text>`.
- **CSS-only marks:** ticks, the bracket and the "1 of 2" tape are pseudo-elements, with nothing in the DOM.
- **Prints** carry their `rooms.ts` alt verbatim.
  - Room prints name the action through `<span class="sr-only">Open full photo</span>` inside the button, so the accessible name is "{alt} Open full photo" (changed from v3's "Open full photo: {caption}", New copy row 8).
  - The `pillar-pair` print uses the extra's alt.
- **Duotones** are `alt=""` inside hidden plates. Video posters keep "Video: {title}".
- **No alt or hidden text repeats "1 of 2" or "1 of 15".**

### Focus

| Where | Style |
|---|---|
| Everywhere | `:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }` |
| The "1 of 2" figure on its marigold tape | `outline: 3px solid var(--on-stock); outline-offset: 2px; box-shadow: 0 0 0 8px var(--fibre)`: an ink ring with a paper halo that reads in both themes |
| On the slab | the slab accent #7DB0FF (7.89 and 7.12) |
| Prints | the outline wraps the whole fibre frame |
| Skip link | appears on focus in `--accent` with `--on-accent` text |

No other control sits on a stock: the Next and result tapes hold no links.

### Layout limits

- **No horizontal scroll from 320 to 390.**
  - `overflow-x: clip` is allowed only on `.hero`, `.plate` and `.slab__tear`. Never on `html` or `body`, so real overflow cannot hide.
  - No width in `vw` above 100, and no negative margin wider than the gutter.
  - The probes check `scrollWidth` at 320, 360, 375, 384 and 390, which include both sides of each phone zoom tier (5.4).
- **Email and Resume above the fold.**
  - At 390x844 they sit at y 614 to 662.
  - The bottom of Email must be at or above y 664 at 390 wide, so it also shows in Safari with its toolbars.
  - At 1280x800 they sit at y 673 to 721.
  - At 1024x768 they sit at y 705 to 753.
- **200% zoom** reflows to the phone layout. Targets: stubs are 30px tall (above the 24px minimum), and nav, menu and profile links are at least 44px.

### Keyboard and screen-reader order (facts precede art)

1. Skip link, then the name.
2. Nav links (or Menu).
3. The ledger: "1 of 2", Source: UB Student Life, "1 of 15", Source: SUNY, "Co-author", Source: Paper, PDF.
4. Email Aryan, then Resume (PDF).
5. The hero print button, then its caption receipt.
6. Then each section in order. Within a row: index links, then body links and stubs, then margin prints and caption receipts.
7. Then the footer.

Screen readers hear the title block as three term and definition pairs ("Study, B.S. Computer Science..."), and never meet the collage or the plates. In every card, the h3 and body precede the print in the DOM.

### Budgets

| Item | Budget |
|---|---|
| `index.html` | 20 KB gzipped or less (unchanged; v3 is 16.0 KB) |
| Built CSS | 18 KB gzipped or less |
| Inline `<svg>` in `index.html` | 1,024 bytes raw or less |
| Inline scripts (the existing two, both inline) | 3 KB gzipped or less in total |
| Fonts, woff2, latin | 180,000 bytes or less in total (171,736 B measured on 26 October 2026, section 5.3). If over, drop opsz from the roman request (50,952 B without it) and set the h1 and figures without optical sizing. |
| Hero print (AVIF, 634w) | 60 KB or less |
| Paper assets fetched at load (every mask and background file, wherever it sits on the page) | 110 KB transferred or less, measured from a cold load's network log |
| First desktop load, lazy images excluded (HTML, CSS, fonts, scripts, hero print, paper assets) | 600 KB or less (v3's criterion was 900 KB) |

### Speed targets

- Lighthouse mobile (simulated Moto G Power, slow 4G): LCP 2.5s or less, CLS 0.05 or less, TBT 50ms or less.
- Desktop: LCP 1.2s or less.
- Lighthouse accessibility 100, and no axe violations.
- **Image loading:** only the hero print loads eagerly, with `fetchpriority="high"`. Every other image is `loading="lazy"`.

### JavaScript

No new runtime JS. The two existing inline scripts change in place:

- the nav script adds a second IntersectionObserver on `#page-end` (7.10);
- the video loader keeps the poster until the iframe loads, and a poster click remounts a still-loading muted player with sound (7.4).

v4 adds no external script. The `assetsInlineLimit` function of section 6.4 keeps both component scripts inline, and a build test checks that they are (section 10.2). Since `8b5fc4b` no test bans `<script src>` in general.

## 10. Test contracts

`npm run check` (source tests, build, built-output tests) stays the gate. This section is written against the branch head, commit `8b5fc4b`; test names in quotes are the names at that commit.

Every milestone ends green, so each assertion lands in the milestone that builds what it checks. The milestone is given as M1 to M7 on every entry below, and section 11 repeats the list per milestone.

**Shared helpers** live in `tests/lib/html.mjs` (no dependency; `npm test` lists its test files by name, so the helper is never run as a test):

- `textOf(html)`: replace every tag with one space, decode entities, collapse each run of whitespace to one space, and trim. Data strings are compared after the same collapse and trim. Every text check below uses it.
- `elements(html, test)`: a small tag-depth scanner that returns the outer HTML of each element whose opening tag passes `test`.

### 10.1 Assertions that change

**`tests/portfolio-source.test.mjs`**

1. **`componentFiles`** (M3, M4, M5). A file joins the list in the milestone that creates it, because `read()` throws on a missing file.
   - M3: remove `src/components/Frame.astro` and `src/components/ChapterFigure.astro`; add `Print.astro` and `PhotoPopover.astro`.
   - M4: add `TitleBlock.astro` and `Collage.astro`.
   - M5: add `Plate.astro`.
2. **"sections keep the approved order and the frame wraps main and footer"** (M3). Renamed "sections keep the approved order".
   - Old: the markers `['<div class="rooms"', "<Frame", "<main", "<Hero", "<Experience", "<Projects", "<Trajectory", "<Research", "<Leadership", "<Recognition", "<About", "</main>", "<SiteFooter", "</div>"]` in order.
   - New: the markers `["<SiteNav", "<main", "<Hero", "<Experience", "<Projects", "<Trajectory", "<Research", "<Leadership", "<Recognition", "<About", "</main>", "<SiteFooter"]` in order, plus `assert.doesNotMatch(page, /<Frame|class="rooms"/)`.
3. **"each room has a chapter, a CSS timeline, and a caption without a denominator"** (M3). Renamed "rooms stay twelve, captioned, and owned".
   - Kept: `assert.equal(rooms.length, 12)`; `assert.doesNotMatch(room.caption, /\b1 of \d+/)`; `assert.ok(room.alt.length >= 30)`; every extra points at a known room.
   - Removed: the `data-room=\{project\.id\}`, `data-room=\{award\.id\}` and `data-room=\{item\.roomId\}` regexes; the loop that requires a literal `data-room="<id>"` in component source for the rooms outside `dynamicRooms` (hero, research, contact); ``styles.includes(`--r-${room.id}`)``; `styles.includes("timeline-scope:")`.
   - Added:
     - `assert.equal(extras.length, 8)` (new; the old test had no such assertion);
     - no room has `fit`; `aspect` is one of `"3:2"`, `"4:5"`, `"natural"`; `pillar` is `"4:5"`; `streamfair` and `contact` are `"natural"`; `ogRoom === "pillar"`;
     - for `pillar`, `hero`, `research` and `contact`, `components()` matches ``new RegExp(`<Print[^>]*\\broom=["']${id}["']`)``;
     - `Projects.astro` matches `/room=\{project\.id\}/`, `Recognition.astro` matches `/room=\{award\.id\}/`, and `Leadership.astro` matches `/room=\{item\.roomId\}/`;
     - `Print.astro` matches `/data-room=\{room\}/` and ``/popovertarget=\{`photo-\$\{room\}`\}/``;
     - no `--r-<room id>` name remains in `global.css` (the frame's timelines are gone; this checks the frame's removal, not motion).
4. **"reduced motion is still handled and no vh units remain"**. Kept exactly as written at `8b5fc4b`: a reduced-motion block exists, and no `vh` units. Added (M4): every `@starting-style` in `global.css`, found by brace matching, sits inside `@media (prefers-reduced-motion: no-preference)`. That is reduced-motion handling, which `8b5fc4b` keeps. Nothing that `8b5fc4b` removed comes back (10.3).
5. **"the visual system keeps one accent, theme and focus safeguards, and no template tells"**.
   - Kept as written: `--accent:`, the `--accent-(2|secondary|alt|b)` ban, the dark media query, `:focus-visible`, `min-width: 64rem`, `max-width: 63.99rem`, `@media print`, and the gradient, `cursor: none`, `backdrop-filter`, monospace and Inter bans.
   - Changed (M4): the hero rule becomes `/\.hero(?:\b|__)[^{]*\{[^}]*(?<![a-z-])gap:/s`. The old `\.hero\b` form covers `.hero` and `.hero-art` but not `.hero__actions`, because `_` is a word character.
   - Added (M1): every `--accent:` value is `#005BBB` or `#7DB0FF`, compared case-insensitively; `"Source Serif 4"` and `"Instrument Sans"` are present, and `Newsreader` is absent from the CSS and `BaseLayout.astro`; no `cursive` font family and no `Kalam`.
6. **"navigation exposes the current section without scroll listeners or swap hooks"** (M6). All kept, plus `assert.match(nav, /page-end/)` and exactly two `new IntersectionObserver` in `SiteNav.astro`.
7. **"package pins Astro 7, Node 24, and Sharp for the crop pipeline"** (M2). All kept, plus `assert.equal(packageJson.devDependencies["perfect-freehand"], "1.2.2")` and `assert.equal(packageJson.dependencies, undefined)`.
8. **"served source rejects theatre-era patterns, autoplay, and raw iframes"** (M1). The ban list stays as at `8b5fc4b`. The em and en dash check widens from `components() + portfolio.ts` to `components() + portfolio.ts + rooms.ts + css()`, because `rooms.ts` captions and alt text and CSS `content:` strings are served too. None of them contains a dash today (checked 26 October 2026).

**`tests/portfolio-build.test.mjs`**

9. **"built first screen carries the fixation lines, the ledger, and both actions"** (M4).
   - Old: `assert.ok(html.includes(identity.fixationLine))` and the same for `fixationLineShort`.
   - New: `textOf` of every `span.tb__long`, joined in order with single spaces, equals `identity.fixationLine`, and the `span.tb__short` texts equal `identity.fixationLineShort`. Exactly three `<dt>` read Study, Work, Next. `span.hl--sky` contains exactly the first Next sentence, in both versions.
   - Kept: the ledger fractions, "Email Aryan", "Resume (PDF)" and the resume href.
10. **"built images reserve space, describe themselves, and load in the right order"** (M3, raised at M5).
    - Old: `images.length >= 22`, `lazy === images.length - 12`, 12 `loading="eager"`, `<picture>` at least 22.
    - New at M3: `images.length === 37` (13 prints, 12 popover photos, 8 popover extras, 4 YouTube posters); `<picture>` count `=== 33`; exactly one `loading="eager"`, inside `figure.print--hero`; `lazy === images.length - 1`.
    - New at M5: `images.length === 39`, adding the 2 plate duotones. They are plain `<img>` through Astro `<Image>`, so `<picture>` stays 33.
    - Kept: width, height and alt on every image; exactly one `fetchpriority="high"`; `type="image/avif"`.
11. **"built frame has eleven rooms, popovers, and no hidden focusable content"** (M3). Replaced by "each room renders once beside its claim":
    - each room id appears exactly once as `data-room="<id>"`, inside its owner:

      | Rooms | Owner |
      |---|---|
      | `pillar` | `section.hero` > `div.hero-art` |
      | `hero`, `dots` | `#project-dots` |
      | `armie`, `streamfair`, `wod`, `safeline` | `#project-<id>` |
      | `research` | `#research` |
      | `cleancampus` | `#leadership-clean-campus` |
      | `chancellor`, `pbk` | `#recognition-<id>` |
      | `contact` | `footer#contact` |

    - no `section`, `article`, `footer` or popover element carries `data-room` (v3 put it on `section.hero`, `#research` and `footer#contact`);
    - `id="photo-<id>"` appears exactly once for each of the 12 rooms, and each of those elements has a `popover` attribute;
    - no element with a `popover` attribute sits inside `class="hero-art"`;
    - each extra's caption appears inside its room's popover;
    - `data-extra="pillar-pair"` sits inside `#recognition-pillar`, with the exact caption and no `Source:` inside that figure;
    - at least 13 `popovertarget="` (12 prints plus the menu).
    - Removed: the frame slice and its checks. `assert.doesNotMatch(frame, /aria-hidden="true"/)` becomes the hidden-subtree test (10.2). `assert.match(builtCss, /timeline-scope/)` and `assert.match(builtCss, /animation-timeline/)` are deleted, not turned into bans (10.3).
12. **"built HTML stays small and the deploy folder has no server leftovers"** (M3). All kept (20 KB gzip, no `dist/server`, no `_headers`, `og.jpg`, `resume.pdf`), plus built CSS at 18 KB gzipped or less.

### 10.2 New tests

**Source tests** (`portfolio-source.test.mjs`)

- **Title-block joins (M1).** `titleBlock.flatMap((r) => r.long).join(" ") === identity.fixationLine`, and the same for `short` and `fixationLineShort`. Labels deepEqual `["Study", "Work", "Next"]`. The Next row has exactly two sentences in both versions.
- **Copy freeze (M1).**
  - `scripts/freeze-copy.mjs` runs once, first in milestone 1, before any data edit. It writes `tests/fixtures/copy-v3.json`. At that point `src` equals commit `4d67042` (`git diff 4d67042 HEAD -- src` is empty, checked 26 October 2026). It serialises every export of `portfolio.ts`, the `id`, `caption`, `alt`, `receipt` and `source` of every room, and the same fields plus `room` for every extra.
  - The test deepEquals the current data against the fixture. It ignores `titleBlock`, `ogRoom`, `fit` and `aspect`. `colophon.type` may equal its v3 string or the section 4.4 row 6 string. `colophon.version` may equal its v3 string or the row 7 string with `{merge month}` replaced by an English month name.
  - The fixture is regenerated only in a commit that applies a content change Aryan approved, and that commit message names the approval. The expected case is the "1 of 2" source (4.5).
  - `ledger[0].receipt`, `recognitions.find((r) => r.id === "pillar").receipts[0]` and `rooms.find((r) => r.id === "pillar").receipt` are equal in `label` and in `href`. The test reads these three uses because `source` is not exported from `portfolio.ts`.
- **Stocks and hex (M1).** Parse `global.css`:
  - each of the six `--stock-*` custom properties is declared exactly once, in the light `:root`, and none in the dark block or `.slab`;
  - hex literals (`#[0-9a-fA-F]{3,8}\b`) and `%23` appear only in the light `:root`, the dark `:root`, `.slab` and the `@media print` block;
  - compared case-insensitively, each stock hex appears in exactly one `--stock-*` declaration, and the only other place a stock hex may appear is `#005BBB` as the light `--accent` value;
  - `var(--stock-` appears only in `background` or `background-color` declarations: never in a custom-property declaration, and never in `color`, `outline*`, `border*`, `text-decoration*`, `stroke`, `fill`, `box-shadow`, `filter` or `caret-color`;
  - a rule that uses `var(--stock-X)` passes when every selector in its list, with `::before` or `::after` removed, equals or ends with one of X's selectors in 5.2 (also compared with `::before` and `::after` removed);
  - each of the rules `.fig--tape`, `.hl--sky` and `.hl--marigold` that exists declares `color: var(--on-stock)`; from M5, all three must exist.

  Before most stocks are used, these pass trivially; from then on they guard every milestone. To pass on the v3 layout, milestone 1 tokenises v3's `.video__badge` (#fff), `.video__frame` and `.video__file` (#000), as 7.4 specifies.
- **No pencil or line art on marigold (M2).** For every `paperAssets` entry of kind `pencil` or `line`, no CSS rule that references its file has a selector containing `--recognition`, `fig--tape` or `hl--marigold`.
- **Collage limits (M4).**
  - `Collage.astro` holds exactly four `class="piece` elements (the hard cap stays 5) inside one `aria-hidden="true"` wrapper.
  - The wrapper contains no `<a`, `<button`, `<img`, `tabindex`, `popover` or text node.
  - The `<Print` comes before the collage wrapper.
- **The `@starting-style` guard (M4)** is item 4 of 10.1. The count, selector and property limits of section 8.1 are a design rule checked at visual review, not a test, since Aryan asked for the motion bans to go (10.3).
- **Receipts (M5).**
  - `Source.astro` has exactly the variants `inline` and `stub`.
  - `components()` plus `portfolio.ts` have no match for `/\btier(?:s|ed)?\b|self-reported|public-record|No public link/i`.
- **Leadership numerals and the Research split (M5).** The test imports `src/lib/text.ts` (Node 24 strips the types):
  - for every leadership summary `s`, `numeralRuns(s).map((r) => r.text).join("") === s`;
  - the runs with `num: true`, in order across all summaries, equal `["30,000", "50,000", "450+", "3", "150", "500", "30,000"]` (checked against the data on 26 October 2026);
  - `researchParagraphs(research[0].detail).join(" ") === research[0].detail`, and each paragraph holds two sentences;
  - `Leadership.astro` and `Research.astro` import from `../lib/text`.

**Paper tests** (`tests/paper.test.mjs`, M2, added to the `test` script)

- **Provenance manifest.**
  - The set of files in `src/assets/paper/` equals the set of `paperAssets` files under that folder, and `public/og.jpg` is listed (v3's file until milestone 6 regenerates it).
  - Every entry names a `generator`. Every `code` entry has a numeric `seed` (0 for `solidMask`, `playGlyph` and `graphTile`). Every `aryan` entry has `from.path` under `Pictures/`. Every `colour` entry has a `tokens` array (empty only for `grain.svg`).
- **Determinism.** Every `code` file regenerates byte for byte from the generators in `scripts/paper/`.
- **Budgets.**
  - Every file is at or under its `budget`.
  - Every file with a budget of 1,000 B or less is under 1,024 B raw, so it inlines.
  - The folder totals 240 KB raw or less. Masks total 60 KB or less, and pencil and line files 90 KB or less.
- **Decorative SVG rules.**
  - No paper SVG contains `<text`, `<a`, `<script`, `<foreignObject`, `href="http`, or an event attribute.
  - `mask`, `pencil` and `line` files contain no colour literal except `#000`, `black` or `none`.
  - In `colour` files, every colour literal is a 6-digit hex equal to the current value of a token in that entry's `tokens`, and no file uses `rgba(`. This is the token-drift check that keeps the text-tape end caps in step with `global.css`.

**Build tests** (`portfolio-build.test.mjs`)

- **Scripts stay inline (M2).** `index.html` holds a `<script type="module">` with no `src` whose body contains `site-menu` (SiteNav), and another whose body contains `youtube-nocookie.com` (Video). No file under `dist/client/_astro` has a name starting `SiteNav.astro` or `Video.astro` and ending `.js`. This catches the inline-limit regression of section 6.4 without banning external scripts in general, which `8b5fc4b` allows.
- **No theme toggle (M1).** `index.html` contains no `data-theme`.
- **CSS budget (M3).** Built CSS is 18 KB gzipped or less.
- **Hidden subtrees (M3, extended at M4 and M5).**
  - No `aria-hidden="true"` subtree contains `<a`, `<button`, `tabindex`, `<input`, a `popover` attribute, or an `<img` whose `alt` is not empty.
  - No element whose class list includes `hl--sky` or `hl--marigold` also has the class `tape` or `aria-hidden="true"` (M4).
  - No `aria-hidden` subtree and no `.tape` element contains any project result or any `titleBlock` sentence, compared with `textOf` (M5).
- **Facts precede art (M4, extended at M5).**
  - In `section.hero`, `class="ledger"` and "Resume (PDF)" each come before `class="hero-art"`. Inside `hero-art`, `<figure class="print` comes before `class="collage"`.
  - M5: in every `<article` that contains `<figure class="print`, an `<h3` exists and comes before the first print. Leadership's `h3.meta-lead` makes this hold for the Clean Campus row.
- **Inline SVG (M4).** The total length of all `<svg ... </svg>` in `index.html` is 1,024 bytes or less. Every `<svg` carries `aria-hidden="true"` and `focusable="false"` and contains no `<text`.
- **Built CSS keeps Safari's prefixes (M4).** The built CSS contains `-webkit-box-decoration-break:clone` and `-webkit-mask-image` (section 6.4, `cssTarget`).
- **Plates (M5).** The built page has exactly seven `div.plate`, with the classes `plate--work`, `plate--projects`, `plate--route`, `plate--research`, `plate--leadership`, `plate--recognition` and `plate--about`, in section order. Each is `aria-hidden="true"` and holds one or two elements whose class list includes `piece` or `plate__art`. The only text inside any plate is the Research note.
- **The delete test (M5).**
  - Remove every element with `aria-hidden="true"`, every `<figure class="print`, every element with a `popover` attribute and every `<figure class="video`.
  - `textOf` of what remains contains each of these strings, checked one by one:
    - `experiences`: company, role, place, period, outcome, detail, myPart;
    - `projects`: name, event, date, result, pool, built, myPart, each team name, aside;
    - `route`: period, title;
    - `research`: title, role, period, summary, detail;
    - `leadership`: title, role, period, summary;
    - `recognitions`: title, fraction, denominator, context, date;
    - `about`: text;
    - `ledger`: fraction, text;
    - each `titleBlock` label, and each sentence of every row's `long` and `short` arrays.
  - The remaining HTML contains, as `href` values, every `receipts[].href` of experiences, projects, research, leadership and recognitions, every `ledger[].receipt.href`, every `route[].href` and every `about[].href`. Relative hrefs such as `resume.pdf` match with an optional `/website` base prefix, as the 404 test does.
- **Exceptions and stubs (M5).** `#leadership-men-in-green` contains no `class="stubs"`. `#project-armie` holds one `div.stubs` with 2 `a.stub`, and `#project-safeline` holds one with 1.

### 10.3 Unchanged, and what `8b5fc4b` removed

**Unchanged.** Every assertion in the three test files at commit `8b5fc4b` that 10.1 does not name stays exactly as written. That includes:

- **Source:** "navigation labels and section ids are complete"; "the first screen carries status, target, and three sourced proofs" (`fixationLineShort.length <= 130`, the required facts, one bold ledger row, the first two fractions, absolute ledger receipts, anchors to Recognition or Research); "every claim has a receipt or a documented exception"; "retired figures and stories are gone from the source", including the `published` ban; "every section heading is a sentence, not a bucket label"; the gradient, `cursor: none`, `backdrop-filter`, monospace and Inter bans; the `vh` ban; the lofi, curtain, intermission, "end credits", "custom cursor", "scroll hijack", autoplay and `<iframe` bans; the `Video.astro` assertions (IntersectionObserver, `youtube-nocookie.com`, `mute=${muted ? 1 : 0}`, `prefers-reduced-motion: reduce`, `preload="none"`); no `astro:after-swap`.
- **Build:** "built homepage exposes semantic recruiter content and social metadata" (title, description, `og:image`, `twitter:card`, no `http://localhost`, JSON-LD with `alumniOf`, skip link, landmarks, one h1, section ids); "built links are actionable and external links are safe" (no `href=""` or `href="#"`, no `<iframe`, at least 5 `data-video`, no autoplaying `<video>`, muted `playsinline`, the Safeline file, at least 12 external links, all `noopener noreferrer` with new-tab text); "built page states each award once in full and never repeats retired figures" (the two-appearance cap on "1 of 2" and "1 of 15"); "built 404 page offers a route home".
- **Workflow:** `tests/github-pages-workflow.test.mjs`.

**Removed by `8b5fc4b` at Aryan's request** ("remove the tests that ban the animations. we can have animations"), and they stay removed: the `@supports (animation-timeline: view())` gate; the reduced-motion property allowlist; the `animation-iteration-count: infinite` ban; the `three.js`, `webgl`, `scrolltrigger` and `<canvas` source bans; the built `<script src` and `<canvas` bans.

**New for the section transitions (M5):** every `.plate__cover` in the built HTML is `aria-hidden="true"` and has no text and no focusable element; every rule that sets `animation-timeline` in `global.css` sits inside both `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)`; outside those blocks `.plate__cover` is `display: none`.

## 11. Build sequence

Each milestone ends with a green `npm run check` (`PATH=/opt/homebrew/opt/node@24/bin:$PATH npm run check`) and a visual check. The visual check is screenshots at 1280x800, 1024x768, 390x844 and 320x640, light and dark, plus the probes of 7.11 that apply from that milestone, shared with Aryan in the session and not committed.

Commits are authored as Aryan with no co-author or tool trailers, per their standing instruction.

**Two implementation plans.** Plan A covers milestones 1 and 2: tokens, fonts, title-block data, the copy freeze, the paper pipeline and its tests. Plan B covers milestones 3 to 7: frame retirement, prints, hero, plates and sections, footer, 404, print, OG and QA. Plan B depends on Plan A's tokens and committed assets. Both keep the per-milestone `npm run check` gate.

| # | Milestone | Done when | Days |
|---|---|---|---|
| 0 | Spec review | Aryan has read section 4.4 and the ten pending items in section 12, and their answers are folded into this file. Milestone 0 does not gate milestones 1 to 4. The Pending 10 answer is recorded in section 1 before milestone 5, and Pending 2 is answered before milestone 6. | |
| 1 | Foundations | `scripts/freeze-copy.mjs` runs first, then `tests/fixtures/copy-v3.json` and the copy-freeze test. Source Serif 4 swap; the four fallback faces with measured metrics; CLS measured with the font requests blocked. The tokens of 5.1 (light, dark, slab) replace v3's, and v3's video badge, frame and file hexes are tokenised. Type scale; spacing; focus; nav restyle. `titleBlock` with its join test. Tests: 10.1 items 5 (added part) and 8; 10.2 title-block joins, copy freeze, stocks and hex, no theme toggle. The frame still runs. Visual: type and colour on the v3 layout, both themes; the `scrollWidth` probes. | 1.0 |
| 2 | Paper pipeline | `scripts/paper.mjs` and `scripts/paper/*`; `src/data/paper.ts` (with `og.jpg` listed, still v3's file); every other asset of 6.4 generated and committed; `astro.config.mjs` with the inline-limit function and `cssTarget`; `perfect-freehand` 1.2.2. Tests: `tests/paper.test.mjs` (provenance, determinism, budgets, SVG rules, token drift); 10.1 item 7; no pencil on marigold; scripts stay inline. No page uses the assets yet. Visual: a contact sheet in the scratchpad (not the repo), built with the production CSS (the same selectors, mask properties, wrapper filters, grain tile and text tapes), shown beside the mock's inline-SVG rendering of the same seeds in Chrome, Safari and Firefox at 1x and 2x. The arena and Clean Campus duotones are checked at full size for any head or face. Aryan approves the sheet ("not mechanical") before milestone 3. | 2.0 |
| 3 | Frame retirement and prints | `Frame.astro` and `ChapterFigure.astro` deleted; `Print.astro` and `PhotoPopover.astro`; `crop-rooms.mjs` aspects, fibre flatten, `withoutEnlargement`, no OG; `div.hero-art` holding the pillar print, with `#photo-pillar` outside it; every room rendered once in its owner (4.3), including the second Dots print and the `pillar-pair` print; `data-room` only on prints. Tests: 10.1 items 1 (M3 part), 2, 3, 10 (37 images), 11 and 12; 10.2 CSS budget and hidden subtrees. Visual: every print beside its claim; popovers open and close by keyboard; the `#photo-pillar` zoom probe. | 1.25 |
| 4 | Hero and signature | `TitleBlock`, `Ledger` (with the three-layer "1 of 2" tape), actions, `Collage` with four pieces at the 7.1 coordinates; the arrow rule passing at three sizes; the `@starting-style` signature and its phone rules. Tests: 10.1 items 1 (M4 part), 4 (added part), 5 (changed part) and 9; 10.2 collage limits, text tapes never hidden, facts precede art (hero), inline SVG, Safari prefixes. Visual: a mid-paste screenshot at about 450ms (sky and Braille partway, plan and hand not started), the finished board, phone at the fold, and reduced motion; the finished hero and a wrapped Next tape in Safari and Firefox. | 1.5 |
| 5 | Plates and sections | `Plate.astro` for seven plates, with the tablet rules of 7.3; Work, Projects (index, result tapes, demo mats, asides with brackets), Route, Research (split detail, cell field and note), Leadership (h3 titles, row ids, numerals), Recognition (figures and denominators, band, plain-mat video), About (ticks); the six section transitions of 8.4 in the technique Aryan chose; `src/lib/text.ts`; the `Video.astro` poster fade and poster click. Tests: 10.1 items 1 (M5 part) and 10 (39 images); 10.2 receipts, numerals and Research split, hidden subtrees (M5 part), facts precede art (cards), plates, the delete test, exceptions and stubs. Visual: each section at 1280x800, 1024x768, 768x1024, 390x844 and 320x640, both themes; plates reviewed against "more than a divider"; a frame strip of each transition at 0, 25, 50, 75 and 100% plus the mid-screen probe of 8.4; the static plates under reduced motion and in Firefox; the poster fade in Chrome, Safari and Firefox. | 2.75 |
| 6 | Footer, 404, print, OG | Slab, tear, footer sheet (one column below 64rem), the colophon as Aryan answered Pending 2, `#page-end` with its own observer; 404; print stylesheet; `og.jpg` from `paper.mjs`; `theme-color`; README describes v4. Tests: 10.1 item 6. Visual: footer in both themes, a print preview PDF, the OG card in a link-preview checker run locally, `og.jpg` not blank at the face, the arrow line within 16px of the face; the Contact probe at maximum scroll. | 0.75 |
| 7 | QA and approval | Chrome, Safari and Firefox; VoiceOver pass; keyboard pass; Lighthouse and axe; every budget in section 9 measured and recorded; the probes at all ten sizes; a check on Aryan's own phone; if row 7 was approved, `{merge month}` in `colophon.version` set to the merge month. Aryan reviews the finished branch. | 1.25 |
| | **Total** | | **10.5** |

**Main and the live site do not change until Aryan approves the finished branch.**

- No merge, no push to `main`, and no manual run of the "Build and deploy GitHub Pages" workflow from `v4-paste-up`. Its deploy job runs on any event other than `pull_request`, including `workflow_dispatch`, so a manual run would publish the branch.
- A pull request may be opened for CI. Its deploy job is skipped by `if: github.event_name != 'pull_request'`.
- After approval, the merge to `main` deploys through the existing workflow.

## 12. Risks and mitigations

| Risk | Mitigation |
|---|---|
| **Collage taste.** Generated tears and pencil art can look mechanical. | The generators are the ones that produced the approved mock (hand-tear model with rim and fibres, two-pass pencil lines, illegible scribble). Seeds are fixed. Milestone 2's contact sheet is reviewed and approved before any asset reaches the page. Only Aryan's hand appears as legible handwriting. |
| **Production paper renders differently from the mock.** The mock used inline SVG with fills and an SVG grain filter, and no CSS masks. The build uses mask files on pseudo-elements, shadows on unmasked wrappers, periodic edge strips, `mask-composite` and a grain tile, untested in any engine. | Milestone 2 renders the contact sheet with the production CSS in Chrome, Safari and Firefox at 1x and 2x, beside the mock's rendering of the same seeds, before milestone 3. Milestone 4 adds Safari and Firefox screenshots of the finished hero. |
| **Homage.** Opus readers may still see the launch page. | No flanking strips, centre panel or scroll growth. No pencil on marigold (tested). Grain uses its own frequency. Every photo and the handwriting are Aryan's; every other drawing is generated by `scripts/paper.mjs` and listed in `src/data/paper.ts`. |
| **The arrow misses after fonts load or at other widths.** | The aim depends only on collage geometry, which is fixed in px and scaled by `zoom`. The probe rule (7.1) runs at three sizes from milestone 4, with a nudge range set. |
| **A tight phone fold.** Email ends at y 662, two pixels inside Safari's toolbar-reduced 664. | The 664 limit is a probe check. If real fonts push it down, the ledger row padding drops from 12px to 10px on phone before anything else moves. |
| **HTML budget.** Thirteen prints, twelve popovers, plates and stubs. | No inline paths (inline SVG at 1,024 bytes or less). Pieces are empty divs styled by CSS. v3's twelve duplicate frame figures are gone. Expected size is about 16 KB gzipped against the 20 KB cap. |
| **Asset requests.** About forty mask files load with the page, and GitHub Pages caches hashed files for only 600 seconds. | Files under 1,024 B inline into the CSS. GitHub Pages serves HTTP/2 and gzips SVG. All paper assets fetched at load are capped at 110 KB transferred. The short cache means a revalidation on a return visit; accepted. |
| **Build output drops Safari's prefixes.** Astro builds CSS for `esnext`, and Lightning CSS then strips `-webkit-box-decoration-break` and adds no `-webkit-mask-*` (verified in a build). Safari would lose the text-tape ends on wrapped lines, and Chrome 111 to 119 would draw pencil layers as solid boxes. | `cssTarget` in `astro.config.mjs` (6.4) keeps the prefixed forms, and a built-CSS test checks both. Mask-only elements sit inside `@supports` (6.6). Milestone 4 checks a wrapped Next tape in Safari and Firefox. The worst case is a straight-cut tape end on one engine. |
| **`zoom` is missing in Firefox before 126.** | Between 64rem and 72.99rem, `.hero` clips horizontally, so the collage is cropped, never scrolled. Facts are unaffected. Popovers sit outside every zoomed element (7.1). |
| **Pillar portrait resolution.** The source is 1195x793, so the 4:5 crop is 634x793: about 1.9x at a 336px print on a retina screen. | Acceptable. A higher-resolution original from the event photographer would remove it (Pending 3). |
| **Font cost and layout shift.** Source Serif 4 carries an optical-size axis. | The italic is fixed at optical size 20. The measured total is 171,736 B against a 180,000 B budget, with a fallback plan (section 9). Four metric-matched fallback faces cover Apple, Windows and Android, and milestone 1 measures CLS with the fonts blocked. |
| **Copy drift during the rebuild.** | The copy-freeze test against commit `4d67042`. |
| **Contrast under grain.** | Text appears only on marigold and sky, which hold 6.46 and 7.53 at worst. Vermilion and leaf (4.00 and 4.02 under grain) never carry text (tested). |
| **Generator output varies between machines.** | Paths round to one decimal. Node 24 and `perfect-freehand` 1.2.2 are pinned locally and in CI. The determinism test fails loudly instead of silently shipping drift. |
| **Section transitions get in the way of reading.** Six scroll-linked covers could feel slow or gimmicky. | The covers never touch text and are gone before each heading reaches mid-screen (probe, 8.4). One technique for all six. Reduced motion and Firefox get static plates. If it still feels like too much on Aryan's phone, the transition plays on desktop only. |
| **Page length.** Seven plates add about 1,050px on desktop. | The project index lets a recruiter skip the cards. Plates replace v3's eyebrows and rules instead of adding to them. |
| **Accidental publish.** | The rule in section 11 and no `workflow_dispatch` from the branch. |

### Pending (Aryan supplies or confirms)

1. **A better source for "1 of 2".** "Source: UB Student Life" on ledger row "1 of 2" (and on the hero caption, in the `#photo-pillar` popover and on the Recognition stub) points at a generic Pillars of Leadership page. When checked on 26 October 2026, it did not name Aryan, the Innovative Student Leadership award or the 130+ nominations. Aryan should supply a page that does. Until then the link ships unchanged, and this spec invents none.
2. **The New copy table (4.4),** including the two colophon replacements, which go beyond decision 7's UI-label scope and exist only because the v3 sentences would become untrue. Needed before milestone 6.
3. **Optional:** a higher-resolution original of the Pillar portrait (current source 1195x793).
4. **The re-aimed handwriting.** The scrap is moved and turned 2 degrees so its arrow points at Aryan's face. The pencil marks themselves are unaltered and always shown at their own aspect.
5. **The two duotone crops.** LA Hacks: seats and roof only (3% to 18% of the height, checked at full size). Clean Campus: trees and buildings only, with no faces and no watermark.
6. **The research cell-field illustration and its note.** If Aryan declines, both go, and the Research plate carries a fibre graph-paper scrap like About's.
7. **An observation, not changed under decision 7.** `identity.description` (the meta description) says "two-time hackathon track winner", while Projects lists three 1st-place track results (Dots, StreamFair, W.O.D.). Aryan may want to confirm the wording.
8. **A look at the finished branch on Aryan's own phone** before approval.
9. **Code-drawn pencil art.** The Dots floor plan, the Linde-style production log and the route are drawn in code, not by Aryan. Aryan decides whether they need a disclosure like the Research note. Any new line goes in the New copy table.
10. **The section transition technique** (8.4): crumple, tear or fold, chosen from the prototypes. Default: tear. Needed before milestone 5.
