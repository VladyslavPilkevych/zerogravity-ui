"use client"

import { Frost } from "@/lib"
import type { FrostTone, FrostVariant } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function FrostPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        tone: FrostTone
        variant: FrostVariant
        blur: number
        radius: number
        border: boolean
        shadow: boolean
    }

    return (
        <div className="xpg-frost" data-tone={c.tone}>
            <div className="xpg-frost-scene" aria-hidden="true">
                <span />
                <span />
                <span />
            </div>
            <Frost
                className="xpg-frost-card"
                tone={c.tone}
                variant={c.variant}
                blur={c.blur}
                radius={c.radius}
                border={c.border}
                shadow={c.shadow}
            >
                <span className="xpg-frost-eyebrow">Now playing</span>
                <strong>Glass over colour</strong>
                <p>The shapes behind stay soft; the text in front stays sharp.</p>
            </Frost>
        </div>
    )
}
