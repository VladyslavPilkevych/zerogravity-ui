import type { FormationConfig, FormationShape } from "./types"
import { TAU, DEG, clamp, hash01, lerp } from "./math"

export interface Point {
    x: number
    y: number
    z: number
}

export const SALT = {
    radial: 0,
    angular: 1,
    depth: 2,
    size: 3,
    phase: 4,
    driftX: 5,
    driftY: 6,
    driftSpeed: 7,
    color: 8,
    jitterX: 9,
    jitterY: 10,
    spinDir: 11,
    tube: 12,
} as const

const HEART_SCALE = 1 / 17
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

export function isVolumetric(shape: FormationShape): boolean {
    return shape === "planet" || shape === "torus"
}

export function formationPoint(
    index: number,
    count: number,
    seed: number,
    cfg: FormationConfig,
    out: Point,
): void {
    const u = hash01(seed, index, SALT.radial)
    const v = hash01(seed, index, SALT.angular)
    const radius = cfg.radius
    const inner = clamp(cfg.innerRatio, 0, 0.98)

    let x = 0
    let y = 0
    let z = 0

    switch (cfg.shape) {
        case "disc": {
            const theta = v * TAU
            const r = radius * Math.sqrt(u)
            x = Math.cos(theta) * r
            y = Math.sin(theta) * r
            break
        }

        case "star": {
            const points = Math.max(2, Math.round(cfg.sides))
            const theta = v * TAU
            const spike = 1 - clamp(cfg.depth, 0, 0.95) * (0.5 - 0.5 * Math.cos(points * theta))
            const outer = radius * spike
            const r = lerp(outer * inner, outer, Math.sqrt(u))
            x = Math.cos(theta) * r
            y = Math.sin(theta) * r
            break
        }

        case "polygon": {
            const sides = Math.max(3, Math.round(cfg.sides))
            const theta = v * TAU
            const segment = TAU / sides
            const half = segment * 0.5
            const outer = (radius * Math.cos(half)) / Math.cos(((theta % segment) - half) || 0)
            const r = lerp(outer * inner, outer, Math.sqrt(u))
            x = Math.cos(theta) * r
            y = Math.sin(theta) * r
            break
        }

        case "heart": {
            const t = v * TAU
            const sin = Math.sin(t)
            const hx = 16 * sin * sin * sin
            const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
            const fill = lerp(inner, 1, Math.sqrt(u)) * radius * HEART_SCALE
            x = hx * fill
            y = -hy * fill
            break
        }

        case "spiral": {
            const turns = Math.max(0.25, cfg.turns)
            const theta = u * turns * TAU
            const r = radius * lerp(inner, 1, u) + (v - 0.5) * radius * 0.04
            x = Math.cos(theta) * r
            y = Math.sin(theta) * r
            break
        }

        case "grid": {
            const cols = Math.max(1, Math.round(Math.sqrt(count)))
            const rows = Math.max(1, Math.ceil(count / cols))
            const col = index % cols
            const row = Math.floor(index / cols)
            x = (cols > 1 ? col / (cols - 1) - 0.5 : 0) * 2 * radius
            y = (rows > 1 ? row / (rows - 1) - 0.5 : 0) * 2 * radius
            break
        }

        case "wave": {
            const lobes = Math.max(0.5, cfg.sides)
            const s = count > 1 ? index / (count - 1) : 0.5
            x = (s - 0.5) * 2 * radius
            y = Math.sin(s * TAU * lobes) * radius * 0.35 + (v - 0.5) * radius * inner * 0.5
            break
        }

        case "lissajous": {
            const lobes = Math.max(1, Math.round(cfg.sides))
            const t = (count > 1 ? index / count : 0) * TAU
            const fill = lerp(inner, 1, Math.sqrt(u))
            x = Math.sin(lobes * t) * radius * fill
            y = Math.sin((lobes + 1) * t + Math.PI / 2) * radius * fill
            break
        }

        case "blackhole": {
            const theta = v * TAU
            const bias = Math.pow(u, 2.6)
            const r = lerp(radius * Math.max(inner, 0.08), radius, bias)
            x = Math.cos(theta) * r
            y = Math.sin(theta) * r
            break
        }

        case "sunflower": {
            const t = count > 1 ? (index + 0.5) / count : 0.5
            const r = radius * Math.sqrt(lerp(inner * inner, 1, t))
            const theta = index * GOLDEN_ANGLE
            x = Math.cos(theta) * r
            y = Math.sin(theta) * r
            break
        }

        case "arms": {
            const arms = Math.max(1, Math.round(cfg.sides))
            const turns = Math.max(0.25, cfg.turns)
            const t = Math.pow(u, 0.7)
            const spread = (v - 0.5) * 0.9 * (1.05 - t)
            const theta = (index % arms) * (TAU / arms) + t * turns * TAU + spread
            const r = radius * lerp(inner, 1, t)
            x = Math.cos(theta) * r
            y = Math.sin(theta) * r
            break
        }

        case "rays": {
            const spokes = Math.max(2, Math.round(cfg.sides))
            const t = u
            const theta = (index % spokes) * (TAU / spokes) + (v - 0.5) * 0.14 * (0.3 + t)
            const r = lerp(radius * inner, radius, t)
            x = Math.cos(theta) * r
            y = Math.sin(theta) * r
            break
        }

        case "planet": {
            const t = count > 1 ? (index + 0.5) / count : 0.5
            const py = 1 - 2 * t
            const ring = Math.sqrt(Math.max(0, 1 - py * py))
            const phi = index * GOLDEN_ANGLE
            x = Math.cos(phi) * ring * radius
            y = py * radius
            z = Math.sin(phi) * ring * radius
            break
        }

        case "torus": {
            const tube = radius * clamp(inner, 0.02, 0.6)
            const main = radius - tube
            const around = v * TAU
            const through = hash01(seed, index, SALT.tube) * TAU
            const fill = Math.sqrt(u)
            const sweep = main + tube * Math.cos(through) * fill
            x = Math.cos(around) * sweep
            y = tube * Math.sin(through) * fill
            z = Math.sin(around) * sweep
            break
        }

        case "ring":
        default: {
            const theta = v * TAU
            const r = lerp(radius * inner, radius, Math.sqrt(u))
            x = Math.cos(theta) * r
            y = Math.sin(theta) * r
            break
        }
    }

    if (cfg.jitter > 0) {
        const spread = cfg.jitter * radius * 0.3
        x += (hash01(seed, index, SALT.jitterX) - 0.5) * spread
        y += (hash01(seed, index, SALT.jitterY) - 0.5) * spread
    }

    x *= cfg.aspect

    if (cfg.angle !== 0) {
        const a = cfg.angle * DEG
        const cos = Math.cos(a)
        const sin = Math.sin(a)
        const rx = x * cos - y * sin
        y = x * sin + y * cos
        x = rx
    }

    out.x = x
    out.y = y
    out.z = z
}
