import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render } from "@testing-library/react"
import { StrictMode, createRef } from "react"

import { frameCount } from "../internal/frames"
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

function dispatch(target: EventTarget, type: string) {
    act(() => {
        target.dispatchEvent(new Event(type, { bubbles: true }))
    })
}

function position(element: Element): [number, number] {
    const [x, y] = (element as HTMLElement).style.translate.split(" ").map(parseFloat)
    return [x, y]
}

function attach(tag: string, attributes: Record<string, string> = {}): HTMLElement {
    const element = document.createElement(tag)
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value)
    document.body.append(element)
    return element
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

            expect(dot.style.translate).toBe("60px 50px")

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

    describe("dot easing", () => {
        function parts(container: HTMLElement) {
            return {
                root: container.querySelector(".trailing-cursor") as HTMLElement,
                dot: container.querySelector(".trailing-cursor-dot") as HTMLElement,
                ring: container.querySelector(".trailing-cursor-ring") as HTMLElement,
            }
        }

        function settleAt(x: number, y: number) {
            movePointer(x, y)
            act(() => {
                frames.advance(400)
            })
        }

        it("pins the dot to the pointer by default", () => {
            const { container } = render(<TrailingCursor variant="dot-only" />)
            const { dot } = parts(container)

            settleAt(100, 100)
            movePointer(400, 300)
            act(() => {
                frames.advance()
            })

            expect(dot.style.translate).toBe("400px 300px")
        })

        it("trails the pointer when dotEase is below 1, then settles and stops", () => {
            const { container } = render(<TrailingCursor variant="dot-only" dotEase={0.2} />)
            const { dot } = parts(container)

            settleAt(100, 100)
            movePointer(400, 300)
            act(() => {
                frames.advance()
            })

            const [x, y] = position(dot)
            expect(x).toBeGreaterThan(100)
            expect(x).toBeLessThan(400)
            expect(y).toBeGreaterThan(100)
            expect(y).toBeLessThan(300)
            expect(frames.pending()).toBe(1)

            act(() => {
                frames.advance(400)
            })

            expect(dot.style.translate).toBe("400px 300px")
            expect(frames.pending()).toBe(0)
        })

        it("places the dot under the pointer on first appearance instead of easing in", () => {
            const { container } = render(<TrailingCursor variant="dot-only" dotEase={0.05} />)
            const { dot } = parts(container)

            movePointer(40, 30)
            act(() => {
                frames.advance()
            })

            expect(dot.style.translate).toBe("40px 30px")
        })

        it("covers the same distance per second at 30, 60 and 120 Hz", () => {
            const travelled = (delta: number, steps: number) => {
                const view = render(<TrailingCursor variant="dot-only" dotEase={0.3} />)
                const { dot } = parts(view.container)

                settleAt(0, 0)
                movePointer(600, 0)
                act(() => {
                    frames.advance()
                    frames.advance(steps, delta)
                })
                const [x] = position(dot)
                view.unmount()
                return x
            }

            const at60 = travelled(1000 / 60, 6)
            expect(travelled(1000 / 30, 3)).toBeCloseTo(at60, 0)
            expect(travelled(1000 / 120, 12)).toBeCloseTo(at60, 0)
        })

        it("runs no ring simulation in dot-only", () => {
            const { container } = render(<TrailingCursor variant="dot-only" ease={0.05} />)
            const { ring } = parts(container)

            settleAt(100, 100)
            movePointer(700, 500)
            act(() => {
                frames.advance()
            })

            expect(ring.style.translate).toBe("")
            expect(frames.pending()).toBe(0)
        })

        it("keeps easing the ring in dot-ring, where it is visible", () => {
            const { container } = render(<TrailingCursor variant="dot-ring" ease={0.05} />)
            const { dot, ring } = parts(container)

            settleAt(100, 100)
            movePointer(700, 500)
            act(() => {
                frames.advance()
            })

            expect(dot.style.translate).toBe("700px 500px")
            expect(position(ring)[0]).toBeLessThan(700)
            expect(frames.pending()).toBe(1)
        })

        it("treats a non-finite dotEase as the pinned default", () => {
            const { container } = render(<TrailingCursor variant="dot-only" dotEase={Number.NaN} />)
            const { dot } = parts(container)

            settleAt(100, 100)
            movePointer(400, 300)
            act(() => {
                frames.advance()
            })

            expect(dot.style.translate).toBe("400px 300px")
        })
    })

    describe("dot hover and press", () => {
        it("keeps both dot scales at 1 by default", () => {
            const { container } = render(<TrailingCursor variant="dot-only" />)
            const root = container.querySelector(".trailing-cursor") as HTMLElement

            expect(root.style.getPropertyValue("--tc-dot-hover-scale")).toBe("1")
            expect(root.style.getPropertyValue("--tc-dot-press-scale")).toBe("1")
            expect(root.dataset.hovering).toBe("false")
            expect(root.dataset.pressed).toBe("false")
        })

        it("exposes hover and press state for the configured scales", () => {
            const { container } = render(
                <TrailingCursor variant="dot-only" dotHoverScale={2.5} dotPressScale={0.6} />,
            )
            const root = container.querySelector(".trailing-cursor") as HTMLElement
            const button = attach("button")

            expect(root.style.getPropertyValue("--tc-dot-hover-scale")).toBe("2.5")
            expect(root.style.getPropertyValue("--tc-dot-press-scale")).toBe("0.6")

            pointerOver(button)
            expect(root.dataset.hovering).toBe("true")

            dispatch(window, "pointerdown")
            expect(root.dataset.pressed).toBe("true")

            dispatch(window, "pointerup")
            expect(root.dataset.pressed).toBe("false")
            expect(root.dataset.hovering).toBe("true")

            pointerOver(attach("div"))
            expect(root.dataset.hovering).toBe("false")

            button.remove()
        })

        it("clamps scales to a sane range", () => {
            const { container } = render(
                <TrailingCursor dotHoverScale={Number.NaN} dotPressScale={-3} />,
            )
            const root = container.querySelector(".trailing-cursor") as HTMLElement

            expect(root.style.getPropertyValue("--tc-dot-hover-scale")).toBe("1")
            expect(root.style.getPropertyValue("--tc-dot-press-scale")).toBe("0")
        })
    })

    describe("text-entry controls", () => {
        const textEntries: [string, Record<string, string>][] = [
            ["input", { type: "text" }],
            ["input", {}],
            ["input", { type: "search" }],
            ["input", { type: "email" }],
            ["textarea", {}],
            ["div", { contenteditable: "true" }],
        ]

        const customCursorControls: [string, Record<string, string>][] = [
            ["button", {}],
            ["input", { type: "checkbox" }],
            ["input", { type: "range" }],
            ["select", {}],
        ]

        it("marks the page so text fields keep their native cursor", () => {
            render(<TrailingCursor />)

            expect(document.body.classList.contains("trailing-cursor-keep-text")).toBe(true)
        })

        it.each(textEntries)("steps the custom cursor aside over <%s %o>", (tag, attributes) => {
            const { container } = render(<TrailingCursor />)
            const root = container.querySelector(".trailing-cursor") as HTMLElement
            const field = attach(tag, attributes)

            pointerOver(field)
            expect(root.dataset.hidden).toBe("true")

            pointerOver(attach("div"))
            expect(root.dataset.hidden).toBe("false")

            field.remove()
        })

        it("treats text inside a contenteditable region as text entry", () => {
            const { container } = render(<TrailingCursor />)
            const root = container.querySelector(".trailing-cursor") as HTMLElement
            const editor = attach("div", { contenteditable: "" })
            const word = document.createElement("strong")
            editor.append(word)

            pointerOver(word)
            expect(root.dataset.hidden).toBe("true")

            editor.remove()
        })

        it.each(customCursorControls)("keeps the custom cursor over <%s %o>", (tag, attributes) => {
            const { container } = render(<TrailingCursor />)
            const root = container.querySelector(".trailing-cursor") as HTMLElement
            const control = attach(tag, attributes)

            pointerOver(control)
            expect(root.dataset.hidden).toBe("false")
            expect(root.dataset.hovering).toBe("true")

            control.remove()
        })

        it("restores the previous behaviour with preserveTextCursor={false}", () => {
            const { container } = render(<TrailingCursor preserveTextCursor={false} />)
            const root = container.querySelector(".trailing-cursor") as HTMLElement
            const field = attach("input", { type: "text" })

            expect(document.body.classList.contains("trailing-cursor-none")).toBe(true)
            expect(document.body.classList.contains("trailing-cursor-keep-text")).toBe(false)

            pointerOver(field)
            expect(root.dataset.hidden).toBe("false")

            field.remove()
        })

        it("removes both cursor classes on unmount", () => {
            const { unmount } = render(<TrailingCursor />)
            unmount()

            expect(document.body.classList.contains("trailing-cursor-none")).toBe(false)
            expect(document.body.classList.contains("trailing-cursor-keep-text")).toBe(false)
        })
    })

    describe("press lifecycle", () => {
        function mountScoped() {
            const host = document.createElement("div")
            document.body.appendChild(host)
            const ref = createRef<HTMLDivElement>()
            Object.defineProperty(ref, "current", { value: host, writable: true })
            const view = render(<TrailingCursor container={ref} ease={1} />, { container: host })
            const root = host.querySelector(".trailing-cursor") as HTMLElement
            const shape = host.querySelector(".trailing-cursor-ring-shape") as HTMLElement
            return { host, view, root, shape }
        }

        it("releases when the pointer comes up outside the scoped container", () => {
            const { host, view, root, shape } = mountScoped()

            dispatch(host, "pointerdown")
            expect(root.dataset.pressed).toBe("true")
            expect(shape.style.width).toBe("26px")

            dispatch(document.body, "pointerup")
            act(() => {
                host.dispatchEvent(
                    new PointerEvent("pointermove", {
                        clientX: 10,
                        clientY: 10,
                        pointerType: "mouse",
                    }),
                )
            })

            expect(root.dataset.pressed).toBe("false")
            expect(shape.style.width).toBe("34px")

            view.unmount()
            host.remove()
        })

        it.each([
            ["pointercancel", window],
            ["blur", window],
        ] as const)("releases on %s", (type, target) => {
            const { host, view, root, shape } = mountScoped()

            dispatch(host, "pointerdown")
            dispatch(target, type)

            expect(root.dataset.pressed).toBe("false")
            expect(shape.style.width).toBe("34px")

            view.unmount()
            host.remove()
        })

        it("listens globally for the release only while pressed", () => {
            const listen = vi.spyOn(window, "addEventListener")
            const { host, view } = mountScoped()
            const releaseListeners = () =>
                listen.mock.calls.filter(([type]) => type === "pointerup").length

            expect(releaseListeners()).toBe(0)

            dispatch(host, "pointerdown")
            expect(releaseListeners()).toBe(1)

            view.unmount()
            host.remove()
        })
    })

    describe("cleanup", () => {
        const WATCHED = [
            "pointermove",
            "pointerover",
            "pointerdown",
            "pointerup",
            "pointercancel",
            "blur",
        ]

        function trackListeners() {
            const live = new Map<string, Set<unknown>>()
            const add = window.addEventListener.bind(window)
            const remove = window.removeEventListener.bind(window)
            vi.spyOn(window, "addEventListener").mockImplementation((type, listener, options) => {
                if (!live.has(type)) live.set(type, new Set())
                live.get(type)?.add(listener)
                add(type, listener, options)
            })
            vi.spyOn(window, "removeEventListener").mockImplementation(
                (type, listener, options) => {
                    live.get(type)?.delete(listener)
                    remove(type, listener, options)
                },
            )
            return (type: string) => live.get(type)?.size ?? 0
        }

        it("removes every window listener on unmount, including a pending release", () => {
            const net = trackListeners()
            const { unmount } = render(<TrailingCursor />)

            dispatch(window, "pointerdown")
            unmount()

            for (const type of WATCHED) expect(net(type)).toBe(0)
        })

        it("leaves one logical set of listeners after a StrictMode remount", () => {
            const net = trackListeners()
            const { container, unmount } = render(
                <StrictMode>
                    <TrailingCursor variant="dot-only" dotEase={0.2} />
                </StrictMode>,
            )

            expect(net("pointermove")).toBe(1)
            expect(net("pointerover")).toBe(1)
            expect(net("pointerdown")).toBe(1)

            movePointer(100, 100)
            movePointer(400, 300)
            act(() => {
                frames.advance()
            })
            expect(container.querySelector(".trailing-cursor")).toHaveAttribute(
                "data-visible",
                "true",
            )
            expect(frameCount()).toBe(1)

            unmount()
            for (const type of WATCHED) expect(net(type)).toBe(0)
        })

        it("stops the animation loop on unmount", () => {
            const { unmount } = render(<TrailingCursor variant="dot-only" dotEase={0.1} />)

            movePointer(100, 100)
            movePointer(500, 400)
            act(() => {
                frames.advance()
            })
            expect(frames.pending()).toBe(1)

            unmount()

            expect(frames.pending()).toBe(0)
            expect(frameCount()).toBe(0)
        })

        it("still renders nothing on a coarse pointer", () => {
            mediaState.fine = false
            const { container } = render(<TrailingCursor />)

            expect(container.querySelector(".trailing-cursor")).toBeNull()
            expect(document.body.classList.contains("trailing-cursor-none")).toBe(false)
        })
    })
})
