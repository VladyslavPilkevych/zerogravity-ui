"use client"

import type { PreviewApi } from "@/docs/useDocsConfig"
import { Tag, TAG_STATUSES, type TagStatus } from "@/lib"

import "../interface/interface.css"

const VARIANTS = ["outline", "solid"] as const

export function TagPreview({ config }: PreviewApi) {
    const c = config as { status: TagStatus; variant: "outline" | "solid" }

    return (
        <div className="ipg ipg-matrix">
            <div className="ipg-matrix-row">
                <p className="ipg-matrix-label">Configured</p>
                <div className="ipg-feature">
                    <Tag status={c.status} variant={c.variant}>
                        Release
                    </Tag>
                </div>
            </div>
            {VARIANTS.map((variant) => (
                <div key={variant} className="ipg-matrix-row" data-variant={variant}>
                    <p className="ipg-matrix-label">{variant}</p>
                    <div className="ipg-row">
                        {TAG_STATUSES.map((status) => (
                            <Tag key={status} status={status} variant={variant}>
                                {status}
                            </Tag>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
