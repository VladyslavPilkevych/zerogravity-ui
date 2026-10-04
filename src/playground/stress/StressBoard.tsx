"use client"

import { useState } from "react"

import { Elemental, Meadow } from "@/lib"
import {
    Chroma,
    Drench,
    Lattice,
    Nimbus,
    Perseid,
    Prism,
    Quartz,
    Sonar,
    Undertow,
    UNDERTOW_DEMO_BACK,
    UNDERTOW_DEMO_FRONT,
} from "@/lib/experimental"

import "./stress.css"

const COPIES = [1, 2, 3] as const

export function StressBoard() {
    const [copies, setCopies] = useState<number>(1)
    const [canvases, setCanvases] = useState(true)
    const [scenes, setScenes] = useState(true)

    return (
        <main className="st-board">
            <header className="st-bar">
                <h1>Stress board</h1>
                <p>
                    Every expensive component on one screen. One shared frame clock drives all of
                    them, so the frame cost should not multiply with the count.
                </p>

                <div className="st-controls">
                    <fieldset>
                        <legend>Copies</legend>
                        {COPIES.map((count) => (
                            <label key={count}>
                                <input
                                    type="radio"
                                    name="copies"
                                    checked={copies === count}
                                    onChange={() => setCopies(count)}
                                />
                                {count}
                            </label>
                        ))}
                    </fieldset>

                    <label>
                        <input
                            type="checkbox"
                            checked={canvases}
                            onChange={(event) => setCanvases(event.currentTarget.checked)}
                        />
                        Canvas effects
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={scenes}
                            onChange={(event) => setScenes(event.currentTarget.checked)}
                        />
                        Scenes
                    </label>
                </div>
            </header>

            {Array.from({ length: copies }, (_, copy) => (
                <section key={copy} className="st-grid">
                    {canvases ? (
                        <>
                            <Lattice className="st-cell" />
                            <Chroma className="st-cell" />
                            <Sonar className="st-cell" />
                            <Nimbus className="st-cell" />
                            <Perseid className="st-cell" count={40} />
                            <Drench className="st-cell" text="LOAD" />
                            <Undertow
                                className="st-cell"
                                frontSrc={UNDERTOW_DEMO_FRONT}
                                backSrc={UNDERTOW_DEMO_BACK}
                                alt="A meadow, noon over midnight"
                                aspect="16 / 10"
                            />
                        </>
                    ) : null}

                    <Quartz className="st-cell">
                        <div className="st-face">Quartz</div>
                    </Quartz>

                    <Prism className="st-cell">
                        <div className="st-face">Prism</div>
                    </Prism>

                    <Elemental className="st-cell" variant="electric">
                        <div className="st-face">Elemental</div>
                    </Elemental>

                    {scenes ? (
                        <Meadow className="st-cell st-wide">
                            <span className="st-face">Meadow</span>
                        </Meadow>
                    ) : null}
                </section>
            ))}
        </main>
    )
}
