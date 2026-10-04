"use client"

import {
    Children,
    useCallback,
    useEffect,
    useRef,
    type CSSProperties,
    type ReactNode,
    type RefObject,
} from "react"

import {
    clamp,
    cx,
    finite,
    scrollPort,
    useLatestRef,
    usePrefersReducedMotion,
} from "../../internal"
import "./Concertina.css"

export interface ConcertinaProps {
    children: ReactNode
    scrollContainer?: RefObject<HTMLElement | null>
    /** how tall each panel is */
    height?: string
    /** how far a panel folds before it settles, in degrees */
    angle?: number
    /** how deep the perspective is, in px */
    depth?: number
    /** how dark a folded face goes, 0 to 1 */
    shade?: number
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export interface ConcertinaPanelProps {
    children: ReactNode
    className?: string
    style?: CSSProperties
}

export function ConcertinaPanel({ children, className, style }: ConcertinaPanelProps) {
    return (
        <div className={cx("xp-concertina-inner", className)} style={style}>
            {children}
        </div>
    )
}

export function Concertina({
    children,
    scrollContainer,
    height = "62vh",
    angle = 72,
    depth = 1400,
    shade = 0.55,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: ConcertinaProps) {
    const trackRef = useRef<HTMLDivElement>(null)
    const leavesRef = useRef<(HTMLDivElement | null)[]>([])
    const frameRef = useRef(0)

    const reduced = usePrefersReducedMotion()
    const still = disabled || (respectReducedMotion && reduced)

    const items = Children.toArray(children)
    const settings = useLatestRef({
        angle: clamp(finite(angle, 72), 0, 90),
        shade: clamp(finite(shade, 0.55), 0, 1),
        count: items.length,
        still,
    })

    const paint = useCallback(() => {
        const config = settings.current
        const port = scrollPort(scrollContainer?.current)
        const view = port.height()

        for (let index = 0; index < config.count; index += 1) {
            const leaf = leavesRef.current[index]
            if (!leaf) continue

            if (config.still) {
                leaf.style.transform = ""
                leaf.style.setProperty("--cn-shade", "0")
                continue
            }

            // where the panel's middle sits in the port: 0 at the bottom edge,
            // 1 at the top, 0.5 flat in the centre
            const middle = port.top(leaf) + leaf.offsetHeight / 2
            const travel = clamp(
                (view - middle) / Math.max(1, view * 0.85 + leaf.offsetHeight * 0.5),
                0,
                2,
            )
            const fold = clamp(travel - 0.5, -1, 1)
            const turn = -fold * config.angle
            const hinge = index % 2 === 0 ? "top" : "bottom"

            leaf.style.transformOrigin = `center ${hinge}`
            leaf.style.transform = `rotateX(${turn.toFixed(2)}deg)`
            leaf.style.setProperty("--cn-shade", (Math.abs(fold) * config.shade).toFixed(3))
        }
    }, [scrollContainer, settings])

    const schedule = useCallback(() => {
        if (frameRef.current !== 0) return
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = 0
            paint()
        })
    }, [paint])

    useEffect(() => {
        const track = trackRef.current
        if (!track) return

        const port = scrollPort(scrollContainer?.current)
        paint()

        port.target.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", schedule)

        return () => {
            port.target.removeEventListener("scroll", schedule)
            window.removeEventListener("resize", schedule)
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
        }
    }, [paint, schedule, scrollContainer])

    return (
        <div
            ref={trackRef}
            className={cx("xp-concertina", className)}
            data-still={still ? "true" : undefined}
            style={
                {
                    ...style,
                    perspective: `${clamp(finite(depth, 1400), 200, 6000)}px`,
                } as CSSProperties
            }
        >
            {items.map((item, index) => (
                <div
                    key={index}
                    ref={(node) => {
                        leavesRef.current[index] = node
                    }}
                    className="xp-concertina-leaf"
                    style={{ height } as CSSProperties}
                >
                    {item}
                    <span className="xp-concertina-fold" aria-hidden="true" />
                </div>
            ))}
        </div>
    )
}
