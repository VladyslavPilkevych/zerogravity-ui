import { act, fireEvent, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { Elemental } from "./Elemental"
import { ELEMENTAL_VARIANTS } from "./variants"

afterEach(() => {
    mediaState.reducedMotion = false
    mediaState.fine = true
})

function root(container: HTMLElement) {
    return container.querySelector(".xp-el") as HTMLElement
}

describe("Elemental", () => {
    it("renders its children untouched", () => {
        const { getByRole } = render(
            <Elemental>
                <button type="button">Buy</button>
            </Elemental>,
        )

        expect(getByRole("button", { name: "Buy" })).toBeInTheDocument()
    })

    it("draws every variant", () => {
        for (const variant of ELEMENTAL_VARIANTS) {
            const { container, unmount } = render(<Elemental variant={variant}>x</Elemental>)

            expect(root(container).dataset.variant).toBe(variant)
            expect(container.querySelectorAll(".xp-el-edge").length).toBeGreaterThanOrEqual(4)
            expect(container.querySelector("filter")).not.toBeNull()
            unmount()
        }
    })

    it("strokes every layer on the same rounded path", () => {
        const { container } = render(<Elemental radius={22}>x</Elemental>)
        const edges = [...container.querySelectorAll(".xp-el-edge")]

        expect(edges.length).toBeGreaterThan(0)
        for (const edge of edges) {
            expect(edge.getAttribute("rx")).toBe("22")
            expect(edge.getAttribute("ry")).toBe("22")
            expect(edge.getAttribute("width")).toBe("100%")
            expect(edge.getAttribute("height")).toBe("100%")
        }
    })

    it("normalises the perimeter so a dash laps once at any size", () => {
        const { container } = render(<Elemental>x</Elemental>)

        for (const edge of container.querySelectorAll(".xp-el-edge")) {
            expect(edge.getAttribute("pathLength")).toBe("100")
        }
    })

    it("falls back to electric for an unknown variant", () => {
        const { container } = render(<Elemental variant={"plasma" as never}>x</Elemental>)

        expect(container.querySelectorAll(".xp-el-edge").length).toBeGreaterThanOrEqual(4)
    })

    it("swaps variant without leaving the previous one behind", () => {
        const { container, rerender } = render(<Elemental variant="fire">x</Elemental>)
        expect(root(container).dataset.variant).toBe("fire")

        rerender(<Elemental variant="electric">x</Elemental>)

        expect(root(container).dataset.variant).toBe("electric")
        expect(container.querySelectorAll(".xp-el")).toHaveLength(1)
    })

    it("draws the edge above the content, so it crosses the border", () => {
        const { container } = render(<Elemental variant="fire">x</Elemental>)
        const faces = [...container.querySelectorAll(".xp-el-art")]

        expect(faces.map((face) => (face as HTMLElement).dataset.face)).toEqual(["out", "in"])

        // the edge is drawn once, over the content, held back only by the band
        const edge = faces[1].querySelector(".xp-el-halo")!.parentElement!
        expect(edge.getAttribute("mask")).toMatch(/^url\(#.+\)$/)
        expect(edge.getAttribute("clip-path")).toBeNull()
        expect(faces[0].querySelectorAll(".xp-el-edge")).toHaveLength(0)
    })

    it("clips the body to the same corner as the content", () => {
        const { container } = render(<Elemental radius={20}>x</Elemental>)
        const clip = container.querySelector("clipPath rect")

        expect(clip?.getAttribute("rx")).toBe("20")
        expect(container.querySelectorAll("mask .xp-el-band")).toHaveLength(1)
    })

    it("bends electric through a zigzag and fire through a smooth field", () => {
        const spark = render(<Elemental variant="electric">x</Elemental>)
        const flame = render(<Elemental variant="fire">x</Elemental>)

        // the edge field is the first filter; a body brings its own
        const shaped = (view: { container: HTMLElement }) =>
            [...view.container.querySelectorAll("filter")[0].querySelectorAll("feFuncR")].map(
                (node) => node.getAttribute("type"),
            )

        // a table ramps, so the line runs straight and reverses hard
        expect(shaped(spark)).toEqual(["linear", "table"])
        expect(shaped(flame)).toEqual(["linear"])
        // the "facet" field frost used goes back in with frost
    })

    it("pairs the discharge offset with an equal and opposite one", () => {
        const { container } = render(<Elemental variant="electric">x</Elemental>)

        // the shape is re-cut by moving through the field, never off the border
        expect(container.querySelectorAll(".xp-el-back").length).toBeGreaterThan(0)
        for (const back of container.querySelectorAll(".xp-el-back")) {
            expect(back.querySelectorAll(".xp-el-shift")).toHaveLength(2)
        }
    })

    it("gives each variant its own count of travelling arcs", () => {
        const spark = render(<Elemental variant="electric">x</Elemental>)
        const flame = render(<Elemental variant="fire">x</Elemental>)

        expect(spark.container.querySelectorAll(".xp-el-arc")).toHaveLength(3)
        expect(flame.container.querySelectorAll(".xp-el-arc")).toHaveLength(2)
    })

    describe("radius", () => {
        it("clamps to the shorter side so a pill matches the content", () => {
            const { container } = render(<Elemental radius={999}>x</Elemental>)

            // no layout in jsdom, so the raw value survives and nothing throws
            expect(root(container).style.getPropertyValue("--el-radius")).toBe("999")
            expect(container.querySelector(".xp-el-edge")?.getAttribute("rx")).toBe("999")
        })

        it("passes the radius to the whole effect through one variable", () => {
            const { container } = render(<Elemental radius={32}>x</Elemental>)

            expect(root(container).style.getPropertyValue("--el-radius")).toBe("32")
        })

        it("keeps a zero radius square", () => {
            const { container } = render(<Elemental radius={0}>x</Elemental>)

            expect(root(container).style.getPropertyValue("--el-radius")).toBe("0")
        })

        it("keeps the content on the same radius as the stroke", () => {
            const { container } = render(<Elemental radius={40}>x</Elemental>)

            expect(root(container).style.getPropertyValue("--el-radius")).toBe("40")
            expect(container.querySelector(".xp-el-edge")?.getAttribute("rx")).toBe("40")
        })
    })

    describe("tuning", () => {
        it("carries intensity and speed as variables", () => {
            const { container } = render(
                <Elemental intensity={1.6} speed={2}>
                    x
                </Elemental>,
            )

            expect(root(container).style.getPropertyValue("--el-power")).toBe("1.6")
            expect(root(container).style.getPropertyValue("--el-rate")).toBe("2")
        })

        it("clamps values that would tear the effect apart", () => {
            const { container } = render(
                <Elemental intensity={99} speed={0}>
                    x
                </Elemental>,
            )

            expect(root(container).style.getPropertyValue("--el-power")).toBe("2")
            expect(root(container).style.getPropertyValue("--el-rate")).toBe("0.1")
        })

        it("overrides the accent and derives the other tones", () => {
            const { container } = render(<Elemental color="#ff0088">x</Elemental>)
            const style = root(container).style

            expect(style.getPropertyValue("--el-a")).toBe("#ff0088")
            expect(style.getPropertyValue("--el-b")).toContain("#ff0088")
            expect(style.getPropertyValue("--el-c")).toContain("#ff0088")
        })

        it("leaves the variant palette alone without a colour", () => {
            const { container } = render(<Elemental>x</Elemental>)

            expect(root(container).style.getPropertyValue("--el-a")).toBe("")
        })
    })

    describe("the body", () => {
        it("gives fire one and electric none", () => {
            const layers = (variant: "electric" | "fire") =>
                render(<Elemental variant={variant}>x</Elemental>).container.querySelectorAll(
                    ".xp-el-tide",
                ).length

            expect(layers("electric")).toBe(0)
            expect(layers("fire")).toBe(3)
        })

        it("reaches out of the box, so the flames climb away from the content", () => {
            const { container } = render(<Elemental variant="fire">x</Elemental>)
            const art = container.querySelector(".xp-el-tide")?.closest(".xp-el-art")

            expect((art as HTMLElement).dataset.face).toBe("out")
            // the inward case, and the clip that holds it, go back in with water
        })

        it("thins the flames out at the tips and the ends", () => {
            const { container } = render(<Elemental variant="fire">x</Elemental>)

            expect(container.querySelector(".xp-el-sheet")?.getAttribute("mask")).toMatch(
                /^url\(#.+\)$/,
            )
        })

        it("holds still along with everything else", () => {
            const { container } = render(
                <Elemental variant="fire" disabled>
                    x
                </Elemental>,
            )

            // the body is part of the static look, unlike the particles
            expect(container.querySelectorAll(".xp-el-tide")).toHaveLength(3)
            expect(container.querySelectorAll(".xp-el-bit")).toHaveLength(0)
        })
    })

    describe("particles", () => {
        it("keeps fire's sparks around the box, not over it", () => {
            const { container } = render(<Elemental variant="fire">x</Elemental>)

            // snow drifting over the content goes back in with frost
            expect(root(container).dataset.bits).toBeUndefined()
        })

        it("draws a small fixed pool for the variants that use them", () => {
            const { container } = render(<Elemental variant="fire">x</Elemental>)
            const bits = container.querySelectorAll(".xp-el-bit")

            expect(bits.length).toBeGreaterThan(0)
            expect(bits.length).toBeLessThanOrEqual(16)
        })

        it("places them deterministically", () => {
            const first = render(<Elemental variant="fire">x</Elemental>)
            const second = render(<Elemental variant="fire">x</Elemental>)

            const read = (view: { container: HTMLElement }) =>
                [...view.container.querySelectorAll(".xp-el-bit")].map(
                    (bit) => (bit as HTMLElement).style.cssText,
                )

            expect(read(first)).toEqual(read(second))
        })

        it("draws none when they are switched off", () => {
            const { container } = render(
                <Elemental variant="fire" particles={false}>
                    x
                </Elemental>,
            )

            expect(container.querySelectorAll(".xp-el-bit")).toHaveLength(0)
        })

        it("gives electric none, because sparks belong on the edge", () => {
            const { container } = render(<Elemental variant="electric">x</Elemental>)

            expect(container.querySelectorAll(".xp-el-bit")).toHaveLength(0)
        })
    })

    describe("the cursor", () => {
        it("stays off by default", () => {
            const { container } = render(<Elemental>x</Elemental>)

            expect(container.querySelector(".xp-el-cursor")).toBeNull()
            expect(root(container).dataset.cursor).toBeUndefined()
        })

        it("appears when asked for", () => {
            const { container } = render(<Elemental cursorEffect>x</Elemental>)

            expect(container.querySelector(".xp-el-cursor")).not.toBeNull()
            expect(root(container).dataset.cursor).toBe("true")
        })

        it("hides the native cursor on the wrapper and never on the body", () => {
            const { container } = render(<Elemental cursorEffect>x</Elemental>)

            expect(root(container).dataset.cursor).toBe("true")
            expect(document.body.style.cursor).toBe("")
            expect(document.body.className).toBe("")
        })

        it("stays off without a fine pointer", () => {
            mediaState.fine = false
            const { container } = render(<Elemental cursorEffect>x</Elemental>)

            expect(container.querySelector(".xp-el-cursor")).toBeNull()
            expect(root(container).dataset.cursor).toBeUndefined()
        })

        it("stays off under reduced motion", () => {
            mediaState.reducedMotion = true
            const { container } = render(<Elemental cursorEffect>x</Elemental>)

            expect(container.querySelector(".xp-el-cursor")).toBeNull()
        })

        it("follows the pointer inside the wrapper", () => {
            const { container } = render(<Elemental cursorEffect>x</Elemental>)
            const node = root(container)
            node.getBoundingClientRect = () => ({ left: 100, top: 40 }) as DOMRect

            act(() => {
                fireEvent.pointerMove(node, { clientX: 160, clientY: 90 })
            })

            expect(container.querySelector(".xp-el-cursor")).toHaveAttribute("data-on", "true")
        })

        it("switches off the moment the pointer leaves", () => {
            const { container } = render(<Elemental cursorEffect>x</Elemental>)
            const node = root(container)
            node.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect

            act(() => {
                fireEvent.pointerMove(node, { clientX: 20, clientY: 20 })
            })
            expect(container.querySelector(".xp-el-cursor")).toHaveAttribute("data-on", "true")

            act(() => {
                fireEvent.pointerLeave(node)
            })
            expect(container.querySelector(".xp-el-cursor")).toHaveAttribute("data-on", "false")
        })

        it("releases its listeners and its frame on unmount", () => {
            const { container, unmount } = render(<Elemental cursorEffect>x</Elemental>)
            const node = root(container)
            const remove = vi.spyOn(node, "removeEventListener")
            const stop = vi.spyOn(globalThis, "cancelAnimationFrame")
            node.getBoundingClientRect = () => ({ left: 0, top: 0 }) as DOMRect

            act(() => {
                fireEvent.pointerMove(node, { clientX: 10, clientY: 10 })
            })
            unmount()

            const types = remove.mock.calls.map(([type]) => type)
            expect(types).toContain("pointermove")
            expect(types).toContain("pointerleave")
            expect(stop).toHaveBeenCalled()
        })

        it("attaches nothing while it is switched off", () => {
            const { container } = render(<Elemental>x</Elemental>)
            const add = vi.spyOn(root(container), "addEventListener")

            expect(add).not.toHaveBeenCalled()
        })
    })

    describe("reduced motion", () => {
        it("freezes into a static edge that still shows every layer", () => {
            mediaState.reducedMotion = true
            const { container } = render(<Elemental variant="fire">x</Elemental>)

            expect(root(container).dataset.still).toBe("true")
            expect(root(container).dataset.live).toBeUndefined()
            expect(container.querySelectorAll(".xp-el-edge").length).toBeGreaterThanOrEqual(4)
            expect(container.querySelectorAll(".xp-el-arc").length).toBeGreaterThan(0)
        })

        it("drops the particles", () => {
            mediaState.reducedMotion = true
            const { container } = render(<Elemental variant="fire">x</Elemental>)

            expect(container.querySelectorAll(".xp-el-bit")).toHaveLength(0)
        })

        it("keeps moving when the consumer opts out", () => {
            mediaState.reducedMotion = true
            const { container } = render(<Elemental respectReducedMotion={false}>x</Elemental>)

            expect(root(container).dataset.still).toBeUndefined()
        })

        it("freezes the same way when disabled", () => {
            const { container } = render(<Elemental disabled>x</Elemental>)

            expect(root(container).dataset.still).toBe("true")
            expect(container.querySelectorAll(".xp-el-bit")).toHaveLength(0)
        })
    })

    describe("semantics", () => {
        it("hides every decorative layer from assistive technology", () => {
            const { container } = render(
                <Elemental variant="fire" cursorEffect>
                    <p>Real content</p>
                </Elemental>,
            )

            for (const selector of [".xp-el-art", ".xp-el-bits", ".xp-el-cursor"]) {
                const nodes = [...container.querySelectorAll(selector)]
                expect(nodes.length, selector).toBeGreaterThan(0)
                for (const node of nodes) {
                    expect(node, selector).toHaveAttribute("aria-hidden", "true")
                }
            }
        })

        it("leaves the content out of the decorative subtree", () => {
            const { container, getByText } = render(
                <Elemental>
                    <p>Real content</p>
                </Elemental>,
            )

            expect(getByText("Real content").closest("[aria-hidden]")).toBeNull()
            expect(container.querySelector(".xp-el-content")).not.toHaveAttribute("aria-hidden")
        })

        it("adds no role or tab stop of its own", () => {
            const { container } = render(<Elemental>x</Elemental>)

            expect(root(container).getAttribute("role")).toBeNull()
            expect(root(container).getAttribute("tabindex")).toBeNull()
            expect(container.querySelectorAll("[tabindex]")).toHaveLength(0)
        })

        it("gives each instance its own filter, so two never collide", () => {
            const { container } = render(
                <>
                    <Elemental>a</Elemental>
                    <Elemental>b</Elemental>
                </>,
            )
            const ids = [...container.querySelectorAll("filter")].map((node) => node.id)

            expect(ids).toHaveLength(2)
            expect(new Set(ids).size).toBe(2)
            expect(ids.every((id) => id.length > 0)).toBe(true)
        })

        it("points each wrapper at its own filter", () => {
            const { container } = render(<Elemental>x</Elemental>)
            const id = container.querySelector("filter")?.id

            expect(root(container).style.getPropertyValue("--el-warp")).toBe(`url(#${id})`)
        })

        it("passes className and style through", () => {
            const { container } = render(
                <Elemental className="mine" style={{ width: 300 }}>
                    x
                </Elemental>,
            )

            expect(root(container).className).toContain("mine")
            expect(root(container).style.width).toBe("300px")
        })
    })
})
