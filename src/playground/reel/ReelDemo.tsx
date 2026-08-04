"use client"

import { useCallback, useMemo, useState } from "react"

import { Reel } from "@/lib/reel"

import { Panel } from "../panel/Panel"
import { countOverrides, mergeDeep } from "../panel/overrides"
import { setPath } from "../panel/path"
import type { ChangeHandler } from "../panel/types"
import {
    PRODUCTS,
    REEL_CONTROLS,
    REEL_DEFAULTS,
    REEL_PRESETS,
    REEL_PRESET_VALUES,
    type ReelDemoConfig,
} from "./schema"

export function ReelDemo() {
    const [presetId, setPresetId] = useState("flat")
    const [overrides, setOverrides] = useState<Partial<ReelDemoConfig>>({})
    const [index, setIndex] = useState(0)

    const config = useMemo(
        () => mergeDeep(mergeDeep(REEL_DEFAULTS, REEL_PRESET_VALUES[presetId] ?? {}), overrides),
        [presetId, overrides],
    )

    const editCount = useMemo(() => countOverrides(overrides), [overrides])

    const update = useCallback<ChangeHandler>((path, value) => {
        setOverrides((prev) => setPath(prev, path, value))
    }, [])

    const applyPreset = useCallback((id: string) => {
        const values = REEL_PRESET_VALUES[id]
        if (!values) return
        setPresetId(id)
    }, [])

    const products = PRODUCTS.slice(0, config.items)
    const current = products[Math.min(index, products.length - 1)]

    return (
        <div className="pg-fixed pg-reel-root">
            <div className="pg-reel-stage">
                <header className="pg-reel-head">
                    <h1>Reel</h1>
                    <p>Drag, flick, scroll sideways or use the arrows. Hover the centre item.</p>
                </header>

                <Reel
                    index={index}
                    onIndexChange={setIndex}
                    itemWidth={config.itemWidth}
                    itemHeight={config.itemHeight}
                    spacing={config.spacing}
                    visible={config.visible}
                    scale={config.scale}
                    opacity={config.opacity}
                    rotate={config.rotate}
                    depth={config.depth}
                    perspective={config.perspective}
                    stiffness={config.stiffness}
                    loop={config.loop}
                    drag={config.drag}
                    wheel={config.wheel}
                    arrows={config.arrows}
                    dots={config.dots}
                    clickToSelect={config.clickToSelect}
                    label="Products"
                >
                    {products.map((product) => (
                        <article
                            key={product.name}
                            className="pg-product"
                            style={{ background: `linear-gradient(160deg, ${product.from}, ${product.to})` }}
                        >
                            <span className="pg-product-tag">{product.tag}</span>
                            <div className="pg-product-body">
                                <h3>{product.name}</h3>
                                <span className="pg-product-price">{product.price}</span>
                            </div>
                        </article>
                    ))}
                </Reel>

                <footer className="pg-reel-foot">
                    <strong>{current?.name}</strong>
                    <span>
                        {index + 1} / {products.length}
                    </span>
                </footer>
            </div>

            <Panel
                component="Reel"
                subtitle="roulette-style carousel"
                groups={REEL_CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={REEL_DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={() => setOverrides({})}
                editCount={editCount}
                presets={REEL_PRESETS}
                presetId={presetId}
                onPreset={applyPreset}
                badge={index + 1}
                badgeLabel="index"
                omit={["items"]}
            />
        </div>
    )
}
