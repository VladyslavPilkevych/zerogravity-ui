"use client"

import { Lattice } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { Hint } from "./parts"

export function LatticePreview({ config }: PreviewApi) {
    const c = config as unknown as {
        gap: number
        strength: number
        radius: number
        color: string
        speed: number
        seed: number
    }

    return (
        <Lattice
            gap={c.gap}
            strength={c.strength}
            radius={c.radius}
            color={c.color}
            speed={c.speed}
            seed={c.seed}
            className="xpg-lattice"
        >
            <Hint>Push the mesh around</Hint>
        </Lattice>
    )
}
