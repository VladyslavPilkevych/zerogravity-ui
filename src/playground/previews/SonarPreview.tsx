"use client"

import { Sonar } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function SonarPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        gap: number
        amplitude: number
        speed: number
        band: number
        color: string
        onHover: boolean
    }

    return (
        <Sonar
            gap={c.gap}
            amplitude={c.amplitude}
            speed={c.speed}
            band={c.band}
            color={c.color}
            onHover={c.onHover}
            className="xpg-sonar"
        >
            <div className="xpg-sonar-face">
                <Hint>Press the field</Hint>
            </div>
        </Sonar>
    )
}
