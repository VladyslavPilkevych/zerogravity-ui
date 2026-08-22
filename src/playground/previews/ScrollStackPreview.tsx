"use client"

import { useMemo } from "react"

import { ScrollStack } from "@/lib/scroll-stack"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { SIZE_MIXES, type ScrollStackDemoConfig } from "../scroll-stack/schema"
import { Hint, ScrollPort } from "./parts"

const SECTIONS = [
    { title: "One", from: "#14243f", to: "#080c16" },
    { title: "Two", from: "#2b1a3d", to: "#0d0812" },
    { title: "Three", from: "#123330", to: "#07120f" },
    { title: "Four", from: "#3a2416", to: "#140b06" },
    { title: "Five", from: "#1b2140", to: "#080a14" },
    { title: "Six", from: "#3d1a2a", to: "#12060c" },
    { title: "Seven", from: "#16303d", to: "#060f14" },
    { title: "Eight", from: "#2f3416", to: "#0e1005" },
]

export function ScrollStackPreview({ config }: PreviewApi) {
    const c = config as unknown as ScrollStackDemoConfig

    const sections = SECTIONS.slice(0, c.cards)
    const heights = useMemo(() => {
        const mix = SIZE_MIXES[c.sizeMix] ?? SIZE_MIXES.uniform
        return sections.map((_, index) => mix(index, sections.length))
    }, [c.sizeMix, sections])

    return (
        <ScrollPort>
            {(port) => (
                <>
                    <div className="pg-lead">
                        <Hint>Scroll</Hint>
                    </div>

                    <ScrollStack
                        scrollContainer={port}
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
                            </article>
                        ))}
                    </ScrollStack>

                    <div className="pg-lead" />
                </>
            )}
        </ScrollPort>
    )
}
