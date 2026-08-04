import type { Waveform } from "./types"

export const TAU = Math.PI * 2
export const DEG = Math.PI / 180

const LUT_BITS = 14
const LUT_SIZE = 1 << LUT_BITS
const LUT_MASK = LUT_SIZE - 1
const LUT_SCALE = LUT_SIZE / TAU
const QUARTER = LUT_SIZE >> 2
const SIN_LUT = new Float32Array(LUT_SIZE)

for (let i = 0; i < LUT_SIZE; i += 1) {
    SIN_LUT[i] = Math.sin((i / LUT_SIZE) * TAU)
}

export function fastSin(radians: number): number {
    return SIN_LUT[((radians * LUT_SCALE) | 0) & LUT_MASK]
}

export function fastCos(radians: number): number {
    return SIN_LUT[(((radians * LUT_SCALE) | 0) + QUARTER) & LUT_MASK]
}

export function clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value
}

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
}

export function frac(value: number): number {
    return value - Math.floor(value)
}

export function hash01(seed: number, index: number, salt: number): number {
    let h = (seed ^ Math.imul(index, 0x27d4eb2d) ^ Math.imul(salt + 1, 0x165667b1)) | 0
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d)
    h = Math.imul(h ^ (h >>> 13), 0x297a2d39)
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

export type WaveFn = (phase: number) => number

export const WAVE_FNS: Record<Waveform, WaveFn> = {
    sine: (p) => fastSin(p * TAU),
    triangle: (p) => 1 - 4 * Math.abs(p - 0.5),
    sawtooth: (p) => 2 * p - 1,
    square: (p) => (p < 0.5 ? 1 : -1),
    heartbeat: (p) => {
        if (p < 0.14) return fastSin((p / 0.14) * Math.PI)
        if (p < 0.2) return 0
        if (p < 0.32) return fastSin(((p - 0.2) / 0.12) * Math.PI) * 0.6
        return -0.08
    },
    decay: (p) => {
        const q = 1 - p
        return q * q * 2 - 1
    },
    organic: (p) =>
        fastSin(p * TAU) * 0.55 +
        fastSin(p * TAU * 2.3 + 1.7) * 0.3 +
        fastSin(p * TAU * 4.7 + 3.1) * 0.15,
}

export function waveFn(kind: Waveform): WaveFn {
    return WAVE_FNS[kind] ?? WAVE_FNS.sine
}

export const ENVELOPE_FNS: Record<Waveform, WaveFn> = {
    sine: (p) => fastSin(p * Math.PI),
    triangle: (p) => 1 - Math.abs(2 * p - 1),
    sawtooth: (p) => p,
    square: () => 1,
    heartbeat: (p) => {
        const v = WAVE_FNS.heartbeat(p)
        return v > 0 ? v : 0
    },
    decay: (p) => (1 - p) * (1 - p),
    organic: (p) => {
        const v = WAVE_FNS.organic(p)
        return v > 0 ? v : 0
    },
}

export function envelopeFn(kind: Waveform): WaveFn {
    return ENVELOPE_FNS[kind] ?? ENVELOPE_FNS.sine
}
