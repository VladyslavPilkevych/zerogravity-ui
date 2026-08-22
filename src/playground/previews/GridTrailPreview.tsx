"use client"

import { useRef } from "react"

import { GridTrail } from "@/lib/grid-trail"
import type { PointerFxPreset } from "@/lib/pointer-fx"
import type { PreviewApi } from "@/docs/useDocsConfig"

import type { GridTrailDemoConfig } from "../grid-trail/schema"

export function GridTrailPreview({ config }: PreviewApi) {
    const c = config as unknown as GridTrailDemoConfig
    const scopeRef = useRef<HTMLDivElement>(null)

    const shared = {
        preset: c.preset as PointerFxPreset,
        color: c.color || undefined,
        cellSize: c.cellSize,
        gap: c.gap,
        cornerRadius: c.cornerRadius,
        shape: c.shape,
        peakOpacity: c.peakOpacity,
        fadeDuration: c.fadeDuration,
        maxCells: c.maxCells,
        neighborFalloff: c.neighborFalloff,
        showGrid: c.showGrid,
        gridColor: c.gridColor || undefined,
        gridOpacity: c.gridOpacity,
        blendMode: c.blendMode,
    }

    return (
        <div className="pg-fixed pg-trail-root">
            {c.scoped ? null : <GridTrail {...shared} zIndex={0} />}

            <div className="pg-trail-stage">
                <header className="pg-trail-head">
                    <h2>Move the pointer</h2>
                    <p>
                        Cells light up and fade, and the animation frame loop stops completely once
                        the last one is gone.
                    </p>
                </header>

                {c.scoped ? (
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
        </div>
    )
}
