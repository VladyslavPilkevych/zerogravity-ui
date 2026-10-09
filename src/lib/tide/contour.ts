export type TideEdge = "top" | "bottom" | "left" | "right" | "x" | "y" | "all"

export const TIDE_EDGE_SAMPLES = 160
export const TIDE_MAX_SAMPLES = 4 * TIDE_EDGE_SAMPLES

type Side = "top" | "right" | "bottom" | "left"

const SIDES: Record<Exclude<TideEdge, "all">, readonly Side[]> = {
    top: ["top"],
    bottom: ["bottom"],
    left: ["left"],
    right: ["right"],
    x: ["left", "right"],
    y: ["top", "bottom"],
}

const SIDE_OFFSET: Record<Side, number> = { top: 0, right: 1.7, bottom: 3.1, left: 4.6 }

const WEIGHTS = [0.55, 0.28, 0.17] as const
const RATIOS = [1, 0.57, 1.83] as const
const DRIFTS = [1, -0.73, 1.61] as const
const SEEDS = [0, 1.3, 2.1] as const

/** A sum of three detuned sines whose phases drift apart, normalised to -1..1. */
function swell(u: number, cycles: readonly number[], phase: number, offset: number): number {
    let sum = 0
    for (let index = 0; index < 3; index += 1) {
        sum +=
            WEIGHTS[index] *
            Math.sin(
                u * cycles[index] + phase * DRIFTS[index] + SEEDS[index] + offset * (index + 1),
            )
    }
    return sum
}

function sampleCount(length: number, wavelength: number, cap: number): number {
    const step = Math.min(Math.max(wavelength / 16, 3), 16)
    return Math.min(Math.max(Math.ceil(length / step), 8), cap)
}

const fixed = (value: number) => Number(value.toFixed(1))

function sideContour(
    width: number,
    height: number,
    sides: readonly Side[],
    band: number,
    wavelength: number,
    phase: number,
): string {
    const cycles = RATIOS.map((ratio) => (Math.PI * 2) / (wavelength * ratio))
    const points: string[] = []
    const half = band / 2
    const push = (x: number, y: number) => points.push(`${fixed(x)} ${fixed(y)}`)

    const run = (side: Side, length: number, at: (along: number, depth: number) => void) => {
        if (!sides.includes(side)) return
        const count = sampleCount(length, wavelength, TIDE_EDGE_SAMPLES)
        for (let index = 0; index <= count; index += 1) {
            const along = (index / count) * length
            at(along, half + half * swell(along, cycles, phase, SIDE_OFFSET[side]))
        }
    }

    const corner = (a: Side, b: Side, x: number, y: number) => {
        if (!sides.includes(a) && !sides.includes(b)) push(x, y)
    }

    corner("left", "top", 0, 0)
    run("top", width, (along, depth) => push(along, depth))
    corner("top", "right", width, 0)
    run("right", height, (along, depth) => push(width - depth, along))
    corner("right", "bottom", width, height)
    run("bottom", width, (along, depth) => push(width - along, height - depth))
    corner("bottom", "left", 0, height)
    run("left", height, (along, depth) => push(depth, height - along))

    return `M${points.join(" L")} Z`
}

function perimeterContour(
    width: number,
    height: number,
    band: number,
    wavelength: number,
    phase: number,
): string {
    const half = band / 2
    const innerWidth = width - band
    const innerHeight = height - band
    const radius = Math.min(Math.max(band * 1.25, 4), innerWidth / 2, innerHeight / 2)
    const straightX = innerWidth - radius * 2
    const straightY = innerHeight - radius * 2
    const arc = (Math.PI / 2) * radius
    const perimeter = 2 * straightX + 2 * straightY + 4 * arc

    const cycles = RATIOS.map(
        (ratio) =>
            (Math.PI * 2 * Math.max(1, Math.round(perimeter / (wavelength * ratio)))) / perimeter,
    )
    const count = sampleCount(perimeter, wavelength, TIDE_MAX_SAMPLES)

    const left = half
    const top = half
    const right = width - half
    const bottom = height - half

    const bend = (
        cx: number,
        cy: number,
        start: number,
        t: number,
    ): [number, number, number, number] => {
        const angle = start + (t / arc) * (Math.PI / 2)
        const nx = Math.cos(angle)
        const ny = Math.sin(angle)
        return [cx + nx * radius, cy + ny * radius, nx, ny]
    }

    const at = (s: number): [number, number, number, number] => {
        let t = s
        if (t <= straightX) return [left + radius + t, top, 0, -1]
        t -= straightX
        if (t <= arc) return bend(right - radius, top + radius, -Math.PI / 2, t)
        t -= arc
        if (t <= straightY) return [right, top + radius + t, 1, 0]
        t -= straightY
        if (t <= arc) return bend(right - radius, bottom - radius, 0, t)
        t -= arc
        if (t <= straightX) return [right - radius - t, bottom, 0, 1]
        t -= straightX
        if (t <= arc) return bend(left + radius, bottom - radius, Math.PI / 2, t)
        t -= arc
        if (t <= straightY) return [left, bottom - radius - t, -1, 0]
        t -= straightY
        return bend(left + radius, top + radius, Math.PI, Math.min(t, arc))
    }

    const points: string[] = []
    for (let index = 0; index < count; index += 1) {
        const s = (index / count) * perimeter
        const [x, y, nx, ny] = at(s)
        const lift = half * swell(s, cycles, phase, 0)
        points.push(`${fixed(x + nx * lift)} ${fixed(y + ny * lift)}`)
    }

    return `M${points.join(" L")} Z`
}

/**
 * The closed outline of a `width` by `height` box whose chosen edges ripple
 * inside a band `amplitude` px deep. Pure, so it can be tested and cached.
 */
export function contourPath(
    width: number,
    height: number,
    edge: TideEdge,
    amplitude: number,
    wavelength: number,
    phase: number,
): string {
    const w = Math.max(0, width)
    const h = Math.max(0, height)
    const length = Math.max(8, wavelength)

    if (edge === "all") {
        const band = Math.min(Math.max(0, amplitude), Math.min(w, h) / 3)
        return perimeterContour(w, h, band, length, phase)
    }

    const sides = SIDES[edge] ?? SIDES.top
    const across = sides[0] === "left" || sides[0] === "right" ? w : h
    const band = Math.min(Math.max(0, amplitude), across / (sides.length + 1))
    return sideContour(w, h, sides, band, length, phase)
}
