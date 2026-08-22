import { describe, expect, it } from "vitest"

import { COMPONENT_SLUGS } from "../../e2e/routes.data"
import { PREVIEWS } from "./previews"
import { COMPONENTS, groupByCategory, REPOSITORY_URL, sidebarIndex } from "./registry"
import { DOC_CATEGORIES } from "./types"

describe("the component registry", () => {
    it("has a unique slug per component", () => {
        const slugs = COMPONENTS.map((entry) => entry.slug)

        expect(new Set(slugs).size).toBe(slugs.length)
    })

    it("uses url-safe slugs", () => {
        for (const entry of COMPONENTS) {
            expect(entry.slug, entry.name).toMatch(/^[a-z0-9-]+$/)
        }
    })

    it("gives every component a preview", () => {
        for (const entry of COMPONENTS) {
            expect(PREVIEWS[entry.slug], entry.slug).toBeDefined()
        }
    })

    it("has no preview without a component", () => {
        for (const slug of Object.keys(PREVIEWS)) {
            expect(
                COMPONENTS.some((entry) => entry.slug === slug),
                slug,
            ).toBe(true)
        }
    })

    it("only uses declared categories", () => {
        for (const entry of COMPONENTS) {
            expect(DOC_CATEGORIES, entry.slug).toContain(entry.category)
        }
    })

    it("describes every component in a sentence", () => {
        for (const entry of COMPONENTS) {
            expect(entry.description.length, entry.slug).toBeGreaterThan(20)
            expect(entry.description.endsWith("."), entry.slug).toBe(true)
        }
    })

    it("only omits props that exist in the defaults", () => {
        for (const entry of COMPONENTS) {
            for (const key of entry.omit ?? []) {
                expect(Object.keys(entry.defaults), `${entry.slug}.${key}`).toContain(key)
            }
        }
    })

    it("only controls paths that exist in the defaults", () => {
        for (const entry of COMPONENTS) {
            for (const group of entry.controls) {
                for (const def of group.controls) {
                    const root = def.path.split(".")[0]
                    expect(Object.keys(entry.defaults), `${entry.slug}.${def.path}`).toContain(root)
                }
            }
        }
    })

    it("documents every default: a control, an omission or an extra prop", () => {
        for (const entry of COMPONENTS) {
            const controlled = new Set(
                entry.controls.flatMap((group) =>
                    group.controls.map((def) => def.path.split(".")[0]),
                ),
            )
            const omitted = new Set(entry.omit ?? [])
            const extra = new Set((entry.extraProps ?? []).map((row) => row.name))

            for (const key of Object.keys(entry.defaults)) {
                const covered = controlled.has(key) || omitted.has(key) || extra.has(key)
                expect(covered, `${entry.slug}.${key} is undocumented`).toBe(true)
            }
        }
    })

    it("keeps the end-to-end route list in step", () => {
        expect([...COMPONENT_SLUGS]).toEqual(COMPONENTS.map((entry) => entry.slug))
    })

    it("points at the real repository", () => {
        expect(REPOSITORY_URL).toBe("https://github.com/VladyslavPilkevych/zerogravity-ui")
    })

    it("exposes a light index for the sidebar", () => {
        const index = sidebarIndex()

        expect(index).toHaveLength(COMPONENTS.length)
        expect(Object.keys(index[0]).sort()).toEqual([
            "category",
            "description",
            "name",
            "slug",
            "status",
            "tags",
        ])
    })

    it("groups without losing or duplicating a component", () => {
        const groups = groupByCategory(COMPONENTS)
        const total = groups.reduce((sum, group) => sum + group.items.length, 0)

        expect(total).toBe(COMPONENTS.length)
        expect(new Set(groups.map((group) => group.category)).size).toBe(groups.length)
    })

    it("declares dependencies as an array on every component", () => {
        for (const entry of COMPONENTS) {
            expect(Array.isArray(entry.dependencies), entry.slug).toBe(true)
        }
    })

    it("keeps DOC_CATEGORIES in sync with what is used", () => {
        const used = new Set(COMPONENTS.map((entry) => entry.category))

        for (const category of used) expect(DOC_CATEGORIES).toContain(category)
    })
})
