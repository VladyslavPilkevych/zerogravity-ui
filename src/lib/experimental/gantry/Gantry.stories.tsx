import { useRef } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Gantry } from "./Gantry"

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
    title: "Experimental/Gantry",
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
