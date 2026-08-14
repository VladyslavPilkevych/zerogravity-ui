"use client"

import { useCallback, useMemo, useState } from "react"

import { SplitFlap } from "@/lib/split-flap"

import { Panel } from "../panel/Panel"
import { countOverrides, mergeDeep } from "../panel/overrides"
import { setPath } from "../panel/path"
import type { ChangeHandler } from "../panel/types"
import {
    SPLIT_FLAP_CONTROLS,
    SPLIT_FLAP_DEFAULTS,
    SPLIT_FLAP_PRESETS,
    SPLIT_FLAP_PRESET_VALUES,
    type SplitFlapDemoConfig,
} from "./schema"

const WORDS = ["DEPARTURES", "NOW BOARDING", "GATE OPEN", "ANTIGRAVITY", "ZEROGRAVITY"]

export function SplitFlapDemo() {
    const [presetId, setPresetId] = useState("board")
    const [overrides, setOverrides] = useState<Partial<SplitFlapDemoConfig>>({})
    const [wordIndex, setWordIndex] = useState(0)

    const config = useMemo(
        () =>
            mergeDeep(
                mergeDeep(SPLIT_FLAP_DEFAULTS, SPLIT_FLAP_PRESET_VALUES[presetId] ?? {}),
                overrides,
            ),
        [presetId, overrides],
    )

    const editCount = useMemo(() => countOverrides(overrides), [overrides])
    const [deadline] = useState(() => Date.now() + 1000 * 60 * 12)

    const update = useCallback<ChangeHandler>((path, value) => {
        setOverrides((prev) => setPath(prev, path, value))
    }, [])

    const applyPreset = useCallback((id: string) => {
        if (!SPLIT_FLAP_PRESET_VALUES[id]) return
        setPresetId(id)
    }, [])

    const shown = config.mode === "text" ? (overrides.value ?? WORDS[wordIndex % WORDS.length]) : ""
    const cells = config.mode === "text" ? Math.max(config.length, shown.length) : config.length

    return (
        <div className="pg-fixed pg-flap-root">
            <div className="pg-flap-stage">
                <header className="pg-flap-head">
                    <h1>SplitFlap</h1>
                    <p>
                        Airport board halves that flip a character at a time. Time, a countdown, or
                        any word.
                    </p>
                </header>

                <SplitFlap
                    value={shown}
                    mode={config.mode}
                    target={deadline}
                    length={cells}
                    stepDuration={config.stepDuration}
                    stagger={config.stagger}
                    gap={config.gap}
                    charWidth={config.charWidth}
                    charHeight={config.charHeight}
                    fontSize={config.fontSize}
                    color={config.color}
                    background={config.background}
                    radius={config.radius}
                />

                {config.mode === "text" ? (
                    <button
                        type="button"
                        className="pg-flap-next"
                        onClick={() => setWordIndex((i) => i + 1)}
                    >
                        Flip to the next word
                    </button>
                ) : null}
            </div>

            <Panel
                component="SplitFlap"
                subtitle="split-flap departure board"
                groups={SPLIT_FLAP_CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={SPLIT_FLAP_DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={() => setOverrides({})}
                editCount={editCount}
                presets={SPLIT_FLAP_PRESETS}
                presetId={presetId}
                onPreset={applyPreset}
                omit={["value"]}
            />
        </div>
    )
}
