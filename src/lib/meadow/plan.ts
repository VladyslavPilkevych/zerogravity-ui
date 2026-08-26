import { rngFor } from "../internal"

export type MeadowMotion = "float" | "bob" | "hover" | "glide" | "flit" | "twinkle"

export type MeadowDensity = "calm" | "cosy" | "lively"

export type MeadowKind = "balloon" | "butterfly" | "bird" | "mascot" | "star" | "rocket" | "ufo"

export type MeadowTheme = "sunrise" | "day" | "sunset" | "night" | "space"

/** the Earth-like states local time can resolve to; space is always explicit */
export type MeadowDaypart = Exclude<MeadowTheme, "space">

export type MeadowScenePart =
    | "sun"
    | "clouds"
    | "hills"
    | "flowers"
    | "balloon"
    | "butterflies"
    | "birds"
    | "mascots"
    | "stars"
    | "comets"
    | "planets"
    | "rockets"
    | "ufos"

export type MeadowScene = Partial<Record<MeadowScenePart, boolean>>

export interface MeadowOrbSpot {
    x: number
    y: number
}

export interface MeadowThemeSpec {
    surface: string
    orb: "sun" | "moon" | null
    stars: number
    starSize: number
    glow: boolean
    /** whether the orb rides its clock arc in this scene */
    arc: boolean
    /** where the orb sits when there is no clock to follow */
    orbAt?: MeadowOrbSpot
    /** off by default, but a consumer can switch these back on */
    quiet: readonly MeadowScenePart[]
    /** never drawn in this theme, whatever the scene asks for */
    forbid: readonly MeadowScenePart[]
}

export const MEADOW_THEMES: Record<MeadowTheme, MeadowThemeSpec> = {
    sunrise: {
        surface: "xp-meadow-warm xp-meadow-dawn",
        orb: "sun",
        stars: 0,
        starSize: 0,
        glow: false,
        arc: true,
        orbAt: { x: 11, y: 52 },
        quiet: ["comets", "birds"],
        forbid: ["planets", "rockets", "ufos"],
    },
    day: {
        surface: "",
        orb: "sun",
        stars: 0,
        starSize: 0,
        glow: false,
        arc: true,
        quiet: ["comets"],
        forbid: ["planets", "rockets", "ufos"],
    },
    sunset: {
        surface: "xp-meadow-warm xp-meadow-dusk",
        orb: "sun",
        stars: 0,
        starSize: 0,
        glow: false,
        arc: true,
        orbAt: { x: 89, y: 52 },
        quiet: ["comets", "butterflies"],
        forbid: ["planets", "rockets", "ufos"],
    },
    night: {
        surface: "xp-meadow-night",
        orb: "moon",
        stars: 18,
        starSize: 2.4,
        glow: true,
        arc: true,
        quiet: ["birds", "butterflies"],
        forbid: ["planets", "rockets", "ufos"],
    },
    space: {
        surface: "xp-meadow-space",
        orb: null,
        stars: 30,
        starSize: 3.8,
        glow: true,
        arc: false,
        quiet: [],
        forbid: ["sun", "clouds", "hills", "flowers", "balloon", "birds", "butterflies"],
    },
}

export interface MeadowSpec {
    motion: MeadowMotion
    kind?: MeadowKind
    x: number
    y: number
    size: number
    depth?: number
    flip?: boolean
    compact?: { x: number; y: number; size?: number }
}

export interface MeadowPlanEntry {
    index: number
    item: number
    motion: MeadowMotion
    kind?: MeadowKind
    x: number
    y: number
    size: number
    depth: number
    flip: boolean
    duration: number
    delay: number
    amplitude: number
    sway: number
    spin: number
    rest: number
    swing: number
}

export const MEADOW_DENSITY: Record<MeadowDensity, number> = {
    calm: 2,
    cosy: 4,
    lively: 7,
}

const BEAT: Record<MeadowMotion, number> = {
    float: 9,
    bob: 7.5,
    hover: 5.6,
    glide: 27,
    flit: 13,
    twinkle: 4.2,
}

