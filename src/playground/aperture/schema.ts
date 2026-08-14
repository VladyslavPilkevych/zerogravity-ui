import type { ControlGroup, PanelPreset } from "../panel/types"

export interface ApertureDemoConfig {
    height: string
    inset: number
    radius: number
    direction: "close" | "open" | "both"
    scale: number
    dim: number
    dimColor: string
    easing: "linear" | "smooth"
    disabled: boolean
}

export const APERTURE_DEFAULTS: ApertureDemoConfig = {
    height: "160vh",
    inset: 12,
    radius: 28,
    direction: "close",
    scale: 0.06,
    dim: 0,
    dimColor: "#05050a",
    easing: "smooth",
    disabled: false,
}

const DIRECTIONS = ["close", "open", "both"] as const

export const APERTURE_CONTROLS: ControlGroup[] = [
    {
        id: "frame",
        title: "Frame",
        hint: "how far the edges come in",
        open: true,
        controls: [
            {
                kind: "cssLength",
                path: "height",
                label: "Scroll length",
                min: 100,
                max: 320,
                step: 10,
                unit: "vh",
            },
            {
                kind: "number",
                path: "inset",
                label: "Inset",
                min: 0,
                max: 40,
                step: 0.5,
                unit: "%",
            },
            {
                kind: "number",
                path: "radius",
                label: "Corner radius",
                min: 0,
                max: 80,
                step: 2,
                unit: "px",
            },
            { kind: "select", path: "direction", label: "Direction", options: DIRECTIONS },
        ],
    },
    {
        id: "motion",
        title: "Motion",
        hint: "content and shading",
        open: true,
        controls: [
            {
                kind: "number",
                path: "scale",
                label: "Content pull-back",
                min: 0,
                max: 0.3,
                step: 0.01,
            },
            { kind: "number", path: "dim", label: "Dim overlay", min: 0, max: 1, step: 0.01 },
            { kind: "color", path: "dimColor", label: "Dim colour" },
            { kind: "select", path: "easing", label: "Easing", options: ["smooth", "linear"] },
            { kind: "boolean", path: "disabled", label: "Disable motion" },
        ],
    },
]

export const APERTURE_PRESETS: PanelPreset[] = [
    { id: "close", label: "Close in", hint: "Full bleed shrinks into a card" },
    { id: "open", label: "Open up", hint: "Card grows to full bleed" },
    { id: "both", label: "Breathe", hint: "Closes then opens again" },
    { id: "cinema", label: "Cinema", hint: "Deep inset with dimming" },
]

export const APERTURE_PRESET_VALUES: Record<string, Partial<ApertureDemoConfig>> = {
    close: {},
    open: { direction: "open" },
    both: { direction: "both", inset: 16, radius: 40 },
    cinema: { inset: 26, radius: 44, scale: 0.14, dim: 0.45, height: "220vh" },
}
