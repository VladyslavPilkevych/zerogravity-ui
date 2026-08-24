import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "storybook/test"

import type { MeadowItem } from "./art"
import { Meadow } from "./Meadow"

const hero = (
    <div
        style={{
            display: "grid",
            justifyItems: "center",
            gap: 20,
            maxWidth: 620,
            margin: "0 auto",
            textAlign: "center",
        }}
    >
        <span
            style={{
                padding: "7px 16px",
                borderRadius: 999,
                border: "1px solid var(--meadow-edge)",
                background: "var(--meadow-veil)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--meadow-ink-soft)",
            }}
        >
            Ages 4–10
        </span>
        <h2
            style={{
                margin: 0,
                fontSize: 54,
                lineHeight: 1.04,
                letterSpacing: "-0.035em",
                color: "var(--meadow-ink)",
            }}
        >
            A little world that grows with them
        </h2>
        <p
            style={{
                maxWidth: 460,
                margin: 0,
                fontSize: 17,
                lineHeight: 1.65,
                color: "var(--meadow-ink-soft)",
            }}
        >
            Ten warm minutes a day of stories, sounds and small puzzles — made with teachers, loved
            by families.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            <button
                type="button"
                style={{
                    padding: "14px 28px",
                    border: "none",
                    borderRadius: 999,
                    background: "var(--meadow-ink)",
                    color: "var(--meadow-sky-top)",
                    font: "inherit",
                    fontWeight: 650,
                    cursor: "pointer",
                }}
            >
                Start the journey
            </button>
            <button
                type="button"
                style={{
                    padding: "14px 26px",
                    border: "1.5px solid var(--meadow-edge)",
                    borderRadius: 999,
                    background: "var(--meadow-veil)",
                    color: "var(--meadow-ink)",
                    font: "inherit",
                    fontWeight: 600,
                    cursor: "pointer",
                }}
            >
                Watch a lesson
            </button>
        </div>
    </div>
)

const meta = {
    title: "Components/Meadow",
    component: Meadow,
    parameters: {
        surface: { padding: 0 },
        chromatic: { disableSnapshot: true },
    },
    args: { children: hero, seed: 5 },
} satisfies Meta<typeof Meadow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Calm: Story = {
    args: { density: "calm" },
}

export const Dense: Story = {
    args: { density: "lively" },
}

export const MinimalDecor: Story = {
    args: { density: "calm", scene: { clouds: false, sun: false, flowers: false } },
}

export const LandscapeOnly: Story = {
    args: {
        scene: {
            balloon: false,
            butterflies: false,
            birds: false,
            mascots: false,
            stars: false,
        },
    },
}

export const MascotsOnly: Story = {
    args: {
        density: "lively",
        scene: { balloon: false, butterflies: false, birds: false, stars: false },
    },
}

export const NoTrails: Story = {
    args: { density: "lively", trails: false },
}

export const ReducedMotion: Story = {
    args: { density: "lively", animated: false },
    parameters: { chromatic: { disableSnapshot: false } },
}

