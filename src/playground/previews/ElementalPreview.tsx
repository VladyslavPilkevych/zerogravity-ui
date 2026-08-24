"use client"

import { Elemental, ELEMENTAL_VARIANTS } from "@/lib"
import type { ElementalVariant } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

const BLURB: Record<ElementalVariant, string> = {
    electric: "Unstable energy running the edge",
    fire: "A warm edge that keeps burning",
    // frost: "Ice forming along the border",
    // water: "Liquid flowing around the frame",
}

export function ElementalPreview({ config, set }: PreviewApi) {
    const c = config as unknown as {
        variant: ElementalVariant
        color: string | null
        intensity: number
        speed: number
        radius: number
        particles: boolean
        cursorEffect: boolean
    }

    const shared = {
        color: c.color || undefined,
        intensity: c.intensity,
        speed: c.speed,
        particles: c.particles,
    }

    return (
        <div className="xpg-el">
            <Elemental
                {...shared}
                variant={c.variant}
                radius={c.radius}
                cursorEffect={c.cursorEffect}
                className="xpg-el-main"
            >
                <div className="xpg-el-face">
                    <strong>{c.variant}</strong>
                    <span>{BLURB[c.variant]}</span>
                </div>
            </Elemental>

            <div className="xpg-el-row" role="group" aria-label="Variant">
                {ELEMENTAL_VARIANTS.map((name) => (
                    <button
                        key={name}
                        type="button"
                        className="xpg-el-pick"
                        aria-pressed={name === c.variant}
                        onClick={() => set("variant", name)}
                    >
                        <Elemental
                            {...shared}
                            variant={name}
                            radius={10}
                            intensity={name === c.variant ? c.intensity : c.intensity * 0.7}
                            className="xpg-el-chip"
                        >
                            <span className="xpg-el-label">{name}</span>
                        </Elemental>
                    </button>
                ))}
            </div>
        </div>
    )
}
