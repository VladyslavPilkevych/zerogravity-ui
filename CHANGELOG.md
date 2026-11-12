# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `minimal` and `glass` styles for `Calendar` (with `CalendarEvent`), `Task`,
  `Checklist`, `Progress`, `Detent` and `Folio`, beside `pixel` (still the
  default) and `classic`. Minimal is a designed reduction, not classic with the
  borders removed; glass is a translucent surface that keeps text legible on
  light and dark backgrounds. Switching style changes paint, never layout.
- `Clock` and `Sash` gain `glass`, and `Tether` gains `minimal`. Clock and Sash
  have no minimal because their classic already is the bare look; a line has no
  surface, so Tether has no glass. Sash's glass band is tinted, never blurred,
  because it repaints while it runs.
- `Tag`: `appearance`, with `pixel` (default, the existing look), `classic`,
  `minimal` and `glass`. It is not `variant`, which already chooses outline or
  solid, and it combines with both.

### Changed

- Secondary text in `Calendar`, `Task` and `Checklist` and the minimal styles
  now passes 4.5:1 contrast on light backgrounds as well as dark ones.
  `Calendar`'s today markers and `Clock`'s pixel time mix the accent with the
  text colour, so they read on a light page; on a dark page the accent is a
  little paler than before.

### Fixed

- `Folio` rendered no panels when a React Server Component, such as a Next.js
  App Router page, passed it its `FolioPanel` children: across that boundary
  each panel arrives as a client reference, which Folio no longer requires to be
  the `FolioPanel` function itself.

## [0.3.0] - 2026-11-08

### Added

- `TrailingCursor`: `dotEase` lets the dot trail the pointer. The default of `1`
  keeps it pinned, as before; `ease` still controls only the ring.
- `TrailingCursor`: `dotHoverScale` and `dotPressScale` give the dot hover and
  press feedback, which `dot-only` cursors had no way to show. Both default to
  `1`. The root also exposes `data-hovering` and `data-pressed`.
- `Diorama`: `tilt`, an opt-in rotation of a few degrees toward the pointer,
  which gives `perspective` a visible effect. The default of `0` keeps the
  composition flat, as before.
- `Ascender` (`zerogravity/ascender`) — a scroll text reveal: words rise out of
  their own masks as a line enters the view. One IntersectionObserver and CSS
  transitions; `trigger="mount"` needs no JavaScript at all.
- `Frost` (`zerogravity/frost`) — a glass surface for any content, with a
  conservative 12 px blur, no `saturate()`, a `tint` variant with no backdrop
  pass, and `-webkit-backdrop-filter` declared before `backdrop-filter` so
  Lightning CSS keeps both. A server component.
- `Halo` (`zerogravity/halo`) — circular text around a centre, spread evenly
  over the full turn in every browser. A server component.
- `Sash` (`zerogravity/sash`) — a marquee band at a constant speed that pauses
  on hover, on keyboard focus and while offscreen, with copies made `inert`.
- `Detent` (`zerogravity/detent`) — a segmented control built on native radios,
  so keyboard, forms and right-to-left come from the browser.
- `Tether` (`zerogravity/tether`) — an SVG path drawn by scroll progress or by a
  `progress` value, with a stroke that keeps its width when stretched.
- `Folio` (`zerogravity/folio`) — expanding panels that never resize: one
  animated position moves and clips every panel, so the motion does no layout
  work and the gaps never drift. Stacks below 560 px.
- `Calendar` (`zerogravity/calendar`) — a composable month, week and day
  calendar: a six-week month grid with `+N more`, week and day time grids with
  data-driven overlap layout, an all-day row and a now line. Controlled or
  uncontrolled view, date and selection; `renderEvent` and `renderDay`; and
  `Calendar.Header`, `Calendar.Month`, `Calendar.Week`, `Calendar.Day`,
  `CalendarEvent` and `useCalendar()` for building your own. Locale, time zone
  and week start are props; there is no date library.
- `Task` (`zerogravity/task`) — a task row with a done checkbox, a summary line,
  optional progress and an expandable detail region.
- `Checklist` (`zerogravity/checklist`) — native checkboxes in a named group,
  with optional progress and form submission.
- `Progress` (`zerogravity/progress`) — a progress bar that reads as `1 of 4` or
  `25%`, with a segmented mode. A server component.
