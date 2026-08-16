"use client"

import { Lodestone } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const ACTIONS = ["Get started", "Read the docs", "View source", "Book a demo", "Pricing"]

const DEFAULTS = {
    radius: 150,
    strength: 0.5,
    maxDisplacement: 30,
    minGap: 12,
    release: 0.16,
    lift: 0.05,
    buttons: 4,
    spacing: 18,
}

const CONTROLS: ControlGroup[] = [
    {
        id: "magnet",
        title: "Magnet",
        hint: "how each button reacts to a nearby pointer",
        open: true,
        controls: [
            {
                kind: "number",
                path: "radius",
                label: "Radius",
                min: 40,
                max: 400,
                step: 10,
                unit: "px",
            },
            { kind: "number", path: "strength", label: "Strength", min: 0, max: 1, step: 0.02 },
            {
                kind: "number",
                path: "maxDisplacement",
                label: "Max displacement",
                min: 0,
                max: 80,
                step: 2,
                unit: "px",
            },
            {
                kind: "number",
                path: "release",
                label: "Return speed",
                min: 0.02,
                max: 1,
                step: 0.02,
            },
            { kind: "number", path: "lift", label: "Lift", min: 0, max: 0.3, step: 0.01 },
        ],
    },
    {
        id: "layout",
        title: "Layout",
        hint: "crowd the buttons to prove they cannot overlap",
        open: true,
        controls: [
            {
                kind: "number",
                path: "minGap",
                label: "Minimum gap",
                min: 0,
                max: 40,
                step: 1,
                unit: "px",
            },
            { kind: "number", path: "buttons", label: "Buttons", min: 2, max: 5, step: 1 },
            {
                kind: "number",
                path: "spacing",
                label: "Rest spacing",
                min: 2,
                max: 60,
                step: 2,
                unit: "px",
            },
        ],
    },
]

export function LodestoneDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)

    return (
        <>
            <Stage title="Lodestone" blurb="buttons lean toward the pointer but hold their spacing">
                <div className="xpg-buttons" style={{ gap: config.spacing }}>
                    {Array.from({ length: config.buttons }, (_, index) => (
                        <Lodestone
                            key={index}
                            radius={config.radius}
                            strength={config.strength}
                            maxDisplacement={config.maxDisplacement}
                            minGap={config.minGap}
                            release={config.release}
                            lift={config.lift}
                        >
                            {ACTIONS[index % ACTIONS.length]}
                        </Lodestone>
                    ))}
                </div>
            </Stage>

            <Panel
                component="Lodestone"
                subtitle="magnetic buttons that never overlap"
                groups={CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={reset}
                editCount={editCount}
                omit={["buttons", "spacing"]}
            />
        </>
    )
}
