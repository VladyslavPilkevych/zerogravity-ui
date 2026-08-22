"use client"

import { Overprint } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const DEFAULTS = { text: "MISREGISTER", spread: 10, converge: 5, size: 96, weight: 800 }

const CONTROLS: ControlGroup[] = [
    {
        id: "press",
        title: "Press",
        hint: "ink offset and how fast the plates realign",
        open: true,
        controls: [
            { kind: "number", path: "size", label: "Size", min: 32, max: 200, step: 2, unit: "px" },
            {
                kind: "number",
                path: "spread",
                label: "Spread",
                min: 0,
                max: 48,
                step: 1,
                unit: "px",
            },
            { kind: "number", path: "converge", label: "Converge", min: 1, max: 20, step: 0.5 },
            { kind: "number", path: "weight", label: "Weight", min: 300, max: 900, step: 50 },
        ],
    },
]

export function OverprintDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)

    return (
        <>
            <Stage title="Overprint" blurb="colour separations that misregister with scroll" scroll>
                <div className="xpg-tall" style={{ minHeight: 520 }}>
                    <Overprint
                        text={config.text}
                        size={config.size}
                        spread={config.spread}
                        converge={config.converge}
                        weight={config.weight}
                    />
                </div>
            </Stage>

            <Panel
                component="Overprint"
                subtitle="colour separations that misregister with scroll"
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
