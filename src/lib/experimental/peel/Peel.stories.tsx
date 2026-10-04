import { useRef } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Peel } from "./Peel"

const front = (
    <div
        style={{
            display: "grid",
            placeItems: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(150deg, #f6f3ec, #d8d2c4)",
            color: "#1a1d28",
            font: "800 40px/1.2 system-ui, sans-serif",
        }}
    >
        Cover
    </div>
)

const back = (
    <div
        style={{
            display: "grid",
            placeItems: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(150deg, #10233f, #08403c)",
            color: "#eaf2ff",
            font: "800 40px/1.2 system-ui, sans-serif",
        }}
    >
        Underneath
    </div>
)

function Port({
    scrollTo = 0,
    ...props
}: { scrollTo?: number } & Omit<Parameters<typeof Peel>[0], "scrollContainer">) {
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
            aria-label="Peel sheet"
        >
            <Peel {...props} scrollContainer={ref} height="420px" />
        </div>
    )
}

const meta = {
    title: "Experimental/Peel",
    component: Peel,
    parameters: { surface: { padding: 0 } },
    args: { front, back },
} satisfies Meta<typeof Peel>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = { render: (args) => <Port {...args} /> }

export const HalfLifted: Story = { render: (args) => <Port {...args} scrollTo={0.45} /> }

export const NearlyOff: Story = { render: (args) => <Port {...args} scrollTo={0.85} /> }

export const FromTopLeft: Story = {
    render: (args) => <Port {...args} scrollTo={0.45} corner="top-left" />,
}

export const FromBottomRight: Story = {
    render: (args) => <Port {...args} scrollTo={0.45} corner="bottom-right" />,
}

export const NoCurl: Story = { render: (args) => <Port {...args} scrollTo={0.45} curl={0} /> }

export const Disabled: Story = { render: (args) => <Port {...args} disabled /> }
