# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `Bitmap` — pixel text on a 5x7 grid for any string, with a `sweep`, `wave` or
  `cycle` effect, a single `color` or a `colors` palette, `animated`, `speed`,
  `pixelSize` and `gap`. Pure SVG and CSS, no animation loop, server-renderable,
  and the real text stays in the DOM for screen readers.
- `Dither` — a pixel sweep that fills any card, link, button or navigation block
  on hover and on keyboard focus, then retracts. Renders as any element or
  component through `as`.
- `Keycap` (a native button with notched pixel corners and press depth), `Bezel`
  (a stepped-corner frame with an optional label and grid), `Seam` (a pixel
  divider) and `Pip` (a status badge with a glyph per state). They appear under
  a new **Interface** category in the docs.
- Promoted from the prototypes after review, each with its own subpath export:
  `Eclipse` / `EclipseSection`, `Lattice`, `Louvre`, `Palimpsest`
  (+ `PALIMPSEST_COLORS`), `Phosphor` and `Sonar`. During review their animation
  loops were made to go idle, and Louvre gained `respectReducedMotion`, Lattice
  `enableOnTouch`, and Sonar's hover flag became `pulseOnHover`.
- `Vellum`: `surface="pixel"` draws the sheet as a tile grid with stepped light
  and a dithered dent, `pixel` sets the tile size, and `pointer` pins the dent.
  The default output is unchanged.
- `ScrollStack`: `hold`, how long the finished stack stays pinned, in viewports.

### Changed

- `ScrollStack` now leaves room after the last card so it docks and rests like
  every other card before the stack releases. This adds `hold` (default `0.3`)
  viewports of scroll after the stack; pass `hold={0}` for the old release
  point. Cards recede only once the next card actually overlaps them.
- `Reel` runs on the shared frame clock, stops requesting frames while a drag is
  held still, and only writes styles that changed — roughly half the style
  writes per step and none while settled.
- README rewritten for someone arriving from npm: what the project is, the
  package name, install, a working example, subpath imports, and the component
  table, before any repository detail.
- `description` and `keywords` in `package.json` reworded for the npm listing.

### Fixed

- `ScrollStack`: the last card no longer slides over the stack and scrolls away
  without docking, earlier cards taller than the last are no longer pushed out
  before it arrives, and a resize while scrolled no longer skews the offsets.
- `Aperture`: with a `scrollContainer` ref on an ancestor, the first measurement
  used the window instead of the container.
- `Diorama`: the per-plane `blur` option was silently ignored. Planes that set it
  now get that blur instead of the depth-based default.
- `Vellum`: the animation loop now stops when the sheet settles, and resizing the
  element no longer leaves a stale pointer box.

- The README shipped with `0.1.0` still called the package `zerogravity-ui` and
  told readers to run `pnpm add zerogravity-ui`, which installs an unrelated
  package by another author. Every install command, import example and generated
  usage snippet now uses `zerogravity`. Worth a patch release on its own: the
  npm page is the first thing a reader sees, and it currently points at the
  wrong package.

## [0.1.0]

