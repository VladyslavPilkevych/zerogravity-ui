"use client"

import { useState } from "react"

import { TesseraProvider, useTessera, useTesseraPhase } from "@/lib/experimental"
import type { TesseraSequence } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const PAGES = [
    {
        id: "home",
        label: "Home",
        title: "Studio Tessera",
        blurb: "A route transition that tiles the viewport before the next page arrives.",
        tint: "linear-gradient(150deg, #131521, #2a1f38)",
    },
    {
        id: "shop",
        label: "Shop",
        title: "The Shop",
        blurb: "Every navigation waits for full coverage, so the swap is never visible.",
        tint: "linear-gradient(150deg, #10201f, #1d3a32)",
    },
    {
        id: "collection",
        label: "Collection",
        title: "Spring Collection",
        blurb: "Tiles retreat in the same direction they arrived, uncovering this page.",
        tint: "linear-gradient(150deg, #201524, #3a2030)",
    },
] as const

const DEFAULTS = {
    color: "#0b0c11",
    rows: 4,
    columns: 6,
    duration: 420,
    stagger: 380,
    sequence: "random",
}

const CONTROLS: ControlGroup[] = [
    {
        id: "grid",
        title: "Grid",
        hint: "how many tiles cover the viewport",
        open: true,
        controls: [
            { kind: "number", path: "rows", label: "Rows", min: 1, max: 12, step: 1 },
            { kind: "number", path: "columns", label: "Columns", min: 1, max: 12, step: 1 },
            {
                kind: "select",
                path: "sequence",
                label: "Sequence",
                options: ["random", "row", "column", "reverse", "center"],
            },
        ],
    },
    {
        id: "timing",
        title: "Timing",
        hint: "per-tile duration and the delay between tiles",
        open: true,
        controls: [
            {
                kind: "number",
                path: "duration",
                label: "Duration",
                min: 120,
                max: 1600,
                step: 20,
                unit: "ms",
            },
            {
                kind: "number",
                path: "stagger",
                label: "Stagger",
                min: 0,
                max: 900,
                step: 20,
                unit: "ms",
            },
            { kind: "color", path: "color", label: "Tile colour" },
        ],
    },
]

function MockRouter() {
    const tessera = useTessera()
    const phase = useTesseraPhase()
    const [route, setRoute] = useState<string>(PAGES[0].id)

    const page = PAGES.find((entry) => entry.id === route) ?? PAGES[0]

    const go = (next: string) => {
        if (next === route) return

        void tessera
            .run(() => {
                setRoute(next)
            })
            .catch(() => {})
    }

    return (
        <div className="xpg-tessera-page" style={{ ["--xpg-tessera-tint" as string]: page.tint }}>
            <div className="xpg-hero-copy">
                <h2>{page.title}</h2>
                <p>{page.blurb}</p>
                <div className="xpg-buttons">
                    {PAGES.map((entry) => (
                        <button
                            key={entry.id}
                            type="button"
                            data-route={entry.id}
                            className={entry.id === route ? "xpg-cta" : "xpg-cta xpg-cta-ghost"}
                            onClick={() => go(entry.id)}
                        >
                            {entry.label}
                        </button>
                    ))}
                </div>
                <div className="xpg-tessera-status">
                    <span className="xpg-chip" data-phase={phase}>
                        phase: {phase}
                    </span>
                </div>
            </div>
        </div>
    )
}

export function TesseraDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)

    return (
        <TesseraProvider
            color={config.color}
            rows={config.rows}
            columns={config.columns}
            duration={config.duration}
            stagger={config.stagger}
            sequence={config.sequence as TesseraSequence}
        >
            <Stage
                title="Tessera"
                blurb="tiles cover the viewport, the route swaps underneath, then they retreat"
            >
                <MockRouter />
            </Stage>

            <Panel
                component="TesseraProvider"
                subtitle="tiled route transition"
                groups={CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={reset}
                editCount={editCount}
            />
        </TesseraProvider>
    )
}
