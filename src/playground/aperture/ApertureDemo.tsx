"use client"

import { useCallback, useMemo, useState } from "react"

import { Aperture } from "@/lib/aperture"

import { Panel } from "../panel/Panel"
import { countOverrides, mergeDeep } from "../panel/overrides"
import { setPath } from "../panel/path"
import type { ChangeHandler } from "../panel/types"
import {
    APERTURE_CONTROLS,
    APERTURE_DEFAULTS,
    APERTURE_PRESETS,
    APERTURE_PRESET_VALUES,
    type ApertureDemoConfig,
} from "./schema"

export function ApertureDemo() {
    const [presetId, setPresetId] = useState("close")
    const [overrides, setOverrides] = useState<Partial<ApertureDemoConfig>>({})
    const [progress, setProgress] = useState(0)

    const config = useMemo(
        () =>
            mergeDeep(
                mergeDeep(APERTURE_DEFAULTS, APERTURE_PRESET_VALUES[presetId] ?? {}),
                overrides,
            ),
        [presetId, overrides],
    )

    const editCount = useMemo(() => countOverrides(overrides), [overrides])

    const update = useCallback<ChangeHandler>((path, value) => {
        setOverrides((prev) => setPath(prev, path, value))
    }, [])

    const applyPreset = useCallback((id: string) => {
        if (!APERTURE_PRESET_VALUES[id]) return
        setPresetId(id)
    }, [])

    return (
        <div className="pg-scroll-root">
            <section className="pg-intro">
                <h1>Aperture</h1>
                <p>
                    A full-bleed panel that closes into a framed card as you scroll — or the other
                    way round.
                </p>
                <span className="pg-scroll-hint">scroll ↓</span>
            </section>

            <Aperture
                height={config.height}
                inset={config.inset}
                radius={config.radius}
                direction={config.direction}
                scale={config.scale}
                dim={config.dim}
                dimColor={config.dimColor}
                easing={config.easing}
                disabled={config.disabled}
                onProgress={setProgress}
            >
                <div className="pg-aperture-panel">
                    <span className="pg-card-index">clip-path, not width</span>
                    <h2>The frame closes</h2>
                    <p>The content never rescales the layout — only the visible window changes.</p>
                </div>
            </Aperture>

            <section className="pg-outro">
                <h2>And out again</h2>
                <p>Scroll back up and the frame reopens along exactly the same curve.</p>
            </section>

            <Panel
                component="Aperture"
                subtitle="scroll-driven framing"
                groups={APERTURE_CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={APERTURE_DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={() => setOverrides({})}
                editCount={editCount}
                presets={APERTURE_PRESETS}
                presetId={presetId}
                onPreset={applyPreset}
                badge={Math.round(progress * 100)}
                badgeLabel="%"
            />
        </div>
    )
}
