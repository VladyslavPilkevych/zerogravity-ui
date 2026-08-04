import type { ParticleConfig, ParticleShape } from "./types"
import { TAU, clamp } from "./math"

export type ShapeEmitter = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    cos: number,
    sin: number,
    pa: number,
    pb: number,
) => void

function quad(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    dx: number,
    dy: number,
    nx: number,
    ny: number,
): void {
    ctx.moveTo(x + dx + nx, y + dy + ny)
    ctx.lineTo(x - dx + nx, y - dy + ny)
    ctx.lineTo(x - dx - nx, y - dy - ny)
    ctx.lineTo(x + dx - nx, y + dy - ny)
    ctx.closePath()
}

let starPoints = -1
let starCos = 0
let starSin = 0

const TRI_A = 0.8660254
const TRI_B = 0.5

export const SHAPE_EMITTERS: Record<ParticleShape, ShapeEmitter> = {
    dot: (ctx, x, y, size) => {
        ctx.moveTo(x + size, y)
        ctx.arc(x, y, size, 0, TAU)
    },

    square: (ctx, x, y, size, cos, sin) => {
        const p = size * cos
        const q = size * sin
        ctx.moveTo(x + p - q, y + q + p)
        ctx.lineTo(x - p - q, y - q + p)
        ctx.lineTo(x - p + q, y - q - p)
        ctx.lineTo(x + p + q, y + q - p)
        ctx.closePath()
    },

    diamond: (ctx, x, y, size, cos, sin) => {
        const p = size * cos
        const q = size * sin
        ctx.moveTo(x + p, y + q)
        ctx.lineTo(x - q, y + p)
        ctx.lineTo(x - p, y - q)
        ctx.lineTo(x + q, y - p)
        ctx.closePath()
    },

    bar: (ctx, x, y, size, cos, sin, pa, pb) => {
        const half = size * pa * 0.5
        const thick = size * pb < 0.35 ? 0.35 : size * pb
        quad(ctx, x, y, cos * half, sin * half, -sin * thick, cos * thick)
    },

    triangle: (ctx, x, y, size, cos, sin) => {
        ctx.moveTo(x + sin * size, y - cos * size)
        ctx.lineTo(x + (-TRI_A * cos - TRI_B * sin) * size, y + (-TRI_A * sin + TRI_B * cos) * size)
        ctx.lineTo(x + (TRI_A * cos - TRI_B * sin) * size, y + (TRI_A * sin + TRI_B * cos) * size)
        ctx.closePath()
    },

    ring: (ctx, x, y, size, _cos, _sin, _pa, pb) => {
        ctx.moveTo(x + size, y)
        ctx.arc(x, y, size, 0, TAU, false)
        const inner = size * (1 - clamp(pb, 0.05, 1))
        if (inner > 0.05) {
            ctx.moveTo(x + inner, y)
            ctx.arc(x, y, inner, 0, TAU, true)
        }
    },

    cross: (ctx, x, y, size, cos, sin, _pa, pb) => {
        const thick = size * pb < 0.35 ? 0.35 : size * pb
        quad(ctx, x, y, cos * size, sin * size, -sin * thick, cos * thick)
        quad(ctx, x, y, -sin * size, cos * size, -cos * thick, -sin * thick)
    },

    star: (ctx, x, y, size, cos, sin, pa, pb) => {
        const points = pa < 2 ? 2 : pa | 0
        if (points !== starPoints) {
            starPoints = points
            starCos = Math.cos(Math.PI / points)
            starSin = Math.sin(Math.PI / points)
        }

        const inner = size * (1 - clamp(pb, 0, 0.95))
        let ux = sin
        let uy = -cos

        ctx.moveTo(x + ux * size, y + uy * size)
        for (let k = 1; k < points * 2; k += 1) {
            const nx = ux * starCos - uy * starSin
            uy = ux * starSin + uy * starCos
            ux = nx
            const r = k & 1 ? inner : size
            ctx.lineTo(x + ux * r, y + uy * r)
        }
        ctx.closePath()
    },
}

export function shapeParams(cfg: ParticleConfig, out: [number, number]): [number, number] {
    switch (cfg.shape) {
        case "bar":
            out[0] = Math.max(0.1, cfg.length)
            out[1] = cfg.thickness
            break
        case "star":
            out[0] = Math.max(2, Math.round(cfg.points))
            out[1] = cfg.depth
            break
        case "ring":
        case "cross":
            out[0] = 0
            out[1] = cfg.thickness
            break
        default:
            out[0] = 0
            out[1] = 0
    }
    return out
}

export function isRotationInvariant(shape: ParticleShape): boolean {
    return shape === "dot" || shape === "ring"
}

export function shapeExtent(cfg: ParticleConfig): number {
    switch (cfg.shape) {
        case "bar":
            return Math.max(1, cfg.length) * 0.5
        case "cross":
        case "star":
        case "triangle":
            return 1
        default:
            return 1.45
    }
}
