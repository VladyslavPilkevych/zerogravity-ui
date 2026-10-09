"use client"

import { Wake } from "@/lib/experimental"
import type { WakeSurface } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function WakePreview({ config }: PreviewApi) {
    const c = config as unknown as {
        surface: WakeSurface
        strength: number
        radius: number
        decay: number
        refraction: number
        light: number
        pixelated: boolean
    }

    return (
        <Wake
            surface={c.surface}
            strength={c.strength}
            radius={c.radius}
            decay={c.decay}
            refraction={c.refraction}
            light={c.light}
            pixelated={c.pixelated}
            className="xpg-wake"
        >
            <div className="xpg-wake-face">
                <Hint>Drag through the water</Hint>
            </div>
        </Wake>
    )
}
