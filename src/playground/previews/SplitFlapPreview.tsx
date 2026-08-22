"use client"

import { useState, useSyncExternalStore } from "react"

import { SplitFlap } from "@/lib/split-flap"
import type { PreviewApi } from "@/docs/useDocsConfig"

import type { SplitFlapDemoConfig } from "../split-flap/schema"

let stamped: number | undefined

function subscribe() {
    return () => {}
}

/** Read once on the client, so the countdown never differs from the server render. */
function deadlineOnClient(): number | undefined {
    stamped ??= Date.now() + 1000 * 60 * 12
    return stamped
}

function deadlineOnServer(): number | undefined {
    return undefined
}

const WORDS = ["DEPARTURES", "NOW BOARDING", "GATE OPEN", "ANTIGRAVITY", "ZEROGRAVITY"]

function nextNumber(value: string): string {
    const next = (Number(value) + 1) % 10 ** value.length
    return String(next).padStart(value.length, "0")
}

export function SplitFlapPreview({ config, set }: PreviewApi) {
    const c = config as unknown as SplitFlapDemoConfig
    const [word, setWord] = useState(0)

    const deadline = useSyncExternalStore(subscribe, deadlineOnClient, deadlineOnServer)

    const numeric = c.mode === "text" && /^\d+$/.test(c.value)
    const cells = c.mode === "text" ? Math.max(c.length, c.value.length) : c.length

    const advance = () => {
        if (numeric) {
            set("value", nextNumber(c.value))
            return
        }
        const index = (word + 1) % WORDS.length
        setWord(index)
        set("value", WORDS[index])
    }

    return (
        <div className="pg-flap-stage">
            <SplitFlap
                value={c.mode === "text" ? c.value : ""}
                mode={c.mode}
                target={deadline}
                length={cells}
                stepDuration={c.stepDuration}
                stagger={c.stagger}
                gap={c.gap}
                charWidth={c.charWidth}
                charHeight={c.charHeight}
                fontSize={c.fontSize}
                color={c.color}
                background={c.background}
                radius={c.radius}
            />

            {c.mode === "text" ? (
                <button type="button" className="pg-flap-next" onClick={advance}>
                    {numeric ? "Count up" : "Flip to the next word"}
                </button>
            ) : null}
        </div>
    )
}
