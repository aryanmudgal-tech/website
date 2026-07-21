# Aryan Mudgal Portfolio Redesign Specification

## Objective

Rebuild the existing portfolio so a recruiter or hiring manager can understand Aryan Mudgal's professional direction, strongest achievements, and evidence of impact within 30 to 60 seconds, then explore deeper without friction.

The site must remain engaging, but engagement must come from hierarchy, real artifacts, sharp writing, and one useful interaction. It must not use a theatre, film, or game metaphor as its information architecture.

## Design read

This is a full portfolio overhaul for recruiters and hiring managers, using a proof-first editorial language with a custom career-trajectory interaction.

- `DESIGN_VARIANCE: 8`: asymmetric, editorial compositions with a disciplined grid.
- `MOTION_INTENSITY: 5`: purposeful transitions and interaction feedback, with no scroll hijacking or perpetual spectacle.
- `VISUAL_DENSITY: 5`: substantial enough to communicate experience, but structured for scanning.
- Design foundation: Astro static output, semantic HTML, native CSS, and minimal TypeScript-enhanced behavior.

## Recruiter experience

### Ten-second layer

The first viewport must answer:

1. Who is Aryan?
2. What kinds of problems does he work on?
3. What are the three strongest credibility signals?
4. Where can a reviewer go next?

The first viewport will contain:

- Aryan Mudgal's name.
- Positioning: engineer and researcher building applied AI systems across industrial operations, human-AI interaction, and healthcare.
- One direct contact action and one work-navigation action.
- A real photograph from the existing portfolio.
- A proof band immediately below the hero containing Linde, MIDL acceptance, hackathon recognition, $500K+ budget stewardship, and 30K+ student representation.

### Sixty-second layer

The default scan order is:

1. Professional experience.
2. Selected builds.
3. Career trajectory.
4. Research.
5. Leadership.
6. Recognition.
7. Current work and personal context.
8. Contact.

Each section must state scope, role, and outcome in plain language. No key information may depend on hover.

### Depth layer

External Devpost, demo, LinkedIn, GitHub, and email links provide optional depth. The site does not invent project metrics, roles, publication status, or technical details that the source content does not support.

## Information architecture

Primary navigation labels:

- Work
- Projects
- Research
- Leadership
- Recognition
- About
- Contact

Stable page sections:

- `#top`
- `#work`
- `#projects`
- `#trajectory`
- `#research`
- `#leadership`
- `#recognition`
- `#about`
- `#contact`

The site remains a single-page portfolio for the first implementation. Project details link to existing proof rather than adding shallow routes.

## Content preservation rules

Preserve the following facts from the current site:

- Linde Software Engineer Intern, Summer 2026.
- Meta Layer Initiative Software Engineer Intern, Summer 2025.
- HCLTech Technical Analyst, Summer 2024.
- MIDL-accepted fetal-maternal hemorrhage research.
- Ongoing PPG signal-accuracy and unhealthy-wound detection research.
- Dots, ARMIE, StreamFair, and C.O.R.E. with the existing recognition statements and proof links.
- SUNY Delegate for 30,000+ students.
- Student Senator with stewardship of a $500K+ budget.
- Men In Green, Clean Campus, and the civic platform.
- Student Innovative Leader, SUNY Chancellor's Award, and Phi Beta Kappa recognition.
- Litos is in production and intentionally undisclosed.
- Gym, golf, badminton, acting, mimicry, gratitude to collaborators, and the existing contact links.

Resolve inconsistencies conservatively:

- Use "MIDL-accepted," not "published."
- Use 1,500+ followers for Clean Campus because that is the specific achievement entry.
- Describe "four hackathon recognitions" instead of "4x winner" because ARMIE is an honorable mention.
- Do not repeat event-wide denominators unless their unit is clear.
- Preserve the C.O.R.E. name and existing proof link without adding unsupported project details.

## Visual system

### Theme

Use a monochrome mineral-paper system with one cobalt accent.

- Light surface: cool off-white, not beige craft styling.
- Dark surface: charcoal-black, activated through `prefers-color-scheme`.
- Text: off-black in light mode and soft white in dark mode.
- Accent: one cobalt blue across links, focus states, selected trajectory states, and calls to action.
- Shape: predominantly sharp corners; small controls may use a consistent 0.35rem radius for usability.
- Materiality: documentary photography and closely related mineral surfaces, with no extra filter layer.
- No gradients, glows, glass panels, multi-color section palettes, or generic shadow cards.

### Typography

- Use a strong sans-serif display family and the same family for body hierarchy.
- Use a monospace stack only for dates, roles, and compact metadata.
- Self-host fonts if font files are added later; this version uses resilient system stacks to avoid render-blocking font requests.
- Headlines are left-aligned, tightly tracked, and balanced.
- Body measure stays near 65 characters.
- Visible page copy contains no em dash or en dash characters.

