import { render, screen } from "@testing-library/react"
import { StrictMode } from "react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { installIntersectionHarness, type IntersectionHarness } from "../../test/observers"
import { SASH_COPY_LIMIT, Sash, sashCopies } from "./Sash"

function sized(widths: { root: number; run: number }) {
    return vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
        this: HTMLElement,
    ) {
        const width = this.classList.contains("zg-sash")
            ? widths.root
            : this.classList.contains("zg-sash-run")
              ? widths.run
              : 0
        return { width, height: 40, top: 0, left: 0, right: width, bottom: 40 } as DOMRect
    })
}

function band(container: HTMLElement) {
    return container.querySelector(".zg-sash") as HTMLElement
}

describe("Sash", () => {
    let io: IntersectionHarness

    beforeEach(() => {
        io = installIntersectionHarness()
    })

    afterEach(() => {
        io.restore()
    })

    it("needs enough copies to cover the band plus one shift", () => {
        expect(sashCopies(1200, 400)).toBe(4)
        expect(sashCopies(300, 900)).toBe(2)
        expect(sashCopies(10_000, 10)).toBe(SASH_COPY_LIMIT)
        expect(sashCopies(800, 0)).toBe(2)
    })

    it("measures one run and travels by exactly one run plus the gap", () => {
        sized({ root: 1000, run: 360 })
        const { container } = render(
            <Sash gap={40} speed={80}>
                <span>One</span>
            </Sash>,
        )
        const root = band(container)

        expect(root.style.getPropertyValue("--zg-sash-shift")).toBe("400px")
        expect(root.style.getPropertyValue("--zg-sash-duration")).toBe("5s")
        expect(root.dataset.ready).toBe("")
        expect(container.querySelectorAll(".zg-sash-run")).toHaveLength(4)
    })

    it("exposes the first run only: copies are hidden and inert", () => {
        sized({ root: 1000, run: 360 })
        const { container } = render(
            <Sash label="Clients">
                <a href="#north">North</a>
            </Sash>,
        )

        expect(screen.getByRole("region", { name: "Clients" })).toBeInTheDocument()
        expect(screen.getAllByRole("link")).toHaveLength(1)
        const copies = [...container.querySelectorAll("[data-copy]")]
        expect(copies.length).toBeGreaterThan(0)
        for (const copy of copies) {
            expect(copy).toHaveAttribute("aria-hidden", "true")
            expect(copy).toHaveAttribute("inert")
        }
    })

    it("is not a landmark without a label", () => {
        render(<Sash>Words</Sash>)
        expect(screen.queryByRole("region")).toBeNull()
    })

    it("renders one wrapped run under reduced motion, with no observers", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Sash>Calm</Sash>)

        expect(container.querySelectorAll(".zg-sash-run")).toHaveLength(1)
        expect(band(container).dataset.still).toBe("")
        expect(io.observers).toHaveLength(0)
    })

    it("renders one static run when disabled", () => {
        const { container } = render(<Sash disabled>Static</Sash>)
        expect(container.querySelectorAll(".zg-sash-run")).toHaveLength(1)
    })

    it("pauses while scrolled out of view", () => {
        const { container } = render(<Sash>Away</Sash>)
        const root = band(container)

        io.report(false)
        expect(root).toHaveAttribute("data-zg-offscreen")
        io.report(true)
        expect(root).not.toHaveAttribute("data-zg-offscreen")
    })

    it("marks pause, hover, fade and direction for the stylesheet", () => {
        const { container } = render(
            <Sash paused fade direction="right" pauseOnHover={false}>
                Flags
            </Sash>,
        )
        const root = band(container)

        expect(root.dataset.paused).toBe("")
        expect(root.dataset.fade).toBe("")
        expect(root.dataset.direction).toBe("right")
        expect(root.dataset.hoverPause).toBeUndefined()
    })

    it("cleans up observers after a StrictMode remount and on unmount", () => {
        const { unmount } = render(
            <StrictMode>
                <Sash>Strict</Sash>
            </StrictMode>,
        )

        expect(io.live()).toHaveLength(1)
        unmount()
        expect(io.live()).toHaveLength(0)
    })

    it("renders two runs on the server and the same markup every time", () => {
        const html = renderToString(<Sash>Server</Sash>)

        expect(html.match(/zg-sash-run/g)).toHaveLength(2)
        expect(renderToString(<Sash>Server</Sash>)).toBe(html)
    })

    it("puts a hidden block marker after every item in the pixel style only", () => {
        const pixel = render(
            <Sash disabled>
                <span>One</span>
                <span>Two</span>
            </Sash>,
        )
        const marks = pixel.container.querySelectorAll(".zg-sash-mark")
        expect(band(pixel.container).dataset.variant).toBe("pixel")
        expect(marks).toHaveLength(2)
        for (const mark of marks) expect(mark).toHaveAttribute("aria-hidden", "true")

        const classic = render(
            <Sash disabled variant="classic">
                <span>One</span>
                <span>Two</span>
            </Sash>,
        )
        expect(classic.container.querySelectorAll(".zg-sash-mark")).toHaveLength(0)
    })
})
