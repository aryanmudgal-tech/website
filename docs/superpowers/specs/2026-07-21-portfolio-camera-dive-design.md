# Portfolio Camera Dive Redesign

## Status

Approved through the July 21, 2026 design conversation. The user selected the Camera Dive direction, approved restructuring the narrative while preserving verified facts and links, and explicitly required Dala-like scroll-scrubbed node transitions around a literal particle brain.

## Objective

Turn Aryan Mudgal's recruiter-first portfolio into a cinematic dark-stage experience where a procedural particle brain acts as the persistent visual world. Normal page scrolling moves the camera between neural clusters, changes transition nodes continuously, and reveals the matching portfolio chapter without hiding or weakening the underlying content.

## Stable foundations

- Keep Astro 7, the static single-page build, the typed `src/data/portfolio.ts` content source, metadata, Person JSON-LD, favicon, skip link, `publicAssetUrl()`, the 404 route, GitHub Pages base-path behavior, and Sites packaging.
- Preserve every verified role, project, research item, leadership fact, recognition, date, image, external URL, and contact path currently served.
- Preserve semantic landmarks, one `h1`, ordered headings, meaningful image alternatives, keyboard access, visible focus, and a complete no-JavaScript reading experience.
- Do not reuse Dala's logo, copy, source assets, exact particle coordinates, or proprietary font files.

## Visual system

- Canvas: pure black `#000000` across the complete page.
- Primary text: `#ffffff`; secondary text: `#bdbdbd`; quiet text: `#8d8d92`.
- Primary action and active cluster: Electric Iris `#8052ff`.
- Transition-node emphasis: Saffron `#ffb829`.
- Supporting neural signals: Verdant `#15846e`, used only inside the procedural artwork.
- Display typography: `"Helvetica Neue", "Avenir Next", Arial, sans-serif`, weight 400, fluid `clamp()` sizing, approximately `-0.045em` tracking.
- Body typography: the same family at weight 300 or 400, 17-19px, with a maximum readable measure of 62 characters.
- No filled section backgrounds, generic cards, decorative borders, heavy shadows, gradients, or competing accent buttons. Photography appears only within evidence panels after the hero.
- Use a subtle CSS noise overlay and canvas particles for depth. The page itself remains flat black.

## Narrative architecture

The page becomes six scroll destinations while retaining the existing anchor contracts:

1. **Hero / Whole brain**: Aryan's name, positioning statement, primary email action, recruiter proof points, and the complete particle brain.
2. **Work / Signal systems** (`#work`): three professional roles. The camera approaches a dense operational cluster and signal paths align.
3. **Projects / Built under pressure** (`#projects`): four public projects with real images and links. The camera moves across a branching cluster whose highlighted nodes correspond to each build.
4. **Research / Earlier signals** (`#research`, containing `#trajectory`): medical-AI work and a compact chronological throughline. The camera dives deeper into a quieter, high-resolution cluster.
5. **Leadership / Scale through people** (`#leadership`, containing `#recognition`): leadership scale and the three institutional recognitions. Nodes widen into a network and resolve into an amber halo.
6. **About / Contact / Pullback** (`#about` and `#contact`): interests, places, gratitude, email, LinkedIn, and GitHub. The camera pulls back to the complete brain.

Primary navigation is reduced to Work, Projects, Research, Leadership, About, and Contact. Existing nested IDs remain linkable even when removed from primary navigation.

## Camera Dive interaction

- A fixed, pointer-transparent `<canvas>` spans the viewport behind all content.
- The engine creates a deterministic original brain silhouette from approximately 1,400 outlined triangular particles on capable desktop devices, approximately 800 on tablets, and approximately 420 on small or lower-powered devices.
- Each particle belongs to one of six named clusters. Cluster centers and camera frames are stable deterministic data, not measured from content layout.
- Scroll position is read during `requestAnimationFrame`; no scroll handler performs rendering work directly.
- The current scroll position is converted into a continuous scene progress value. Camera position, zoom, particle size, opacity, cluster brightness, connection lines, and ambient scatter interpolate between adjacent scene frames.
- The brain remains recognizable at the hero and final pullback. During middle chapters the camera zooms into a cluster, so local nodes fill the viewport and the outer brain recedes.
- Transition nodes visibly change like the Dala reference: inactive nodes dim, the destination cluster brightens, lines draw toward the next cluster, particles spread and regroup, and the active node field changes color as the chapter settles.
- Content uses ordinary document flow. Sections may hold the viewport for pacing, but the page does not intercept wheel/touch input, apply synthetic inertia, or require a custom scrollbar.
- Navigation links and keyboard scrolling remain functional regardless of canvas state.

## Progressive enhancement and resilience

- All portfolio content renders server-side and remains complete when JavaScript or canvas is unavailable.
- The canvas is decorative with `aria-hidden="true"`; textual content carries all meaning.
- `prefers-reduced-motion: reduce` renders one static whole-brain frame, disables camera interpolation, and removes reveal movement.
- If a 2D canvas context cannot be created, add a `brain-unavailable` class and leave the text-first black layout intact.
- Cap device pixel ratio at 1.5, pause rendering when the document is hidden, stop when the canvas is offscreen, and rebuild dimensions on a debounced resize.
- Draw only with Canvas 2D. Do not add Three.js, WebGL, GSAP, ScrollTrigger, Lenis, or another runtime dependency.

## Component boundaries

- `src/components/ParticleBrain.astro`: decorative canvas markup, fallback label, and initialization hook.
- `src/lib/particle-brain.mjs`: deterministic particle generation, scene interpolation, viewport adaptation, and the Canvas 2D runtime.
- `src/components/SiteNav.astro`: minimal fixed navigation and current-scene feedback.
- Existing section components: semantic chapter content and `data-brain-scene` markers only; they do not own canvas state.
- `src/styles/global.css`: stylesheet entrypoint only.
- `src/styles/tokens.css`: colors, type, spacing, z-index, and reset tokens.
- `src/styles/layout.css`: navigation, chapter, evidence panel, responsive, and 404 layouts.
- `src/styles/motion.css`: reveal states, canvas states, and reduced-motion overrides.

## Testing and acceptance

1. Pure particle helpers produce deterministic output for a fixed seed, keep particles within the model bounds, and interpolate camera frames without overshoot.
2. Source tests require the fixed decorative canvas, six scene markers, scroll-scrubbed camera/node state, adaptive particle budgets, Canvas 2D, reduced motion, and a context-failure fallback.
3. Tests reject WebGL, Three.js, GSAP, ScrollTrigger, Lenis, scroll hijacking, custom cursors, audio, Dala copy, and empty links.
4. Built output contains the canvas plus every preserved fact, meaningful image dimensions and alternatives, external-link protections, all nested anchor IDs, the skip link, metadata, and one `h1`.
5. Desktop, tablet, and mobile views preserve readable content and a recognizable particle composition without horizontal overflow.
6. Keyboard navigation, visible focus, reduced-motion mode, and no-JavaScript reading are manually verified.
7. `npm run check` passes, including the Astro production build, built-output tests, GitHub Pages base-path behavior, and Sites worker packaging.
