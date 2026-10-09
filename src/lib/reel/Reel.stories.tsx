import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { Reel } from "./Reel"

const PALETTE = ["#5b8cff", "#c86dd7", "#3fbfa0", "#ffa14a", "#ff6b8b", "#7f7fd5", "#4ac1ff"]

function slides(count: number) {
    return Array.from({ length: count }, (_, index) => (
        <div
            key={index}
            className="sb-card"
            style={{ background: `linear-gradient(150deg, #16161f, ${PALETTE[index % 7]})` }}
        >
            {index + 1}
        </div>
    ))
}

const meta = {
    title: "Components/Reel",
    component: Reel,
    parameters: {
        surface: { padding: 48 },
    },
    args: {
        itemWidth: 240,
        itemHeight: 320,
        spacing: 270,
        children: slides(6),
    },
} satisfies Meta<typeof Reel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomRadius: Story = {
    args: { radius: 24 },
}

export const SquareCorners: Story = {
    args: { radius: 0 },
}

export const HoveredCenter: Story = {
    args: { radius: 24 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const active = await canvas.findByText("1")
        await userEvent.hover(active)
        await waitFor(() => {
            expect(active.closest(".reel-item")?.getAttribute("data-active")).toBe("true")
        })
    },
}

export const FocusVisible: Story = {
    args: { radius: 24 },
    play: async ({ canvasElement }) => {
        const viewport = canvasElement.querySelector<HTMLElement>(".reel-viewport")
        expect(viewport).not.toBeNull()
        viewport?.focus()
        await waitFor(() => expect(document.activeElement).toBe(viewport))
    },
}

export const KeyboardNavigation: Story = {
    args: { radius: 24 },
    play: async ({ canvasElement }) => {
        const viewport = canvasElement.querySelector<HTMLElement>(".reel-viewport")
        viewport?.focus()
        await userEvent.keyboard("{ArrowRight}{ArrowRight}")
        await waitFor(() => {
            const active = canvasElement.querySelector('.reel-item[data-active="true"]')
            expect(active?.textContent).toBe("3")
        })
    },
}

export const SelectsNeighbourOnClick: Story = {
    args: { radius: 24 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        await userEvent.click(await canvas.findByText("2"))
        await waitFor(() => {
            const active = canvasElement.querySelector('.reel-item[data-active="true"]')
            expect(active?.textContent).toBe("2")
        })
    },
}

// Drag a third of a slide, hold still, let go: the reel must settle back, not fling.
export const ReleaseAfterHold: Story = {
    args: { radius: 24 },
    play: async ({ canvasElement }) => {
        const viewport = canvasElement.querySelector<HTMLElement>(".reel-viewport")
        if (!viewport) throw new Error("missing viewport")
        const box = viewport.getBoundingClientRect()
        const y = box.top + box.height / 2
        const x = box.left + box.width / 2
        const fire = (type: string, clientX: number) =>
            viewport.dispatchEvent(
                new PointerEvent(type, {
                    bubbles: true,
                    pointerId: 1,
                    isPrimary: true,
                    pointerType: "mouse",
                    button: 0,
                    buttons: type === "pointerup" ? 0 : 1,
                    clientX,
                    clientY: y,
                }),
            )
        const frame = () => new Promise((resolve) => requestAnimationFrame(resolve))

        fire("pointerdown", x)
        for (const dx of [30, 60, 90]) {
            await frame()
            fire("pointermove", x - dx)
        }
        await new Promise((resolve) => setTimeout(resolve, 300))
        fire("pointerup", x - 90)

        await waitFor(() => {
            const active = canvasElement.querySelector('.reel-item[data-active="true"]')
            expect(active?.textContent).toBe("1")
            const first = canvasElement.querySelector<HTMLElement>(".reel-item")
            const x = /translate3d\((-?[\d.]+)px/.exec(first?.style.transform ?? "")?.[1]
            expect(Math.abs(Number(x))).toBeLessThan(0.5)
        })
    },
}

export const SingleItem: Story = {
    args: { radius: 24, children: slides(1) },
}

export const FewItems: Story = {
    args: { radius: 24, children: slides(2) },
}

export const ManyItems: Story = {
    args: { radius: 24, children: slides(14) },
}

export const WithoutControls: Story = {
    args: { radius: 24, arrows: false, dots: false },
}

export const Looping: Story = {
    args: { radius: 24, loop: true },
}

export const Coverflow: Story = {
    args: { radius: 24, rotate: 34, depth: 120, scale: 0.72 },
}

export const NarrowViewport: Story = {
    args: { radius: 24, itemWidth: 180, itemHeight: 240, spacing: 200 },
    parameters: {
        viewport: { defaultViewport: "mobile1" },
        chromatic: { viewports: [390] },
    },
}

export const WideViewport: Story = {
    args: { radius: 24, itemWidth: 320, itemHeight: 420, spacing: 360, visible: 4 },
    parameters: { chromatic: { viewports: [1280] } },
}
