"use client"

import { Ink } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function InkPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        text: string
        color: string
        bleed: number
        duration: number
        feather: number
        repeat: number
        seed: number
    }

    return (
        <Ink
            text={c.text}
            color={c.color}
            bleed={c.bleed}
            duration={c.duration}
            feather={c.feather}
            repeat={c.repeat}
            seed={c.seed}
            className="xpg-ink"
        />
    )
}
