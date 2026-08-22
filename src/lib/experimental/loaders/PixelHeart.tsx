"use client"

import type { CSSProperties } from "react"

import { cx } from "../../internal"
import { HEART_COLS, HEART_PIXELS } from "./heartMap"
import { beatOf, loaderAria, useLoaderStill, type LoaderCommon } from "./shared"
import "./loaders.css"

export type PixelHeartVariant = "pulse" | "blink"

export interface PixelHeartProps extends LoaderCommon {
    size?: number
    variant?: PixelHeartVariant
}

export function PixelHeart({
    size = 96,
    variant = "pulse",
    label,
    color = "#f4a04f",
    speed = 1,
    paused = false,
    respectReducedMotion = true,
    className,
    style,
}: PixelHeartProps) {
    const still = useLoaderStill(paused, respectReducedMotion)

    return (
        <div
            className={cx("xp-loader", "xp-heart", still && "xp-loader-still", className)}
            data-variant={variant}
            style={
                {
                    ...style,
                    "--l-size": size,
                    "--l-color": color,
                    "--l-cols": HEART_COLS,
                    "--l-beat": beatOf(variant === "blink" ? 1.1 : 1.5, speed),
                } as CSSProperties
            }
            {...loaderAria(label)}
        >
            {HEART_PIXELS.map((pixel) => (
                <span
                    key={`${pixel.col}-${pixel.row}`}
                    className="xp-heart-pixel"
                    aria-hidden="true"
                    style={
                        {
                            gridColumn: pixel.col + 1,
                            gridRow: pixel.row + 1,
                            "--l-reach": pixel.reach,
                        } as CSSProperties
                    }
                />
            ))}
        </div>
    )
}
