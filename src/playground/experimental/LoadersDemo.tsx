"use client"

import { PixelBar, PixelBlocks, PixelHeart, PixelPulse } from "@/lib/experimental"
import type { PixelBlocksVariant, PixelHeartVariant } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const DEFAULTS = {
    heartVariant: "pulse",
    blocksVariant: "wave",
    size: 96,
    color: "#f4a04f",
    speed: 1,
    paused: false,
    value: 0.45,
    determinate: false,
}

const CONTROLS: ControlGroup[] = [
    {
        id: "shared",
        title: "Shared",
        hint: "applies to every loader in the gallery",
        open: true,
        controls: [
            { kind: "color", path: "color", label: "Colour" },
            { kind: "number", path: "speed", label: "Speed", min: 0.25, max: 3, step: 0.25 },
            { kind: "number", path: "size", label: "Heart size", min: 32, max: 200, step: 4 },
            { kind: "boolean", path: "paused", label: "Paused" },
        ],
    },
    {
        id: "variants",
        title: "Variants",
        hint: "per-loader animation styles",
        open: true,
        controls: [
            {
                kind: "select",
                path: "heartVariant",
                label: "Heart",
                options: ["pulse", "blink"],
            },
            {
                kind: "select",
                path: "blocksVariant",
                label: "Blocks",
                options: ["wave", "center", "steps"],
            },
            { kind: "boolean", path: "determinate", label: "Bar shows progress" },
            { kind: "number", path: "value", label: "Bar value", min: 0, max: 1, step: 0.05 },
        ],
    },
]

export function LoadersDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)

    const shared = {
        color: config.color,
        speed: config.speed,
        paused: config.paused,
    }

    return (
        <>
            <Stage title="Pixel loaders" blurb="four retro-digital loading states" scroll>
                <div className="xpg-loaders">
                    <div className="xpg-loaders-row">
                        <div className="xpg-loader-card">
                            <div className="xpg-loader-slot">
                                <PixelHeart
                                    {...shared}
                                    size={config.size}
                                    variant={config.heartVariant as PixelHeartVariant}
                                    label="Loading your world"
                                />
                            </div>
                            <div>
                                <h3>PixelHeart</h3>
                                <p>Brand moments, empty states, first paint.</p>
                            </div>
                        </div>

                        <div className="xpg-loader-card">
                            <div className="xpg-loader-slot">
                                <PixelBlocks
                                    {...shared}
                                    variant={config.blocksVariant as PixelBlocksVariant}
                                    label="Loading"
                                />
                            </div>
                            <div>
                                <h3>PixelBlocks</h3>
                                <p>Inline, beside a label or inside a button.</p>
                            </div>
                        </div>

                        <div className="xpg-loader-card">
                            <div className="xpg-loader-slot">
                                <PixelBar
                                    {...shared}
                                    value={config.determinate ? config.value : undefined}
                                    label="Loading assets"
                                />
                            </div>
                            <div>
                                <h3>PixelBar</h3>
                                <p>Indeterminate flow, or real progress with a value.</p>
                            </div>
                        </div>
                    </div>

                    <div className="xpg-loader-card xpg-loader-wide">
                        <div className="xpg-loader-frame">
                            <PixelPulse {...shared} label="Loading page">
                                <PixelHeart
                                    {...shared}
                                    size={72}
                                    variant={config.heartVariant as PixelHeartVariant}
                                    label=""
                                />
                            </PixelPulse>
                        </div>
                        <div>
                            <h3>PixelPulse</h3>
                            <p>
                                Whole-page or large-container loading. Wraps its own centred content
                                and can pin itself over the viewport.
                            </p>
                        </div>
                    </div>
                </div>
            </Stage>

            <Panel
                component="Pixel loaders"
                subtitle="retro-digital loading states"
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