- `Clock` (`zerogravity/clock`) — a live or fixed date and time formatted with
  `Intl` in any locale and time zone, waking only when the display changes.
- Calendar, Task, Checklist, Progress and Clock come in `pixel` (default) and
  `classic` styles through `variant`.
- Sash, Detent, Tether and Folio take `variant`: `"pixel"`, the
  default, in the library's stepped, square, block-accented style, or
  `"classic"` for a smooth, rounded look.

### Changed

- The package no longer ships source maps. Each module is already one
  unminified file with its original names, so stack traces read like the
  source; the maps embedded every source file and made up more than half of
  the package. The tarball drops from about 485 kB to 219 kB (1.96 MB to 0.85
  MB unpacked). Declarations and the code itself are unchanged.
- Compared with their experimental versions on the documentation site, the four
  styled components (Sash, Detent, Tether and Folio) now default to a pixel-first presentation, with the
  previous look kept as `variant="classic"`, and `Folio` moves far more
  smoothly: rapid hovering no longer pulls the gaps apart mid-transition, and
  the default timing is a gentler 650 ms curve.
- `TrailingCursor`: easing is now corrected for frame time, so the trail feels
  the same at 120 Hz as at 60 Hz. At 60 Hz nothing changes. In `dot-only` the
  hidden ring is no longer simulated, and the dot and ring are positioned with
  the `translate` property instead of `transform`.
- `Meadow`, `Elemental` and `Stencil` (with `animate`) hold their CSS animations
  while scrolled out of view, and `Ricochet` and Meadow's flyers stop their
  animation frames there instead of ticking idly. Nothing changes on screen.
- `Diorama`: a plane whose blur works out to zero now gets no `filter` at all
  instead of `blur(0px)`. Negative `depth`, which moves a plane against the
  pointer, is now documented.

### Fixed

- `TrailingCursor` no longer hides the native text cursor in text fields
  (`textarea`, `contenteditable` and text-like inputs) and steps aside there
  instead. Pass `preserveTextCursor={false}` to restore the previous behaviour.
- `TrailingCursor` no longer stays pressed after a press that started inside a
  scoped container is released outside it, cancelled, or interrupted by the
  window losing focus.

## [0.2.0] - 2026-10-09

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
  divider) and `Tag` (a status badge with a glyph per state, at
  `zerogravity/tag`). They appear under a new **Interface** category in the
  docs. `Tag` was called `Pip` during development; it never shipped under that
  name, so there is no alias.
- Promoted from the prototypes after review, each with its own subpath export:
  `Eclipse` / `EclipseSection`, `Lattice`, `Louvre`, `Palimpsest`
  (+ `PALIMPSEST_COLORS`), `Phosphor` and `Sonar`. During review their animation
  loops were made to go idle, and Louvre gained `respectReducedMotion`, Lattice
  `enableOnTouch`, and Sonar's hover flag became `pulseOnHover`.
- `Vellum`: `surface="pixel"` draws the sheet as a tile grid with stepped light
  and a dithered dent, `pixel` sets the tile size, and `pointer` pins the dent.
  The default output is unchanged.
- `ScrollStack`: `hold`, how long the finished stack stays pinned, in viewports.
- Promoted from the prototypes after a second review, each at
  `zerogravity/<name>`: `Wake` (water ripple), `Chroma` (cursor trail, now with
  `enableOnTouch`), `Wash` (click colour bloom), `Peel`, `Gantry`, `Tide`,
  `Lenticular` and `Gnomon`.
- `Antigravity`: `pixel` (the homepage hero, now shared with it), `orbit` and
  `helix` presets, appended so existing preset positions are unchanged.
- `Lodestone`: `variant="pixel"`, a stepped-corner face with a hard shadow and a
  blocky press, and the `LodestoneVariant` type.
- `Dither`: `variant="edge"`, a CSS-only block frame with a lift and an offset
  shadow that steps in on hover or keyboard focus, and the `DitherVariant` type.
- `Tessera`: `diagonal` and `spiral` sequences.
- `Gantry` marks the car in focus with `data-active`.

### Changed

- Documentation is regrouped into eight categories that describe intent —
  Backgrounds, Surfaces, Cursor, Scroll, Typography, Media, Interface, and
  Loading & transitions — sorted alphabetically within each. Every component
  now carries a plain-words subtitle next to its brand name (Wake: _Water
  ripple_), and search matches subtitles and wider tags, with every word of a
  query required to match.
