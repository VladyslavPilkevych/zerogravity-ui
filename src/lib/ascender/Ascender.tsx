"use client"

import { Fragment, useEffect, useRef, type CSSProperties, type ElementType } from "react"

import { clamp, cx, finite, onVisible, usePrefersReducedMotion } from "../internal"
import "./Ascender.css"

export type AscenderElement = "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div"
export type AscenderTrigger = "view" | "mount"

export interface AscenderProps {
    text: string
    as?: AscenderElement
    trigger?: AscenderTrigger
    replay?: boolean
    stagger?: number
    duration?: number
    delay?: number
    easing?: string
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

const WHITESPACE = /[ \t\n\r\f]+/
const REVEAL_MARGIN = "0px 0px -8% 0px"

export function splitWords(text: string): string[] {
    return text.split(WHITESPACE).filter(Boolean)
}

export function Ascender({
    text,
    as = "span",
    trigger = "view",
    replay = false,
    stagger = 60,
    duration = 900,
    delay = 0,
    easing = "cubic-bezier(0.16, 1, 0.3, 1)",
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: AscenderProps) {
    const rootRef = useRef<HTMLElement>(null)
    const reduced = usePrefersReducedMotion()
    const words = splitWords(text)
    const Tag = as as ElementType
    const watching = trigger === "view" && !disabled

    useEffect(() => {
        const root = rootRef.current
        if (!root || !watching || (respectReducedMotion && reduced)) return

        const stop = onVisible(
            root,
            (visible) => {
                if (visible) {
                    root.dataset.state = "shown"
                    if (!replay) stop()
                } else if (replay) {
                    root.dataset.state = "hidden"
                }
            },
            { rootMargin: REVEAL_MARGIN },
        )
        return stop
    }, [watching, replay, respectReducedMotion, reduced])

    const vars = {
        "--zg-ascender-stagger": `${clamp(finite(stagger, 60), 0, 2000)}ms`,
        "--zg-ascender-duration": `${clamp(finite(duration, 900), 0, 10000)}ms`,
        "--zg-ascender-delay": `${clamp(finite(delay, 0), 0, 10000)}ms`,
        "--zg-ascender-easing": easing,
    } as CSSProperties

    return (
        <Tag
            ref={rootRef}
            className={cx("zg-ascender", className)}
            data-trigger={disabled ? undefined : trigger}
            data-state={watching ? "hidden" : undefined}
            data-motion={respectReducedMotion ? undefined : "always"}
            style={{ ...style, ...vars }}
        >
            <span className="zg-ascender-text">{text}</span>
            <span className="zg-ascender-words" aria-hidden="true">
                {words.map((word, index) => (
                    <Fragment key={index}>
                        {index > 0 && " "}
                        <span className="zg-ascender-mask">
                            <span
                                className="zg-ascender-word"
                                style={{ "--zg-ascender-index": index } as CSSProperties}
                            >
                                {word}
                            </span>
                        </span>
                    </Fragment>
                ))}
            </span>
        </Tag>
    )
}
