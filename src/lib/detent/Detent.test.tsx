import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { StrictMode, useState } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { Detent, type DetentOption } from "./Detent"

const PLANS: DetentOption<string>[] = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "lifetime", label: "Lifetime" },
]

function root(container: HTMLElement) {
    return container.querySelector(".zg-detent") as HTMLElement
}

describe("Detent", () => {
    it("is a named group of native radios", () => {
        render(<Detent label="Billing" options={PLANS} />)

        expect(screen.getByRole("radiogroup", { name: "Billing" })).toBeInTheDocument()
        const radios = screen.getAllByRole("radio")
        expect(radios).toHaveLength(3)
        for (const radio of radios) expect(radio.tagName).toBe("INPUT")
        expect(screen.getByRole("radio", { name: "Monthly" })).toBeChecked()
    })

    it("selects on click when uncontrolled and places the thumb by index", async () => {
        const user = userEvent.setup()
        const change = vi.fn()
        const { container } = render(<Detent label="Billing" options={PLANS} onChange={change} />)

        await user.click(screen.getByText("Lifetime"))

        expect(screen.getByRole("radio", { name: "Lifetime" })).toBeChecked()
        expect(change).toHaveBeenCalledWith("lifetime")
        expect(root(container).style.getPropertyValue("--zg-detent-index")).toBe("2")
        expect(root(container).style.getPropertyValue("--zg-detent-count")).toBe("3")
    })

    it("moves the selection with the arrow keys and skips disabled options", async () => {
        const user = userEvent.setup()
        const options = [
            { value: 1, label: "One" },
            { value: 2, label: "Two", disabled: true },
            { value: 3, label: "Three" },
        ]
        const change = vi.fn()
        render(<Detent label="Count" options={options} onChange={change} />)

        await user.tab()
        expect(screen.getByRole("radio", { name: "One" })).toHaveFocus()
        await user.keyboard("{ArrowRight}")

        expect(screen.getByRole("radio", { name: "Three" })).toBeChecked()
        expect(change).toHaveBeenLastCalledWith(3)
    })

    it("follows the value when controlled", async () => {
        const user = userEvent.setup()
        function Controlled() {
            const [plan, setPlan] = useState("yearly")
            return (
                <>
                    <Detent label="Billing" options={PLANS} value={plan} onChange={setPlan} />
                    <output>{plan}</output>
                </>
            )
        }
        render(<Controlled />)

        expect(screen.getByRole("radio", { name: "Yearly" })).toBeChecked()
        await user.click(screen.getByText("Monthly"))
        expect(screen.getByRole("radio", { name: "Monthly" })).toBeChecked()
        expect(screen.getByRole("status")).toHaveTextContent("monthly")
    })

    it("stays put when controlled without a handler that updates it", async () => {
        const user = userEvent.setup()
        render(<Detent label="Billing" options={PLANS} value="yearly" />)

        await user.click(screen.getByText("Monthly"))
        expect(screen.getByRole("radio", { name: "Yearly" })).toBeChecked()
    })

    it("submits its value with a form under the given name", async () => {
        const user = userEvent.setup()
        const { container } = render(
            <form>
                <Detent label="Billing" name="billing" options={PLANS} />
            </form>,
        )

        await user.click(screen.getByText("Yearly"))
        const data = new FormData(container.querySelector("form") as HTMLFormElement)
        expect(data.get("billing")).toBe("yearly")
    })

    it("selects nothing and hides the thumb for an unknown value", () => {
        const { container } = render(<Detent label="Billing" options={PLANS} value="weekly" />)

        for (const radio of screen.getAllByRole("radio")) expect(radio).not.toBeChecked()
        expect(root(container).dataset.empty).toBe("")
    })

    it("starts on the first enabled option and can disable the whole group", () => {
        render(
            <Detent
                label="Billing"
                options={[{ value: "a", label: "A", disabled: true }, ...PLANS]}
                disabled
            />,
        )

        expect(screen.getByRole("radio", { name: "Monthly" })).toBeChecked()
        for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled()
    })

    it("gives two groups on one page separate names", () => {
        render(
            <StrictMode>
                <Detent label="First" options={PLANS} />
                <Detent label="Second" options={PLANS} />
            </StrictMode>,
        )
        const names = new Set(
            screen.getAllByRole("radio").map((radio) => (radio as HTMLInputElement).name),
        )
        expect(names.size).toBe(2)
    })

    it("server-renders the checked option and the thumb position", () => {
        const html = renderToString(
            <Detent label="Billing" options={PLANS} defaultValue="yearly" />,
        )

        expect(html).toContain("--zg-detent-index:1")
        expect(html).toMatch(/value="yearly"[^>]*checked|checked[^>]*value="yearly"/)
    })

    it("defaults to the pixel style, keeps classic, and stays native radios in both", () => {
        const pixel = render(<Detent label="Pixel" options={PLANS} />)
        expect(root(pixel.container).dataset.variant).toBe("pixel")
        pixel.unmount()

        const classic = render(<Detent label="Classic" options={PLANS} variant="classic" />)
        expect(root(classic.container).dataset.variant).toBe("classic")
        expect(screen.getAllByRole("radio")).toHaveLength(3)
    })
})
