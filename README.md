# zerogravity-ui

Motion-first React components — particle fields, scroll framing, carousels and
display type — plus a playground where every prop is wired to a live control.

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

The project uses **pnpm** and pins the version in `packageManager`. If you do not
have it, `corepack enable` picks up the exact version from `package.json`.

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

## Layout

```
src/
├── lib/                    the library — this is what would be published
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
and an `index.ts` that defines its public surface. Files beyond that exist only
where the implementation needs them — Antigravity has an engine, geometry and
math modules; SplitFlap is a single file.

### Boundaries

- `src/playground` may import from `src/lib`. The reverse never happens.
- `src/lib` imports React and browser APIs, never Next.js. An ESLint rule fails
  the build if either boundary is crossed.
- `src/lib/internal` is shared by several components but is not exported from
  `src/lib/index.ts`. Engines, geometry and math helpers stay internal too.
- Cross-component imports inside the library go to the specific module, not to
  another component's barrel, so barrels stay a description of the public API.

## Playground

- One route per component: `/`, `/aperture`, `/grid-trail`, `/reel`,
  `/scroll-stack`, `/split-flap`, `/stencil`, `/trailing-cursor`.
- The panel is generated from a schema, and every row is labelled with the real
  prop path (`pulse.waveform`, `formation.radius`).
- At the bottom of the panel is ready-to-paste JSX containing only the props that
  differ from the defaults, with a copy button.
- `H` hides the panel.

### Presets keep your edits

Anything changed by hand becomes a sticky override. Switching presets applies the
preset underneath those edits, so tweaks survive until **Reset** — the panel
shows how many are being kept.

```
config = defaults → preset → your edits (win)
```

## Conventions

- **Engine separate from the React wrapper** for canvas components. The component
  mounts a canvas and pushes config objects into a plain class, so changing a
  prop never restarts the animation.
- **Props only.** No global theme, no context, no CSS framework. Colours that
  need theming are exposed as CSS custom properties on the component root.
- **Colours are never parsed by hand.** Canvas takes the raw string and
  transparency comes from `globalAlpha`, which supports `oklch()` and everything
  else for free. Only `var(--token)` is resolved, via `getComputedStyle`.
- **Every animation loop stops when idle** and restarts on demand.
- **Reduced motion and coarse pointers are handled by every component**, not
  bolted on afterwards.
- **Documentation lives in READMEs.** Source stays comment-free; the "why" goes
  in the component's README.

## Scripts

|                                     |                                             |
| ----------------------------------- | ------------------------------------------- |
| `pnpm dev`                          | Playground dev server                       |
| `pnpm build`                        | Production build                            |
| `pnpm lint`                         | ESLint, including the library-boundary rule |
| `pnpm format` / `pnpm format:check` | Prettier                                    |
| `pnpm typecheck`                    | `tsc --noEmit`                              |
| `pnpm test`                         | Vitest, jsdom                               |
| `pnpm check`                        | Everything CI runs                          |

Do not run `pnpm build` while `pnpm dev` is running — both write to `.next`.

## Publishing

The package is currently `private: true`. React and React DOM are already
declared as `peerDependencies`, the public entry point is explicit, and
`sideEffects` marks the CSS files so bundlers keep them.

Two things are deliberately missing, because they cannot be inferred from the
repository:

1. **A licence.** `license` is `UNLICENSED`, which grants nobody any rights.
   Choose a real one and add a `LICENSE` file before making the repository public.
2. **A free package name.** `zerogravity-ui` matches the repository but is
   already taken on npm; `zerogravity` was free at the time of writing.

Publishing also needs a library build step, which this repository does not have:
components import `.css` files directly, so consumers currently need a bundler
that understands CSS imports. The recommended next step is a small `tsup` (or
`rollup`) config emitting ESM plus type declarations and a single stylesheet,
wired to `exports`, `files` and `publishConfig`. That was left out on purpose —
adding a build pipeline before the licence and name are settled would be
premature.

## Adding a component

1. `src/lib/<component>/` with the component, an `index.ts` describing its public
   surface, and a `README.md` with the prop table.
2. Re-export the intended API from `src/lib/index.ts`.
3. `src/playground/<component>/schema.ts` plus a demo that renders `Panel`.
4. A route in `src/app/<component>/page.tsx` and a link in `src/playground/Nav.tsx`.
5. A test next to the component covering rendering, keyboard or pointer
   behaviour, cleanup, and reduced-motion.