- Generated usage code imports each component from its own entry point, such as
  `zerogravity/reel`, and always includes the props a component cannot render
  without.
- `Wash` defaults to `mode="both"`, so clicks pour as well as the timer.
- `Lenticular` under reduced motion follows the pointer without tilt or easing,
  instead of freezing on a striped half-and-half view.
- `zerogravity/tide` exposes `Tide` and the `TideEdge` type only; the contour
  helper stays internal.
- Docs demos for `Antigravity`, `Lodestone`, `Gantry`, `Tessera`, `Dither` and
  `Tag` were restyled; the Antigravity page opens on the pixel field.
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

- `Reel`: releasing a drag after holding still no longer flings, because release
  velocity is measured over the last ~60 ms. A lost pointer capture or
  `pointercancel` ends the drag instead of freezing the carousel, a second
  finger no longer hijacks a drag, a trackpad swipe moves exactly one slide, and
  stray wheel deltas no longer add up to a step.
- `Wake`, `Lenticular` and `Chroma`: touch drags are no longer cancelled by the
  browser, and vertical scrolling still works over them.
- `Wash`: a swipe to scroll no longer pours, Enter or Space on a control inside
  pours from it, fragments take non-hex colours, and timed pours skip while
  offscreen.
- `Gnomon`: a tap places the lamp on touch screens, and disabling it or turning
  on reduced motion returns the light to rest.
- `Peel`: crease shading follows the bottom corners, and progress is re-read
  when the container resizes.
- `Gantry`: the rail ends with its end padding visible instead of the last car
  flush against the edge, and `respectReducedMotion={false}` keeps the lean.
- `Tide`: `speed={0}` holds no frame, and straight sides no longer show a
  sub-pixel hairline.
- `Lenticular` re-measures when the card itself resizes.
- The generated code for `Louvre`, `Palimpsest`, `Phosphor`, `Peel` and
  `Lenticular` left out required props and did not compile.
- The `Lodestone` docs preview ran stronger values than the generated code
  printed.
- `ScrollStack`: the last card no longer slides over the stack and scrolls away
  without docking, earlier cards taller than the last are no longer pushed out
  before it arrives, and a resize while scrolled no longer skews the offsets.
- `Aperture`: with a `scrollContainer` ref on an ancestor, the first measurement
  used the window instead of the container.
- `Diorama`: the per-plane `blur` option was silently ignored. Planes that set it
  now get that blur instead of the depth-based default.
- `Vellum`: the animation loop now stops when the sheet settles, and resizing the
  element no longer leaves a stale pointer box.

### Security

- The documentation site moves to Next.js 15.5.27, which fixes two critical
  remote code execution advisories. `next` is a development dependency and was
  never installed by consumers of the package.
- High-severity advisories in development tooling (`sharp`, `js-yaml`,
  `undici`, `brace-expansion`, `source-map-js`) are resolved through pnpm
  overrides. `pnpm audit --prod` reports no known vulnerabilities.

## [0.1.3] - 2026-08-25

### Added

- `Meadow` gained a living creature layer: flyers that drift, bob and react to
  the pointer, with props for density, motion, interaction and event pace, and
  the matching `MeadowCreatures`, `MeadowDensity`, `MeadowEventPace`,
  `MeadowInteraction` and `MeadowMotion` types.

## [0.1.1] - 2026-08-24

### Fixed

- The README shipped with `0.1.0` still called the package `zerogravity-ui` and
  told readers to run `pnpm add zerogravity-ui`, which installs an unrelated
  package by another author. Every install command, import example and generated
  usage snippet now uses `zerogravity`.

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

[unreleased]: https://github.com/VladyslavPilkevych/zerogravity-ui/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/VladyslavPilkevych/zerogravity-ui/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/VladyslavPilkevych/zerogravity-ui/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/VladyslavPilkevych/zerogravity-ui/compare/v0.1.1...v0.1.3
[0.1.1]: https://github.com/VladyslavPilkevych/zerogravity-ui/tree/v0.1.1
[0.1.0]: https://github.com/VladyslavPilkevych/zerogravity-ui/releases/tag/v0.1.0
