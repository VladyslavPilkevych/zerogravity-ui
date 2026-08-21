import { act, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { renderToString } from "react-dom/server"

import { mediaState } from "../../../test/environment"
import { Meadow } from "./Meadow"
import { MEADOW_CLOCK, daypartForHour, hourOf, orbSpot } from "./plan"

/** Fixed instant so nothing here depends on the machine clock. */
function freeze(hour: number, minute = 0) {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 12, hour, minute, 0))
}

afterEach(() => {
    vi.useRealTimers()
    mediaState.reducedMotion = false
    mediaState.narrow = false
})

describe("daypartForHour", () => {
    it("maps the default windows", () => {
        expect(daypartForHour(0)).toBe("night")
        expect(daypartForHour(4.9)).toBe("night")
        expect(daypartForHour(5)).toBe("sunrise")
        expect(daypartForHour(7.9)).toBe("sunrise")
        expect(daypartForHour(8)).toBe("day")
        expect(daypartForHour(12)).toBe("day")
        expect(daypartForHour(17.9)).toBe("day")
        expect(daypartForHour(18)).toBe("sunset")
        expect(daypartForHour(20.9)).toBe("sunset")
        expect(daypartForHour(21)).toBe("night")
        expect(daypartForHour(23.9)).toBe("night")
    })

    it("puts each boundary in the later window", () => {
        const { sunriseStart, dayStart, sunsetStart, nightStart } = MEADOW_CLOCK

        expect(daypartForHour(sunriseStart)).toBe("sunrise")
        expect(daypartForHour(sunriseStart - 0.01)).toBe("night")
        expect(daypartForHour(dayStart)).toBe("day")
        expect(daypartForHour(dayStart - 0.01)).toBe("sunrise")
        expect(daypartForHour(sunsetStart)).toBe("sunset")
        expect(daypartForHour(sunsetStart - 0.01)).toBe("day")
        expect(daypartForHour(nightStart)).toBe("night")
        expect(daypartForHour(nightStart - 0.01)).toBe("sunset")
    })

    it("wraps hours outside the day", () => {
        expect(daypartForHour(24)).toBe("night")
        expect(daypartForHour(26)).toBe("night")
        expect(daypartForHour(-2)).toBe("night")
        expect(daypartForHour(-5)).toBe("sunset")
        expect(daypartForHour(-12)).toBe("day")
    })

    it("honours custom boundaries", () => {
        const clock = { sunriseStart: 3, dayStart: 6, sunsetStart: 15, nightStart: 19 }

        expect(daypartForHour(4, clock)).toBe("sunrise")
        expect(daypartForHour(10, clock)).toBe("day")
        expect(daypartForHour(16, clock)).toBe("sunset")
        expect(daypartForHour(20, clock)).toBe("night")
    })
})

describe("hourOf", () => {
    it("reads local hours with minutes as a fraction", () => {
        expect(hourOf(new Date(2026, 0, 1, 9, 30))).toBeCloseTo(9.5)
        expect(hourOf(new Date(2026, 0, 1, 0, 0))).toBe(0)
    })
})

describe("orbSpot", () => {
    it("keeps the sun low at each end of the day and high in the middle", () => {
        const dawn = orbSpot(MEADOW_CLOCK.sunriseStart)
        const noon = orbSpot((MEADOW_CLOCK.sunriseStart + MEADOW_CLOCK.nightStart) / 2)
        const dusk = orbSpot(MEADOW_CLOCK.nightStart - 0.01)

        expect(dawn.y).toBeGreaterThan(noon.y)
        expect(dusk.y).toBeGreaterThan(noon.y)
        expect(noon.y).toBeLessThan(12)
    })

    it("crosses the sky from one side to the other", () => {
        const dawn = orbSpot(MEADOW_CLOCK.sunriseStart)
        const midday = orbSpot(13)
        const dusk = orbSpot(MEADOW_CLOCK.nightStart - 0.01)

        expect(dawn.x).toBeLessThan(midday.x)
        expect(midday.x).toBeLessThan(dusk.x)
        expect(dawn.x).toBeGreaterThanOrEqual(8)
        expect(dusk.x).toBeLessThanOrEqual(92)
    })

    it("gives the moon its own arc across the night window", () => {
        const dusk = orbSpot(MEADOW_CLOCK.nightStart)
        const small = orbSpot(1)
        const dawn = orbSpot(MEADOW_CLOCK.sunriseStart - 0.01)

        expect(dusk.x).toBeLessThan(small.x)
        expect(small.x).toBeLessThan(dawn.x)
    })

    it("stays inside the frame at every hour", () => {
        for (let hour = 0; hour < 24; hour += 0.25) {
            const spot = orbSpot(hour)
            expect(spot.x).toBeGreaterThanOrEqual(8)
            expect(spot.x).toBeLessThanOrEqual(92)
            expect(spot.y).toBeGreaterThanOrEqual(8)
            expect(spot.y).toBeLessThanOrEqual(58)
        }
    })
})

