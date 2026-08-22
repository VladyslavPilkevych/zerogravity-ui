export { MEADOW_GHOST_VARIANTS, GhostClassic, GhostKitten, GhostRibbon } from "./ghosts"
export { MEADOW_UFO_VARIANTS, UfoSaucer, UfoBeam, UfoAntenna } from "./ufos"
export { MEADOW_MOON_VARIANTS, MoonFull, MoonDozy } from "./moons"
export { MEADOW_SUN_VARIANTS, SunRayed, SunGlow, SunFace, SunSpiky, SunRising } from "./suns"
export { ghostBody } from "./ghostBody"
export type { GhostShape } from "./ghostBody"
export type { MeadowVariant, MeadowVariantGroup, MeadowVariantSet } from "./types"

import { MEADOW_GHOST_VARIANTS } from "./ghosts"
import { MEADOW_MOON_VARIANTS } from "./moons"
import { MEADOW_SUN_VARIANTS } from "./suns"
import type { MeadowVariantSet } from "./types"
import { MEADOW_UFO_VARIANTS } from "./ufos"

/**
 * The approved asset library. The live scene draws its ghosts, UFOs, moon and sun
 * from these sets, and the gallery previews them.
 */
export const MEADOW_VARIANT_SETS: readonly MeadowVariantSet[] = [
    {
        group: "ghost",
        title: "Ghosts",
        blurb: "Mascots. Bodies use the Meadow palette tokens, so they follow the theme.",
        variants: MEADOW_GHOST_VARIANTS,
    },
    {
        group: "ufo",
        title: "UFOs",
        blurb: "Saucers for the space scene, playful rather than menacing.",
        variants: MEADOW_UFO_VARIANTS,
    },
    {
        group: "moon",
        title: "Moons",
        blurb: "The night orb. Each one has its own personality.",
        variants: MEADOW_MOON_VARIANTS,
    },
    {
        group: "sun",
        title: "Suns",
        blurb: "The day orb, from plain glow to a face.",
        variants: MEADOW_SUN_VARIANTS,
    },
]
