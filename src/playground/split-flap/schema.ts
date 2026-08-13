import type { ControlGroup, PanelPreset } from "../panel/types"

export interface SplitFlapDemoConfig {
    value: string
    mode: "text" | "clock" | "countdown"
    length: number
    stepDuration: number
    stagger: number
    gap: number
    charWidth: number
    charHeight: number
    fontSize: number
    color: string
    background: string
    radius: number
}

export const SPLIT_FLAP_DEFAULTS: SplitFlapDemoConfig = {
    value: "DEPARTURES",
    mode: "text",
    length: 10,
    stepDuration: 55,
    stagger: 45,
    gap: 4,
    charWidth: 44,
    charHeight: 64,
    fontSize: 34,
    color: "#f5f5f7",
    background: "#141419",
    radius: 6,
}

const MODES = ["text", "clock", "countdown"] as const

export const SPLIT_FLAP_CONTROLS: ControlGroup[] = [
    {
        id: "content",
        title: "Content",
        hint: "what the board shows",
        open: true,
        controls: [
            { kind: "select", path: "mode", label: "Mode", options: MODES },
            { kind: "number", path: "length", label: "Cells", min: 1, max: 16, step: 1 },
        ],
    },
    {
        id: "motion",
        title: "Motion",
        hint: "flip speed and cascade",
        open: true,
        controls: [
            { kind: "number", path: "stepDuration", label: "Step", min: 20, max: 220, step: 5, unit: "ms" },
            { kind: "number", path: "stagger", label: "Stagger per cell", min: 0, max: 220, step: 5, unit: "ms" },
        ],
    },
    {
        id: "look",
        title: "Look",
        hint: "cell size and colours",
        open: true,
        controls: [
            { kind: "number", path: "charWidth", label: "Cell width", min: 20, max: 110, step: 2, unit: "px" },
            { kind: "number", path: "charHeight", label: "Cell height", min: 30, max: 160, step: 2, unit: "px" },
            { kind: "number", path: "fontSize", label: "Font size", min: 12, max: 90, step: 2, unit: "px" },
            { kind: "number", path: "gap", label: "Gap", min: 0, max: 20, step: 1, unit: "px" },
            { kind: "number", path: "radius", label: "Corner radius", min: 0, max: 20, step: 1, unit: "px" },
            { kind: "color", path: "color", label: "Text colour" },
            { kind: "color", path: "background", label: "Cell colour" },
        ],
    },
]

export const SPLIT_FLAP_PRESETS: PanelPreset[] = [
    { id: "board", label: "Board", hint: "Airport departures" },
    { id: "clock", label: "Clock", hint: "Live wall clock" },
    { id: "countdown", label: "Countdown", hint: "Ticks down to a moment" },
    { id: "ticker", label: "Ticker", hint: "Small dense cells" },
]

export const SPLIT_FLAP_PRESET_VALUES: Record<string, Partial<SplitFlapDemoConfig>> = {
    board: {},
    clock: { mode: "clock", length: 8, charWidth: 52, fontSize: 40, color: "#ffd166" },
    countdown: { mode: "countdown", length: 8, charWidth: 52, fontSize: 40, color: "#7ee8fa" },
    ticker: { charWidth: 26, charHeight: 38, fontSize: 20, gap: 2, radius: 3, length: 14, value: "NOW BOARDING" },
}
