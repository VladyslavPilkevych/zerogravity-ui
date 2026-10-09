"use client"

import {
    forwardRef,
    useRef,
    type ComponentPropsWithoutRef,
    type CSSProperties,
    type ElementType,
    type ForwardedRef,
    type ReactElement,
    type ReactNode,
    type Ref,
} from "react"

import {
    context2d,
    cx,
    fitCanvas,
    onFrame,
    onResize,
    pointerBox,
    useIsomorphicLayoutEffect,
    useLatestRef,
    usePrefersReducedMotion,
} from "../internal"
import { aim, BAND, makeGrid, paint, type DitherGrid, type DitherOrigin } from "./engine"
import "./Dither.css"

export type DitherState = "idle" | "enter" | "on" | "exit"

export type DitherVariant = "sweep" | "edge"

export interface DitherOwnProps {
    children?: ReactNode
    variant?: DitherVariant
    cell?: number
    color?: string
    colors?: readonly string[]
    density?: number
    glow?: number
    duration?: number
    origin?: DitherOrigin
    layer?: "under" | "over"
    active?: boolean
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export type DitherProps<T extends ElementType = "div"> = DitherOwnProps & {
    as?: T
} & Omit<ComponentPropsWithoutRef<T>, keyof DitherOwnProps | "as">

const FULL = 1 + BAND
const EXIT_SPEEDUP = 1.4
const FALLBACK = "#4ee1f2"
const LIST_TAGS = new Set(["ul", "ol", "menu"])

function focusVisible(element: Element): boolean {
    try {
        return element.matches(":focus-visible")
    } catch {
        return true
    }
}

interface ActiveWatch {
    force: (on: boolean) => void
    dispose: () => void
}

// Hover (mouse and pen only), :focus-visible anywhere inside, and the active prop all count as on.
function watchActive(
    root: HTMLElement,
    change: (on: boolean, x?: number, y?: number) => void,
): ActiveWatch {
    const box = pointerBox(root)
    let hovered = false
    let focused = false
    let forced = false

    const update = (x?: number, y?: number) => change(hovered || focused || forced, x, y)

    const onEnter = (event: PointerEvent) => {
        if (event.pointerType === "touch") return
        hovered = true
        box.invalidate()
        const point = box.px(event)
        update(point?.x, point?.y)
    }

    const onLeave = (event: PointerEvent) => {
        if (!hovered) return
        hovered = false
        const point = box.px(event)
        update(point?.x, point?.y)
    }

    const onFocusIn = (event: FocusEvent) => {
        if (!(event.target instanceof Element) || !focusVisible(event.target)) return
        focused = true
        update()
    }

    const onFocusOut = (event: FocusEvent) => {
        const next = event.relatedTarget
        if (next instanceof Node && root.contains(next)) return
        focused = false
        update()
    }

    root.addEventListener("pointerenter", onEnter)
    root.addEventListener("pointerleave", onLeave)
    root.addEventListener("focusin", onFocusIn)
    root.addEventListener("focusout", onFocusOut)

    return {
        force(on) {
            forced = on
            update()
        },
        dispose() {
            box.dispose()
            root.removeEventListener("pointerenter", onEnter)
            root.removeEventListener("pointerleave", onLeave)
            root.removeEventListener("focusin", onFocusIn)
            root.removeEventListener("focusout", onFocusOut)
        },
    }
}

function DitherInner(
    {
        as,
        children,
        variant = "sweep",
        cell = 8,
        color,
        colors,
        density = 0.3,
        glow = 0.5,
        duration = 420,
        origin = "pointer",
        layer = "under",
        active = false,
        disabled = false,
        respectReducedMotion = true,
        className,
        style,
        ...rest
    }: DitherProps<ElementType>,
    forwarded: ForwardedRef<Element>,
) {
    const rootRef = useRef<HTMLElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const forceRef = useRef<((on: boolean) => void) | null>(null)
    const reduced = usePrefersReducedMotion()
    const still = respectReducedMotion && reduced
    const settings = useLatestRef({ duration, density, color, colors })
    const paletteKey = (colors ?? []).join(",")

    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current
        if (!root || disabled) return

        const mark = (state: DitherState) => root.setAttribute("data-state", state)

        if (variant === "edge") {
            const watch = watchActive(root, (on) => mark(on ? "on" : "idle"))
            mark("idle")
            forceRef.current = watch.force
            return () => {
                forceRef.current = null
                watch.dispose()
                root.removeAttribute("data-state")
            }
        }

        const canvas = canvasRef.current
        if (!canvas) return

        const context = context2d(canvas)
        let grid: DitherGrid | null = null
        let dpr = 1
        let palette: string[] = [FALLBACK]
        let level = 0
        let target = 0
        let stop: (() => void) | null = null

        const resolvePalette = (): string[] => {
            const config = settings.current
            if (config.colors && config.colors.length > 0) return [...config.colors]
            if (config.color) return [config.color]
            const token = getComputedStyle(root).getPropertyValue("--zg-dither-color").trim()
            return [token || FALLBACK]
        }

        const fit = () => {
            palette = resolvePalette()
            const size = fitCanvas(canvas, root)
            dpr = size.dpr
            grid = makeGrid(
                size.width / dpr,
                size.height / dpr,
                cell,
                settings.current.density,
                palette.length,
            )
        }

        const draw = () => {
            if (context && grid) paint(context, grid, level, palette, dpr)
        }

        const tick = (dt: number) => {
            const rate = FULL / Math.max(settings.current.duration / 1000, 0.05)
            level =
                target > level
                    ? Math.min(target, level + rate * dt)
                    : Math.max(target, level - rate * dt * EXIT_SPEEDUP)
            draw()
            if (level !== target) return
            stop?.()
            stop = null
            mark(target > 0 ? "on" : "idle")
        }

        const update = (on: boolean, x?: number, y?: number) => {
            const next = on ? FULL : 0
            if (next === target) return

            if (on && level <= 0) {
                fit()
                if (grid) {
                    const width = grid.cols * grid.cell
                    const height = grid.rows * grid.cell
                    const from = origin === "pointer" && x === undefined ? "center" : origin
                    aim(grid, from, x ?? width / 2, y ?? height / 2)
                }
            } else if (!on && level >= FULL && grid && origin === "pointer" && x !== undefined) {
                aim(grid, "pointer", x, y ?? 0)
            }

            target = next
            if (still) {
                level = target
                draw()
                mark(on ? "on" : "idle")
                return
            }
            mark(on ? "enter" : "exit")
            if (!stop) stop = onFrame(tick)
        }

        const watch = watchActive(root, update)

        const stopResize = onResize(root, () => {
            if (level <= 0 || stop) return
            fit()
            if (grid) aim(grid, "center", 0, 0)
            draw()
        })

        mark("idle")
        forceRef.current = watch.force

        return () => {
            forceRef.current = null
            stop?.()
            stop = null
            stopResize()
            watch.dispose()
            context?.clearRect(0, 0, canvas.width, canvas.height)
            root.removeAttribute("data-state")
        }
    }, [variant, disabled, still, cell, density, origin, paletteKey, color, settings])

    useIsomorphicLayoutEffect(() => {
        forceRef.current?.(active)
    }, [active, variant, disabled, still, cell, density, origin, paletteKey, color])

    const setRef = (node: HTMLElement | null) => {
        rootRef.current = node
        if (typeof forwarded === "function") forwarded(node)
        else if (forwarded) forwarded.current = node
    }

    const tint = colors?.[0] ?? color
    const size = Math.max(2, Math.round(cell))
    const rootStyle = {
        ...style,
        ...(tint ? { "--zg-dither-color": tint } : null),
        "--zg-dither-glow": glow,
        "--zg-dither-cell": `${size}px`,
        "--zg-dither-gap": `${Math.max(1, Math.round(size * 0.14))}px`,
    } as CSSProperties

    const Host = as ?? "div"
    const list = typeof Host === "string" && LIST_TAGS.has(Host)
    const canvas = disabled ? null : variant === "edge" ? (
        <span className="zg-dither-edge" aria-hidden="true" />
    ) : (
        <canvas ref={canvasRef} className="zg-dither-canvas" aria-hidden="true" />
    )

    return (
        <Host
            {...rest}
            ref={setRef}
            className={cx("zg-dither", className)}
            data-variant={variant}
            data-layer={layer}
            data-still={still ? "" : undefined}
            style={rootStyle}
        >
            {list ? null : canvas}
            {children}
            {list && canvas ? (
                <li className="zg-dither-slot" aria-hidden="true">
                    {canvas}
                </li>
            ) : null}
        </Host>
    )
}

export const Dither = forwardRef(DitherInner) as <T extends ElementType = "div">(
    props: DitherProps<T> & { ref?: Ref<Element> },
) => ReactElement | null
