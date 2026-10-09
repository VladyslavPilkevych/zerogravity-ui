"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

import {
    clamp,
    context2d,
    cx,
    finite,
    fitCanvas,
    onFrame,
    onResize,
    pointerBox,
    useIsomorphicLayoutEffect,
    useLatestRef,
} from "../internal"
import { resolveColor, usePointerFxEnabled } from "../pointer-fx"
import { paintSheet } from "./sheet"
import "./Vellum.css"

export interface VellumHighlight {
    dent?: number
    sheen?: number
    color?: string
    sheenColor?: string
}

export type VellumSurface = "smooth" | "pixel"

export interface VellumPoint {
    x: number
    y: number
}

export interface VellumProps {
    children: ReactNode
    tilt?: number
    highlight?: boolean | VellumHighlight
    /** `pixel` draws the highlight as a stepped grid of square cells that pinches toward the dent */
    surface?: VellumSurface
    /** cell edge in px for the pixel surface */
    pixel?: number
    /** presses the sheet at a fixed point, 0 to 1 in its own box, instead of following the pointer */
    pointer?: VellumPoint
    radius?: number
    ease?: number
    perspective?: number
    disabled?: boolean
    enableOnTouch?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const HIGHLIGHT_DEFAULTS = {
    dent: 0.35,
    sheen: 0.5,
    color: "rgba(0, 0, 0, 1)",
    sheenColor: "rgba(255, 255, 255, 1)",
}

const SETTLED = 0.002

export function Vellum({
    children,
    tilt = 9,
    highlight = true,
    surface = "smooth",
    pixel = 12,
    pointer,
    radius = 22,
    ease = 0.14,
    perspective = 900,
    disabled = false,
    enableOnTouch = false,
    respectReducedMotion = true,
    className,
    style,
}: VellumProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const refreshRef = useRef<() => void>(() => {})
    const enabled = usePointerFxEnabled({ disabled, enableOnTouch, respectReducedMotion })

    const lighting =
        highlight === false
            ? null
            : { ...HIGHLIGHT_DEFAULTS, ...(highlight === true ? {} : highlight) }
    const pixelated = surface === "pixel" && lighting !== null
    const pinned = pointer
        ? {
              x: clamp(finite(pointer.x, 0.5), 0, 1),
              y: clamp(finite(pointer.y, 0.5), 0, 1),
          }
        : null
    const cell = clamp(finite(pixel, 12), 4, 48)

    const settings = useLatestRef({ ease, enabled, pinned, cell, lighting })

    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current
        if (!root) return

        const canvas = pixelated ? canvasRef.current : null
        const context = canvas ? context2d(canvas) : null
        const box = pointerBox(root)
        const home = () => {
            const fixed = settings.current.pinned
            return fixed ? { x: fixed.x, y: fixed.y, press: 1 } : { x: 0.5, y: 0.5, press: 0 }
        }
        const target = home()
        const at = { ...target }
        let size = canvas && context ? fitCanvas(canvas, root) : null
        let stopFrame: (() => void) | null = null
        let colors = { shadow: "", light: "", from: "", to: "" }
        let hovering = false

        const paint = () => {
            root.style.setProperty("--vellum-x", at.x.toFixed(4))
            root.style.setProperty("--vellum-y", at.y.toFixed(4))
            root.style.setProperty("--vellum-press", at.press.toFixed(4))

            const light = settings.current.lighting
            if (!context || !size || !light) return
            if (colors.from !== light.color || colors.to !== light.sheenColor) {
                colors = {
                    shadow: resolveColor(light.color, root),
                    light: resolveColor(light.sheenColor, root),
                    from: light.color,
                    to: light.sheenColor,
                }
            }
            paintSheet(context, size.width, size.height, size.dpr, {
                x: at.x,
                y: at.y,
                press: at.press,
                dent: finite(light.dent, HIGHLIGHT_DEFAULTS.dent),
                sheen: finite(light.sheen, HIGHLIGHT_DEFAULTS.sheen),
                cell: settings.current.cell,
                shadow: colors.shadow,
                light: colors.light,
            })
        }

        const settled = () =>
            Math.abs(target.x - at.x) < SETTLED &&
            Math.abs(target.y - at.y) < SETTLED &&
            Math.abs(target.press - at.press) < SETTLED

        const tick = (dt: number) => {
            const rate = Math.min(Math.max(finite(settings.current.ease, 0.14), 0.02), 1)
            const follow = 1 - Math.pow(1 - rate, dt * 60)
            at.x += (target.x - at.x) * follow
            at.y += (target.y - at.y) * follow
            at.press += (target.press - at.press) * follow
            if (settled()) {
                Object.assign(at, target)
                stopFrame?.()
                stopFrame = null
            }
            paint()
        }

        const wake = () => {
            if (settled()) {
                Object.assign(at, target)
                paint()
                return
            }
            if (!stopFrame) stopFrame = onFrame(tick)
        }

        const onMove = (event: PointerEvent) => {
            if (settings.current.pinned) return
            const point = box.at(event)
            if (!point) return
            target.x = point.x
            target.y = point.y
            target.press = 1
            hovering = true
            wake()
        }

        const onLeave = () => {
            hovering = false
            Object.assign(target, home())
            wake()
        }

        refreshRef.current = () => {
            if (!hovering || settings.current.pinned) Object.assign(target, home())
            if (!settings.current.enabled) Object.assign(at, target)
            wake()
            paint()
        }

        paint()

        const stopResize = onResize(root, () => {
            box.invalidate()
            if (canvas && context) size = fitCanvas(canvas, root)
            paint()
        })

        if (enabled) {
            root.addEventListener("pointermove", onMove, { passive: true })
            root.addEventListener("pointerleave", onLeave, { passive: true })
        }

        return () => {
            stopFrame?.()
            stopFrame = null
            refreshRef.current = () => {}
            stopResize()
            if (enabled) {
                root.removeEventListener("pointermove", onMove)
                root.removeEventListener("pointerleave", onLeave)
            }
            box.dispose()
        }
    }, [enabled, pixelated, settings])

    const dent = lighting?.dent
    const sheen = lighting?.sheen
    const shadowColor = lighting?.color
    const lightColor = lighting?.sheenColor
    useEffect(() => {
        refreshRef.current()
    }, [cell, pinned?.x, pinned?.y, dent, sheen, shadowColor, lightColor])

    const rootStyle: CSSProperties = {
        ...style,
        ["--vellum-tilt" as string]: `${tilt}deg`,
        ["--vellum-radius" as string]: `${radius}px`,
        ["--vellum-perspective" as string]: `${perspective}px`,
        ...(lighting
            ? {
                  ["--vellum-dent" as string]: lighting.dent,
                  ["--vellum-sheen" as string]: lighting.sheen,
                  ["--vellum-dent-color" as string]: lighting.color,
                  ["--vellum-sheen-color" as string]: lighting.sheenColor,
              }
            : {}),
    }

    return (
        <div
            ref={rootRef}
            className={cx("xp-vellum", className)}
            style={rootStyle}
            data-surface={pixelated ? "pixel" : undefined}
            data-still={enabled ? undefined : "true"}
        >
            <div className="xp-vellum-sheet">
                <div className="xp-vellum-content">{children}</div>
                {pixelated ? (
                    <canvas ref={canvasRef} className="xp-vellum-cells" aria-hidden="true" />
                ) : lighting ? (
                    <>
                        <div className="xp-vellum-dent" aria-hidden="true" />
                        <div className="xp-vellum-sheen" aria-hidden="true" />
                    </>
                ) : null}
            </div>
        </div>
    )
}
