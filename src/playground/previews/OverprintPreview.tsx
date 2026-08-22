"use client"

import { Overprint } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function OverprintPreview({ config }: PreviewApi) {
    const c = config as {
        text: string
        size: number
        spread: number
        converge: number
        weight: number
    }

    return (
        <div className="pg-story">
            <div className="xpg-tall" style={{ minHeight: 460 }}>
                <Overprint
                    text={c.text}
                    size={c.size}
                    spread={c.spread}
                    converge={c.converge}
                    weight={c.weight}
                />
            </div>
            <div className="xpg-spacer" />
        </div>
    )
}
