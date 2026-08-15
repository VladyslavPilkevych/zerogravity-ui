import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Stencil } from "./Stencil"

describe("Stencil", () => {
    it("reads as one word rather than one letter at a time", () => {
        const { container } = render(<Stencil text="ZEBRA" />)
        const root = container.querySelector(".stencil")

        expect(root?.getAttribute("role")).toBe("img")
        expect(root?.getAttribute("aria-label")).toBe("ZEBRA")
        expect(
            Array.from(container.querySelectorAll(".stencil-letter")).every(
                (letter) => letter.getAttribute("aria-hidden") === "true",
            ),
        ).toBe(true)
    })

    it("renders one element per character and preserves spaces", () => {
        const { container } = render(<Stencil text="A B" />)

        expect(container.querySelectorAll(".stencil-letter")).toHaveLength(2)
        expect(container.querySelectorAll(".stencil-space")).toHaveLength(1)
    })

    it("exposes the hover mode as a class hook", () => {
        const { container } = render(<Stencil text="AB" hover="wave" />)

        expect(container.querySelector(".stencil")?.className).toContain("stencil-hover-wave")
    })

    it("marks animated and outlined variants only when enabled", () => {
        const { container, rerender } = render(<Stencil text="AB" />)
        expect(container.querySelector(".stencil")?.className).not.toContain("stencil-animated")

        rerender(<Stencil text="AB" animate={4} outline={2} />)
        const className = container.querySelector(".stencil")?.className ?? ""
        expect(className).toContain("stencil-animated")
        expect(className).toContain("stencil-outlined")
    })

    it("escapes a media url so it cannot inject extra css declarations", () => {
        const { container } = render(
            <Stencil text="A" hover="reveal" media={['a.png"); background: url("evil.png']} />,
        )
        const letter = container.querySelector<HTMLElement>(".stencil-letter")
        const media = letter?.style.getPropertyValue("--stencil-media") ?? ""

        expect(media).toContain("url(")
        expect(media).not.toContain("); background")
    })

    it("keeps a video mask layer out of the accessibility tree", () => {
        const { container } = render(<Stencil text="A" hover="reveal" media={["/clip.mp4"]} />)
        const letter = container.querySelector(".stencil-letter")
        const video = container.querySelector("video")

        expect(letter?.getAttribute("aria-hidden")).toBe("true")
        expect(video).not.toBeNull()
        expect(video?.getAttribute("tabindex")).toBe("-1")
        expect(video?.hasAttribute("controls")).toBe(false)
    })

    it("routes images through the letter background and video through a mask layer", () => {
        const images = render(<Stencil text="A" hover="reveal" media={["/photo.png"]} />)
        expect(images.container.querySelector(".stencil-media")).toBeNull()
        expect(
            images.container
                .querySelector<HTMLElement>(".stencil-letter")
                ?.style.getPropertyValue("--stencil-media"),
        ).toContain("/photo.png")
        images.unmount()

        const videos = render(<Stencil text="A" hover="reveal" media={["/clip.webm"]} />)
        expect(videos.container.querySelector(".stencil-media")).not.toBeNull()
    })

    it("resolves the hovered letter from cached geometry, not a layout read per letter", () => {
        const { container } = render(<Stencil text="PERFORMANCE" hover="wave" />)
        const root = container.querySelector(".stencil") as HTMLElement

        const original = Element.prototype.getBoundingClientRect
        let reads = 0
        Element.prototype.getBoundingClientRect = function patched(this: Element) {
            reads += 1
            return original.call(this)
        }

        for (let i = 0; i < 20; i += 1) {
            root.dispatchEvent(
                new PointerEvent("pointermove", { clientX: 10 + i * 5, bubbles: true }),
            )
        }

        Element.prototype.getBoundingClientRect = original

        expect(reads).toBe(0)
    })

    it("keeps the consumer className alongside its own", () => {
        const { container } = render(<Stencil text="A" className="headline" />)

        expect(container.querySelector(".stencil")?.className).toContain("headline")
    })
})
