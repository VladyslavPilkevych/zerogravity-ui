import type { ReactNode } from "react"

const TONES = ["light", "dark"] as const

/**
 * Every supported style of one component, side by side on a light and a dark
 * neutral panel. Plain panels on purpose: axe can only judge contrast over a
 * solid background, and glass has to stay legible without a busy one.
 */
export function StyleBoards<S extends string>({
    styles,
    render,
    wide = false,
}: {
    styles: readonly S[]
    render: (style: S, tone: (typeof TONES)[number]) => ReactNode
    /** one style per row, for components that need the full width */
    wide?: boolean
}) {
    return (
        <div className="sb-boards">
            {TONES.map((tone) => (
                <section
                    key={tone}
                    className="sb-board"
                    data-tone={tone}
                    data-wide={wide || undefined}
                    aria-label={`${tone} background`}
                >
                    {styles.map((style) => (
                        <div key={style} className="sb-board-cell" data-style={style}>
                            <p className="sb-board-label">{style}</p>
                            {render(style, tone)}
                        </div>
                    ))}
                </section>
            ))}
        </div>
    )
}

/** The rectangle of `selector` inside each style's cell, relative to that cell. */
export function geometry(canvas: HTMLElement, tone: string, selector: string) {
    return Object.fromEntries(
        [...canvas.querySelectorAll<HTMLElement>(`[data-tone="${tone}"] .sb-board-cell`)].map(
            (cell) => {
                const origin = cell.getBoundingClientRect()
                const rects = [...cell.querySelectorAll(selector)].map((node) => {
                    const box = node.getBoundingClientRect()
                    return [
                        Math.round(box.left - origin.left),
                        Math.round(box.top - origin.top),
                        Math.round(box.width),
                        Math.round(box.height),
                    ].join(",")
                })
                return [cell.dataset.style ?? "", rects.join(" ")]
            },
        ),
    )
}
