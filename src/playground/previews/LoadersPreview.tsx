"use client"

import { PixelBar, PixelBlocks, PixelHeart, PixelPulse } from "@/lib/experimental"
import type { PixelBlocksVariant, PixelHeartVariant } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function LoadersPreview({ config }: PreviewApi) {
    const c = config as {
        heartVariant: PixelHeartVariant
        blocksVariant: PixelBlocksVariant
        size: number
        color: string
        speed: number
        paused: boolean
        gap: number
        value: number
        determinate: boolean
    }

    const shared = { color: c.color, speed: c.speed, paused: c.paused, gap: c.gap }

    return (
        <div className="xpg-loaders">
            <div className="xpg-loaders-row">
                <div className="xpg-loader-card">
                    <div className="xpg-loader-slot">
                        <PixelHeart
                            {...shared}
                            size={c.size}
                            variant={c.heartVariant}
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
                        <PixelBlocks {...shared} variant={c.blocksVariant} label="Loading" />
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
                            value={c.determinate ? c.value : undefined}
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
                        <PixelHeart {...shared} size={72} variant={c.heartVariant} label="" />
                    </PixelPulse>
                </div>
                <div>
                    <h3>PixelPulse</h3>
                    <p>
                        Whole-page or large-container loading. Wraps its own centred content and can
                        pin itself over the viewport.
                    </p>
                </div>
            </div>
        </div>
    )
}
