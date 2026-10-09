"use client"

import { Ink } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function InkPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        text: string
        color: string
        paper: string
        bleed: number
        feather: number
        pigment: number
        rim: number
        duration: number
        repeat: number
        interactive: boolean
        nib: number
        seed: number
    }

    return (
        <Ink
            text={c.text}
            color={c.color}
            paper={c.paper}
            bleed={c.bleed}
            feather={c.feather}
            pigment={c.pigment}
            rim={c.rim}
            duration={c.duration}
            repeat={c.repeat}
            interactive={c.interactive}
            nib={c.nib}
            seed={c.seed}
            className="xpg-ink"
        />
    )
}
