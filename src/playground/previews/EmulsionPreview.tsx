"use client"

import { Emulsion, RASTER_DEMO_IMAGE } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function EmulsionPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        halation: number
        grain: number
        warmth: number
        leak: number
        fade: number
        radius: number
        seed: number
    }

    return (
        <div className="xpg-emulsion-stage">
            <Emulsion
                src={RASTER_DEMO_IMAGE}
                alt="Abstract poster of a sun setting behind layered hills"
                halation={c.halation}
                grain={c.grain}
                warmth={c.warmth}
                leak={c.leak}
                fade={c.fade}
                radius={c.radius}
                seed={c.seed}
                aspect="16 / 10"
            />
        </div>
    )
}
