"use client"

import { useCallback, useMemo, useState, type CSSProperties } from "react"

import type { PointerFxPreset } from "@/lib/pointer-fx"
import { TrailingCursor } from "@/lib/trailing-cursor"

import { Panel } from "../panel/Panel"
import { countOverrides, mergeDeep } from "../panel/overrides"
import { setPath } from "../panel/path"
import type { ChangeHandler } from "../panel/types"
import {
    TRAILING_CURSOR_CONTROLS,
    TRAILING_CURSOR_DEFAULTS,
    TRAILING_CURSOR_PRESETS,
    TRAILING_CURSOR_PRESET_VALUES,
    type TrailingCursorDemoConfig,
} from "./schema"

export function TrailingCursorDemo() {
    const [presetId, setPresetId] = useState("amber")
    const [overrides, setOverrides] = useState<Partial<TrailingCursorDemoConfig>>({})

    const config = useMemo(
        () =>
            mergeDeep(
                mergeDeep(TRAILING_CURSOR_DEFAULTS, TRAILING_CURSOR_PRESET_VALUES[presetId] ?? {}),
                overrides,
            ),
        [presetId, overrides],
    )

    const editCount = useMemo(() => countOverrides(overrides), [overrides])

    const update = useCallback<ChangeHandler>((path, value) => {
        setOverrides((prev) => setPath(prev, path, value))
    }, [])

    const applyPreset = useCallback((id: string) => {
        if (!TRAILING_CURSOR_PRESET_VALUES[id]) return
        setPresetId(id)
    }, [])

    return (
        <div className="pg-fixed pg-cursor-root">
            <TrailingCursor
                preset={config.preset as PointerFxPreset}
                variant={config.variant}
                dotColor={config.dotColor || undefined}
                ringColor={config.ringColor || undefined}
                ringBorderColor={config.ringBorderColor || undefined}
                dotSize={config.dotSize}
                ringSize={config.ringSize}
                ringHoverSize={config.ringHoverSize}
                ringPressSize={config.ringPressSize}
                ease={config.ease}
                hideNativeCursor={config.hideNativeCursor}
                mixBlendMode={config.mixBlendMode as CSSProperties["mixBlendMode"]}
            />

            <div className="pg-cursor-stage">
                <header className="pg-cursor-head">
                    <h1>TrailingCursor</h1>
                    <p>The ring lags behind the dot, grows over anything interactive and shrinks while pressed.</p>
                </header>

                <div className="pg-cursor-grid">
                    <button type="button" className="pg-cursor-card">
                        <strong>Interactive</strong>
                        <span>the ring grows here</span>
                    </button>

                    <div className="pg-cursor-card" data-cursor-label="Open">
                        <strong>data-cursor-label</strong>
                        <span>text inside the ring</span>
                    </div>

                    <div className="pg-cursor-card" data-cursor-scale="2">
                        <strong>data-cursor-scale</strong>
                        <span>ring doubles in size</span>
                    </div>

                    <div className="pg-cursor-card" data-cursor-color="#22d3ee">
                        <strong>data-cursor-color</strong>
                        <span>recoloured while hovering</span>
                    </div>

                    <div className="pg-cursor-card" data-cursor="hidden">
                        <strong>data-cursor=&quot;hidden&quot;</strong>
                        <span>both layers disappear</span>
                    </div>

                    <label className="pg-cursor-card">
                        <strong>A real input</strong>
                        <input type="text" placeholder="focus me with Tab" />
                    </label>
                </div>
            </div>

            <Panel
                component="TrailingCursor"
                subtitle="dot pinned to the pointer, ring that lags"
                groups={TRAILING_CURSOR_CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={TRAILING_CURSOR_DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={() => setOverrides({})}
                editCount={editCount}
                presets={TRAILING_CURSOR_PRESETS}
                presetId={presetId}
                onPreset={applyPreset}
            />
        </div>
    )
}
