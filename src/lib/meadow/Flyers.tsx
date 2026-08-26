"use client"

import { useEffect, useMemo, useRef, type CSSProperties, type RefObject } from "react"

import { rngFor } from "../internal"
import {
    abductionLift,
    beginEvent,
    createLife,
    settleLife,
    stepLife,
    type EventName,
    type EventPace,
    type LifeConfig,
    type Pointer,
} from "./life"
import { MEADOW_BEES, MEADOW_BUTTERFLIES } from "./wings"
import { UfoSaucer } from "./variants"

export interface FlyersProps {
    /** the scene root, which owns the single pointer listener */
    host: RefObject<HTMLElement | null>
    bees: number
    butterflies: number
    fireflies: number
    interactive: boolean
    avoid: boolean
    curious: boolean
    interactionRadius: number
    events: boolean
    pace: EventPace
    night: boolean
    still: boolean
    seed: number
}

/** Docs and stories ask for a named event by dispatching this on the root. */
const TRIGGER = "meadow:event"

const FRAME_CAP = 0.05

export function Flyers(props: FlyersProps) {
    const { host, bees, butterflies, fireflies, night, still, seed } = props

    const config = useMemo<LifeConfig>(
        () => ({
            bees,
            butterflies,
            curious: props.interactive && props.curious,
            avoid: props.interactive && props.avoid,
            interactionRadius: props.interactionRadius,
            events: props.events,
            pace: props.pace,
            night,
        }),
        [
            bees,
            butterflies,
            night,
            props.interactive,
            props.curious,
            props.avoid,
            props.interactionRadius,
            props.events,
            props.pace,
        ],
    )

    // one state object per configuration; the pool inside it is never resized
    const state = useMemo(() => createLife(config, seed), [config, seed])

    const nodes = useRef<(HTMLDivElement | null)[]>([])
    const beam = useRef<HTMLDivElement | null>(null)
    const saucer = useRef<HTMLDivElement | null>(null)
    const spark = useMemo(() => planFireflies(fireflies, seed), [fireflies, seed])

    useEffect(() => {
        const root = host.current
        if (!root) return
        if (still) {
            settleLife(state)
            paint(state, nodes.current, beam.current, saucer.current)
            return
        }

        const pointer: Pointer = { x: -999, y: -999, live: false }

        const onMove = (event: PointerEvent) => {
            if (event.pointerType === "touch") return
            const box = root.getBoundingClientRect()
            if (box.width === 0 || box.height === 0) return
            pointer.x = ((event.clientX - box.left) / box.width) * 100
            pointer.y = ((event.clientY - box.top) / box.height) * 100
            pointer.live = true
        }
        const onLeave = () => {
            pointer.live = false
        }

        const interactive = config.avoid || config.curious
        if (interactive) {
            root.addEventListener("pointermove", onMove, { passive: true })
            root.addEventListener("pointerleave", onLeave)
        }

        const onTrigger = (event: Event) => {
            const name = (event as CustomEvent<EventName>).detail
            if (name) beginEvent(state, name, config)
        }
        root.addEventListener(TRIGGER, onTrigger)

        let frame = 0
        let last = 0
        // wait for the observer to confirm the scene is on screen; without one
        // there is nothing to wait for
        let seen = typeof IntersectionObserver !== "function"

        const loop = (now: number) => {
            frame = requestAnimationFrame(loop)
            if (!seen) return

            const dt = last === 0 ? 0.016 : Math.min((now - last) / 1000, FRAME_CAP)
            last = now

            stepLife(state, dt, config, pointer)
            paint(state, nodes.current, beam.current, saucer.current)
        }

        frame = requestAnimationFrame(loop)

        // an offscreen meadow keeps its frame callback but does no work in it
        const watcher =
            typeof IntersectionObserver === "function"
                ? new IntersectionObserver(
                      ([entry]) => {
                          seen = entry.isIntersecting
                          if (seen) last = 0
                      },
                      { threshold: 0 },
                  )
                : null
        watcher?.observe(root)

        const onVisibility = () => {
            if (document.visibilityState === "visible") last = 0
        }
        document.addEventListener("visibilitychange", onVisibility)

        return () => {
            cancelAnimationFrame(frame)
            watcher?.disconnect()
            document.removeEventListener("visibilitychange", onVisibility)
            root.removeEventListener(TRIGGER, onTrigger)
            if (interactive) {
                root.removeEventListener("pointermove", onMove)
                root.removeEventListener("pointerleave", onLeave)
            }
        }
    }, [host, state, config, still])

    return (
        <div className="xp-meadow-life" aria-hidden="true">
            {state.flyers.map((flyer, index) => {
                const set = flyer.kind === "bee" ? MEADOW_BEES : MEADOW_BUTTERFLIES
                const variant = set[flyer.variant % set.length]

                return (
                    <div
                        key={index}
                        ref={(node) => {
                            nodes.current[index] = node
                        }}
                        className="xp-meadow-flyer"
                        data-kind={flyer.kind}
                        style={
                            {
                                "--m-size": variant.size,
                                "--m-flap": (1 / variant.flap).toFixed(3),
                            } as CSSProperties
                        }
                    >
                        {variant.art}
                    </div>
                )
            })}

            {spark.map((fly, index) => (
                <span
                    key={`spark-${index}`}
                    className="xp-meadow-firefly"
                    style={
                        {
                            "--m-x": fly.x,
                            "--m-y": fly.y,
                            "--m-size": fly.size,
                            "--m-beat": fly.beat,
                            "--m-delay": fly.delay,
                            "--m-tone": fly.tone,
                            "--m-reach": fly.reach,
                        } as CSSProperties
                    }
                />
            ))}

            <div ref={saucer} className="xp-meadow-abduct" data-on="false">
                <div ref={beam} className="xp-meadow-beam" />
                <div className="xp-meadow-saucer">
                    <UfoSaucer />
                </div>
            </div>
        </div>
    )
}

