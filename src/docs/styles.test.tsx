import { render } from "@testing-library/react"
import type { ReactElement } from "react"
import { describe, expect, it } from "vitest"

import {
    Calendar,
    Checklist,
    Clock,
    Detent,
    Folio,
    FolioPanel,
    Progress,
    Sash,
    Tag,
    Task,
    Tether,
} from "@/lib"
import type { ControlDef } from "@/playground/panel/types"

import { COMPONENTS, findComponent } from "./registry"
import { stylePresets, VISUAL_STYLES, type StyledSlug } from "./styles"

const NOW = new Date(2026, 2, 11, 10, 40)

/** The smallest render of each styled component, with the style prop spread in. */
const SAMPLES: Record<StyledSlug, (style: Record<string, string>) => ReactElement> = {
    calendar: (style) => <Calendar events={[]} now={NOW} defaultDate={NOW} {...style} />,
    task: (style) => <Task title="Write" {...style} />,
    checklist: (style) => <Checklist label="Steps" items={[{ id: "a", label: "A" }]} {...style} />,
    progress: (style) => <Progress label="Done" value={1} max={4} {...style} />,
    detent: (style) => (
        <Detent
            label="View"
            options={[
                { value: "a", label: "A" },
                { value: "b", label: "B" },
            ]}
            {...style}
        />
    ),
    folio: (style) => (
        <Folio label="Work" {...style}>
            <FolioPanel label="One">one</FolioPanel>
            <FolioPanel label="Two">two</FolioPanel>
        </Folio>
    ),
    tag: (style) => <Tag {...style}>Live</Tag>,
    clock: (style) => <Clock value={NOW} {...style} />,
    sash: (style) => (
        <Sash disabled {...style}>
            <span>one</span>
        </Sash>
    ),
    tether: (style) => <Tether d="M 0 0 L 10 10" progress={0.5} {...style} />,
}

function styleSelect(slug: string): ControlDef | undefined {
    const entry = findComponent(slug)!
    return entry.controls
        .flatMap((group) => group.controls)
        .find((control) => control.kind === "select" && control.label === "Style")
}

describe("the visual style inventory", () => {
    const slugs = Object.keys(VISUAL_STYLES) as StyledSlug[]

    it.each(slugs)("%s: docs offer exactly the inventory's styles, pixel first", (slug) => {
        const { prop, styles } = VISUAL_STYLES[slug]
        const entry = findComponent(slug)!

        expect(entry.status).toBe("stable")
        expect(styles[0]).toBe("pixel")
        expect(entry.defaults[prop]).toBe("pixel")
        expect(styleSelect(slug)).toEqual({
            kind: "select",
            path: prop,
            label: "Style",
            options: styles,
        })
        expect(entry.presets).toEqual(stylePresets(slug))
    })

    it.each(slugs)("%s: every listed style renders as its own data attribute", (slug) => {
        const { prop, styles } = VISUAL_STYLES[slug]
        const attribute = `data-${prop}`
        for (const style of styles) {
            const { container, unmount } = render(SAMPLES[slug]({ [prop]: style }))
            const root = container.querySelector(`[${attribute}="${style}"]`)
            expect(root, `${slug} ${style}`).not.toBeNull()
            unmount()
        }
        const { container } = render(SAMPLES[slug]({}))
        expect(container.querySelector(`[${attribute}="pixel"]`)).not.toBeNull()
    })

    it("lists every stable component that offers a pixel or classic style", () => {
        const family = new Set(["pixel", "classic", "minimal", "glass"])
        const styled = COMPONENTS.filter((entry) => entry.status === "stable")
            .filter((entry) =>
                entry.controls
                    .flatMap((group) => group.controls)
                    .some(
                        (control) =>
                            control.kind === "select" &&
                            (control.path === "variant" || control.path === "appearance") &&
                            control.options.filter((option) => family.has(option)).length > 1,
                    ),
            )
            .map((entry) => entry.slug)
            .sort()

        expect(styled).toEqual([...slugs].sort())
    })

    it("keeps the samples in step with the inventory", () => {
        expect(Object.keys(SAMPLES).sort()).toEqual([...slugs].sort())
    })
})
