"use client"

import type { PreviewApi } from "@/docs/useDocsConfig"
import { Bezel } from "@/lib"

import "../interface/interface.css"

const FACTS = [
    ["Runtime dependencies", "0"],
    ["Shared frame loops", "1"],
    ["License", "MIT"],
]

export function BezelPreview({ config }: PreviewApi) {
    const c = config as {
        label: string
        tone: string
        grid: boolean
        ticks: boolean
        scan: boolean
        notch: number
    }

    return (
        <div className="ipg">
            <Bezel
                className="ipg-bezel"
                label={c.label || undefined}
                tone={c.tone}
                grid={c.grid}
                ticks={c.ticks}
                scan={c.scan}
                notch={c.notch}
            >
                <dl className="ipg-stats">
                    {FACTS.map(([term, value]) => (
                        <div key={term}>
                            <dt>{term}</dt>
                            <dd>{value}</dd>
                        </div>
                    ))}
                </dl>
            </Bezel>
            <p className="ipg-hint" aria-hidden="true">
                Hover the panel to lock on
            </p>
        </div>
    )
}
