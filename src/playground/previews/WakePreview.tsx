"use client"

import { Wake } from "@/lib/experimental"
import type { WakeMode } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function WakePreview({ config }: PreviewApi) {
    const c = config as unknown as {
        mode: WakeMode
        radius: number
        strength: number
        speed: number
        color: string
    }

    return (
        <Wake
            mode={c.mode}
            radius={c.radius}
            strength={c.strength}
            speed={c.speed}
            color={c.color}
            className="xpg-wake"
        >
            <div className="xpg-wake-face">
                <Hint>Move cursor</Hint>
            </div>
        </Wake>
    )
}
