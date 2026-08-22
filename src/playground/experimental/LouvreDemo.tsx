"use client"

import { Louvre } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const DEFAULTS = {
    slats: 10,
    orientation: "horizontal",
    phase: 0.55,
    perspective: 1400,
    gap: 0,
    shade: 0.55,
    scrollLength: 260,
}

const CONTROLS: ControlGroup[] = [
    {
        id: "blinds",
        title: "Blinds",
        hint: "slat geometry and reveal wave",
        open: true,
        controls: [
            { kind: "number", path: "slats", label: "Slats", min: 3, max: 24, step: 1 },
            {
                kind: "select",
                path: "orientation",
                label: "Orientation",
                options: ["horizontal", "vertical"],
            },
            { kind: "number", path: "phase", label: "Phase", min: 0, max: 1.5, step: 0.05 },
            {
                kind: "number",
                path: "perspective",
                label: "Perspective",
                min: 500,
                max: 2600,
                step: 50,
                unit: "px",
            },
            { kind: "number", path: "gap", label: "Gap", min: 0, max: 12, step: 1, unit: "px" },
            { kind: "number", path: "shade", label: "Shade", min: 0, max: 1, step: 0.05 },
            {
                kind: "number",
                path: "scrollLength",
                label: "Scroll length",
                min: 150,
                max: 500,
                step: 10,
                unit: "vh",
            },
        ],
    },
]

export function LouvreDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)

    return (
        <>
            <Stage title="Louvre" blurb="scroll to open the blinds onto the next section" scroll>
                <Louvre
                    slats={config.slats}
                    orientation={config.orientation as "horizontal" | "vertical"}
                    phase={config.phase}
                    perspective={config.perspective}
                    gap={config.gap}
                    shade={config.shade}
                    scrollLength={`${config.scrollLength}vh`}
                    front={
                        <div className="xpg-section xpg-section-a">
                            <h2>Section A</h2>
                            <p>The blinds are closed and this is all you can see.</p>
                        </div>
                    }
                    back={
                        <div className="xpg-section xpg-section-b">
                            <h2>Section B</h2>
                            <p>Keep scrolling and the slats rotate away to reveal this.</p>
                        </div>
                    }
                />
            </Stage>

            <Panel
                component="Louvre"
                subtitle="sticky blinds transition between two sections"
                groups={CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={reset}
                editCount={editCount}
                omit={[]}
            />
        </>
    )
}
