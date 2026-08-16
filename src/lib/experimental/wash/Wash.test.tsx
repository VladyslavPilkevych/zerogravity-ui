import { act, fireEvent, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { Wash } from "./Wash"

const PALETTE = ["#111111", "#222222", "#333333"]

afterEach(() => {
    mediaState.reducedMotion = false
    vi.useRealTimers()
})

function stubBox(element: HTMLElement) {
    element.getBoundingClientRect = () =>
        ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100 }) as DOMRect
}

describe("Wash", () => {
    it("starts on the first palette colour and keeps its layers decorative", () => {
        const { container } = render(<Wash colors={PALETTE} mode="click" />)
        const root = container.querySelector(".xp-wash") as HTMLElement

        expect(root.style.getPropertyValue("--wash-base")).toBe("#111111")
        expect(container.querySelector(".xp-wash-pour")).toBeNull()
    })

    it("keeps foreground content interactive", async () => {
        const onClick = vi.fn()
        const { getByRole } = render(
            <Wash colors={PALETTE} mode="click">
                <button type="button" onClick={onClick}>
                    Call to action
                </button>
            </Wash>,
        )

        await userEvent.click(getByRole("button", { name: "Call to action" }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("pours from the exact pointer position", () => {
        const { container } = render(<Wash colors={PALETTE} mode="click" />)
        const root = container.querySelector(".xp-wash") as HTMLElement
        stubBox(root)

        fireEvent.pointerDown(root, { clientX: 50, clientY: 75 })

        const pour = container.querySelector(".xp-wash-pour") as HTMLElement
        expect(pour.style.getPropertyValue("--wash-x")).toBe("25.00%")
        expect(pour.style.getPropertyValue("--wash-y")).toBe("75.00%")
        expect(pour.style.getPropertyValue("--wash-color")).toBe("#222222")
    })

    it("ignores clicks when the mode is auto only", () => {
        const { container } = render(<Wash colors={PALETTE} mode="auto" />)
        const root = container.querySelector(".xp-wash") as HTMLElement
        stubBox(root)

        fireEvent.pointerDown(root, { clientX: 10, clientY: 10 })

        expect(container.querySelector(".xp-wash-pour")).toBeNull()
    })

    it("advances through the palette without repeating the current colour", () => {
        const { container } = render(<Wash colors={PALETTE} mode="click" duration={100} />)
        const root = container.querySelector(".xp-wash") as HTMLElement
        stubBox(root)

        const seen: string[] = []
        for (let i = 0; i < 3; i += 1) {
            fireEvent.pointerDown(root, { clientX: 10, clientY: 10 })
            const pour = container.querySelector(".xp-wash-pour") as HTMLElement
            seen.push(pour.style.getPropertyValue("--wash-color"))
        }

        expect(seen).toEqual(["#222222", "#333333", "#111111"])
    })

    it("restarts cleanly when triggered mid transition", () => {
        const { container } = render(<Wash colors={PALETTE} mode="click" duration={1000} />)
        const root = container.querySelector(".xp-wash") as HTMLElement
        stubBox(root)

        fireEvent.pointerDown(root, { clientX: 20, clientY: 20 })
        const first = container.querySelector(".xp-wash-pour") as HTMLElement
        const firstColor = first.style.getPropertyValue("--wash-color")

        fireEvent.pointerDown(root, { clientX: 180, clientY: 90 })

        const pours = container.querySelectorAll(".xp-wash-pour")
        expect(pours).toHaveLength(1)
        expect(root.style.getPropertyValue("--wash-base")).toBe(firstColor)
        expect((pours[0] as HTMLElement).style.getPropertyValue("--wash-x")).toBe("90.00%")
    })

    describe("automatic mode", () => {
        beforeEach(() => {
            vi.useFakeTimers()
        })

        it("schedules pours on the configured interval", () => {
            const { container } = render(
                <Wash colors={PALETTE} mode="auto" interval={2000} duration={500} />,
            )

            expect(container.querySelector(".xp-wash-pour")).toBeNull()

            act(() => vi.advanceTimersByTime(2000))
            expect(container.querySelector(".xp-wash-pour")).not.toBeNull()
        })

        it("commits the poured colour once the transition finishes", () => {
            const { container } = render(
                <Wash colors={PALETTE} mode="auto" interval={2000} duration={500} />,
            )
            const root = container.querySelector(".xp-wash") as HTMLElement

            act(() => vi.advanceTimersByTime(2000))
            act(() => vi.advanceTimersByTime(500))

            expect(root.style.getPropertyValue("--wash-base")).toBe("#222222")
            expect(container.querySelector(".xp-wash-pour")).toBeNull()
        })

        it("clears its interval on unmount", () => {
            const clear = vi.spyOn(window, "clearInterval")
            const { unmount } = render(<Wash colors={PALETTE} mode="auto" interval={2000} />)

            unmount()

            expect(clear).toHaveBeenCalled()
        })

        it("schedules nothing when disabled", () => {
            const { container } = render(
                <Wash colors={PALETTE} mode="auto" interval={1000} disabled />,
            )

            act(() => vi.advanceTimersByTime(10_000))

            expect(container.querySelector(".xp-wash-pour")).toBeNull()
        })

        it("swaps colour without an expanding layer under reduced motion", () => {
            mediaState.reducedMotion = true
            const { container } = render(<Wash colors={PALETTE} mode="both" interval={1000} />)
            const root = container.querySelector(".xp-wash") as HTMLElement
            stubBox(root)

            act(() => vi.advanceTimersByTime(10_000))
            expect(container.querySelector(".xp-wash-pour")).toBeNull()

            act(() => {
                fireEvent.pointerDown(root, { clientX: 10, clientY: 10 })
            })

            expect(container.querySelector(".xp-wash-pour")).toBeNull()
            expect(root.style.getPropertyValue("--wash-base")).toBe("#222222")
        })
    })
})
