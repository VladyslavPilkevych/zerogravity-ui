"use client"

import { useEffect, useRef, type RefObject } from "react"

import { pointerFxTokens, usePointerFxEnabled } from "../pointer-fx"
import { GridTrailEngine } from "./engine"
import { GRID_TRAIL_DEFAULTS, type GridTrailConfig, type GridTrailOptions } from "./types"
import "./GridTrail.css"

export interface GridTrailProps extends GridTrailOptions {
    container?: RefObject<HTMLElement | null>
    zIndex?: number
    className?: string
    disabled?: boolean
    enableOnTouch?: boolean
    respectReducedMotion?: boolean
}

function resolveConfig(props: GridTrailProps): GridTrailConfig {
    const tokens = pointerFxTokens(props.preset)

    return {
        color: props.color ?? tokens.accent,
        cellSize: props.cellSize ?? GRID_TRAIL_DEFAULTS.cellSize,
        gap: props.gap ?? GRID_TRAIL_DEFAULTS.gap,
        cornerRadius: props.cornerRadius ?? GRID_TRAIL_DEFAULTS.cornerRadius,
        shape: props.shape ?? GRID_TRAIL_DEFAULTS.shape,
        peakOpacity: props.peakOpacity ?? GRID_TRAIL_DEFAULTS.peakOpacity,
        fadeDuration: props.fadeDuration ?? GRID_TRAIL_DEFAULTS.fadeDuration,
        maxCells: props.maxCells ?? GRID_TRAIL_DEFAULTS.maxCells,
        neighborFalloff: props.neighborFalloff ?? GRID_TRAIL_DEFAULTS.neighborFalloff,
        showGrid: props.showGrid ?? GRID_TRAIL_DEFAULTS.showGrid,
        gridColor: props.gridColor ?? tokens.grid,
        gridOpacity: props.gridOpacity ?? GRID_TRAIL_DEFAULTS.gridOpacity,
        blendMode: props.blendMode ?? GRID_TRAIL_DEFAULTS.blendMode,
    }
}

export function GridTrail(props: GridTrailProps) {
    const { container, zIndex = -10, className, disabled, enableOnTouch, respectReducedMotion } = props

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const engineRef = useRef<GridTrailEngine | null>(null)

    const enabled = usePointerFxEnabled({ disabled, enableOnTouch, respectReducedMotion })
    const config = resolveConfig(props)
    const configRef = useRef(config)
    configRef.current = config

    useEffect(() => {
        if (!enabled) return

        const canvas = canvasRef.current
        if (!canvas) return

        const host = container?.current ?? null
        const engine = new GridTrailEngine(canvas, host, configRef.current)
        engineRef.current = engine

        return () => {
            engine.destroy()
            engineRef.current = null
        }
    }, [enabled, container])

    useEffect(() => {
        engineRef.current?.setConfig(config)
    })

    if (!enabled) return null

    const scoped = Boolean(container)

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className={className ? `grid-trail ${className}` : "grid-trail"}
            data-scoped={scoped ? "true" : "false"}
            style={{ zIndex }}
        />
    )
}
