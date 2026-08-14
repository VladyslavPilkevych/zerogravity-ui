# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

Nothing yet.

## [0.1.0] - Unreleased

First public release. Not yet published to npm — see the release blockers in the
README before tagging.

### Added

- Nine components: `Antigravity`, `Aperture`, `GridTrail`, `Reel`,
  `ScrollStack`, `SplitFlap`, `Stencil`, `TrailingCursor`, and the shared
  `pointer-fx` utilities.
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

### Fixed

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

- CSS `url()` values built from consumer-supplied strings are percent-encoded,
  closing a style-injection vector in `Stencil` and the pattern builder.
- Transitive advisories in `postcss`, `nanoid` and `sharp` resolved through
  pnpm overrides; `pnpm audit` reports no known vulnerabilities.

[unreleased]: https://github.com/VladyslavPilkevych/zerogravity-ui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/VladyslavPilkevych/zerogravity-ui/releases/tag/v0.1.0
