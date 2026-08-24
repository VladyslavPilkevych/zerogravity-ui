"use client"

import { Aperture } from "@/lib/aperture"
import type { PreviewApi } from "@/docs/useDocsConfig"

import type { ApertureDemoConfig } from "../aperture/schema"
import { Hint, ScrollPort } from "./parts"

export function AperturePreview({ config }: PreviewApi) {
    const c = config as unknown as ApertureDemoConfig

    return (
        <ScrollPort>
            {(port) => (
                <>
                    <div className="pg-lead pg-lead-short">
                        <Hint>Scroll</Hint>
                    </div>

                    <Aperture
                        scrollContainer={port}
                        height={c.height}
                        inset={c.inset}
                        radius={c.radius}
                        direction={c.direction}
                        scale={c.scale}
                        dim={c.dim}
                        dimColor={c.dimColor}
                        easing={c.easing}
                        disabled={c.disabled}
                    >
                        <div className="pg-aperture-panel">
                            <span className="pg-card-index">clip-path, not width</span>
                            <h2>The frame opens</h2>
                        </div>
                    </Aperture>

                    <div className="pg-lead pg-lead-short" />
                </>
            )}
        </ScrollPort>
    )
}
