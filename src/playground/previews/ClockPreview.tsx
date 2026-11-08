"use client"

import { Clock } from "@/lib"
import type { ClockShow, ClockVariant } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

import "../planning/planning.css"

export function ClockPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        variant: ClockVariant
        show: ClockShow
        seconds: boolean
        timeZone: string
    }

    return (
        <div className="pzp-center">
            <Clock
                variant={c.variant}
                show={c.show}
                seconds={c.seconds}
                timeZone={c.timeZone || undefined}
            />
        </div>
    )
}
