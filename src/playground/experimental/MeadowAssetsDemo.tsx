"use client"

import { useState } from "react"

import { MEADOW_VARIANT_SETS } from "@/lib/experimental"
import "@/lib/experimental/meadow/Meadow.css"
import "@/lib/experimental/meadow/variants/gallery.css"

import { Stage } from "./Stage"

const BACKDROPS = [
    { id: "day", label: "Day", surface: "" },
    { id: "night", label: "Night", surface: "xp-meadow-night" },
    { id: "space", label: "Space", surface: "xp-meadow-space" },
] as const

export function MeadowAssetsDemo() {
    const [backdrop, setBackdrop] = useState<string>("day")
    const surface = BACKDROPS.find((entry) => entry.id === backdrop)?.surface ?? ""

    return (
        <Stage
            title="Meadow assets"
            blurb="candidate artwork for review — none of it is wired into the live scene yet"
            scroll
        >
            <div className="xpg-assets">
                <div className="xpg-assets-bar">
                    <span>Backdrop</span>
                    {BACKDROPS.map((entry) => (
                        <button
                            key={entry.id}
                            type="button"
                            className="xpg-assets-pick"
                            aria-pressed={backdrop === entry.id}
                            onClick={() => setBackdrop(entry.id)}
                        >
                            {entry.label}
                        </button>
                    ))}
                </div>

                {MEADOW_VARIANT_SETS.map((set) => (
                    <section
                        key={set.group}
                        className={`xp-meadow xp-assets-set ${surface}`.trim()}
                    >
                        <div className="xp-assets-head">
                            <h3>{set.title}</h3>
                            <p>{set.blurb}</p>
                        </div>
                        <div className="xp-assets-grid">
                            {set.variants.map((variant) => (
                                <figure key={variant.id} className="xp-assets-tile">
                                    <div className="xp-assets-art">
                                        <variant.Art />
                                    </div>
                                    <figcaption>
                                        <strong>{variant.label}</strong>
                                        <small>{variant.note}</small>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </Stage>
    )
}
