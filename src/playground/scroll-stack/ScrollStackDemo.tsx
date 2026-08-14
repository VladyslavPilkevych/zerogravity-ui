"use client"

import { useCallback, useMemo, useState } from "react"

import { ScrollStack } from "@/lib/scroll-stack"

import { Panel } from "../panel/Panel"
import { countOverrides, mergeDeep } from "../panel/overrides"
import { setPath } from "../panel/path"
import type { ChangeHandler } from "../panel/types"
import {
    SCROLL_STACK_CONTROLS,
    SCROLL_STACK_DEFAULTS,
    SCROLL_STACK_PRESETS,
    SCROLL_STACK_PRESET_VALUES,
    SIZE_MIXES,
    type ScrollStackDemoConfig,
} from "./schema"

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

export function ScrollStackDemo() {
    const [presetId, setPresetId] = useState("clean")
    const [overrides, setOverrides] = useState<Partial<ScrollStackDemoConfig>>({})
    const [active, setActive] = useState(0)

    const config = useMemo(
        () =>
            mergeDeep(
                mergeDeep(SCROLL_STACK_DEFAULTS, SCROLL_STACK_PRESET_VALUES[presetId] ?? {}),
                overrides,
            ),
        [presetId, overrides],
    )

    const editCount = useMemo(() => countOverrides(overrides), [overrides])

    const update = useCallback<ChangeHandler>((path, value) => {
        setOverrides((prev) => setPath(prev, path, value))
    }, [])

    const applyPreset = useCallback((id: string) => {
        const values = SCROLL_STACK_PRESET_VALUES[id]
        if (!values) return
        setPresetId(id)
    }, [])

    const sections = SECTIONS.slice(0, config.cards)
    const heights = useMemo(() => {
        const mix = SIZE_MIXES[config.sizeMix] ?? SIZE_MIXES.uniform
        return sections.map((_, index) => mix(index, sections.length))
    }, [config.sizeMix, sections])

    return (
        <div className="pg-scroll-root">
            <section className="pg-intro">
                <h1>ScrollStack</h1>
                <p>
                    Full-height sections that slide over each other as you scroll, and unstack on
                    the way back.
                </p>
                <span className="pg-scroll-hint">scroll ↓</span>
            </section>

            <ScrollStack
                height={config.height}
                heights={heights}
                top={config.top}
                peek={config.peek}
                scaleTo={config.scaleTo}
                dim={config.dim}
                dimColor={config.dimColor}
                opacityTo={config.opacityTo}
                liftTo={config.liftTo}
                blurTo={config.blurTo}
                rounded={config.rounded}
                easing={config.easing}
                disabled={config.disabled}
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
                <p>Scroll back up — every card returns exactly the way it left.</p>
            </section>

            <Panel
                component="ScrollStack"
                subtitle="sections that stack on scroll"
                groups={SCROLL_STACK_CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={SCROLL_STACK_DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={() => setOverrides({})}
                editCount={editCount}
                presets={SCROLL_STACK_PRESETS}
                presetId={presetId}
                onPreset={applyPreset}
                badge={active + 1}
                badgeLabel="card"
                omit={["cards", "sizeMix"]}
            />
        </div>
    )
}
