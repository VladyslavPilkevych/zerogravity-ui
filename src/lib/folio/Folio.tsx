"use client"

import {
    Children,
    isValidElement,
    useRef,
    useState,
    type CSSProperties,
    type ReactElement,
    type ReactNode,
} from "react"

import {
    clamp,
    cx,
    finite,
    onResize,
    useIsomorphicLayoutEffect,
    usePrefersReducedMotion,
} from "../internal"
import "./Folio.css"

export type FolioVariant = "pixel" | "classic" | "minimal" | "glass"

const FOLIO_CORNERS: Record<FolioVariant, number> = { pixel: 4, classic: 20, minimal: 6, glass: 18 }

export interface FolioPanelProps {
    media?: ReactNode
    children?: ReactNode | ((open: boolean) => ReactNode)
    label?: string
    className?: string
}

export function FolioPanel(_props: FolioPanelProps): null {
    return null
}

export interface FolioProps {
    children: ReactNode
    active?: number
    defaultActive?: number
    onActiveChange?: (index: number) => void
    variant?: FolioVariant
    height?: number | string
    gap?: number
    radius?: number
    grow?: number
    duration?: number
    easing?: string
    label?: string
    disabled?: boolean
    respectReducedMotion?: boolean
    className?: string
    style?: CSSProperties
}

export const FOLIO_STACK_BELOW = 560
export const FOLIO_EASING = "cubic-bezier(0.32, 0.72, 0, 1)"
const FOCUSABLE =
    "a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex='-1']), [contenteditable]"

export function Folio({
    children,
    active,
    defaultActive = 0,
    onActiveChange,
    variant = "pixel",
    height = 420,
    gap = 12,
    radius,
    grow = 3,
    duration = 650,
    easing = FOLIO_EASING,
    label,
    disabled = false,
    respectReducedMotion = true,
    className,
    style,
}: FolioProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLUListElement>(null)
    const pointer = useRef("mouse")
    const gesture = useRef<{ index: number; open: boolean } | null>(null)
    const [layout, setLayout] = useState<"rail" | "stack" | undefined>(undefined)
    const [inner, setInner] = useState(defaultActive)

    /*
     * Every element child is a panel, read through its props. From a server
     * component each FolioPanel arrives as a client reference, not the
     * function itself, so matching on the type would drop them all.
     */
    const panels = Children.toArray(children).filter(
        (child): child is ReactElement<FolioPanelProps> => isValidElement(child),
    )
    const count = panels.length
    const current = clamp(Math.round(finite(active ?? inner, 0)), 0, Math.max(count - 1, 0))
    const corner = clamp(finite(radius, FOLIO_CORNERS[variant] ?? 20), 0, 200)

    const stacked = layout === "stack"
    const reduced = usePrefersReducedMotion()
    const still = respectReducedMotion && reduced

    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current
        if (!root) return
        const measure = () => {
            const width = root.getBoundingClientRect().width
            if (width > 0) setLayout(width < FOLIO_STACK_BELOW ? "stack" : "rail")
        }
        measure()
        return onResize(root, measure)
    }, [])

    useIsomorphicLayoutEffect(() => {
        const list = listRef.current
        if (!list) return
        for (const item of list.children) {
            if (item.querySelector(FOCUSABLE)) item.removeAttribute("tabindex")
            else item.setAttribute("tabindex", "0")
        }
    })

    const select = (index: number) => {
        if (disabled || index === current || stacked) return
        if (active === undefined) setInner(index)
        onActiveChange?.(index)
    }

    const vars = {
        ...style,
        "--zg-folio-count": Math.max(count, 1),
        "--zg-folio-at": current,
        "--zg-folio-height": typeof height === "number" ? `${height}px` : height,
        "--zg-folio-gap": `${clamp(finite(gap, 12), 0, 64)}px`,
        "--zg-folio-radius": `${corner}px`,
        "--zg-folio-grow": clamp(finite(grow, 3), 1, 10),
        "--zg-folio-duration": `${clamp(finite(duration, 650), 0, 4000)}ms`,
        "--zg-folio-easing": easing,
    } as CSSProperties

    return (
        <div
            ref={rootRef}
            className={cx("zg-folio", className)}
            data-variant={variant}
            data-layout={layout}
            data-still={still ? "" : undefined}
            style={vars}
        >
            <ul ref={listRef} className="zg-folio-list" aria-label={label}>
                {panels.map((panel, index) => {
                    const isOpen = stacked || index === current
                    const { media, children: content, label: name, className: own } = panel.props

                    return (
                        <li
                            key={panel.key ?? index}
                            className={cx("zg-folio-panel", own)}
                            aria-label={name}
                            data-open={isOpen ? "" : undefined}
                            style={{ "--zg-folio-index": index } as CSSProperties}
                            onPointerDown={(event) => {
                                pointer.current = event.pointerType
                                gesture.current = { index, open: isOpen }
                            }}
                            onPointerEnter={(event) => {
                                if (event.pointerType === "mouse") select(index)
                            }}
                            onClickCapture={(event) => {
                                const tap = gesture.current
                                gesture.current = null
                                if (event.detail === 0 || pointer.current === "mouse") return
                                if (disabled || stacked) return
                                if (tap?.index === index && tap.open) return
                                select(index)
                                event.preventDefault()
                            }}
                            onFocus={() => select(index)}
                        >
                            {media !== undefined && <div className="zg-folio-media">{media}</div>}
                            <div className="zg-folio-content">
                                {typeof content === "function" ? content(isOpen) : content}
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
