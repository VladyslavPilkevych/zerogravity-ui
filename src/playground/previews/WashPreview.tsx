"use client"

import { Wash } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { PALETTES } from "../experimental/schemas"

export function WashPreview({ config }: PreviewApi) {
    const c = config as {
        mode: "click" | "auto" | "both"
        paletteName: string
        interval: number
        duration: number
        softness: number
    }

    return (
        <Wash
            mode={c.mode}
            colors={PALETTES.wash[c.paletteName] ?? PALETTES.wash.ink}
            interval={c.interval}
            duration={c.duration}
            softness={c.softness}
            className="xpg-hero"
        >
            <div className="xpg-hero-copy">
                <h2>Ink on paper</h2>
                <p>
                    Each trigger pours the next colour outward from the point you touched, then
                    settles as the new background.
                </p>
                <div className="xpg-buttons">
                    <button type="button" className="xpg-cta">
                        Foreground stays clickable
                    </button>
                    <button type="button" className="xpg-cta xpg-cta-ghost">
                        Secondary
                    </button>
                </div>
            </div>
        </Wash>
    )
}
