"use client"

import { Lenticular, UNDERTOW_DEMO_BACK, UNDERTOW_DEMO_FRONT } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function LenticularPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        strips: number
        tilt: number
        sheen: number
        radius: number
    }

    return (
        <div className="xpg-lenticular-stage">
            <Lenticular
                frontSrc={UNDERTOW_DEMO_FRONT}
                backSrc={UNDERTOW_DEMO_BACK}
                alt="A meadow at noon on one side of the lens, and at night on the other"
                strips={c.strips}
                tilt={c.tilt}
                sheen={c.sheen}
                radius={c.radius}
                aspect="16 / 10"
            />
            <Hint>Move across the print</Hint>
        </div>
    )
}