function sceneOf(container: HTMLElement) {
    return container.querySelector(".xp-meadow")?.getAttribute("data-scene")
}

describe("timeAware", () => {
    it("renders the explicit theme on the server, whatever the clock says", () => {
        freeze(23, 30)

        const markup = renderToString(<Meadow timeAware>hero</Meadow>)

        expect(markup).toContain('data-scene="day"')
        expect(markup).not.toContain("xp-meadow-night")
        expect(markup).not.toContain("--orb-x")
    })

    it("produces byte-identical server markup with and without the prop", () => {
        freeze(23, 30)

        expect(renderToString(<Meadow timeAware>hero</Meadow>)).toBe(
            renderToString(<Meadow>hero</Meadow>),
        )
    })

    it("settles on the local scene once mounted", () => {
        freeze(19, 30)
        const { container } = render(<Meadow timeAware>hero</Meadow>)

        act(() => {
            vi.advanceTimersByTime(0)
        })

        expect(sceneOf(container)).toBe("sunset")
    })

    it("resolves each window from the clock", () => {
        for (const [hour, expected] of [
            [6, "sunrise"],
            [12, "day"],
            [19, "sunset"],
            [23, "night"],
        ] as const) {
            freeze(hour)
            const view = render(<Meadow timeAware>hero</Meadow>)
            act(() => {
                vi.advanceTimersByTime(0)
            })

            expect(sceneOf(view.container), `${hour}:00`).toBe(expected)
            view.unmount()
            vi.useRealTimers()
        }
    })

    it("leaves the explicit theme alone when switched off", () => {
        freeze(23)
        const { container } = render(<Meadow theme="day">hero</Meadow>)

        act(() => {
            vi.advanceTimersByTime(120_000)
        })

        expect(sceneOf(container)).toBe("day")
    })

    it("lets an explicit space theme win over the clock", () => {
        freeze(23)
        const { container } = render(
            <Meadow theme="space" timeAware>
                hero
            </Meadow>,
        )

        act(() => {
            vi.advanceTimersByTime(0)
        })

        expect(sceneOf(container)).toBe("space")
        expect(container.querySelector(".xp-meadow")?.className).toContain("xp-meadow-space")
    })

    it("overrides a non-space theme with the clock", () => {
        freeze(23)
        const { container } = render(
            <Meadow theme="day" timeAware>
                hero
            </Meadow>,
        )

        act(() => {
            vi.advanceTimersByTime(0)
        })

        expect(sceneOf(container)).toBe("night")
    })

    it("follows the clock across a boundary while the page stays open", () => {
        freeze(17, 59)
        const { container } = render(<Meadow timeAware>hero</Meadow>)

        act(() => {
            vi.advanceTimersByTime(0)
        })
        expect(sceneOf(container)).toBe("day")

        act(() => {
            vi.advanceTimersByTime(120_000)
        })
        expect(sceneOf(container)).toBe("sunset")
    })

    it("checks the clock once a minute rather than every second", () => {
        freeze(12)
        const interval = vi.spyOn(globalThis, "setInterval")

        render(<Meadow timeAware>hero</Meadow>)

        expect(interval).toHaveBeenCalledTimes(1)
        expect(interval.mock.calls[0][1]).toBe(60_000)
        interval.mockRestore()
    })

    it("starts no timer at all when it is switched off", () => {
        freeze(12)
        const interval = vi.spyOn(globalThis, "setInterval")

        render(<Meadow>hero</Meadow>)

        expect(interval).not.toHaveBeenCalled()
        interval.mockRestore()
    })

    it("clears its timer on unmount", () => {
        freeze(12)
        const clear = vi.spyOn(globalThis, "clearInterval")
        const { unmount } = render(<Meadow timeAware>hero</Meadow>)

        unmount()

        expect(clear).toHaveBeenCalled()
        clear.mockRestore()
    })

    it("stops watching the clock when the prop is turned off", () => {
        freeze(23)
        const { container, rerender } = render(<Meadow timeAware>hero</Meadow>)
        act(() => {
            vi.advanceTimersByTime(0)
        })
        expect(sceneOf(container)).toBe("night")

        rerender(<Meadow theme="sunrise">hero</Meadow>)
        act(() => {
            vi.advanceTimersByTime(0)
        })

        expect(sceneOf(container)).toBe("sunrise")
    })

    it("honours custom boundaries", () => {
        freeze(12)
        const { container } = render(
            <Meadow timeAware clock={{ sunriseStart: 0, dayStart: 24, sunsetStart: 24 }}>
                hero
            </Meadow>,
        )

        act(() => {
            vi.advanceTimersByTime(0)
        })

        expect(sceneOf(container)).toBe("sunrise")
    })
})

