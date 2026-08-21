"use client"

import type { CSSProperties, ReactNode } from "react"

import { cx } from "../../internal"
import { beatOf, loaderAria, useLoaderStill, type LoaderCommon } from "./shared"
import "./loaders.css"

export interface PixelPulseProps extends LoaderCommon {
    children?: ReactNode
    /** Block size of the grid, in px. */
    cell?: number
    /** Pin the loader over the whole viewport. */
    overlay?: boolean
    scrim?: string
}

export function PixelPulse({
    children,
    cell = 26,
    overlay = false,
    scrim = "rgba(9, 10, 17, 0.92)",
    label,
    color = "#f4a04f",
    speed = 1,
    paused = false,
    respectReducedMotion = true,
    className,
    style,
}: PixelPulseProps) {
    const still = useLoaderStill(paused, respectReducedMotion)

    return (
        <div
            className={cx(
                "xp-pulse",
                overlay && "xp-pulse-overlay",
                still && "xp-loader-still",
                className,
            )}
            style={
                {
                    ...style,
                    "--l-cell": cell,
                    "--l-color": color,
                    "--l-scrim": scrim,
                    "--l-beat": beatOf(1.6, speed),
                } as CSSProperties
            }
            {...loaderAria(label)}
        >
            <div className="xp-pulse-grid" data-phase="a" aria-hidden="true" />
            <div className="xp-pulse-grid" data-phase="b" aria-hidden="true" />
            {children ? <div className="xp-pulse-content">{children}</div> : null}
        </div>
    )
}
