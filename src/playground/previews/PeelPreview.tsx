"use client"

import { Peel } from "@/lib/experimental"
import type { PeelCorner } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint, ScrollPort } from "./parts"

export function PeelPreview({ config }: PreviewApi) {
    const c = config as unknown as { corner: PeelCorner; travel: number; curl: number }

    return (
        <ScrollPort>
            {(port) => (
                <>
                    <div className="pg-lead pg-lead-short">
                        <Hint>Scroll</Hint>
                    </div>

                    <Peel
                        scrollContainer={port}
                        height="100cqh"
                        corner={c.corner}
                        travel={c.travel}
                        curl={c.curl}
                        front={<div className="xpg-peel-front">Cover</div>}
                        back={<div className="xpg-peel-back">Underneath</div>}
                    />

                    <div className="pg-lead pg-lead-short" />
                </>
            )}
        </ScrollPort>
    )
}
