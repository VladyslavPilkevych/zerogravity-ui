"use client"

import { useState } from "react"

import type { PreviewApi } from "@/docs/useDocsConfig"
import { Dither, Tag, type DitherOrigin, type DitherVariant } from "@/lib"

import "../interface/interface.css"

const CARDS = [
    { id: "draft", name: "Draft", note: "Private to you while you work." },
    { id: "review", name: "Review", note: "Shared with your team for comments." },
    { id: "public", name: "Public", note: "Listed and open to anyone." },
]

export function DitherPreview({ config }: PreviewApi) {
    const c = config as {
        variant: DitherVariant
        cell: number
        density: number
        glow: number
        duration: number
        origin: DitherOrigin
        layer: "under" | "over"
        color: string
        active: boolean
    }
    const [picked, setPicked] = useState("review")

    return (
        <div className="ipg">
            <div className="ipg-tiles" role="radiogroup" aria-label="Visibility">
                {CARDS.map(({ id, name, note }) => (
                    <Dither
                        key={id}
                        as="label"
                        className="ipg-tile"
                        variant={c.variant}
                        cell={c.cell}
                        density={c.density}
                        glow={c.glow}
                        duration={c.duration}
                        origin={c.origin}
                        layer={c.layer}
                        color={c.color}
                        active={c.active}
                    >
                        <input
                            className="ipg-tile-input"
                            type="radio"
                            name="ipg-dither-visibility"
                            value={id}
                            checked={picked === id}
                            onChange={() => setPicked(id)}
                        />
                        <small>Visibility</small>
                        <strong>{name}</strong>
                        <span>{note}</span>
                        {picked === id ? (
                            <Tag className="ipg-tile-mark" status="success" variant="solid">
                                Selected
                            </Tag>
                        ) : null}
                    </Dither>
                ))}
            </div>
            <p className="ipg-hint" aria-hidden="true">
                {c.variant === "edge" ? "Edge" : "Sweep"}: hover a card or Tab to it
            </p>
        </div>
    )
}
