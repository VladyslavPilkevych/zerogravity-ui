import { render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { HEART_PIXELS } from "./heartMap"
import { PixelBar } from "./PixelBar"
import { PixelBlocks } from "./PixelBlocks"
import { PixelHeart } from "./PixelHeart"
import { PixelPulse } from "./PixelPulse"

afterEach(() => {
    mediaState.reducedMotion = false
})

const LOADERS = [
    { name: "PixelHeart", render: (props: object) => <PixelHeart {...props} /> },
    { name: "PixelBlocks", render: (props: object) => <PixelBlocks {...props} /> },
    { name: "PixelBar", render: (props: object) => <PixelBar {...props} /> },
    { name: "PixelPulse", render: (props: object) => <PixelPulse {...props} /> },
] as const

describe("every loader", () => {
    it("announces itself as a status with a default name", () => {
        for (const loader of LOADERS) {
            const view = render(loader.render({}))
            const status = view.getByRole("status")

            expect(status, loader.name).toBeInTheDocument()
            expect(status.getAttribute("aria-label")).toBe("Loading")
            view.unmount()
        }
    })

    it("takes a custom accessible name", () => {
        for (const loader of LOADERS) {
            const view = render(loader.render({ label: "Fetching your art" }))

            expect(
                view.getByRole("status", { name: "Fetching your art" }),
                loader.name,
            ).toBeVisible()
            view.unmount()
        }
    })

    it("goes fully decorative on an empty label", () => {
        for (const loader of LOADERS) {
            const view = render(loader.render({ label: "" }))

            expect(view.queryByRole("status"), loader.name).toBeNull()
            expect(view.container.firstElementChild?.getAttribute("aria-hidden")).toBe("true")
            view.unmount()
        }
    })

    it("hides every decorative pixel from assistive technology", () => {
        for (const loader of LOADERS) {
            const view = render(loader.render({}))
            const status = view.getByRole("status")

            for (const piece of status.children) {
                expect(piece.getAttribute("aria-hidden"), loader.name).toBe("true")
            }
            view.unmount()
        }
    })

    it("keeps its loading semantics while resting", () => {
        mediaState.reducedMotion = true

        for (const loader of LOADERS) {
            const view = render(loader.render({}))
            const status = view.getByRole("status")

            expect(status.className, loader.name).toContain("xp-loader-still")
            expect(status.getAttribute("aria-label")).toBe("Loading")
            view.unmount()
        }
    })

    it("rests when paused and keeps moving when reduced motion is ignored", () => {
        for (const loader of LOADERS) {
            const held = render(loader.render({ paused: true }))
            expect(held.getByRole("status").className, loader.name).toContain("xp-loader-still")
            held.unmount()

            mediaState.reducedMotion = true
            const insistent = render(loader.render({ respectReducedMotion: false }))
            expect(insistent.getByRole("status").className, loader.name).not.toContain(
                "xp-loader-still",
            )
            insistent.unmount()
            mediaState.reducedMotion = false
        }
    })

    it("passes className and style through", () => {
        for (const loader of LOADERS) {
            const view = render(loader.render({ className: "mine", style: { margin: "4px" } }))
            const status = view.getByRole("status")

            expect(status.className, loader.name).toContain("mine")
            expect(status.style.margin).toBe("4px")
            view.unmount()
        }
    })

    it("carries the colour and pace as custom properties", () => {
        for (const loader of LOADERS) {
            const view = render(loader.render({ color: "#00ff88", speed: 2 }))
            const status = view.getByRole("status")

            expect(status.style.getPropertyValue("--l-color"), loader.name).toBe("#00ff88")
            expect(Number(status.style.getPropertyValue("--l-beat"))).toBeGreaterThan(0)
            view.unmount()
        }
    })

    it("survives a zero or negative speed", () => {
        for (const loader of LOADERS) {
            const view = render(loader.render({ speed: 0 }))
            const beat = Number(view.getByRole("status").style.getPropertyValue("--l-beat"))

            expect(Number.isFinite(beat), loader.name).toBe(true)
            expect(beat).toBeGreaterThan(0)
            view.unmount()
        }
    })

    it("runs on CSS alone, with no scripted animation", () => {
        const frame = vi.spyOn(globalThis, "requestAnimationFrame")
        const interval = vi.spyOn(globalThis, "setInterval")
        const timeout = vi.spyOn(globalThis, "setTimeout")

        for (const loader of LOADERS) {
            const view = render(loader.render({}))
            view.unmount()
        }

        expect(frame).not.toHaveBeenCalled()
        expect(interval).not.toHaveBeenCalled()
        expect(timeout).not.toHaveBeenCalled()
        vi.restoreAllMocks()
    })
})

describe("PixelHeart", () => {
    it("draws the heart out of square pixels", () => {
        const { container } = render(<PixelHeart />)

        expect(container.querySelectorAll(".xp-heart-pixel")).toHaveLength(HEART_PIXELS.length)
        expect(HEART_PIXELS.length).toBe(70)
        expect(container.querySelector("svg")).toBeNull()
    })

    it("switches between pulse and blink", () => {
        const { container, rerender } = render(<PixelHeart variant="pulse" />)
        expect(container.querySelector(".xp-heart")?.getAttribute("data-variant")).toBe("pulse")

        rerender(<PixelHeart variant="blink" />)
        expect(container.querySelector(".xp-heart")?.getAttribute("data-variant")).toBe("blink")
    })

    it("staggers the ripple outward from the core", () => {
        const { container } = render(<PixelHeart />)
        const reaches = Array.from(container.querySelectorAll<HTMLElement>(".xp-heart-pixel")).map(
            (pixel) => Number(pixel.style.getPropertyValue("--l-reach")),
        )

        expect(Math.min(...reaches)).toBeLessThan(0.2)
        expect(Math.max(...reaches)).toBeCloseTo(1, 2)
        expect(new Set(reaches).size).toBeGreaterThan(6)
    })

    it("takes a size", () => {
        const { container } = render(<PixelHeart size={140} />)

        expect(container.querySelector(".xp-heart")?.getAttribute("style")).toContain(
            "--l-size: 140",
        )
    })
})

describe("PixelBlocks", () => {
    it("renders the requested number of blocks", () => {
        const { container } = render(<PixelBlocks count={8} />)

        expect(container.querySelectorAll(".xp-blocks-pixel")).toHaveLength(8)
    })

    it("never renders fewer than one block", () => {
        const { container } = render(<PixelBlocks count={0} />)

        expect(container.querySelectorAll(".xp-blocks-pixel")).toHaveLength(1)
    })

    it("offsets the centre variant symmetrically", () => {
        const { container } = render(<PixelBlocks count={5} variant="center" />)
        const steps = Array.from(container.querySelectorAll<HTMLElement>(".xp-blocks-pixel")).map(
            (block) => Number(block.style.getPropertyValue("--l-step")),
        )

        expect(steps[0]).toBeCloseTo(steps[4])
        expect(steps[1]).toBeCloseTo(steps[3])
        expect(steps[2]).toBe(0)
    })

    it("marches the other variants across", () => {
        const { container } = render(<PixelBlocks count={5} variant="wave" />)
        const steps = Array.from(container.querySelectorAll<HTMLElement>(".xp-blocks-pixel")).map(
            (block) => Number(block.style.getPropertyValue("--l-step")),
        )

        for (let index = 1; index < steps.length; index += 1) {
            expect(steps[index]).toBeGreaterThan(steps[index - 1])
        }
    })

    it("carries the variant on the root", () => {
        for (const variant of ["wave", "center", "steps"] as const) {
            const view = render(<PixelBlocks variant={variant} />)
            expect(view.getByRole("status").getAttribute("data-variant")).toBe(variant)
            view.unmount()
        }
    })
})

describe("PixelBar", () => {
    it("flows as a status when no value is given", () => {
        const { container, getByRole } = render(<PixelBar segments={10} />)

        expect(getByRole("status")).toBeInTheDocument()
        expect(container.querySelector(".xp-bar")?.getAttribute("data-mode")).toBe("flow")
        expect(container.querySelectorAll(".xp-bar-cell")).toHaveLength(10)
    })

    it("becomes a real progress bar with a value", () => {
        const { container, getByRole } = render(<PixelBar segments={10} value={0.4} />)
        const bar = getByRole("progressbar")

        expect(bar.getAttribute("aria-valuenow")).toBe("40")
        expect(bar.getAttribute("aria-valuemin")).toBe("0")
        expect(bar.getAttribute("aria-valuemax")).toBe("100")
        expect(container.querySelector(".xp-bar")?.getAttribute("data-mode")).toBe("value")
        expect(container.querySelectorAll('[data-lit="true"]')).toHaveLength(4)
        expect(container.querySelectorAll('[data-edge="true"]')).toHaveLength(1)
    })

    it("clamps a value outside the range", () => {
        const low = render(<PixelBar value={-2} />)
        expect(low.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0")
        low.unmount()

        const high = render(<PixelBar value={9} />)
        expect(high.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100")
        expect(high.container.querySelectorAll('[data-lit="true"]')).toHaveLength(12)
    })

    it("marches left to right", () => {
        const { container } = render(<PixelBar segments={4} />)
        const steps = Array.from(container.querySelectorAll<HTMLElement>(".xp-bar-cell")).map(
            (cell) => Number(cell.style.getPropertyValue("--l-step")),
        )

        expect(steps).toEqual([0.75, 0.5, 0.25, 0])
    })
})

describe("PixelPulse", () => {
    it("breathes two interleaved grid layers", () => {
        const { container } = render(<PixelPulse />)
        const grids = container.querySelectorAll(".xp-pulse-grid")

        expect(grids).toHaveLength(2)
        expect(grids[0].getAttribute("data-phase")).toBe("a")
        expect(grids[1].getAttribute("data-phase")).toBe("b")
    })

    it("centres whatever it wraps", () => {
        const { container, getByText } = render(
            <PixelPulse>
                <span>Almost there</span>
            </PixelPulse>,
        )

        expect(getByText("Almost there")).toBeVisible()
        expect(container.querySelector(".xp-pulse-content")?.textContent).toBe("Almost there")
    })

    it("renders no content layer when it wraps nothing", () => {
        const { container } = render(<PixelPulse />)

        expect(container.querySelector(".xp-pulse-content")).toBeNull()
    })

    it("pins itself over the viewport on request", () => {
        const { getByRole } = render(<PixelPulse overlay />)

        expect(getByRole("status").className).toContain("xp-pulse-overlay")
    })

    it("takes a cell size and a scrim", () => {
        const { getByRole } = render(<PixelPulse overlay cell={40} scrim="rgba(0,0,0,0.5)" />)
        const style = getByRole("status").getAttribute("style") ?? ""

        expect(style).toContain("--l-cell: 40")
        expect(style).toContain("--l-scrim: rgba(0,0,0,0.5)")
    })
})

describe("a decorative bar", () => {
    it("hides itself instead of exposing a nameless progressbar", () => {
        const { container } = render(<PixelBar label="" value={0.6} />)
        const root = container.querySelector(".xp-bar") as HTMLElement

        expect(root.getAttribute("role")).toBeNull()
        expect(root.getAttribute("aria-hidden")).toBe("true")
    })

    it("still reports progress when it has a name", () => {
        const { container } = render(<PixelBar label="Loading assets" value={0.6} />)
        const root = container.querySelector(".xp-bar") as HTMLElement

        expect(root.getAttribute("role")).toBe("progressbar")
        expect(root.getAttribute("aria-valuenow")).toBe("60")
    })
})

describe("pixel spacing", () => {
    const read = (node: Element | null) =>
        (node as HTMLElement | null)?.style.getPropertyValue("--l-gap")

    it("keeps its natural spacing when gap is left out", () => {
        const { container } = render(<PixelBlocks label="" />)

        expect(read(container.querySelector(".xp-blocks"))).toBe("0.34")
    })

    it("lets the pixels touch at zero", () => {
        const { container } = render(<PixelBlocks label="" gap={0} />)

        expect(read(container.querySelector(".xp-blocks"))).toBe("0")
    })

    it("takes a custom gap on every pixel loader", () => {
        const blocks = render(<PixelBlocks label="" gap={1.5} />)
        const heart = render(<PixelHeart label="" gap={1.5} />)
        const bar = render(<PixelBar label="" gap={1.5} />)

        expect(read(blocks.container.querySelector(".xp-blocks"))).toBe("1.5")
        expect(read(heart.container.querySelector(".xp-heart"))).toBe("1.5")
        expect(read(bar.container.querySelector(".xp-bar"))).toBe("1.5")
    })

    it("turns a pulse gap into a fill fraction", () => {
        const natural = render(<PixelPulse label="" />)
        const wide = render(<PixelPulse label="" gap={3} />)

        const fill = (view: { container: HTMLElement }) =>
            Number(
                (view.container.querySelector(".xp-pulse") as HTMLElement).style.getPropertyValue(
                    "--l-fill",
                ),
            )

        expect(fill(natural)).toBeCloseTo(0.34, 2)
        expect(fill(wide)).toBeCloseTo(0.25, 2)
    })

    it("clamps a value that would tear the geometry apart", () => {
        const { container } = render(<PixelBlocks label="" gap={999} />)

        expect(read(container.querySelector(".xp-blocks"))).toBe("4")
    })

    it("ignores a nonsense value", () => {
        const { container } = render(<PixelBlocks label="" gap={Number.NaN} />)

        expect(read(container.querySelector(".xp-blocks"))).toBe("0.34")
    })
})
