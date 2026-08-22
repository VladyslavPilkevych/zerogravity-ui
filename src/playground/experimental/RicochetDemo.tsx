"use client"

import { useState } from "react"

import { Ricochet } from "@/lib/experimental"
import type { RicochetMode, RicochetVariant } from "@/lib/experimental"
import { Panel } from "@/playground/panel/Panel"
import type { ControlGroup } from "@/playground/panel/types"

import { Stage } from "./Stage"
import { useExperiment } from "./useExperiment"

const PRESETS = ["404", "LOST", "OOPS"] as const

const GAMES: readonly { id: RicochetMode; label: string }[] = [
    { id: "breakout", label: "Breakout" },
    { id: "shooter", label: "Shooter" },
]

const COPY: Record<RicochetMode, string> = {
    breakout:
        "Move the pointer to steer the paddle. The ball chews through the text one pixel block at a time, and a rare bonus falls for the paddle to catch.",
    shooter:
        "Move the pointer to steer the ship and click or hold space to shoot. Every bolt takes out the block it reaches first.",
}

const DEFAULTS = {
    text: "404",
    game: "breakout",
    variant: "neon",
    pixelSize: 26,
    speed: 1,
    powerUps: true,
    powerUpChance: 0.05,
    shotSpeed: 1,
    fireRate: 5,
    shipSpeed: 1,
    color: "#f6a94b",
    ballColor: "#fdf3e3",
    paddleColor: "#6fd6e8",
    autoStart: true,
    hideCursor: true,
}

const SCENE: ControlGroup = {
    id: "scene",
    title: "Scene",
    hint: "what gets knocked apart",
    open: true,
    controls: [
        { kind: "select", path: "text", label: "Text", options: PRESETS },
        { kind: "select", path: "game", label: "Game", options: ["breakout", "shooter"] },
        { kind: "select", path: "variant", label: "Variant", options: ["neon", "mono", "soft"] },
        { kind: "number", path: "pixelSize", label: "Pixel size", min: 8, max: 48, step: 2 },
    ],
}

const BREAKOUT: ControlGroup = {
    id: "breakout",
    title: "Breakout",
    hint: "ball and bonuses",
    open: true,
    controls: [
        { kind: "number", path: "speed", label: "Ball speed", min: 0.4, max: 2.5, step: 0.1 },
        { kind: "boolean", path: "powerUps", label: "Power-ups" },
        {
            kind: "number",
            path: "powerUpChance",
            label: "Drop chance",
            min: 0,
            max: 0.5,
            step: 0.01,
        },
    ],
}

const SHOOTER: ControlGroup = {
    id: "shooter",
    title: "Shooter",
    hint: "ship and bolts",
    open: true,
    controls: [
        { kind: "number", path: "shotSpeed", label: "Shot speed", min: 0.4, max: 3, step: 0.1 },
        { kind: "number", path: "fireRate", label: "Fire rate", min: 1, max: 14, step: 1 },
        { kind: "number", path: "shipSpeed", label: "Ship speed", min: 0.4, max: 3, step: 0.1 },
    ],
}

const LOOK: ControlGroup = {
    id: "look",
    title: "Look",
    hint: "colours and start-up",
    open: false,
    controls: [
        { kind: "color", path: "color", label: "Blocks" },
        { kind: "color", path: "ballColor", label: "Ball" },
        { kind: "color", path: "paddleColor", label: "Paddle or ship" },
        { kind: "boolean", path: "autoStart", label: "Auto start" },
        { kind: "boolean", path: "hideCursor", label: "Hide cursor" },
    ],
}

export function RicochetDemo() {
    const { config, update, reset, editCount } = useExperiment(DEFAULTS)
    const [run, setRun] = useState(0)
    const [cleared, setCleared] = useState(false)

    const mode = config.game as RicochetMode

    const restart = () => {
        setCleared(false)
        setRun((count) => count + 1)
    }

    const pick = (next: RicochetMode) => {
        update("game", next)
        restart()
    }

    return (
        <>
            <Stage title="Ricochet" blurb="knock the text apart, arcade style">
                <div className="xpg-ricochet">
                    <div className="xpg-ricochet-actions">
                        <span className="xpg-ricochet-tag">Game</span>
                        {GAMES.map((entry) => (
                            <button
                                key={entry.id}
                                type="button"
                                className="xpg-ricochet-preset"
                                aria-pressed={mode === entry.id}
                                onClick={() => pick(entry.id)}
                            >
                                {entry.label}
                            </button>
                        ))}
                    </div>

                    <div className="xpg-ricochet-actions">
                        <span className="xpg-ricochet-tag">Text</span>
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
                        game={mode}
                        variant={config.variant as RicochetVariant}
                        pixelSize={config.pixelSize}
                        speed={config.speed}
                        powerUps={config.powerUps}
                        powerUpChance={config.powerUpChance}
                        shotSpeed={config.shotSpeed}
                        fireRate={config.fireRate}
                        shipSpeed={config.shipSpeed}
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
                                : COPY[mode]}
                        </p>
                    </div>
                </div>
            </Stage>

            <Panel
                component="Ricochet"
                subtitle="destructible pixel text"
                groups={[SCENE, mode === "shooter" ? SHOOTER : BREAKOUT, LOOK]}
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