First public release, published to npm as
[`zerogravity`](https://www.npmjs.com/package/zerogravity). The project is
ZeroGravity UI and the repository is `zerogravity-ui`; the shorter package name
was claimed because `zerogravity-ui` was already taken on npm by an unrelated
package.

### Added

- MIT licence and a root `LICENSE` file, shipped with the package.
- Seventeen components: `Antigravity`, `Aperture`, `Diorama`, `Elemental`,
  `GridTrail`, `Kern`, `Lodestone`, `Meadow`, `Overprint`, `Reel`, `Ricochet`,
  `ScrollStack`, `SplitFlap`, `Stencil`, `Tessera`, `TrailingCursor`, `Vellum`,
  and the shared `pointer-fx` utilities.
- `Diorama`, `Elemental`, `Kern`, `Lodestone`, `Meadow`, `Overprint`,
  `Ricochet`, `Tessera` and `Vellum` graduated out of the experimental folder
  into the published surface, each with its own entry point.
- Per-component entry points, so `import { Reel } from "zerogravity/reel"`
  works alongside the root barrel. The export map is derived from the library
  directories and verified on every package check, so an entry point cannot go
  missing and an internal path cannot appear.
- `Reel` gained a `radius` prop that drives the item geometry through the
  `--reel-radius` custom property.
- ESM package build with `tsup`, per-file TypeScript declarations, source maps
  and preserved `"use client"` boundaries.
- Component CSS shipped alongside the modules and imported automatically, so
  consumers do not need a separate stylesheet import.
- Explicit public entry point: engines, geometry, math and internal helpers are
  no longer reachable from the package.
- Playground with one route per component, schema-driven controls, live JSX
  output and sticky overrides.
- Vitest suite covering rendering, keyboard interaction, cleanup,
  reduced-motion behaviour and animation-loop idling.
- ESLint 9, Prettier and a GitHub Actions workflow running the full validation
  suite.

### Changed

- Declarations are emitted by `tsc` instead of tsup's dts pass, then given
  explicit `.js` specifiers by a build step. tsup's worker flattened the whole
  type graph, needed over 2 GB and failed on smaller machines with an error that
  named no file; the build now peaks around 400 MB and runs in a quarter of the
  time. The published type surface is unchanged, and Are The Types Wrong checks
  it against the packed tarball on every package check.
- `Aperture` and `Louvre` size their sticky pane from `--aperture-viewport` /
  `--louvre-viewport`, defaulting to `100vh`. Without this a component driven
  through `scrollContainer` rendered a viewport-tall pane inside a short box, so
  only a crop of the effect was ever visible.
- `Elemental` moved from the Motion category to Media.
- The package declares no runtime dependencies. `next` drives the documentation
  site only and moved to `devDependencies`; installing the library no longer
  pulls a framework in behind it.

### Fixed

- The published package no longer carries a stylesheet that only a Storybook
  story imported, and declarations no longer contain `import "./Component.css"`
  lines, which resolved to nothing and broke type resolution for every entry
  point under Node16.

- `Reel`: the hover highlight on the centre slide painted a square hairline ring
  around rounded cards, because the shadow was drawn on a wrapper with no border
  radius.
- `Stencil`: the video mask was clipped when negative letter-spacing made the
  glyph advance wider than its box, and the mask ignored `font-style`,
  `font-stretch`, `letter-spacing` and variable-font settings.
- `Stencil`: masks are now recomputed once web fonts finish loading instead of
  being measured against a fallback font.
- `SplitFlap`: the stagger delay applied to every character step rather than
  only the first, so long words never settled.
- `Antigravity`: the heart formation sat below its own origin and rocked under
  the polar deform.
- React 19 correctness: render-time ref writes, `useLayoutEffect` under SSR and
  a `setState` cascade inside an effect were all removed.
- The library build emitted `React.createElement` without importing React, so
  every component threw `ReferenceError: React is not defined` in a consumer
  application. The build now uses the automatic JSX runtime.
- `ResizeObserver` and `IntersectionObserver` are feature-detected in
  `Antigravity`, `Aperture`, `ScrollStack` and `Stencil`, and `Antigravity` skips
  its engine when a 2D canvas context is unavailable. Rendering a component in a
  jsdom test suite no longer requires polyfills.

### Security

- No wildcard subpath exports, so `dist/internal`, component engines and the
  unpublished prototypes cannot be reached from an installed package. A packaged
  consumer test asserts each blocked path stays blocked.
- CSS `url()` values built from consumer-supplied strings are percent-encoded,
  closing a style-injection vector in `Stencil` and the pattern builder.
- Transitive advisories in `postcss`, `nanoid` and `sharp` resolved through
  pnpm overrides; `pnpm audit` reports no known vulnerabilities.

[unreleased]: https://github.com/VladyslavPilkevych/zerogravity-ui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/VladyslavPilkevych/zerogravity-ui/releases/tag/v0.1.0
