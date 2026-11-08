"use client"

import { Children, Fragment, useRef, useState, type CSSProperties, type ReactNode } from "react"

import {
    clamp,
    cx,
    finite,
    onResize,
    useIsomorphicLayoutEffect,
    usePauseOffscreen,
    usePrefersReducedMotion,
} from "../internal"
import "../internal/offscreen.css"
import "./Sash.css"

export type SashDirection = "left" | "right"
export type SashVariant = "pixel" | "classic"

export interface SashProps {
    children: ReactNode
    variant?: SashVariant
    speed?: number
    direction?: SashDirection
    gap?: number
    pauseOnHover?: boolean
    fade?: boolean
    paused?: boolean
    label?: string
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export const SASH_COPY_LIMIT = 24

/** Copies needed so the band is always covered, plus one shift of travel. */
export function sashCopies(viewport: number, shift: number): number {
    if (!(shift > 0)) return 2
    return clamp(Math.ceil(viewport / shift) + 1, 2, SASH_COPY_LIMIT)
}

export function Sash({
    children,
    variant = "pixel",
    speed = 60,
    direction = "left",
    gap = 40,
    pauseOnHover = true,
    fade = false,
    paused = false,
    label,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: SashProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const runRef = useRef<HTMLDivElement>(null)
    const [copies, setCopies] = useState(2)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)
    const pace = clamp(finite(speed, 60), 4, 2000)
    const space = clamp(finite(gap, 40), 0, 400)
    const count = still ? 1 : copies
    const run =
        variant === "pixel"
            ? Children.toArray(children).map((child, index) => (
                  <Fragment key={index}>
                      {child}
                      <span className="zg-sash-mark" aria-hidden="true" />
                  </Fragment>
              ))
            : children

    usePauseOffscreen(rootRef, !still)

    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current
        const run = runRef.current
        if (!root || !run || still) return

        const measure = () => {
            const width = run.getBoundingClientRect().width
            if (!(width > 0)) return
            const shift = width + space
            root.style.setProperty("--zg-sash-shift", `${shift}px`)
            root.style.setProperty("--zg-sash-duration", `${shift / pace}s`)
            root.dataset.ready = ""
            setCopies(sashCopies(root.getBoundingClientRect().width, shift))
        }

        measure()
        const stopRoot = onResize(root, measure)
        const stopRun = onResize(run, measure)
        return () => {
            stopRoot()
            stopRun()
            delete root.dataset.ready
        }
    }, [still, pace, space])

    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current
        if (!root) return
        for (const copy of root.querySelectorAll("[data-copy]")) copy.toggleAttribute("inert", true)
    }, [count])

    return (
        <div
            ref={rootRef}
            role={label ? "region" : undefined}
            aria-label={label}
            className={cx("zg-sash", className)}
            data-variant={variant}
            data-direction={direction}
            data-paused={paused ? "" : undefined}
            data-hover-pause={pauseOnHover ? "" : undefined}
            data-fade={fade ? "" : undefined}
            data-still={still ? "" : undefined}
            data-motion={respectReducedMotion ? undefined : "always"}
            style={{ ...style, "--zg-sash-gap": `${space}px` } as CSSProperties}
        >
            <div className="zg-sash-track">
                {Array.from({ length: count }, (_, index) => (
                    <div
                        key={index}
                        ref={index === 0 ? runRef : undefined}
                        className="zg-sash-run"
                        data-copy={index > 0 ? "" : undefined}
                        aria-hidden={index > 0 ? true : undefined}
                    >
                        {run}
                    </div>
                ))}
            </div>
        </div>
    )
}
