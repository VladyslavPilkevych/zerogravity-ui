"use client"

import { Undertow, UNDERTOW_DEMO_BACK, UNDERTOW_DEMO_FRONT } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function UndertowPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        radius: number
        strength: number
        softness: number
        speed: number
        linger: number
        interactive: boolean
    }

    return (
        <div className="xpg-undertow">
            <Undertow
                frontSrc={UNDERTOW_DEMO_FRONT}
                backSrc={UNDERTOW_DEMO_BACK}
                alt="A meadow at noon, with the same meadow at night underneath"
                radius={c.radius}
                strength={c.strength}
                softness={c.softness}
                speed={c.speed}
                linger={c.linger}
                interactive={c.interactive}
                aspect="16 / 10"
            />
            <Hint>Drag across the picture</Hint>
        </div>
    )
}
