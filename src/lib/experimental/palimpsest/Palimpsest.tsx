"use client"

import { useEffect, useRef, type CSSProperties } from "react"

import {
    clamp,
    cx,
    damp,
    finite,
    onFrame,
    pointerBox,
    rngFor,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
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

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const count = Math.round(clamp(finite(layers, 4), 1, MAX_LAYERS))
    const tints = colors.length > 0 ? colors : PALIMPSEST_COLORS
    const settings = useLatestRef({ trigger, still })

    // one seeded direction per layer, so the decomposition is the same on every
    // render but never looks mechanical
    const drift = Array.from({ length: count }, (_, index) => {
        const random = rngFor(seed, index)
        return {
            x: (random() - 0.5) * 2,
            y: (random() - 0.5) * 2,
            turn: (random() - 0.5) * 2,
        }
    })

    useEffect(() => {
        const host = hostRef.current
        if (!host) return

        const box = pointerBox(host)
        let aim = settings.current.trigger === "always" ? 1 : 0
        let open = aim

        const write = () => host.style.setProperty("--pa-open", open.toFixed(4))
        write()

        const stop = onFrame((dt) => {
            const config = settings.current
            if (config.still) return
            if (config.trigger === "always") aim = 1
            if (Math.abs(aim - open) < 0.001) return
            open = damp(open, aim, 8, dt)
            write()
        })

        const onEnter = () => {
            if (settings.current.trigger === "pointer") aim = 1
        }
        const onLeave = () => {
            if (settings.current.trigger === "pointer") aim = 0
        }

        host.addEventListener("pointerenter", onEnter)
        host.addEventListener("pointerleave", onLeave)

        return () => {
            stop()
            host.removeEventListener("pointerenter", onEnter)
            host.removeEventListener("pointerleave", onLeave)
            box.dispose()
        }
    }, [settings])

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

            {/* the word itself, once, on top and in the accessibility tree */}
            <Tag className="xp-palimpsest-word">{text}</Tag>
        </div>
    )
}