/** The only place the simulation touches the DOM. */
function paint(
    state: ReturnType<typeof createLife>,
    nodes: (HTMLDivElement | null)[],
    beam: HTMLDivElement | null,
    saucer: HTMLDivElement | null,
): void {
    const event = state.event
    const lift = event?.name === "ufoAbduction" ? abductionLift(event) : 0

    for (let index = 0; index < state.flyers.length; index += 1) {
        const node = nodes[index]
        if (!node) continue
        const flyer = state.flyers[index]

        let x = flyer.x
        let y = flyer.y
        let scale = 0.7 + flyer.depth * 0.6
        let alpha = flyer.alpha * (0.75 + flyer.depth * 0.25)

        if (event && event.subject === index && event.name === "ufoAbduction") {
            // ride the beam up into the saucer, shrinking as it goes
            x = flyer.x + (event.x - flyer.x) * lift
            y = flyer.y + (event.y + 4 - flyer.y) * lift
            scale *= 1 - lift * 0.75
            alpha *= 1 - Math.max(0, lift - 0.72) / 0.28
        }

        // never let the mirror collapse to zero width as it passes through
        const turn =
            flyer.kind === "bee"
                ? (flyer.face < 0 ? -1 : 1) * Math.max(0.35, Math.abs(flyer.face))
                : 1
        const tilt = flyer.kind === "bee" ? 0 : Math.sin(flyer.drift) * 9

        node.style.transform =
            `translate(${x.toFixed(2)}cqw, ${y.toFixed(2)}cqh)` +
            ` translate(-50%, -50%) rotate(${tilt.toFixed(1)}deg)` +
            ` scale(${(scale * turn).toFixed(3)}, ${scale.toFixed(3)})`
        node.style.opacity = alpha.toFixed(3)
    }

    if (saucer) {
        const on = event?.name === "ufoAbduction"
        saucer.dataset.on = on ? "true" : "false"
        if (on && event) {
            const entry = Math.min(1, event.age / 2.4)
            const exit = Math.max(0, (event.age - (event.span - 2.4)) / 2.4)
            const slide = (1 - entry) * -60 + exit * 60
            saucer.style.transform = `translate(${(event.x + slide).toFixed(2)}cqw, ${event.y.toFixed(2)}cqh) translate(-50%, -50%)`
            saucer.style.opacity = Math.min(entry, 1 - exit).toFixed(3)
        }
    }

    if (beam) {
        const on = event?.name === "ufoAbduction" && event.age > 2 && event.age < event.span - 2
        beam.style.opacity = on ? "0.5" : "0"
    }
}

interface Firefly {
    x: number
    y: number
    size: number
    beat: number
    delay: number
    tone: number
    reach: number
}

/**
 * Fireflies never interact, so they stay on CSS: a drift, a rise and a pulse,
 * all seeded. They cost nothing in the frame loop.
 */
function planFireflies(count: number, seed: number): Firefly[] {
    const out: Firefly[] = []

    for (let index = 0; index < count; index += 1) {
        const random = rngFor(seed + 137, index)

        // most sit far back and dim; a few come forward and read as bright
        const near = random() < 0.22

        out.push({
            x: Math.round(random() * 1000) / 10,
            y: Math.round((44 + random() * 52) * 10) / 10,
            size: near
                ? Math.round((4 + random() * 2.6) * 10) / 10
                : Math.round((2 + random() * 1.6) * 10) / 10,
            beat: Math.round((3.4 + random() * 4.6) * 10) / 10,
            delay: Math.round(random() * -80) / 10,
            tone: near ? 0.9 : Math.round((0.3 + random() * 0.3) * 100) / 100,
            reach: Math.round((6 + random() * 16) * 10) / 10,
        })
    }

    return out
}
