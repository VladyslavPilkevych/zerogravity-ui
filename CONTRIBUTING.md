# Contributing

## Setup

```bash
corepack enable
pnpm install
pnpm dev
```

Node 20 or newer, pnpm 10 or newer. Only pnpm is supported — do not commit an
`package-lock.json` or `yarn.lock`.

## Before opening a pull request

```bash
pnpm check
```

That runs lint, format check, typecheck and the test suite. CI runs the same
commands plus `pnpm build`.

Run `pnpm build` separately, and never while `pnpm dev` is running: both write
to `.next` and the dev server starts serving 500s afterwards.

## Rules that the review will check

**Boundaries.** `src/lib` must not import from `src/playground` or from Next.js.
ESLint enforces this, but keep it in mind while moving code around.

**Public surface.** A component's `index.ts` is its API. Engines, geometry, math
and anything in `src/lib/internal` stay unexported. Adding an export is a design
decision, not a convenience.

**No comments.** Source stays comment-free. If something needs explaining, either
the naming and structure should carry it, or it belongs in the component's
README. The only acceptable comment is a genuinely non-obvious constraint that
cannot be expressed in code.

**English only.** Code, UI strings, labels, tests, docs and commit messages.

**Every loop stops.** Anything using `requestAnimationFrame` must go idle when
there is nothing to animate and restart on demand, and must cancel pending frames
on unmount. There is a test for this on every animated component; add one for
anything new.

**Reduced motion and coarse pointers.** Honour `prefers-reduced-motion: reduce`
and `(pointer: fine)`. Pointer-driven components should use
`usePointerFxEnabled` rather than reimplementing the gate.

## Tests

Tests live next to the code they cover. Prefer testing behaviour a consumer can
observe — rendered output, keyboard interaction, cleanup, accessibility
attributes — over implementation details.

The harnesses in `src/test` provide a controllable `requestAnimationFrame`, a
canvas stub for jsdom, and switchable media-query state.

## Adding a component

The steps are listed at the end of the [README](README.md).
