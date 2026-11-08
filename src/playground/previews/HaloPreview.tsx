"use client"

import { Halo } from "@/lib"
import type { HaloDirection } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function HaloPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        text: string
        repeat: number
        separator: string
        size: number
        spin: boolean
        duration: number
        direction: HaloDirection
        paused: boolean
        pauseOnHover: boolean
    }

    return (
        <div className="xpg-halo">
            <Halo
                text={c.text || "Scroll to explore"}
                repeat={c.repeat}
                separator={c.separator}
                size={c.size}
                spin={c.spin}
                duration={c.duration}
                direction={c.direction}
                paused={c.paused}
                pauseOnHover={c.pauseOnHover}
            >
                <span className="xpg-halo-core" aria-hidden="true">
                    ↓
                </span>
            </Halo>
        </div>
    )
}
