import { expect, test } from "./fixtures"

test("the Meadow asset gallery shows the approved variants on a live palette", async ({
    page,
    browserLog: guard,
}) => {
    await page.goto("/docs/meadow-assets")

    const art = page.locator("svg[data-variant]")
    await expect(art).toHaveCount(13)

    for (const [group, count] of [
        ["ghost", 3],
        ["ufo", 3],
        ["moon", 2],
        ["sun", 5],
    ] as const) {
        await expect(page.locator(`svg[data-variant^="${group}-"]`)).toHaveCount(count)
    }

    await expect(page.locator('svg[data-variant^="plane-"]')).toHaveCount(0)

    const palette = await page.evaluate(() => {
        const set = document.querySelector(".xp-assets-set") as HTMLElement
        const read = (name: string) => getComputedStyle(set).getPropertyValue(name).trim()
        return {
            body: read("--meadow-body"),
            face: read("--meadow-face"),
            ink: read("--meadow-ink"),
            painted: getComputedStyle(
                document.querySelector('svg[data-variant="ghost-1"] path') as SVGElement,
            ).fill,
        }
    })

    expect(palette.body).not.toBe("")
    expect(palette.face).not.toBe("")
    expect(palette.ink).not.toBe("")
    expect(palette.painted).not.toBe("rgb(0, 0, 0)")

    guard.assertClean()
})

test("the gallery switches backdrops without overflowing the page", async ({
    page,
    browserLog: guard,
}) => {
    await page.goto("/docs/meadow-assets")

    for (const name of ["night", "space", "day"]) {
        await page.getByLabel("Backdrop").selectOption(name)
        await expect(page.getByLabel("Backdrop")).toHaveValue(name)

        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, name).toBeLessThanOrEqual(0)
    }

    guard.assertClean()
})
