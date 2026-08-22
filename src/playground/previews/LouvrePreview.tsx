"use client"

import { Louvre } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint, ScrollPort } from "./parts"

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
        <ScrollPort>
            {(port) => (
                <>
                    <div className="pg-lead">
                        <Hint>Scroll</Hint>
                    </div>

                    <Louvre
                        scrollContainer={port}
                        slats={c.slats}
                        orientation={c.orientation}
                        phase={c.phase}
                        perspective={c.perspective}
                        gap={c.gap}
                        shade={c.shade}
                        scrollLength={`${c.scrollLength}%`}
                        front={
                            <div className="xpg-section xpg-section-a">
                                <h2>Section A</h2>
                            </div>
                        }
                        back={
                            <div className="xpg-section xpg-section-b">
                                <h2>Section B</h2>
                            </div>
                        }
                    />

                    <div className="pg-lead" />
                </>
            )}
        </ScrollPort>
    )
}
