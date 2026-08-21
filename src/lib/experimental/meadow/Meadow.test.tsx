import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { mediaState } from "../../../test/environment"
import type { MeadowItem } from "./art"
import { Meadow } from "./Meadow"
import type { MeadowScenePart } from "./plan"

afterEach(() => {
    mediaState.reducedMotion = false
    mediaState.narrow = false
})

const KIND_OF: Partial<Record<MeadowScenePart, string>> = {
    sun: "sun",
    clouds: "clouds",
    hills: "hills",
    flowers: "flowers",
    balloon: "balloon",
    butterflies: "butterfly",
    birds: "bird",
    mascots: "mascot",
    stars: "star",
}

const CUSTOM: MeadowItem[] = [
    { content: <span data-testid="kite">kite</span>, motion: "float", x: 10, y: 20, size: 40 },
    { content: <span data-testid="whale">whale</span>, motion: "bob", x: 90, y: 60, size: 50 },
]

function scene(container: HTMLElement) {
    return {
        root: container.querySelector(".xp-meadow") as HTMLElement,
        layers: container.querySelectorAll(".xp-meadow-layer"),
        objects: container.querySelectorAll(".xp-meadow-object"),
        clouds: container.querySelectorAll(".xp-meadow-cloud"),
        plants: container.querySelectorAll(".xp-meadow-plant"),
        flowers: container.querySelectorAll(
            ".xp-meadow-tint-pink, .xp-meadow-tint-coral, .xp-meadow-tint-cream",
        ),
        echoes: container.querySelectorAll(".xp-meadow-echo"),
        orb: container.querySelector(".xp-meadow-orb"),
        hills: container.querySelector(".xp-meadow-hills"),
    }
}

