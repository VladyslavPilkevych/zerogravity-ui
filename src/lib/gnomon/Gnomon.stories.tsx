import type { Meta, StoryObj } from "@storybook/react-vite"

import { expect, waitFor } from "storybook/test"

import { Gnomon } from "./Gnomon"

const tile = (label: string) => (
    <div
        key={label}
        style={{
            display: "grid",
            placeItems: "center",
            width: 120,
            height: 120,
            borderRadius: 22,
            background: "linear-gradient(160deg, #ffffff, #e7ebf6)",
            color: "#1b2136",
            fontWeight: 700,
        }}
    >
        {label}
    </div>
)

const meta = {
    title: "Components/Gnomon",
    component: Gnomon,
    parameters: { surface: { padding: 56 } },
    args: {
        children: ["Alpha", "Beta", "Gamma"].map(tile),
        // the root is the whole lit room, so the lamp answers between the tiles too
        style: {
            display: "flex",
            gap: 34,
            alignItems: "center",
            justifyContent: "center",
            minHeight: 320,
            padding: 40,
            background: "linear-gradient(165deg, #f2f4fa, #dde2ee)",
        },
    },
} satisfies Meta<typeof Gnomon>

export default meta
type Story = StoryObj<typeof meta>

/** The light rests above and to the left, so the frame is repeatable. */
export const Resting: Story = { args: { disabled: true } }

export const LongThrow: Story = { args: { disabled: true, distance: 70, softness: 60 } }

export const HardShadow: Story = { args: { disabled: true, softness: 0, depth: 0.8 } }

export const NoLift: Story = { args: { disabled: true, lift: false } }

export const WarmShadow: Story = { args: { disabled: true, color: "#43206b" } }

export const Live: Story = { parameters: { chromatic: { disableSnapshot: true } } }

/** A pointer in the empty corner of the root, away from every tile, still moves the light. */
export const LitFromEmptySpace: Story = {
    parameters: { chromatic: { disableSnapshot: true } },
    play: async ({ canvasElement }) => {
        const host = canvasElement.querySelector(".xp-gnomon") as HTMLElement
        const tile = host.firstElementChild as HTMLElement
        const box = host.getBoundingClientRect()
        const before = tile.style.getPropertyValue("--gn-dy")

        host.dispatchEvent(
            new PointerEvent("pointermove", {
                bubbles: true,
                clientX: box.left + 8,
                clientY: box.bottom - 8,
            }),
        )

        await waitFor(() => expect(tile.style.getPropertyValue("--gn-dy")).not.toBe(before))
        await waitFor(() => expect(Number(tile.style.getPropertyValue("--gn-dy"))).toBeLessThan(0))
    },
}
