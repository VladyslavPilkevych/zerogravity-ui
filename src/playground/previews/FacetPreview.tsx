"use client"

import { Facet } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { PALETTES } from "../experimental/schemas"

export function FacetPreview({ config }: PreviewApi) {
    const c = config as {
        cell: number
        paletteName: string
        variation: number
        intensity: number
        seed: number
        ambient: boolean
        ambientInterval: number
        ambientDuration: number
    }

    return (
        <Facet
            cell={c.cell}
            palette={PALETTES.facet[c.paletteName] ?? PALETTES.facet.dusk}
            variation={c.variation}
            intensity={c.intensity}
            seed={c.seed}
            ambient={c.ambient}
            ambientInterval={c.ambientInterval}
            ambientDuration={c.ambientDuration}
            className="xpg-hero"
        >
            <div className="xpg-hero-copy">
                <h2>Cut from light</h2>
                <p>
                    Colour flows across the facets instead of switching all at once, so the surface
                    keeps moving without ever flashing.
                </p>
                <div className="xpg-buttons">
                    <button type="button" className="xpg-cta">
                        Primary action
                    </button>
                    <button type="button" className="xpg-cta xpg-cta-ghost">
                        Secondary
                    </button>
                </div>
            </div>
        </Facet>
    )
}
