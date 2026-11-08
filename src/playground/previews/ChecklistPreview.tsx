"use client"

import { Checklist } from "@/lib"
import type { ChecklistVariant } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

import "../planning/planning.css"

const ITEMS = [
    { id: "tickets", label: "Book train tickets" },
    { id: "hotel", label: "Reserve the hotel" },
    { id: "talk", label: "Rehearse the talk" },
    { id: "slides", label: "Export slides as PDF" },
    { id: "visa", label: "Visa (not needed)", disabled: true },
]

export function ChecklistPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        variant: ChecklistVariant
        showProgress: boolean
        disabled: boolean
    }

    return (
        <div className="pzp-stack">
            <Checklist
                variant={c.variant}
                label="Conference prep"
                items={ITEMS}
                defaultValue={["tickets", "hotel"]}
                showProgress={c.showProgress}
                disabled={c.disabled}
            />
        </div>
    )
}
