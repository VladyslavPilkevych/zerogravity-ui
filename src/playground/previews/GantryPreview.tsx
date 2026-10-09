"use client"

import { Gantry } from "@/lib"
import type { GantryEasing } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint, ScrollPort } from "./parts"
import "@/lib/internal/pixel.css"
import "../gantry/gantry.css"

const CARS = ["Rail", "Truss", "Span", "Crane", "Beam", "Hoist"]

const pad = (value: number) => String(value).padStart(2, "0")

export function GantryPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        itemWidth: string
        gap: string
        pace: number
        transition: number
        hold: number
        easing: GantryEasing
        lean: number
    }

    return (
        <ScrollPort>
            {(port) => (
                <>
                    <div className="pg-lead pg-lead-short">
                        <Hint>Scroll</Hint>
                    </div>

                    <Gantry
                        scrollContainer={port}
                        height="100cqh"
                        itemWidth={c.itemWidth}
                        gap={c.gap}
                        pace={c.pace}
                        transition={c.transition}
                        hold={c.hold}
                        easing={c.easing}
                        lean={c.lean}
                        className="xpg-gantry"
                    >
                        {CARS.map((car, index) => (
                            <div key={car} className="gyd-card" data-tone={index % 4}>
                                <div className="gyd-plate zg-px-notch">
                                    <div className="gyd-head">
                                        <span className="gyd-index">
                                            {pad(index + 1)}/{pad(CARS.length)}
                                        </span>
                                        <span className="gyd-kind">Stop</span>
                                    </div>
                                    <div className="gyd-title">{car}</div>
                                    <div className="gyd-foot" aria-hidden="true">
                                        <span className="gyd-meter">
                                            {CARS.map((other, at) => (
                                                <i
                                                    key={other}
                                                    data-on={at === index || undefined}
                                                />
                                            ))}
                                        </span>
                                        <span>{index === CARS.length - 1 ? "End" : "Next"}</span>
                                    </div>
                                </div>
                                <div className="gyd-ring zg-px-ring" aria-hidden="true" />
                            </div>
                        ))}
                    </Gantry>

                    <div className="pg-lead pg-lead-short" />
                </>
            )}
        </ScrollPort>
    )
}