### Imagery

- Use only the seven real photographs already in `assets/`.
- The hero uses `award-leader.jpg` as documentary evidence, not decorative stock imagery.
- Project and recognition imagery use explicit dimensions, responsive sizing, descriptive alt text, and lazy loading below the fold.
- Do not load `lofi.mp3`.
- Do not use generated people, stock photography, or decorative illustrations.

## Section compositions

### Hero

Asymmetric split. The left side contains the positioning and two actions. The right side contains a tightly cropped real photograph plus a short evidence caption. The hero fits within the initial viewport on standard laptop screens.

### Proof band

A compact, horizontally structured evidence band directly under the hero. It contains five independently scannable proof statements, not logos or badges.

### Professional experience

Three editorial rows with date, company, role, and a concise outcome narrative. Linde receives the strongest visual weight because it is current and most concrete.

### Selected builds

Four project features using two distinct layout families:

- Dots is the lead feature with a large photograph and full problem/build/result copy.
- ARMIE, StreamFair, and C.O.R.E. use an asymmetric image-led project matrix.

Every project exposes its proof link without hover. No project card claims sole ownership.

### Trajectory

One signature interaction maps Work, Builds, Research, Leadership, and Recognition across 2024 to 2026.

- Desktop: keyboard-operable event buttons on an editorial timeline grid update an adjacent detail panel.
- Mobile: events collapse to a complete chronological list.
- The initial item is selected server-side.
- JavaScript only enhances selection. Titles and outcomes remain visible without JavaScript.
- Arrow keys, Home, and End move selection among events.

### Research

Three distinct records with status, topic, and practical purpose. The accepted paper is visually prioritized. No horizontal scrolling or synthetic medical illustration.

### Leadership

An asymmetric metric composition showing 30K+, $500K+, 100K+, 1,500+, Men In Green, and the civic platform. Numbers use tabular figures. Context is visible beside every number.

### Recognition

A real-photo strip for the three institutional honors, followed by concise award facts. Images do not reveal hidden copy on hover.

### About and current work

Litos is presented as current work with a clear embargo statement. Personal interests and gratitude appear as a compact humanizing strip, without restarting the theatre metaphor.

### Contact

A direct final section with one contact intent: "Email Aryan." LinkedIn and GitHub remain visible supporting links. No contact form is necessary.

## Interaction and motion

- Native scrolling only.
- No preloader, cursor replacement, autoplay, music, WebGL, game canvas, marquee, horizontal scroll hijack, or automatic credits crawl.
- Motion communicates hierarchy, section entry, or interaction state.
- Use CSS transitions for links, project images, and buttons.
- Use CSS view-timeline reveals only inside `prefers-reduced-motion: no-preference`; unsupported browsers show static content.
- All interactions have hover, active, and visible focus states.
- Reduced-motion mode removes nonessential transforms and animated scrolling.

## Accessibility and resilience

- WCAG 2.2 AA intent for contrast, focus, semantics, and keyboard behavior.
- A skip link is the first focusable element.
- One `h1`; subsequent heading levels remain ordered.
- Meaningful images have specific alt text.
- External links use descriptive labels and safe `rel` attributes.
- All core content renders without client JavaScript.
- Mobile navigation retains every primary section link through horizontal overflow rather than hiding items.
- Dark and light system themes preserve contrast and hierarchy.

## Performance and discovery

- Static Astro output.
- No client framework runtime.
- No third-party animation, font, audio, or WebGL dependency.
- Only the hero image loads eagerly; below-fold images lazy-load.
- Reserve image aspect ratios to control layout shift.
- Target LCP below 2.5 seconds, INP below 200 milliseconds, and CLS below 0.1.
- Include title, description, Open Graph title/description, Twitter card metadata, canonical-ready structure, and Person JSON-LD.
- Include a branded favicon and a useful 404 page.

## Acceptance criteria

The redesign is complete when:

1. A reviewer can identify role and three proof points in the first viewport.
2. Work and projects appear before research, leadership, awards, and hobbies.
3. All existing factual content listed above is represented without unsupported claims.
4. All key content is visible without hover and readable without JavaScript.
5. The trajectory works with pointer and keyboard input.
6. No theatre, film, curtain, credits, soundtrack, WebGL, game, custom-cursor, or scroll-hijack implementation remains in the served page.
7. Desktop and mobile navigation expose Work, Projects, Research, Leadership, Recognition, About, and Contact.
8. The page has exactly one accent color family and no gradient or glow styling.
9. The production build succeeds and automated content, accessibility, and anti-slop checks pass.
