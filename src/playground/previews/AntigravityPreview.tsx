"use client"

import { useRef, useState } from "react"

import {
    Antigravity,
    type AntigravityConfig,
    type AntigravityHandle,
    type AntigravityStats,
} from "@/lib/antigravity"
import type { PreviewApi } from "@/docs/useDocsConfig"

import { randomAntigravityOptions } from "../antigravity/random"

export function AntigravityPreview({ config, replace }: PreviewApi) {
    const [stats, setStats] = useState<AntigravityStats | null>(null)
    const fieldRef = useRef<AntigravityHandle>(null)

    return (
        <div className="pg-fixed">
            <div className="pg-stage">
                <Antigravity
                    {...(config as unknown as AntigravityConfig)}
                    ref={fieldRef}
                    onStats={setStats}
                />
            </div>

            <div className="pg-overlay">
                <div className="pg-overlay-actions">
                    <button
                        type="button"
                        onClick={() =>
                            replace(randomAntigravityOptions() as Record<string, unknown>)
                        }
                    >
                        Random
                    </button>
                    <button type="button" onClick={() => fieldRef.current?.burst()}>
                        Burst
                    </button>
                    <button type="button" onClick={() => fieldRef.current?.colorBurst()}>
                        Recolour
                    </button>
                </div>
                {stats ? (
                    <div className="pg-overlay-stats">
                        <span>
                            <b>{Math.round(stats.fps)}</b> fps
                        </span>
                        <span>
                            <b>{stats.drawn.toLocaleString("en-US")}</b> drawn
                        </span>
                        <span>
                            <b>{stats.batches}</b> batches
                        </span>
                        <span>
                            <b>{stats.frameMs.toFixed(2)}</b> ms
                        </span>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
