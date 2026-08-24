import { render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { Ricochet } from "./Ricochet"

afterEach(() => {
    mediaState.reducedMotion = false
})

function shell(container: HTMLElement) {
    return container.querySelector(".xp-ricochet") as HTMLElement
}

describe("Ricochet", () => {
    it("keeps the text readable as real text", () => {
        const { getByText } = render(<Ricochet text="404" />)

        expect(getByText("404")).toBeInTheDocument()
        expect(getByText("404").className).toContain("xp-ricochet-sr")
    })

    it("keeps a custom word readable too", () => {
        const { getByText } = render(<Ricochet text="LOST" />)

        expect(getByText("LOST")).toBeInTheDocument()
    })

    it("hides the canvas from assistive technology", () => {
        const { container } = render(<Ricochet />)
        const canvas = container.querySelector("canvas")

        expect(canvas).not.toBeNull()
        expect(canvas?.getAttribute("aria-hidden")).toBe("true")
    })

    it("labels the play area and lets the keyboard reach it", () => {
        const { getByRole } = render(<Ricochet text="404" />)
        const stage = getByRole("group")

        expect(stage.getAttribute("aria-label")).toContain("404")
        expect(stage.getAttribute("tabindex")).toBe("0")
    })

    it("drops out of the tab order when it is not interactive", () => {
        const { getByRole } = render(<Ricochet interactive={false} />)

        expect(getByRole("group").getAttribute("tabindex")).toBeNull()
    })

    it("only hides the cursor over its own play area", () => {
        const { container } = render(<Ricochet />)

        expect(shell(container).dataset.hideCursor).toBe("true")
        expect(document.body.style.cursor).toBe("")
    })

    it("leaves the cursor alone when asked", () => {
        const { container } = render(<Ricochet hideCursor={false} />)

        expect(shell(container).dataset.hideCursor).toBeUndefined()
    })

    it("carries the palette as custom properties", () => {
        const { container } = render(
            <Ricochet color="#ff0000" ballColor="#00ff00" paddleColor="#0000ff" />,
        )
        const style = shell(container).getAttribute("style") ?? ""

        expect(style).toContain("--ric-block: #ff0000")
        expect(style).toContain("--ric-ball: #00ff00")
        expect(style).toContain("--ric-paddle: #0000ff")
    })

    it("marks the chosen variant", () => {
        for (const variant of ["neon", "mono", "soft"] as const) {
            const view = render(<Ricochet variant={variant} />)
            expect(shell(view.container).dataset.variant).toBe(variant)
            view.unmount()
        }
    })

    it("passes className and style through", () => {
        const { container } = render(<Ricochet className="mine" style={{ minHeight: "40rem" }} />)

        expect(shell(container).className).toContain("mine")
        expect(shell(container).style.minHeight).toBe("40rem")
    })

    it("runs one animation loop and stops it on unmount", () => {
        const start = vi.spyOn(globalThis, "requestAnimationFrame")
        const stop = vi.spyOn(globalThis, "cancelAnimationFrame")

        const { unmount } = render(<Ricochet />)
        expect(start).toHaveBeenCalled()

        unmount()
        expect(stop).toHaveBeenCalled()

        start.mockRestore()
        stop.mockRestore()
    })

    it("never starts a loop under reduced motion", () => {
        mediaState.reducedMotion = true
        const start = vi.spyOn(globalThis, "requestAnimationFrame")

        const { container, getByText } = render(<Ricochet text="404" />)

        expect(start).not.toHaveBeenCalled()
        expect(shell(container).dataset.phase).toBe("idle")
        expect(getByText("404")).toBeInTheDocument()
        start.mockRestore()
    })

    it("shows no hint and no cursor hiding under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Ricochet />)

        expect(container.querySelector(".xp-ricochet-hint")).toBeNull()
        expect(shell(container).dataset.hideCursor).toBeUndefined()
        expect(container.querySelector(".xp-ricochet-stage")?.getAttribute("tabindex")).toBeNull()
    })

    it("plays anyway when reduced motion is not respected", () => {
        mediaState.reducedMotion = true
        const start = vi.spyOn(globalThis, "requestAnimationFrame")

        render(<Ricochet respectReducedMotion={false} />)

        expect(start).toHaveBeenCalled()
        start.mockRestore()
    })

    it("watches its box for resizes and lets go on unmount", () => {
        const watch = vi.spyOn(globalThis.ResizeObserver.prototype, "observe")
        const stop = vi.spyOn(globalThis.ResizeObserver.prototype, "disconnect")

        const { unmount } = render(<Ricochet />)
        expect(watch).toHaveBeenCalledTimes(1)

        unmount()
        expect(stop).toHaveBeenCalled()

        watch.mockRestore()
        stop.mockRestore()
    })

    it("shows a hint until play begins", () => {
        const { container } = render(<Ricochet hint="move to play" />)

        expect(container.querySelector(".xp-ricochet-hint")?.textContent).toBe("move to play")
        expect(container.querySelector(".xp-ricochet-hint")?.getAttribute("aria-hidden")).toBe(
            "true",
        )
    })

    it("can go without a hint", () => {
        const { container } = render(<Ricochet hint="" />)

        expect(container.querySelector(".xp-ricochet-hint")).toBeNull()
    })

    it("survives a platform with no 2d context", () => {
        expect(() => render(<Ricochet text="OOPS" />)).not.toThrow()
    })

    it("rebuilds cleanly when the text changes", () => {
        const { rerender, getByText, queryByText } = render(<Ricochet text="404" />)
        expect(getByText("404")).toBeInTheDocument()

        rerender(<Ricochet text="OOPS" />)

        expect(getByText("OOPS")).toBeInTheDocument()
        expect(queryByText("404")).toBeNull()
    })

    it("marks which game is running", () => {
        const { container, rerender } = render(<Ricochet />)
        expect(shell(container).dataset.game).toBe("breakout")

        rerender(<Ricochet game="shooter" />)
        expect(shell(container).dataset.game).toBe("shooter")
    })

    it("describes the controls of the running game", () => {
        const { getByRole, rerender } = render(<Ricochet text="404" />)
        expect(getByRole("group").getAttribute("aria-label")).toContain("paddle")

        rerender(<Ricochet text="404" game="shooter" />)
        expect(getByRole("group").getAttribute("aria-label")).toContain("ship")
    })

    it("hints at the controls of the running game", () => {
        const first = render(<Ricochet />)
        expect(first.container.querySelector(".xp-ricochet-hint")?.textContent).toBe("move to play")

        const second = render(<Ricochet game="shooter" />)
        expect(second.container.querySelector(".xp-ricochet-hint")?.textContent).toBe(
            "move and shoot",
        )
    })

    it("leaves only one loop running after a game switch", () => {
        const pending = new Set<number>()
        let next = 1
        const start = vi
            .spyOn(globalThis, "requestAnimationFrame")
            .mockImplementation((): number => {
                const id = next
                next += 1
                pending.add(id)
                return id
            })
        const stop = vi
            .spyOn(globalThis, "cancelAnimationFrame")
            .mockImplementation((id: number) => {
                pending.delete(id)
            })

        const { rerender, unmount } = render(<Ricochet game="breakout" />)
        expect(pending.size).toBe(1)

        rerender(<Ricochet game="shooter" />)
        expect(pending.size).toBe(1)

        rerender(<Ricochet game="breakout" />)
        expect(pending.size).toBe(1)

        unmount()
        expect(pending.size).toBe(0)

        start.mockRestore()
        stop.mockRestore()
    })

    it("never starts a loop for either game under reduced motion", () => {
        mediaState.reducedMotion = true
        const start = vi.spyOn(globalThis, "requestAnimationFrame")

        const { getByText } = render(<Ricochet game="shooter" text="404" />)

        expect(start).not.toHaveBeenCalled()
        expect(getByText("404")).toBeInTheDocument()
        start.mockRestore()
    })

    it("rebuilds when the game changes, not just when the text does", () => {
        const watch = vi.spyOn(globalThis.ResizeObserver.prototype, "observe")

        const { rerender } = render(<Ricochet game="breakout" />)
        expect(watch).toHaveBeenCalledTimes(1)

        rerender(<Ricochet game="shooter" />)
        expect(watch).toHaveBeenCalledTimes(2)

        watch.mockRestore()
    })

    it("renders the same markup twice for the same props", () => {
        const first = render(<Ricochet text="404" variant="mono" />)
        const before = shell(first.container).outerHTML
        first.unmount()

        const second = render(<Ricochet text="404" variant="mono" />)

        expect(shell(second.container).outerHTML).toBe(before)
    })
})
