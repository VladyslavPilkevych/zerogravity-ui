"use client"

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
} from "react"

import { clamp, cx, finite, pointerBox, useLatestRef, useMediaQuery } from "../../internal"
import "./Contact.css"

export interface ContactProps {
    /** the sequence, in order */
    frames: readonly string[]
    /** describes the sequence as a whole */
    alt: string
    /** a label for each frame, used by the slider and by screen readers */
    labels?: readonly string[]
    /** which frame to rest on */
    defaultFrame?: number
    /** show the film strip of thumbnails under the plate */
    strip?: boolean
    aspect?: string
    objectFit?: "cover" | "contain"
    objectPosition?: string
    radius?: number
    disabled?: boolean
    className?: string
    style?: CSSProperties
    onFrameChange?: (index: number) => void
}

export function Contact({
    frames,
    alt,
    labels,
    defaultFrame = 0,
    strip = true,
    aspect = "3 / 2",
    objectFit = "cover",
    objectPosition = "50% 50%",
    radius = 14,
    disabled = false,
    className,
    style,
    onFrameChange,
}: ContactProps) {
    const hostRef = useRef<HTMLDivElement>(null)
    const total = frames.length
    const start = Math.round(clamp(finite(defaultFrame, 0), 0, Math.max(0, total - 1)))

    const [frame, setFrame] = useState(start)
    const fine = useMediaQuery("(pointer: fine)")
    const report = useLatestRef(onFrameChange)
    const settings = useLatestRef({ total, disabled })

    const go = useCallback(
        (next: number) => {
            const config = settings.current
            const index = Math.round(clamp(next, 0, Math.max(0, config.total - 1)))
            setFrame((current) => {
                if (current === index) return current
                report.current?.(index)
                return index
            })
        },
        [report, settings],
    )

    useEffect(() => {
        const host = hostRef.current
        if (!host || total < 2) return

        const box = pointerBox(host)

        const onMove = (event: PointerEvent) => {
            const config = settings.current
            if (config.disabled) return
            const point = box.at(event)
            if (!point) return
            // scrubbing sets a frame index, not a pixel: one state change per
            // frame boundary, never one per pointer move
            go(Math.floor(clamp(point.x, 0, 0.9999) * config.total))
        }

        host.addEventListener("pointermove", onMove, { passive: true })

        return () => {
            host.removeEventListener("pointermove", onMove)
            box.dispose()
        }
    }, [go, settings, total])

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return
        const step =
            event.key === "ArrowRight" || event.key === "ArrowUp"
                ? 1
                : event.key === "ArrowLeft" || event.key === "ArrowDown"
                  ? -1
                  : 0

        if (step !== 0) {
            event.preventDefault()
            go(frame + step)
            return
        }
        if (event.key === "Home") {
            event.preventDefault()
            go(0)
        }
        if (event.key === "End") {
            event.preventDefault()
            go(total - 1)
        }
    }

    const label = labels?.[frame] ?? `Frame ${frame + 1} of ${total}`

    return (
        <div
            className={cx("xp-contact", className)}
            data-touch={!fine ? "true" : undefined}
            style={
                {
                    ...style,
                    "--ct-radius": `${clamp(finite(radius, 14), 0, 96)}px`,
                    "--ct-fit": objectFit,
                    "--ct-at": objectPosition,
                } as CSSProperties
            }
        >
            <div
                ref={hostRef}
                className="xp-contact-plate"
                style={{ aspectRatio: aspect } as CSSProperties}
                role="slider"
                tabIndex={disabled ? -1 : 0}
                aria-label={alt}
                aria-valuemin={1}
                aria-valuemax={Math.max(1, total)}
                aria-valuenow={frame + 1}
                aria-valuetext={label}
                aria-disabled={disabled ? true : undefined}
                onKeyDown={onKeyDown}
            >
                {frames.map((source, index) => (
                    <img
                        key={source + index}
                        className="xp-contact-frame"
                        src={source}
                        alt=""
                        aria-hidden="true"
                        data-shown={index === frame ? "true" : undefined}
                        loading={index === start ? undefined : "lazy"}
                    />
                ))}
                <span className="xp-contact-count" aria-hidden="true">
                    {frame + 1} / {total}
                </span>
            </div>

            {strip && total > 1 ? (
                <div className="xp-contact-strip" aria-hidden="true">
                    {frames.map((source, index) => (
                        <span
                            key={source + index}
                            className="xp-contact-cell"
                            data-shown={index === frame ? "true" : undefined}
                        >
                            <img src={source} alt="" loading="lazy" />
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    )
}
