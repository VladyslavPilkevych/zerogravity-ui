"use client"

import { Quartz } from "@/lib/experimental"
import type { QuartzBlend } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function QuartzPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        intensity: number
        scale: number
        speed: number
        colour: number
        blend: QuartzBlend
        seed: number
    }

    return (
        <Quartz
            intensity={c.intensity}
            scale={c.scale}
            speed={c.speed}
            colour={c.colour}
            blend={c.blend}
            seed={c.seed}
            className="xpg-quartz"
        >
            <div className="xpg-quartz-face">
                <h3>Grain</h3>
                <p>One tile, painted once and repeated by CSS.</p>
            </div>
        </Quartz>
    )
}
