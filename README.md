# zerogravity-ui

Motion-first React components — particle fields, scroll framing, carousels and
display type. Every component ships its own styles, stops animating when idle,
and honours `prefers-reduced-motion`.

> **Not published yet.** The package name and the licence are still unresolved —
> see [Release blockers](#release-blockers). Everything below describes the
> package as it is built and verified today.

## Installation

```bash
pnpm add zerogravity-ui
```

React and React DOM are peer dependencies:

```json
"react": "^18.2.0 || ^19.0.0",
"react-dom": "^18.2.0 || ^19.0.0"
```

The package is **ESM only**. It needs a bundler that understands CSS imports —
Vite, Next.js, Rspack, webpack 5 and Parcel all qualify. Importing it from plain
Node without a bundler will fail on the CSS imports.

## Usage

```tsx
import { Reel, SplitFlap } from "zerogravity-ui"

export function Showcase() {
    return (
        <>
            <SplitFlap value="ARRIVALS" />
            <Reel radius={20}>
                <article>One</article>
                <article>Two</article>
                <article>Three</article>
            </Reel>
        </>
    )
}
```

### Styles

There is nothing to import. Each component imports its own stylesheet, and
`sideEffects` in `package.json` marks those CSS files so bundlers keep them while
still tree-shaking unused components — import two components and only their two
stylesheets end up in your bundle.

Colours that are meant to be themed are exposed as CSS custom properties on the
component root, so you override them with ordinary CSS:

```css
.my-carousel {
    --reel-accent: oklch(0.8 0.15 200);
}
```

### Next.js App Router

Interactive components are compiled with their `"use client"` directive intact,
so you can import and render them directly from a Server Component without
marking your own page as a client component:

```tsx
import { Reel } from "zerogravity-ui"

export default function Page() {
    return (
        <Reel radius={20}>
            <article>One</article>
        </Reel>
    )
}
```

This is verified against a real Next.js 15 App Router production build, including
static prerendering.

## Components

| Component                                           |                                                                                                                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Antigravity](src/lib/antigravity/README.md)        | Canvas particle cloud that follows the cursor, or stays put and scatters away from it. Eighteen formations including a 3-D planet, a DNA helix and a black hole accretion disc |
| [Aperture](src/lib/aperture/README.md)              | Full-bleed panel that closes into a framed card as you scroll, driven by `clip-path`                                                                                           |
| [GridTrail](src/lib/grid-trail/README.md)           | Grid cells light up under the pointer and fade out. Viewport-wide or scoped to a container                                                                                     |
| [Reel](src/lib/reel/README.md)                      | Roulette-style carousel with drag, flick, wheel, keyboard and a highlighted centre slide                                                                                       |
| [ScrollStack](src/lib/scroll-stack/README.md)       | Sections that slide over each other on scroll and unstack on the way back                                                                                                      |
| [SplitFlap](src/lib/split-flap/README.md)           | Airport board that flips one character at a time. Text, clock or countdown                                                                                                     |
| [Stencil](src/lib/stencil/README.md)                | Display type with a pattern showing through the letters, and per-letter hover effects                                                                                          |
| [TrailingCursor](src/lib/trailing-cursor/README.md) | Dot pinned to the pointer plus a lagging ring, with per-element `data-cursor-*` overrides                                                                                      |
| [pointer-fx](src/lib/pointer-fx/README.md)          | Shared colour resolution and the reduced-motion / pointer-type gate. No component of its own                                                                                   |

Every component README carries the full prop table, accessibility notes and
performance characteristics.

### Environment requirements

Components degrade instead of throwing when a browser API is missing:
`ResizeObserver` and `IntersectionObserver` are feature-detected, and Antigravity
skips its engine when a 2D canvas context is unavailable. Server rendering and
jsdom-based test suites therefore need no polyfills.

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
pnpm dev        # playground at http://localhost:3000
```

The project uses **pnpm** and pins the version in `packageManager`.

### Playground

- One route per component: `/`, `/aperture`, `/grid-trail`, `/reel`,
  `/scroll-stack`, `/split-flap`, `/stencil`, `/trailing-cursor`.
- The panel is generated from a schema, and every row is labelled with the real
  prop path (`pulse.waveform`, `formation.radius`).
- At the bottom of the panel is ready-to-paste JSX containing only the props that
  differ from the defaults, with a copy button.
- `H` hides the panel.

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
├── playground/             development and documentation only
│   ├── panel/                  schema-driven control panel
│   └── <component>/            demo + control schema per component
│
├── app/                    Next.js App Router, hosts the playground
└── test/                   test harnesses (rAF, canvas, media queries)
```

Each component owns its folder: the component, its types, its CSS, a `README.md`
and an `index.ts` that defines its public surface.

- `src/playground` may import from `src/lib`. The reverse never happens.
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

|                                     |                                             |
| ----------------------------------- | ------------------------------------------- |
| `pnpm dev`                          | Playground dev server                       |
| `pnpm build`                        | Playground production build                 |
| `pnpm build:lib`                    | Library build into `dist/` via tsup         |
| `pnpm lint`                         | ESLint, including the library-boundary rule |
| `pnpm format` / `pnpm format:check` | Prettier                                    |
| `pnpm typecheck`                    | `tsc --noEmit`                              |
| `pnpm test`                         | Vitest, jsdom                               |
| `pnpm check`                        | Everything CI runs                          |
| `pnpm release:check`                | `pnpm check` plus the library build         |

Do not run `pnpm build` while `pnpm dev` is running — both write to `.next`.

### Library build

`pnpm build:lib` runs [tsup](https://tsup.egoist.dev/) in preserved-module mode:
every source file becomes one ESM file in `dist/`, with declarations and source
maps. Nothing is bundled, which is what keeps `"use client"` attached to the
individual client modules instead of collapsing the whole library into one client
boundary. CSS files are copied next to the modules that import them.

The release process is documented in [CONTRIBUTING.md](CONTRIBUTING.md#releasing).

## Release blockers

Two things cannot be inferred from the repository and must be decided by the
project owner before a first publish:

1. **A licence.** `license` is `UNLICENSED` and there is no `LICENSE` file, which
   grants nobody any rights. Choose a licence and add the file with the real
   copyright holder.
2. **A package name.** `zerogravity-ui` matches the repository but was already
   taken on npm at the time of writing. Confirm an available name and update
   `name` in `package.json` plus the install instructions above.

`private: true` is still set in `package.json` and must be removed once both are
resolved.

## Adding a component

1. `src/lib/<component>/` with the component, an `index.ts` describing its public
   surface, and a `README.md` with the prop table.
2. Re-export the intended API from `src/lib/index.ts`.
3. `src/playground/<component>/schema.ts` plus a demo that renders `Panel`.
4. A route in `src/app/<component>/page.tsx` and a link in `src/playground/Nav.tsx`.
5. A test next to the component covering rendering, keyboard or pointer
   behaviour, cleanup, and reduced-motion.
