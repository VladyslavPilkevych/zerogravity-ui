"use client"

import { Sonar } from "@/lib/sonar"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function SonarPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        gap: number
        amplitude: number
        speed: number
        band: number
        color: string
        pulseOnHover: boolean
    }

    return (
        <Sonar
            gap={c.gap}
            amplitude={c.amplitude}
            speed={c.speed}
            band={c.band}
            color={c.color}
            pulseOnHover={c.pulseOnHover}
            className="xpg-sonar"
        >
            <div className="xpg-sonar-face">
                <Hint>Press the field</Hint>
            </div>
        </Sonar>
    )
}
