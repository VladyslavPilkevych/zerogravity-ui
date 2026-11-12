import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"

import { Tether } from "./Tether"
import { StyleBoards } from "../../../.storybook/StyleBoards"

const CURVE = "M 4 50 C 30 0, 45 100, 70 50 S 90 20, 96 50"

const meta = {
    title: "Components/Tether",
    component: Tether,
    parameters: { surface: { padding: 32 } },
    args: {
        d: CURVE,
        viewBox: "0 0 100 100",
        fit: "stretch",
        progress: 0.5,
        strokeWidth: 3,
        style: { height: 160, color: "#7cc4ff" },
    },
} satisfies Meta<typeof Tether>

export default meta
type Story = StoryObj<typeof meta>

/** Half the progress draws half the path, measured on screen. */
export const Half: Story = {
    play: async ({ canvasElement }) => {
        const line = canvasElement.querySelector(".zg-tether-line") as SVGPathElement
        await waitFor(() => expect(line.style.strokeDasharray).not.toBe(""))

        const length = parseFloat(line.style.strokeDasharray)
        await expect(length).toBeGreaterThan(100)
        await expect(parseFloat(line.style.strokeDashoffset)).toBeCloseTo(length / 2, 0)
        await expect(getComputedStyle(line).vectorEffect).toBe("non-scaling-stroke")
    },
}

export const Complete: Story = { args: { progress: 1 } }

export const Contained: Story = {
    args: { fit: "contain", d: "M 10 90 C 10 10, 90 90, 90 10", progress: 0.7 },
}

export const Timeline: Story = {
    args: {
        d: "M 4 2 L 4 98",
        viewBox: "0 0 100 100",
        progress: 0.62,
        trackDash: "4 6",
        style: { color: "#f5a524", width: 320 },
        children: (
            <ol
                style={{
                    margin: 0,
                    padding: "8px 0 8px 36px",
                    display: "grid",
                    gap: 28,
                    color: "#f5f5f7",
                    font: "15px system-ui",
                }}
            >
                <li>Sketch</li>
                <li>Prototype</li>
                <li>Ship</li>
            </ol>
        ),
    },
}

/** The original, smoother look, kept as the second style. */
export const Classic: Story = { args: { variant: "classic" } }

/** Pixel, classic and the bare minimal path at the same progress. */
export const Styles: Story = {
    render: (args) => (
        <StyleBoards
            styles={["pixel", "classic", "minimal"] as const}
            render={(style) => (
                <Tether
                    {...args}
                    style={{ height: 140 }}
                    progress={0.6}
                    track="color-mix(in srgb, currentColor 25%, transparent)"
                    variant={style}
                />
            )}
        />
    ),
}