const REACH: Record<MeadowMotion, number> = {
    float: 19,
    bob: 20,
    hover: 13,
    glide: 26,
    flit: 22,
    twinkle: 4,
}

function round(value: number, places: number): number {
    const factor = 10 ** places
    return Math.round(value * factor) / factor
}

export function planCast(
    specs: readonly MeadowSpec[],
    count: number,
    seed: number,
    compact = false,
): MeadowPlanEntry[] {
    if (specs.length === 0 || count <= 0) return []

    const entries: MeadowPlanEntry[] = []

    for (let index = 0; index < Math.min(count, specs.length); index += 1) {
        const spec = specs[index]
        const random = rngFor(seed, index)
        const depth = spec.depth ?? 0.6
        const spot = compact && spec.compact ? spec.compact : spec

        const duration = round(BEAT[spec.motion] * (0.84 + random() * 0.38), 2)
        const amplitude = round(REACH[spec.motion] * (0.78 + random() * 0.5), 1)

        entries.push({
            index,
            item: index,
            motion: spec.motion,
            kind: spec.kind,
            x: spot.x,
            y: spot.y,
            size: Math.round((spot.size ?? spec.size) * (0.82 + depth * 0.34)),
            depth,
            flip: spec.flip ?? false,
            duration,
            delay: round(-duration * random(), 2),
            amplitude,
            sway: round(amplitude * (0.3 + random() * 0.4), 1),
            spin: round(1.2 + random() * 3.6, 2),
            rest: round(16 + random() * 62, 2),
            swing: spot.x < 50 ? -1 : 1,
        })
    }

    return entries
}

export interface MeadowStar {
    x: number
    y: number
    size: number
    tone: number
    beat: number
}

export function planStars(count: number, seed: number, largest = 2.4, reach = 56): MeadowStar[] {
    const stars: MeadowStar[] = []

    for (let index = 0; index < count; index += 1) {
        const random = rngFor(seed + 977, index)
        const depth = random()

        stars.push({
            x: round(2 + random() * 96, 2),
            y: round(2 + random() * reach, 2),
            size: round(1.3 + depth * largest, 2),
            tone: round(0.3 + depth * 0.55, 2),
            beat: round(2.6 + random() * 4.2, 2),
        })
    }

    return stars
}

/**
 * Local-clock boundaries, in hours. Everything time related reads these, so the
 * hour values live here and nowhere else.
 */
export interface MeadowClock {
    sunriseStart: number
    dayStart: number
    sunsetStart: number
    nightStart: number
}

export const MEADOW_CLOCK: MeadowClock = {
    sunriseStart: 5,
    dayStart: 8,
    sunsetStart: 18,
    nightStart: 21,
}

/** Maps an hour of the local day, fractions allowed, onto a scene. */
export function daypartForHour(hour: number, clock: MeadowClock = MEADOW_CLOCK): MeadowDaypart {
    const at = ((hour % 24) + 24) % 24

    if (at >= clock.nightStart || at < clock.sunriseStart) return "night"
    if (at < clock.dayStart) return "sunrise"
    if (at < clock.sunsetStart) return "day"
    return "sunset"
}

export function hourOf(at: Date): number {
    return at.getHours() + at.getMinutes() / 60
}

/**
 * A stylised arc, not an ephemeris. Daylight runs left to right across the sky
 * and peaks in the middle; the night window works the same way for the moon.
 */
export function orbSpot(hour: number, clock: MeadowClock = MEADOW_CLOCK): MeadowOrbSpot {
    const at = ((hour % 24) + 24) % 24
    const dark = at >= clock.nightStart || at < clock.sunriseStart

    const span = dark
        ? 24 - clock.nightStart + clock.sunriseStart
        : clock.nightStart - clock.sunriseStart
    const since = dark
        ? at < clock.sunriseStart
            ? at + (24 - clock.nightStart)
            : at - clock.nightStart
        : at - clock.sunriseStart

    const progress = span <= 0 ? 0.5 : Math.min(1, Math.max(0, since / span))

    return {
        x: round(8 + progress * 84, 2),
        y: round(58 - Math.sin(progress * Math.PI) * 50, 2),
    }
}