describe("the sun on its arc", () => {
    beforeEach(() => {
        freeze(9, 0)
    })

    it("writes the arc position onto the scene", () => {
        const { container } = render(<Meadow timeAware>hero</Meadow>)
        act(() => {
            vi.advanceTimersByTime(0)
        })

        const root = container.querySelector(".xp-meadow") as HTMLElement
        expect(root.className).toContain("xp-meadow-arc")
        expect(Number(root.style.getPropertyValue("--orb-x"))).toBeGreaterThan(0)
        expect(Number(root.style.getPropertyValue("--orb-y"))).toBeGreaterThan(0)
    })

    it("moves the sun as the hours pass", () => {
        const { container } = render(<Meadow timeAware>hero</Meadow>)
        act(() => {
            vi.advanceTimersByTime(0)
        })

        const root = container.querySelector(".xp-meadow") as HTMLElement
        const morning = root.style.getPropertyValue("--orb-x")

        act(() => {
            vi.advanceTimersByTime(4 * 60 * 60_000)
        })

        expect(root.style.getPropertyValue("--orb-x")).not.toBe(morning)
    })

    it("leaves day and night orbs in their fixed corner without a clock", () => {
        for (const theme of ["day", "night"] as const) {
            const view = render(<Meadow theme={theme}>hero</Meadow>)
            const root = view.container.querySelector(".xp-meadow") as HTMLElement

            expect(root.className, theme).not.toContain("xp-meadow-arc")
            expect(root.style.getPropertyValue("--orb-x")).toBe("")
            view.unmount()
        }
    })

    it("previews sunrise low on the left and sunset low on the right", () => {
        const dawn = render(<Meadow theme="sunrise">hero</Meadow>)
        const dawnRoot = dawn.container.querySelector(".xp-meadow") as HTMLElement
        const dawnX = Number(dawnRoot.style.getPropertyValue("--orb-x"))
        const dawnY = Number(dawnRoot.style.getPropertyValue("--orb-y"))
        dawn.unmount()

        const dusk = render(<Meadow theme="sunset">hero</Meadow>)
        const duskRoot = dusk.container.querySelector(".xp-meadow") as HTMLElement
        const duskX = Number(duskRoot.style.getPropertyValue("--orb-x"))

        expect(dawnRoot.className).toContain("xp-meadow-arc")
        expect(dawnX).toBeLessThan(50)
        expect(duskX).toBeGreaterThan(50)
        expect(dawnY).toBeGreaterThan(30)
    })
})

describe("the resolved night scene", () => {
    it("hides the sun, shows an approved moon, stars and shooting stars", () => {
        freeze(23)
        const { container } = render(
            <Meadow timeAware density="lively">
                hero
            </Meadow>,
        )
        act(() => {
            vi.advanceTimersByTime(0)
        })

        const orb = container.querySelector(".xp-meadow-orb [data-variant]")
        expect(orb?.getAttribute("data-variant")).toMatch(/^moon-(1|3)$/)
        expect(container.querySelectorAll(".xp-meadow-star").length).toBeGreaterThan(0)
        expect(container.querySelectorAll(".xp-meadow-comet")).toHaveLength(2)
        expect(container.querySelectorAll(".xp-meadow-halo").length).toBeGreaterThan(0)

        const kinds = Array.from(container.querySelectorAll(".xp-meadow-object")).map((node) =>
            node.getAttribute("data-kind"),
        )
        expect(kinds).not.toContain("bird")
        expect(kinds).not.toContain("butterfly")
    })

    it("shows an approved sun in daylight and keeps the landscape", () => {
        freeze(12)
        const { container } = render(<Meadow timeAware>hero</Meadow>)
        act(() => {
            vi.advanceTimersByTime(0)
        })

        const orb = container.querySelector(".xp-meadow-orb [data-variant]")
        expect(orb?.getAttribute("data-variant")).toMatch(/^sun-(1|3|4|5|6)$/)
        expect(container.querySelector(".xp-meadow-hills")).not.toBeNull()
        expect(container.querySelectorAll(".xp-meadow-plant").length).toBeGreaterThan(0)
        expect(container.querySelectorAll(".xp-meadow-star")).toHaveLength(0)
    })

    it("shares one warm palette between sunrise and sunset", () => {
        const dawn = render(<Meadow theme="sunrise">hero</Meadow>)
        const dawnClass = dawn.container.querySelector(".xp-meadow")!.className
        dawn.unmount()

        const dusk = render(<Meadow theme="sunset">hero</Meadow>)
        const duskClass = dusk.container.querySelector(".xp-meadow")!.className

        expect(dawnClass).toContain("xp-meadow-warm")
        expect(duskClass).toContain("xp-meadow-warm")
        expect(dawnClass).toContain("xp-meadow-dawn")
        expect(duskClass).toContain("xp-meadow-dusk")
        expect(dawnClass).not.toContain("xp-meadow-dusk")
    })

    it("still stills the scene under reduced motion", () => {
        freeze(19)
        mediaState.reducedMotion = true
        const { container } = render(<Meadow timeAware>hero</Meadow>)
        act(() => {
            vi.advanceTimersByTime(0)
        })

        const root = container.querySelector(".xp-meadow") as HTMLElement
        expect(root.className).toContain("xp-meadow-still")
        expect(root.getAttribute("data-scene")).toBe("sunset")
    })
})
