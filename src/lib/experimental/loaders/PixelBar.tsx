"use client"

import type { CSSProperties } from "react"

import { cx } from "../../internal"
import { beatOf, gapOf, loaderAria, useLoaderStill, type LoaderCommon } from "./shared"
import "./loaders.css"

export interface PixelBarProps extends LoaderCommon {
    size?: number
    segments?: number
    /** 0 to 1 turns the bar into a real progress bar; leave it out for indeterminate. */
    value?: number
}

export function PixelBar({
    size = 12,
    segments = 12,
    value,
    label,
    color = "#f4a04f",
    speed = 1,
    paused = false,
    gap,
    respectReducedMotion = true,
    className,
    style,
}: PixelBarProps) {
    const still = useLoaderStill(paused, respectReducedMotion)
    const count = Math.max(1, Math.round(segments))
    const known = typeof value === "number"
    const share = known ? Math.min(1, Math.max(0, value)) : 0
    const lit = known ? Math.round(share * count) : 0

    // an empty label means decorative, so it must not leave a nameless progressbar
    const semantics =
        known && label !== ""
            ? {
                  role: "progressbar" as const,
                  "aria-valuemin": 0,
                  "aria-valuemax": 100,
                  "aria-valuenow": Math.round(share * 100),
                  "aria-label": label ?? "Loading",
              }
            : loaderAria(label)

    return (
        <div
            className={cx("xp-loader", "xp-bar", still && "xp-loader-still", className)}
            data-mode={known ? "value" : "flow"}
            style={
                {
                    ...style,
                    "--l-size": size,
                    "--l-gap": gapOf(gap, 0.183),
                    "--l-color": color,
                    "--l-count": count,
                    "--l-beat": beatOf(1.6, speed),
                } as CSSProperties
            }
            {...semantics}
        >
            {Array.from({ length: count }, (_, index) => (
                <span
                    key={index}
                    className="xp-bar-cell"
                    aria-hidden="true"
                    data-lit={known && index < lit ? "true" : undefined}
                    data-edge={known && index === lit - 1 ? "true" : undefined}
                    data-rest={!known && index < Math.ceil(count / 3) ? "true" : undefined}
                    style={{ "--l-step": (count - 1 - index) / count } as CSSProperties}
                />
            ))}
        </div>
    )
}
