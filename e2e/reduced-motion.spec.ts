import { DOCS_ROUTES, expect, test } from "./fixtures"

test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
})

test("every docs page renders under prefers-reduced-motion", async ({
    page,
    browserLog: guard,
}) => {
    for (const route of DOCS_ROUTES) {
        await page.goto(route.path)
        await expect(page.locator(".dz-preview")).toBeVisible()
        await page.waitForLoadState("networkidle")
    }

    guard.assertClean()
})

test("pointer effects stay inert under reduced motion", async ({ page, browserLog: guard }) => {
    await page.goto("/docs/grid-trail")
    await expect(page.locator(".dz-preview")).toBeVisible()

    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(
        true,
    )

    await page.mouse.move(200, 200)
    await page.mouse.move(400, 300)
    await expect(page.locator("canvas.grid-trail")).toHaveCount(0)

    guard.assertClean()
})

test("Reel stays usable under reduced motion", async ({ page, browserLog: guard }) => {
    await page.goto("/docs/reel")

    const viewport = page.locator(".reel-viewport").first()
    await expect(viewport).toBeVisible()
    await viewport.focus()

    const activeText = async () =>
        (await page.locator('.reel-item[data-active="true"]').first().innerText()).trim()

    const before = await activeText()
    await page.keyboard.press("ArrowRight")
    await expect.poll(async () => activeText(), { timeout: 5000 }).not.toBe(before)

    guard.assertClean()
})
