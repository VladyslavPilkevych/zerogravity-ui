"use client"

import { Palimpsest } from "@/lib/experimental"
import type { PalimpsestTrigger } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function PalimpsestPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        text: string
        layers: number
        spread: number
        rotation: number
        trigger: PalimpsestTrigger
        seed: number
    }

    return (
        <div className="xpg-type-stage">
            <Palimpsest
                text={c.text}
                layers={c.layers}
                spread={c.spread}
                rotation={c.rotation}
                trigger={c.trigger}
                seed={c.seed}
                as="h2"
                className="xpg-palimpsest"
            />
            <Hint>Hover the word</Hint>
        </div>
    )
}
