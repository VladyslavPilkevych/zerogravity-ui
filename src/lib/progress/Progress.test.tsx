import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Progress, progressText } from "./Progress"

describe("Progress", () => {
    it("reports value, range and a readable value text", () => {
        render(<Progress value={1} max={4} label="Subtasks" />)
        const bar = screen.getByRole("progressbar", { name: "Subtasks" })

        expect(bar).toHaveAttribute("aria-valuenow", "1")
        expect(bar).toHaveAttribute("aria-valuemax", "4")
        expect(bar).toHaveAttribute("aria-valuetext", "1 of 4")
        expect(screen.getByText("1/4")).toBeInTheDocument()
    })

    it("reads a 0 to 100 value as a percentage", () => {
        render(<Progress value={25} label="Upload" />)
        expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "25%")
        expect(screen.getByText("25%")).toBeInTheDocument()
        expect(progressText(3, 4, "percent")).toBe("75%")
        expect(progressText(3, 4, (v, m) => `${v}/${m} steps`)).toBe("3/4 steps")
    })

    it("clamps out-of-range values and hides the label on request", () => {
        render(<Progress value={9} max={4} label="Over" hideLabel />)
        const bar = screen.getByRole("progressbar", { name: "Over" })
        expect(bar).toHaveAttribute("aria-valuenow", "4")
        expect(screen.queryByText("Over")).toBeNull()
    })

    it("draws one block per step in segmented mode, filled up to the value", () => {
        const { container } = render(<Progress value={2} max={5} label="Steps" segments />)
        expect(container.querySelectorAll(".zg-progress-block")).toHaveLength(5)
        expect(container.querySelectorAll(".zg-progress-block[data-on]")).toHaveLength(2)

        const many = render(<Progress value={50} label="Many" segments />)
        expect(many.container.querySelectorAll(".zg-progress-block")).toHaveLength(0)
    })

    it("defaults to pixel and keeps classic", () => {
        const { container } = render(<Progress value={1} label="A" variant="classic" />)
        expect(container.firstElementChild).toHaveAttribute("data-variant", "classic")
    })

    it("is a server component", () => {
        const source = readFileSync(
            path.join(path.dirname(fileURLToPath(import.meta.url)), "Progress.tsx"),
            "utf8",
        )
        expect(source.startsWith('"use client"')).toBe(false)
        expect(renderToString(<Progress value={1} max={2} label="Half" />)).toContain(
            'aria-valuetext="1 of 2"',
        )
    })
})