/** Deterministic pick from an approved asset set. */
export function pickVariant(count: number, seed: number, salt: number): number {
    if (count <= 1) return 0
    return Math.floor(rngFor(seed + salt, salt)() * count) % count
}

/* ------------------------------------------------------- the living scene */

export interface MeadowCreatures {
    bees?: number
    butterflies?: number
    ghosts?: number
    fireflies?: number
    /** extra balloons beyond the one in the cast */
    balloons?: number
}

export interface MeadowInteraction {
    enabled?: boolean
    pointerAvoidance?: boolean
    curiousButterflies?: boolean
    ghostsReact?: boolean
    /** how close the pointer gets before creatures react, in scene percent */
    radius?: number
}

export interface MeadowSpaceScene {
    planets?: number
}

export type MeadowEventPace = "rare" | "normal" | "frequent"

export interface MeadowLifeCounts {
    bees: number
    butterflies: number
    ghosts: number
    fireflies: number
    balloons: number
    planets: number
}

/** Ceilings, not suggestions: nobody renders three hundred animated creatures. */
export const MEADOW_LIMITS = {
    bees: 12,
    butterflies: 16,
    ghosts: 12,
    fireflies: 40,
    balloons: 8,
    planets: 20,
} as const

/*
 * Ghosts stay at zero: the hand-placed cast already carries mascots, and adding
 * more by default would change every existing scene. `creatures.ghosts` asks
 * for extra ones on top of the cast.
 */
const LIFE_BY_DENSITY: Record<MeadowDensity, MeadowLifeCounts> = {
    calm: { bees: 3, butterflies: 3, ghosts: 0, fireflies: 16, balloons: 0, planets: 6 },
    cosy: { bees: 5, butterflies: 5, ghosts: 0, fireflies: 26, balloons: 0, planets: 9 },
    lively: { bees: 8, butterflies: 7, ghosts: 0, fireflies: 36, balloons: 0, planets: 13 },
}

function count(asked: number | undefined, fallback: number, cap: number): number {
    if (asked === undefined || !Number.isFinite(asked)) return fallback
    return Math.round(clampTo(asked, 0, cap))
}

function clampTo(value: number, low: number, high: number): number {
    return value < low ? low : value > high ? high : value
}

/**
 * Density sets the shape of the scene and any explicit count overrides it.
 * Which creatures actually appear is then a matter of the theme: no bees at
 * night, no fireflies by day, no meadow creatures in space.
 */
export function resolveLife(
    theme: MeadowTheme,
    density: MeadowDensity,
    creatures: MeadowCreatures | undefined,
    space: MeadowSpaceScene | undefined,
    small: boolean,
): MeadowLifeCounts {
    const base = LIFE_BY_DENSITY[density] ?? LIFE_BY_DENSITY.cosy
    const trim = small ? 0.55 : 1

    const wanted: MeadowLifeCounts = {
        bees: count(creatures?.bees, base.bees, MEADOW_LIMITS.bees),
        butterflies: count(creatures?.butterflies, base.butterflies, MEADOW_LIMITS.butterflies),
        ghosts: count(creatures?.ghosts, base.ghosts, MEADOW_LIMITS.ghosts),
        fireflies: count(creatures?.fireflies, base.fireflies, MEADOW_LIMITS.fireflies),
        balloons: count(creatures?.balloons, base.balloons, MEADOW_LIMITS.balloons),
        planets: count(space?.planets, base.planets, MEADOW_LIMITS.planets),
    }

    const day = theme === "day" || theme === "sunrise" || theme === "sunset"
    const night = theme === "night"

    return {
        bees: theme === "space" || night ? 0 : Math.round(wanted.bees * trim * (day ? 1 : 0.5)),
        butterflies:
            theme === "space"
                ? 0
                : Math.round(wanted.butterflies * trim * (night ? 0.5 : day ? 1 : 0.7)),
        ghosts: Math.round(wanted.ghosts * (small ? 0.6 : 1)),
        fireflies: night ? Math.round(wanted.fireflies * trim) : 0,
        balloons: theme === "space" ? 0 : Math.round(wanted.balloons * (small ? 0.6 : 1)),
        planets: theme === "space" ? Math.round(wanted.planets * (small ? 0.6 : 1)) : 0,
    }
}

