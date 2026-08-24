# Contributing

## Setup

```bash
corepack enable
pnpm install
pnpm dev
```

Node 22 or newer, pnpm 10 or newer. Only pnpm is supported — do not commit a
`package-lock.json` or `yarn.lock`.

The Node floor is real rather than cautious: the jsdom test environment pulls in
undici, which needs Node 22.19+. On an older runtime the unit tests fail with an
opaque `markAsUncloneable is not a function` error instead of a version message.

## Before opening a pull request

```bash
pnpm check
```

That runs lint, format check, typecheck, unit tests and the Storybook browser
tests. CI additionally runs the Playwright smoke suite, package validation,
packed-consumer tests and Chromatic.

Git hooks are installed automatically: ESLint and Prettier run on staged files at
commit time, typecheck and unit tests at push time.

The full layer-by-layer guide is in [TESTING.md](TESTING.md).

Run `pnpm build` separately, and never while `pnpm dev` is running: both write
to `.next` and the dev server starts serving 500s afterwards.

## Rules that the review will check

**Boundaries.** `src/lib` must not import from `src/docs`, `src/playground` or
from Next.js.
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

Which layer a test belongs in, and how stories stay deterministic, is covered in
[TESTING.md](TESTING.md).

## Repository settings for `main`

These cannot be configured from the repository itself and must be set in GitHub.

Branch protection:

- Require a pull request before merging.
- Require status checks to pass, and require the branch to be up to date.
- Prevent force pushes and branch deletion.
- Optionally require conversation resolution.

Required status checks:

- `Static quality`
- `Unit tests`
- `Library build and package validation`
- `Packaged consumer tests`
- `Next.js docs site build`
- `Storybook browser and accessibility tests`
- `Playwright smoke tests`

`Chromatic visual review` and `Dependency audit` are deliberately **not**
required. Visual diffs need a human decision rather than a hard gate, and an
advisory published upstream should not block an unrelated pull request. Review
both before merging anyway.

Secrets:

- `CHROMATIC_PROJECT_TOKEN` — from the Chromatic project settings. Without it the
  visual job reports that it was skipped instead of failing.

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

1. Confirm you can publish: an npm account with 2FA enabled, and write access
   to [`zerogravity`](https://www.npmjs.com/package/zerogravity) — `npm owner ls
zerogravity` lists who has it. The package name and the repository slug
   differ on purpose: the project is ZeroGravity UI, the repository is
   `zerogravity-ui`, and the npm package is `zerogravity`, because
   `zerogravity-ui` was already taken by an unrelated package.

2. `pnpm release:check` — lint, format, typecheck, unit and browser tests, then
   the library build, package validation and the packed-consumer tests.
3. `pnpm audit` — no known vulnerabilities.
4. Move the `## [Unreleased]` entries in `CHANGELOG.md` under a new version
   heading with today's date, and add the comparison links at the bottom.
5. `pnpm version <patch|minor|major>` — bumps `package.json` and creates the
   `v<version>` commit and tag.
6. `pnpm pack` and inspect the tarball: `dist/`, `README.md`, `CHANGELOG.md`,
   `LICENSE` and `package.json`, and nothing from `src/`, the docs site or the
   test suite.
7. Smoke-test the tarball in a throwaway consumer — one Vite app and one Next.js
   App Router app — installing the `.tgz` directly. Check that imports and types
   resolve, styles load, components render, and both production builds pass.
8. `npm publish` (the package is public: `publishConfig.access` is already set).
9. `git push && git push --tags`.
10. Create the GitHub release from the tag, pasting the changelog section.
11. Install the published package into a throwaway app — `npm i zerogravity`
    from the registry, not the local tarball — and check that a root import, a
    subpath import and the types all resolve. The registry can serve a different set of
    files than `pnpm pack` produced if `files` and `.npmignore` disagree.

Steps 6, 7 and 11 are not optional. A `tsup` build that succeeds is not evidence that
the published package works — the JSX runtime and `"use client"` bugs found
before `0.1.0` were both invisible until the packed tarball was installed by a
real consumer.
