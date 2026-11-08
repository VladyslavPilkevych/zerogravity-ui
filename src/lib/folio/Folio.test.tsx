import { fireEvent, render, screen } from "@testing-library/react"
import { StrictMode } from "react"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../test/environment"
import { FOLIO_STACK_BELOW, Folio, FolioPanel } from "./Folio"

function widthOf(width: number) {
    return vi
        .spyOn(HTMLElement.prototype, "getBoundingClientRect")
        .mockImplementation(
            () => ({ width, height: 420, top: 0, left: 0, right: width, bottom: 420 }) as DOMRect,
        )
}

function strip(props: Partial<Parameters<typeof Folio>[0]> = {}) {
    return (
        <Folio label="Work" {...props}>
            <FolioPanel label="North">
                {(open) => <a href="#north">{open ? "North, open" : "North"}</a>}
            </FolioPanel>
            <FolioPanel label="Field">
                <a href="#field">Field</a>
            </FolioPanel>
            <FolioPanel label="Harbour">
                <span>Harbour</span>
            </FolioPanel>
        </Folio>
    )
}

function panels(container: HTMLElement) {
    return [...container.querySelectorAll<HTMLElement>(".zg-folio-panel")]
}

function root(container: HTMLElement) {
    return container.querySelector(".zg-folio") as HTMLElement
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe("Folio", () => {
    it("drives the whole layout from one open position and a per-panel index", () => {
        widthOf(1000)
        const { container } = render(strip({ defaultActive: 2 }))
        const style = root(container).style

        expect(style.getPropertyValue("--zg-folio-at")).toBe("2")
        expect(style.getPropertyValue("--zg-folio-count")).toBe("3")
        expect(style.getPropertyValue("--zg-folio-gap")).toBe("12px")
        expect(
            panels(container).map((item) => item.style.getPropertyValue("--zg-folio-index")),
        ).toEqual(["0", "1", "2"])
    })

    it("defaults to the pixel style with stepped corners, classic keeps rounded ones", () => {
        const pixel = render(strip())
        expect(root(pixel.container).dataset.variant).toBe("pixel")
        expect(root(pixel.container).style.getPropertyValue("--zg-folio-radius")).toBe("4px")

        const classic = render(strip({ variant: "classic" }))
        expect(root(classic.container).dataset.variant).toBe("classic")
        expect(root(classic.container).style.getPropertyValue("--zg-folio-radius")).toBe("20px")
    })

    it("server-renders the full geometry with no layout guess and the default panel open", () => {
        const html = renderToString(strip({ defaultActive: 1 }))

        expect(html).toContain("--zg-folio-at:1")
        expect(html).not.toContain("data-layout")
        expect(html.indexOf("data-open")).toBeGreaterThan(html.indexOf("North"))
    })

    it("marks the rail once measured wide enough", () => {
        widthOf(1000)
        const { container } = render(strip())

        expect(root(container).dataset.layout).toBe("rail")
        expect(panels(container)[0].dataset.open).toBe("")
    })

    it("opens on mouse hover but not on a touch pointer entering", () => {
        widthOf(1000)
        const { container } = render(strip())
        const items = panels(container)

        fireEvent.pointerEnter(items[1], { pointerType: "touch" })
        expect(items[1].dataset.open).toBeUndefined()

        fireEvent.pointerEnter(items[1], { pointerType: "mouse" })
        expect(items[1].dataset.open).toBe("")
        expect(items[0].dataset.open).toBeUndefined()
        expect(root(container).style.getPropertyValue("--zg-folio-at")).toBe("1")
    })

    it("opens on the first tap and follows the link on the second", () => {
        widthOf(1000)
        const { container } = render(strip())
        const field = screen.getByRole("link", { name: "Field" })
        const item = panels(container)[1]

        fireEvent.pointerDown(field, { pointerType: "touch" })
        fireEvent.focus(field)
        const first = fireEvent.click(field, { detail: 1 })
        expect(first).toBe(false)
        expect(item.dataset.open).toBe("")

        fireEvent.pointerDown(field, { pointerType: "touch" })
        const second = fireEvent.click(field, { detail: 1 })
        expect(second).toBe(true)
    })

    it("never intercepts a keyboard activation", () => {
        widthOf(1000)
        render(strip())
        const field = screen.getByRole("link", { name: "Field" })

        fireEvent.pointerDown(field, { pointerType: "touch" })
        expect(fireEvent.click(field, { detail: 0 })).toBe(true)
    })

    it("opens the panel that receives focus", () => {
        widthOf(1000)
        const { container } = render(strip())

        fireEvent.focus(screen.getByRole("link", { name: "Field" }))
        expect(panels(container)[1].dataset.open).toBe("")
    })

    it("reports changes and follows the active prop when controlled", () => {
        widthOf(1000)
        const change = vi.fn()
        const { container } = render(strip({ active: 2, onActiveChange: change }))
        const items = panels(container)

        expect(items[2].dataset.open).toBe("")
        fireEvent.pointerEnter(items[0], { pointerType: "mouse" })
        expect(change).toHaveBeenCalledWith(0)
        expect(items[2].dataset.open).toBe("")
    })

    it("stacks every panel open below the breakpoint and ignores hover", () => {
        widthOf(FOLIO_STACK_BELOW - 170)
        const { container } = render(strip())
        const items = panels(container)

        expect(root(container).dataset.layout).toBe("stack")
        expect(items.every((item) => item.dataset.open === "")).toBe(true)
        expect(screen.getByRole("link", { name: "North, open" })).toBeInTheDocument()
        fireEvent.pointerEnter(items[2], { pointerType: "mouse" })
        expect(root(container).style.getPropertyValue("--zg-folio-at")).toBe("0")
    })

    it("makes panels without interactive content reachable from the keyboard", () => {
        widthOf(1000)
        const { container } = render(strip())
        const items = panels(container)

        expect(items[0]).not.toHaveAttribute("tabindex")
        expect(items[2]).toHaveAttribute("tabindex", "0")
    })

    it("names the list and each panel", () => {
        render(strip())

        expect(screen.getByRole("list", { name: "Work" })).toBeInTheDocument()
        expect(screen.getByRole("listitem", { name: "Harbour" })).toBeInTheDocument()
    })

    it("holds still when disabled and drops transitions under reduced motion", () => {
        widthOf(1000)
        mediaState.reducedMotion = true
        const { container } = render(strip({ disabled: true }))

        expect(root(container).dataset.still).toBe("")
        fireEvent.pointerEnter(panels(container)[2], { pointerType: "mouse" })
        expect(panels(container)[2].dataset.open).toBeUndefined()
    })

    it("keeps one resize observer per mount through a StrictMode remount", () => {
        const disconnect = vi.spyOn(ResizeObserver.prototype, "disconnect")
        const { unmount } = render(<StrictMode>{strip()}</StrictMode>)

        unmount()
        expect(disconnect.mock.calls.length).toBeGreaterThanOrEqual(2)
    })
})
