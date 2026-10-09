import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect } from "storybook/test"

import { Chroma } from "./Chroma"

const meta = {
    title: "Components/Chroma",
    component: Chroma,
    parameters: { surface: { padding: 0 } },
    args: { style: { minHeight: 400 } },
    decorators: [
        (Story) => (
            <div
                style={{
                    minHeight: 400,
                    background: "radial-gradient(circle at 50% 40%, #131a2e, #05070d)",
                }}
            >
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Chroma>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing has moved yet, so the canvas is empty and repeatable. */
export const Untouched: Story = { args: { disabled: true } }

async function drawCurve(canvasElement: HTMLElement): Promise<Uint8ClampedArray | undefined> {
    const host = canvasElement.querySelector(".xp-chroma") as HTMLElement
    const box = host.getBoundingClientRect()
    const curve = Array.from({ length: 37 }, (_, i) => {
        const t = i / 36
        return {
            x: box.width * (0.12 + 0.76 * t),
            y: box.height * (0.5 - 0.28 * Math.sin(t * Math.PI * 1.6)),
        }
    })

    for (const point of curve) {
        host.dispatchEvent(
            new PointerEvent("pointermove", {
                bubbles: true,
                clientX: box.left + point.x,
                clientY: box.top + point.y,
            }),
        )
    }

    const trail = host.querySelector("canvas") as HTMLCanvasElement
    const scale = trail.width / box.width
    const head = curve[curve.length - 1]
    return trail
        .getContext("2d")
        ?.getImageData(Math.round(head.x * scale), Math.round(head.y * scale), 1, 1).data
}

/**
 * A fixed curve fed in as pointer samples while paused: time advances one
 * frame per sample and then stops, so the trail freezes mid-fade.
 */
export const SmoothTrail: Story = {
    args: { paused: true },
    play: async ({ canvasElement }) => {
        const pixel = await drawCurve(canvasElement)
        await expect(pixel?.[3] ?? 0).toBeGreaterThan(0)
    },
}

/** Named, oklch() and var() colours all reach the canvas, not just hex. */
export const CssColours: Story = {
    args: {
        paused: true,
        colors: ["lime", "oklch(0.7 0.2 300)", "var(--chroma-faded, rgb(34 211 255))"],
    },
    play: async ({ canvasElement }) => {
        const pixel = await drawCurve(canvasElement)
        const [red, green, blue, alpha] = pixel ?? [0, 0, 0, 0]
        await expect(alpha).toBeGreaterThan(0)
        await expect(green).toBeGreaterThan(red)
        await expect(green).toBeGreaterThan(blue)
    },
}

export const Wide: Story = {
    args: { width: 48, blur: 20 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const OwnPalette: Story = {
    args: { colors: ["#ffd166", "#06d6a0", "#118ab2"] },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Live: Story = { parameters: { chromatic: { disableSnapshot: true } } }
