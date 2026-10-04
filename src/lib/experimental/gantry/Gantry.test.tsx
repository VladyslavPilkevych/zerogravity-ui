import { createRef } from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
import { Gantry } from "./Gantry"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

function cars() {
    return ["Rail", "Truss", "Span"].map((label) => <div key={label}>{label}</div>)
}

describe("Gantry", () => {
    it("keeps every car in document order", () => {
        const { container } = render(<Gantry>{cars()}</Gantry>)
        const rail = [...container.querySelectorAll(".xp-gantry-car")]

        expect(rail.map((car) => car.textContent)).toEqual(["Rail", "Truss", "Span"])
    })

    it("reports where the rail has got to", () => {
        const onProgress = vi.fn()
        render(<Gantry onProgress={onProgress}>{cars()}</Gantry>)

        expect(onProgress).toHaveBeenCalled()
        expect(onProgress.mock.calls[0][0]).toBeGreaterThanOrEqual(0)
        expect(onProgress.mock.calls[0][0]).toBeLessThanOrEqual(1)
    })

    it("carries its sizing into CSS", () => {
        const { container } = render(
            <Gantry itemWidth="300px" gap="12px" pace={2}>
                {cars()}
            </Gantry>,
        )
        const host = container.querySelector(".xp-gantry") as HTMLElement

        expect(host.style.getPropertyValue("--gy-width")).toBe("300px")
        expect(host.style.getPropertyValue("--gy-gap")).toBe("12px")
        expect(host.style.getPropertyValue("--gy-pace")).toBe("2")
    })

    it("listens to a container when it is driven by one, and lets go", () => {
        const host = document.createElement("div")
        document.body.append(host)
        const ref = createRef<HTMLElement>()
        Object.assign(ref, { current: host })

        const on = vi.spyOn(host, "addEventListener")
        const off = vi.spyOn(host, "removeEventListener")

        const { unmount } = render(<Gantry scrollContainer={ref as never}>{cars()}</Gantry>)

        expect(on.mock.calls.map(([name]) => name)).toContain("scroll")
        unmount()
        expect(off.mock.calls.map(([name]) => name)).toContain("scroll")
        host.remove()
    })

    it("becomes an ordinary scroller under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Gantry>{cars()}</Gantry>)
        const rail = container.querySelector(".xp-gantry-rail") as HTMLElement

        expect((container.querySelector(".xp-gantry") as HTMLElement).dataset.still).toBe("true")
        expect(rail.style.transform).toBe("")
    })

    it("hands that scroller to the keyboard, since it is a real one", () => {
        mediaState.reducedMotion = true
        const { getByRole } = render(<Gantry label="Case studies">{cars()}</Gantry>)
        const window_ = getByRole("region", { name: "Case studies" })

        expect(window_).toHaveAttribute("tabindex", "0")
    })

    it("stays out of the tab order while it is pinned", () => {
        const { container } = render(<Gantry>{cars()}</Gantry>)

        expect(container.querySelector(".xp-gantry-window")).not.toHaveAttribute("tabindex")
    })
})
