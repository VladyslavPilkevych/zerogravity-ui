import { createRef } from "react"
import { render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import { installFrameHarness } from "../../../test/frames"
import { Concertina, ConcertinaPanel } from "./Concertina"

let frames: ReturnType<typeof installFrameHarness>

beforeEach(() => {
    frames = installFrameHarness()
})

afterEach(() => {
    frames.restore()
})

function leaves() {
    return ["Fold", "Crease", "Score"].map((label) => (
        <ConcertinaPanel key={label}>{label}</ConcertinaPanel>
    ))
}

describe("Concertina", () => {
    it("keeps every leaf in document order", () => {
        const { container } = render(<Concertina>{leaves()}</Concertina>)
        const panels = [...container.querySelectorAll(".xp-concertina-leaf")]

        expect(panels.map((panel) => panel.textContent?.trim())).toEqual([
            "Fold",
            "Crease",
            "Score",
        ])
    })

    it("gives each leaf the same height", () => {
        const { container } = render(<Concertina height="400px">{leaves()}</Concertina>)

        for (const leaf of container.querySelectorAll<HTMLElement>(".xp-concertina-leaf")) {
            expect(leaf.style.height).toBe("400px")
        }
    })

    it("hides the fold shading from anything that reads the page", () => {
        const { container } = render(<Concertina>{leaves()}</Concertina>)

        for (const fold of container.querySelectorAll(".xp-concertina-fold")) {
            expect(fold).toHaveAttribute("aria-hidden", "true")
        }
    })

    it("listens to a container when it is driven by one, and lets go", () => {
        const host = document.createElement("div")
        document.body.append(host)
        const ref = createRef<HTMLElement>()
        Object.assign(ref, { current: host })

        const on = vi.spyOn(host, "addEventListener")
        const off = vi.spyOn(host, "removeEventListener")

        const { unmount } = render(
            <Concertina scrollContainer={ref as never}>{leaves()}</Concertina>,
        )

        expect(on.mock.calls.map(([name]) => name)).toContain("scroll")
        unmount()
        expect(off.mock.calls.map(([name]) => name)).toContain("scroll")
        host.remove()
    })

    it("lies flat under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Concertina>{leaves()}</Concertina>)

        expect((container.querySelector(".xp-concertina") as HTMLElement).dataset.still).toBe(
            "true",
        )
        for (const leaf of container.querySelectorAll<HTMLElement>(".xp-concertina-leaf")) {
            expect(leaf.style.transform).toBe("")
        }
    })
})
