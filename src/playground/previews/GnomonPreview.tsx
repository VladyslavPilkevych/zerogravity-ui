"use client"

import { Gnomon } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function GnomonPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        distance: number
        softness: number
        depth: number
        color: string
        lift: boolean
    }

    return (
        <div className="xpg-gnomon-stage">
            <Gnomon
                distance={c.distance}
                softness={c.softness}
                depth={c.depth}
                color={c.color}
                lift={c.lift}
                className="xpg-gnomon-row"
            >
                <div className="xpg-gnomon-tile">Alpha</div>
                <div className="xpg-gnomon-tile">Beta</div>
                <div className="xpg-gnomon-tile">Gamma</div>
            </Gnomon>
            <Hint>The pointer is the lamp</Hint>
        </div>
    )
}
