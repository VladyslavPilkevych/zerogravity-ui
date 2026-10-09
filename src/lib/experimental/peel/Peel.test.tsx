import { createRef } from "react"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
import { Peel } from "./Peel"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

describe("Peel", () => {
    it("keeps both layers in the document, not just the one on top", () => {
        const { getByText } = render(<Peel front={<p>Cover</p>} back={<p>Underneath</p>} />)

        expect(getByText("Cover")).toBeInTheDocument()
        expect(getByText("Underneath")).toBeInTheDocument()
    })

    it("carries the lifting corner onto the track", () => {
        const { container } = render(<Peel corner="bottom-left" front={<p>a</p>} back={<p>b</p>} />)

        expect((container.querySelector(".xp-peel") as HTMLElement).dataset.corner).toBe(
            "bottom-left",
        )
    })

    it("hides the crease from the accessibility tree", () => {
        const { container } = render(<Peel front={<p>a</p>} back={<p>b</p>} />)

        expect(container.querySelector(".xp-peel-crease")).toHaveAttribute("aria-hidden", "true")
    })

    it("listens to a container when it is driven by one, and lets go", () => {
        const host = document.createElement("div")
        document.body.append(host)
        const ref = createRef<HTMLElement>()
        Object.assign(ref, { current: host })

        const on = vi.spyOn(host, "addEventListener")
        const off = vi.spyOn(host, "removeEventListener")

        const { unmount } = render(
            <Peel scrollContainer={ref as never} front={<p>a</p>} back={<p>b</p>} />,
        )

        expect(on.mock.calls.map(([name]) => name)).toContain("scroll")
        unmount()
        expect(off.mock.calls.map(([name]) => name)).toContain("scroll")
        host.remove()
    })

    it("drops the lift entirely under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Peel front={<p>a</p>} back={<p>b</p>} />)
        const sheet = container.querySelector(".xp-peel-sheet") as HTMLElement

        expect((container.querySelector(".xp-peel") as HTMLElement).dataset.still).toBe("true")
        expect(sheet.style.getPropertyValue("--pe-lift")).toBe("0")
    })

    it("shows a given progress at once and names the phase", () => {
        const { container } = render(<Peel progress={0.4} front={<p>a</p>} back={<p>b</p>} />)
        const track = container.querySelector(".xp-peel") as HTMLElement
        const sheet = container.querySelector(".xp-peel-sheet") as HTMLElement

        expect(sheet.style.getPropertyValue("--pe-lift")).toBe("0.4000")
        expect(track.dataset.phase).toBe("moving")
    })

    it("sizes the track from lead, travel and hold", () => {
        const { container } = render(
            <Peel lead={0.5} travel={2} hold={1} front={<p>a</p>} back={<p>b</p>} />,
        )

        expect(
            (container.querySelector(".xp-peel") as HTMLElement).style.getPropertyValue(
                "--pe-span",
            ),
        ).toBe("3.5")
    })

    it("eases towards the scroll position and then goes idle", () => {
        const { container, unmount } = render(
            <Peel lead={0} travel={1} hold={0.5} front={<p>a</p>} back={<p>b</p>} />,
        )
        const track = container.querySelector(".xp-peel") as HTMLElement
        const sheet = container.querySelector(".xp-peel-sheet") as HTMLElement
        const lift = () => Number(sheet.style.getPropertyValue("--pe-lift"))
        frames.advance(2)

        vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
            top: -window.innerHeight / 2,
        } as DOMRect)
        act(() => {
            window.dispatchEvent(new Event("scroll"))
        })
        frames.advance()

        expect(lift()).toBeGreaterThan(0)
        expect(lift()).toBeLessThan(0.5)

        frames.advance(240)
        expect(lift()).toBeCloseTo(0.5, 3)
        expect(track.dataset.phase).toBe("moving")
        expect(frames.pending()).toBe(0)

        unmount()
        expect(frames.pending()).toBe(0)
    })
})
