import { act, fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { installFrameHarness, type FrameHarness } from "../../test/frames"
import { frameCount } from "../internal"
import { Reel } from "./Reel"

function slides(count = 4) {
    return Array.from({ length: count }, (_, index) => <div key={index}>Slide {index + 1}</div>)
}

describe("Reel", () => {
    let frames: FrameHarness

    beforeEach(() => {
        frames = installFrameHarness()
    })

    afterEach(() => {
        frames.restore()
    })

    it("labels the carousel and every slide", () => {
        const { container } = render(<Reel label="Products">{slides(3)}</Reel>)
        const root = container.querySelector(".reel")

        expect(root?.getAttribute("aria-roledescription")).toBe("carousel")
        expect(root?.getAttribute("aria-label")).toBe("Products")
        expect(container.querySelectorAll('[aria-roledescription="slide"]')).toHaveLength(3)
        expect(container.querySelector(".reel-item")?.getAttribute("aria-label")).toBe("1 of 3")
    })

    it("moves with the arrow buttons when uncontrolled", () => {
        const onIndexChange = vi.fn()
        const { container } = render(<Reel onIndexChange={onIndexChange}>{slides()}</Reel>)

        fireEvent.click(container.querySelector(".reel-arrow-next") as HTMLElement)
        expect(onIndexChange).toHaveBeenLastCalledWith(1)
    })

    it("respects the keyboard", () => {
        const onIndexChange = vi.fn()
        const { container } = render(<Reel onIndexChange={onIndexChange}>{slides()}</Reel>)
        const viewport = container.querySelector(".reel-viewport") as HTMLElement

        fireEvent.keyDown(viewport, { key: "ArrowRight" })
        expect(onIndexChange).toHaveBeenLastCalledWith(1)

        fireEvent.keyDown(viewport, { key: "End" })
        expect(onIndexChange).toHaveBeenLastCalledWith(3)

        fireEvent.keyDown(viewport, { key: "Home" })
        expect(onIndexChange).toHaveBeenLastCalledWith(0)
    })

    it("stays put when controlled and the parent ignores the change", () => {
        const onIndexChange = vi.fn()
        const { container } = render(
            <Reel index={0} onIndexChange={onIndexChange}>
                {slides()}
            </Reel>,
        )

        fireEvent.click(container.querySelector(".reel-arrow-next") as HTMLElement)

        expect(onIndexChange).toHaveBeenCalledWith(1)
        expect(container.querySelector(".reel-dot-active")).toBe(
            container.querySelectorAll(".reel-dot")[0],
        )
    })

    it("disables the edge arrows when not looping", () => {
        const { container } = render(<Reel>{slides()}</Reel>)

        expect((container.querySelector(".reel-arrow-prev") as HTMLButtonElement).disabled).toBe(
            true,
        )
        expect((container.querySelector(".reel-arrow-next") as HTMLButtonElement).disabled).toBe(
            false,
        )
    })

    it("keeps the arrows enabled when looping", () => {
        const { container } = render(<Reel loop>{slides()}</Reel>)

        expect((container.querySelector(".reel-arrow-prev") as HTMLButtonElement).disabled).toBe(
            false,
        )
    })

    it("hides the arrows and dots when asked", () => {
        const { container } = render(
            <Reel arrows={false} dots={false}>
                {slides()}
            </Reel>,
        )

        expect(container.querySelectorAll(".reel-arrow")).toHaveLength(0)
        expect(container.querySelectorAll(".reel-dot")).toHaveLength(0)
    })

    it("ignores neighbour clicks when clickToSelect is off", () => {
        const onIndexChange = vi.fn()
        const { container } = render(
            <Reel clickToSelect={false} onIndexChange={onIndexChange}>
                {slides()}
            </Reel>,
        )

        fireEvent.click(container.querySelectorAll(".reel-item")[2] as HTMLElement)
        expect(onIndexChange).not.toHaveBeenCalled()
    })

    it("publishes the radius so hover decoration follows the card geometry", () => {
        const { container, rerender } = render(<Reel radius={20}>{slides()}</Reel>)
        const root = container.querySelector(".reel") as HTMLElement

        expect(root.style.getPropertyValue("--reel-radius")).toBe("20px")

        rerender(<Reel>{slides()}</Reel>)
        expect(root.style.getPropertyValue("--reel-radius")).toBe("0px")
    })

    it("settles its animation loop and cancels frames on unmount", () => {
        const { container, unmount } = render(<Reel stiffness={20}>{slides()}</Reel>)

        fireEvent.click(container.querySelector(".reel-arrow-next") as HTMLElement)
        act(() => {
            frames.advance(90, 32)
        })

        expect(frames.pending()).toBe(0)

        unmount()
        expect(frames.pending()).toBe(0)
    })

    it("goes idle while a drag is held still", () => {
        const { container } = render(<Reel>{slides()}</Reel>)
        const viewport = container.querySelector(".reel-viewport") as HTMLElement
        viewport.setPointerCapture = () => {}
        viewport.hasPointerCapture = () => false

        fireEvent.pointerDown(viewport, { button: 0, pointerId: 1, clientX: 300 })
        fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 260 })
        expect(frameCount()).toBe(1)

        act(() => frames.advance(1))
        expect(frames.pending()).toBe(0)

        act(() => frames.advance(30))
        expect(frames.pending()).toBe(0)

        fireEvent.pointerMove(viewport, { pointerId: 1, clientX: 240 })
        expect(frames.pending()).toBe(1)
    })

    it("only writes a slide's style when it actually changes", () => {
        const { container } = render(<Reel>{slides()}</Reel>)
        const first = container.querySelector(".reel-item") as HTMLElement
        const writes = vi.fn()
        const style = first.style
        const transform = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(style), "transform")
        Object.defineProperty(style, "transform", {
            configurable: true,
            get: () => transform?.get?.call(style),
            set: (value: string) => {
                writes(value)
                transform?.set?.call(style, value)
            },
        })

        fireEvent.click(container.querySelector(".reel-arrow-next") as HTMLElement)
        act(() => frames.advance(200, 16))
        const values = writes.mock.calls.map(([value]) => value as string)
        expect(values.length).toBeGreaterThan(0)
        expect(values.some((value, i) => i > 0 && value === values[i - 1])).toBe(false)

        writes.mockClear()
        act(() => frames.advance(30, 16))
        expect(writes).not.toHaveBeenCalled()
    })

    describe("drag release", () => {
        let clock = 0
        let now: ReturnType<typeof vi.spyOn>

        beforeEach(() => {
            clock = 0
            now = vi.spyOn(performance, "now").mockImplementation(() => clock)
        })

        afterEach(() => {
            now.mockRestore()
        })

        function setup(props: Partial<Parameters<typeof Reel>[0]> = {}) {
            const onIndexChange = vi.fn()
            const view = render(
                <Reel spacing={340} onIndexChange={onIndexChange} {...props}>
                    {slides(6)}
                </Reel>,
            )
            const viewport = view.container.querySelector(".reel-viewport") as HTMLElement
            viewport.setPointerCapture = () => {}
            viewport.hasPointerCapture = () => false
            viewport.releasePointerCapture = () => {}
            const pointer = { pointerId: 1, isPrimary: true }
            return {
                ...view,
                onIndexChange,
                viewport,
                down(x: number) {
                    fireEvent.pointerDown(viewport, { ...pointer, button: 0, clientX: x })
                },
                move(x: number, at: number) {
                    clock = at
                    fireEvent.pointerMove(viewport, { ...pointer, clientX: x })
                },
                up(x: number, at: number) {
                    clock = at
                    fireEvent.pointerUp(viewport, { ...pointer, clientX: x })
                },
            }
        }

        function centred(container: HTMLElement) {
            return container.querySelector('.reel-item[data-active="true"]')?.textContent
        }

        it("does not fling after the pointer was held still", () => {
            const reel = setup()
            reel.down(600)
            ;[570, 540, 510, 480].forEach((x, i) => reel.move(x, (i + 1) * 16))
            reel.up(480, 600)

            // 120px of 340 is under half a slide: back to the start
            expect(reel.onIndexChange).toHaveBeenLastCalledWith(0)
        })

        it("flings in the latest direction after a reversal", () => {
            const reel = setup()
            reel.down(600)
            ;[535, 470, 405, 340].forEach((x, i) => reel.move(x, (i + 1) * 16))
            ;[345, 350, 355, 360, 365, 370].forEach((x, i) => reel.move(x, 80 + i * 16))
            reel.up(370, 160)

            expect(reel.onIndexChange).toHaveBeenLastCalledWith(0)
        })

        it("projects a flick to the same slide every time", () => {
            const flick = () => {
                clock = 0
                const reel = setup()
                reel.down(600)
                ;[560, 520, 480, 440].forEach((x, i) => reel.move(x, (i + 1) * 16))
                reel.up(440, 70)
                const result = reel.onIndexChange.mock.lastCall?.[0]
                reel.unmount()
                return result
            }

            expect(flick()).toBe(2)
            expect(flick()).toBe(2)
        })

        it("settles without a fling when the browser cancels the pointer", () => {
            const reel = setup()
            reel.down(600)
            ;[560, 520, 480, 440].forEach((x, i) => reel.move(x, (i + 1) * 16))
            clock = 70
            fireEvent.pointerCancel(reel.viewport, { pointerId: 1, clientX: 440 })

            expect(reel.onIndexChange).toHaveBeenLastCalledWith(0)
        })

        it("ends the drag when pointer capture is lost, so the reel keeps animating", () => {
            const reel = setup()
            reel.down(600)
            reel.move(500, 16)
            fireEvent.lostPointerCapture(reel.viewport, { pointerId: 1, clientX: 500 })

            fireEvent.click(reel.container.querySelector(".reel-arrow-next") as HTMLElement)
            act(() => frames.advance(120, 16))

            expect(centred(reel.container)).toBe("Slide 2")
            expect(frames.pending()).toBe(0)
        })

        it("ignores a second finger while a drag is running", () => {
            const reel = setup()
            reel.down(600)
            fireEvent.pointerDown(reel.viewport, {
                pointerId: 2,
                isPrimary: false,
                button: 0,
                clientX: 100,
            })
            reel.move(400, 300)
            reel.up(400, 600)

            // 200px is past half a slide, measured from the first finger
            expect(reel.onIndexChange).toHaveBeenLastCalledWith(1)
        })
    })

    describe("wheel", () => {
        let clock = 0
        let now: ReturnType<typeof vi.spyOn>

        beforeEach(() => {
            clock = 1000
            now = vi.spyOn(performance, "now").mockImplementation(() => clock)
        })

        afterEach(() => {
            now.mockRestore()
        })

        it("steps once per trackpad swipe, momentum tail included", () => {
            const onIndexChange = vi.fn()
            const { container } = render(<Reel onIndexChange={onIndexChange}>{slides(6)}</Reel>)
            const viewport = container.querySelector(".reel-viewport") as HTMLElement

            for (let i = 0; i < 50; i += 1) {
                clock += 16
                fireEvent.wheel(viewport, {
                    deltaX: Math.max(1, Math.round(38 * Math.exp(-i / 12))),
                })
            }

            expect(onIndexChange).toHaveBeenCalledTimes(1)
            expect(onIndexChange).toHaveBeenLastCalledWith(1)
        })

        it("does not add up stray deltas from separate gestures", () => {
            const onIndexChange = vi.fn()
            const { container } = render(<Reel onIndexChange={onIndexChange}>{slides(6)}</Reel>)
            const viewport = container.querySelector(".reel-viewport") as HTMLElement

            for (let i = 0; i < 8; i += 1) {
                clock += 400
                fireEvent.wheel(viewport, { deltaX: 10 })
            }

            expect(onIndexChange).not.toHaveBeenCalled()
        })

        it("still steps on every wheel notch", () => {
            const onIndexChange = vi.fn()
            const { container } = render(<Reel onIndexChange={onIndexChange}>{slides(6)}</Reel>)
            const viewport = container.querySelector(".reel-viewport") as HTMLElement

            for (let i = 0; i < 3; i += 1) {
                clock += 300
                fireEvent.wheel(viewport, { deltaY: 100, shiftKey: true })
            }

            expect(onIndexChange).toHaveBeenCalledTimes(3)
        })
    })
})
