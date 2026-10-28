# Grid portrait and project artwork

`arya-line.png` was edited with the built-in image-generation tool from a simple
redraw of the supplied avatar at `/Users/arya/projects/devaryakjha/avatar.png`.
Astro creates responsive WebP variants. The original avatar stays unchanged.

The interactive portrait uses `public/grid/portrait-mask.svg` to follow the
head outline without changing this raster. Regenerate the mask with
`bun scripts/trace-portrait-mask.mjs`; it traces the original white contour,
keeps enclosed black hair opaque, and excludes the exterior background. The same mask shapes the folded
backing. Black hair stays opaque in both themes.

## Final portrait prompt

Preserve the exact simple friendly face, swept black hair, rectangular glasses,
crooked toothy smile, sparse stubble and clean bold black line art on a white
face. Replace all background checkerboard with one flat solid black (#080808)
background. Keep a clean thin white outline around the hair. No checkerboard,
transparency simulation, gradients, hatching, engraving, shading or texture.
Square image, centered head, 10% margin. A simple personal developer avatar.

## Project sources

- Oore: original mark from `oore.build/shared/brand/logo.svg`. Rendered in white with CSS; source geometry unchanged.
- Tagflow: original mark from `tagflow/assets/dark/icon.svg`. Rendered in grayscale with CSS.
- Loadwright: original diagram of its YAML-to-JMeter workflow, based on the profile README.
- Anpec: original phone/chip diagram of Android performance classes, based on https://github.com/devaryakjha/anpec.
- Seisei: original diagram of model output passing through a schema into typed app data, based on its local README.

Project diagrams live in `src/components/ProjectArtwork.astro`. They are
illustrations, not screenshots or benchmark results. No generated replacement
is presented as an existing project logo.

