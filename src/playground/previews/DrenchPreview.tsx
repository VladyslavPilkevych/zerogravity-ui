"use client"

import { Drench } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function DrenchPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        text: string
        rain: number
        fall: number
        wetness: number
        evaporation: number
        outline: number
        color: string
    }

    return (
        <Drench
            text={c.text}
            rain={c.rain}
            fall={c.fall}
            wetness={c.wetness}
            evaporation={c.evaporation}
            outline={c.outline}
            color={c.color}
            className="xpg-drench"
        />
    )
}
