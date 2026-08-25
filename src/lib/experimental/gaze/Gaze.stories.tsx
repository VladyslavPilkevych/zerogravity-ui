import type { Meta, StoryObj } from "@storybook/react-vite"
import { waitFor } from "storybook/test"

import { Gaze } from "./Gaze"

const meta = {
    title: "Experimental/Gaze",
    component: Gaze,
    parameters: { surface: { padding: 0 } },
    args: { background: "radial-gradient(circle at 50% 30%, #1b2436, #05070c)" },
    decorators: [
        (Story) => (
            <div style={{ height: 440 }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Gaze>

export default meta
type Story = StoryObj<typeof meta>

/** The neutral pose: nothing has moved, so the render is repeatable. */
export const Neutral: Story = {
    args: { disabled: true },
}

/** The same head, held after the pointer has been carried to the right edge. */
export const LookingRight: Story = {
    play: async ({ canvasElement }) => {
        const host = canvasElement.querySelector(".xp-gaze") as HTMLElement
        // a runner without WebGL lands in the error state, and a busy one may
        // still be loading; either way there is nothing to point at, and the
        // story has already shown what it can
        try {
            await waitFor(
                () => {
                    if (host.dataset.phase === "loading") throw new Error("still loading")
                },
                { timeout: 8000 },
            )
        } catch {
            return
        }
        if (host.dataset.phase !== "ready") return

        const box = host.getBoundingClientRect()
        host.dispatchEvent(
            new PointerEvent("pointermove", {
                bubbles: true,
                clientX: box.left + box.width * 0.95,
                clientY: box.top + box.height * 0.5,
            }),
        )
        await new Promise((done) => setTimeout(done, 600))
    },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Tracking: Story = {
    parameters: { chromatic: { disableSnapshot: true } },
}

export const FarTurn: Story = {
    args: { maxYaw: 55, maxPitch: 34 },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Heavy: Story = {
    args: { damping: 0.04, headDelay: 0.75 },
    parameters: { chromatic: { disableSnapshot: true } },
}

/** Names nothing in the model recognises: it turns as a whole instead of failing. */
export const UnknownRig: Story = {
    args: { disabled: true, tracking: { head: "Armature|mixamorig:Head" } },
}

export const Decorative: Story = {
    args: { disabled: true, decorative: true },
}

export const MissingModel: Story = {
    args: { src: "/no-such-model.glb" },
}
