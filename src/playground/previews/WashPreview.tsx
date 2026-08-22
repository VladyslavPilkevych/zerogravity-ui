"use client"

import { Wash } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { PALETTES } from "../experimental/schemas"
import { Hint } from "./parts"

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
            <Hint>Click</Hint>
        </Wash>
    )
}
