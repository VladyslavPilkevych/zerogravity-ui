"use client"

import { Facet } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const PALETTES: Record<string, string[]> = {
    dusk: ["#3b4c8a", "#2f6b70", "#6a4478", "#334f86", "#4a5c8f"],
    ember: ["#7a3b52", "#8a5a3b", "#6d3f4a", "#8f5a45"],
    forest: ["#2c5344", "#3a5f4a", "#24485c", "#356050"],
}

const DEFAULTS = {
    cell: 120,
    paletteName: "dusk",
    variation: 14,
    intensity: 0.7,
    seed: 7,
    ambient: true,
    ambientInterval: 7000,
    ambientDuration: 5200,
}

const CONTROLS: ControlGroup[] = [
    {
        id: "surface",
        title: "Surface",
        hint: "facet size and pointer lighting",
        open: true,
        controls: [
            {
                kind: "number",
                path: "cell",
                label: "Facet size",
                min: 40,
                max: 320,
                step: 10,
                unit: "px",
            },
            {
                kind: "number",
                path: "variation",
                label: "Tone variation",
                min: 0,
                max: 40,
                step: 1,
            },
            { kind: "number", path: "intensity", label: "Light", min: 0, max: 1.4, step: 0.05 },
            { kind: "number", path: "seed", label: "Seed", min: 1, max: 99, step: 1 },
        ],
    },
    {
        id: "ambient",
        title: "Ambient flow",
        hint: "interval picks the next colour, duration is the transition",
        open: true,
        controls: [
            { kind: "boolean", path: "ambient", label: "Enabled" },
            {
                kind: "select",
                path: "paletteName",
                label: "Palette",
                options: ["dusk", "ember", "forest"],
            },
            {
                kind: "number",
                path: "ambientInterval",
                label: "Interval",
                min: 1200,
                max: 20000,
                step: 200,
                unit: "ms",
            },
            {
                kind: "number",
                path: "ambientDuration",
                label: "Duration",
                min: 400,
                max: 14000,
                step: 200,
                unit: "ms",
            },
        ],
    },
]

export function FacetDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)

    return (
        <>
            <Stage
                title="Facet"
                blurb="a hero-scale surface whose colour migrates across the slats"
            >
                <Facet
                    cell={config.cell}
                    palette={PALETTES[config.paletteName] ?? PALETTES.dusk}
                    variation={config.variation}
                    intensity={config.intensity}
                    seed={config.seed}
                    ambient={config.ambient}
                    ambientInterval={config.ambientInterval}
                    ambientDuration={config.ambientDuration}
                    className="xpg-hero"
                >
                    <div className="xpg-hero-copy">
                        <h2>Cut from light</h2>
                        <p>
                            Colour flows across the facets instead of switching all at once, so the
                            surface keeps moving without ever flashing.
                        </p>
                        <div className="xpg-buttons">
                            <button type="button" className="xpg-cta">
                                Primary action
                            </button>
                            <button type="button" className="xpg-cta xpg-cta-ghost">
                                Secondary
                            </button>
                        </div>
                    </div>
                </Facet>
            </Stage>

            <Panel
                component="Facet"
                subtitle="faceted background with flowing ambient colour"
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
