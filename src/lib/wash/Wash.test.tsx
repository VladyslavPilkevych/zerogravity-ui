import { act, fireEvent, render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { installCanvasHarness, installFrameHarness } from "../../test/frames"
import { frameCount } from "../internal"
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
    let surface: ReturnType<typeof installCanvasHarness>

    beforeEach(() => {
        surface = installCanvasHarness()
    })

    afterEach(() => {
        surface.restore()
    })

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

    it("renders on the server without touching the DOM", () => {
        const html = renderToString(
            <Wash colors={PALETTE} mode="both">
                <h1>Hero</h1>
            </Wash>,
        )

        expect(html).toContain("Hero")
        expect(html).toContain("--wash-base:#111111")
    })

    it("pours on a finger's tap, not on a swipe that scrolls the page", () => {
        const { container } = render(<Wash colors={PALETTE} mode="click" />)
        const root = container.querySelector(".xp-wash") as HTMLElement
        stubBox(root)

        // a swipe: the browser cancels the pointer and sends no click
        fireEvent.pointerDown(root, { clientX: 50, clientY: 50, pointerType: "touch" })
        fireEvent.pointerCancel(root, { pointerType: "touch" })
        expect(container.querySelector(".xp-wash-pour")).toBeNull()

        fireEvent.pointerDown(root, { clientX: 150, clientY: 25, pointerType: "touch" })
        fireEvent.click(root, { clientX: 150, clientY: 25, detail: 1 })

        const pour = container.querySelector(".xp-wash-pour") as HTMLElement
        expect(pour.style.getPropertyValue("--wash-x")).toBe("75.00%")
        expect(pour.style.getPropertyValue("--wash-y")).toBe("25.00%")
    })

    it("does not pour twice for one mouse click", () => {
        const { container } = render(<Wash colors={PALETTE} mode="click" />)
        const root = container.querySelector(".xp-wash") as HTMLElement
        stubBox(root)

        fireEvent.pointerDown(root, { clientX: 50, clientY: 50, pointerType: "mouse" })
        fireEvent.click(root, { clientX: 50, clientY: 50, detail: 1 })

        const pour = container.querySelector(".xp-wash-pour") as HTMLElement
        expect(pour.style.getPropertyValue("--wash-color")).toBe("#222222")
    })

    it("pours from a control pressed with the keyboard", async () => {
        const user = userEvent.setup()
        const { container, getByRole } = render(
            <Wash colors={PALETTE} mode="click">
                <button type="button">Go</button>
            </Wash>,
        )
        const root = container.querySelector(".xp-wash") as HTMLElement
        const button = getByRole("button", { name: "Go" })
        stubBox(root)
        button.getBoundingClientRect = () =>
            ({ left: 40, top: 40, width: 40, height: 20, right: 80, bottom: 60 }) as DOMRect

        button.focus()
        await user.keyboard("{Enter}")

        const pour = container.querySelector(".xp-wash-pour") as HTMLElement
        expect(pour.style.getPropertyValue("--wash-x")).toBe("30.00%")
        expect(pour.style.getPropertyValue("--wash-y")).toBe("50.00%")
    })

    it("leaves the keyboard alone when the mode is auto only", async () => {
        const user = userEvent.setup()
        const { container, getByRole } = render(
            <Wash colors={PALETTE} mode="auto">
                <button type="button">Go</button>
            </Wash>,
        )

        getByRole("button", { name: "Go" }).focus()
        await user.keyboard("{Enter}")

        expect(container.querySelector(".xp-wash-pour")).toBeNull()
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

        it("skips automatic pours while the surface is offscreen", () => {
            const scope = globalThis as Record<string, unknown>
            const original = scope.IntersectionObserver
            let report: (entries: Array<{ isIntersecting: boolean }>) => void = () => {}
            scope.IntersectionObserver = class {
                constructor(run: typeof report) {
                    report = run
                }
                observe() {}
                disconnect() {}
            }
            try {
                const { container } = render(
                    <Wash colors={PALETTE} mode="auto" interval={1000} duration={200} />,
                )

                act(() => report([{ isIntersecting: false }]))
                act(() => vi.advanceTimersByTime(5000))
                expect(container.querySelector(".xp-wash-pour")).toBeNull()

                act(() => report([{ isIntersecting: true }]))
                act(() => vi.advanceTimersByTime(1000))
                expect(container.querySelector(".xp-wash-pour")).not.toBeNull()
            } finally {
                scope.IntersectionObserver = original
            }
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

function countingCanvas() {
    let squares = 0
    const context = {
        globalAlpha: 1,
        fillStyle: "",
        setTransform: () => {},
        clearRect: () => {},
        fillRect: () => {
            squares += 1
        },
    }
    const spy = vi
        .spyOn(HTMLCanvasElement.prototype, "getContext")
        .mockImplementation(() => context as unknown as CanvasRenderingContext2D)

    return {
        take() {
            const total = squares
            squares = 0
            return total
        },
        restore: () => spy.mockRestore(),
    }
}

describe("Wash pixel burst", () => {
    let canvas: ReturnType<typeof countingCanvas>
    let frames: ReturnType<typeof installFrameHarness>

    beforeEach(() => {
        canvas = countingCanvas()
        frames = installFrameHarness()
    })

    afterEach(() => {
        frames.restore()
        canvas.restore()
    })

    function mount(props: Partial<Parameters<typeof Wash>[0]> = {}) {
        const view = render(<Wash colors={PALETTE} mode="click" {...props} />)
        const root = view.container.querySelector(".xp-wash") as HTMLElement
        stubBox(root)
        return { ...view, root }
    }

    it("draws fragments on a decorative canvas and idles once they fade", () => {
        const { container, root } = mount()

        expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true")
        expect(frames.pending()).toBe(0)

        fireEvent.pointerDown(root, { clientX: 100, clientY: 50 })
        frames.advance(1)
        expect(canvas.take()).toBeGreaterThan(0)

        frames.advance(80, 16)
        canvas.take()
        expect(frames.pending()).toBe(0)
        expect(frameCount()).toBe(0)
    })

    it("keeps the fragment pool bounded however often it is clicked", () => {
        const { container, root } = mount()

        for (let i = 0; i < 500; i += 1) {
            fireEvent.pointerDown(root, { clientX: (i * 7) % 200, clientY: (i * 3) % 100 })
            if (i % 10 === 0) frames.advance(1)
        }
        canvas.take()
        frames.advance(1)

        expect(canvas.take()).toBeLessThanOrEqual(48 + 4)
        expect(container.querySelectorAll("canvas")).toHaveLength(1)
        expect(container.querySelectorAll(".xp-wash-pour")).toHaveLength(1)
        expect(frameCount()).toBe(1)
        expect(frames.pending()).toBe(1)

        frames.advance(80, 16)
        expect(frameCount()).toBe(0)
    })

    it("tints the fragments from any colour syntax the canvas understands", () => {
        const fills: string[] = []
        canvas.restore()
        const context = {
            globalAlpha: 1,
            setTransform: () => {},
            clearRect: () => {},
            fillRect: () => fills.push(context.fillStyle),
            fillStyle: "",
        }
        const spy = vi
            .spyOn(HTMLCanvasElement.prototype, "getContext")
            .mockImplementation(() => context as unknown as CanvasRenderingContext2D)
        const view = render(<Wash colors={["#000000", "rgb(0, 0, 255)"]} mode="click" />)
        const root = view.container.querySelector(".xp-wash") as HTMLElement
        stubBox(root)

        fireEvent.pointerDown(root, { clientX: 100, clientY: 50 })
        frames.advance(1)

        expect(fills).toContain("rgb(199, 199, 255)")
        expect(fills).not.toContain("rgba(255, 255, 255, 0.9)")
        spy.mockRestore()
    })

    it("draws no burst under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container, root } = mount()

        fireEvent.pointerDown(root, { clientX: 100, clientY: 50 })
        frames.advance(4)

        expect(container.querySelector("canvas")).toBeNull()
        expect(canvas.take()).toBe(0)
        expect(frames.pending()).toBe(0)
    })

    it("draws no burst when switched off", () => {
        const { container, root } = mount({ burst: false })

        fireEvent.pointerDown(root, { clientX: 100, clientY: 50 })
        frames.advance(4)

        expect(container.querySelector("canvas")).toBeNull()
        expect(canvas.take()).toBe(0)
    })

    it("stops its frame subscription on unmount mid burst", () => {
        const { root, unmount } = mount()

        fireEvent.pointerDown(root, { clientX: 100, clientY: 50 })
        frames.advance(2)
        expect(frameCount()).toBe(1)

        unmount()
        expect(frameCount()).toBe(0)
        expect(frames.pending()).toBe(0)
    })

    it("holds a frozen burst without starting a loop", () => {
        const { container, root } = mount({ freezeAt: 0.4 })

        fireEvent.pointerDown(root, { clientX: 100, clientY: 50 })

        expect(canvas.take()).toBeGreaterThan(0)
        expect(frames.pending()).toBe(0)
        expect(container.querySelector(".xp-wash-pour")).toHaveStyle({
            animationPlayState: "paused",
        })
    })
})
