# Testing

Each layer owns one kind of risk. Nothing is tested twice on purpose — if a check
belongs in a faster layer, it lives there.

| Layer                   | Tool                          | Owns                                                                   |
| ----------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| Unit and logic          | Vitest + jsdom                | Helpers, math, geometry, config merging, cleanup, reduced-motion gates |
| Component browser tests | Storybook + Vitest browser    | Real Chromium rendering, pointer, keyboard, focus, hover               |
| Accessibility           | Storybook a11y addon (axe)    | Roles, names, labels, hidden decorative content                        |
| Visual regression       | Chromatic                     | Geometry, radius, shadows, masks, focus rings, responsive layout       |
| Application smoke       | Playwright                    | Playground routes, navigation, console cleanliness, Next.js behaviour  |
| Package correctness     | publint, attw, tarball checks | Exports, declarations, metadata, published contents                    |
| Consumer correctness    | Packed `.tgz` fixtures        | Vite and Next.js installs, types, CSS, tree shaking, `"use client"`    |

## Commands

```bash
pnpm test              # unit tests (jsdom)
pnpm test:watch        # unit tests in watch mode
pnpm test:browser      # Storybook stories in real Chromium, including accessibility
pnpm test:e2e          # Playwright smoke tests against the production build
pnpm storybook         # Storybook dev server on :6006
pnpm build-storybook   # static Storybook build
pnpm check:package     # pack, then publint + attw + tarball inspection
pnpm test:consumer     # install the packed tarball into throwaway Vite and Next.js apps
pnpm check             # lint, format, types, unit tests, browser tests
pnpm release:check     # pnpm check plus library build, package validation, consumer tests
```

`pnpm test:e2e` needs a production build first (`pnpm build`); Playwright starts
`pnpm start` itself and reuses a running server locally.

Browser layers need Chromium once per machine:

```bash
pnpm exec playwright install chromium
```

## Playground and Storybook

Both exist and neither replaces the other.

- **Playground** (`pnpm dev`) is the product surface: rich demos, live prop
  panels, presets and generated JSX.
- **Storybook** is the QA surface: deterministic states used as fixtures by
  browser tests, accessibility checks and visual regression.

Stories deliberately avoid prop panels and randomness. If a state is interesting
to look at, it belongs in the playground; if it is interesting to assert against,
it belongs in a story.

## Determinism

Visual and browser tests only work if a story renders identically every run. The
rules stories follow:

- Animation-driven components take a fixed `seed` and render one frame with
  `paused`, with `render.fadeIn` set to `0` so the frame is fully opaque.
- `SplitFlap` stories wait for the board to stop flipping before asserting, using
  the component's own `data-flipping` attribute rather than a timeout.
- Stories that cannot be stabilised — a running clock, a countdown, a continuous
  pattern animation — set `chromatic.disableSnapshot` and stay as interaction and
  accessibility fixtures only.
- No story renders a timestamp, a random value or an unseeded sequence.

Never stabilise a test with a fixed sleep. Wait for the state the component
exposes.

## Accessibility

Accessibility runs inside `pnpm test:browser`: every story is checked with axe
after it renders, and `a11y.test` is set to `error` so violations fail the run.
There is no separate command, because a separate command would run exactly the
same tests.

Violations are not suppressed globally. If a rule genuinely does not apply to a
story, disable that single rule on that single story through the `a11y`
parameter and record the reason here rather than in a source comment.

There are currently no such exceptions.

## Visual regression

Chromatic builds the static Storybook and compares snapshots per pull request.
Configuration lives in `chromatic.config.json`; snapshots are captured at 390 px
and 1280 px, which covers the responsive behaviour these components actually have.

Run it locally with a token:

```bash
CHROMATIC_PROJECT_TOKEN=<token> pnpm chromatic
```

In CI the token comes from the `CHROMATIC_PROJECT_TOKEN` repository secret. When
that secret is absent the visual job reports that it was skipped rather than
failing, so forks still get a green pipeline.

**Accepting an intentional visual change:** open the Chromatic build linked from
the pull request, review the diff, and accept it there. Accepted snapshots become
the new baseline on merge. Never accept a diff you cannot explain — a changed
snapshot in a component you did not touch usually means a shared CSS token moved.

## Consumer and package checks

`pnpm check:package` and `pnpm test:consumer` both start from a real `pnpm pack`
and never from repository aliases, because path aliases hide exactly the bugs
these checks exist to find.

They verify the published `exports` map, generated declarations, that the tarball
carries only `dist`, `README.md`, `CHANGELOG.md`, `LICENSE` and `package.json`,
that a Vite app and a Next.js App Router app both build against the tarball, that
public types resolve while invalid usage still fails to compile, that importing
one component does not pull in the others, and that `"use client"` survives on the
individual modules rather than collapsing onto the entry point.

## Local versus CI

Git hooks are installed by `pnpm install` through Lefthook.

- **pre-commit** — ESLint and Prettier on staged files only.
- **pre-push** — typecheck and unit tests.

Browser, visual, end-to-end and consumer checks are CI-only. They are too slow to
sit in front of every commit, and CI runs them in parallel.
