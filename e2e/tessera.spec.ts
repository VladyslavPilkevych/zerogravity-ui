import { expect, test } from "./fixtures"

import type { Page } from "@playwright/test"

const HEADING = ".xpg-hero-copy h2"

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

test("Tessera swaps the route only while the viewport is fully covered", async ({
    page,
    browserLog: guard,
}) => {
    await page.goto("/x/tessera")

    const heading = page.locator(HEADING)
    const overlay = page.locator(".xp-tessera")

    await expect(heading).toHaveText("Studio Tessera")
    await expect(overlay).toHaveCount(0)
    await watchRouteSwap(page)

    await page.locator('button[data-route="shop"]').click()

    await expect(overlay).toBeVisible()
    await expect(overlay.locator(".xp-tessera-tile")).toHaveCount(24)
    await expect(heading).toHaveText("Studio Tessera")

    const capturesPointer = await page.evaluate(() => {
        const node = document.elementFromPoint(
            Math.floor(window.innerWidth / 2),
            Math.floor(window.innerHeight / 2),
        )
        return Boolean(node?.closest(".xp-tessera"))
    })
    expect(capturesPointer).toBe(true)

    const coverage = await overlay.evaluate((node) => {
        const box = node.getBoundingClientRect()
        return {
            left: Math.round(box.left),
            top: Math.round(box.top),
            width: Math.round(box.width),
            height: Math.round(box.height),
            viewportWidth: document.documentElement.clientWidth,
            viewportHeight: document.documentElement.clientHeight,
        }
    })
    expect(coverage.left).toBe(0)
    expect(coverage.top).toBe(0)
    expect(coverage.width).toBe(coverage.viewportWidth)
    expect(coverage.height).toBe(coverage.viewportHeight)

    await expect(heading).toHaveText("The Shop")
    await expect(page.locator("body")).toHaveAttribute("data-swap-phase", "covered")
    await expect(page.locator("body")).toHaveAttribute("data-swap-plain", "false")

    await expect(overlay).toHaveCount(0)
    guard.assertClean()
})

test("Tessera leaves no overlay behind after repeated navigation", async ({
    page,
    browserLog: guard,
}) => {
    await page.goto("/x/tessera")

    const heading = page.locator(HEADING)
    const overlay = page.locator(".xp-tessera")

    await expect(heading).toHaveText("Studio Tessera")

    await page.locator('button[data-route="shop"]').click()
    await page.locator('button[data-route="collection"]').click()

    await expect(heading).toHaveText("The Shop")
    await expect(overlay).toHaveCount(0)

    await page.locator('button[data-route="collection"]').click()
    await expect(heading).toHaveText("Spring Collection")
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
    await page.goto("/x/tessera")

    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(
        true,
    )

    const heading = page.locator(HEADING)
    const overlay = page.locator(".xp-tessera")

    await expect(heading).toHaveText("Studio Tessera")
    await watchRouteSwap(page)

    await page.locator('button[data-route="shop"]').click()

    await expect(heading).toHaveText("The Shop")
    await expect(page.locator("body")).toHaveAttribute("data-swap-phase", "covered")
    await expect(page.locator("body")).toHaveAttribute("data-swap-plain", "true")
    await expect(overlay).toHaveCount(0)

    guard.assertClean()
})
