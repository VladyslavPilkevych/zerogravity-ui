import { expect, test } from "./fixtures"

test("Reel advances with the keyboard", async ({ page, browserLog: guard }) => {
    await page.goto("/reel")

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

test("Reel arrows move the selection", async ({ page, browserLog: guard }) => {
    await page.goto("/reel")

    const next = page.locator(".reel-arrow-next").first()
    await expect(next).toBeVisible()

    const dots = page.locator(".reel-dot")
    const activeDot = async () => {
        const classes = await dots.evaluateAll((nodes) =>
            nodes.map((node) => node.className.includes("reel-dot-active")),
        )
        return classes.indexOf(true)
    }

    const before = await activeDot()
    await next.click()
    await expect.poll(async () => activeDot(), { timeout: 5000 }).not.toBe(before)

    guard.assertClean()
})

test("ScrollStack reacts to scrolling", async ({ page, browserLog: guard }) => {
    await page.goto("/scroll-stack")

    const firstCard = page.locator(".scroll-stack-card").first()
    await expect(firstCard).toBeVisible()

    const transformBefore = await firstCard.evaluate((node) => getComputedStyle(node).transform)

    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.5))
    await page.waitForFunction(() => window.scrollY > 0)

    await expect
        .poll(async () => firstCard.evaluate((node) => getComputedStyle(node).transform), {
            timeout: 5000,
        })
        .not.toBe(transformBefore)

    guard.assertClean()
})

test("Stencil exposes the headline as a single accessible name", async ({
    page,
    browserLog: guard,
}) => {
    await page.goto("/stencil")

    const headline = page.getByRole("img").first()
    await expect(headline).toBeVisible()
    await expect(headline).toHaveAttribute("aria-label", /\S/)

    guard.assertClean()
})

test("Antigravity mounts a canvas sized to its container", async ({ page, browserLog: guard }) => {
    await page.goto("/")

    const canvas = page.locator("canvas").first()
    await expect(canvas).toBeAttached()
    await expect
        .poll(async () => canvas.evaluate((node: HTMLCanvasElement) => node.width), {
            timeout: 5000,
        })
        .toBeGreaterThan(0)

    guard.assertClean()
})
