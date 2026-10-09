import type { BitmapEffect } from "@/lib/bitmap"

import type { ControlGroup, PanelPreset } from "../panel/types"

export interface BitmapDemoConfig {
    text: string
    pixelSize: number
    gap: number
    tracking: number
    colors: string[]
    effect: BitmapEffect
    animated: boolean
    speed: number
    dim: number
    paused: boolean
}

export const BITMAP_DEFAULTS: BitmapDemoConfig = {
    text: "ZeroGravity",
    pixelSize: 0,
    gap: 0.1,
    tracking: 1,
    colors: [],
    effect: "sweep",
    animated: true,
    speed: 1,
    dim: 0.6,
    paused: false,
}

const EFFECTS: readonly BitmapEffect[] = ["sweep", "wave", "cycle"]

export const BITMAP_CONTROLS: ControlGroup[] = [
    {
        id: "type",
        title: "Type",
        hint: "the word and the grid it is set on",
        open: true,
        controls: [
            { kind: "text", path: "text", label: "Text", maxLength: 40 },
            {
                kind: "number",
                path: "pixelSize",
                label: "Pixel size (0 fills the width)",
                min: 0,
                max: 24,
                step: 1,
                unit: "px",
            },
            { kind: "number", path: "gap", label: "Gap", min: 0, max: 0.5, step: 0.02 },
            { kind: "number", path: "tracking", label: "Tracking", min: 0, max: 4, step: 1 },
        ],
    },
    {
        id: "light",
        title: "Light",
        hint: "palette and how it moves across the cells",
        open: true,
        controls: [
            { kind: "palette", path: "colors", label: "Palette (empty uses color)" },
            { kind: "select", path: "effect", label: "Effect", options: EFFECTS },
            { kind: "boolean", path: "animated", label: "Animated" },
            { kind: "number", path: "speed", label: "Speed", min: 0.1, max: 4, step: 0.1 },
            { kind: "number", path: "dim", label: "Dim", min: 0, max: 1, step: 0.05 },
            { kind: "boolean", path: "paused", label: "Paused" },
        ],
    },
]

export const BITMAP_PRESETS: PanelPreset[] = [
    { id: "signal", label: "Signal", hint: "The homepage sweep" },
    { id: "spectrum", label: "Spectrum", hint: "A palette cycling along the diagonal" },
    { id: "ember", label: "Ember", hint: "A warm gradient with a slow wave" },
    { id: "plate", label: "Plate", hint: "Static, fixed-size pixels" },
]

export const BITMAP_PRESET_VALUES: Record<string, Partial<BitmapDemoConfig>> = {
    signal: { colors: ["#4ee1f2", "#c6f432"], dim: 0.82, gap: 0.12 },
    spectrum: {
        effect: "cycle",
        colors: ["#4ee1f2", "#8b7bff", "#ff6fb5", "#ffb547", "#c6f432"],
    },
    ember: { effect: "wave", colors: ["#ffd166", "#ff8a4c", "#ff4f6d"], dim: 0.35, speed: 0.8 },
    plate: { text: "PIXEL 8", animated: false, pixelSize: 6, gap: 0.16, colors: ["#e8edf5"] },
}
