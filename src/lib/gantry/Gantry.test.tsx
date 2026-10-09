import { createRef } from "react"
import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { installFrameHarness } from "../../test/frames"
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

    it("names the phase of a given progress", () => {
        const { container, rerender } = render(<Gantry progress={0.5}>{cars()}</Gantry>)
        const host = container.querySelector(".xp-gantry") as HTMLElement

        expect(host.dataset.phase).toBe("moving")
        rerender(<Gantry progress={1}>{cars()}</Gantry>)
        expect(host.dataset.phase).toBe("holding")
    })

    it("sizes the track from the stops, pace and hold", () => {
        const { container } = render(
            <Gantry pace={0.5} hold={0.25}>
                {cars()}
            </Gantry>,
        )
        const host = container.querySelector(".xp-gantry") as HTMLElement

        expect(host.style.getPropertyValue("--gy-count")).toBe("2")
        expect(host.style.getPropertyValue("--gy-pace")).toBe("0.5")
        expect(host.style.getPropertyValue("--gy-hold")).toBe("0.25")
    })

    it("goes idle once a scroll has been followed, and leaves nothing behind", () => {
        const { unmount } = render(<Gantry>{cars()}</Gantry>)
        frames.advance(2)

        act(() => {
            window.dispatchEvent(new Event("scroll"))
        })
        expect(frames.pending()).toBe(1)
        frames.advance(120)
        expect(frames.pending()).toBe(0)

        act(() => {
            window.dispatchEvent(new Event("scroll"))
        })
        unmount()
        expect(frames.pending()).toBe(0)
    })

    describe("the active car", () => {
        const PITCH = 120
        let restore: () => void

        // jsdom has no layout, so give the cars a row of 100px boxes 20px apart
        // in a 250px window
        beforeEach(() => {
            const proto = HTMLElement.prototype
            const saved = ["offsetLeft", "offsetWidth", "clientWidth"].map(
                (key) => [key, Object.getOwnPropertyDescriptor(proto, key)] as const,
            )
            const isCar = (node: HTMLElement) => node.classList.contains("xp-gantry-car")
            Object.defineProperties(proto, {
                offsetLeft: {
                    configurable: true,
                    get(this: HTMLElement) {
                        if (!isCar(this) || !this.parentElement) return 0
                        return 20 + [...this.parentElement.children].indexOf(this) * PITCH
                    },
                },
                offsetWidth: {
                    configurable: true,
                    get(this: HTMLElement) {
                        return isCar(this) ? 100 : 0
                    },
                },
                clientWidth: {
                    configurable: true,
                    get(this: HTMLElement) {
                        return this.classList.contains("xp-gantry-window") ? 250 : 0
                    },
                },
            })
            restore = () => {
                for (const [key, descriptor] of saved) {
                    if (descriptor) Object.defineProperty(proto, key, descriptor)
                    else delete (proto as unknown as Record<string, unknown>)[key]
                }
            }
        })

        afterEach(() => restore())

        function active(container: HTMLElement) {
            return [...container.querySelectorAll<HTMLElement>(".xp-gantry-car")]
                .map((car, index) => (car.dataset.active === "true" ? index : -1))
                .filter((index) => index >= 0)
        }

        const five = () => ["A", "B", "C", "D", "E"].map((label) => <div key={label}>{label}</div>)

        it("marks exactly one car, sweeping from the first to the last in order", () => {
            const { container, rerender } = render(<Gantry progress={0}>{five()}</Gantry>)
            expect(active(container)).toEqual([0])

            const seen: number[] = []
            for (let step = 0; step <= 20; step++) {
                rerender(<Gantry progress={step / 20}>{five()}</Gantry>)
                const [index] = active(container)
                expect(active(container)).toHaveLength(1)
                if (seen[seen.length - 1] !== index) seen.push(index)
            }

            // every car gets its turn, even though the rail runs out early
            expect(seen).toEqual([0, 1, 2, 3, 4])
        })

        it("lights nothing once the rail is an ordinary scroller", () => {
            const { container, rerender } = render(<Gantry progress={0.5}>{five()}</Gantry>)
            expect(active(container)).toEqual([2])

            rerender(
                <Gantry progress={0.5} disabled>
                    {five()}
                </Gantry>,
            )
            expect(active(container)).toEqual([])
        })

        it("ends with the rail's end padding showing, not the last car flush to the edge", () => {
            const real = window.getComputedStyle
            const spy = vi.spyOn(window, "getComputedStyle").mockImplementation((node, pseudo) => {
                const style = real(node, pseudo)
                if (!(node as HTMLElement).classList.contains("xp-gantry-rail")) return style
                return {
                    ...style,
                    paddingLeft: "20px",
                    paddingRight: "20px",
                } as CSSStyleDeclaration
            })

            const { container } = render(<Gantry progress={1}>{five()}</Gantry>)
            const rail = container.querySelector(".xp-gantry-rail") as HTMLElement

            // four pitches plus the last car plus both paddings, less the window
            expect(rail.style.transform).toBe("translate3d(-370.00px,0,0)")
            spy.mockRestore()
        })

        it("keeps the mark when the cars are replaced", () => {
            const { container, rerender } = render(<Gantry progress={1}>{five()}</Gantry>)
            expect(active(container)).toEqual([4])

            rerender(<Gantry progress={1}>{[...five(), <div key="F">F</div>]}</Gantry>)
            expect(active(container)).toEqual([5])
        })
    })
})
