"use client"

import { memo } from "react"

import { RASTER_DEMO_IMAGE, Raster } from "@/lib/experimental"
import type { RasterMode } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

interface Choice {
    id: string
    label: string
    /** the mode the thumbnail renders; the Original thumbnail turns the effect off */
    mode: RasterMode
    off?: boolean
}

const CHOICES: Choice[] = [
    { id: "original", label: "Original", mode: "blur", off: true },
    { id: "blur", label: "Blur", mode: "blur" },
    { id: "glass", label: "Glass", mode: "glass" },
    { id: "glyph", label: "Glyph", mode: "glyph" },
    { id: "pixel", label: "Pixel", mode: "pixel" },
]

/** Fixed tuning, so a thumbnail never re-processes when the main controls move. */
const Thumbnails = memo(function Thumbnails({
    selected,
    onSelect,
}: {
    selected: string
    onSelect: (choice: Choice) => void
}) {
    return (
        <div className="xpg-raster-modes" role="group" aria-label="Rendering mode">
            {CHOICES.map((choice) => (
                <button
                    key={choice.id}
                    type="button"
                    className="xpg-raster-mode"
                    aria-pressed={choice.id === selected}
                    onClick={() => onSelect(choice)}
                >
                    <Raster
                        src={RASTER_DEMO_IMAGE}
                        alt=""
                        mode={choice.mode}
                        disabled={choice.off}
                        animated={false}
                        interactive={false}
                        cellSize={6}
                        pixelSize={8}
                        gridGap={1}
                        distortion={14}
                        blurStrength={14}
                        aspectRatio="4 / 3"
                    />
                    <span>{choice.label}</span>
                </button>
            ))}
        </div>
    )
})

export function RasterPreview({ config, apply }: PreviewApi) {
    const c = config as {
        mode: RasterMode
        disabled: boolean
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

    const selected = c.disabled ? "original" : c.mode

    return (
        <div className="xpg-raster-stack">
            <Raster
                src={RASTER_DEMO_IMAGE}
                alt="Abstract poster of a sun setting behind layered hills"
                mode={c.mode}
                disabled={c.disabled}
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

            <Thumbnails
                selected={selected}
                onSelect={(choice) =>
                    // Original only switches the effect off, so the chosen mode survives
                    apply(choice.off ? { disabled: true } : { mode: choice.mode, disabled: false })
                }
            />
        </div>
    )
}
