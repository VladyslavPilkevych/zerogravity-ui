"use client"

import { useCallback, useMemo, useRef, useState } from "react"

import { GridTrail } from "@/lib/grid-trail"
import type { PointerFxPreset } from "@/lib/pointer-fx"

import { Panel } from "../panel/Panel"
import { countOverrides, mergeDeep } from "../panel/overrides"
import { setPath } from "../panel/path"
import type { ChangeHandler } from "../panel/types"
import {
    GRID_TRAIL_CONTROLS,
    GRID_TRAIL_DEMO_DEFAULTS,
    GRID_TRAIL_PRESETS,
    GRID_TRAIL_PRESET_VALUES,
    type GridTrailDemoConfig,
} from "./schema"

export function GridTrailDemo() {
    const [presetId, setPresetId] = useState("amber")
    const [overrides, setOverrides] = useState<Partial<GridTrailDemoConfig>>({})
    const scopeRef = useRef<HTMLDivElement>(null)

    const config = useMemo(
        () =>
            mergeDeep(
                mergeDeep(GRID_TRAIL_DEMO_DEFAULTS, GRID_TRAIL_PRESET_VALUES[presetId] ?? {}),
                overrides,
            ),
        [presetId, overrides],
    )

    const editCount = useMemo(() => countOverrides(overrides), [overrides])

    const update = useCallback<ChangeHandler>((path, value) => {
        setOverrides((prev) => setPath(prev, path, value))
    }, [])

    const applyPreset = useCallback((id: string) => {
        if (!GRID_TRAIL_PRESET_VALUES[id]) return
        setPresetId(id)
    }, [])

    const shared = {
        preset: config.preset as PointerFxPreset,
        color: config.color || undefined,
        cellSize: config.cellSize,
        gap: config.gap,
        cornerRadius: config.cornerRadius,
        shape: config.shape,
        peakOpacity: config.peakOpacity,
        fadeDuration: config.fadeDuration,
        maxCells: config.maxCells,
        neighborFalloff: config.neighborFalloff,
        showGrid: config.showGrid,
        gridColor: config.gridColor || undefined,
        gridOpacity: config.gridOpacity,
        blendMode: config.blendMode,
    }

    return (
        <div className="pg-fixed pg-trail-root">
            {config.scoped ? null : <GridTrail {...shared} zIndex={0} />}

            <div className="pg-trail-stage">
                <header className="pg-trail-head">
                    <h1>GridTrail</h1>
                    <p>
                        Move the pointer. Cells light up and fade, and the animation frame loop
                        stops completely once the last one is gone.
                    </p>
                </header>

                {config.scoped ? (
                    <div className="pg-trail-scope" ref={scopeRef}>
                        <GridTrail {...shared} container={scopeRef} zIndex={0} />
                        <span>scoped to this box</span>
                    </div>
                ) : null}

                <div className="pg-trail-targets">
                    <button type="button">A button</button>
                    <a href="#grid-trail">A link</a>
                </div>
            </div>

            <Panel
                component="GridTrail"
                subtitle="pointer trail on an invisible grid"
                groups={GRID_TRAIL_CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={GRID_TRAIL_DEMO_DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={() => setOverrides({})}
                editCount={editCount}
                presets={GRID_TRAIL_PRESETS}
                presetId={presetId}
                onPreset={applyPreset}
                omit={["scoped"]}
            />
        </div>
    )
}
