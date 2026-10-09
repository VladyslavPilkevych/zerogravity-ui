"use client"

import type { PreviewApi } from "@/docs/useDocsConfig"
import { Pip, PIP_STATUSES } from "@/lib"

import "../interface/interface.css"

export function PipPreview({ config }: PreviewApi) {
    const c = config as { variant: "outline" | "solid" }

    return (
        <div className="ipg">
            <div className="ipg-row">
                {PIP_STATUSES.map((status) => (
                    <Pip key={status} status={status} variant={c.variant}>
                        {status}
                    </Pip>
                ))}
            </div>
        </div>
    )
}
