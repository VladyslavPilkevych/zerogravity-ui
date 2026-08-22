"use client"

import { RASTER_DEMO_IMAGE, Raster } from "@/lib/experimental"
import type { RasterMode } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

const MODES: RasterMode[] = ["blur", "glass", "glyph", "pixel"]

export function RasterPreview({ config }: PreviewApi) {
    const c = config as {
        mode: RasterMode
        animated: boolean
        interactive: boolean
        blurStrength: number
        distortion: number
        glyphSet: string
        cellSize: number
        pixelSize: number
        gridGap: number
        rounded: number
    }

    return (
        <div className="xpg-raster-stack">
            <Raster
                src={RASTER_DEMO_IMAGE}
                alt="Abstract poster of a sun setting behind layered hills"
                mode={c.mode}
                animated={c.animated}
                interactive={c.interactive}
                blurStrength={c.blurStrength}
                distortion={c.distortion}
                glyphSet={c.glyphSet}
                cellSize={c.cellSize}
                pixelSize={c.pixelSize}
                gridGap={c.gridGap}
                rounded={c.rounded}
                className="xpg-raster-hero"
                aspectRatio="16 / 7"
            />

            <div className="xpg-raster-row">
                {MODES.map((mode) => (
                    <div key={mode} className="xpg-raster-cell">
                        <Raster
                            src={RASTER_DEMO_IMAGE}
                            alt=""
                            mode={mode}
                            animated={c.animated}
                            aspectRatio="4 / 3"
                        />
                        <span>{mode}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
