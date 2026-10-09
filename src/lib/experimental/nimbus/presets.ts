import { clamp, finite } from "../../internal"

export type NimbusPreset = "calm" | "drift" | "cinematic" | "pixel"

/** One colour mood. Several of them crossfade slowly into each other. */
export interface NimbusScene {
    /** the fog banks, picked from in turn */
    fog: readonly string[]
    /** the sky behind them, top to bottom */
    sky?: readonly [string, string]
    /** dust, light sweeps and rays */
    light?: string
}

export interface ResolvedScene {
    fog: readonly string[]
    sky: readonly [string, string]
    light: string
}

/** The knobs a preset fills in and a prop can override. All 0 to 1 except speed. */
export interface NimbusTuning {
    /** how far the camera pans, zooms and the layers drift */
    motion: number
    /** how much the layers answer a fine pointer, by depth */
    parallax: number
    /** how many dust motes float in front */
    density: number
    /** soft light sweeps and rays */
    lighting: number
    /** film grain over everything */
    grain: number
    /** a dark wash under the content, for contrast */
    scrim: number
    /** how strongly the fog reads */
    intensity: number
    /** tempo, 0.1 to 3 */
    speed: number
}

interface PresetLook extends NimbusTuning {
    scenes: readonly ResolvedScene[]
    /** seconds a scene holds, then seconds it takes to fade into the next */
    hold: number
    fade: number
    /** the motion is slow, so this many paints a second is enough */
    fps: number
    /** CSS pixels per buffer pixel */
    cell: number
    /** colour levels per channel for an ordered dither, 0 for none */
    dither: number
    vignette: number
    /** darker bands top and bottom, like a wide frame */
    letterbox: number
}

export interface NimbusConfig extends PresetLook {
    preset: NimbusPreset
}

export const NIMBUS_COLORS: readonly string[] = ["#3b1d6e", "#0e4f6b", "#7a1f5c", "#123a7a"]

const NIGHT: readonly [string, string] = ["#0a0b1c", "#04050b"]

export const NIMBUS_PRESETS: Readonly<Record<NimbusPreset, PresetLook>> = {
    calm: {
        scenes: [{ fog: NIMBUS_COLORS, sky: NIGHT, light: "#b9a8ff" }],
        motion: 0.35,
        parallax: 0.25,
        density: 0.12,
        lighting: 0,
        grain: 0,
        scrim: 0,
        intensity: 0.75,
        speed: 1,
        hold: 0,
        fade: 0,
        fps: 30,
        cell: 4,
        dither: 0,
        vignette: 0.35,
        letterbox: 0,
    },
    drift: {
        scenes: [
            { fog: NIMBUS_COLORS, sky: NIGHT, light: "#b9a8ff" },
            {
                fog: ["#04404f", "#0a6a62", "#123a7a", "#0e6f5f"],
                sky: ["#04121a", "#02070b"],
                light: "#8ef0e0",
            },
            {
                fog: ["#5a1f6e", "#2a2a7a", "#7a2f4c", "#3a1a5a"],
                sky: ["#120a1e", "#06040c"],
                light: "#ffb4d8",
            },
        ],
        motion: 0.6,
        parallax: 0.45,
        density: 0.3,
        lighting: 0.3,
        grain: 0.05,
        scrim: 0,
        intensity: 0.8,
        speed: 1,
        hold: 14,
        fade: 7,
        fps: 30,
        cell: 4,
        dither: 0,
        vignette: 0.45,
        letterbox: 0,
    },
    cinematic: {
        scenes: [
            {
                fog: ["#9a3a12", "#2a1440", "#c8701e", "#14404e"],
                sky: ["#100a1c", "#2a1206"],
                light: "#ffc684",
            },
            {
                fog: ["#0e3f6b", "#5a1a6e", "#0a5a5a", "#2a1a5a"],
                sky: ["#060a1c", "#0a0614"],
                light: "#6fdcff",
            },
            {
                fog: ["#6a3a5a", "#c0705a", "#2a4a6a", "#5a4a7a"],
                sky: ["#141a2e", "#2a1622"],
                light: "#ffdcb4",
            },
        ],
        motion: 0.85,
        parallax: 0.6,
        density: 0.35,
        lighting: 0.85,
        grain: 0.1,
        scrim: 0.15,
        intensity: 0.85,
        speed: 1,
        hold: 12,
        fade: 6,
        fps: 30,
        cell: 4,
        dither: 0,
        vignette: 0.7,
        letterbox: 0.6,
    },
    pixel: {
        scenes: [
            {
                fog: ["#4b2590", "#9a2470", "#106a8a", "#2a36a0"],
                sky: ["#0c0824", "#05040e"],
                light: "#4ee1f2",
            },
            {
                fog: ["#0e6a4b", "#4a7a10", "#0e4f7a", "#1a5a3a"],
                sky: ["#04140e", "#020806"],
                light: "#c6f24e",
            },
        ],
        motion: 0.5,
        parallax: 0.35,
        density: 0.3,
        lighting: 0.5,
        grain: 0,
        scrim: 0,
        intensity: 0.85,
        speed: 1,
        hold: 14,
        fade: 5,
        fps: 12,
        cell: 8,
        dither: 7,
        vignette: 0.5,
        letterbox: 0,
    },
}

export const NIMBUS_PRESET_NAMES = Object.keys(NIMBUS_PRESETS) as NimbusPreset[]

export interface NimbusInput extends Partial<NimbusTuning> {
    preset?: NimbusPreset
    colors?: readonly string[]
    scenes?: readonly NimbusScene[]
    accent?: string
}

const UNIT: ReadonlyArray<keyof NimbusTuning> = [
    "motion",
    "parallax",
    "density",
    "lighting",
    "grain",
    "scrim",
    "intensity",
]

/**
 * The preset fills in everything, then each prop that was actually given wins,
 * clamped to its range. A non-finite number falls back to the preset's value.
 */
export function resolveNimbus(input: NimbusInput = {}): NimbusConfig {
    const preset: NimbusPreset =
        input.preset && input.preset in NIMBUS_PRESETS ? input.preset : "calm"
    const look = NIMBUS_PRESETS[preset]
    const config: NimbusConfig = { ...look, preset }

    for (const key of UNIT) config[key] = clamp(finite(input[key], look[key]), 0, 1)
    config.speed = clamp(finite(input.speed, look.speed), 0.1, 3)

    const base = look.scenes[0]
    let scenes: readonly ResolvedScene[] = look.scenes

    if (input.scenes && input.scenes.length > 0) {
        const given = input.scenes.filter((scene) => scene.fog && scene.fog.length > 0)
        if (given.length > 0) {
            scenes = given.map((scene) => ({
                fog: scene.fog,
                sky: scene.sky ?? base.sky,
                light: scene.light ?? base.light,
            }))
        }
    } else if (input.colors && input.colors.length > 0) {
        scenes = [{ ...base, fog: input.colors }]
    }

    if (input.accent) scenes = scenes.map((scene) => ({ ...scene, light: input.accent as string }))

    config.scenes = scenes
    return config
}

/** A stable key for everything the renderer prebuilds from the scenes. */
export function sceneKey(scenes: readonly ResolvedScene[]): string {
    return scenes
        .map((scene) => `${scene.sky.join(",")}|${scene.light}|${scene.fog.join(",")}`)
        .join(";")
}
