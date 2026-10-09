"use client"

import Link from "next/link"

import type { PreviewApi } from "@/docs/useDocsConfig"
import { Dither, type DitherOrigin } from "@/lib"

import "../interface/interface.css"

const TARGETS = [
    { slug: "keycap", name: "Keycap", note: "A button with real press depth." },
    { slug: "bezel", name: "Bezel", note: "A pixel frame for any content." },
    { slug: "pip", name: "Pip", note: "Status badges drawn as glyphs." },
]

export function DitherPreview({ config }: PreviewApi) {
    const c = config as {
        cell: number
        density: number
        glow: number
        duration: number
        origin: DitherOrigin
        layer: "under" | "over"
        color: string
        active: boolean
    }

    return (
        <div className="ipg">
            <nav className="ipg-tiles" aria-label="Interface components">
                {TARGETS.map(({ slug, name, note }) => (
                    <Dither
                        key={slug}
                        as={Link}
                        href={`/docs/${slug}`}
                        className="ipg-tile"
                        cell={c.cell}
                        density={c.density}
                        glow={c.glow}
                        duration={c.duration}
                        origin={c.origin}
                        layer={c.layer}
                        color={c.color}
                        active={c.active}
                    >
                        <small>Interface</small>
                        <strong>{name}</strong>
                        <span>{note}</span>
                    </Dither>
                ))}
            </nav>
            <p className="ipg-hint" aria-hidden="true">
                Hover a block, or Tab to it
            </p>
        </div>
    )
}
