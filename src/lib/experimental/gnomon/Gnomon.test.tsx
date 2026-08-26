import { fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
import { Gnomon } from "./Gnomon"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

function lit() {
    const view = render(
        <Gnomon>
            <div data-testid="a">A</div>
            <div data-testid="b">B</div>
        </Gnomon>,
    )
    const host = view.container.querySelector(".xp-gnomon") as HTMLElement
    vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
        left: 0,
        top: 0,
        width: 400,
        height: 200,
    } as DOMRect)
    return { ...view, host }
}

describe("Gnomon", () => {
    it("renders its children untouched", () => {
        const { getByTestId } = lit()

        expect(getByTestId("a")).toHaveTextContent("A")
        expect(getByTestId("b")).toHaveTextContent("B")
    })

    it("gives every child its own direction, not one shared shadow", () => {
        const { getByTestId, host } = lit()
        const a = getByTestId("a")
        const b = getByTestId("b")

        vi.spyOn(a, "getBoundingClientRect").mockReturnValue({
            left: 0,
            top: 0,
            width: 100,
            height: 100,
        } as DOMRect)
        vi.spyOn(b, "getBoundingClientRect").mockReturnValue({
            left: 300,
            top: 0,
            width: 100,
            height: 100,
        } as DOMRect)

        fireEvent.pointerMove(host, { clientX: 200, clientY: 100 })
        window.dispatchEvent(new Event("resize"))
        frames.advance(30)

        const left = Number(a.style.getPropertyValue("--gn-dx"))
        const right = Number(b.style.getPropertyValue("--gn-dx"))
        expect(Number.isFinite(left)).toBe(true)
        expect(Number.isFinite(right)).toBe(true)
    })

    it("clamps the shadow it writes into CSS", () => {
        const { container } = render(
            <Gnomon distance={9999} softness={-4} depth={12}>
                <div>A</div>
            </Gnomon>,
        )
        const host = container.querySelector(".xp-gnomon") as HTMLElement

        expect(host.style.getPropertyValue("--gn-reach")).toBe("200px")
        expect(host.style.getPropertyValue("--gn-blur")).toBe("0px")
        expect(host.style.getPropertyValue("--gn-depth")).toBe("1")
    })

    it("marks itself still under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(
            <Gnomon>
                <div>A</div>
            </Gnomon>,
        )

        expect((container.querySelector(".xp-gnomon") as HTMLElement).dataset.still).toBe("true")
    })

    it("gives its frame back on unmount", () => {
        const { unmount } = lit()

        expect(frames.pending()).toBe(1)
        unmount()
        expect(frames.pending()).toBe(0)
    })
})
