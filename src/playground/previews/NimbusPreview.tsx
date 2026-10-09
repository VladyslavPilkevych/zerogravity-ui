"use client"

import { Nimbus, type NimbusPreset } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { NIMBUS_PALETTES } from "../experimental/schemas"
import "../nimbus/nimbus.css"

export function NimbusPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        preset: NimbusPreset
        motion: number
        parallax: number
        density: number
        lighting: number
        grain: number
        scrim: number
        intensity: number
        speed: number
        paletteName: string
        accent: string | null
        seed: number
    }

    return (
        <Nimbus
            preset={c.preset}
            motion={c.motion}
            parallax={c.parallax}
            density={c.density}
            lighting={c.lighting}
            grain={c.grain}
            scrim={c.scrim}
            intensity={c.intensity}
            speed={c.speed}
            colors={NIMBUS_PALETTES[c.paletteName]}
            accent={c.accent ?? undefined}
            seed={c.seed}
            className="xpg-nimbus"
        >
            <div className="nb-hero">
                <p className="nb-eyebrow">Season two · now loading</p>
                <h3 className="nb-title">Somewhere past the harbour lights</h3>
                <p className="nb-copy">
                    A background that keeps breathing while people read. Fog banks drift at three
                    depths, dust catches the light, and the colour mood turns over slowly enough
                    that nobody looks away from the words.
                </p>
                <div className="nb-actions">
                    <a className="nb-button" href="#nimbus-demo">
                        Continue
                    </a>
                    <span className="nb-meta">Chapter 4 of 12</span>
                </div>
            </div>
        </Nimbus>
    )
}
