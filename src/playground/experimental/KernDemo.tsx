"use client"

import { Kern } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const DEFAULTS = {
    text: "TYPESET",
    radius: 160,
    spread: 0.34,
    lift: 12,
    weight: 320,
    ease: 0.18,
    size: 88,
}

const CONTROLS: ControlGroup[] = [
    {
        id: "optical",
        title: "Optical",
        hint: "per-glyph response to pointer distance",
        open: true,
        controls: [
            { kind: "number", path: "size", label: "Size", min: 32, max: 180, step: 2, unit: "px" },
            {
                kind: "number",
                path: "radius",
                label: "Radius",
                min: 40,
                max: 500,
                step: 10,
                unit: "px",
            },
            { kind: "number", path: "spread", label: "Spread", min: 0, max: 1, step: 0.02 },
            { kind: "number", path: "lift", label: "Lift", min: 0, max: 60, step: 2, unit: "px" },
            { kind: "number", path: "weight", label: "Weight axis", min: 0, max: 500, step: 10 },
            { kind: "number", path: "ease", label: "Ease", min: 0.02, max: 1, step: 0.02 },
        ],
    },
]

export function KernDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)

    return (
        <>
            <Stage title="Kern" blurb="glyphs that open up near the pointer">
                <div className="xpg-tall">
                    <Kern
                        text={config.text}
                        size={config.size}
                        radius={config.radius}
                        spread={config.spread}
                        lift={config.lift}
                        weight={config.weight}
                        ease={config.ease}
                    />
                </div>
            </Stage>

            <Panel
                component="Kern"
                subtitle="glyphs that open up near the pointer"
                groups={CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={reset}
                editCount={editCount}
                omit={["text"]}
            />
        </>
    )
}