const CUSTOM_ITEMS: MeadowItem[] = [
    {
        content: (
            <svg viewBox="0 0 64 64" role="presentation" focusable="false">
                <circle cx="32" cy="32" r="20" fill="#f9c47e" />
                <ellipse
                    cx="32"
                    cy="32"
                    rx="30"
                    ry="9"
                    fill="none"
                    stroke="#e3b9c6"
                    strokeWidth="3.4"
                    transform="rotate(-20 32 32)"
                />
            </svg>
        ),
        motion: "float",
        x: 14,
        y: 28,
        size: 78,
        depth: 0.8,
    },
    {
        content: (
            <svg viewBox="0 0 64 52" role="presentation" focusable="false">
                <path
                    d="M32 6c14 0 24 8 24 19S46 46 32 46 8 36 8 25 18 6 32 6Z"
                    fill="#fdf3e3"
                    stroke="#eadfcd"
                    strokeWidth="2"
                />
                <circle cx="25" cy="24" r="3.4" fill="#6f625a" />
                <circle cx="39" cy="24" r="3.4" fill="#6f625a" />
                <path
                    d="M28 33c2 2 6 2 8 0"
                    stroke="#6f625a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        ),
        motion: "hover",
        x: 86,
        y: 52,
        size: 66,
        depth: 0.7,
    },
    {
        content: (
            <svg viewBox="0 0 48 48" role="presentation" focusable="false">
                <path d="M24 4 44 24 24 44 4 24Z" fill="#f4b39a" />
            </svg>
        ),
        motion: "twinkle",
        x: 92,
        y: 16,
        size: 28,
        depth: 0.4,
    },
]

export const Night: Story = {
    args: { theme: "night" },
}

export const NightDense: Story = {
    args: { theme: "night", density: "lively" },
}

export const NightCalm: Story = {
    args: { theme: "night", density: "calm" },
}

export const Sunrise: Story = {
    args: { theme: "sunrise" },
}

export const Sunset: Story = {
    args: { theme: "sunset" },
}

/**
 * Exercises the real timeAware path with a collapsed clock, so the scene it picks
 * is the same whatever the local hour is. The orb still rides its live arc, so
 * these two are render-only rather than snapshotted — the explicit Sunrise,
 * Sunset, Day and Night stories cover the visuals deterministically.
 */
export const TimeAware: Story = {
    args: {
        timeAware: true,
        clock: { sunriseStart: 0, dayStart: 24, sunsetStart: 24, nightStart: 24 },
    },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const TimeAwareNight: Story = {
    args: {
        timeAware: true,
        clock: { sunriseStart: 24, dayStart: 24, sunsetStart: 24, nightStart: 0 },
    },
    parameters: { chromatic: { disableSnapshot: true } },
}

export const Space: Story = {
    args: { theme: "space" },
}

export const SpaceDense: Story = {
    args: { theme: "space", density: "lively" },
}

export const SpaceCalm: Story = {
    args: { theme: "space", density: "calm" },
}

export const SpaceNoPlanets: Story = {
    args: { theme: "space", density: "lively", scene: { planets: false } },
}

export const SpaceNoUfos: Story = {
    args: { theme: "space", density: "lively", scene: { ufos: false } },
}

export const NightReducedMotion: Story = {
    args: { theme: "night", density: "lively", animated: false },
    parameters: { chromatic: { disableSnapshot: false } },
}

export const SpaceReducedMotion: Story = {
    args: { theme: "space", density: "lively", animated: false },
    parameters: { chromatic: { disableSnapshot: false } },
}

export const CustomItems: Story = {
    args: { items: CUSTOM_ITEMS, density: "lively" },
}

export const PointerSafety: Story = {
    args: { density: "lively" },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const cta = canvas.getByRole("button", { name: "Start the journey" })
        const box = cta.getBoundingClientRect()

        const onCta = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
        await expect(cta.contains(onCta as Node)).toBe(true)

        const scene = canvasElement.querySelector(".xp-meadow") as HTMLElement
        const area = scene.getBoundingClientRect()
        const corner = document.elementFromPoint(area.left + 10, area.top + 10)
        await expect(corner?.closest(".xp-meadow-layer")).toBeNull()

        for (const layer of canvasElement.querySelectorAll(".xp-meadow-layer")) {
            await expect(layer.getAttribute("aria-hidden")).toBe("true")
        }
    },
}

export const GlideDirection: Story = {
    args: { theme: "space", density: "lively" },
    play: async ({ canvasElement }) => {
        const lane = (flipped: boolean) =>
            canvasElement.querySelector<HTMLElement>(
                `.xp-meadow-object[data-motion="glide"]${flipped ? '[data-flip="true"]' : ":not([data-flip])"}`,
            )

        for (const flipped of [false, true]) {
            const object = lane(flipped)
            await expect(object).not.toBeNull()

            const track = object!.querySelector<HTMLElement>(".xp-meadow-track")!
            const body = object!.querySelector<HTMLElement>(".xp-meadow-body")!
            const run = track.getAnimations()[0]
            await expect(run).toBeTruthy()

            const timing = run.effect?.getTiming()
            const span = Number(timing?.duration ?? 0)
            // currentTime counts from the delay, which is negative here to spread the cast out
            const origin = Number(timing?.delay ?? 0)

            await expect(getComputedStyle(object!).scale).toBe(flipped ? "-1 1" : "none")
            await expect(getComputedStyle(body).scale).toBe("none")
            run.pause()

            run.currentTime = origin + span * 0.1
            const from = body.getBoundingClientRect().left
            run.currentTime = origin + span * 0.45
            const to = body.getBoundingClientRect().left

            if (flipped) await expect(to).toBeLessThan(from)
            else await expect(to).toBeGreaterThan(from)

            run.play()
        }
    },
}

export const Containment: Story = {
    args: { density: "lively" },
    play: async ({ canvasElement }) => {
        const scene = canvasElement.querySelector(".xp-meadow") as HTMLElement
        const area = scene.getBoundingClientRect()

        for (const layer of canvasElement.querySelectorAll(".xp-meadow-layer")) {
            const box = layer.getBoundingClientRect()
            await expect(box.left).toBeGreaterThanOrEqual(area.left - 0.5)
            await expect(box.right).toBeLessThanOrEqual(area.right + 0.5)
            await expect(box.top).toBeGreaterThanOrEqual(area.top - 0.5)
            await expect(box.bottom).toBeLessThanOrEqual(area.bottom + 0.5)
        }

        const page = document.documentElement
        await expect(page.scrollWidth).toBeLessThanOrEqual(page.clientWidth)
        await expect(document.body.scrollWidth).toBeLessThanOrEqual(page.clientWidth)
    },
}
