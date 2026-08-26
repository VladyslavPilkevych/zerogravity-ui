"use client"

import { Prism } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function PrismPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        tilt: number
        dispersion: number
        sheen: number
        radius: number
    }

    return (
        <div className="xpg-prism-stage">
            <Prism tilt={c.tilt} dispersion={c.dispersion} sheen={c.sheen} radius={c.radius}>
                <div className="xpg-prism-card">
                    <h3>Refraction</h3>
                    <p>Light takes the long way through a wedge of glass.</p>
                </div>
            </Prism>
            <Hint>Move across the card</Hint>
        </div>
    )
}
