"use client"

import { Concertina, ConcertinaPanel } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint, ScrollPort } from "./parts"

const LEAVES = ["Fold", "Crease", "Score", "Pleat"]

export function ConcertinaPreview({ config }: PreviewApi) {
    const c = config as unknown as { angle: number; depth: number; shade: number }

    return (
        <ScrollPort>
            {(port) => (
                <>
                    <div className="pg-lead pg-lead-short">
                        <Hint>Scroll</Hint>
                    </div>

                    <Concertina
                        scrollContainer={port}
                        height="52cqh"
                        angle={c.angle}
                        depth={c.depth}
                        shade={c.shade}
                    >
                        {LEAVES.map((leaf, index) => (
                            <ConcertinaPanel key={leaf}>
                                <div className={`xpg-concertina-face xpg-fold-${index % 4}`}>
                                    {leaf}
                                </div>
                            </ConcertinaPanel>
                        ))}
                    </Concertina>

                    <div className="pg-lead pg-lead-short" />
                </>
            )}
        </ScrollPort>
    )
}
