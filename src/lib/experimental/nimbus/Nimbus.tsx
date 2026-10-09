"use client"

import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react"

import {
    context2d,
    cx,
    damp,
    finite,
    noiseTile,
    onResize,
    onVisible,
    pointerBox,
    useLatestRef,
    useMediaQuery,
    usePrefersReducedMotion,
    wakeLoop,
} from "../../internal"
import {
    resolveNimbus,
    sceneKey,
    type NimbusPreset,
    type NimbusScene,
    type NimbusTuning,
} from "./presets"
import { bufferSize, createField, createRenderer, type Pointer } from "./render"
import "./Nimbus.css"

export interface NimbusProps extends Partial<NimbusTuning> {
    children?: ReactNode
    /** the look everything else starts from */
    preset?: NimbusPreset
    /** one palette for the fog, replacing the preset's scenes */
    colors?: readonly string[]
    /** several moods that crossfade slowly; wins over `colors` */
    scenes?: readonly NimbusScene[]
    /** the colour of dust, rays and sweeps in every scene */
    accent?: string
    seed?: number
    /** hold the field at this many seconds in, for stills and screenshots */
    time?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

let grainUrl: string | null | undefined

function grainTile(): string | null {
    if (grainUrl === undefined && typeof document !== "undefined") {
        grainUrl = noiseTile(document.createElement("canvas"), { size: 128, seed: 5 })
    }
    return grainUrl ?? null
}

export function Nimbus({
    children,
    preset,
    colors,
    scenes,
    accent,
    motion,
    parallax,
    density,
    lighting,
    grain,
    scrim,
    intensity,
    speed,
    seed = 9,
    time,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: NimbusProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const grainRef = useRef<HTMLDivElement>(null)
    const repaint = useRef<(() => void) | null>(null)

    const reduced = usePrefersReducedMotion()
    const fine = useMediaQuery("(pointer: fine)")
    const frozen = time !== undefined
    const still = disabled || frozen || (respectReducedMotion && reduced)

    const config = resolveNimbus({
        preset,
        colors,
        scenes,
        accent,
        motion,
        parallax,
        density,
        lighting,
        grain,
        scrim,
        intensity,
        speed,
    })
    const settings = useLatestRef(config)
    const key = useMemo(() => sceneKey(config.scenes), [config.scenes])
    const pixel = config.dither > 0
    const interactive = !still && fine && config.parallax > 0
    const startAt = Math.max(0, finite(time, 0))
    const fieldSeed = Math.round(finite(seed, 9))

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const context = context2d(canvas, pixel ? { willReadFrequently: true } : undefined)
        if (!context) return

        const renderer = createRenderer(context, settings.current.scenes, createField(fieldSeed))
        const pointer: Pointer = { x: 0, y: 0 }
        const target: Pointer = { x: 0, y: 0 }
        let clock = startAt
        let pending = 0
        let visible = true

        const measure = () => {
            const box = host.getBoundingClientRect()
            const size = bufferSize(box.width, box.height, settings.current.cell)
            if (canvas.width !== size.width) canvas.width = size.width
            if (canvas.height !== size.height) canvas.height = size.height
            renderer.resize(size.width, size.height)
        }

        const paint = () => renderer.paint(clock, settings.current, pointer)

        measure()
        paint()
        repaint.current = paint

        const loop = wakeLoop((dt) => {
            if (!visible) return false
            pending += dt
            const current = settings.current
            // a little slack, so 30 a second lands on every second 60 Hz frame
            if (pending < 1 / current.fps - 0.004) return
            pointer.x = damp(pointer.x, target.x, 2.2, pending)
            pointer.y = damp(pointer.y, target.y, 2.2, pending)
            clock += pending * current.speed
            pending = 0
            paint()
        })

        const stopResize = onResize(host, () => {
            measure()
            paint()
        })
        const stopVisible = onVisible(host, (seen) => {
            visible = seen
            if (seen && !still) loop.wake()
        })

        let box: ReturnType<typeof pointerBox> | null = null
        const move = (event: PointerEvent) => {
            const at = box?.at(event)
            if (!at) return
            target.x = Math.max(-0.5, Math.min(0.5, at.x - 0.5))
            target.y = Math.max(-0.5, Math.min(0.5, at.y - 0.5))
        }
        const leave = () => {
            target.x = 0
            target.y = 0
        }
        if (interactive) {
            box = pointerBox(host)
            host.addEventListener("pointermove", move, { passive: true })
            host.addEventListener("pointerleave", leave)
        }

        if (!still) loop.wake()

        return () => {
            repaint.current = null
            loop.sleep()
            stopResize()
            stopVisible()
            if (box) {
                host.removeEventListener("pointermove", move)
                host.removeEventListener("pointerleave", leave)
                box.dispose()
            }
        }
    }, [settings, key, pixel, still, interactive, startAt, fieldSeed])

    // a held frame still answers a knob that changed; a live one picks it up next paint
    const { motion: m, density: d, lighting: l, intensity: i } = config
    useEffect(() => {
        if (still) repaint.current?.()
    }, [still, m, d, l, i])

    const grained = config.grain > 0
    useEffect(() => {
        const layer = grainRef.current
        const url = grained ? grainTile() : null
        if (layer && url) layer.style.backgroundImage = `url(${url})`
    }, [grained])

    const sky = config.scenes[0].sky
    const rootStyle = {
        "--xp-nimbus-ground": sky[1],
        "--xp-nimbus-scrim": config.scrim,
        "--xp-nimbus-grain": config.grain,
        ...style,
    } as CSSProperties

    return (
        <div
            ref={hostRef}
            className={cx("xp-nimbus", className)}
            data-preset={config.preset}
            data-still={still ? "true" : undefined}
            data-pixel={pixel ? "true" : undefined}
            data-interactive={interactive ? "true" : undefined}
            style={rootStyle}
        >
            <canvas
                key={pixel ? "pixel" : "soft"}
                ref={canvasRef}
                className="xp-nimbus-sky"
                aria-hidden="true"
            />
            {config.scrim > 0 ? <div className="xp-nimbus-scrim" aria-hidden="true" /> : null}
            {grained ? <div ref={grainRef} className="xp-nimbus-grain" aria-hidden="true" /> : null}
            {children ? <div className="xp-nimbus-content">{children}</div> : null}
        </div>
    )
}
