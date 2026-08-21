export type MeadowMotion = "float" | "bob" | "hover" | "glide" | "flit" | "twinkle"

export type MeadowDensity = "calm" | "cosy" | "lively"

export type MeadowKind = "balloon" | "plane" | "butterfly" | "bird" | "mascot" | "star"

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
