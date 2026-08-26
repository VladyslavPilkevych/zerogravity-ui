/**
 * One deterministic generator for the whole library. Seeded placement has to
 * agree between the server, the client, a test and a screenshot, so nothing
 * visual is ever allowed to reach for `Math.random`.
 */
export function rngFor(seed: number, index = 0): () => number {
    return rngFrom((Math.imul(seed | 0, 0x9e3779b1) + Math.imul(index + 1, 0xc2b2ae35)) >>> 0)
}

/** The same stream, started from a raw state rather than a seed and a slot. */
export function rngFrom(state: number): () => number {
    let value = state >>> 0

    return () => {
        value = (value + 0x6d2b79f5) >>> 0
        let t = Math.imul(value ^ (value >>> 15), 1 | value)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/** A stable number in a range, for one slot of a seeded layout. */
export function pick(random: () => number, low: number, high: number): number {
    return low + random() * (high - low)
}
