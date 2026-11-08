import type { Meta, StoryObj } from "@storybook/react-vite"
import { useRef } from "react"
import { expect, waitFor } from "storybook/test"

import { TrailingCursor } from "./TrailingCursor"

const meta = {
    title: "Components/TrailingCursor",
    component: TrailingCursor,
    parameters: { surface: { padding: 0 } },
    decorators: [
        (Story) => (
            <div style={{ position: "relative", width: "100%", height: 320 }}>
                <button type="button" data-cursor-label="Open" style={{ margin: 24 }}>
                    Interactive target
                </button>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof TrailingCursor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const RingOnly: Story = {
    args: { variant: "ring-only" },
}

export const DotOnly: Story = {
    args: { variant: "dot-only" },
}

export const CustomColors: Story = {
    args: { dotColor: "#ff6b8b", ringBorderColor: "#ff6b8b" },
}

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            expect(canvasElement.querySelector(".trailing-cursor")).toBeNull()
        })
    },
}

export const HiddenFromAssistiveTech: Story = {
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            const root = canvasElement.querySelector(".trailing-cursor")
            expect(root).not.toBeNull()
            expect(root).toHaveAttribute("aria-hidden", "true")
        })
    },
}

/** Scoped to one box: the page keeps its own cursor everywhere else. */
export const Scoped: Story = {
    render: (args) => {
        function Scene() {
            const box = useRef<HTMLDivElement>(null)

            return (
                <div style={{ display: "grid", gap: 16 }}>
                    <div
                        ref={box}
                        style={{
                            display: "grid",
                            placeItems: "center",
                            height: 260,
                            borderRadius: 14,
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: "rgba(255,255,255,0.03)",
                            color: "rgba(255,255,255,0.72)",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                        }}
                    >
                        <TrailingCursor {...args} container={box} />
                        Move cursor
                    </div>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.72)", fontSize: 13 }}>
                        Outside the box the normal cursor comes back.
                    </p>
                </div>
            )
        }

        return <Scene />
    },
    play: async ({ canvasElement }) => {
        const box = canvasElement.querySelector(".trailing-cursor")?.parentElement as HTMLElement

        await expect(box.classList.contains("trailing-cursor-none")).toBe(true)
        await expect(document.body.classList.contains("trailing-cursor-none")).toBe(false)
        await expect(canvasElement.querySelector(".trailing-cursor")).toHaveAttribute(
            "data-scoped",
            "true",
        )
    },
}

function pointer(type: string, x: number, y: number, target: EventTarget = window) {
    target.dispatchEvent(
        new PointerEvent(type, { clientX: x, clientY: y, pointerType: "mouse", bubbles: true }),
    )
}

function centreOf(element: Element) {
    const box = element.getBoundingClientRect()
    return { x: box.left + box.width / 2, y: box.top + box.height / 2, size: box.width }
}

/**
 * Size once the scale transition reaches its end. A throttled test frame can
 * hold a CSS transition at its start value; the scale it is heading for is
 * what the story checks.
 */
function settledSize(element: Element) {
    for (const animation of element.getAnimations()) {
        if (animation instanceof CSSTransition && animation.transitionProperty === "scale") {
            animation.finish()
        }
    }
    return centreOf(element).size
}

/** The dot trails the pointer instead of sitting on it. */
export const DotOnlyTrailing: Story = {
    args: { variant: "dot-only", dotEase: 0.15, dotSize: 12 },
    play: async ({ canvasElement }) => {
        const dot = canvasElement.querySelector(".trailing-cursor-dot") as HTMLElement

        pointer("pointermove", 100, 100)
        await waitFor(() => expect(centreOf(dot).x).toBeCloseTo(100, 0))

        pointer("pointermove", 400, 200)
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
        await expect(centreOf(dot).x).toBeLessThan(400)

        await waitFor(
            () => {
                expect(centreOf(dot).x).toBeCloseTo(400, 0)
                expect(centreOf(dot).y).toBeCloseTo(200, 0)
            },
            { timeout: 3000 },
        )
    },
}