export interface MeadowGhostSpot {
    variant: number
    x: number
    y: number
    size: number
    depth: number
    motion: MeadowMotion
    duration: number
    delay: number
    amplitude: number
    sway: number
    /** seconds between one of its rare little behaviours */
    beatEvery: number
    behaviour: number
}

const GHOST_MOTION: readonly MeadowMotion[] = ["float", "bob", "hover"]

/**
 * Extra ghosts beyond the hand-placed cast. Each gets its own scale, pace and
 * drift so a crowd never moves as one.
 */
export function planGhosts(
    count: number,
    seed: number,
    variants: number,
    compact = false,
): MeadowGhostSpot[] {
    const spots: MeadowGhostSpot[] = []

    for (let index = 0; index < count; index += 1) {
        const random = rngFor(seed + 281, index)
        const depth = round(0.25 + random() * 0.65, 2)
        const lane = index % 2 === 0 ? 6 + random() * 30 : 64 + random() * 30
        const motion = GHOST_MOTION[Math.floor(random() * GHOST_MOTION.length) % 3]

        spots.push({
            variant: variants > 0 ? Math.floor(random() * variants) % variants : 0,
            x: round(lane, 1),
            y: round(18 + random() * (compact ? 62 : 68), 1),
            size: Math.round((compact ? 34 : 44) + depth * (compact ? 20 : 30)),
            depth,
            motion,
            duration: round(BEAT[motion] * (0.8 + random() * 0.5), 2),
            delay: round(-random() * 12, 2),
            amplitude: round(REACH[motion] * (0.7 + random() * 0.6), 1),
            sway: round(4 + random() * 12, 1),
            beatEvery: round(14 + random() * 26, 1),
            behaviour: Math.floor(random() * 4),
        })
    }

    return spots
}

export interface MeadowBalloonSpot {
    silk: number
    rider: boolean
    x: number
    y: number
    size: number
    depth: number
    duration: number
    delay: number
    amplitude: number
    sway: number
}

/**
 * Balloons are scenery rather than creatures, so they stay on CSS. Colour,
 * size, height and whether anyone is riding all come from the seed, and they
 * are spread across the sky in lanes so two never share a spot.
 */
export function planBalloons(
    count: number,
    seed: number,
    silks: number,
    compact = false,
    /** x of a balloon already in the cast, so an extra never lands on it */
    avoid?: number,
): MeadowBalloonSpot[] {
    const spots: MeadowBalloonSpot[] = []
    const lanes = Math.max(1, count + (avoid === undefined ? 0 : 1))
    const lane = 100 / lanes
    const taken = avoid === undefined ? -1 : Math.min(lanes - 1, Math.floor(avoid / lane))
    let slot = 0

    for (let index = 0; index < count; index += 1) {
        const random = rngFor(seed + 347, index)
        const depth = round(0.2 + random() * 0.7, 2)
        if (slot === taken) slot += 1

        const x = round(lane * slot + 4 + random() * Math.max(2, lane - 8), 1)
        // content sits in the middle of a hero, so a balloon crossing the
        // centre stays high; the ones near the edges may drift lower
        const central = 1 - Math.min(1, Math.abs(x - 50) / 34)

        spots.push({
            silk: silks > 0 ? Math.floor(random() * silks) % silks : 0,
            // roughly a third drift by empty
            rider: random() > 0.34,
            x,
            y: round(4 + random() * (compact ? 26 : 42) * (1 - central * 0.72), 1),
            size: Math.round((compact ? 42 : 58) + depth * (compact ? 30 : 54)),
            depth,
            duration: round(BEAT.bob * (0.9 + random() * 0.8), 2),
            delay: round(-random() * 14, 2),
            amplitude: round(REACH.bob * (0.7 + random() * 0.7), 1),
            sway: round(5 + random() * 14, 1),
        })

        slot += 1
    }

    return spots
}
