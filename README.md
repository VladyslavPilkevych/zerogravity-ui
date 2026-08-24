# ZeroGravity UI

Motion-first React components for expressive interfaces.

ZeroGravity UI is a set of animated, interactive React components: pointer
effects, scroll-driven layout, display typography, animated borders, illustrated
scenes and route transitions. Every component ships its own styles, stops
animating when it is idle, and honours `prefers-reduced-motion`.

Published on npm as **`zerogravity`**.

[![npm](https://img.shields.io/npm/v/zerogravity.svg)](https://www.npmjs.com/package/zerogravity)
[![license](https://img.shields.io/npm/l/zerogravity.svg)](LICENSE)
[![CI](https://github.com/VladyslavPilkevych/zerogravity-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/VladyslavPilkevych/zerogravity-ui/actions/workflows/ci.yml)

[npm](https://www.npmjs.com/package/zerogravity) ·
[GitHub](https://github.com/VladyslavPilkevych/zerogravity-ui) ·
[Issues](https://github.com/VladyslavPilkevych/zerogravity-ui/issues)

## Installation

```bash
pnpm add zerogravity
```

```bash
npm install zerogravity
```

## Usage

```tsx
import { Reel } from "zerogravity"

export function Carousel() {
    return (
        <Reel radius={20}>
            <article>One</article>
            <article>Two</article>
            <article>Three</article>
        </Reel>
    )
}
```

### Direct component imports

Components can be imported from the root package or through an explicit
per-component subpath:

```tsx
import { Reel } from "zerogravity"
import { Reel } from "zerogravity/reel"
```

Both resolve to the same module. The package preserves one file per module and
marks its stylesheets as side effects, so bundlers can drop the components you
do not use — the repository verifies this on every run by building a consumer
app that imports a single component and asserting the others are absent.

The subpath is the directory name of the component, lowercased and hyphenated:
`zerogravity/grid-trail`, `zerogravity/split-flap`, `zerogravity/trailing-cursor`.
Nothing else is importable — engines, geometry helpers and internal modules have
no entry point.

### Styles

There is no global stylesheet to import. Each component imports its own CSS, and
`sideEffects` in `package.json` marks those files so bundlers keep them while
still tree-shaking unused components.

Colours meant to be themed are exposed as CSS custom properties on the component
root, so you override them with ordinary CSS:

```css
.my-carousel {
    --reel-accent: oklch(0.8 0.15 200);
}
```

### Next.js App Router

Interactive components keep their `"use client"` boundaries in the published
build, so you can render them directly from a Server Component without marking
your own page as a client component. This is verified against a real Next.js 15
App Router production build, including static prerendering.

```tsx
import { Reel } from "zerogravity"

export default function Page() {
    return (
        <Reel radius={20}>
            <article>One</article>
        </Reel>
    )
}
```

## Components

| Component                                           | Description                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| [Antigravity](src/lib/antigravity/README.md)        | A particle field that flows around the cursor and settles into formations      |
| [Aperture](src/lib/aperture/README.md)              | A full-bleed panel that closes into a framed card as you scroll, or opens      |
| [Diorama](src/lib/diorama/README.md)                | Depth layers that part as the pointer moves, letting you see past the front    |
| [Elemental](src/lib/elemental/README.md)            | An animated edge that wraps any content in electricity or fire                 |
| [GridTrail](src/lib/grid-trail/README.md)           | A pointer trail that lights cells on an invisible grid, then stops the loop    |
| [Kern](src/lib/kern/README.md)                      | Glyphs that open up, lift and gain weight as the pointer passes them           |
| [Lodestone](src/lib/lodestone/README.md)            | Magnetic buttons that lean toward the pointer but never overlap each other     |
| [Meadow](src/lib/meadow/README.md)                  | A living pastel hero scene that drifts and flutters around your content        |
| [Overprint](src/lib/overprint/README.md)            | Colour separations that misregister on scroll and converge back into register  |
| [Reel](src/lib/reel/README.md)                      | A roulette-style carousel you can drag, flick, scroll sideways or step         |
| [Ricochet](src/lib/ricochet/README.md)              | Destructible pixel text with breakout or shooter play                          |
| [ScrollStack](src/lib/scroll-stack/README.md)       | Sections that slide over each other on scroll, and unstack back                |
| [SplitFlap](src/lib/split-flap/README.md)           | An airport board that flips one character at a time: text, clock or countdown  |
| [Stencil](src/lib/stencil/README.md)                | Display type filled with stripes, checks, gradients, an image or video         |
| [Tessera](src/lib/tessera/README.md)                | A tiled route transition: tiles cover the viewport, the route swaps, they lift |
| [TrailingCursor](src/lib/trailing-cursor/README.md) | A dot pinned to the pointer and a ring that lags, grows and recolours          |
| [Vellum](src/lib/vellum/README.md)                  | A sheet that leans toward the pointer, with an optional dent and sheen         |
| [pointer-fx](src/lib/pointer-fx/README.md)          | Shared colour resolution and the reduced-motion / pointer-type gate            |

Each component README carries the full prop table, accessibility notes and
performance characteristics.

A few prototypes — Facet, Louvre, Raster, Wash and the pixel loaders — live in
`src/lib/experimental` and have documentation pages, but they are **not part of
the published package** and cannot be imported from `zerogravity`.

## Requirements

React and React DOM are peer dependencies:

```json
"react": "^18.2.0 || ^19.0.0",
"react-dom": "^18.2.0 || ^19.0.0"
```

The package has no runtime dependencies of its own.

It is **ESM only** and needs a bundler that understands CSS imports — Vite,
Next.js, Rspack, webpack 5 and Parcel all qualify. Importing it from plain Node
without a bundler will fail on the stylesheet imports.

The `engines` field in `package.json` (Node 22, pnpm 10) applies to developing
this repository. It is not a requirement for applications that install the
package.

Components degrade instead of throwing when a browser API is missing:
`ResizeObserver` and `IntersectionObserver` are feature-detected, and Antigravity
skips its engine when a 2D canvas context is unavailable. Server rendering and
jsdom-based test suites therefore need no polyfills.

## Naming

**ZeroGravity UI** is the project. The npm package is published as
[`zerogravity`](https://www.npmjs.com/package/zerogravity), and the repository
is [`zerogravity-ui`](https://github.com/VladyslavPilkevych/zerogravity-ui).

## Links

- [npm package](https://www.npmjs.com/package/zerogravity)
- [Source repository](https://github.com/VladyslavPilkevych/zerogravity-ui)
- [Issues](https://github.com/VladyslavPilkevych/zerogravity-ui/issues)
- [Changelog](CHANGELOG.md)

## Versioning

This project follows [Semantic Versioning](https://semver.org/), with the
pre-1.0 caveat that the public API is still settling:

- **Patch** — bug fixes, internal changes, documentation.
- **Minor** — new components, new props, new presets. Anything additive.
- **Major** — removing or renaming a prop or export, changing a default that
  alters rendered output, dropping a React version, changing the CSS strategy.

While the version is `0.x`, breaking changes ship in **minor** releases and are
listed under a `Changed` or `Removed` heading in [CHANGELOG.md](CHANGELOG.md).

The public API is exactly what `src/lib/index.ts` exports. The `exports` map
blocks deep imports, so engines, geometry, math helpers and `src/lib/internal`
are not reachable from the package and can change in a patch release.

## Development

```bash
corepack enable
pnpm install
pnpm dev        # docs site at http://localhost:3000
```

The project uses **pnpm** and pins the version in `packageManager`.

### Docs site

- `/` is a short landing page, `/docs` lists every component, and each component
  has its own page at `/docs/<slug>`.
- The sidebar groups components by category and filters as you type.
  <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> jumps to the search field.
- Each page is preview, customize, usage, props and dependencies, all generated
  from one registry entry in `src/docs/registry.ts`.
- Controls are generated from a schema, and every row is labelled with the real
  prop path (`pulse.waveform`, `formation.radius`).
- The usage snippet contains only the props that differ from the defaults, and
  updates as you move the controls. It is read-only, with a copy button.

Anything changed by hand becomes a sticky override. Switching presets applies the
preset underneath those edits, so tweaks survive until **Reset**:

```
config = defaults → preset → your edits (win)
```

### Layout

```
src/
├── lib/                    the published library
│   ├── internal/               shared helpers, never exported publicly
│   ├── pointer-fx/             colour resolution + the pointer/motion gate
│   ├── antigravity/
│   ├── aperture/
│   ├── grid-trail/
│   ├── reel/
│   ├── scroll-stack/
│   ├── split-flap/
│   ├── stencil/
│   ├── trailing-cursor/
│   └── index.ts                the public entry point
│
├── docs/                   the documentation site: registry, shell, search
│   ├── registry.ts             one entry per component, the source of truth
│   └── components/             header, sidebar, preview, code, props table
│
├── playground/             demo sources, development only
│   ├── panel/                  schema-driven controls
│   ├── previews/               one live preview per component
│   └── <component>/schema.ts   defaults, controls and presets
│
├── app/                    Next.js App Router, hosts the docs site
└── test/                   test harnesses (rAF, canvas, media queries)
```

Each component owns its folder: the component, its types, its CSS, a `README.md`
and an `index.ts` that defines its public surface.

- `src/docs` and `src/playground` may import from `src/lib`. The reverse never
  happens.
- `src/lib` imports React and browser APIs, never Next.js. An ESLint rule fails
  the build if either boundary is crossed.
- Cross-component imports inside the library go to the specific module, not to
  another component's barrel, so barrels stay a description of the public API.

### Conventions

- **Engine separate from the React wrapper** for canvas components. The component
  mounts a canvas and pushes config objects into a plain class, so changing a
  prop never restarts the animation.
- **Props only.** No global theme, no context, no CSS framework.
- **Colours are never parsed by hand.** Canvas takes the raw string and
  transparency comes from `globalAlpha`, which supports `oklch()` and everything
  else for free. Only `var(--token)` is resolved, via `getComputedStyle`.
- **Every animation loop stops when idle** and restarts on demand.
- **Documentation lives in READMEs.** Source stays comment-free.

### Scripts

|                                     |                                                  |
| ----------------------------------- | ------------------------------------------------ |
| `pnpm dev`                          | Docs site dev server                             |
| `pnpm build`                        | Docs site production build                       |
| `pnpm build:lib`                    | Library build into `dist/` via tsup              |
| `pnpm lint`                         | ESLint, including the library-boundary rule      |
| `pnpm format` / `pnpm format:check` | Prettier                                         |
| `pnpm typecheck`                    | `tsc --noEmit`                                   |
| `pnpm test`                         | Vitest, jsdom                                    |
| `pnpm test:browser`                 | Storybook stories in a real browser, plus a11y   |
| `pnpm test:e2e`                     | Playwright against the built docs site           |
| `pnpm build-storybook`              | Static Storybook, also the Chromatic input       |
| `pnpm check:package`                | Packs, then runs publint and Are The Types Wrong |
| `pnpm test:consumer`                | Installs the tarball into Vite and Next.js apps  |
| `pnpm check`                        | Fast local gate: static checks and both suites   |
| `pnpm release:check`                | `pnpm check` plus build, package and consumer    |

Do not run `pnpm build` while `pnpm dev` is running — both write to `.next`.

### Library build

`pnpm build:lib` is three steps:

1. [tsup](https://tsup.egoist.dev/) in preserved-module mode — every source file
   becomes one ESM file in `dist/`, with source maps. Nothing is bundled, which
   is what keeps `"use client"` attached to the individual client modules
   instead of collapsing the whole library into one client boundary. CSS files
   are copied next to the modules that import them.
2. `tsc -p tsconfig.build.json` for the declarations, one per module.
3. `scripts/declaration-extensions.mjs`, which gives the relative specifiers in
   those declarations explicit `.js` paths and drops the stylesheet imports TypeScript
   copies into them. Node16 resolution has no directory lookup, so without this
   step every entry point is a dead end for a consumer.

tsup can emit the declarations itself, and used to. Its dts pass flattens the
whole type graph in a worker thread: it peaked at 2.1 GB and failed outright on
smaller machines, with an error that named no file. `tsc` produces the same
public surface from the same config in a fifth of the memory and a quarter of
the time, and points at a line when something is wrong. Are The Types Wrong runs
against the packed tarball on every `pnpm check:package`, so the rewrite step
cannot silently regress.

The release process is documented in [CONTRIBUTING.md](CONTRIBUTING.md#releasing).

## Release status

`0.1.0` is published as [`zerogravity`](https://www.npmjs.com/package/zerogravity).
The name `zerogravity-ui` was already taken on npm by an unrelated package, so
the shorter name was claimed instead; the repository keeps its original slug.

The release process is in [CONTRIBUTING.md](CONTRIBUTING.md#releasing). A custom
docs domain is still unconfigured, and CI reports the Chromatic visual job as
skipped until `CHROMATIC_PROJECT_TOKEN` is set — neither blocks a release.

## Adding a component

1. `src/lib/<component>/` with the component, an `index.ts` describing its public
   surface, and a `README.md` with the prop table.
2. Re-export the intended API from `src/lib/index.ts`.
3. A control schema (`src/playground/<component>/schema.ts`, or an entry in
   `src/playground/experimental/schemas.ts`) and a preview in
   `src/playground/previews/`.
4. An entry in `src/docs/registry.ts` and its preview in `src/docs/previews.tsx`.
   The route, the sidebar, search, the props table and the usage snippet all come
   from that one entry.
5. A test next to the component covering rendering, keyboard or pointer
   behaviour, cleanup, and reduced-motion.

## License

[MIT](LICENSE) © Vladyslav Pilkevych
