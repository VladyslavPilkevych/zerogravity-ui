import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fireEvent, waitFor } from "storybook/test"

import { Folio, FolioPanel } from "./Folio"

const SWATCHES = [
    ["Harbour", "linear-gradient(160deg, #2e5f8a, #0f2a40)"],
    ["Field", "linear-gradient(160deg, #6b8f3a, #213314)"],
    ["Ember", "linear-gradient(160deg, #b5532f, #3a160c)"],
    ["Dusk", "linear-gradient(160deg, #6a4a9c, #1d1233)"],
] as const

const meta = {
    title: "Components/Folio",
    component: Folio,
    parameters: { surface: { padding: 24 } },
    args: {
        label: "Collections",
        height: 320,
        children: SWATCHES.map(([name, fill]) => (
            <FolioPanel key={name} label={name} media={<div style={{ background: fill }} />}>
                {(open) => (
                    <a
                        href={`#${name.toLowerCase()}`}
                        style={{
                            position: "absolute",
                            left: 20,
                            bottom: 18,
                            color: "#fff",
                            font: `600 ${open ? 22 : 15}px/1.2 system-ui`,
                            textDecoration: "none",
                        }}
                    >
                        {name}
                    </a>
                )}
            </FolioPanel>
        )),
    },
} satisfies Meta<typeof Folio>

export default meta
type Story = StoryObj<typeof meta>

function length(value: string, width: number) {
    let total = 0
    for (const match of value.matchAll(/(-?[\d.]+)(px|%)/g)) {
        const number = parseFloat(match[1])
        total += match[2] === "%" ? (number / 100) * width : number
    }
    return total
}

/** Each panel's visible window, read from computed style so it holds mid-transition too. */
function windows(canvas: HTMLElement) {
    return [...canvas.querySelectorAll<HTMLElement>(".zg-folio-panel")].map((panel) => {
        const style = getComputedStyle(panel)
        const width = panel.offsetWidth
        const left = length(style.translate.replace(/ 0px$/, ""), width)
        const hide = length(/inset\(0px ([^ ]+)/.exec(style.clipPath)?.[1] ?? "0px", width)
        return { left, right: left + width - hide, width }
    })
}

function gaps(canvas: HTMLElement) {
    const list = windows(canvas)
    return list.slice(1).map((window, index) => window.left - list[index].right)
}

/** Opening a panel never resizes one, and the gaps between panels stay real. */
export const Classic: Story = {
    args: { variant: "classic" },
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".zg-folio") as HTMLElement
        await waitFor(() => expect(root).toHaveAttribute("data-layout", "rail"))
        const before = windows(canvasElement).map((window) => window.width)

        const third = canvasElement.querySelectorAll(".zg-folio-panel")[2] as HTMLElement
        fireEvent.pointerOver(third, { pointerType: "mouse" })
        await waitFor(() => expect(third).toHaveAttribute("data-open"))

        await waitFor(
            () => {
                expect(windows(canvasElement).map((window) => window.width)).toEqual(before)
                for (const gap of gaps(canvasElement)) expect(gap).toBeCloseTo(12, 0)
                expect(root.style.getPropertyValue("--zg-folio-at")).toBe("2")
            },
            { timeout: 2000 },
        )
    },
}

export const Pixel: Story = {
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".zg-folio") as HTMLElement
        await expect(root).toHaveAttribute("data-variant", "pixel")
        const panel = canvasElement.querySelector(".zg-folio-panel") as HTMLElement
        await expect(getComputedStyle(panel).clipPath.startsWith("polygon")).toBe(true)
    },
}

/** Switching panels quickly retargets one value, so the gaps hold steady mid-flight. */
export const RapidSwitching: Story = {
    args: { variant: "classic" },
    parameters: { chromatic: { disableSnapshot: true } },
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".zg-folio") as HTMLElement
        await waitFor(() => expect(root).toHaveAttribute("data-layout", "rail"))
        const panels = [...canvasElement.querySelectorAll<HTMLElement>(".zg-folio-panel")]
        const frame = () => new Promise((resolve) => requestAnimationFrame(resolve))

        let widest = 0
        for (const index of [3, 1, 2, 0, 3, 1]) {
            fireEvent.pointerOver(panels[index], { pointerType: "mouse" })
            for (let step = 0; step < 4; step++) {
                await frame()
                for (const gap of gaps(canvasElement)) widest = Math.max(widest, Math.abs(gap - 12))
            }
        }
        await expect(widest).toBeLessThan(0.5)
    },
}

export const KeyboardFocus: Story = {
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".zg-folio") as HTMLElement
        await waitFor(() => expect(root).toHaveAttribute("data-layout", "rail"))
        const link = canvasElement.querySelector("a[href='#dusk']") as HTMLElement
        link.focus()
        await waitFor(() => expect(root.style.getPropertyValue("--zg-folio-at")).toBe("3"))
        await expect(link.closest(".zg-folio-panel")).toHaveAttribute("data-open")
    },
}

export const Narrow: Story = {
    decorators: [
        (Story) => (
            <div style={{ width: 360 }}>
                <Story />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".zg-folio") as HTMLElement
        await waitFor(() => expect(root).toHaveAttribute("data-layout", "stack"))
        await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1)
        for (const panel of canvasElement.querySelectorAll(".zg-folio-panel")) {
            await expect(panel).toHaveAttribute("data-open")
        }
    },
}

export const Controlled: Story = { args: { active: 1 } }
