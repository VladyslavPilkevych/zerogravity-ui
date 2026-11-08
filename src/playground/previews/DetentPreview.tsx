"use client"

import { useState } from "react"

import { Detent } from "@/lib"
import type { DetentVariant } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

type View = "grid" | "list" | "board"

const OPTIONS = [
    { value: "grid" as const, label: "Grid" },
    { value: "list" as const, label: "List" },
    { value: "board" as const, label: "Board" },
]

export function DetentPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        variant: DetentVariant
        fullWidth: boolean
        disabled: boolean
    }
    const [view, setView] = useState<View>("grid")

    return (
        <div className="xpg-detent">
            <Detent
                label="View"
                variant={c.variant}
                options={OPTIONS}
                value={view}
                onChange={setView}
                fullWidth={c.fullWidth}
                disabled={c.disabled}
            />
            <div
                className="xpg-detent-tiles"
                data-view={view}
                data-variant={c.variant}
                aria-hidden="true"
            >
                {Array.from({ length: 6 }, (_, index) => (
                    <span key={index} />
                ))}
            </div>
        </div>
    )
}
