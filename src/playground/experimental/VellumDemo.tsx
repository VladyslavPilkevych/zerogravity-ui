"use client"

import { Vellum } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const DEFAULTS = {
    tilt: 9,
    radius: 22,
    ease: 0.14,
    perspective: 900,
    highlight: true,
    dent: 0.35,
    sheen: 0.5,
    sheenColor: "#ffffff",
}

const CONTROLS: ControlGroup[] = [
    {
        id: "sheet",
        title: "Sheet",
        hint: "geometry of the tilt",
        open: true,
        controls: [
            { kind: "number", path: "tilt", label: "Tilt", min: 0, max: 30, step: 1, unit: "deg" },
            {
                kind: "number",
                path: "radius",
                label: "Radius",
                min: 0,
                max: 64,
                step: 2,
                unit: "px",
            },
            { kind: "number", path: "ease", label: "Ease", min: 0.02, max: 1, step: 0.02 },
            {
                kind: "number",
                path: "perspective",
                label: "Perspective",
                min: 300,
                max: 2000,
                step: 50,
                unit: "px",
            },
        ],
    },
    {
        id: "highlight",
        title: "Highlight",
        hint: "optional dent and sheen",
        open: true,
        controls: [
            { kind: "boolean", path: "highlight", label: "Enabled" },
            { kind: "number", path: "dent", label: "Dent", min: 0, max: 1, step: 0.05 },
            { kind: "number", path: "sheen", label: "Sheen", min: 0, max: 1.5, step: 0.05 },
            { kind: "color", path: "sheenColor", label: "Sheen colour" },
        ],
    },
]

export function VellumDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)

    return (
        <>
            <Stage title="Vellum" blurb="a sheet that leans toward the pointer">
                <Vellum
                    tilt={config.tilt}
                    radius={config.radius}
                    ease={config.ease}
                    perspective={config.perspective}
                    highlight={
                        config.highlight
                            ? {
                                  dent: config.dent,
                                  sheen: config.sheen,
                                  sheenColor: config.sheenColor,
                              }
                            : false
                    }
                >
                    <div className="xpg-tall" style={{ borderRadius: 0 }}>
                        Flexible sheet
                    </div>
                </Vellum>
            </Stage>

            <Panel
                component="Vellum"
                subtitle="pointer tilt with an optional highlight"
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
