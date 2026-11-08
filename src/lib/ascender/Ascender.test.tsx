import { render, screen } from "@testing-library/react"
import { StrictMode } from "react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { installFrameHarness, type FrameHarness } from "../../test/frames"
import { mediaState } from "../../test/environment"
import { installIntersectionHarness, type IntersectionHarness } from "../../test/observers"
import { Ascender, splitWords } from "./Ascender"

function root(container: HTMLElement) {
    return container.querySelector(".zg-ascender") as HTMLElement
}

describe("Ascender", () => {
    let io: IntersectionHarness
    let frames: FrameHarness

    beforeEach(() => {
        io = installIntersectionHarness()
        frames = installFrameHarness()
    })

    afterEach(() => {
        io.restore()
        frames.restore()
    })

    it("splits on ordinary whitespace only, keeping non-breaking spaces inside a word", () => {
        expect(splitWords("  Every\tword\n arrives ")).toEqual(["Every", "word", "arrives"])
        expect(splitWords("10 km away")).toEqual(["10 km", "away"])
        expect(splitWords("")).toEqual([])
    })

    it("exposes the sentence once and hides the animated words", () => {
        const { container } = render(<Ascender as="h2" text="Rise one by one" />)

        expect(
            screen.getByRole("heading", { level: 2, name: "Rise one by one" }),
        ).toBeInTheDocument()
        const words = container.querySelector(".zg-ascender-words") as HTMLElement
        expect(words).toHaveAttribute("aria-hidden", "true")
        expect(words.querySelectorAll(".zg-ascender-word")).toHaveLength(4)
    })

    it("renders the same markup on the server, words hidden until the observer reveals them", () => {
        const html = renderToString(<Ascender text="Server safe line" />)

        expect(html).toContain('data-state="hidden"')
        expect(html).toContain("Server safe line")
        expect(renderToString(<Ascender text="Server safe line" />)).toBe(html)
    })

    it("reveals once on entering the view and stops observing", () => {
        const { container } = render(<Ascender text="Once only" />)

        expect(root(container).dataset.state).toBe("hidden")
        expect(io.live()).toHaveLength(1)
        expect(io.live()[0].options?.rootMargin).toBe("0px 0px -8% 0px")

        io.report(true)
        expect(root(container).dataset.state).toBe("shown")
        expect(io.live()).toHaveLength(0)
    })

    it("hides again on leaving the view when replay is on", () => {
        const { container } = render(<Ascender text="Again and again" replay />)

        io.report(true)
        expect(root(container).dataset.state).toBe("shown")
        io.report(false)
        expect(root(container).dataset.state).toBe("hidden")
        io.report(true)
        expect(root(container).dataset.state).toBe("shown")
        expect(io.live()).toHaveLength(1)
    })

    it("never runs an animation frame", () => {
        render(<Ascender text="No frames" />)
        io.report(true)

        expect(frames.pending()).toBe(0)
    })

    it("plays on mount from CSS alone, with no observer", () => {
        const { container } = render(<Ascender text="Straight away" trigger="mount" />)

        expect(root(container).dataset.trigger).toBe("mount")
        expect(root(container).dataset.state).toBeUndefined()
        expect(io.observers).toHaveLength(0)
    })

    it("renders static text when disabled", () => {
        const { container } = render(<Ascender text="Static" disabled />)

        expect(root(container).dataset.state).toBeUndefined()
        expect(root(container).dataset.trigger).toBeUndefined()
        expect(io.observers).toHaveLength(0)
    })

    it("attaches no observer under reduced motion, leaving the text to CSS", () => {
        mediaState.reducedMotion = true
        render(<Ascender text="Calm" />)

        expect(io.observers).toHaveLength(0)
    })

    it("marks the opt-out from reduced motion for the stylesheet", () => {
        const { container } = render(<Ascender text="Always" respectReducedMotion={false} />)

        expect(root(container).dataset.motion).toBe("always")
    })

    it("leaves a single live observer after a StrictMode remount and none after unmount", () => {
        const { unmount } = render(
            <StrictMode>
                <Ascender text="Strict" />
            </StrictMode>,
        )

        expect(io.live()).toHaveLength(1)
        unmount()
        expect(io.live()).toHaveLength(0)
    })

    it("clamps timing into CSS custom properties", () => {
        const { container } = render(
            <Ascender text="Timing" stagger={-5} duration={Number.NaN} delay={120} />,
        )
        const style = root(container).style

        expect(style.getPropertyValue("--zg-ascender-stagger")).toBe("0ms")
        expect(style.getPropertyValue("--zg-ascender-duration")).toBe("900ms")
        expect(style.getPropertyValue("--zg-ascender-delay")).toBe("120ms")
    })

    it("passes a custom easing to the stylesheet", () => {
        const { container } = render(<Ascender text="Eased" easing="linear" />)
        expect(root(container).style.getPropertyValue("--zg-ascender-easing")).toBe("linear")
    })
})
