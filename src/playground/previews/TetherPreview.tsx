"use client"

import { Tether } from "@/lib"
import type { TetherFit, TetherVariant } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint, ScrollPort } from "./parts"

const STEPS = ["Sketch", "Prototype", "Review", "Ship"]
const SPINE = "M 50 0 C 100 60, 0 90, 50 150 S 100 240, 50 300 S 0 390, 50 400"

export function TetherPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        variant: TetherVariant
        fit: TetherFit
        start: number
        end: number
        strokeWidth: number
    }

    return (
        <ScrollPort>
            {(port) => (
                <>
                    <div className="pg-lead pg-lead-short">
                        <Hint>Scroll</Hint>
                    </div>
                    <Tether
                        className="xpg-tether"
                        d={SPINE}
                        variant={c.variant}
                        viewBox="0 0 100 400"
                        fit={c.fit}
                        start={c.start}
                        end={c.end}
                        strokeWidth={c.strokeWidth}
                        scrollContainer={port}
                    >
                        <ol className="xpg-tether-steps" data-variant={c.variant}>
                            {STEPS.map((step, index) => (
                                <li key={step}>
                                    <span>{String(index + 1).padStart(2, "0")}</span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </Tether>
                    <div className="pg-lead pg-lead-short" />
                </>
            )}
        </ScrollPort>
    )
}
