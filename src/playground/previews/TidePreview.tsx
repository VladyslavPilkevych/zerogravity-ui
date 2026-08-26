"use client"

import { Tide } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function TidePreview({ config }: PreviewApi) {
    const c = config as unknown as {
        color: string
        colorTo: string | null
        height: number
        amplitude: number
        crests: number
        speed: number
        flip: boolean
        layers: number
    }

    return (
        <div className="xpg-tide-stage">
            <div className="xpg-tide-above">Above the waterline</div>
            <Tide
                color={c.color}
                colorTo={c.colorTo ?? undefined}
                height={c.height}
                amplitude={c.amplitude}
                crests={c.crests}
                speed={c.speed}
                flip={c.flip}
                layers={c.layers === 1 ? 1 : 2}
            />
            <div className="xpg-tide-below">Below it</div>
        </div>
    )
}
