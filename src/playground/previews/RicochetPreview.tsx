"use client"

import { useState } from "react"

import { Ricochet } from "@/lib/experimental"
import type { RicochetMode, RicochetVariant } from "@/lib/experimental"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function RicochetPreview({ config }: PreviewApi) {
    const c = config as unknown as {
        text: string
        game: RicochetMode
        variant: RicochetVariant
        pixelSize: number
        speed: number
        powerUps: boolean
        powerUpChance: number
        shotSpeed: number
        fireRate: number
        shipSpeed: number
        color: string
        ballColor: string
        paddleColor: string
        autoStart: boolean
        hideCursor: boolean
    }

    const [run, setRun] = useState(0)
    const [cleared, setCleared] = useState(false)

    return (
        <div className="xpg-ricochet">
            <Ricochet
                key={`${run}-${c.text}-${c.game}`}
                text={c.text}
                game={c.game}
                variant={c.variant}
                pixelSize={c.pixelSize}
                speed={c.speed}
                powerUps={c.powerUps}
                powerUpChance={c.powerUpChance}
                shotSpeed={c.shotSpeed}
                fireRate={c.fireRate}
                shipSpeed={c.shipSpeed}
                color={c.color}
                ballColor={c.ballColor}
                paddleColor={c.paddleColor}
                autoStart={c.autoStart}
                hideCursor={c.hideCursor}
                onClear={() => setCleared(true)}
                className="xpg-ricochet-game"
            />

            <div className="xpg-ricochet-foot">
                <span className="xpg-ricochet-eyebrow">
                    {cleared ? "cleared" : "knock the text apart"}
                </span>
                <button
                    type="button"
                    className="xpg-ricochet-restart"
                    onClick={() => {
                        setCleared(false)
                        setRun((count) => count + 1)
                    }}
                >
                    Restart
                </button>
            </div>
        </div>
    )
}
