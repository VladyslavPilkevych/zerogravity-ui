"use client"

import { Anaglyph, RASTER_DEMO_IMAGE } from "@/lib/experimental"
import type { AnaglyphMode } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function AnaglyphPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        mode: AnaglyphMode
        separation: number
        depth: number
        radius: number
    }

    return (
        <div className="xpg-anaglyph-stage">
            <Anaglyph
                src={RASTER_DEMO_IMAGE}
                alt="Abstract poster of a sun setting behind layered hills"
                mode={c.mode}
                separation={c.separation}
                depth={c.depth}
                radius={c.radius}
                aspect="16 / 10"
            />
            <Hint>Move across the picture</Hint>
        </div>
    )
}
