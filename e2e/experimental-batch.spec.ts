import { expect, test } from "./fixtures"

/**
 * Representative checks across the newest batch: one per category, chosen for
 * things a unit test cannot see — real pointers, real layout, real scrolling.
 */

test("Contact scrubs from the keyboard alone", async ({ page, browserLog: guard }) => {
    await page.goto("/docs/contact")

    const slider = page.getByRole("slider").first()
    await expect(slider).toBeVisible()
    await expect(slider).toHaveAttribute("aria-valuenow", "1")

    await slider.focus()
    await page.keyboard.press("ArrowRight")
    await page.keyboard.press("ArrowRight")
    await expect(slider).toHaveAttribute("aria-valuenow", "3")

    await page.keyboard.press("End")
    await expect(slider).toHaveAttribute("aria-valuenow", "8")

    guard.assertClean()
})

test("Meniscus reports progress rather than just animating", async ({
    page,
    browserLog: guard,
}) => {
    await page.goto("/docs/meniscus")

    const bars = page.getByRole("progressbar")
    await expect(bars.first()).toBeVisible()

    // one determinate, one indeterminate, and both say which they are
    await expect(bars.first()).toHaveAttribute("aria-valuenow", /\d+/)
    await expect(bars.nth(1)).toHaveAttribute("aria-busy", "true")

    guard.assertClean()
})

test("a pointer effect stays inside its own frame", async ({ page, browserLog: guard }) => {
    await page.goto("/docs/chroma")

    const frame = page.locator(".dz-preview").first()
    await expect(frame).toBeVisible()
    const box = await frame.boundingBox()
    if (!box) throw new Error("the preview frame has no box")

    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5)
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5, { steps: 20 })

    // nothing global is touched, and nothing pushes the page sideways
    expect(await page.evaluate(() => document.body.style.cursor)).toBe("")
    expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true)

    guard.assertClean()
})

test("a scroll effect runs inside its own port, not the page", async ({
    page,
    browserLog: guard,
}) => {
    await page.goto("/docs/peel")

    const port = page.locator(".pg-port").first()
    await expect(port).toBeVisible()

    const before = await page.evaluate(() => window.scrollY)
    await port.evaluate((node) => {
        node.scrollTop = (node.scrollHeight - node.clientHeight) * 0.5
    })
    await page.waitForTimeout(200)

    const lift = await page
        .locator(".xp-peel-sheet")
        .first()
        .evaluate((node) => Number(getComputedStyle(node).getPropertyValue("--pe-lift")))

    expect(lift).toBeGreaterThan(0)
    expect(await page.evaluate(() => window.scrollY)).toBe(before)

    guard.assertClean()
})

test("the reduced-motion rail can still be reached from the keyboard", async ({
    page,
    browserLog: guard,
}) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/docs/gantry")

    const rail = page.getByRole("region", { name: "Horizontal gallery" })
    await expect(rail).toBeVisible()
    await expect(rail).toHaveAttribute("tabindex", "0")

    guard.assertClean()
})

test("Detent moves the selection with the real keyboard", async ({ page, browserLog: guard }) => {
    await page.goto("/docs/detent")

    const grid = page.getByRole("radio", { name: "Grid" })
    await expect(grid).toBeChecked()
    await grid.focus()
    await page.keyboard.press("ArrowRight")
    await expect(page.getByRole("radio", { name: "List" })).toBeChecked()
    await expect(page.locator(".xpg-detent-tiles")).toHaveAttribute("data-view", "list")

    guard.assertClean()
})

test("Tether draws as its own port scrolls", async ({ page, browserLog: guard }) => {
    await page.goto("/docs/tether")

    const line = page.locator(".zg-tether-line")
    await expect(page.locator(".zg-tether")).toHaveAttribute("data-measured", "")
    const undrawn = () =>
        line.evaluate(
            (node) =>
                parseFloat((node as SVGPathElement).style.strokeDashoffset) /
                parseFloat((node as SVGPathElement).style.strokeDasharray),
        )

    const before = await undrawn()
    await page.locator(".pg-port").evaluate((node) => {
        node.scrollTop = node.scrollHeight * 0.4
    })
    await expect.poll(undrawn).toBeLessThan(before - 0.2)

    guard.assertClean()
})

test("Folio opens panels without resizing them", async ({ page, browserLog: guard }) => {
    await page.goto("/docs/folio")

    await expect(page.locator(".zg-folio")).toHaveAttribute("data-layout", "rail")
    const panels = page.locator(".zg-folio-panel")
    const widths = () =>
        panels.evaluateAll((nodes) => nodes.map((node) => (node as HTMLElement).offsetWidth))

    await panels.nth(1).hover({ position: { x: 24, y: 120 } })
    await expect(panels.nth(1)).toHaveAttribute("data-open", "")
    const before = await widths()

    await panels.nth(3).hover({ position: { x: 24, y: 120 } })
    await expect(panels.nth(3)).toHaveAttribute("data-open", "")
    await expect(panels.nth(1)).not.toHaveAttribute("data-open")
    expect(await widths()).toEqual(before)

    guard.assertClean()
})

test("Sash pauses under the pointer", async ({ page, browserLog: guard }) => {
    await page.goto("/docs/sash")

    const band = page.locator(".zg-sash").first()
    await expect(band).toHaveAttribute("data-ready", "")
    const box = await band.boundingBox()
    if (!box) throw new Error("the band has no box")
    await page.mouse.move(box.x + 120, box.y + box.height / 2)

    await expect
        .poll(() =>
            band
                .locator(".zg-sash-track")
                .evaluate((node) => getComputedStyle(node).animationPlayState),
        )
        .toBe("paused")

    guard.assertClean()
})
