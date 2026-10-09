"use client"

import { Wash } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { PALETTES } from "../experimental/schemas"

export function WashPreview({ config }: PreviewApi) {
    const c = config as {
        mode: "click" | "auto" | "both"
        paletteName: string
        interval: number
        duration: number
        softness: number
        burst: boolean
    }

    return (
        <Wash
            mode={c.mode}
            colors={PALETTES.wash[c.paletteName] ?? PALETTES.wash.ink}
            interval={c.interval}
            duration={c.duration}
            softness={c.softness}
            burst={c.burst}
            className="xpg-hero xpg-wash"
        >
            <span className="xpg-wash-hint" aria-hidden="true">
                <i />
                Click or tap anywhere
            </span>
        </Wash>
    )
}
