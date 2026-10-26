# Whole-page crumple prototype (26 October 2026)

Aryan asked for the whole page, not just the section strips, to crumple as you scroll, with the next page coming up from behind, and for it to be bright, colourful and artistic: every section is its own sheet of coloured paper. Open `index.html` in Chrome, Edge or Safari 26 and scroll slowly to the end of each section.

How it works:

- Each section is a sheet. Its last screen holds still for one screen of scrolling (a scroll-driven `translate` that cancels the scroll) while the next sheet waits underneath at the top of the screen.
- One pre-rendered crumple sequence per screen shape (`crumple-d.avif` for landscape, `crumple-m.avif` for portrait, 25 frames each, about 160 KB and 130 KB) is shared by every sheet. Its alpha is the sheet's outline (a CSS mask) and its shading is multiplied over the live page, so the real text, links and photos crumple. The live content shrinks with the outline; the outline boxes come from the render.
- After the ball forms it rolls off to the right. Motion is CSS scroll-driven only. With reduced motion, or without scroll-driven animation support (Firefox), the runways collapse and it is an ordinary page.

`tools/` regenerates it (`npm install`, then `npm run render`, `npm run pack`, `npm run page`, with Node 24). `page3d.js` is the three.js model (a sheet gathered radially into a lumpy ball); it runs only offline in headless Chromium. The tools' input and output paths point at the session workspace they were written in. The artifact-ready page (no doctype) is generated as `whole-page-crumple.html`; `index.html` here is the same page wrapped for local viewing.
