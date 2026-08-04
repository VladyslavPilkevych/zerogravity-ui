import { clamp } from "./math"

export type Rgb = [number, number, number]

const HEX3 = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i
const HEX6 = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})(?:[0-9a-f]{2})?$/i
const FUNC = /^(rgba?|hsla?)\(([^)]+)\)$/i
const TRIPLET = /^\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*$/

const WHITE: Rgb = [255, 255, 255]

export function hslToRgb(h: number, s: number, l: number): Rgb {
    const sn = clamp(s, 0, 100) / 100
    const ln = clamp(l, 0, 100) / 100
    const k = (n: number) => (n + h / 30) % 12
    const a = sn * Math.min(ln, 1 - ln)
    const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
    return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))]
}

export function parseColor(input: string): Rgb {
    const value = input.trim()

    const hex6 = HEX6.exec(value)
    if (hex6) {
        return [parseInt(hex6[1], 16), parseInt(hex6[2], 16), parseInt(hex6[3], 16)]
    }

    const hex3 = HEX3.exec(value)
    if (hex3) {
        return [
            parseInt(hex3[1] + hex3[1], 16),
            parseInt(hex3[2] + hex3[2], 16),
            parseInt(hex3[3] + hex3[3], 16),
        ]
    }

    const fn = FUNC.exec(value)
    if (fn) {
        const parts = fn[2].split(/[,/\s]+/).filter(Boolean)
        const n = (raw: string | undefined) => parseFloat(raw ?? "0") || 0
        if (fn[1].toLowerCase().startsWith("hsl")) {
            return hslToRgb(n(parts[0]), n(parts[1]), n(parts[2]))
        }
        return [
            clamp(Math.round(n(parts[0])), 0, 255),
            clamp(Math.round(n(parts[1])), 0, 255),
            clamp(Math.round(n(parts[2])), 0, 255),
        ]
    }

    const triplet = TRIPLET.exec(value)
    if (triplet) {
        return [
            clamp(Math.round(parseFloat(triplet[1])), 0, 255),
            clamp(Math.round(parseFloat(triplet[2])), 0, 255),
            clamp(Math.round(parseFloat(triplet[3])), 0, 255),
        ]
    }

    return WHITE
}

export const RAMP_SIZE = 256

export function buildRamp(palette: string[], out?: Uint8Array): Uint8Array {
    const ramp = out ?? new Uint8Array(RAMP_SIZE * 3)
    const colors = (palette.length > 0 ? palette : ["#ffffff"]).map(parseColor)
    const n = colors.length

    if (n === 1) {
        const [r, g, b] = colors[0]
        for (let i = 0; i < RAMP_SIZE; i += 1) {
            ramp[i * 3] = r
            ramp[i * 3 + 1] = g
            ramp[i * 3 + 2] = b
        }
        return ramp
    }

    for (let i = 0; i < RAMP_SIZE; i += 1) {
        const pos = (i / RAMP_SIZE) * n
        const seg = Math.floor(pos)
        const t = pos - seg
        const a = colors[seg % n]
        const b = colors[(seg + 1) % n]
        ramp[i * 3] = a[0] + (b[0] - a[0]) * t
        ramp[i * 3 + 1] = a[1] + (b[1] - a[1]) * t
        ramp[i * 3 + 2] = a[2] + (b[2] - a[2]) * t
    }

    return ramp
}

export function rampStop(index: number, paletteLength: number): number {
    if (paletteLength <= 1) return 0
    return (index % paletteLength) * (RAMP_SIZE / paletteLength)
}

export function rgbaString(r: number, g: number, b: number, alpha: string): string {
    return `rgba(${r},${g},${b},${alpha})`
}