describe("Meadow", () => {
    it("renders arbitrary hero content", () => {
        const { getByRole, getByText } = render(
            <Meadow>
                <h1>A little world that grows with them</h1>
                <p>Ten warm minutes a day.</p>
                <button type="button">Start</button>
            </Meadow>,
        )

        expect(getByRole("heading", { name: "A little world that grows with them" })).toBeVisible()
        expect(getByText("Ten warm minutes a day.")).toBeVisible()
        expect(getByRole("button", { name: "Start" })).toBeVisible()
    })

    it("keeps the content in its own layer, not inside the scenery", () => {
        const { container } = render(
            <Meadow>
                <p>Body copy</p>
            </Meadow>,
        )

        const content = container.querySelector(".xp-meadow-content")
        expect(content?.textContent).toBe("Body copy")
        expect(container.querySelector(".xp-meadow-content .xp-meadow-object")).toBeNull()
        expect(container.querySelector(".xp-meadow-layer .xp-meadow-content")).toBeNull()
    })

    it("draws the full scene by default", () => {
        const { container } = render(<Meadow>hero</Meadow>)
        const parts = scene(container)

        expect(parts.orb).not.toBeNull()
        expect(parts.hills).not.toBeNull()
        expect(parts.clouds.length).toBeGreaterThan(2)
        expect(parts.plants.length).toBeGreaterThan(5)
        expect(parts.objects).toHaveLength(4)
    })

    it("hides every decorative layer from assistive technology", () => {
        const { container } = render(<Meadow>hero</Meadow>)
        const parts = scene(container)

        expect(parts.layers.length).toBeGreaterThan(2)
        for (const layer of parts.layers) {
            expect(layer.getAttribute("aria-hidden")).toBe("true")
        }
    })

    it("adds no focus targets and no interactive scenery", () => {
        const { container } = render(<Meadow>hero</Meadow>)

        expect(container.querySelectorAll("[tabindex], a, button, input")).toHaveLength(0)
        expect(container.querySelectorAll('svg[focusable="true"]')).toHaveLength(0)
        for (const svg of container.querySelectorAll("svg")) {
            expect(svg.getAttribute("focusable")).toBe("false")
        }
    })

    it("keeps the content interactive", async () => {
        const onClick = vi.fn()
        const { getByRole } = render(
            <Meadow>
                <button type="button" onClick={onClick}>
                    Start the journey
                </button>
            </Meadow>,
        )

        await userEvent.click(getByRole("button", { name: "Start the journey" }))
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("changes the size of the cast with the density", () => {
        const calm = render(<Meadow density="calm">hero</Meadow>)
        expect(scene(calm.container).objects).toHaveLength(2)
        calm.unmount()

        const cosy = render(<Meadow density="cosy">hero</Meadow>)
        expect(scene(cosy.container).objects).toHaveLength(4)
        cosy.unmount()

        const lively = render(<Meadow density="lively">hero</Meadow>)
        expect(scene(lively.container).objects).toHaveLength(7)
    })

    it("can drop each piece of scenery on its own", () => {
        const cases: Array<[MeadowScenePart, (parts: ReturnType<typeof scene>) => void]> = [
            ["sun", (parts) => expect(parts.orb).toBeNull()],
            ["clouds", (parts) => expect(parts.clouds).toHaveLength(0)],
            ["hills", (parts) => expect(parts.hills).toBeNull()],
            ["flowers", (parts) => expect(parts.flowers).toHaveLength(0)],
        ]

        for (const [part, check] of cases) {
            const view = render(<Meadow scene={{ [part]: false }}>hero</Meadow>)
            check(scene(view.container))
            view.unmount()
        }
    })

    it("keeps the rest of the scenery when one piece is dropped", () => {
        const { container } = render(<Meadow scene={{ sun: false }}>hero</Meadow>)
        const parts = scene(container)

        expect(parts.orb).toBeNull()
        expect(parts.clouds.length).toBeGreaterThan(2)
        expect(parts.hills).not.toBeNull()
        expect(parts.objects).toHaveLength(4)
    })

    it("drops a whole scenery layer when nothing in it is shown", () => {
        const bare = render(
            <Meadow scene={{ sun: false, clouds: false, hills: false, flowers: false }}>
                hero
            </Meadow>,
        )

        expect(bare.container.querySelector(".xp-meadow-far")).toBeNull()
        expect(bare.container.querySelector(".xp-meadow-land")).toBeNull()
        expect(bare.container.querySelector(".xp-meadow-fore")).toBeNull()
        expect(scene(bare.container).objects).toHaveLength(4)
    })

    it("can switch off each character group", () => {
        const groups: MeadowScenePart[] = ["balloon", "butterflies", "birds", "mascots", "stars"]

        for (const group of groups) {
            const view = render(
                <Meadow density="lively" scene={{ [group]: false }}>
                    hero
                </Meadow>,
            )
            const kinds = Array.from(view.container.querySelectorAll(".xp-meadow-object")).map(
                (node) => node.getAttribute("data-kind"),
            )

            expect(kinds).not.toContain(KIND_OF[group])
            expect(kinds.length).toBeGreaterThan(0)
            view.unmount()
        }
    })

    it("refills the stage from the remaining cast when a group is off", () => {
        const full = render(<Meadow density="lively">hero</Meadow>)
        const size = scene(full.container).objects.length
        full.unmount()

        const trimmed = render(
            <Meadow density="lively" scene={{ stars: false }}>
                hero
            </Meadow>,
        )

        expect(scene(trimmed.container).objects).toHaveLength(size)
    })

    it("shows only what is left when a group leaves too few characters", () => {
        const { container } = render(
            <Meadow density="lively" scene={{ mascots: false }}>
                hero
            </Meadow>,
        )
        const kinds = Array.from(container.querySelectorAll(".xp-meadow-object")).map((node) =>
            node.getAttribute("data-kind"),
        )

        expect(kinds).not.toContain("mascot")
        expect(kinds.length).toBeGreaterThanOrEqual(5)
    })

    it("renders nothing decorative when every group is off", () => {
        const { container } = render(
            <Meadow
                scene={{
                    sun: false,
                    clouds: false,
                    hills: false,
                    flowers: false,
                    balloon: false,
                    butterflies: false,
                    birds: false,
                    mascots: false,
                    stars: false,
                }}
            >
                hero
            </Meadow>,
        )

        expect(container.querySelectorAll(".xp-meadow-layer")).toHaveLength(0)
        expect(container.querySelector(".xp-meadow-content")?.textContent).toBe("hero")
    })

    it("renders custom characters supplied by the consumer", () => {
        const { container, getByTestId } = render(
            <Meadow items={CUSTOM} density="cosy">
                hero
            </Meadow>,
        )

        expect(scene(container).objects).toHaveLength(2)
        expect(getByTestId("kite")).toBeInTheDocument()
        expect(getByTestId("whale")).toBeInTheDocument()
    })

    it("plans the same scene for the same seed", () => {
        const read = (container: HTMLElement) =>
            Array.from(container.querySelectorAll(".xp-meadow-object")).map((node) =>
                node.getAttribute("style"),
            )

        const first = render(<Meadow seed={21}>hero</Meadow>)
        const before = read(first.container)
        first.unmount()

        const same = render(<Meadow seed={21}>hero</Meadow>)
        const again = read(same.container)
        same.unmount()

        const other = render(<Meadow seed={22}>hero</Meadow>)

        expect(again).toEqual(before)
        expect(read(other.container)).not.toEqual(before)
    })

    it("stills the scene under reduced motion but keeps it whole", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Meadow density="lively">hero</Meadow>)
        const parts = scene(container)

        expect(parts.root.className).toContain("xp-meadow-still")
        expect(parts.objects).toHaveLength(7)
        expect(parts.orb).not.toBeNull()
        expect(parts.plants.length).toBeGreaterThan(5)
    })

    it("keeps moving when reduced motion is not respected", () => {
        mediaState.reducedMotion = true
        const { container } = render(<Meadow respectReducedMotion={false}>hero</Meadow>)

        expect(scene(container).root.className).not.toContain("xp-meadow-still")
    })

    it("stills the scene when animation is switched off", () => {
        const { container } = render(<Meadow animated={false}>hero</Meadow>)
        const parts = scene(container)

        expect(parts.root.className).toContain("xp-meadow-still")
        expect(parts.objects).toHaveLength(4)
    })

    it("thins the scene on narrow screens", () => {
        const wide = render(<Meadow density="lively">hero</Meadow>)
        const wideParts = scene(wide.container)
        const widePlants = wideParts.plants.length
        expect(wideParts.objects).toHaveLength(7)
        expect(wideParts.clouds).toHaveLength(4)
        wide.unmount()

        mediaState.narrow = true
        const { container } = render(<Meadow density="lively">hero</Meadow>)
        const narrow = scene(container)

        expect(narrow.objects).toHaveLength(3)
        expect(narrow.clouds).toHaveLength(3)
        expect(narrow.plants.length).toBeLessThan(widePlants)
    })

    it("gives every mascot a short soft trail and nothing else", () => {
        const { container } = render(<Meadow density="lively">hero</Meadow>)
        const mascots = container.querySelectorAll('.xp-meadow-object[data-kind="mascot"]')

        expect(mascots.length).toBeGreaterThan(0)
        for (const mascot of mascots) {
            expect(mascot.querySelectorAll(".xp-meadow-echo")).toHaveLength(2)
        }
        for (const other of container.querySelectorAll(
            '.xp-meadow-object:not([data-kind="mascot"])',
        )) {
            expect(other.querySelectorAll(".xp-meadow-echo")).toHaveLength(0)
        }
    })

    it("fades each trail step further back", () => {
        const { container } = render(<Meadow density="lively">hero</Meadow>)
        const mascot = container.querySelector(
            '.xp-meadow-object[data-kind="mascot"]',
        ) as HTMLElement
        const echoes = Array.from(mascot.querySelectorAll<HTMLElement>(".xp-meadow-echo"))

        const fade = echoes.map((echo) => Number(echo.style.getPropertyValue("--m-fade")))
        const lag = echoes.map((echo) => Number(echo.style.getPropertyValue("--m-lag")))

        expect(fade[0]).toBeGreaterThan(fade[1])
        expect(lag[0]).toBeLessThan(lag[1])
        for (const value of fade) expect(value).toBeLessThan(0.5)
    })

    it("keeps the trail on the same route as the character it follows", () => {
        const { container } = render(<Meadow density="lively">hero</Meadow>)

        for (const mascot of container.querySelectorAll(".xp-meadow-object[data-kind='mascot']")) {
            const motion = mascot.getAttribute("data-motion")
            for (const echo of mascot.querySelectorAll(".xp-meadow-echo")) {
                expect(echo.getAttribute("data-motion")).toBe(motion)
            }
        }
    })

    it("can switch the trails off without touching the characters", () => {
        const { container } = render(
            <Meadow density="lively" trails={false}>
                hero
            </Meadow>,
        )

        expect(container.querySelectorAll(".xp-meadow-echo")).toHaveLength(0)
        expect(scene(container).objects).toHaveLength(7)
    })

    it("adds a fixed number of trail nodes rather than growing over time", () => {
        const { container, rerender } = render(<Meadow density="lively">hero</Meadow>)
        const before = container.querySelectorAll(".xp-meadow-echo").length

        rerender(<Meadow density="lively">hero</Meadow>)
        rerender(<Meadow density="lively">hero</Meadow>)

        expect(container.querySelectorAll(".xp-meadow-echo").length).toBe(before)
    })

    it("moves the drift animation off the clipping layer so nothing escapes", () => {
        const { container } = render(<Meadow>hero</Meadow>)

        for (const layer of container.querySelectorAll(".xp-meadow-layer")) {
            if (layer.classList.contains("xp-meadow-air")) continue
            expect(layer.querySelector(":scope > .xp-meadow-drift")).not.toBeNull()
        }
    })

    it("keeps the daytime scene untouched by default", () => {
        const { container } = render(<Meadow>hero</Meadow>)

        expect(container.querySelector(".xp-meadow")?.className).not.toContain("xp-meadow-night")
        expect(container.querySelectorAll(".xp-meadow-star")).toHaveLength(0)
        expect(container.querySelectorAll(".xp-meadow-comet")).toHaveLength(0)
        expect(container.querySelectorAll(".xp-meadow-halo")).toHaveLength(0)
    })

    it("does not switch to night when the theme is day", () => {
        const { container } = render(<Meadow theme="day">hero</Meadow>)

        expect(container.querySelector(".xp-meadow")?.className).not.toContain("xp-meadow-night")
        expect(container.querySelectorAll(".xp-meadow-star")).toHaveLength(0)
    })

    it("swaps the sun for a moon at night", () => {
        const day = render(<Meadow>hero</Meadow>)
        const dayPaths = day.container.querySelector(".xp-meadow-orb")?.innerHTML ?? ""
        day.unmount()

        const { container } = render(<Meadow theme="night">hero</Meadow>)
        const nightPaths = container.querySelector(".xp-meadow-orb")?.innerHTML ?? ""

        expect(container.querySelector(".xp-meadow-orb")).not.toBeNull()
        expect(nightPaths).not.toBe(dayPaths)
        expect(nightPaths).not.toContain("xp-meadow-rays")
    })

    it("hangs a field of stars and a couple of shooting stars at night", () => {
        const { container } = render(<Meadow theme="night">hero</Meadow>)

        expect(container.querySelectorAll(".xp-meadow-star")).toHaveLength(18)
        expect(container.querySelectorAll(".xp-meadow-comet")).toHaveLength(2)
    })

    it("keeps the night sky clear of the hills", () => {
        const { container } = render(<Meadow theme="night">hero</Meadow>)

        for (const star of container.querySelectorAll<HTMLElement>(".xp-meadow-star")) {
            expect(Number(star.style.getPropertyValue("--m-y"))).toBeLessThan(60)
        }
    })

    it("sends the birds and butterflies home at night", () => {
        const { container } = render(
            <Meadow theme="night" density="lively">
                hero
            </Meadow>,
        )
        const kinds = Array.from(container.querySelectorAll(".xp-meadow-object")).map((node) =>
            node.getAttribute("data-kind"),
        )

        expect(kinds).not.toContain("bird")
        expect(kinds).not.toContain("butterfly")
        expect(kinds).toContain("mascot")
    })

    it("still lets a consumer ask for butterflies at night", () => {
        const { container } = render(
            <Meadow theme="night" density="lively" scene={{ butterflies: true }}>
                hero
            </Meadow>,
        )
        const kinds = Array.from(container.querySelectorAll(".xp-meadow-object")).map((node) =>
            node.getAttribute("data-kind"),
        )

        expect(kinds).toContain("butterfly")
    })

    it("gives every mascot a soft glow at night and none by day", () => {
        const night = render(
            <Meadow theme="night" density="lively">
                hero
            </Meadow>,
        )
        const mascots = night.container.querySelectorAll('.xp-meadow-object[data-kind="mascot"]')

        expect(mascots.length).toBeGreaterThan(0)
        for (const mascot of mascots) {
            expect(mascot.querySelectorAll(".xp-meadow-halo")).toHaveLength(1)
        }
        for (const other of night.container.querySelectorAll(
            '.xp-meadow-object:not([data-kind="mascot"])',
        )) {
            expect(other.querySelectorAll(".xp-meadow-halo")).toHaveLength(0)
        }
        night.unmount()

        const day = render(<Meadow density="lively">hero</Meadow>)
        expect(day.container.querySelectorAll(".xp-meadow-halo")).toHaveLength(0)
    })

    it("plans the same night sky for the same seed", () => {
        const read = (container: HTMLElement) =>
            Array.from(container.querySelectorAll(".xp-meadow-star")).map((node) =>
                node.getAttribute("style"),
            )

        const first = render(
            <Meadow theme="night" seed={9}>
                hero
            </Meadow>,
        )
        const before = read(first.container)
        first.unmount()

        const same = render(
            <Meadow theme="night" seed={9}>
                hero
            </Meadow>,
        )
        const again = read(same.container)
        same.unmount()

        const other = render(
            <Meadow theme="night" seed={10}>
                hero
            </Meadow>,
        )

        expect(again).toEqual(before)
        expect(read(other.container)).not.toEqual(before)
    })

    it("keeps the night composition but stops the sky moving under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(
            <Meadow theme="night" density="lively">
                hero
            </Meadow>,
        )
        const parts = scene(container)

        expect(parts.root.className).toContain("xp-meadow-night")
        expect(parts.root.className).toContain("xp-meadow-still")
        expect(container.querySelectorAll(".xp-meadow-star")).toHaveLength(18)
        expect(container.querySelectorAll(".xp-meadow-comet")).toHaveLength(2)
        expect(parts.orb).not.toBeNull()
        expect(container.querySelectorAll(".xp-meadow-halo").length).toBeGreaterThan(0)
    })

    it("thins the night sky on narrow screens", () => {
        mediaState.narrow = true
        const { container } = render(<Meadow theme="night">hero</Meadow>)

        expect(container.querySelectorAll(".xp-meadow-star")).toHaveLength(11)
        expect(container.querySelectorAll(".xp-meadow-comet")).toHaveLength(0)
        expect(scene(container).objects).toHaveLength(3)
    })

    it("drops the star field and the shooting stars independently", () => {
        const quiet = render(
            <Meadow theme="night" scene={{ stars: false }}>
                hero
            </Meadow>,
        )
        expect(quiet.container.querySelectorAll(".xp-meadow-star")).toHaveLength(0)
        expect(quiet.container.querySelectorAll(".xp-meadow-comet")).toHaveLength(2)
        expect(scene(quiet.container).orb).not.toBeNull()
        quiet.unmount()

        const still = render(
            <Meadow theme="night" scene={{ comets: false }}>
                hero
            </Meadow>,
        )
        expect(still.container.querySelectorAll(".xp-meadow-star")).toHaveLength(18)
        expect(still.container.querySelectorAll(".xp-meadow-comet")).toHaveLength(0)
    })

    it("builds a cosmic scene for the space theme", () => {
        const { container } = render(
            <Meadow theme="space" density="lively">
                hero
            </Meadow>,
        )
        const parts = scene(container)

        expect(parts.root.className).toContain("xp-meadow-space")
        expect(parts.orb).toBeNull()
        expect(parts.hills).toBeNull()
        expect(parts.clouds).toHaveLength(0)
        expect(parts.plants).toHaveLength(0)
        expect(container.querySelectorAll(".xp-meadow-planet")).toHaveLength(4)
        expect(container.querySelectorAll(".xp-meadow-star")).toHaveLength(30)
        expect(container.querySelectorAll(".xp-meadow-comet")).toHaveLength(2)
    })

    it("flies rockets in space and never butterflies or a sun", () => {
        const { container } = render(
            <Meadow theme="space" density="lively">
                hero
            </Meadow>,
        )
        const kinds = Array.from(container.querySelectorAll(".xp-meadow-object")).map((node) =>
            node.getAttribute("data-kind"),
        )

        expect(kinds).toContain("rocket")
        expect(kinds).toContain("mascot")
        expect(kinds).not.toContain("butterfly")
        expect(kinds).not.toContain("bird")
        expect(kinds).not.toContain("balloon")
    })

    it("never flies rockets or hangs planets by day or night", () => {
        for (const theme of ["day", "night"] as const) {
            const view = render(
                <Meadow theme={theme} density="lively">
                    hero
                </Meadow>,
            )
            const kinds = Array.from(view.container.querySelectorAll(".xp-meadow-object")).map(
                (node) => node.getAttribute("data-kind"),
            )

            expect(kinds).not.toContain("rocket")
            expect(view.container.querySelectorAll(".xp-meadow-planet")).toHaveLength(0)
            view.unmount()
        }
    })

    it("puts one orbit around one planet", () => {
        const { container } = render(<Meadow theme="space">hero</Meadow>)

        expect(container.querySelectorAll(".xp-meadow-orbit")).toHaveLength(1)
        expect(container.querySelectorAll(".xp-meadow-orbit-ring")).toHaveLength(1)
        expect(container.querySelectorAll(".xp-meadow-orbit-dot")).toHaveLength(1)
    })

    it("can drop the planets and the rockets on their own", () => {
        const noPlanets = render(
            <Meadow theme="space" density="lively" scene={{ planets: false }}>
                hero
            </Meadow>,
        )
        expect(noPlanets.container.querySelectorAll(".xp-meadow-planet")).toHaveLength(0)
        expect(
            Array.from(noPlanets.container.querySelectorAll(".xp-meadow-object")).map((n) =>
                n.getAttribute("data-kind"),
            ),
        ).toContain("rocket")
        noPlanets.unmount()

        const noRockets = render(
            <Meadow theme="space" density="lively" scene={{ rockets: false }}>
                hero
            </Meadow>,
        )
        expect(
            Array.from(noRockets.container.querySelectorAll(".xp-meadow-object")).map((n) =>
                n.getAttribute("data-kind"),
            ),
        ).not.toContain("rocket")
        expect(noRockets.container.querySelectorAll(".xp-meadow-planet")).toHaveLength(4)
    })

    it("ignores a sun asked for in space rather than drawing one", () => {
        const { container } = render(
            <Meadow theme="space" scene={{ sun: true }}>
                hero
            </Meadow>,
        )

        expect(scene(container).orb).toBeNull()
        expect(container.querySelector(".xp-meadow-far")).not.toBeNull()
    })

    it("has no butterflies to bring back in space, whatever the toggle says", () => {
        const { container } = render(
            <Meadow theme="space" density="lively" scene={{ butterflies: true }}>
                hero
            </Meadow>,
        )

        expect(
            Array.from(container.querySelectorAll(".xp-meadow-object")).map((n) =>
                n.getAttribute("data-kind"),
            ),
        ).not.toContain("butterfly")
    })

    it("glows the mascots in space and trails them too", () => {
        const { container } = render(
            <Meadow theme="space" density="lively">
                hero
            </Meadow>,
        )

        for (const mascot of container.querySelectorAll('.xp-meadow-object[data-kind="mascot"]')) {
            expect(mascot.querySelectorAll(".xp-meadow-halo")).toHaveLength(1)
            expect(mascot.querySelectorAll(".xp-meadow-echo")).toHaveLength(2)
        }
    })

    it("thins the cosmos on narrow screens", () => {
        mediaState.narrow = true
        const { container } = render(
            <Meadow theme="space" density="lively">
                hero
            </Meadow>,
        )

        expect(container.querySelectorAll(".xp-meadow-star")).toHaveLength(18)
        expect(container.querySelectorAll(".xp-meadow-comet")).toHaveLength(0)
        expect(container.querySelectorAll(".xp-meadow-planet")).toHaveLength(3)
        expect(scene(container).objects).toHaveLength(3)
    })

    it("keeps the space composition but stops it moving under reduced motion", () => {
        mediaState.reducedMotion = true
        const { container } = render(
            <Meadow theme="space" density="lively">
                hero
            </Meadow>,
        )
        const parts = scene(container)

        expect(parts.root.className).toContain("xp-meadow-space")
        expect(parts.root.className).toContain("xp-meadow-still")
        expect(container.querySelectorAll(".xp-meadow-planet")).toHaveLength(4)
        expect(container.querySelectorAll(".xp-meadow-star")).toHaveLength(30)
        expect(container.querySelectorAll(".xp-meadow-orbit")).toHaveLength(1)
    })

    it("plans the same cosmos for the same seed", () => {
        const read = (container: HTMLElement) =>
            Array.from(container.querySelectorAll(".xp-meadow-star")).map((node) =>
                node.getAttribute("style"),
            )

        const first = render(
            <Meadow theme="space" seed={4}>
                hero
            </Meadow>,
        )
        const before = read(first.container)
        first.unmount()

        const same = render(
            <Meadow theme="space" seed={4}>
                hero
            </Meadow>,
        )

        expect(read(same.container)).toEqual(before)
    })

    it("swaps the whole cast when the theme changes", () => {
        const day = render(<Meadow density="lively">hero</Meadow>)
        const dayKinds = Array.from(day.container.querySelectorAll(".xp-meadow-object")).map((n) =>
            n.getAttribute("data-kind"),
        )
        day.unmount()

        const space = render(
            <Meadow theme="space" density="lively">
                hero
            </Meadow>,
        )
        const spaceKinds = Array.from(space.container.querySelectorAll(".xp-meadow-object")).map(
            (n) => n.getAttribute("data-kind"),
        )

        expect(dayKinds).not.toEqual(spaceKinds)
        expect(dayKinds).toContain("balloon")
        expect(spaceKinds).toContain("rocket")
    })

    it("honours a custom cast in every theme", () => {
        for (const theme of ["day", "night", "space"] as const) {
            const view = render(
                <Meadow theme={theme} items={CUSTOM} density="cosy">
                    hero
                </Meadow>,
            )
            expect(view.container.querySelectorAll(".xp-meadow-object")).toHaveLength(2)
            view.unmount()
        }
    })

    it("sends ufos and a robot through space but never a balloon or a meadow", () => {
        const { container } = render(
            <Meadow theme="space" density="lively">
                hero
            </Meadow>,
        )
        const kinds = Array.from(container.querySelectorAll(".xp-meadow-object")).map((node) =>
            node.getAttribute("data-kind"),
        )

        expect(kinds).toContain("ufo")
        expect(kinds).toContain("mascot")
        expect(kinds).not.toContain("balloon")
        expect(container.querySelector(".xp-meadow-hills")).toBeNull()
        expect(container.querySelectorAll(".xp-meadow-plant")).toHaveLength(0)
    })

    it("refuses the meadow in space even when the scene asks for it", () => {
        const { container } = render(
            <Meadow
                theme="space"
                density="lively"
                scene={{ hills: true, flowers: true, sun: true, clouds: true, balloon: true }}
            >
                hero
            </Meadow>,
        )

        expect(container.querySelector(".xp-meadow-hills")).toBeNull()
        expect(container.querySelectorAll(".xp-meadow-plant")).toHaveLength(0)
        expect(container.querySelectorAll(".xp-meadow-cloud")).toHaveLength(0)
        expect(scene(container).orb).toBeNull()
        expect(container.querySelector(".xp-meadow-land")).toBeNull()
        expect(container.querySelector(".xp-meadow-fore")).toBeNull()
    })

    it("refuses planets, rockets and ufos outside space", () => {
        for (const theme of ["day", "night"] as const) {
            const view = render(
                <Meadow
                    theme={theme}
                    density="lively"
                    scene={{ planets: true, rockets: true, ufos: true }}
                >
                    hero
                </Meadow>,
            )

            expect(view.container.querySelectorAll(".xp-meadow-planet")).toHaveLength(0)
            const kinds = Array.from(view.container.querySelectorAll(".xp-meadow-object")).map(
                (node) => node.getAttribute("data-kind"),
            )
            expect(kinds).not.toContain("rocket")
            expect(kinds).not.toContain("ufo")
            view.unmount()
        }
    })

    it("can switch the ufos off on their own", () => {
        const { container } = render(
            <Meadow theme="space" density="lively" scene={{ ufos: false }}>
                hero
            </Meadow>,
        )
        const kinds = Array.from(container.querySelectorAll(".xp-meadow-object")).map((node) =>
            node.getAttribute("data-kind"),
        )

        expect(kinds).not.toContain("ufo")
        expect(kinds).toContain("rocket")
    })

    it("marks the black hole as the faint one so it stays in the background", () => {
        const { container } = render(<Meadow theme="space">hero</Meadow>)
        const faint = container.querySelectorAll('.xp-meadow-planet[data-faint="true"]')

        expect(faint).toHaveLength(1)
        expect(container.querySelectorAll(".xp-meadow-planet")).toHaveLength(4)
    })

    it("mirrors a gliding character's whole lane so it faces the way it travels", () => {
        const { container } = render(
            <Meadow theme="space" density="lively">
                hero
            </Meadow>,
        )
        const flipped = container.querySelectorAll(
            '.xp-meadow-object[data-motion="glide"][data-flip="true"]',
        )

        expect(flipped.length).toBeGreaterThan(0)
        for (const object of flipped) {
            expect(object.querySelector(".xp-meadow-body")).not.toBeNull()
        }
    })

    it("gives the balloon a passenger", () => {
        const { container } = render(<Meadow density="calm">hero</Meadow>)
        const balloon = container.querySelector('.xp-meadow-object[data-kind="balloon"] svg')

        expect(balloon).not.toBeNull()
        expect(balloon?.querySelectorAll("ellipse").length).toBeGreaterThanOrEqual(4)
    })

    it("does no scripted animation work", () => {
        const frame = vi.spyOn(globalThis, "requestAnimationFrame")
        const interval = vi.spyOn(globalThis, "setInterval")
        const timeout = vi.spyOn(globalThis, "setTimeout")

        const { unmount } = render(<Meadow density="lively">hero</Meadow>)

        expect(frame).not.toHaveBeenCalled()
        expect(interval).not.toHaveBeenCalled()
        expect(timeout).not.toHaveBeenCalled()

        unmount()
        vi.restoreAllMocks()
    })

    it("labels every character with a motion so the stylesheet can drive it", () => {
        const { container } = render(<Meadow density="lively">hero</Meadow>)

        for (const object of container.querySelectorAll(".xp-meadow-object")) {
            expect(object.getAttribute("data-motion")).toBeTruthy()
            expect(object.querySelector(".xp-meadow-track")).not.toBeNull()
            expect(object.querySelector(".xp-meadow-body")).not.toBeNull()
        }
    })
})
