import { useRef } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Concertina, ConcertinaPanel } from "./Concertina"

const TONES = ["#1d2b53", "#2b1d53", "#153f3a", "#4a2b18"]

function leaves(count: number) {
    return Array.from({ length: count }, (_, index) => (
        <ConcertinaPanel key={index}>
            <div
                style={{
                    display: "grid",
                    placeItems: "center",
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(150deg, #101017, ${TONES[index % TONES.length]})`,
                    color: "#f4f6ff",
                    font: "800 34px/1.2 system-ui, sans-serif",
                }}
            >
                Leaf {index + 1}
            </div>
        </ConcertinaPanel>
    ))
}

/** A bounded scroller, so the fold can be shown without moving the page. */
function Port({
    scrollTo = 0,
    ...props
}: { scrollTo?: number } & Omit<Parameters<typeof Concertina>[0], "scrollContainer">) {
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
            aria-label="Concertina leaves"
        >
            <Concertina {...props} scrollContainer={ref} height="300px" />
        </div>
    )
}

const meta = {
    title: "Experimental/Concertina",
    component: Concertina,
    parameters: { surface: { padding: 0 } },
    args: { children: leaves(4) },
} satisfies Meta<typeof Concertina>

export default meta
type Story = StoryObj<typeof meta>

export const Top: Story = { render: (args) => <Port {...args} /> }

export const MidFold: Story = { render: (args) => <Port {...args} scrollTo={0.45} /> }

export const Deep: Story = { render: (args) => <Port {...args} scrollTo={0.8} /> }

export const ShallowAngle: Story = {
    render: (args) => <Port {...args} scrollTo={0.45} angle={25} />,
}

export const FlatPerspective: Story = {
    render: (args) => <Port {...args} scrollTo={0.45} depth={3000} />,
}

export const NoShading: Story = { render: (args) => <Port {...args} scrollTo={0.45} shade={0} /> }

export const Disabled: Story = { render: (args) => <Port {...args} scrollTo={0.45} disabled /> }
