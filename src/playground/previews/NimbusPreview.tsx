"use client"

import { Nimbus } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { NIMBUS_PALETTES } from "../experimental/schemas"

export function NimbusPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        count: number
        speed: number
        intensity: number
        paletteName: string
        seed: number
    }

    return (
        <Nimbus
            count={c.count}
            speed={c.speed}
            intensity={c.intensity}
            colors={NIMBUS_PALETTES[c.paletteName] ?? NIMBUS_PALETTES.aurora}
            seed={c.seed}
            className="xpg-nimbus"
        >
            <div className="xpg-nimbus-face">Nimbus</div>
        </Nimbus>
    )
}
