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

export function SplitFlapPreview({ config }: PreviewApi) {
    const c = config as unknown as SplitFlapDemoConfig
    const [wordIndex, setWordIndex] = useState(0)

    const deadline = useSyncExternalStore(subscribe, deadlineOnClient, deadlineOnServer)

    const shown = c.mode === "text" ? c.value || WORDS[wordIndex % WORDS.length] : ""
    const cells = c.mode === "text" ? Math.max(c.length, shown.length) : c.length

    return (
        <div className="pg-flap-stage">
            <SplitFlap
                value={shown}
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
                <button
                    type="button"
                    className="pg-flap-next"
                    onClick={() => setWordIndex((index) => index + 1)}
                >
                    Flip to the next word
                </button>
            ) : null}
        </div>
    )
}
