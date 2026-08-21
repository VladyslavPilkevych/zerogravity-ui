# Meadow asset library

The approved artwork. The live scene draws its ghosts, UFOs, moon and sun from
here, and the gallery previews the same components — there is no second copy.

| Group | Approved      |
| ----- | ------------- |
| Ghost | 1, 5, 6       |
| UFO   | 1, 3, 6       |
| Moon  | 1, 3          |
| Sun   | 1, 3, 4, 5, 6 |

Rejected variants are deleted, not parked. A test pins the surviving ids and
asserts the scene never reaches for a removed one — including airplanes, which
Meadow no longer has at all.

## Where to review them

- **Playground:** `/x/meadow-assets`. Every group is shown as a labelled grid,
  with a Day / Night / Space switch so you can see each asset on the backdrop it
  would actually sit on.
- **Storybook:** `Experimental/Meadow Assets` — one story per group, plus
  `GhostsAtNight` and `GhostsInSpace` for the palette-driven ones. The artwork is
  static, so these are safe to snapshot.

## Layout

| File           | Holds                                                 |
| -------------- | ----------------------------------------------------- |
| `ghosts.tsx`   | `MEADOW_GHOST_VARIANTS` + shared face pieces          |
| `ufos.tsx`     | `MEADOW_UFO_VARIANTS`                                 |
| `moons.tsx`    | `MEADOW_MOON_VARIANTS`                                |
| `suns.tsx`     | `MEADOW_SUN_VARIANTS`                                 |
| `ghostBody.ts` | Parametric ghost silhouette builder                   |
| `gallery.css`  | Grid and tile styles, shared by both previews         |
| `index.ts`     | `MEADOW_VARIANT_SETS`, the registry the previews read |

Every variant is `{ id, label, note, Art }`. Ids are `<group>-<n>` and match the
`data-variant` attribute on the artwork, so a screenshot can always be traced
back to a component.

## Palette

Ghosts paint with the Meadow tokens — `--meadow-body`, `--meadow-outline`,
`--meadow-face`, `--meadow-blush` — so they follow the theme without changes.
Planes, UFOs, moons and suns use fixed colours drawn from the same palette,
matching how the live art already works.

## How the scene uses them

- **Ghosts** are placed by name in `art.tsx`: `MEADOW_CAST` and
  `MEADOW_SPACE_CAST` reference `GhostClassic`, `GhostKitten` and `GhostRibbon`
  directly, so which ghost stands where is fixed rather than random.
- **UFOs** are referenced the same way — `UfoSaucer` and `UfoAntenna` fly in the
  space cast, with `UfoBeam` approved and available.
- **Orbs** are picked deterministically from the whole approved set:
  `MEADOW_SUN_ART` and `MEADOW_MOON_ART` are indexed with `pickVariant(count,
seed, salt)`, so changing `seed` changes which approved sun or moon hangs in
  the sky and the choice is stable for SSR, tests and Chromatic.

## Adding or swapping one

1. Add the component to its group file and register it in the array with an
   `id`, `label` and `note`. Keep `data-variant` — the whitelist test reads it.
2. To put a ghost or UFO on stage, point a cast entry at it. To reach the orb
   rotation, just being in `MEADOW_SUN_VARIANTS` / `MEADOW_MOON_VARIANTS` is
   enough.
3. Ghosts need `ghostBody.ts`; it stays in this folder, so nothing to copy.
4. Check the viewBox aspect ratio — the scene sizes art by `width` and lets
   height follow, so a much taller or wider box changes how an anchor reads.

Removing one means deleting the component and its registry entry, then updating
the approved lists in `variants.test.tsx` and `e2e/meadow-assets.spec.ts`.
