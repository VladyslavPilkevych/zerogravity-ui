"use client"

import { Progress } from "@/lib"
import type { ProgressFormat, ProgressVariant } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

import "../planning/planning.css"

export function ProgressPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        variant: ProgressVariant
        value: number
        max: number
        segments: boolean
        format: ProgressFormat
    }

    return (
        <div className="pzp-stack">
            <Progress
                variant={c.variant}
                label="Subtasks"
                value={c.value}
                max={c.max}
                segments={c.segments}
                format={c.format}
            />
            <Progress variant={c.variant} label="Upload" value={64} />
            <Progress variant={c.variant} label="Week" value={4} max={7} segments />
        </div>
    )
}
