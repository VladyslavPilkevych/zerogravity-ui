"use client"

import { useState } from "react"

import { Ricochet } from "@/lib/experimental"
import type { RicochetVariant } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const PRESETS = ["404", "LOST", "OOPS"] as const

const DEFAULTS = {
    text: "404",
    variant: "neon",
    pixelSize: 26,
    speed: 1,
    color: "#f6a94b",
    ballColor: "#fdf3e3",
    paddleColor: "#6fd6e8",
    autoStart: true,
    hideCursor: true,
}

const CONTROLS: ControlGroup[] = [
    {
        id: "scene",
        title: "Scene",
        hint: "what gets knocked apart",
        open: true,
        controls: [
            { kind: "select", path: "text", label: "Text", options: PRESETS },
            {
                kind: "select",
                path: "variant",
                label: "Variant",
                options: ["neon", "mono", "soft"],
            },
            { kind: "number", path: "pixelSize", label: "Pixel size", min: 8, max: 48, step: 2 },
        ],
    },
    {
        id: "play",
        title: "Play",
        hint: "pace and colours",
        open: true,
        controls: [
            { kind: "number", path: "speed", label: "Speed", min: 0.4, max: 2.5, step: 0.1 },
            { kind: "color", path: "color", label: "Blocks" },
            { kind: "color", path: "ballColor", label: "Ball" },
            { kind: "color", path: "paddleColor", label: "Paddle" },
            { kind: "boolean", path: "autoStart", label: "Auto start" },
            { kind: "boolean", path: "hideCursor", label: "Hide cursor" },
        ],
    },
]

export function RicochetDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)
    const [run, setRun] = useState(0)
    const [cleared, setCleared] = useState(false)

    const restart = () => {
        setCleared(false)
        setRun((count) => count + 1)
    }

    return (
        <>
            <Stage title="Ricochet" blurb="knock the text apart, arcade style">
                <div className="xpg-ricochet">
                    <div className="xpg-ricochet-actions">
                        {PRESETS.map((preset) => (
                            <button
                                key={preset}
                                type="button"
                                className="xpg-ricochet-preset"
                                aria-pressed={config.text === preset}
                                onClick={() => {
                                    update("text", preset)
                                    restart()
                                }}
                            >
                                {preset}
                            </button>
                        ))}
                        <button type="button" className="xpg-ricochet-preset" onClick={restart}>
                            Restart
                        </button>
                    </div>

                    <Ricochet
                        key={`${run}-${config.text}`}
                        text={config.text}
                        variant={config.variant as RicochetVariant}
                        pixelSize={config.pixelSize}
                        speed={config.speed}
                        color={config.color}
                        ballColor={config.ballColor}
                        paddleColor={config.paddleColor}
                        autoStart={config.autoStart}
                        hideCursor={config.hideCursor}
                        onClear={() => setCleared(true)}
                        className="xpg-ricochet-game"
                    />

                    <div className="xpg-ricochet-copy">
                        <span className="xpg-ricochet-eyebrow">
                            {cleared ? "cleared" : "page not found"}
                        </span>
                        <p>
                            {cleared
                                ? "Every block is gone. Restart to build the text again."
                                : "Move the pointer to steer the paddle. The ball chews through the text one pixel block at a time."}
                        </p>
                    </div>
                </div>
            </Stage>

            <Panel
                component="Ricochet"
                subtitle="destructible pixel text"
                groups={CONTROLS}
                config={config as unknown as Record<string, unknown>}
                defaults={DEFAULTS as unknown as Record<string, unknown>}
                onChange={update}
                onReset={reset}
                editCount={editCount}
                actions={[{ label: "Restart", onClick: restart }]}
            />
        </>
    )
}
