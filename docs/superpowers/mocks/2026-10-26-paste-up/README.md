# Paste-Up mockup (approved 26 October 2026)

The static mockup Aryan approved for the v4 revamp. Open `index.html` in a browser; the pill in the bottom-right corner switches light and dark. It covers the first screen, Work, the Projects lede and index, the Dots card, the first Recognition award, About and Contact.

- `img/` and `paste-up/` hold the photos and generated art the mockup uses.
- `tools/` holds the seeded generators that made the mockup's torn paper, pencil art, Braille and tapes (`art.mjs`, `drawings.mjs`, `images.mjs`) and the script that assembled the page (`build.mjs`). They are a reference for the production pipeline, not part of the site build, and their input paths point at the session workspace they were written in.

The design itself is specified in `docs/superpowers/specs/2026-10-26-paste-up-design.md`.
