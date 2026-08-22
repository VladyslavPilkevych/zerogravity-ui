"use client"

import { useState } from "react"

import { TesseraProvider, useTessera, useTesseraPhase } from "@/lib/experimental"
import type { TesseraSequence } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

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
