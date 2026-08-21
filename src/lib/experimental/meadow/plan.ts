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

function rngFor(seed: number, index: number): () => number {
    let a = (Math.imul(seed | 0, 0x9e3779b1) + Math.imul(index + 1, 0xc2b2ae35)) >>> 0

    return () => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
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
