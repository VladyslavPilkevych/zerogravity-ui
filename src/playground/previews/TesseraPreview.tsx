"use client"

import { useState, type CSSProperties } from "react"

import { Keycap, TesseraProvider, useTessera, useTesseraPhase } from "@/lib"
import type { TesseraPhase, TesseraSequence } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

import "../tessera/tessera.css"

const PAGES = [
    { id: "home", label: "Home", title: "Home", accent: "#4ee1f2", tint: "#121624" },
    { id: "shop", label: "Shop", title: "Shop", accent: "#c6f24e", tint: "#111c17" },
    {
        id: "collection",
        label: "Collection",
        title: "Collection",
        accent: "#ff5fa2",
        tint: "#1d1220",
    },
] as const

const STEPS: { phase: TesseraPhase; label: string }[] = [
    { phase: "idle", label: "Idle" },
    { phase: "covering", label: "Cover" },
    { phase: "covered", label: "Swap" },
    { phase: "revealing", label: "Reveal" },
]

const pad = (value: number) => String(value).padStart(2, "0")

function MockRouter() {
    const tessera = useTessera()
    const phase = useTesseraPhase()
    const [route, setRoute] = useState<string>(PAGES[0].id)

    const index = Math.max(
        0,
        PAGES.findIndex((entry) => entry.id === route),
    )
    const page = PAGES[index]

    const go = (next: string) => {
        if (next === route) return
        void tessera.run(() => setRoute(next)).catch(() => {})
    }

    return (
        <div
            className="tsd-page"
            style={{ "--tsd-accent": page.accent, "--tsd-tint": page.tint } as CSSProperties}
        >
            <div className="tsd-copy xpg-tessera-copy">
                <span className="tsd-crumb">
                    Route {pad(index + 1)}/{pad(PAGES.length)}
                </span>
                <h2>{page.title}</h2>
                <nav className="tsd-routes" aria-label="Demo routes">
                    {PAGES.map((entry) => {
                        const current = entry.id === route
                        return (
                            <Keycap
                                key={entry.id}
                                data-route={entry.id}
                                aria-current={current ? "page" : undefined}
                                variant={current ? "solid" : "outline"}
                                tone={entry.accent}
                                size="sm"
                                onClick={() => go(entry.id)}
                            >
                                {entry.label}
                            </Keycap>
                        )
                    })}
                </nav>
                <ol className="tsd-phases" aria-label="Transition phase">
                    {STEPS.map((step) => (
                        <li
                            key={step.phase}
                            data-on={step.phase === phase || undefined}
                            aria-current={step.phase === phase ? "step" : undefined}
                        >
                            {step.label}
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    )
}

export function TesseraPreview({ config }: PreviewApi) {
    const c = config as {
        color: string
        rows: number
        columns: number
        duration: number
        stagger: number
        sequence: TesseraSequence
    }

    return (
        <TesseraProvider
            color={c.color}
            rows={c.rows}
            columns={c.columns}
            duration={c.duration}
            stagger={c.stagger}
            sequence={c.sequence}
        >
            <MockRouter />
        </TesseraProvider>
    )
}
