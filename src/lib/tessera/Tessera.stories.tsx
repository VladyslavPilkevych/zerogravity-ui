import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect, userEvent, waitFor, within } from "storybook/test"

import { TesseraProvider } from "./TesseraProvider"
import { useTessera, useTesseraPhase } from "./context"

const PAGES = [
    {
        id: "home",
        label: "Home",
        title: "Studio Tessera",
        tint: "linear-gradient(150deg,#131521,#2a1f38)",
    },
    {
        id: "shop",
        label: "Shop",
        title: "The Shop",
        tint: "linear-gradient(150deg,#10201f,#1d3a32)",
    },
    {
        id: "collection",
        label: "Collection",
        title: "Spring Collection",
        tint: "linear-gradient(150deg,#201524,#3a2030)",
    },
] as const

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function MockApp({ readyDelay = 0 }: { readyDelay?: number }) {
    const tessera = useTessera()
    const phase = useTesseraPhase()
    const [route, setRoute] = useState<string>(PAGES[0].id)

    const page = PAGES.find((entry) => entry.id === route) ?? PAGES[0]

    const go = (next: string) => {
        void tessera
            .run(async () => {
                if (readyDelay > 0) await wait(readyDelay)
                setRoute(next)
            })
            .catch(() => {})
    }

    return (
        <div
            style={{ minHeight: 460, background: page.tint, display: "grid", placeItems: "center" }}
        >
            <div style={{ display: "grid", gap: 20, justifyItems: "center", padding: 48 }}>
                <h2 style={{ margin: 0, fontSize: 44, letterSpacing: "-0.03em" }}>{page.title}</h2>
                <div style={{ display: "flex", gap: 12 }}>
                    {PAGES.map((entry) => (
                        <button
                            key={entry.id}
                            type="button"
                            onClick={() => go(entry.id)}
                            style={{
                                padding: "11px 22px",
                                borderRadius: 999,
                                border: "1px solid rgba(255,255,255,0.28)",
                                background:
                                    entry.id === route ? "#ffffff" : "rgba(255,255,255,0.06)",
                                color: entry.id === route ? "#0b0b12" : "#ffffff",
                                font: "inherit",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            {entry.label}
                        </button>
                    ))}
                </div>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>phase: {phase}</span>
            </div>
        </div>
    )
}

const meta = {
    title: "Components/Tessera",
    component: TesseraProvider,
    parameters: { surface: { padding: 0 } },
    render: (args) => (
        <TesseraProvider {...args}>
            <MockApp />
        </TesseraProvider>
    ),
} satisfies Meta<typeof TesseraProvider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Dark: Story = {
    args: { color: "#f4f1ea" },
}

export const CenterOut: Story = {
    args: { sequence: "center" },
}

export const Reverse: Story = {
    args: { sequence: "reverse", revealSequence: "row" },
}

export const DenseGrid: Story = {
    args: { rows: 8, columns: 12, duration: 260, stagger: 460 },
}

export const FlatTiming: Story = {
    args: { stagger: 0, duration: 180 },
}

export const Lifecycle: Story = {
    args: { duration: 180, stagger: 90 },
    parameters: { chromatic: { disableSnapshot: true } },
    render: (args) => (
        <TesseraProvider {...args}>
            <MockApp readyDelay={400} />
        </TesseraProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const heading = () => canvas.getByRole("heading").textContent

        await expect(canvasElement.querySelector(".xp-tessera")).toBeNull()

        const started = performance.now()
        await userEvent.click(canvas.getByRole("button", { name: "Shop" }))

        const overlay = await waitFor(
            () => {
                const node = canvasElement.querySelector<HTMLElement>(".xp-tessera")
                if (!node) throw new Error("overlay never mounted")
                return node
            },
            { timeout: 2000 },
        )

        await expect(overlay.querySelectorAll(".xp-tessera-tile")).toHaveLength(24)
        await expect(overlay.getAttribute("aria-hidden")).toBe("true")

        await waitFor(() => expect(overlay.dataset.phase).toBe("covered"), { timeout: 3000 })
        await expect(performance.now() - started).toBeGreaterThanOrEqual(240)

        const box = overlay.getBoundingClientRect()
        await expect(Math.round(box.left)).toBe(0)
        await expect(Math.round(box.top)).toBe(0)
        await expect(Math.round(box.width)).toBe(document.documentElement.clientWidth)
        await expect(Math.round(box.height)).toBe(document.documentElement.clientHeight)

        const cells = Array.from(overlay.querySelectorAll(".xp-tessera-tile")).map((tile) =>
            tile.getBoundingClientRect(),
        )
        for (let index = 1; index < 6; index += 1) {
            await expect(cells[index].left - cells[index - 1].right).toBeLessThanOrEqual(0)
        }
        await expect(cells[0].top).toBeLessThanOrEqual(box.top)
        await expect(cells[23].bottom).toBeGreaterThanOrEqual(box.bottom)

        await expect(heading()).toBe("Studio Tessera")

        await waitFor(() => expect(heading()).toBe("The Shop"), { timeout: 3000 })
        await expect(canvasElement.querySelector(".xp-tessera")).not.toBeNull()

        await waitFor(() => expect(canvasElement.querySelector(".xp-tessera")).toBeNull(), {
            timeout: 3000,
        })
    },
}

export const RapidNavigation: Story = {
    args: { duration: 140, stagger: 70 },
    parameters: { chromatic: { disableSnapshot: true } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const heading = () => canvas.getByRole("heading").textContent

        await userEvent.click(canvas.getByRole("button", { name: "Shop" }))
        await userEvent.click(canvas.getByRole("button", { name: "Collection" }))

        await waitFor(() => expect(canvasElement.querySelector(".xp-tessera")).toBeNull(), {
            timeout: 4000,
        })
        await expect(heading()).toBe("The Shop")
        await expect(canvasElement.querySelectorAll(".xp-tessera")).toHaveLength(0)

        await userEvent.click(canvas.getByRole("button", { name: "Collection" }))
        await waitFor(() => expect(heading()).toBe("Spring Collection"), { timeout: 4000 })
        await waitFor(() => expect(canvasElement.querySelector(".xp-tessera")).toBeNull(), {
            timeout: 4000,
        })
    },
}
