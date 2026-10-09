"use client"

import { Bitmap } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

import type { BitmapDemoConfig } from "../bitmap/schema"

export function BitmapPreview({ config }: PreviewApi) {
    const c = config as unknown as BitmapDemoConfig

    return (
        <div className="xpg-tall" style={{ width: "100%", color: "#4ee1f2", padding: "32px 24px" }}>
            <div style={{ width: c.pixelSize > 0 ? "auto" : "min(760px, 100%)", maxWidth: "100%" }}>
                <Bitmap
                    text={c.text}
                    as="p"
                    pixelSize={c.pixelSize}
                    gap={c.gap}
                    tracking={c.tracking}
                    colors={c.colors}
                    effect={c.effect}
                    animated={c.animated}
                    speed={c.speed}
                    dim={c.dim}
                    paused={c.paused}
                    style={{ margin: 0 }}
                />
            </div>
        </div>
    )
}
