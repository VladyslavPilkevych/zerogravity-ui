"use client"

import { Vellum } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function VellumPreview({ config }: PreviewApi) {
    const c = config as {
        tilt: number
        radius: number
        ease: number
        perspective: number
        highlight: boolean
        dent: number
        sheen: number
        sheenColor: string
    }

    return (
        <Vellum
            className="xpg-vellum"
            tilt={c.tilt}
            radius={c.radius}
            ease={c.ease}
            perspective={c.perspective}
            highlight={
                c.highlight ? { dent: c.dent, sheen: c.sheen, sheenColor: c.sheenColor } : false
            }
        >
            <div className="xpg-vellum-sheet">
                <Hint>Hover</Hint>
            </div>
        </Vellum>
    )
}
