"use client"

import { Gaze } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function GazePreview({ config }: PreviewApi) {
    const c = config as unknown as {
        sensitivity: number
        maxYaw: number
        maxPitch: number
        damping: number
        headDelay: number
    }

    return (
        <div className="xpg-gaze">
            <Gaze
                sensitivity={c.sensitivity}
                maxYaw={c.maxYaw}
                maxPitch={c.maxPitch}
                damping={c.damping}
                headDelay={c.headDelay}
                label="A low-poly owl whose eyes and head follow the pointer"
            />
            <Hint>Point or tap</Hint>
        </div>
    )
}
