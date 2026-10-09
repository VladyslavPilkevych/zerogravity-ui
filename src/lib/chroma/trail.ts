/**
 * The pointer history behind Chroma: a fixed ring of samples, oldest to newest,
 * and a centripetal Catmull-Rom pass that turns it into a dense, gap-free curve.
 * Nothing here grows with use or allocates after construction.
 */
export interface Trail {
    readonly capacity: number
    readonly size: number
    /** a new sample; `cut` means it does not join the one before it */
    push(x: number, y: number, born: number, cut?: boolean): void
    /** moves the newest sample instead of adding one */
    nudge(x: number, y: number, born: number): void
    /** the slot of the i-th sample, oldest first */
    slot(i: number): number
    /** drops what has outlived `life`, keeping one faded anchor for the tail */
    prune(now: number, life: number): number
    clear(): void
    readonly xs: Float32Array
    readonly ys: Float32Array
    readonly born: Float64Array
    readonly cuts: Uint8Array
}

export function createTrail(capacity: number): Trail {
    const size = Math.max(2, Math.floor(capacity))
    const xs = new Float32Array(size)
    const ys = new Float32Array(size)
    const born = new Float64Array(size)
    const cuts = new Uint8Array(size)
    let head = 0
    let count = 0

    const slot = (i: number) => (head - count + i + size * 2) % size

    return {
        capacity: size,
        get size() {
            return count
        },
        push(x, y, at, cut = false) {
            xs[head] = x
            ys[head] = y
            born[head] = at
            cuts[head] = cut || count === 0 ? 1 : 0
            head = (head + 1) % size
            count = Math.min(count + 1, size)
            // the oldest survivor has nothing behind it any more
            cuts[slot(0)] = 1
        },
        nudge(x, y, at) {
            if (count === 0) return
            const newest = slot(count - 1)
            xs[newest] = x
            ys[newest] = y
            born[newest] = at
        },
        slot,
        prune(now, life) {
            while (count > 0) {
                const next = count > 1 ? slot(1) : -1
                const anchorGone = now - born[slot(0)] >= life
                const followerGone = next === -1 || cuts[next] === 1 || now - born[next] >= life
                if (!anchorGone || !followerGone) break
                count -= 1
            }
            if (count > 0) cuts[slot(0)] = 1
            return count
        },
        clear() {
            count = 0
        },
        xs,
        ys,
        born,
        cuts,
    }
}

/** How far apart the curve's points may land, at most, in the trail's units. */
export const TRACE_STEP = 3
const MAX_SPLITS = 128

export function traceCapacity(trail: Trail): number {
    return trail.capacity * (MAX_SPLITS + 1) + trail.capacity
}

/**
 * Writes the smoothed trail into `out` as x, y, life triples. A NaN triple
 * separates two strokes. Returns the number of triples written. Life is 1 at
 * birth and 0 at `life` seconds old.
 */
export function traceTrail(
    trail: Trail,
    now: number,
    life: number,
    out: Float32Array,
    step: number = TRACE_STEP,
): number {
    const { xs, ys, born, cuts, size } = trail
    const room = Math.floor(out.length / 3)
    let written = 0

    const emit = (x: number, y: number, l: number) => {
        if (written >= room) return
        out[written * 3] = x
        out[written * 3 + 1] = y
        out[written * 3 + 2] = l
        written += 1
    }

    const lifeOf = (s: number) => {
        const left = 1 - (now - born[s]) / life
        return left < 0 ? 0 : left > 1 ? 1 : left
    }

    let start = 0
    while (start < size) {
        let end = start + 1
        while (end < size && cuts[trail.slot(end)] === 0) end += 1

        if (written > 0) emit(NaN, NaN, NaN)

        const first = trail.slot(start)
        emit(xs[first], ys[first], lifeOf(first))

        for (let i = start; i < end - 1; i += 1) {
            const s0 = trail.slot(i > start ? i - 1 : i)
            const s1 = trail.slot(i)
            const s2 = trail.slot(i + 1)
            const s3 = trail.slot(i + 2 < end ? i + 2 : i + 1)

            const length = Math.hypot(xs[s2] - xs[s1], ys[s2] - ys[s1])
            // the curve runs longer than its chord, so split a little finer
            const splits = Math.min(MAX_SPLITS, Math.max(1, Math.ceil((length * 1.5) / step)))
            const l1 = lifeOf(s1)
            const l2 = lifeOf(s2)

            for (let k = 1; k <= splits; k += 1) {
                const t = k / splits
                emit(
                    centripetal(
                        xs[s0],
                        xs[s1],
                        xs[s2],
                        xs[s3],
                        ys[s0],
                        ys[s1],
                        ys[s2],
                        ys[s3],
                        t,
                        0,
                    ),
                    centripetal(
                        xs[s0],
                        xs[s1],
                        xs[s2],
                        xs[s3],
                        ys[s0],
                        ys[s1],
                        ys[s2],
                        ys[s3],
                        t,
                        1,
                    ),
                    l1 + (l2 - l1) * t,
                )
            }
        }

        start = end
    }

    return written
}

function knot(ax: number, ay: number, bx: number, by: number): number {
    // centripetal parameterisation: never loops or cusps on uneven spacing
    return Math.max(1e-4, Math.sqrt(Math.hypot(bx - ax, by - ay)))
}

function centripetal(
    x0: number,
    x1: number,
    x2: number,
    x3: number,
    y0: number,
    y1: number,
    y2: number,
    y3: number,
    u: number,
    axis: 0 | 1,
): number {
    const t1 = knot(x0, y0, x1, y1)
    const t2 = t1 + knot(x1, y1, x2, y2)
    const t3 = t2 + knot(x2, y2, x3, y3)
    const t = t1 + (t2 - t1) * u

    const p0 = axis === 0 ? x0 : y0
    const p1 = axis === 0 ? x1 : y1
    const p2 = axis === 0 ? x2 : y2
    const p3 = axis === 0 ? x3 : y3

    const a1 = ((t1 - t) / t1) * p0 + (t / t1) * p1
    const a2 = ((t2 - t) / (t2 - t1)) * p1 + ((t - t1) / (t2 - t1)) * p2
    const a3 = ((t3 - t) / (t3 - t2)) * p2 + ((t - t2) / (t3 - t2)) * p3
    const b1 = ((t2 - t) / t2) * a1 + (t / t2) * a2
    const b2 = ((t3 - t) / (t3 - t1)) * a2 + ((t - t1) / (t3 - t1)) * a3
    return ((t2 - t) / (t2 - t1)) * b1 + ((t - t1) / (t2 - t1)) * b2
}
