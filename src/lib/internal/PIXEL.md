# Pixel vocabulary

The shared visual language behind `Dither`, `Keycap`, `Bezel`, `Seam`, `Pip`
and the docs site. A new pixel component should pick a few of these and use them
for its own idea, not repeat another component's look.

## Geometry

- **Square edges.** No `border-radius` on pixel surfaces. Where a shape needs a
  softer silhouette, step the corner instead of rounding it.
- **Stepped corners.** `pixel.css` in this folder provides `.zg-px-notch` (a
  two-step notched silhouette) and `.zg-px-ring` (a 1px outline that follows the
  same steps, built from one `evenodd` polygon). Both read `--zg-notch` (default
  `3px`); the ring also reads `--zg-ring` (default `1px`). Import the file from
  the component, never from another component's barrel.
- **Blocks with a gap.** Cells are drawn about 14% smaller than their pitch so a
  run of blocks reads as separate pixels, not a bar.

## Grid

- A 1px grid line every cell, at very low contrast:
  `color-mix(in srgb, currentColor 6%, transparent)` on components,
  `--pz-grid-line` (`rgba(255, 255, 255, 0.028)`) on the docs site.
- Typical cells: `4px` for dividers, `8px` for hover fills, `16px` for panel
  grids, `28px` (`--pz-cell`) for page backgrounds.

## Motion

- **Stepped, not eased.** CSS transitions and keyframes use `steps()` — `2` for
  press and lift, `3` for small travel, `6`–`28` for sweeps and runs.
- **Block reveals.** A reveal is ordered by distance from an origin plus an
  ordered-dither threshold (`bayer4` from `dither.ts`), so the front is ragged
  in whole cells. Alpha levels are snapped with `quantize`.
- **Press depth.** A hard offset shadow (`4px 4px 0`) that the surface moves
  into on `:active`; hover lifts it `1`–`2px` the other way.
- **Clean exits.** Effects retract or dissolve; they never snap off.
- Every loop is idle when nothing moves. Canvas work runs on `onFrame` only
  during a transition. CSS loops (`Seam` pulse, `Pip` live ring) are short
  `steps()` cycles and stop under `prefers-reduced-motion`.

## Light

- **Restrained glow.** A single `drop-shadow` or `box-shadow` blur of 3–12px in
  the accent colour, on the lit part only.
- **Stepped lighting.** Density or alpha changes in a few hard bands (three or
  four), never a smooth gradient.
- Accents: cyan `#4ee1f2`, lime `#c6f24e`, pink `#ff5fa2`, violet `#9d7bff`.
  Status colours in `Pip` add amber `#ffb84e` and red `#ff5f6d`.

## Type

- Mono, uppercase, letter-spacing `0.1em`–`0.18em`, `10`–`12.5px` for labels.
  Components read `--zg-font-mono` and fall back to the system mono stack.

## Theming

- Every component exposes its colours as custom properties on the root
  (`--zg-<name>-accent`, `--zg-<name>-tone`) and derives neutrals from
  `currentColor`, so it works on light and dark surfaces without a theme prop.
- Decorative layers are `aria-hidden` and `pointer-events: none`; content stays
  real text above them.
