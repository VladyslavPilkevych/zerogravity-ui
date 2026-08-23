import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"

import { Elemental } from "./Elemental"
import { ELEMENTAL_VARIANTS } from "./variants"

function Card({ label }: { label: string }) {
    return (
        <div
            style={{
                display: "grid",
                gap: 6,
                justifyItems: "center",
                padding: "40px 30px",
                borderRadius: "inherit",
                background: "#0c0d13",
            }}
        >
            <strong style={{ fontSize: 20, fontWeight: 600, textTransform: "capitalize" }}>
                {label}
            </strong>
            <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>wraps any content</span>
        </div>
    )
}

const meta = {
    title: "Experimental/Elemental",
    component: Elemental,
    parameters: { surface: { padding: 56 } },
    args: { children: <Card label="Elemental" />, style: { width: 320 } },
} satisfies Meta<typeof Elemental>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Every animated story is frozen for Chromatic: the seeds are fixed per variant,
 * so `disabled` always renders the same frame rather than a random phase.
 */
const frozen = { disabled: true }

export const Electric: Story = {
    args: { variant: "electric", children: <Card label="electric" />, ...frozen },
}

export const Fire: Story = {
    args: { variant: "fire", children: <Card label="fire" />, ...frozen },
}

// Parked with the variants themselves.
// export const Frost: Story = {
//     args: { variant: "frost", children: <Card label="frost" />, ...frozen },
// }
//
// export const Water: Story = {
//     args: { variant: "water", children: <Card label="water" />, ...frozen },
// }

export const Running: Story = {
    args: { variant: "electric", children: <Card label="electric" /> },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const CustomColor: Story = {
    args: { variant: "electric", color: "#b478ff", children: <Card label="violet" />, ...frozen },
}

export const CustomRadius: Story = {
    args: { variant: "fire", radius: 44, children: <Card label="radius 44" />, ...frozen },
}

/** Fire climbs out of the top edge rather than sitting on it. */
export const Body: Story = {
    args: { variant: "fire", children: <Card label="fire" />, ...frozen },
    parameters: { chromatic: { disableSnapshot: false } },
    play: async ({ canvasElement }) => {
        const sheet = canvasElement.querySelector(".xp-el-sheet")!

        await expect(canvasElement.querySelectorAll(".xp-el-tide")).toHaveLength(3)
        // flames climb away from the content, so they sit behind it
        await expect(sheet.closest(".xp-el-art")).toHaveAttribute("data-face", "out")
    },
}

/** The discharge has to cross the border, not stop at it. */
export const InsideAndOut: Story = {
    args: { variant: "electric", children: <Card label="both sides" /> },
    parameters: { chromatic: { disableSnapshot: true } },
    play: async ({ canvasElement }) => {
        const faces = [...canvasElement.querySelectorAll(".xp-el-art")]

        await expect(faces).toHaveLength(2)
        await expect(getComputedStyle(faces[1]).zIndex).toBe("3")
        await expect(getComputedStyle(canvasElement.querySelector(".xp-el-content")!).zIndex).toBe(
            "2",
        )
        // the face above the content still lets every click through
        await expect(getComputedStyle(faces[1]).pointerEvents).toBe("none")
    },
}

/** The edge has to hug a pill, not draw a rectangle around it. */
export const PillRadius: Story = {
    args: {
        variant: "fire",
        radius: 999,
        children: (
            <div
                style={{
                    padding: "22px 44px",
                    borderRadius: "inherit",
                    background: "#0c0d13",
                    textAlign: "center",
                }}
            >
                Pill
            </div>
        ),
        ...frozen,
    },
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".xp-el") as HTMLElement
        const edge = canvasElement.querySelector(".xp-el-edge") as SVGRectElement

        const box = root.getBoundingClientRect()
        const half = Math.min(box.width, box.height) / 2

        // the measured clamp lands on both the stroke and the content shape
        await waitFor(() => expect(Number(edge.getAttribute("rx"))).toBeCloseTo(half, 0))
        await expect(parseFloat(getComputedStyle(root).borderTopLeftRadius)).toBeCloseTo(half, 0)
    },
}

export const SquareCorners: Story = {
    args: { variant: "fire", radius: 0, children: <Card label="radius 0" />, ...frozen },
}

export const CursorEffect: Story = {
    args: { variant: "fire", cursorEffect: true, children: <Card label="hover me" /> },
    parameters: { chromatic: { disableSnapshot: true } },
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".xp-el") as HTMLElement

        await expect(root.dataset.cursor).toBe("true")
        await expect(document.body.classList.contains("trailing-cursor-none")).toBe(false)
        await expect(document.body.style.cursor).toBe("")
    },
}

/**
 * Storybook cannot emulate the media query, so this mirrors what reduced motion
 * renders: the full edge, standing still.
 */
export const ReducedMotion: Story = {
    args: { variant: "fire", disabled: true, children: <Card label="static" /> },
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".xp-el") as HTMLElement

        await expect(root.dataset.still).toBe("true")
        await expect(canvasElement.querySelectorAll(".xp-el-bit")).toHaveLength(0)
        await expect(canvasElement.querySelectorAll(".xp-el-edge").length).toBeGreaterThanOrEqual(4)
    },
}

export const Calm: Story = {
    args: { variant: "fire", intensity: 0.4, children: <Card label="intensity 0.4" />, ...frozen },
}

export const Charged: Story = {
    args: {
        variant: "electric",
        intensity: 1.8,
        children: <Card label="intensity 1.8" />,
        ...frozen,
    },
}

export const AroundAButton: Story = {
    args: {
        variant: "electric",
        radius: 999,
        style: { width: "auto", display: "inline-block" },
        children: (
            <button
                type="button"
                style={{
                    padding: "12px 26px",
                    border: 0,
                    borderRadius: "inherit",
                    background: "#12131b",
                    color: "#fff",
                    font: "inherit",
                    fontSize: 14,
                    cursor: "pointer",
                }}
            >
                Get started
            </button>
        ),
        ...frozen,
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("button", { name: "Get started" })).toBeEnabled()
    },
}

/** The travelling arc is a dash on the real path, so it laps once at any size. */
export const TravellingArc: Story = {
    args: { variant: "electric", children: <Card label="arc" /> },
    parameters: { chromatic: { disableSnapshot: true } },
    play: async ({ canvasElement }) => {
        const arcs = canvasElement.querySelectorAll(".xp-el-arc")

        await expect(arcs.length).toBe(3)
        for (const arc of arcs) {
            await expect(arc.getAttribute("pathLength")).toBe("100")
            await expect(getComputedStyle(arc).animationName).toBe("xp-el-run")
        }
    },
}

export const EveryVariant: Story = {
    args: { children: <Card label="x" /> },
    parameters: { chromatic: { disableSnapshot: false } },
    render: () => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 34 }}>
            {ELEMENTAL_VARIANTS.map((variant) => (
                <Elemental key={variant} variant={variant} disabled style={{ width: 190 }}>
                    <Card label={variant} />
                </Elemental>
            ))}
        </div>
    ),
}
