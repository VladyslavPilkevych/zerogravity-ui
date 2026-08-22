"use client"

import { Diorama } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function DioramaPreview({ config }: PreviewApi) {
    const c = config as { parallax: number; blur: number; perspective: number; ease: number }

    return (
        <Diorama
            parallax={c.parallax}
            blur={c.blur}
            perspective={c.perspective}
            ease={c.ease}
            className="xpg-frame"
            background={
                <div className="xpg-diorama-far">
                    <h2>Distant subject</h2>
                    <p>Move the pointer to see more of this.</p>
                </div>
            }
            planes={[
                { content: <div className="xpg-leaves xpg-leaves-mid" />, depth: 0.45 },
                { content: <div className="xpg-leaves xpg-leaves-near" />, depth: 1 },
            ]}
        />
    )
}
