"use client"

import { Chroma } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function ChromaPreview({ config }: PreviewApi) {
    const c = config as unknown as { width: number; blur: number; decay: number }

    return (
        <Chroma width={c.width} blur={c.blur} decay={c.decay} className="xpg-chroma">
            <div className="xpg-chroma-face">
                <Hint>Move the pointer across the surface</Hint>
            </div>
        </Chroma>
    )
}
