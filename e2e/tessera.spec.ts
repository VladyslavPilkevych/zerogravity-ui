import { expect, test } from "./fixtures"

import type { Page } from "@playwright/test"

const HEADING = ".xpg-tessera-copy h2"

async function watchRouteSwap(page: Page) {
    await page.evaluate((selector) => {
        const target = document.querySelector(selector)
        if (!target) throw new Error(`missing heading for selector ${selector}`)

        delete document.body.dataset.swapPhase
        delete document.body.dataset.swapPlain

        const observer = new MutationObserver(() => {
            const overlay = document.querySelector(".xp-tessera")
            document.body.dataset.swapPhase = overlay?.getAttribute("data-phase") ?? "none"
            document.body.dataset.swapPlain = String(
                overlay?.classList.contains("xp-tessera-plain") ?? false,
            )
        })

        observer.observe(target, { childList: true, characterData: true, subtree: true })
    }, HEADING)
}

test("Tessera swaps the route only once its containing block is fully covered", async ({
    page,
    browserLog: guard,
}) => {
    await page.goto("/docs/tessera")

    const heading = page.locator(HEADING)
    const overlay = page.locator(".xp-tessera")

    await expect(heading).toHaveText("Home")
    await expect(overlay).toHaveCount(0)
    await watchRouteSwap(page)

    await page.locator('button[data-route="shop"]').click()

    await expect(overlay).toBeVisible()
    await expect(overlay.locator(".xp-tessera-tile")).toHaveCount(24)
    await expect(heading).toHaveText("Home")

    // the docs frame is transformed, so it becomes the containing block for the
    // fixed overlay; in an untransformed app that block is the viewport
    const coverage = await overlay.evaluate((node) => {
        const box = node.getBoundingClientRect()
        const host = node.closest(".dz-preview") ?? document.documentElement
        const frame = host.getBoundingClientRect()
        // a fixed child fills the padding box of its containing block
        const edge = parseFloat(getComputedStyle(host).borderLeftWidth) || 0
        const style = getComputedStyle(node)
        const centre = document.elementFromPoint(
            Math.round(frame.left + frame.width / 2),
            Math.round(frame.top + frame.height / 2),
        )

        return {
            position: style.position,
            inset: [style.top, style.right, style.bottom, style.left].join(" "),
            left: Math.round(box.left),
            top: Math.round(box.top),
            width: Math.round(box.width),
            height: Math.round(box.height),
            frameLeft: Math.round(frame.left + edge),
            frameTop: Math.round(frame.top + edge),
            frameWidth: Math.round(frame.width - edge * 2),
            frameHeight: Math.round(frame.height - edge * 2),
            capturesPointer: Boolean(centre?.closest(".xp-tessera")),
        }
    })

    expect(coverage.position).toBe("fixed")
    expect(coverage.inset).toBe("0px 0px 0px 0px")
    expect(coverage.left).toBe(coverage.frameLeft)
    expect(coverage.top).toBe(coverage.frameTop)
    expect(coverage.width).toBe(coverage.frameWidth)
    expect(coverage.height).toBe(coverage.frameHeight)
    expect(coverage.capturesPointer).toBe(true)

    await expect(heading).toHaveText("Shop")
    await expect(page.locator("body")).toHaveAttribute("data-swap-phase", "covered")
    await expect(page.locator("body")).toHaveAttribute("data-swap-plain", "false")

    await expect(overlay).toHaveCount(0)
    guard.assertClean()
})

test("Tessera leaves no overlay behind after repeated navigation", async ({
    page,
    browserLog: guard,
}) => {
    await page.goto("/docs/tessera")

    const heading = page.locator(HEADING)
    const overlay = page.locator(".xp-tessera")

    await expect(heading).toHaveText("Home")

    await page.locator('button[data-route="shop"]').click()
    await page.locator('button[data-route="collection"]').click()

    await expect(heading).toHaveText("Shop")
    await expect(overlay).toHaveCount(0)

    await page.locator('button[data-route="collection"]').click()
    await expect(heading).toHaveText("Collection")
    await expect(overlay).toHaveCount(0)

    const stuck = await page.evaluate(() => {
        const node = document.elementFromPoint(
            Math.floor(window.innerWidth / 2),
            Math.floor(window.innerHeight / 2),
        )
        return Boolean(node?.closest(".xp-tessera"))
    })
    expect(stuck).toBe(false)

    guard.assertClean()
})

test("Tessera still hides the route swap under reduced motion", async ({
    page,
    browserLog: guard,
}) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/docs/tessera")

    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(
        true,
    )

    const heading = page.locator(HEADING)
    const overlay = page.locator(".xp-tessera")

    await expect(heading).toHaveText("Home")
    await watchRouteSwap(page)

    await page.locator('button[data-route="shop"]').click()

    await expect(heading).toHaveText("Shop")
    await expect(page.locator("body")).toHaveAttribute("data-swap-phase", "covered")
    await expect(page.locator("body")).toHaveAttribute("data-swap-plain", "true")
    await expect(overlay).toHaveCount(0)

    guard.assertClean()
})
