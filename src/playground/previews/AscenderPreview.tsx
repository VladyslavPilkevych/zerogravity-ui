"use client"

import { useState } from "react"

import { Ascender } from "@/lib"
import type { AscenderTrigger } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function AscenderPreview({ config, editCount }: PreviewApi) {
    const c = config as unknown as {
        text: string
        trigger: AscenderTrigger
        replay: boolean
        stagger: number
        duration: number
        delay: number
    }
    const [run, setRun] = useState(0)

    return (
        <div className="xpg-ascender">
            <Ascender
                key={`${editCount}-${run}`}
                as="h2"
                className="xpg-ascender-line"
                text={c.text || "Every word arrives on its own beat"}
                trigger={c.trigger}
                replay={c.replay}
                stagger={c.stagger}
                duration={c.duration}
                delay={c.delay}
            />
            <button type="button" className="xpg-ascender-replay" onClick={() => setRun(run + 1)}>
                Replay
            </button>
        </div>
    )
}
