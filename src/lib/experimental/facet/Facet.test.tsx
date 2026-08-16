import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { Facet } from "./Facet"

afterEach(() => {
    mediaState.reducedMotion = false
    mediaState.fine = true
    vi.useRealTimers()
})

describe("Facet", () => {
    it("renders content above the decorative surface", () => {
        const { container, getByText } = render(
            <Facet>
                <h1>Hero</h1>
            </Facet>,
        )

        expect(getByText("Hero")).toBeInTheDocument()
        expect(container.querySelector(".xp-facet-surface")).toHaveAttribute("aria-hidden", "true")
    })

    it("works as a bare background with no children", () => {
        const { container } = render(<Facet />)
        expect(container.querySelector(".xp-facet-content")).toBeNull()
    })

    it("releases its listeners on unmount", () => {
        const remove = vi.spyOn(window, "removeEventListener")
        const { unmount } = render(<Facet />)

        unmount()

        expect(remove.mock.calls.filter(([type]) => type === "pointermove").length).toBeGreaterThan(
            0,
        )
    })

    it("binds no pointer listener under reduced motion", () => {
        mediaState.reducedMotion = true
        const add = vi.spyOn(window, "addEventListener")

        render(<Facet />)

        expect(add.mock.calls.filter(([type]) => type === "pointermove")).toHaveLength(0)
    })

    describe("ambient colour drift", () => {
        beforeEach(() => {
            vi.useFakeTimers()
        })

        it("stays on the first palette entry when ambient is off", () => {
            const { container } = render(<Facet palette={["#111111", "#222222"]} />)
            const root = container.querySelector(".xp-facet") as HTMLElement

            act(() => vi.advanceTimersByTime(60_000))

            expect(root.style.getPropertyValue("--facet-tone")).toBe("#111111")
        })

        it("walks the palette in order and only uses supplied colours", () => {
            const palette = ["#101010", "#202020", "#303030"]
            const { container } = render(<Facet palette={palette} ambient ambientInterval={2000} />)
            const root = container.querySelector(".xp-facet") as HTMLElement

            const seen: string[] = [root.style.getPropertyValue("--facet-tone")]
            for (let i = 0; i < 4; i += 1) {
                act(() => vi.advanceTimersByTime(2000))
                seen.push(root.style.getPropertyValue("--facet-tone"))
            }

            expect(seen).toEqual(["#101010", "#202020", "#303030", "#101010", "#202020"])
            seen.forEach((colour) => expect(palette).toContain(colour))
        })

        it("changes the sweep direction between transitions so the flow is not uniform", () => {
            const { container } = render(
                <Facet palette={["#101010", "#202020"]} ambient ambientInterval={2000} />,
            )
            const root = container.querySelector(".xp-facet") as HTMLElement

            const first = root.style.getPropertyValue("--facet-dx")
            act(() => vi.advanceTimersByTime(2000))
            const second = root.style.getPropertyValue("--facet-dx")

            expect(first).not.toBe(second)
        })

        it("gives facets staggered transition timing", () => {
            const { container } = render(<Facet palette={["#101010", "#202020"]} ambient />)
            const shards = Array.from(
                container.querySelectorAll<HTMLElement>(".xp-facet-shard"),
            ).slice(0, 12)

            const paces = new Set(shards.map((shard) => shard.style.getPropertyValue("--pace")))
            expect(paces.size).toBeGreaterThan(1)
        })

        it("does not drift or render the bloom under reduced motion", () => {
            mediaState.reducedMotion = true
            const { container } = render(
                <Facet palette={["#101010", "#202020"]} ambient ambientInterval={2000} />,
            )
            const root = container.querySelector(".xp-facet") as HTMLElement

            act(() => vi.advanceTimersByTime(20_000))

            expect(root.style.getPropertyValue("--facet-tone")).toBe("#101010")
            expect(container.querySelector(".xp-facet-bloom")).toBeNull()
        })

        it("clears its timer on unmount", () => {
            const clear = vi.spyOn(window, "clearInterval")
            const { unmount } = render(<Facet ambient ambientInterval={2000} />)

            unmount()

            expect(clear).toHaveBeenCalled()
        })
    })
})
