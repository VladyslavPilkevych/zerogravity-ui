"use client"

import { Wash } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const PALETTES: Record<string, string[]> = {
    ink: ["#20304f", "#2d4a4a", "#402f52", "#1f3b52", "#4a3550"],
    clay: ["#4a3328", "#5a4030", "#3d2b2b", "#63483a"],
    tide: ["#123040", "#17414a", "#0f3a3a", "#1b4c56"],
}

const DEFAULTS = {
    mode: "both",
    paletteName: "ink",
    interval: 4000,
    duration: 1400,
    softness: 0.35,
}

const CONTROLS: ControlGroup[] = [
    {
        id: "trigger",
        title: "Trigger",
        hint: "click, automatic, or both",
        open: true,
        controls: [
            { kind: "select", path: "mode", label: "Mode", options: ["click", "auto", "both"] },
            {
                kind: "number",
                path: "interval",
                label: "Interval",
                min: 600,
                max: 15000,
                step: 100,
                unit: "ms",
            },
        ],
    },
    {
        id: "bloom",
        title: "Bloom",
        hint: "shape and pace of the spreading colour",
        open: true,
        controls: [
            {
                kind: "number",
                path: "duration",
                label: "Duration",
                min: 200,
                max: 4000,
                step: 100,
                unit: "ms",
            },
            {
                kind: "number",
                path: "softness",
                label: "Edge softness",
                min: 0,
                max: 0.9,
                step: 0.05,
            },
            {
                kind: "select",
                path: "paletteName",
                label: "Palette",
                options: ["ink", "clay", "tide"],
            },
        ],
    },
]

export function WashDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)

    return (
        <>
            <Stage title="Wash" blurb="tap the surface and a new colour spreads from that point">
                <Wash
                    mode={config.mode as "click" | "auto" | "both"}
                    colors={PALETTES[config.paletteName] ?? PALETTES.ink}
                    interval={config.interval}
                    duration={config.duration}
                    softness={config.softness}
                    className="xpg-hero"
                >
                    <div className="xpg-hero-copy">
                        <h2>Ink on paper</h2>
                        <p>
                            Each trigger pours the next colour outward from the point you touched,
                            then settles as the new background.
                        </p>
                        <div className="xpg-buttons">
                            <button type="button" className="xpg-cta">
                                Foreground stays clickable
                            </button>
                            <button type="button" className="xpg-cta xpg-cta-ghost">
                                Secondary
                            </button>
                        </div>
                    </div>
                </Wash>
            </Stage>

            <Panel
                component="Wash"
                subtitle="colour blooming from the point you touch"
                groups={CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={reset}
                editCount={editCount}
                omit={["paletteName"]}
            />
        </>
    )
}
