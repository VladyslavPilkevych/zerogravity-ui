"use client"

import { useMemo, useState } from "react"

import { ScrollStack } from "@/lib/scroll-stack"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { SIZE_MIXES, type ScrollStackDemoConfig } from "../scroll-stack/schema"

const SECTIONS = [
    {
        title: "Sticky, not scripted",
        note: "Layout is pure CSS position: sticky",
        from: "#14243f",
        to: "#080c16",
    },
    {
        title: "Scale and fade",
        note: "Only transform and opacity are written",
        from: "#2b1a3d",
        to: "#0d0812",
    },
    {
        title: "Reads scrollY only",
        note: "Zero layout reads while scrolling",
        from: "#123330",
        to: "#07120f",
    },
    {
        title: "Reverses for free",
        note: "Progress comes from position, not direction",
        from: "#3a2416",
        to: "#140b06",
    },
    { title: "Any content", note: "Cards are your own markup", from: "#1b2140", to: "#080a14" },
    { title: "Six", note: "Add or remove sections live", from: "#3d1a2a", to: "#12060c" },
    { title: "Seven", note: "The stack grows with your children", from: "#16303d", to: "#060f14" },
    { title: "Eight", note: "The last card never recedes", from: "#2f3416", to: "#0e1005" },
]

export function ScrollStackPreview({ config }: PreviewApi) {
    const c = config as unknown as ScrollStackDemoConfig
    const [active, setActive] = useState(0)

    const sections = SECTIONS.slice(0, c.cards)
    const heights = useMemo(() => {
        const mix = SIZE_MIXES[c.sizeMix] ?? SIZE_MIXES.uniform
        return sections.map((_, index) => mix(index, sections.length))
    }, [c.sizeMix, sections])

    return (
        <div className="pg-story">
            <section className="pg-intro">
                <h2>Scroll the page</h2>
                <p>Sections slide over each other, and unstack on the way back.</p>
                <span className="pg-scroll-hint">scroll ↓</span>
            </section>

            <ScrollStack
                height={c.height}
                heights={heights}
                top={c.top}
                peek={c.peek}
                scaleTo={c.scaleTo}
                dim={c.dim}
                dimColor={c.dimColor}
                opacityTo={c.opacityTo}
                liftTo={c.liftTo}
                blurTo={c.blurTo}
                rounded={c.rounded}
                easing={c.easing}
                disabled={c.disabled}
                onActiveChange={setActive}
            >
                {sections.map((section, index) => (
                    <article
                        key={section.title}
                        className="pg-card"
                        style={{
                            background: `linear-gradient(155deg, ${section.from}, ${section.to})`,
                        }}
                    >
                        <span className="pg-card-index">
                            {String(index + 1).padStart(2, "0")} /{" "}
                            {String(sections.length).padStart(2, "0")}
                        </span>
                        <h2>{section.title}</h2>
                        <p>{section.note}</p>
                    </article>
                ))}
            </ScrollStack>

            <section className="pg-outro">
                <h2>Out the other side</h2>
                <p>Card {active + 1} was in front. Scroll back up and every card returns.</p>
            </section>
        </div>
    )
}
