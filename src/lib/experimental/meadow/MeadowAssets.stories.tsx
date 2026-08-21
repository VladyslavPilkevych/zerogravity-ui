import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"

import "./Meadow.css"
import { MEADOW_VARIANT_SETS } from "./variants"
import type { MeadowVariantGroup } from "./variants"
import "./variants/gallery.css"

interface SheetProps {
    group: MeadowVariantGroup
    surface?: "" | "xp-meadow-night" | "xp-meadow-space"
}

function Sheet({ group, surface = "" }: SheetProps) {
    const set = MEADOW_VARIANT_SETS.find((entry) => entry.group === group)
    if (!set) return null

    return (
        <div className={`xp-meadow xp-assets-set ${surface}`.trim()}>
            <div className="xp-assets-head">
                <h3>{set.title}</h3>
                <p>{set.blurb}</p>
            </div>
            <div className="xp-assets-grid">
                {set.variants.map((variant) => (
                    <figure key={variant.id} className="xp-assets-tile">
                        <div className="xp-assets-art">
                            <variant.Art />
                        </div>
                        <figcaption>
                            <strong>{variant.label}</strong>
                            <small>{variant.note}</small>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </div>
    )
}

const meta = {
    title: "Experimental/Meadow Assets",
    component: Sheet,
    parameters: { surface: { padding: 0 } },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Ghosts: Story = { args: { group: "ghost" } }

export const GhostsAtNight: Story = { args: { group: "ghost", surface: "xp-meadow-night" } }

export const GhostsInSpace: Story = { args: { group: "ghost", surface: "xp-meadow-space" } }

export const Ufos: Story = { args: { group: "ufo", surface: "xp-meadow-space" } }

export const Moons: Story = { args: { group: "moon", surface: "xp-meadow-night" } }

export const Suns: Story = { args: { group: "sun" } }

export const EveryVariantRenders: Story = {
    args: { group: "ghost" },
    parameters: { chromatic: { disableSnapshot: true } },
    render: () => (
        <div>
            {MEADOW_VARIANT_SETS.map((set) => (
                <Sheet key={set.group} group={set.group} />
            ))}
        </div>
    ),
    play: async ({ canvasElement }) => {
        // the palette has to be loaded or every token-driven asset paints black
        const set = canvasElement.querySelector<HTMLElement>(".xp-assets-set")!
        for (const token of ["--meadow-body", "--meadow-face", "--meadow-ink"]) {
            await expect(getComputedStyle(set).getPropertyValue(token).trim()).not.toBe("")
        }

        const expected = MEADOW_VARIANT_SETS.reduce((total, set) => total + set.variants.length, 0)
        const drawn = canvasElement.querySelectorAll<SVGSVGElement>("svg[data-variant]")

        await expect(expected).toBe(13)
        await expect(drawn).toHaveLength(expected)

        for (const svg of drawn) {
            const box = svg.getBoundingClientRect()
            const slot = svg.parentElement!.getBoundingClientRect()

            await expect(box.width).toBeGreaterThan(8)
            await expect(box.height).toBeGreaterThan(8)
            // every asset has to fit its tile, tall wisps included
            await expect(box.height).toBeLessThanOrEqual(slot.height + 1)
            await expect(box.width).toBeLessThanOrEqual(slot.width + 1)
            await expect(svg.getAttribute("focusable")).toBe("false")
        }

        await expect(canvasElement.querySelectorAll("[tabindex], a, button")).toHaveLength(0)
    },
}
