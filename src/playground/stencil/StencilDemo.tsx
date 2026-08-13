"use client"

import { useCallback, useMemo, useState } from "react"

import { Stencil, type StencilHover } from "@/lib/stencil"

import { Panel } from "../panel/Panel"
import { countOverrides, mergeDeep } from "../panel/overrides"
import { setPath } from "../panel/path"
import type { ChangeHandler } from "../panel/types"
import {
    REVEAL_MEDIA,
    STENCIL_CONTROLS,
    STENCIL_DEFAULTS,
    STENCIL_PRESETS,
    STENCIL_PRESET_VALUES,
    type StencilDemoConfig,
} from "./schema"

export function StencilDemo() {
    const [presetId, setPresetId] = useState("zebra")
    const [overrides, setOverrides] = useState<Partial<StencilDemoConfig>>({})

    const config = useMemo(
        () => mergeDeep(mergeDeep(STENCIL_DEFAULTS, STENCIL_PRESET_VALUES[presetId] ?? {}), overrides),
        [presetId, overrides],
    )

    const editCount = useMemo(() => countOverrides(overrides), [overrides])

    const update = useCallback<ChangeHandler>((path, value) => {
        setOverrides((prev) => setPath(prev, path, value))
    }, [])

    const applyPreset = useCallback((id: string) => {
        const values = STENCIL_PRESET_VALUES[id]
        if (!values) return
        setPresetId(id)
    }, [])

    return (
        <div className="pg-fixed pg-stencil-root">
            <div className="pg-stencil-stage">
                <p className="pg-stencil-kicker">hover the letters</p>

                <Stencil
                    text={config.text}
                    media={config.hover === "reveal" ? REVEAL_MEDIA : undefined}
                    fill={config.fill}
                    colors={config.colors}
                    image={config.image || undefined}
                    scale={config.scale}
                    angle={config.angle}
                    size={config.size}
                    weight={config.weight}
                    tracking={config.tracking}
                    hover={config.hover as StencilHover}
                    strength={config.strength}
                    animate={config.animate}
                    continuous={config.continuous}
                    outline={config.outline}
                    outlineColor={config.outlineColor}
                />

                <label className="pg-stencil-input">
                    <span>Word</span>
                    <input
                        type="text"
                        value={config.text}
                        maxLength={18}
                        onChange={(event) => update("text", event.currentTarget.value)}
                    />
                </label>
            </div>

            <Panel
                component="Stencil"
                subtitle="pattern-filled display type"
                groups={STENCIL_CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={STENCIL_DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={() => setOverrides({})}
                editCount={editCount}
                presets={STENCIL_PRESETS}
                presetId={presetId}
                onPreset={applyPreset}
                badge={config.text.length}
                badgeLabel="chars"
            />
        </div>
    )
}
