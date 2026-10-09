"use client"

import { useState } from "react"

import { Tide, type TideEdge } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function TidePreview({ config }: PreviewApi) {
    const c = config as unknown as {
        edge: TideEdge
        amplitude: number
        wavelength: number
        speed: number
        paused: boolean
        stroke: string | null
    }
    const [held, setHeld] = useState(false)

    const shared = {
        amplitude: c.amplitude,
        wavelength: c.wavelength,
        speed: c.speed,
        paused: c.paused || held,
        stroke: c.stroke ?? undefined,
    }

    return (
        <div className="xpg-tide">
            <Tide {...shared} edge={c.edge} className="xpg-tide-card-wrap">
                <article className="xpg-tide-card">
                    <code>edge=&quot;{c.edge}&quot;</code>
                    <h3>Card</h3>
                    <button type="button" onClick={() => setHeld((value) => !value)}>
                        {held ? "Resume" : "Hold"} the tide
                    </button>
                </article>
            </Tide>

            <div className="xpg-tide-side">
                <Tide {...shared} edge="bottom">
                    <section className="xpg-tide-section">
                        <code>edge=&quot;bottom&quot;</code>
                        <h3>Section</h3>
                    </section>
                </Tide>

                <Tide {...shared} edge="x">
                    <div className="xpg-tide-media" role="img" aria-label="A low sun over water">
                        <code>edge=&quot;x&quot;</code>
                    </div>
                </Tide>
            </div>
        </div>
    )
}
