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

## Versioning

The policy is in the [README](README.md#versioning). In short: SemVer, and while
the version is `0.x` breaking changes ship in a minor release.

Every user-visible change needs a [CHANGELOG.md](CHANGELOG.md) entry under
`## [Unreleased]`, in the appropriate `Added` / `Changed` / `Fixed` / `Removed` /
`Security` group. Write it for someone upgrading the package, not for someone
reading the diff.

### Why there is no Changesets

Changesets solves problems this repository does not have: coordinating versions
across multiple packages, and collecting release notes from many contributors in
parallel. This is a single package with a single maintainer, so it would add a
dependency, a `.changeset/` directory and a second changelog format on top of the
hand-written one, in exchange for automating a version bump that `pnpm version`
already does in one command. Revisit it if the repository ever becomes a
monorepo or takes regular outside contributions.

For the same reason there are no custom version-bumping scripts. `pnpm version`
is built in, updates `package.json` and creates the tag, and needs no
maintenance.

## Releasing

`prepack` runs `pnpm build:lib`, so the build cannot be skipped by accident.

1. Confirm the [release blockers](README.md#release-blockers) are resolved: an
   available package name, and `private` removed from `package.json`.
2. `pnpm release:check` — lint, format, typecheck, tests, then the library build.
3. `pnpm audit` — no known vulnerabilities.
4. Move the `## [Unreleased]` entries in `CHANGELOG.md` under a new version
   heading with today's date, and add the comparison links at the bottom.
5. `pnpm version <patch|minor|major>` — bumps `package.json` and creates the
   `v<version>` commit and tag.
6. `pnpm pack` and inspect the tarball: `dist/`, `README.md`, `CHANGELOG.md`,
   `LICENSE` and `package.json`, and nothing from `src/`, the playground or the
   test suite.
7. Smoke-test the tarball in a throwaway consumer — one Vite app and one Next.js
   App Router app — installing the `.tgz` directly. Check that imports and types
   resolve, styles load, components render, and both production builds pass.
8. `npm publish` (the package is public: `publishConfig.access` is already set).
9. `git push && git push --tags`.
10. Create the GitHub release from the tag, pasting the changelog section.

Steps 6 and 7 are not optional. A `tsup` build that succeeds is not evidence that
the published package works — the JSX runtime and `"use client"` bugs found
before `0.1.0` were both invisible until the packed tarball was installed by a
real consumer.
