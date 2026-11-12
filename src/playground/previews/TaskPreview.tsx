"use client"

import { Checklist, Tag, Task } from "@/lib"
import type { TaskVariant } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

import "../planning/planning.css"

const STEPS = [
    { id: "outline", label: "Outline the sections" },
    { id: "draft", label: "Write the first draft" },
    { id: "figures", label: "Add figures" },
    { id: "review", label: "Ask for a review" },
]

export function TaskPreview({ config }: PreviewApi) {
    const variant = (config.variant as TaskVariant) ?? "pixel"

    return (
        <div className="pzp-stack">
            <Task
                variant={variant}
                title="Quarterly report"
                defaultExpanded
                progress={{ value: 1, max: 4 }}
                meta={
                    <>
                        <span>In progress</span>
                        <span>1/4</span>
                        <span>Due Fri</span>
                        <span>3 h</span>
                    </>
                }
            >
                <Checklist
                    variant={variant}
                    label="Subtasks"
                    items={STEPS}
                    defaultValue={["outline"]}
                />
                <div className="pzp-chip-row">
                    <Tag status="info" appearance={variant}>
                        Writing
                    </Tag>
                    <Tag status="warning" appearance={variant}>
                        This week
                    </Tag>
                </div>
            </Task>
            <Task
                variant={variant}
                title="Book the venue"
                meta={
                    <>
                        <span>Tomorrow</span>
                        <span>30 min</span>
                    </>
                }
            />
            <Task variant={variant} title="Send invoices" defaultDone meta={<span>Done</span>} />
        </div>
    )
}
