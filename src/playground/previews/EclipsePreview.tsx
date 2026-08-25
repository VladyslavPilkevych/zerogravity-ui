"use client"

import { Eclipse, EclipseSection } from "@/lib/experimental"
import type { EclipseFrom } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint, ScrollPort } from "./parts"

const PANELS = [
    { title: "One", tone: "xpg-eclipse-a" },
    { title: "Two", tone: "xpg-eclipse-b" },
    { title: "Three", tone: "xpg-eclipse-c" },
    { title: "Four", tone: "xpg-eclipse-d" },
]

export function EclipsePreview({ config }: PreviewApi) {
    const c = config as unknown as {
        from: EclipseFrom
        recede: number
        dim: number
        blur: number
    }

    return (
        <ScrollPort>
            {(port) => (
                <>
                    <div className="pg-lead pg-lead-short">
                        <Hint>Scroll</Hint>
                    </div>

                    <Eclipse
                        scrollContainer={port}
                        height="100cqh"
                        from={c.from}
                        recede={c.recede}
                        dim={c.dim}
                        blur={c.blur}
                    >
                        {PANELS.map((panel, index) => (
                            <EclipseSection key={panel.title}>
                                <div className={`xpg-eclipse-face ${panel.tone}`}>
                                    <span className="xpg-eclipse-index">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <h2>{panel.title}</h2>
                                </div>
                            </EclipseSection>
                        ))}
                    </Eclipse>

                    <div className="pg-lead pg-lead-short" />
                </>
            )}
        </ScrollPort>
    )
}
