"use client"

import { useRef } from "react"

import { GridTrail } from "@/lib/grid-trail"
import type { PointerFxPreset } from "@/lib/pointer-fx"
import type { PreviewApi } from "@/docs/useDocsConfig"

import type { GridTrailDemoConfig } from "../grid-trail/schema"
import { Hint } from "./parts"

export function GridTrailPreview({ config }: PreviewApi) {
    const c = config as unknown as GridTrailDemoConfig
    const scopeRef = useRef<HTMLDivElement>(null)

    return (
        <div className="pg-surface" ref={scopeRef}>
            <GridTrail
                preset={c.preset as PointerFxPreset}
                color={c.color || undefined}
                cellSize={c.cellSize}
                gap={c.gap}
                cornerRadius={c.cornerRadius}
                shape={c.shape}
                peakOpacity={c.peakOpacity}
                fadeDuration={c.fadeDuration}
                maxCells={c.maxCells}
                neighborFalloff={c.neighborFalloff}
                showGrid={c.showGrid}
                gridColor={c.gridColor || undefined}
                gridOpacity={c.gridOpacity}
                blendMode={c.blendMode}
                container={c.scoped ? scopeRef : undefined}
                zIndex={0}
            />
            <Hint>Move cursor</Hint>
        </div>
    )
}
