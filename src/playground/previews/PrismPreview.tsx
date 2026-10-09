"use client"

import { Prism, type PrismFacets } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function PrismPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        facets: PrismFacets
        pixel: number
        tilt: number
        dispersion: number
        sheen: number
        radius: number
    }

    return (
        <div className="xpg-prism-stage">
            <Prism
                facets={c.facets}
                pixel={c.pixel}
                tilt={c.tilt}
                dispersion={c.dispersion}
                sheen={c.sheen}
                radius={c.radius}
            >
                <div className="xpg-prism-card">
                    <h3>Refraction</h3>
                    <p>White light enters where you point and leaves split into bands.</p>
                </div>
            </Prism>
            <Hint>Move across the glass</Hint>
        </div>
    )
}
