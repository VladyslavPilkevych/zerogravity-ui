"use client"

import { Prism, type PrismFacets } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"
import "../prism/prism.css"

export function PrismPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        strength: number
        facets: PrismFacets
        pixel: number
        tilt: number
        depth: number
        dispersion: number
        sheen: number
        radius: number
    }

    return (
        <div className="pg-prism-stage">
            <Prism
                strength={c.strength}
                facets={c.facets}
                pixel={c.pixel}
                tilt={c.tilt}
                depth={c.depth}
                dispersion={c.dispersion}
                sheen={c.sheen}
                radius={c.radius}
            >
                <div className="pg-prism-card">
                    <span className="pg-prism-kicker">White light in</span>
                    <h3>Refraction</h3>
                    <span className="pg-prism-bars" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                    </span>
                    <p>Every edge splits into red, green and blue, pushed apart along the light.</p>
                </div>
            </Prism>
            <Hint>Move or drag across the glass</Hint>
        </div>
    )
}
