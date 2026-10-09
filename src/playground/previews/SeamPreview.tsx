"use client"

import type { PreviewApi } from "@/docs/useDocsConfig"
import { Seam, type SeamPattern } from "@/lib"

import "../interface/interface.css"

const PATTERNS: SeamPattern[] = ["dash", "stair", "dither", "pulse"]

export function SeamPreview({ config }: PreviewApi) {
    const c = config as { cell: number; tone: string | null; animated: boolean; speed: number }

    return (
        <div className="ipg ipg-seams">
            {PATTERNS.map((pattern) => (
                <Seam
                    key={pattern}
                    pattern={pattern}
                    label={pattern}
                    cell={c.cell}
                    tone={c.tone ?? undefined}
                    animated={c.animated || undefined}
                    speed={c.speed}
                />
            ))}
        </div>
    )
}
