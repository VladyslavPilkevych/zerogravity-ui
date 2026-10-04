"use client"

import { Meniscus } from "@/lib/experimental"
import type { MeniscusShape } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function MeniscusPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        value: number
        swell: number
        speed: number
        shape: MeniscusShape
        size: number
        color: string
        colorTo: string | null
        showValue: boolean
    }

    return (
        <div className="xpg-meniscus-stage">
            <Meniscus
                value={c.value}
                swell={c.swell}
                speed={c.speed}
                shape={c.shape}
                size={c.size}
                color={c.color}
                colorTo={c.colorTo ?? undefined}
                showValue={c.showValue}
                label="Upload progress"
            />
            <Meniscus
                swell={c.swell}
                speed={c.speed}
                shape={c.shape}
                size={c.size}
                color={c.color}
                colorTo={c.colorTo ?? undefined}
                showValue={c.showValue}
                label="Working"
            />
        </div>
    )
}
