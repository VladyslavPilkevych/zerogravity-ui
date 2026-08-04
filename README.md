# ui-library

React / Next components, plus a playground where every prop is wired to a live
input.

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

The project uses **pnpm** and pins the version in `packageManager`. If you do
not have it, `corepack enable` will fetch the exact version from `package.json`.

## Components

| Component | |
| --- | --- |
| [Antigravity](src/lib/antigravity/README.md) | Canvas particle cloud that follows the cursor — or stays put and scatters away from it. Fifteen formations including a real 3-D planet, a torus and a black hole accretion disc; particle shapes, a pulse with a configurable waveform, palette shimmer, shockwaves |
| [ScrollStack](src/lib/scroll-stack/README.md) | Sections that slide over each other on scroll and unstack on the way back. Full-screen or mixed heights |
| [Reel](src/lib/reel/README.md) | Roulette-style carousel with drag, flick, wheel, keyboard and a highlighted centre slide |
| [Stencil](src/lib/stencil/README.md) | Display type with a pattern showing through the letters — zebra, leopard, a photo — and per-letter hover effects |

Each component has its own README with the full prop table and its performance
notes.

## Layout

```
src/
├── lib/                      the library itself, this is what gets published
│   ├── antigravity/
│   │   ├── Antigravity.tsx       React wrapper ("use client")
│   │   ├── engine.ts             canvas engine, no React
│   │   ├── types.ts              config and defaults
│   │   ├── formations.ts         cloud geometry, 2-D and 3-D
│   │   ├── shapes.ts             particle geometry
│   │   ├── math.ts               LUT trigonometry, waveforms
│   │   ├── color.ts              colour parsing, palette ramp
│   │   └── presets.ts            twelve ready-made looks
│   ├── scroll-stack/
│   ├── reel/
│   └── stencil/
│
├── playground/               the demo, not part of the library
│   ├── panel/                    generic control panel driven by a schema
│   ├── antigravity/              demo + control schema
│   ├── scroll-stack/
│   ├── reel/
│   └── stencil/
│
└── app/                      Next App Router, hosts the playground
```

Nothing in `src/lib` imports from `src/playground` or from Next, so the folder
can be lifted into a standalone package as-is.

## Playground

- One route per component: `/`, `/scroll-stack`, `/reel`, `/stencil`.
- The panel on the right is generated from a schema, and every row is labelled
  with the **real prop path** (`pulse.waveform`, `formation.radius`).
- At the bottom of the panel is ready-to-paste JSX containing only the props
  that differ from the defaults, with a copy button.
- `H` hides the panel.

### Presets keep your edits

Anything you change by hand becomes a sticky override. Switching presets applies
the preset underneath your edits, so the tweaks survive until you press
**Reset** — the panel shows how many are being kept.

```
config = defaults  →  preset  →  your edits (win)
```

That means a preset can no longer move a field you have touched yourself. Press
Reset to hand those fields back to the presets.

## Conventions

- **Engine separate from the React wrapper.** Antigravity keeps its simulation
  in a plain class; the component mounts a canvas and pushes config objects into
  it. Because of that, changing a prop never restarts the animation, and the
  engine stays portable.
- **Props only.** No global theme, no context, no CSS framework. Colours that
  need to be themeable are exposed as CSS custom properties on the component
  root (`--reel-accent`).
- **Documentation lives in READMEs, not in comments.** The source stays free of
  comments; every "why" belongs in the component's README.
- **Reduced motion is handled by every component**, not bolted on afterwards.

## Adding the next component

1. `src/lib/<component>/` with the component, an `index.ts` of re-exports and a
   `README.md` with the prop table.
2. Re-export it from `src/lib/index.ts`.
3. `src/playground/<component>/schema.ts` describing the controls, plus a demo
   that renders `Panel`.
4. A route in `src/app/<component>/page.tsx` and a link in
   `src/playground/Nav.tsx`.

## Scripts

| | |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |

Do not run `pnpm build` while `pnpm dev` is running — both write to `.next` and
the dev server starts returning 500s afterwards.

## `archive/`

`archive/particle-field-v1/` is the original component with hard-coded
constants, from before it became configurable and was renamed to Antigravity.
It is the only file left with Russian comments. Safe to delete.
