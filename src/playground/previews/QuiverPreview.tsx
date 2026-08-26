"use client"

import { Quiver } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function QuiverPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        text: string
        lift: number
        width: number
        twist: number
        ambient: boolean
    }

    return (
        <div className="xpg-type-stage">
            <Quiver
                text={c.text}
                lift={c.lift}
                width={c.width}
                twist={c.twist}
                ambient={c.ambient}
                as="h2"
                className="xpg-quiver"
            />
            <Hint>Run along the line</Hint>
        </div>
    )
}
