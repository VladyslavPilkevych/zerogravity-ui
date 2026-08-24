import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render } from "@testing-library/react"
import { createRef } from "react"

import { installFrameHarness, type FrameHarness } from "../../test/frames"
import { mediaState } from "../../test/environment"
import { TrailingCursor } from "./TrailingCursor"

function movePointer(x: number, y: number) {
    const event = new Event("pointermove") as PointerEvent
    Object.defineProperty(event, "clientX", { value: x })
    Object.defineProperty(event, "clientY", { value: y })
    Object.defineProperty(event, "pointerType", { value: "mouse" })
    act(() => {
        window.dispatchEvent(event)
    })
}

function pointerOver(target: Element) {
    const event = new Event("pointerover", { bubbles: true }) as PointerEvent
    Object.defineProperty(event, "target", { value: target })
    Object.defineProperty(event, "pointerType", { value: "mouse" })
    act(() => {
        window.dispatchEvent(event)
    })
}

describe("TrailingCursor", () => {
    let frames: FrameHarness

    beforeEach(() => {
        frames = installFrameHarness()
    })

    afterEach(() => {
        frames.restore()
    })

    it("renders both layers hidden from the accessibility tree", () => {
        const { container } = render(<TrailingCursor />)
        const root = container.querySelector(".trailing-cursor")

        expect(root?.getAttribute("aria-hidden")).toBe("true")
        expect(container.querySelector(".trailing-cursor-dot")).not.toBeNull()
        expect(container.querySelector(".trailing-cursor-ring")).not.toBeNull()
    })

    it("renders nothing and attaches no listeners when disabled", () => {
        const listen = vi.spyOn(window, "addEventListener")
        const { container } = render(<TrailingCursor disabled />)

        expect(container.querySelector(".trailing-cursor")).toBeNull()
        expect(listen.mock.calls.filter(([type]) => type === "pointermove")).toHaveLength(0)
    })

    it("never hides the native cursor under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<TrailingCursor />)

        expect(container.querySelector(".trailing-cursor")).toBeNull()
        expect(document.body.classList.contains("trailing-cursor-none")).toBe(false)
    })

    it("marks itself unscoped when it owns the whole page", () => {
        const { container } = render(<TrailingCursor />)

        expect(container.querySelector(".trailing-cursor")).toHaveAttribute("data-scoped", "false")
    })

    it("hides the native cursor while mounted and restores it on unmount", () => {
        const { unmount } = render(<TrailingCursor />)
        expect(document.body.classList.contains("trailing-cursor-none")).toBe(true)

        unmount()
        expect(document.body.classList.contains("trailing-cursor-none")).toBe(false)
    })

    it("leaves the native cursor alone when hideNativeCursor is false", () => {
        render(<TrailingCursor hideNativeCursor={false} />)
        expect(document.body.classList.contains("trailing-cursor-none")).toBe(false)
    })

    it("stops the loop once the ring converges and restarts on the next move", () => {
        render(<TrailingCursor ease={0.5} />)

        expect(frames.pending()).toBe(0)

        movePointer(400, 300)
        expect(frames.pending()).toBe(1)

        act(() => {
            frames.advance(60)
        })
        expect(frames.pending()).toBe(0)

        movePointer(10, 10)
        expect(frames.pending()).toBe(1)
    })

    describe("scoped to a container", () => {
        function mount(rect = { left: 240, top: 80, width: 600, height: 400 }) {
            const host = document.createElement("div")
            Object.defineProperty(host, "clientWidth", { value: rect.width })
            Object.defineProperty(host, "clientHeight", { value: rect.height })
            host.getBoundingClientRect = () =>
                ({
                    ...rect,
                    x: rect.left,
                    y: rect.top,
                    right: rect.left + rect.width,
                    bottom: rect.top + rect.height,
                    toJSON: () => ({}),
                }) as DOMRect
            document.body.appendChild(host)

            const ref = createRef<HTMLDivElement>()
            Object.defineProperty(ref, "current", { value: host, writable: true })

            const view = render(<TrailingCursor container={ref} ease={1} />, { container: host })
            return { host, view }
        }

        it("hides the cursor on the container and never on the body", () => {
            const { host, view } = mount()

            expect(host.classList.contains("trailing-cursor-none")).toBe(true)
            expect(document.body.classList.contains("trailing-cursor-none")).toBe(false)

            view.unmount()
            expect(host.classList.contains("trailing-cursor-none")).toBe(false)
            host.remove()
        })

        it("restores the cursor as soon as it unmounts", () => {
            const { host, view } = mount()
            view.unmount()

            expect(document.querySelectorAll(".trailing-cursor-none")).toHaveLength(0)
            host.remove()
        })

        it("marks itself scoped so it positions inside the container", () => {
            const { host, view } = mount()

            expect(host.querySelector(".trailing-cursor")).toHaveAttribute("data-scoped", "true")

            view.unmount()
            host.remove()
        })

        it("places the dot at container-local coordinates", () => {
            const { host, view } = mount()
            const dot = host.querySelector(".trailing-cursor-dot") as HTMLElement

            act(() => {
                host.dispatchEvent(
                    new PointerEvent("pointermove", {
                        clientX: 300,
                        clientY: 130,
                        pointerType: "mouse",
                    }),
                )
            })
            act(() => {
                frames.advance()
            })

            expect(dot.style.transform).toBe("translate3d(60px, 50px, 0)")

            view.unmount()
            host.remove()
        })

        it("ignores pointer movement outside the container", () => {
            const { host, view } = mount()
            const root = host.querySelector(".trailing-cursor") as HTMLElement

            movePointer(900, 900)

            expect(root.dataset.visible).toBe("false")

            view.unmount()
            host.remove()
        })

        it("hides the custom cursor when the pointer leaves", () => {
            const { host, view } = mount()
            const root = host.querySelector(".trailing-cursor") as HTMLElement

            act(() => {
                host.dispatchEvent(
                    new PointerEvent("pointermove", {
                        clientX: 300,
                        clientY: 130,
                        pointerType: "mouse",
                    }),
                )
            })
            expect(root.dataset.visible).toBe("true")

            act(() => {
                host.dispatchEvent(new PointerEvent("pointerleave"))
            })
            expect(root.dataset.visible).toBe("false")

            view.unmount()
            host.remove()
        })
    })

    it("applies data-cursor overrides from the hovered element", () => {
        const { container } = render(<TrailingCursor />)
        const root = container.querySelector(".trailing-cursor") as HTMLElement

        const target = document.createElement("button")
        target.setAttribute("data-cursor-label", "Open")
        target.setAttribute("data-cursor-color", "#22d3ee")
        target.setAttribute("data-cursor-scale", "2")
        document.body.append(target)

        pointerOver(target)

        expect(root.dataset.labelled).toBe("true")
        expect(container.querySelector(".trailing-cursor-label")?.textContent).toBe("Open")
        expect(root.style.getPropertyValue("--tc-dot")).toBe("#22d3ee")

        const shape = container.querySelector(".trailing-cursor-ring-shape") as HTMLElement
        expect(shape.style.width).toBe("104px")

        target.remove()
    })

    it("hides both layers over data-cursor='hidden'", () => {
        const { container } = render(<TrailingCursor />)
        const root = container.querySelector(".trailing-cursor") as HTMLElement

        const target = document.createElement("div")
        target.setAttribute("data-cursor", "hidden")
        document.body.append(target)

        pointerOver(target)
        expect(root.dataset.hidden).toBe("true")

        target.remove()
    })
})
