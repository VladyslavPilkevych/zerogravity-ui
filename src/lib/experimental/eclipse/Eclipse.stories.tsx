import { useRef } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Eclipse, EclipseSection } from "./Eclipse"

const TONES = ["#1d2b53", "#2b1d53", "#153f3a", "#4a2b18"]

function sections(count: number) {
    return Array.from({ length: count }, (_, index) => (
        <EclipseSection key={index}>
            <div
                style={{
                    display: "grid",
                    placeItems: "center",
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(150deg, #101017, ${TONES[index % TONES.length]})`,
                    color: "#f4f6ff",
                    font: "800 44px/1.2 system-ui, sans-serif",
                }}
            >
                Section {index + 1}
            </div>
        </EclipseSection>
    ))
}

/** A scroll port, so the effect can be shown without moving the page. */
function Port({
    scrollTo = 0,
    ...props
}: { scrollTo?: number } & Omit<Parameters<typeof Eclipse>[0], "scrollContainer">) {
    const ref = useRef<HTMLDivElement>(null)

    return (
        <div
            ref={(node) => {
                ref.current = node
                if (node && scrollTo > 0) node.scrollTop = node.clientHeight * scrollTo
            }}
            style={{ height: 420, overflowY: "auto" }}
            tabIndex={0}
            role="region"
            aria-label="Eclipse sections"
        >
            <Eclipse {...props} scrollContainer={ref} height="420px" />
            <div style={{ height: 420 }} />
        </div>
    )
}

const meta = {
    title: "Experimental/Eclipse",
    component: Eclipse,
    parameters: { surface: { padding: 0 } },
    args: { children: sections(3) },
} satisfies Meta<typeof Eclipse>

export default meta
type Story = StoryObj<typeof meta>

/** Nothing has scrolled: the first section stands alone. */
export const FirstSection: Story = {
    render: (args) => <Port {...args} />,
}

/** Half a section of scroll: section two is caught mid-cover. */
export const HalfCovered: Story = {
    render: (args) => <Port {...args} scrollTo={0.5} />,
}

export const FullyCovered: Story = {
    render: (args) => <Port {...args} scrollTo={1} />,
}

export const FromLeft: Story = {
    render: (args) => <Port {...args} scrollTo={0.5} from="left" />,
}

export const FromRight: Story = {
    render: (args) => <Port {...args} scrollTo={0.5} from="right" />,
}

export const DeepRecede: Story = {
    render: (args) => <Port {...args} scrollTo={0.6} recede={0.18} dim={0.75} />,
}

export const Blurred: Story = {
    render: (args) => <Port {...args} scrollTo={0.6} blur={12} />,
}

export const TwoSections: Story = {
    args: { children: sections(2) },
    render: (args) => <Port {...args} scrollTo={0.5} />,
}

/** Disabled drops the pinning entirely and the sections simply follow on. */
export const Disabled: Story = {
    render: (args) => <Port {...args} disabled />,
}
