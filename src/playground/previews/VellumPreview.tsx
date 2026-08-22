"use client"

import { Vellum } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

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
            tilt={c.tilt}
            radius={c.radius}
            ease={c.ease}
            perspective={c.perspective}
            highlight={
                c.highlight ? { dent: c.dent, sheen: c.sheen, sheenColor: c.sheenColor } : false
            }
        >
            <div className="xpg-tall" style={{ borderRadius: 0 }}>
                Flexible sheet
            </div>
        </Vellum>
    )
}
