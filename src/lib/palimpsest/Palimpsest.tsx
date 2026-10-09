"use client"

import { useEffect, useMemo, useRef, type CSSProperties } from "react"

import {
    clamp,
    cx,
    damp,
    finite,
    onFrame,
    rngFor,
    useLatestRef,
    usePrefersReducedMotion,
} from "../internal"
import "./Palimpsest.css"

export type PalimpsestTrigger = "pointer" | "always"

export interface PalimpsestProps {
    text: string
    /** how many ghost layers sit under the word, 1 to 8 */
    layers?: number
    /** how far they drift apart, in px */
    spread?: number
    /** the tints the layers are drawn in */
    colors?: readonly string[]
    /** what pulls the layers apart */
    trigger?: PalimpsestTrigger
    /** how far they turn, in degrees */
    rotation?: number
    /** the tag the real text is rendered as */
    as?: "span" | "h1" | "h2" | "h3" | "p"
    seed?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export const PALIMPSEST_COLORS: readonly string[] = ["#ff4d6d", "#4dd2ff", "#ffd166", "#9d7bff"]

const MAX_LAYERS = 8

interface PalimpsestEngine {
    sync(): void
}

export function Palimpsest({
    text,
    layers = 4,
    spread = 26,
    colors = PALIMPSEST_COLORS,
    trigger = "pointer",
    rotation = 4,
    as: Tag = "span",
    seed = 6,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: PalimpsestProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const engineRef = useRef<PalimpsestEngine | null>(null)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const count = Math.round(clamp(finite(layers, 4), 1, MAX_LAYERS))
    const tints = colors.length > 0 ? colors : PALIMPSEST_COLORS
    const settings = useLatestRef({ trigger, still })

    const drift = useMemo(
        () =>
            Array.from({ length: count }, (_, index) => {
                const random = rngFor(seed, index)
                return {
                    x: (random() - 0.5) * 2,
                    y: (random() - 0.5) * 2,
                    turn: (random() - 0.5) * 2,
                }
            }),
        [count, seed],
    )

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        let hovered = false
        let open = settings.current.trigger === "always" ? 1 : 0
        let stopFrame: (() => void) | null = null

        const write = () => host.style.setProperty("--pa-open", open.toFixed(4))
        const target = () => (settings.current.trigger === "always" || hovered ? 1 : 0)

        const sleep = () => {
            stopFrame?.()
            stopFrame = null
        }

        const tick = (dt: number) => {
            const aim = target()
            open = damp(open, aim, 8, dt)
            if (Math.abs(aim - open) < 0.001) {
                open = aim
                sleep()
            }
            write()
        }

        const sync = () => {
            if (settings.current.still) {
                sleep()
                open = target()
                write()
                return
            }
            if (!stopFrame && Math.abs(target() - open) >= 0.001) stopFrame = onFrame(tick)
        }

        const onEnter = () => {
            hovered = true
            sync()
        }
        const onLeave = () => {
            hovered = false
            sync()
        }

        write()
        host.addEventListener("pointerenter", onEnter)
        host.addEventListener("pointerleave", onLeave)
        engineRef.current = { sync }

        return () => {
            engineRef.current = null
            sleep()
            host.removeEventListener("pointerenter", onEnter)
            host.removeEventListener("pointerleave", onLeave)
        }
    }, [settings])

    useEffect(() => {
        engineRef.current?.sync()
    }, [trigger, still])

    return (
        <div
            ref={hostRef}
            className={cx("xp-palimpsest", className)}
            data-still={still ? "true" : undefined}
            style={
                {
                    ...style,
                    "--pa-spread": `${clamp(finite(spread, 26), 0, 200)}px`,
                    "--pa-turn": `${clamp(finite(rotation, 4), 0, 45)}deg`,
                } as CSSProperties
            }
        >
            <span className="xp-palimpsest-stack" aria-hidden="true">
                {drift.map((layer, index) => (
                    <span
                        key={index}
                        className="xp-palimpsest-ghost"
                        style={
                            {
                                "--pa-dx": layer.x.toFixed(3),
                                "--pa-dy": layer.y.toFixed(3),
                                "--pa-rot": layer.turn.toFixed(3),
                                "--pa-depth": ((index + 1) / count).toFixed(3),
                                color: tints[index % tints.length],
                            } as CSSProperties
                        }
                    >
                        {text}
                    </span>
                ))}
            </span>

            <Tag className="xp-palimpsest-word">{text}</Tag>
        </div>
    )
}
