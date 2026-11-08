"use client"

import { Folio, FolioPanel } from "@/lib"
import type { FolioVariant } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

const PANELS = [
    { name: "Harbour", note: "Waterfront wayfinding", hue: 208 },
    { name: "Field", note: "Seasonal identity", hue: 96 },
    { name: "Ember", note: "Restaurant interiors", hue: 18 },
    { name: "Dusk", note: "Night-time campaign", hue: 268 },
    { name: "Atlas", note: "Map and print series", hue: 172 },
]

export function FolioPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        variant: FolioVariant
        height: number
        gap: number
        grow: number
        duration: number
        disabled: boolean
    }

    return (
        <div className="xpg-folio">
            <Folio
                label="Projects"
                variant={c.variant}
                className="xpg-folio-strip"
                height={c.height}
                gap={c.gap}
                grow={c.grow}
                duration={c.duration}
                disabled={c.disabled}
            >
                {PANELS.map((panel) => (
                    <FolioPanel
                        key={panel.name}
                        label={panel.name}
                        media={
                            <div
                                className="xpg-folio-art"
                                style={{ ["--hue" as string]: panel.hue }}
                            />
                        }
                    >
                        {(open) => (
                            <a
                                className="xpg-folio-caption"
                                data-variant={c.variant}
                                data-open={open ? "" : undefined}
                                href={`#${panel.name.toLowerCase()}`}
                                onClick={(event) => event.preventDefault()}
                            >
                                <strong>{panel.name}</strong>
                                <span>{panel.note}</span>
                            </a>
                        )}
                    </FolioPanel>
                ))}
            </Folio>
        </div>
    )
}
