import type { PointerFxPreset } from "../pointer-fx"

export type GridTrailShape = "square" | "circle"

export interface GridTrailConfig {
    color: string
    cellSize: number
    gap: number
    cornerRadius: number
    shape: GridTrailShape
    peakOpacity: number
    fadeDuration: number
    maxCells: number
    neighborFalloff: number
    showGrid: boolean
    gridColor: string
    gridOpacity: number
    blendMode: GlobalCompositeOperation
}

export interface GridTrailOptions {
    preset?: PointerFxPreset
    color?: string
    cellSize?: number
    gap?: number
    cornerRadius?: number
    shape?: GridTrailShape
    peakOpacity?: number
    fadeDuration?: number
    maxCells?: number
    neighborFalloff?: number
    showGrid?: boolean
    gridColor?: string
    gridOpacity?: number
    blendMode?: GlobalCompositeOperation
}

export const GRID_TRAIL_DEFAULTS: GridTrailConfig = {
    color: "#f5ae20",
    cellSize: 56,
    gap: 2,
    cornerRadius: 0,
    shape: "square",
    peakOpacity: 0.5,
    fadeDuration: 450,
    maxCells: 90,
    neighborFalloff: 0,
    showGrid: false,
    gridColor: "#f5ae20",
    gridOpacity: 0.06,
    blendMode: "source-over",
}
