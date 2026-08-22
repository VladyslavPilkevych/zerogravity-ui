export interface Bounds {
    left: number
    top: number
    right: number
    bottom: number
}

export function inflate(bounds: Bounds, amount: number): Bounds {
    return {
        left: bounds.left - amount,
        top: bounds.top - amount,
        right: bounds.right + amount,
        bottom: bounds.bottom + amount,
    }
}

function axisEntry(min: number, max: number, otherMin: number, otherMax: number, delta: number) {
    if (delta === 0) {
        return max > otherMin && min < otherMax ? { entry: -Infinity, exit: Infinity } : null
    }

    const toNear = delta > 0 ? otherMin - max : otherMax - min
    const toFar = delta > 0 ? otherMax - min : otherMin - max

    return { entry: toNear / delta, exit: toFar / delta }
}

export function allowedTravel(moving: Bounds, blocker: Bounds, dx: number, dy: number): number {
    if (dx === 0 && dy === 0) return 1

    const x = axisEntry(moving.left, moving.right, blocker.left, blocker.right, dx)
    const y = axisEntry(moving.top, moving.bottom, blocker.top, blocker.bottom, dy)

    if (!x || !y) return 1

    const entry = Math.max(x.entry, y.entry)
    const exit = Math.min(x.exit, y.exit)

    if (entry >= exit || entry === -Infinity) {
        return entry === -Infinity && exit > 0 ? 0 : 1
    }

    if (entry <= 0) return exit <= 0 ? 1 : 0
    if (entry >= 1) return 1

    return entry
}

export function constrainDisplacement(
    rest: Bounds,
    blockers: Bounds[],
    dx: number,
    dy: number,
    minGap: number,
): { x: number; y: number } {
    if (blockers.length === 0 || (dx === 0 && dy === 0)) return { x: dx, y: dy }

    let scale = 1
    for (const blocker of blockers) {
        scale = Math.min(scale, allowedTravel(rest, inflate(blocker, minGap), dx, dy))
        if (scale <= 0) return { x: 0, y: 0 }
    }

    const safe = Math.max(0, scale * 0.94)
    return { x: dx * safe, y: dy * safe }
}
