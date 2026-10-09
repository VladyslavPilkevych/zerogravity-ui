import { createRef, useRef } from "react"
import { act, render } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { installFrameHarness } from "../../test/frames"
import { Eclipse, EclipseSection } from "./Eclipse"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

function three() {
    return ["One", "Two", "Three"].map((label) => (
        <EclipseSection key={label}>{label}</EclipseSection>
    ))
}

describe("Eclipse", () => {
    it("stacks its sections in order, so each one covers the one before it", () => {
        const { container } = render(<Eclipse>{three()}</Eclipse>)
        const panels = [...container.querySelectorAll<HTMLElement>(".xp-eclipse-panel")]

        expect(panels.map((panel) => panel.textContent?.trim())).toEqual(["One", "Two", "Three"])
        expect(panels.map((panel) => panel.style.zIndex)).toEqual(["1", "2", "3"])
    })

    it("gives every section the same height, so one scroll buys one cover", () => {
        const { container } = render(<Eclipse height="640px">{three()}</Eclipse>)
        const panels = [...container.querySelectorAll<HTMLElement>(".xp-eclipse-panel")]

        expect(panels.every((panel) => panel.style.height === "640px")).toBe(true)
    })

    it("carries the arrival edge onto the track", () => {
        const { container } = render(<Eclipse from="right">{three()}</Eclipse>)

        expect((container.querySelector(".xp-eclipse") as HTMLElement).dataset.from).toBe("right")
    })

    it("hides the dimming veil from anything that reads the page", () => {
        const { container } = render(<Eclipse>{three()}</Eclipse>)

        for (const veil of container.querySelectorAll(".xp-eclipse-veil")) {
            expect(veil).toHaveAttribute("aria-hidden", "true")
        }
    })

    it("listens to a container when it is driven by one, and lets go on unmount", () => {
        const host = document.createElement("div")
        document.body.append(host)
        const ref = createRef<HTMLElement>()
        Object.assign(ref, { current: host })

        const on = vi.spyOn(host, "addEventListener")
        const off = vi.spyOn(host, "removeEventListener")

        const { unmount } = render(<Eclipse scrollContainer={ref as never}>{three()}</Eclipse>)

        expect(on.mock.calls.map(([name]) => name)).toContain("scroll")
        unmount()
        expect(off.mock.calls.map(([name]) => name)).toContain("scroll")
        host.remove()
    })

    it("reports the section it settles on", () => {
        const onActiveChange = vi.fn()
        render(<Eclipse onActiveChange={onActiveChange}>{three()}</Eclipse>)

        expect(onActiveChange).toHaveBeenCalledWith(0)
    })

    it("drops the pinning and the transforms under reduced motion", () => {
        mediaState.reducedMotion = true

        const { container } = render(<Eclipse>{three()}</Eclipse>)
        const track = container.querySelector(".xp-eclipse") as HTMLElement

        expect(track.dataset.still).toBe("true")
        for (const panel of container.querySelectorAll<HTMLElement>(".xp-eclipse-panel")) {
            expect(panel.style.transform).toBe("")
        }
        for (const veil of container.querySelectorAll<HTMLElement>(".xp-eclipse-veil")) {
            expect(veil.style.opacity).toBe("0")
        }
    })

    it("renders nothing extra for an empty track", () => {
        const { container } = render(<Eclipse>{null}</Eclipse>)

        expect(container.querySelectorAll(".xp-eclipse-panel")).toHaveLength(0)
    })

    it("finds a scroll container that mounts around it", () => {
        function Scroller() {
            const port = useRef<HTMLDivElement>(null)
            return (
                <div ref={port} data-testid="port">
                    <Eclipse scrollContainer={port}>{three()}</Eclipse>
                </div>
            )
        }

        const onWindow = vi.spyOn(window, "addEventListener")
        const { getByTestId } = render(<Scroller />)
        const port = getByTestId("port")
        const on = vi.spyOn(port, "removeEventListener")

        expect(onWindow.mock.calls.some(([type]) => type === "scroll")).toBe(false)
        port.dispatchEvent(new Event("scroll"))
        expect(frames.pending()).toBe(1)
        expect(on).not.toHaveBeenCalled()
    })

    it("clears its transforms as soon as it is disabled, without waiting for a scroll", () => {
        const { container, rerender } = render(<Eclipse>{three()}</Eclipse>)
        const panels = [...container.querySelectorAll<HTMLElement>(".xp-eclipse-panel")]
        expect(panels[1].style.transform).not.toBe("")

        rerender(<Eclipse disabled>{three()}</Eclipse>)
        act(() => {
            frames.advance()
        })

        expect(panels.every((panel) => panel.style.transform === "")).toBe(true)
    })

    it("cancels a pending frame on unmount", () => {
        const { unmount } = render(<Eclipse>{three()}</Eclipse>)
        frames.advance()

        window.dispatchEvent(new Event("scroll"))
        expect(frames.pending()).toBe(1)
        unmount()
        expect(frames.pending()).toBe(0)
    })

    it("renders on the server", () => {
        expect(renderToString(<Eclipse>{three()}</Eclipse>)).toContain("Three")
    })
})
