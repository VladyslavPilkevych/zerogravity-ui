# zerogravity-ui

Motion-first React components — particle fields, scroll framing, carousels and
display type. Every component ships its own styles, stops animating when idle,
and honours `prefers-reduced-motion`.

> **Not published yet.** The package name is still unresolved — see
> [Release blockers](#release-blockers). Everything below describes the package
> as it is built and verified today.

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

### Direct component imports

Every component also has its own entry point, so you can import it without going
through the root barrel:

```tsx
import { Reel } from "zerogravity-ui/reel"
import { SplitFlap } from "zerogravity-ui/split-flap"
```

Both styles produce the same bundle. The root barrel is a plain re-export and
tree-shakes cleanly: a Vite production build importing only `SplitFlap` measures
**3.2 kB of library code and 1.5 kB of CSS** on top of a React-only baseline,
byte-identical whichever import form is used, with every other component and
stylesheet absent. Those numbers come from `pnpm test:consumer`, which builds
both apps against the packed tarball on every run rather than trusting that ESM
implies tree shaking.

Reach for the subpath form when you prefer explicit module boundaries, not
because it is smaller.

The entry points are the nine components plus `pointer-fx`, spelled as the
directory name:

```text
zerogravity-ui/antigravity      zerogravity-ui/split-flap
zerogravity-ui/aperture         zerogravity-ui/stencil
zerogravity-ui/grid-trail       zerogravity-ui/trailing-cursor
zerogravity-ui/reel             zerogravity-ui/pointer-fx
zerogravity-ui/scroll-stack
```

Nothing else is importable. Engines, geometry helpers, the shared `internal`
modules and `dist/` paths have no entry point and never will — the package
declares no wildcard exports, and the package check fails if one appears.

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

### Dependencies

The package has **no runtime dependencies**. React and React DOM are peers;
nothing else is installed alongside it.

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

`pnpm build:lib` runs [tsup](https://tsup.egoist.dev/) in preserved-module mode:
every source file becomes one ESM file in `dist/`, with declarations and source
maps. Nothing is bundled, which is what keeps `"use client"` attached to the
individual client modules instead of collapsing the whole library into one client
boundary. CSS files are copied next to the modules that import them.

The release process is documented in [CONTRIBUTING.md](CONTRIBUTING.md#releasing).

## Release blockers

Everything the repository controls is ready. What is left cannot be decided from
inside it:

1. **The package name is taken.** `zerogravity-ui` exists on npm — version
   `0.0.6`, published by a different author — so this package cannot be
   published under that name. Verified against the registry, not assumed. The
   owner has to either claim a free name and update `name` in `package.json`
   plus the install instructions above, or take over the existing one.
   `@zerogravity/ui` and `zerogravity` were both unregistered when this was
   checked; a scoped name already matches the `publishConfig.access: public`
   setting in `package.json`. No name has been chosen here on purpose —
   switching it silently would be the wrong call to make on someone's behalf.
2. **npm publish rights.** An npm account with 2FA enabled, and ownership of
   whichever name is settled on.

`private: true` stays in `package.json` until the first is resolved. It is the
only thing standing between this repository and `npm publish`, and it is
deliberate: with an unavailable name, publishing would fail anyway, and the flag
makes that failure a local one rather than a half-finished release.

Not blockers: a custom domain (the docs site can keep deploying to its current
host) and a Chromatic token (CI reports the visual job as skipped without one).

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
