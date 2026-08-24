"use client"

import { useState } from "react"

import { TesseraProvider, useTessera, useTesseraPhase } from "@/lib"
import type { TesseraSequence } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

const PAGES = [
    { id: "home", label: "Home", title: "Home", tint: "linear-gradient(150deg, #131521, #2a1f38)" },
    { id: "shop", label: "Shop", title: "Shop", tint: "linear-gradient(150deg, #10201f, #1d3a32)" },
    {
        id: "collection",
        label: "Collection",
        title: "Collection",
        tint: "linear-gradient(150deg, #201524, #3a2030)",
    },
] as const

function MockRouter() {
    const tessera = useTessera()
    const phase = useTesseraPhase()
    const [route, setRoute] = useState<string>(PAGES[0].id)

    const page = PAGES.find((entry) => entry.id === route) ?? PAGES[0]

    const go = (next: string) => {
        if (next === route) return
        void tessera.run(() => setRoute(next)).catch(() => {})
    }

    return (
        <div className="xpg-tessera-page" style={{ ["--xpg-tessera-tint" as string]: page.tint }}>
            <div className="xpg-tessera-copy">
                <h2>{page.title}</h2>
                <div className="xpg-tessera-routes">
                    {PAGES.map((entry) => (
                        <button
                            key={entry.id}
                            type="button"
                            data-route={entry.id}
                            aria-current={entry.id === route ? "page" : undefined}
                            className="xpg-tessera-route"
                            onClick={() => go(entry.id)}
                        >
                            {entry.label}
                        </button>
                    ))}
                </div>
                <span className="xpg-chip" data-phase={phase}>
                    phase: {phase}
                </span>
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