/** Hover grows the dot, pressing shrinks it, and its centre never leaves the pointer. */
export const DotInteraction: Story = {
    args: { variant: "dot-only", dotSize: 10, dotHoverScale: 3, dotPressScale: 0.6 },
    decorators: [
        (Story) => (
            <div style={{ display: "flex", gap: 16, padding: 24 }}>
                <button type="button" data-testid="target">
                    Hover me
                </button>
                <a href="#dot-interaction">A link</a>
                <Story />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".trailing-cursor") as HTMLElement
        const dot = canvasElement.querySelector(".trailing-cursor-dot") as HTMLElement
        const button = canvasElement.querySelector("[data-testid='target']") as HTMLElement
        const box = button.getBoundingClientRect()
        const x = Math.round(box.left + box.width / 2)
        const y = Math.round(box.top + box.height / 2)

        pointer("pointermove", x, y)
        pointer("pointerover", x, y, button)
        await expect(root).toHaveAttribute("data-hovering", "true")
        await waitFor(() => expect(settledSize(dot)).toBeCloseTo(30, 0))
        await waitFor(() => expect(centreOf(dot).x).toBeCloseTo(x, 0))
        await waitFor(() => expect(centreOf(dot).y).toBeCloseTo(y, 0))

        pointer("pointerdown", x, y, button)
        await expect(root).toHaveAttribute("data-pressed", "true")
        await waitFor(() => expect(settledSize(dot)).toBeCloseTo(6, 0))
        await waitFor(() => expect(centreOf(dot).x).toBeCloseTo(x, 0))

        pointer("pointerup", x, y, button)
        await expect(root).toHaveAttribute("data-pressed", "false")
        await waitFor(() => expect(settledSize(dot)).toBeCloseTo(30, 0))
    },
}

/** Text fields keep the native text cursor; other controls keep the custom one. */
export const FormControls: Story = {
    args: { variant: "dot-only", dotHoverScale: 2 },
    decorators: [
        (Story) => (
            <form
                style={{ display: "grid", gap: 12, maxWidth: 320, padding: 24 }}
                onSubmit={(event) => event.preventDefault()}
            >
                <label>
                    Name <input data-testid="text" defaultValue="Ada" />
                </label>
                <label>
                    Notes <textarea data-testid="textarea" defaultValue="Select this text" />
                </label>
                <div
                    data-testid="editable"
                    role="textbox"
                    aria-label="Rich text"
                    contentEditable
                    suppressContentEditableWarning
                >
                    Editable region
                </div>
                <label>
                    <input data-testid="checkbox" type="checkbox" /> Subscribe
                </label>
                <label>
                    Plan
                    <select data-testid="select" defaultValue="pro">
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                    </select>
                </label>
                <button data-testid="button" type="submit">
                    Save
                </button>
                <Story />
            </form>
        ),
    ],
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".trailing-cursor") as HTMLElement
        const field = (id: string) =>
            canvasElement.querySelector(`[data-testid='${id}']`) as HTMLElement
        const cursor = (id: string) => getComputedStyle(field(id)).cursor

        await expect(document.body).toHaveClass("trailing-cursor-keep-text")
        for (const id of ["text", "textarea", "editable"]) await expect(cursor(id)).toBe("auto")
        for (const id of ["checkbox", "select", "button"]) await expect(cursor(id)).toBe("none")

        pointer("pointerover", 0, 0, field("text"))
        await expect(root).toHaveAttribute("data-hidden", "true")

        pointer("pointerover", 0, 0, field("button"))
        await expect(root).toHaveAttribute("data-hidden", "false")
        await expect(root).toHaveAttribute("data-hovering", "true")
    },
}

/** The previous behaviour, opted into: the custom cursor everywhere, text fields included. */
export const FormControlsWithoutTextCursor: Story = {
    ...FormControls,
    args: { variant: "dot-only", preserveTextCursor: false },
    play: async ({ canvasElement }) => {
        const root = canvasElement.querySelector(".trailing-cursor") as HTMLElement
        const text = canvasElement.querySelector("[data-testid='text']") as HTMLElement

        await expect(getComputedStyle(text).cursor).toBe("none")
        pointer("pointerover", 0, 0, text)
        await expect(root).toHaveAttribute("data-hidden", "false")
    },
}
