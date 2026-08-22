"use client"

import { useState } from "react"

import { Aperture } from "@/lib/aperture"
import type { PreviewApi } from "@/docs/useDocsConfig"

import type { ApertureDemoConfig } from "../aperture/schema"

export function AperturePreview({ config }: PreviewApi) {
    const c = config as unknown as ApertureDemoConfig
    const [progress, setProgress] = useState(0)

    return (
        <div className="pg-story">
            <section className="pg-intro">
                <h2>Scroll the page</h2>
                <p>A full-bleed panel closes into a framed card, or the other way round.</p>
                <span className="pg-scroll-hint">scroll ↓</span>
            </section>

            <Aperture
                height={c.height}
                inset={c.inset}
                radius={c.radius}
                direction={c.direction}
                scale={c.scale}
                dim={c.dim}
                dimColor={c.dimColor}
                easing={c.easing}
                disabled={c.disabled}
                onProgress={setProgress}
            >
                <div className="pg-aperture-panel">
                    <span className="pg-card-index">clip-path, not width</span>
                    <h2>The frame closes</h2>
                    <p>The content never rescales the layout — only the visible window changes.</p>
                </div>
            </Aperture>

            <section className="pg-outro">
                <h2>And out again</h2>
                <p>
                    {Math.round(progress * 100)}% closed. The curve is the same in both directions.
                </p>
            </section>
        </div>
    )
}
