"use client"

import { Sash } from "@/lib"
import type { SashDirection, SashVariant } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

const TOPICS = ["Pointer", "Scroll", "Typography", "Surfaces", "Media", "Interface"]
const TAGS = ["SVG", "CSS", "Canvas", "No dependencies", "SSR", "Reduced motion"]

export function SashPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        variant: SashVariant
        speed: number
        direction: SashDirection
        gap: number
        pauseOnHover: boolean
        fade: boolean
        paused: boolean
    }

    return (
        <div className="xpg-sash">
            <Sash
                className="xpg-sash-words"
                label="Topics"
                variant={c.variant}
                speed={c.speed}
                direction={c.direction}
                gap={c.gap}
                pauseOnHover={c.pauseOnHover}
                fade={c.fade}
                paused={c.paused}
            >
                {TOPICS.map((topic) => (
                    <span key={topic} className="xpg-sash-word">
                        {topic}
                        {c.variant === "classic" && <span aria-hidden="true">✦</span>}
                    </span>
                ))}
            </Sash>
            <Sash
                className="xpg-sash-tags"
                variant="classic"
                speed={c.speed * 0.6}
                direction={c.direction === "left" ? "right" : "left"}
                gap={12}
                pauseOnHover={c.pauseOnHover}
                fade
                paused={c.paused}
            >
                {TAGS.map((tag) => (
                    <span key={tag} className="xpg-sash-tag">
                        {tag}
                    </span>
                ))}
            </Sash>
        </div>
    )
}
