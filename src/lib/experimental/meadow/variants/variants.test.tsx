import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Meadow } from "../Meadow"
import { ghostBody } from "./ghostBody"
import { MEADOW_VARIANT_SETS } from "./index"

const APPROVED: Record<string, readonly string[]> = {
    ghost: ["ghost-1", "ghost-5", "ghost-6"],
    ufo: ["ufo-1", "ufo-3", "ufo-6"],
    moon: ["moon-1", "moon-3"],
    sun: ["sun-1", "sun-3", "sun-4", "sun-5", "sun-6"],
}

const REJECTED = [
    "ghost-2",
    "ghost-3",
    "ghost-4",
    "ghost-7",
    "ufo-2",
    "ufo-4",
    "ufo-5",
    "ufo-7",
    "moon-2",
    "moon-4",
    "moon-5",
    "moon-6",
    "moon-7",
    "sun-2",
    "sun-7",
    "plane-1",
    "plane-2",
    "plane-3",
    "plane-4",
    "plane-5",
    "plane-6",
    "plane-7",
]

const approvedIds = new Set(Object.values(APPROVED).flat())

describe("the approved asset library", () => {
    it("holds exactly the four surviving groups", () => {
        expect(MEADOW_VARIANT_SETS.map((set) => set.group)).toEqual(["ghost", "ufo", "moon", "sun"])
    })

    it("has no airplane group at all", () => {
        expect(MEADOW_VARIANT_SETS.some((set) => set.group === ("plane" as string))).toBe(false)
    })

    it("keeps only the selected variants in each group", () => {
        for (const set of MEADOW_VARIANT_SETS) {
            expect(
                set.variants.map((variant) => variant.id),
                set.group,
            ).toEqual(APPROVED[set.group])
        }
    })

    it("labels each survivor with the number it was reviewed under", () => {
        for (const set of MEADOW_VARIANT_SETS) {
            for (const variant of set.variants) {
                const number = variant.id.split("-")[1]
                expect(variant.label.endsWith(number), variant.id).toBe(true)
            }
        }
    })

    it("keeps ids unique and never reuses a rejected one", () => {
        const seen = new Set<string>()

        for (const set of MEADOW_VARIANT_SETS) {
            for (const variant of set.variants) {
                expect(seen.has(variant.id)).toBe(false)
                expect(REJECTED).not.toContain(variant.id)
                seen.add(variant.id)
            }
        }

        expect(seen.size).toBe(13)
    })

    it("gives every survivor a note explaining what is different", () => {
        for (const set of MEADOW_VARIANT_SETS) {
            for (const variant of set.variants) {
                expect(variant.note.length).toBeGreaterThan(12)
            }
        }
    })
})

describe("the artwork", () => {
    it("renders one decorative svg per variant, tagged with its id", () => {
        for (const set of MEADOW_VARIANT_SETS) {
            for (const variant of set.variants) {
                const { container, unmount } = render(<variant.Art />)
                const svg = container.querySelector("svg")

                expect(svg, variant.id).not.toBeNull()
                expect(svg?.getAttribute("data-variant")).toBe(variant.id)
                expect(svg?.getAttribute("focusable")).toBe("false")
                expect(svg?.getAttribute("role")).toBe("presentation")
                expect(container.querySelectorAll("[tabindex], a, button, title")).toHaveLength(0)
                unmount()
            }
        }
    })

    it("draws something substantial rather than a placeholder", () => {
        for (const set of MEADOW_VARIANT_SETS) {
            for (const variant of set.variants) {
                const { container, unmount } = render(<variant.Art />)
                const shapes = container.querySelectorAll(
                    "path, circle, ellipse, rect, line, polygon",
                )

                expect(shapes.length, variant.id).toBeGreaterThanOrEqual(3)
                unmount()
            }
        }
    })

    it("keeps every survivor in a group visually distinct", () => {
        for (const set of MEADOW_VARIANT_SETS) {
            const shapes = new Set<string>()

            for (const variant of set.variants) {
                const { container, unmount } = render(<variant.Art />)
                const svg = container.querySelector("svg")!
                shapes.add(`${svg.getAttribute("viewBox")}|${svg.innerHTML}`)
                unmount()
            }

            expect(shapes.size, set.group).toBe(set.variants.length)
        }
    })

    it("keeps the ghosts on the palette tokens so they follow the theme", () => {
        const ghosts = MEADOW_VARIANT_SETS.find((set) => set.group === "ghost")!

        for (const variant of ghosts.variants) {
            const { container, unmount } = render(<variant.Art />)

            expect(container.innerHTML, variant.id).toContain("var(--meadow-body)")
            expect(container.innerHTML, variant.id).toContain("var(--meadow-face)")
            unmount()
        }
    })
})

describe("ghostBody", () => {
    it("closes the silhouette and hangs the requested scallops", () => {
        const path = ghostBody({
            width: 60,
            height: 70,
            top: 5,
            shoulder: 28,
            hem: 54,
            scallops: 3,
            droop: 9,
        })

        expect(path.startsWith("M30 5")).toBe(true)
        expect(path.endsWith("Z")).toBe(true)
        expect(path.match(/Q/g)).toHaveLength(3)
    })

    it("scales the hem with the scallop count", () => {
        for (const scallops of [2, 4, 5]) {
            const path = ghostBody({
                width: 64,
                height: 74,
                top: 6,
                shoulder: 30,
                hem: 56,
                scallops,
                droop: 8,
            })

            expect(path.match(/Q/g)).toHaveLength(scallops)
        }
    })
})

describe("the live scene", () => {
    it("draws only approved artwork, in every theme", () => {
        for (const theme of ["sunrise", "day", "sunset", "night", "space"] as const) {
            const { container, unmount } = render(
                <Meadow theme={theme} density="lively">
                    hero
                </Meadow>,
            )

            const used = Array.from(container.querySelectorAll("[data-variant]")).map((node) =>
                node.getAttribute("data-variant"),
            )

            expect(used.length, theme).toBeGreaterThan(0)
            for (const id of used) {
                expect(approvedIds.has(id ?? ""), `${theme} used ${id}`).toBe(true)
            }
            unmount()
        }
    })

    it("never reaches for a rejected variant or an airplane", () => {
        for (const theme of ["sunrise", "day", "sunset", "night", "space"] as const) {
            const { container, unmount } = render(
                <Meadow theme={theme} density="lively">
                    hero
                </Meadow>,
            )

            for (const id of REJECTED) {
                expect(
                    container.querySelector(`[data-variant="${id}"]`),
                    `${theme} still draws ${id}`,
                ).toBeNull()
            }
            unmount()
        }
    })

    it("takes its ghosts from the approved ghost set", () => {
        const { container } = render(<Meadow density="lively">hero</Meadow>)

        const ghosts = Array.from(
            container.querySelectorAll('.xp-meadow-object[data-kind="mascot"] [data-variant]'),
        ).map((node) => node.getAttribute("data-variant"))

        expect(ghosts.length).toBeGreaterThan(0)
        for (const id of ghosts) {
            expect(APPROVED.ghost).toContain(id)
        }
    })
})
