"use client"

import { Lodestone } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function LodestonePreview({ config }: PreviewApi) {
    const c = config as {
        radius: number
        strength: number
        maxDisplacement: number
        minGap: number
        release: number
        lift: number
        buttons: number
        spacing: number
    }

    return (
        <div className="xpg-buttons" style={{ gap: c.spacing }}>
            {Array.from({ length: c.buttons }, (_, index) => (
                <Lodestone
                    key={index}
                    radius={c.radius}
                    strength={c.strength}
                    maxDisplacement={c.maxDisplacement}
                    minGap={c.minGap}
                    release={c.release}
                    lift={c.lift}
                >
                    {`Button ${index + 1}`}
                </Lodestone>
            ))}
        </div>
    )
}
