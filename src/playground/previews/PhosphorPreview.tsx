"use client"

import { Phosphor } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function PhosphorPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        text: string
        color: string
        bloom: number
        scanline: number
        fringe: number
        jitter: number
    }

    return (
        <div className="xpg-phosphor-stage">
            <Phosphor
                text={c.text}
                color={c.color}
                bloom={c.bloom}
                scanline={c.scanline}
                fringe={c.fringe}
                jitter={c.jitter}
                as="h2"
                className="xpg-phosphor"
            />
        </div>
    )
}
