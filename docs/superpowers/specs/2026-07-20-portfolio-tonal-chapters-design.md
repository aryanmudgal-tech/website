# Portfolio Tonal Chapters Refinement

## Status

Approved by the user on July 20, 2026.

## Design read

This is a targeted evolution of a recruiter-first engineering and research portfolio. It uses a warmer editorial-tech language, native CSS, and restrained scroll-driven storytelling.

- `DESIGN_VARIANCE: 7`
- `MOTION_INTENSITY: 5`
- `VISUAL_DENSITY: 4`
- Redesign mode: preserve
- Visual foundation: native CSS with the existing Astro architecture

## Objective

Help a recruiter or hiring manager understand Aryan Mudgal's experience, projects, research, leadership, and recognition quickly while making the page feel distinctive and engaging.

## Content corrections

1. Remove the Building Litos current-work panel and all Litos data. Keep the personal "Outside the work" content and the About navigation destination.
2. Remove PPG Signal Accuracy from Research and Career Path.
3. Career Path uses the columns 2022, 2023, 2024, 2025, and 2026. Remove the empty Now column.
4. Represent SUNY Delegate as a 2022-2025 tenure, positioned at the 2022 start of that tenure.
5. Place Student Senator in 2023.
6. Place Fetal-maternal hemorrhage detection in 2025.
7. Replace the combined University and SUNY honors event with two distinct 2026 events:
   - Award for Innovative Student Leadership
   - SUNY Chancellor's Award for Student Excellence
8. Use those exact two titles in the Recognition section and visibly label both as 2026.
9. Change the visible project title `C.O.R.E. / W.O.D.` to `W.O.D.` everywhere. Preserve the existing Devpost URL and image asset path.

## Tonal chapters

Each major section receives a distinct solid surface from one cool mineral family. The progression must be perceptible but restrained:

- Hero: clear silver paper
- Work: pale mineral blue
- Projects: deeper blue-gray paper
- Career Path: quiet silver-blue
- Research: cool clinical blue-gray
- Leadership: pale slate
- Recognition: muted periwinkle-gray
- About: calm silver
- Contact: the existing cobalt conclusion

The page remains one coherent auto theme. Dark mode uses corresponding charcoal-blue surfaces. There are no gradients, glows, abrupt light/dark inversions, or secondary accent colors.

Full-width chapter backgrounds require the shell container to sit inside sections rather than applying the `shell` class to the section itself where necessary. Existing anchor IDs and primary navigation labels remain unchanged.

## Typography

Remove visible monospace typography entirely. The `--font-mono` token and the SFMono, Consolas, Liberation Mono, and generic monospace stacks must not remain in the served stylesheet.

Use a humanist sans stack throughout:

```css
--font-display: "Avenir Next", "Helvetica Neue", "Segoe UI", sans-serif;
--font-sans: "Avenir Next", "Helvetica Neue", "Segoe UI", sans-serif;
```

Hierarchy comes from weight, size, sentence case, restrained letter spacing, and `font-variant-numeric: tabular-nums`, not a terminal-like face. Large headings may use heavier weights and tighter tracking within the same family.

## Interaction

1. Add a current-section state to the sticky primary navigation.
2. Use `IntersectionObserver`, never a scroll event listener, to update `aria-current="location"` and a visible active underline/weight state.
3. Observe the existing primary destinations: Work, Projects, Research, Leadership, Recognition, About, and Contact.
4. Keep Career Path out of the primary navigation because it is already a supporting section between Projects and Research.
5. Preserve the keyboard-operable Career Path tab interaction and its complete no-JavaScript fallback.
6. Preserve the existing CSS view-entry reveals. Add only subtle chapter edge movement that communicates section progression.
7. All nonessential motion is disabled by `prefers-reduced-motion: reduce`.

## Recruiter clarity safeguards

- The hero, proof band, work, and projects remain first.
- No important copy appears only on hover.
- Project links remain visible and descriptive.
- Real photographs remain the visual evidence.
- The Career Path stays chronological in its DOM order so arrow-key navigation matches the story.
- Copy remains concrete and avoids new claims.
- The existing title, metadata, Person JSON-LD, route, anchor IDs, favicon, and 404 page remain intact.

## Accessibility and performance

- Maintain one `h1`, ordered headings, a working skip link, meaningful alt text, visible focus, and WCAG AA intent.
- The About section retains a valid `aria-labelledby` relationship after the Litos panel is removed.
- The five-column Career Path remains readable on large screens and falls back to the chronological list at 72rem and below.
- No new framework, animation package, font download, client runtime, or external dependency is introduced.
- Animate only transform and opacity.
- Preserve system light/dark preference and reduced-motion behavior.

## Acceptance criteria

1. Litos, PPG Signal Accuracy, the combined honors title, and the visible C.O.R.E. title do not appear in the built page.
2. W.O.D., the two exact award titles, both 2026 award labels, the 2022-2025 Delegate tenure, the 2023 Senator date, and the 2025 FMH date do appear.
3. No visible monospace font declaration remains.
4. Every major section has a solid surface token from the same mineral palette in both light and dark mode.
5. The current primary section is exposed visually and with `aria-current="location"` after enhancement.
6. No `window.addEventListener("scroll")`, gradient, glow, perpetual animation, theatre language, or heavy runtime is added.
7. Source tests, the Astro production compiler, and built-output tests pass without adding a type-check dependency.
8. The final Sites deployment uses verified owner-only access.
