"use client"

import { RASTER_DEMO_IMAGE, Raster } from "@/lib/experimental"
import type { RasterMode } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const MODES: RasterMode[] = ["blur", "glass", "glyph", "pixel"]

const DEFAULTS = {
    mode: "pixel",
    animated: true,
    interactive: true,
    blurStrength: 22,
    distortion: 18,
    glyphSet: "ascii",
    cellSize: 10,
    pixelSize: 18,
    gridGap: 2,
    rounded: 0.28,
}

const CONTROLS: ControlGroup[] = [
    {
        id: "mode",
        title: "Mode",
        hint: "how the picture is abstracted",
        open: true,
        controls: [
            { kind: "select", path: "mode", label: "Mode", options: MODES },
            { kind: "boolean", path: "interactive", label: "Reveal on hover" },
            { kind: "boolean", path: "animated", label: "Animated" },
        ],
    },
    {
        id: "tuning",
        title: "Tuning",
        hint: "options for the selected mode",
        open: true,
        controls: [
            { kind: "number", path: "blurStrength", label: "Blur", min: 4, max: 60, step: 2 },
            { kind: "number", path: "distortion", label: "Distortion", min: 0, max: 50, step: 2 },
            { kind: "number", path: "cellSize", label: "Glyph cell", min: 6, max: 28, step: 1 },
            {
                kind: "select",
                path: "glyphSet",
                label: "Glyph set",
                options: ["ascii", "dots", "blocks", "ink"],
            },
            { kind: "number", path: "pixelSize", label: "Pixel size", min: 6, max: 48, step: 2 },
            { kind: "number", path: "gridGap", label: "Pixel gap", min: 0, max: 8, step: 1 },
            {
                kind: "number",
                path: "rounded",
                label: "Pixel rounding",
                min: 0,
                max: 1,
                step: 0.05,
            },
        ],
    },
]

export function RasterDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)

    return (
        <>
            <Stage title="Raster" blurb="one picture, four stylised abstractions">
                <div className="xpg-raster-stack">
                    <Raster
                        src={RASTER_DEMO_IMAGE}
                        alt="Abstract poster of a sun setting behind layered hills"
                        mode={config.mode as RasterMode}
                        animated={config.animated}
                        interactive={config.interactive}
                        blurStrength={config.blurStrength}
                        distortion={config.distortion}
                        glyphSet={config.glyphSet}
                        cellSize={config.cellSize}
                        pixelSize={config.pixelSize}
                        gridGap={config.gridGap}
                        rounded={config.rounded}
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
                                    animated={config.animated}
                                    aspectRatio="4 / 3"
                                />
                                <span>{mode}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Stage>

            <Panel
                component="Raster"
                subtitle="stylised image abstraction"
                groups={CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={reset}
                editCount={editCount}
            />
        </>
    )
}
