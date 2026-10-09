import { readFileSync } from "node:fs"
import { join } from "node:path"

import { render } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Bitmap } from "./Bitmap"
import { BITMAP_CHARACTERS, BITMAP_ROWS, layoutBitmap } from "./font"

function groups(container: HTMLElement) {
    return Array.from(container.querySelectorAll("g"))
}

describe("layoutBitmap", () => {
    it("lays glyphs out with one column of tracking between them", () => {
        const { width, height } = layoutBitmap("AB")

        expect(width).toBe(11)
        expect(height).toBe(BITMAP_ROWS)
    })

    it("counts the lit cells of known glyphs", () => {
        expect(layoutBitmap("I").cells).toHaveLength(15)
        expect(layoutBitmap("L").cells).toHaveLength(11)
        expect(layoutBitmap(".").cells).toHaveLength(1)
    })

    it("keeps every cell inside the grid", () => {
        const { cells, width } = layoutBitmap("ZeroGravity 2026!")

        for (const cell of cells) {
            expect(cell.x).toBeGreaterThanOrEqual(0)
            expect(cell.x).toBeLessThan(width)
            expect(cell.y).toBeLessThan(BITMAP_ROWS)
        }
    })

    it("maps lowercase and accented letters onto the capitals", () => {
        expect(layoutBitmap("zero").cells).toEqual(layoutBitmap("ZERO").cells)
        expect(layoutBitmap("é").cells).toEqual(layoutBitmap("E").cells)
    })

    it("draws a hollow box for characters it does not know", () => {
        const unknown = layoutBitmap("€")

        expect(unknown.width).toBe(5)
        expect(unknown.cells).toHaveLength(20)
    })

    it("sets punctuation on narrower slots than letters", () => {
        expect(layoutBitmap("A.A").width).toBe(13)
        expect(layoutBitmap("A A").width).toBe(15)
        expect(BITMAP_CHARACTERS).toContain("@")
    })

    it("widens the tracking on request", () => {
        expect(layoutBitmap("AB", 3).width).toBe(13)
    })
})

describe("Bitmap", () => {
    it("draws one rect per lit cell", () => {
        const { container } = render(<Bitmap text="HI" />)

        expect(container.querySelectorAll("rect")).toHaveLength(layoutBitmap("HI").cells.length)
    })

    it("keeps the real text for assistive technology and hides the pixels", () => {
        const { container, getByText } = render(<Bitmap text="ZeroGravity" />)

        expect(getByText("ZeroGravity")).toHaveClass("zg-bitmap-label")
        expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
    })

    it("renders as the requested element, so a heading stays a heading", () => {
        const { getByRole } = render(<Bitmap text="Launch" as="h1" />)

        expect(getByRole("heading", { level: 1, name: "Launch" })).toBeInTheDocument()
    })

    it("fills its container through the viewBox unless a pixel size is given", () => {
        const fluid = render(<Bitmap text="ABC" />).container
        const svg = fluid.querySelector("svg")!

        expect(svg).toHaveAttribute("viewBox", `0 0 17 ${BITMAP_ROWS}`)
        expect(svg).not.toHaveAttribute("width")
        expect(fluid.firstElementChild).toHaveAttribute("data-sizing", "fluid")

        const fixed = render(<Bitmap text="ABC" pixelSize={4} />).container.querySelector("svg")!
        expect(fixed).toHaveAttribute("width", "68")
        expect(fixed).toHaveAttribute("height", String(BITMAP_ROWS * 4))
        expect(fixed).toHaveAttribute("shape-rendering", "crispEdges")
    })

    it("insets each pixel by the gap", () => {
        const { container } = render(<Bitmap text="." gap={0.2} />)
        const rect = container.querySelector("rect")!

        expect(rect).toHaveAttribute("width", "0.8")
        expect(rect).toHaveAttribute("x", "0.1")
    })

    it("uses the single colour when no palette is given", () => {
        const { container } = render(<Bitmap text="A" color="#123456" animated={false} />)

        for (const group of groups(container)) expect(group.style.fill).toBe("rgb(18, 52, 86)")
    })

    it("spreads a palette across the word in reading order", () => {
        const palette = ["#ff0000", "#00ff00", "#0000ff"]
        const { container } = render(
            <Bitmap text="WWWWWW" colors={palette} effect="cycle" animated={false} />,
        )
        const fills = groups(container).map((group) => group.style.fill)

        expect(fills).toEqual(["rgb(255, 0, 0)", "rgb(0, 255, 0)", "rgb(0, 0, 255)"])
    })

    it("animates by phase bucket, not by cell", () => {
        const { container } = render(<Bitmap text={"ZEROGRAVITY".repeat(5)} />)
        const root = container.firstElementChild!

        expect(root).toHaveAttribute("data-effect", "sweep")
        expect(container.querySelectorAll("rect").length).toBeGreaterThan(800)
        expect(groups(container).length).toBeLessThanOrEqual(96)
        for (const group of groups(container)) {
            expect(group.style.animationDelay).toMatch(/^-\d+ms$/)
        }
    })

    it("drops every animation hook when animated is off", () => {
        const { container } = render(
            <Bitmap text="ZG" animated={false} colors={["#fff", "#000"]} />,
        )
        const root = container.firstElementChild!

        expect(root).not.toHaveAttribute("data-effect")
        expect(root).not.toHaveAttribute("data-reduced-motion")
        expect((root as HTMLElement).style.getPropertyValue("--zg-bitmap-period")).toBe("")
        for (const group of groups(container)) {
            expect(group.style.animationDelay).toBe("")
            expect(group.style.fill).not.toBe("")
        }
    })

    it("only cycles when there is more than one colour to cycle through", () => {
        const single = render(<Bitmap text="A" effect="cycle" />).container
        const pair = render(<Bitmap text="A" effect="cycle" colors={["#fff", "#000"]} />).container

        expect(single.firstElementChild).not.toHaveAttribute("data-effect")
        expect(pair.firstElementChild).toHaveAttribute("data-colors", "2")
    })

    it("can be paused on a frame", () => {
        const { container } = render(<Bitmap text="A" paused />)

        expect(container.firstElementChild).toHaveAttribute("data-paused")
    })

    it("stops in CSS under reduced motion and keeps a static fill on every group", () => {
        const css = readFileSync(join(__dirname, "Bitmap.css"), "utf8")
        const { container } = render(<Bitmap text="ZG" colors={["#fff", "#000"]} />)

        expect(css).toMatch(
            /@media \(prefers-reduced-motion: reduce\)\s*{\s*\.zg-bitmap\[data-reduced-motion="respect"\] g\s*{\s*animation: none;/,
        )
        expect(container.firstElementChild).toHaveAttribute("data-reduced-motion", "respect")
        for (const group of groups(container)) expect(group.style.fill).not.toBe("")
    })

    it("can opt out of the reduced-motion guard", () => {
        const { container } = render(<Bitmap text="ZG" respectReducedMotion={false} />)

        expect(container.firstElementChild).not.toHaveAttribute("data-reduced-motion")
    })

    it("renders the same markup on the server, with no browser globals", () => {
        const first = renderToStaticMarkup(<Bitmap text="Server" colors={["#fff", "#000"]} />)
        const second = renderToStaticMarkup(<Bitmap text="Server" colors={["#fff", "#000"]} />)

        expect(first).toBe(second)
        expect(first).toContain("Server")
    })

    it("renders no svg for empty text", () => {
        const { container } = render(<Bitmap text="" />)

        expect(container.querySelector("svg")).toBeNull()
    })
})
