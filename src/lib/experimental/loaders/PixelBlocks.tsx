"use client"

import type { CSSProperties } from "react"

import { cx } from "../../internal"
import { beatOf, gapOf, loaderAria, useLoaderStill, type LoaderCommon } from "./shared"
import "./loaders.css"

export type PixelBlocksVariant = "wave" | "center" | "steps"

export interface PixelBlocksProps extends LoaderCommon {
    size?: number
    count?: number
    variant?: PixelBlocksVariant
}

/** Center-out needs a symmetric offset; the others march across. */
function stepFor(index: number, count: number, variant: PixelBlocksVariant): number {
    if (count <= 1) return 0
    if (variant !== "center") return index / count

    const middle = (count - 1) / 2
    return Math.abs(index - middle) / (middle + 1)
}

export function PixelBlocks({
    size = 10,
    count = 5,
    variant = "wave",
    label,
    color = "#f4a04f",
    speed = 1,
    paused = false,
    gap,
    respectReducedMotion = true,
    className,
    style,
}: PixelBlocksProps) {
    const still = useLoaderStill(paused, respectReducedMotion)
    const total = Math.max(1, Math.round(count))

    return (
        <div
            className={cx("xp-loader", "xp-blocks", still && "xp-loader-still", className)}
            data-variant={variant}
            style={
                {
                    ...style,
                    "--l-size": size,
                    "--l-gap": gapOf(gap, 0.34),
                    "--l-color": color,
                    "--l-beat": beatOf(variant === "steps" ? 1.2 : 1.05, speed),
                } as CSSProperties
            }
            {...loaderAria(label)}
        >
            {Array.from({ length: total }, (_, index) => (
                <span
                    key={index}
                    className="xp-blocks-pixel"
                    aria-hidden="true"
                    style={{ "--l-step": stepFor(index, total, variant) } as CSSProperties}
                />
            ))}
        </div>
    )
}
