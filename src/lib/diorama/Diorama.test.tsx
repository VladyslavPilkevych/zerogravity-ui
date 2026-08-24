import { render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { Diorama } from "./Diorama"

afterEach(() => {
    mediaState.reducedMotion = false
    mediaState.fine = true
})

const planes = [{ content: <span>Near</span> }, { content: <span>Nearer</span> }]

describe("Diorama", () => {
    it("renders the background and every foreground plane", () => {
        const { container, getByText } = render(
            <Diorama background={<p>Distant artwork</p>} planes={planes} />,
        )

        expect(getByText("Distant artwork")).toBeInTheDocument()
        expect(container.querySelectorAll(".xp-diorama-near")).toHaveLength(2)
    })

    it("assigns increasing depth to nearer planes", () => {
        const { container } = render(<Diorama background={<p>Far</p>} planes={planes} />)
        const [first, second] = Array.from(
            container.querySelectorAll<HTMLElement>(".xp-diorama-near"),
        )

        expect(Number(first.style.getPropertyValue("--depth"))).toBeLessThan(
            Number(second.style.getPropertyValue("--depth")),
        )
    })

    it("honours an explicit depth per plane", () => {
        const { container } = render(
            <Diorama background={<p>Far</p>} planes={[{ content: <span>A</span>, depth: 0.25 }]} />,
        )

        const plane = container.querySelector<HTMLElement>(".xp-diorama-near")
        expect(plane?.style.getPropertyValue("--depth")).toBe("0.25")
    })

    it("publishes parallax and blur budgets as custom properties", () => {
        const { container } = render(
            <Diorama background={<p>Far</p>} planes={planes} parallax={60} blur={12} />,
        )
        const root = container.querySelector(".xp-diorama") as HTMLElement

        expect(root.style.getPropertyValue("--diorama-parallax")).toBe("60")
        expect(root.style.getPropertyValue("--diorama-blur")).toBe("12")
    })

    it("renders a static composition under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Diorama background={<p>Far</p>} planes={planes} />)

        expect(container.querySelector(".xp-diorama")).toHaveClass("xp-diorama-still")
    })

    it("releases its listeners on unmount", () => {
        const { container, unmount } = render(<Diorama background={<p>Far</p>} planes={planes} />)
        const root = container.querySelector(".xp-diorama") as HTMLElement
        const remove = vi.spyOn(root, "removeEventListener")

        unmount()

        expect(remove.mock.calls.filter(([type]) => type === "pointermove").length).toBeGreaterThan(
            0,
        )
    })
})
