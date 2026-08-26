"use client"

import { Chroma } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function ChromaPreview({ config }: PreviewApi) {
    const c = config as unknown as { split: number; width: number; linger: number }

    return (
        <Chroma split={c.split} width={c.width} linger={c.linger} className="xpg-chroma">
            <div className="xpg-chroma-face">
                <Hint>Drag across the surface</Hint>
            </div>
        </Chroma>
    )
}
