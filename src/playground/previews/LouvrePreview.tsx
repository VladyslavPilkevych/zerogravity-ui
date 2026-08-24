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
                    <div className="pg-lead pg-lead-short">
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
                        scrollLength={`${c.scrollLength}cqh`}
                        front={
                            <div className="xpg-blind xpg-blind-a">
                                <span>Section A</span>
                            </div>
                        }
                        back={
                            <div className="xpg-blind xpg-blind-b">
                                <span>Section B</span>
                            </div>
                        }
                    />

                    <div className="pg-lead pg-lead-short" />
                </>
            )}
        </ScrollPort>
    )
}
