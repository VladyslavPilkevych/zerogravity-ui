"use client"

import { Perseid } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { PERSEID_PALETTES } from "../experimental/schemas"

export function PerseidPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        count: number
        speed: number
        angle: number
        parallax: boolean
        paletteName: string
    }

    return (
        <Perseid
            count={c.count}
            speed={c.speed}
            angle={c.angle}
            parallax={c.parallax}
            colors={PERSEID_PALETTES[c.paletteName] ?? PERSEID_PALETTES.aurora}
            className="xpg-perseid"
        />
    )
}
