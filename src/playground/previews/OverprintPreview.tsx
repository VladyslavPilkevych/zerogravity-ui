"use client"

import { Overprint } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function OverprintPreview({ config }: PreviewApi) {
    const c = config as {
        text: string
        size: number
        spread: number
        converge: number
        weight: number
    }

    return (
        <div className="xpg-overprint">
            <Overprint
                text={c.text}
                size={c.size}
                spread={c.spread}
                converge={c.converge}
                weight={c.weight}
            />
            <Hint>Scroll</Hint>
        </div>
    )
}
