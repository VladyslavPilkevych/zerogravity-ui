import { render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { Raster } from "./Raster"
import type { RasterMode } from "./Raster"
import { RASTER_DEMO_IMAGE } from "./demoImage"

const MODES: RasterMode[] = ["blur", "glass", "glyph", "pixel"]

afterEach(() => {
    mediaState.reducedMotion = false
})

function shell(container: HTMLElement) {
    return container.querySelector(".xp-raster") as HTMLElement
}

describe("Raster", () => {
    it("keeps a real image with its alt text in every mode", () => {
        for (const mode of MODES) {
            const view = render(
                <Raster src={RASTER_DEMO_IMAGE} alt="A sunset poster" mode={mode} />,
            )
            const image = view.getByRole("img", { name: "A sunset poster" })

            expect(image, mode).toBeInTheDocument()
            expect(image.getAttribute("src")).toBe(RASTER_DEMO_IMAGE)
            view.unmount()
        }
    })

    it("treats an empty alt as decorative", () => {
        const { container, queryByRole } = render(
            <Raster src={RASTER_DEMO_IMAGE} alt="" mode="pixel" />,
        )

        expect(queryByRole("img")).toBeNull()
        expect(container.querySelector("img.xp-raster-plate")?.getAttribute("alt")).toBe("")
    })

    it("marks the mode on the shell and switches layers with it", () => {
        const { container, rerender } = render(
            <Raster src={RASTER_DEMO_IMAGE} alt="x" mode="blur" />,
        )

        expect(shell(container).dataset.mode).toBe("blur")
        expect(container.querySelectorAll(".xp-raster-haze")).toHaveLength(2)
        expect(container.querySelector("canvas")).toBeNull()

        rerender(<Raster src={RASTER_DEMO_IMAGE} alt="x" mode="pixel" />)

        expect(shell(container).dataset.mode).toBe("pixel")
        expect(container.querySelectorAll(".xp-raster-haze")).toHaveLength(0)
        expect(container.querySelector("canvas")).not.toBeNull()
    })

    it("paints glyph and pixel modes on a canvas", () => {
        for (const mode of ["glyph", "pixel"] as const) {
            const view = render(<Raster src={RASTER_DEMO_IMAGE} alt="x" mode={mode} />)

            expect(view.container.querySelectorAll("canvas"), mode).toHaveLength(1)
            expect(
                view.container.querySelector(".xp-raster-veil")?.getAttribute("aria-hidden"),
            ).toBe("true")
            view.unmount()
        }
    })

    it("warps glass mode through its own filter", () => {
        const { container } = render(
            <Raster src={RASTER_DEMO_IMAGE} alt="x" mode="glass" distortion={26} />,
        )

        const filter = container.querySelector("filter")
        const map = container.querySelector("feDisplacementMap")

        expect(filter?.id).toBeTruthy()
        expect(map?.getAttribute("scale")).toBe("26")
        expect(container.querySelector(".xp-raster-lens")?.getAttribute("aria-hidden")).toBe("true")
        expect(container.querySelectorAll(".xp-raster-bend")).toHaveLength(2)
        expect(container.querySelector(".xp-raster-rim")).not.toBeNull()
        expect(container.querySelector(".xp-raster-rim")).not.toBeNull()
    })

    it("gives each glass instance a filter of its own", () => {
        const { container } = render(
            <>
                <Raster src={RASTER_DEMO_IMAGE} alt="a" mode="glass" />
                <Raster src={RASTER_DEMO_IMAGE} alt="b" mode="glass" />
            </>,
        )

        const ids = Array.from(container.querySelectorAll("filter")).map((node) => node.id)

        expect(ids).toHaveLength(2)
        expect(new Set(ids).size).toBe(2)
    })

    it("writes the blur strength as a custom property", () => {
        const { container } = render(
            <Raster src={RASTER_DEMO_IMAGE} alt="x" mode="blur" blurStrength={40} />,
        )

        expect(shell(container).style.getPropertyValue("--raster-blur")).toBe("40px")
    })

    it("shows the untouched picture when disabled", () => {
        const { container } = render(
            <Raster src={RASTER_DEMO_IMAGE} alt="x" mode="glyph" disabled />,
        )

        expect(shell(container).dataset.mode).toBe("off")
        expect(container.querySelector(".xp-raster-veil")).toBeNull()
        expect(container.querySelector("canvas")).toBeNull()
        expect(container.querySelector("img.xp-raster-plate")).not.toBeNull()
    })

    it("hides every decorative layer and adds no focus targets", () => {
        for (const mode of MODES) {
            const view = render(<Raster src={RASTER_DEMO_IMAGE} alt="x" mode={mode} />)

            for (const veil of view.container.querySelectorAll(".xp-raster-veil")) {
                expect(veil.getAttribute("aria-hidden"), mode).toBe("true")
            }
            expect(view.container.querySelectorAll("[tabindex], a, button")).toHaveLength(0)
            expect(view.container.querySelectorAll("img")).toHaveLength(mode === "glass" ? 2 : 1)
            view.unmount()
        }
    })

    it("drops the shimmer when animation is off", () => {
        const { container } = render(
            <Raster src={RASTER_DEMO_IMAGE} alt="x" mode="glass" animated={false} />,
        )

        expect(container.querySelector(".xp-raster-sheen")).toBeNull()
        expect(shell(container).className).toContain("xp-raster-still")
    })

    it("drops the shimmer under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Raster src={RASTER_DEMO_IMAGE} alt="x" mode="glass" />)

        expect(container.querySelector(".xp-raster-sheen")).toBeNull()
        expect(shell(container).className).toContain("xp-raster-still")
    })

    it("keeps the shimmer when reduced motion is not respected", () => {
        mediaState.reducedMotion = true
        const { container } = render(
            <Raster src={RASTER_DEMO_IMAGE} alt="x" mode="glass" respectReducedMotion={false} />,
        )

        expect(container.querySelector(".xp-raster-sheen")).not.toBeNull()
    })

    it("opts into the hover reveal only when asked", () => {
        const plain = render(<Raster src={RASTER_DEMO_IMAGE} alt="x" mode="pixel" />)
        expect(shell(plain.container).className).not.toContain("xp-raster-interactive")
        plain.unmount()

        const keen = render(<Raster src={RASTER_DEMO_IMAGE} alt="x" mode="pixel" interactive />)
        expect(shell(keen.container).className).toContain("xp-raster-interactive")
    })

    it("controls its own box through the aspect ratio", () => {
        const { container } = render(
            <Raster src={RASTER_DEMO_IMAGE} alt="x" mode="blur" aspectRatio="4 / 3" />,
        )

        expect(shell(container).style.aspectRatio).toBe("4 / 3")
    })

    it("accepts a numeric aspect ratio", () => {
        const { container } = render(
            <Raster src={RASTER_DEMO_IMAGE} alt="x" mode="blur" aspectRatio={2} />,
        )

        expect(shell(container).style.aspectRatio).toMatch(/^2( \/ 1)?$/)
    })

    it("stops watching for resizes when it unmounts", () => {
        const stop = vi.spyOn(globalThis.ResizeObserver.prototype, "disconnect")
        const { unmount } = render(<Raster src={RASTER_DEMO_IMAGE} alt="x" mode="pixel" />)

        unmount()

        expect(stop).toHaveBeenCalled()
        stop.mockRestore()
    })

    it("watches nothing for the modes that need no canvas", () => {
        const watch = vi.spyOn(globalThis.ResizeObserver.prototype, "observe")

        const view = render(<Raster src={RASTER_DEMO_IMAGE} alt="x" mode="blur" />)
        expect(watch).not.toHaveBeenCalled()
        view.unmount()

        render(<Raster src={RASTER_DEMO_IMAGE} alt="x" mode="glyph" />)
        expect(watch).toHaveBeenCalledTimes(1)
        watch.mockRestore()
    })

    it("survives a platform with no 2d context", () => {
        expect(() =>
            render(<Raster src={RASTER_DEMO_IMAGE} alt="x" mode="glyph" cellSize={8} />),
        ).not.toThrow()
    })

    it("renders the same markup twice for the same props", () => {
        const first = render(<Raster src={RASTER_DEMO_IMAGE} alt="x" mode="pixel" pixelSize={20} />)
        const before = first.container.querySelector(".xp-raster")?.outerHTML
        first.unmount()

        const second = render(
            <Raster src={RASTER_DEMO_IMAGE} alt="x" mode="pixel" pixelSize={20} />,
        )

        expect(second.container.querySelector(".xp-raster")?.outerHTML).toBe(before)
    })
})
