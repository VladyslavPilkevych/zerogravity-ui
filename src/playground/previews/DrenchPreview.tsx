"use client"

import { Drench } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function DrenchPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        text: string
        rain: number
        wind: number
        fall: number
        wetness: number
        evaporation: number
        color: string
    }

    return (
        <Drench
            text={c.text}
            rain={c.rain}
            wind={c.wind}
            fall={c.fall}
            wetness={c.wetness}
            evaporation={c.evaporation}
            color={c.color}
            className="xpg-drench"
        />
    )
}
