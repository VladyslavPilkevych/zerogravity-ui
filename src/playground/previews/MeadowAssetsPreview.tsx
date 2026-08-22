"use client"

import { MEADOW_VARIANT_SETS } from "@/lib/experimental"
import "@/lib/experimental/meadow/Meadow.css"
import "@/lib/experimental/meadow/variants/gallery.css"
import type { PreviewApi } from "@/docs/useDocsConfig"

const SURFACES: Record<string, string> = {
    day: "",
    night: "xp-meadow-night",
    space: "xp-meadow-space",
}

export function MeadowAssetsPreview({ config }: PreviewApi) {
    const surface = SURFACES[String(config.backdrop)] ?? ""

    return (
        <div className="xpg-assets">
            {MEADOW_VARIANT_SETS.map((set) => (
                <section key={set.group} className={`xp-meadow xp-assets-set ${surface}`.trim()}>
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
    )
}
