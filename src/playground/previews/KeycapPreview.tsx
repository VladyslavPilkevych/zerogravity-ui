"use client"

import { useState } from "react"

import type { PreviewApi } from "@/docs/useDocsConfig"
import { Keycap, type KeycapSize, type KeycapVariant } from "@/lib"

import "../interface/interface.css"

const VARIANTS: KeycapVariant[] = ["solid", "outline", "ghost"]

export function KeycapPreview({ config }: PreviewApi) {
    const c = config as {
        size: KeycapSize
        tone: string
        depth: number
        notch: number
        disabled: boolean
    }
    const [pressed, setPressed] = useState<KeycapVariant | null>(null)

    return (
        <div className="ipg">
            <div className="ipg-row">
                {VARIANTS.map((variant) => (
                    <Keycap
                        key={variant}
                        variant={variant}
                        size={c.size}
                        tone={c.tone}
                        depth={c.depth}
                        notch={c.notch}
                        disabled={c.disabled}
                        onClick={() => setPressed(variant)}
                    >
                        {variant}
                    </Keycap>
                ))}
            </div>
            <p className="ipg-readout" aria-live="polite">
                Last press: <b>{pressed ?? "none"}</b>
            </p>
        </div>
    )
}
