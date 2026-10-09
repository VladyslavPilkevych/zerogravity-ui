import { useRef, type CSSProperties } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, waitFor } from "storybook/test"

import { Gantry } from "./Gantry"
import "../internal/pixel.css"

const TONES = ["#1d2b53", "#2b1d53", "#153f3a", "#4a2b18"]

function cars(count: number) {
    return Array.from({ length: count }, (_, index) => (
        <div
            key={index}
            style={{
                display: "grid",
                placeItems: "center",
                width: "100%",
                height: "100%",
                borderRadius: 18,
                background: `linear-gradient(150deg, #101017, ${TONES[index % TONES.length]})`,
                color: "#f4f6ff",
                font: "800 28px/1.2 system-ui, sans-serif",
            }}
        >
            Car {index + 1}
        </div>
    ))
}

function Port({
    scrollTo = 0,
    ...props
}: { scrollTo?: number } & Omit<Parameters<typeof Gantry>[0], "scrollContainer">) {
    const ref = useRef<HTMLDivElement>(null)

    return (
        <div
            ref={(node) => {
                ref.current = node
                if (node && scrollTo > 0) {
                    node.scrollTop = (node.scrollHeight - node.clientHeight) * scrollTo
                }
            }}
            style={{ height: 420, overflowY: "auto" }}
            tabIndex={0}
            role="region"
            aria-label="Gantry rail"
        >
            <Gantry {...props} scrollContainer={ref} height="420px" />
        </div>
    )
}

const meta = {
    title: "Components/Gantry",
    component: Gantry,
    parameters: { surface: { padding: 0 } },
    args: { children: cars(6) },
} satisfies Meta<typeof Gantry>

export default meta
type Story = StoryObj<typeof meta>

export const Start: Story = { render: (args) => <Port {...args} /> }

export const Halfway: Story = { render: (args) => <Port {...args} scrollTo={0.5} /> }

export const End: Story = { render: (args) => <Port {...args} scrollTo={1} /> }

export const NarrowCars: Story = {
    render: (args) => <Port {...args} scrollTo={0.5} itemWidth="180px" />,
}

export const NoGap: Story = { render: (args) => <Port {...args} scrollTo={0.5} gap="0px" /> }

export const NoLean: Story = { render: (args) => <Port {...args} scrollTo={0.5} lean={0} /> }

export const Disabled: Story = { render: (args) => <Port {...args} disabled /> }

export const Midpoint: Story = {
    render: (args) => <Port {...args} progress={0.5} />,
    play: async ({ canvasElement }) => {
        const track = canvasElement.querySelector<HTMLElement>(".xp-gantry")!
        const rail = canvasElement.querySelector<HTMLElement>(".xp-gantry-rail")!

        await waitFor(() => {
            expect(track.dataset.phase).toBe("moving")
            expect(rail.style.transform).toMatch(/translate3d\(-\d/)
        })
    },
}

const ACCENTS = ["#4ee1f2", "#c6f24e", "#ff5fa2", "#9d7bff"]

// the active car is marked by Gantry itself, so the story styles off it
const PIXEL_CSS = `
.story-gy-ring { background: rgba(238, 241, 255, 0.16); }
.story-gy-tab { background: rgba(238, 241, 255, 0.08); color: rgba(238, 241, 255, 0.72); }
[data-active] .story-gy-ring { background: var(--accent); filter: drop-shadow(0 0 6px var(--accent)); }
[data-active] .story-gy-tab { background: var(--accent); color: #06080d; }
`

function pixelCars(count: number) {
    return Array.from({ length: count }, (_, index) => (
        <div
            key={index}
            style={
                {
                    "--accent": ACCENTS[index % ACCENTS.length],
                    "--zg-notch": "4px",
                    display: "grid",
                    height: "100%",
                    paddingBlock: 40,
                    color: "#eef1ff",
                } as CSSProperties
            }
        >
            <div
                className="zg-px-notch"
                style={{
                    gridArea: "1 / 1",
                    display: "grid",
                    gridTemplateRows: "auto 1fr",
                    padding: 14,
                    background: "#0c0e15",
                }}
            >
                <span
                    className="story-gy-tab"
                    style={{
                        justifySelf: "start",
                        padding: "3px 7px 2px",
                        font: "11px/1 ui-monospace, monospace",
                        letterSpacing: "0.14em",
                    }}
                >
                    {String(index + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
                </span>
                <span style={{ placeSelf: "center", font: "800 30px/1 system-ui, sans-serif" }}>
                    Car {index + 1}
                </span>
            </div>
            <div
                className="story-gy-ring zg-px-ring"
                aria-hidden="true"
                style={{ gridArea: "1 / 1", pointerEvents: "none" }}
            />
        </div>
    ))
}

/** Pixel plates frozen part-way along, with the centred car lit. */
export const PixelSlides: Story = {
    args: { children: pixelCars(6) },
    render: (args) => (
        <>
            <style>{PIXEL_CSS}</style>
            <Port {...args} progress={0.4} itemWidth="240px" />
        </>
    ),
    play: async ({ canvasElement }) => {
        const cars = [...canvasElement.querySelectorAll<HTMLElement>(".xp-gantry-car")]

        await waitFor(() => {
            expect(cars.filter((car) => car.dataset.active === "true")).toHaveLength(1)
        })
    },
}
