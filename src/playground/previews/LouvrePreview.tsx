"use client"

import { Louvre } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function LouvrePreview({ config }: PreviewApi) {
    const c = config as {
        slats: number
        orientation: "horizontal" | "vertical"
        phase: number
        perspective: number
        gap: number
        shade: number
        scrollLength: number
    }

    return (
        <div className="pg-story">
            <Louvre
                slats={c.slats}
                orientation={c.orientation}
                phase={c.phase}
                perspective={c.perspective}
                gap={c.gap}
                shade={c.shade}
                scrollLength={`${c.scrollLength}vh`}
                front={
                    <div className="xpg-section xpg-section-a">
                        <h2>Section A</h2>
                        <p>The blinds are closed and this is all you can see.</p>
                    </div>
                }
                back={
                    <div className="xpg-section xpg-section-b">
                        <h2>Section B</h2>
                        <p>Keep scrolling and the slats rotate away to reveal this.</p>
                    </div>
                }
            />
        </div>
    )
}
