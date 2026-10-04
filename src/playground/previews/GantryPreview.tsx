"use client"

import { Gantry } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint, ScrollPort } from "./parts"

const CARS = ["Rail", "Truss", "Span", "Crane", "Beam", "Hoist"]

export function GantryPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        itemWidth: string
        gap: string
        pace: number
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
                        lean={c.lean}
                        className="xpg-gantry"
                    >
                        {CARS.map((car, index) => (
                            <div key={car} className={`xpg-gantry-car xpg-fold-${index % 4}`}>
                                {car}
                            </div>
                        ))}
                    </Gantry>

                    <div className="pg-lead pg-lead-short" />
                </>
            )}
        </ScrollPort>
    )
}
