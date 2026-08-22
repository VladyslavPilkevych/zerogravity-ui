import type { AntigravityOptions } from "@/lib/antigravity"

function pick<T>(items: readonly T[]): T {
    return items[Math.floor(Math.random() * items.length)]
}

function between(min: number, max: number): number {
    return min + Math.random() * (max - min)
}

function hex(hue: number, saturation: number, lightness: number): string {
    return `hsl(${((hue % 360) + 360) % 360} ${saturation}% ${lightness}%)`
}

export function randomAntigravityOptions(): AntigravityOptions {
    const hue = Math.random() * 360
    const spread = between(20, 90)
    const palette = Array.from({ length: 2 + Math.floor(Math.random() * 4) }, (_, i) =>
        hex(hue + i * spread, between(45, 95), between(55, 88)),
    )

    return {
        count: Math.round(between(400, 3200)),
        seed: Math.round(between(1, 9999)),
        formation: {
            shape: pick([
                "ring",
                "disc",
                "star",
                "polygon",
                "heart",
                "spiral",
                "grid",
                "lissajous",
                "blackhole",
                "planet",
                "torus",
                "sunflower",
                "arms",
                "rays",
                "dna",
                "atom",
                "tree",
            ] as const),
            radius: between(320, 640),
            innerRatio: between(0, 0.8),
            sides: Math.round(between(3, 9)),
            depth: between(0.2, 0.9),
            turns: between(1, 5),
            jitter: between(0, 0.3),
            aspect: between(0.8, 1.3),
            spin: between(-14, 14),
            tilt: between(-60, 60),
        },
        deform: {
            amount: between(0, 60),
            frequency: between(1, 7),
            layers: Math.round(between(1, 4)),
            speed: between(0.1, 0.9),
        },
        particle: {
            shape: pick([
                "dot",
                "square",
                "diamond",
                "bar",
                "triangle",
                "ring",
                "cross",
                "star",
            ] as const),
            size: between(1.4, 4.5),
            sizeVariance: between(0, 0.8),
            length: between(2, 8),
            thickness: between(0.2, 0.7),
            points: Math.round(between(3, 7)),
            rotation: pick(["none", "radial", "tangential", "velocity", "spin"] as const),
            spin: between(-180, 180),
        },
        color: {
            palette,
            mode: pick(["random", "radial", "angular", "linear", "depth"] as const),
            cycle: Math.random() < 0.5 ? 0 : between(0.01, 0.2),
            opacity: between(0.6, 0.95),
        },
        pulse: {
            enabled: true,
            waveform: pick([
                "sine",
                "triangle",
                "sawtooth",
                "square",
                "heartbeat",
                "decay",
                "organic",
            ] as const),
            mode: pick(["sync", "scatter", "radial", "angular"] as const),
            speed: between(0.1, 1.2),
            size: between(0.1, 0.8),
            opacity: between(0, 0.5),
            spread: between(0.3, 3),
        },
        wave: {
            enabled: Math.random() < 0.75,
            waveform: pick(["sine", "triangle", "organic"] as const),
            speed: between(0.1, 0.6),
            wavelength: between(200, 1000),
            displace: between(0, 50),
            opacity: between(0, 0.3),
        },
        burst: {
            enabled: Math.random() < 0.5,
            origin: pick(["center", "random"] as const),
            waveform: pick(["sine", "decay", "heartbeat"] as const),
            strength: between(0.4, 1.4),
            speed: between(400, 1400),
            width: between(150, 500),
        },
        colorWave: { enabled: Math.random() < 0.7 },
        repel: {
            enabled: Math.random() < 0.35,
            radius: between(120, 420),
            strength: between(40, 220),
            falloff: pick(["linear", "smooth", "sharp"] as const),
            ease: between(0.06, 0.3),
        },
        glow: {
            color: hex(hue + 30, 70, 70),
            intensity: between(0.04, 0.16),
            radius: between(280, 560),
        },
        render: {
            blend: Math.random() < 0.4 ? "lighter" : "normal",
            trail: Math.random() < 0.35 ? between(0.1, 0.6) : 0,
        },
    }
}
