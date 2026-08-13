import { POINTER_FX_PRESET_IDS } from "@/lib/pointer-fx"

import type { ControlGroup, PanelPreset } from "../panel/types"

export interface GridTrailDemoConfig {
    preset: string
    color: string | null
    cellSize: number
    gap: number
    cornerRadius: number
    shape: "square" | "circle"
    peakOpacity: number
    fadeDuration: number
    maxCells: number
    neighborFalloff: number
    showGrid: boolean
    gridColor: string | null
    gridOpacity: number
    blendMode: GlobalCompositeOperation
    scoped: boolean
}

export const GRID_TRAIL_DEMO_DEFAULTS: GridTrailDemoConfig = {
    preset: "amber",
    color: null,
    cellSize: 56,
    gap: 2,
    cornerRadius: 0,
    shape: "square",
    peakOpacity: 0.5,
    fadeDuration: 450,
    maxCells: 90,
    neighborFalloff: 0,
    showGrid: false,
    gridColor: null,
    gridOpacity: 0.06,
    blendMode: "source-over",
    scoped: false,
}

const SHAPES = ["square", "circle"] as const
const BLEND_MODES = ["source-over", "lighter", "screen", "overlay"] as const

export const GRID_TRAIL_CONTROLS: ControlGroup[] = [
    {
        id: "look",
        title: "Cells",
        hint: "size, shape and fade",
        open: true,
        controls: [
            { kind: "select", path: "preset", label: "Preset palette", options: POINTER_FX_PRESET_IDS },
            { kind: "colorNullable", path: "color", label: "Override colour" },
            { kind: "number", path: "cellSize", label: "Cell size", min: 16, max: 160, step: 2, unit: "px" },
            { kind: "number", path: "gap", label: "Gap", min: 0, max: 24, step: 1, unit: "px" },
            { kind: "number", path: "cornerRadius", label: "Corner radius", min: 0, max: 40, step: 1, unit: "px" },
            { kind: "select", path: "shape", label: "Shape", options: SHAPES },
            { kind: "number", path: "peakOpacity", label: "Peak opacity", min: 0.05, max: 1, step: 0.05 },
            { kind: "number", path: "fadeDuration", label: "Fade duration", min: 80, max: 2500, step: 20, unit: "ms" },
            { kind: "number", path: "maxCells", label: "Max cells", min: 5, max: 400, step: 5 },
            { kind: "number", path: "neighborFalloff", label: "Neighbour falloff", min: 0, max: 1, step: 0.05 },
        ],
    },
    {
        id: "grid",
        title: "Static grid",
        hint: "lines drawn on the same canvas",
        open: true,
        controls: [
            { kind: "boolean", path: "showGrid", label: "Show grid lines" },
            { kind: "colorNullable", path: "gridColor", label: "Override grid colour" },
            { kind: "number", path: "gridOpacity", label: "Grid opacity", min: 0, max: 0.4, step: 0.01 },
            { kind: "select", path: "blendMode", label: "Blend mode", options: BLEND_MODES },
            { kind: "boolean", path: "scoped", label: "Scope to a container (demo only)" },
        ],
    },
]

export const GRID_TRAIL_PRESETS: PanelPreset[] = POINTER_FX_PRESET_IDS.map((id) => ({
    id,
    label: id[0].toUpperCase() + id.slice(1),
    hint: `${id} palette`,
}))

export const GRID_TRAIL_PRESET_VALUES: Record<string, Partial<GridTrailDemoConfig>> = {
    amber: { preset: "amber" },
    cyan: { preset: "cyan", shape: "circle", cornerRadius: 0, fadeDuration: 700 },
    violet: { preset: "violet", cornerRadius: 12, gap: 4, neighborFalloff: 0.3 },
    emerald: { preset: "emerald", showGrid: true, cellSize: 44, peakOpacity: 0.4 },
    rose: { preset: "rose", blendMode: "lighter", fadeDuration: 900, maxCells: 140 },
    mono: { preset: "mono", peakOpacity: 0.28, showGrid: true, gridOpacity: 0.04 },
}
