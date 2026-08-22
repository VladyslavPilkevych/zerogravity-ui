"use client"

import { Kern } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function KernPreview({ config }: PreviewApi) {
    const c = config as {
        text: string
        size: number
        radius: number
        spread: number
        lift: number
        weight: number
        ease: number
    }

    return (
        <div className="xpg-tall">
            <Kern
                text={c.text}
                size={c.size}
                radius={c.radius}
                spread={c.spread}
                lift={c.lift}
                weight={c.weight}
                ease={c.ease}
            />
        </div>
    )
}
