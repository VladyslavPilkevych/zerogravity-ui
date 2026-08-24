"use client"

import { Stencil, type StencilHover } from "@/lib/stencil"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { REVEAL_MEDIA, type StencilDemoConfig } from "../stencil/schema"

export function StencilPreview({ config }: PreviewApi) {
    const c = config as unknown as StencilDemoConfig

    return (
        <div className="pg-stencil-stage">
            <Stencil
                text={c.text}
                media={c.hover === "reveal" ? REVEAL_MEDIA : undefined}
                fill={c.fill}
                colors={c.colors}
                image={c.image || undefined}
                scale={c.scale}
                angle={c.angle}
                size={c.size}
                weight={c.weight}
                tracking={c.tracking}
                hover={c.hover as StencilHover}
                strength={c.strength}
                animate={c.animate}
                continuous={c.continuous}
                outline={c.outline}
                outlineColor={c.outlineColor}
            />
        </div>
    )
}
