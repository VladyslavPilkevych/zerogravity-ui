export type FormationShape =
    | "ring"
    | "disc"
    | "star"
    | "polygon"
    | "heart"
    | "spiral"
    | "grid"
    | "wave"
    | "lissajous"
    | "blackhole"
    | "planet"
    | "torus"
    | "sunflower"
    | "arms"
    | "rays"
    | "dna"
    | "atom"
    | "tree"

export type ParticleShape =
    | "dot"
    | "square"
    | "diamond"
    | "bar"
    | "triangle"
    | "ring"
    | "cross"
    | "star"

export type Waveform =
    | "sine"
    | "triangle"
    | "sawtooth"
    | "square"
    | "heartbeat"
    | "decay"
    | "organic"

export type PulseMode = "sync" | "scatter" | "radial" | "angular"

export type ColorMode = "random" | "radial" | "angular" | "linear" | "depth"

export type RotationMode = "none" | "radial" | "tangential" | "velocity" | "spin"

export type BlendMode = "normal" | "lighter"

export type RippleOrigin = "center" | "random"

export type PointerSource = "parent" | "window"

export interface FormationConfig {
    shape: FormationShape
    radius: number
    innerRatio: number
    sides: number
    depth: number
    turns: number
    jitter: number
    angle: number
    aspect: number
    spin: number
    tilt: number
}

export interface DeformConfig {
    amount: number
    frequency: number
    layers: number
    speed: number
}

export interface ParticleConfig {
    shape: ParticleShape
    size: number
    sizeVariance: number
    depthScale: number
    length: number
    thickness: number
    points: number
    depth: number
    rotation: RotationMode
    spin: number
    angle: number
}

export interface ColorConfig {
    palette: string[]
    mode: ColorMode
    cycle: number
    opacity: number
    opacityDepth: number
}

export interface PulseConfig {
    enabled: boolean
    waveform: Waveform
    mode: PulseMode
    speed: number
    size: number
    opacity: number
    spread: number
}

export interface WaveConfig {
    enabled: boolean
    waveform: Waveform
    speed: number
    wavelength: number
    displace: number
    opacity: number
    size: number
}

export interface BurstConfig {
    enabled: boolean
    origin: RippleOrigin
    waveform: Waveform
    minInterval: number
    maxInterval: number
    strength: number
    speed: number
    width: number
}

export interface ColorWaveConfig {
    enabled: boolean
    origin: RippleOrigin
    minInterval: number
    maxInterval: number
    duration: number
    speed: number
    width: number
    strength: number
    palette: string[]
    saturation: number
    lightness: number
}

export interface FollowConfig {
    enabled: boolean
    source: PointerSource
    smooth: number
    lag: number
    lagSpread: number
    returnToCenter: boolean
}

export type RepelFalloff = "linear" | "smooth" | "sharp"

export interface RepelConfig {
    enabled: boolean
    radius: number
    strength: number
    falloff: RepelFalloff
    ease: number
}

export interface DriftConfig {
    amount: number
    speed: number
}

export interface GlowConfig {
    enabled: boolean
    radius: number
    color: string
    intensity: number
}

export interface RenderConfig {
    blend: BlendMode
    trail: number
    background: string | null
    fadeIn: number
    dprCap: number
    respectReducedMotion: boolean
}

export interface AntigravityConfig {
    count: number
    seed: number
    paused: boolean
    formation: FormationConfig
    deform: DeformConfig
    particle: ParticleConfig
    color: ColorConfig
    pulse: PulseConfig
    wave: WaveConfig
    burst: BurstConfig
    colorWave: ColorWaveConfig
    follow: FollowConfig
    repel: RepelConfig
    drift: DriftConfig
    glow: GlowConfig
    render: RenderConfig
}

export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends readonly unknown[]
        ? T[K]
        : T[K] extends object | null
          ? T[K] extends null
            ? T[K]
            : DeepPartial<NonNullable<T[K]>> | null
          : T[K]
}

export type AntigravityOptions = DeepPartial<AntigravityConfig>

export interface AntigravityStats {
    fps: number
    drawn: number
    batches: number
    frameMs: number
}

export const ANTIGRAVITY_DEFAULTS: AntigravityConfig = {
    count: 900,
    seed: 1337,
    paused: false,
    formation: {
        shape: "ring",
        radius: 580,
        innerRatio: 0.31,
        sides: 5,
        depth: 0.5,
        turns: 3,
        jitter: 0,
        angle: 0,
        aspect: 1,
        spin: 0,
        tilt: 18,
    },
    deform: {
        amount: 35,
        frequency: 3,
        layers: 4,
        speed: 0.4,
    },
    particle: {
        shape: "dot",
        size: 2.75,
        sizeVariance: 0,
        depthScale: 0.45,
        length: 4,
        thickness: 0.35,
        points: 5,
        depth: 0.5,
        rotation: "none",
        spin: 90,
        angle: 0,
    },
    color: {
        palette: ["#ffffff", "#d2e1ff", "#e6d2ff", "#c8fff5", "#f0f0fa"],
        mode: "random",
        cycle: 0,
        opacity: 0.85,
        opacityDepth: 0.59,
    },
    pulse: {
        enabled: true,
        waveform: "sine",
        mode: "scatter",
        speed: 0.29,
        size: 0.3,
        opacity: 0,
        spread: 1,
    },
    wave: {
        enabled: true,
        waveform: "sine",
        speed: 0.24,
        wavelength: 524,
        displace: 25,
        opacity: 0.15,
        size: 0,
    },
    burst: {
        enabled: false,
        origin: "center",
        waveform: "sine",
        minInterval: 3,
        maxInterval: 8,
        strength: 0.8,
        speed: 700,
        width: 320,
    },
    colorWave: {
        enabled: true,
        origin: "random",
        minInterval: 1,
        maxInterval: 4,
        duration: 8,
        speed: 200,
        width: 1000,
        strength: 1,
        palette: [],
        saturation: 85,
        lightness: 62,
    },
    follow: {
        enabled: true,
        source: "parent",
        smooth: 0.012,
        lag: 0.015,
        lagSpread: 0.025,
        returnToCenter: true,
    },
    repel: {
        enabled: false,
        radius: 220,
        strength: 90,
        falloff: "smooth",
        ease: 0.12,
    },
    drift: {
        amount: 20,
        speed: 1,
    },
    glow: {
        enabled: true,
        radius: 400,
        color: "#c8dcff",
        intensity: 0.08,
    },
    render: {
        blend: "normal",
        trail: 0,
        background: null,
        fadeIn: 2000,
        dprCap: 2,
        respectReducedMotion: true,
    },
}

export function resolveAntigravityConfig(options?: AntigravityOptions): AntigravityConfig {
    if (!options) return ANTIGRAVITY_DEFAULTS

    const out = { ...ANTIGRAVITY_DEFAULTS } as Record<string, unknown>

    for (const key of Object.keys(ANTIGRAVITY_DEFAULTS) as (keyof AntigravityConfig)[]) {
        const patch = (options as Record<string, unknown>)[key]
        if (patch === undefined) continue

        const base = ANTIGRAVITY_DEFAULTS[key]
        if (base !== null && typeof base === "object" && !Array.isArray(base)) {
            out[key] = patch === null ? base : { ...base, ...(patch as object) }
        } else {
            out[key] = patch
        }
    }

    return out as unknown as AntigravityConfig
}
