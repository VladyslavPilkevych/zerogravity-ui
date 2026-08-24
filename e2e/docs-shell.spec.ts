import { expect, test } from "./fixtures"
import { COMPONENT_SLUGS } from "./routes.data"

test("search filters the sidebar as you type", async ({ page, browserLog: guard }) => {
    await page.goto("/docs")

    const side = page.locator(".dz-side")
    const search = side.getByLabel("Search components")

    await expect(side.getByRole("link")).toHaveCount(COMPONENT_SLUGS.length)

    await search.fill("carousel")
    await expect(side.getByRole("link", { name: /^Reel/ })).toBeVisible()
    await expect(side.getByRole("link")).toHaveCount(1)

    guard.assertClean()
})

test("search shows a friendly empty state", async ({ page }) => {
    await page.goto("/docs")

    await page.locator(".dz-side").getByLabel("Search components").fill("nothing at all")

    await expect(page.getByText("No components found")).toBeVisible()
})

test("the keyboard shortcut focuses and selects the search", async ({ page }) => {
    await page.goto("/docs")

    const search = page.locator(".dz-side").getByLabel("Search components")
    await search.fill("reel")
    await page.locator("h1").click()

    await page.keyboard.press("ControlOrMeta+k")

    await expect(search).toBeFocused()
    const selected = await search.evaluate(
        (node: HTMLInputElement) => node.selectionEnd! - node.selectionStart!,
    )
    expect(selected).toBe(4)
})

test("the shortcut hint reads as keyboard keys", async ({ page }) => {
    await page.goto("/docs")

    const hint = page.locator(".dz-side .dz-search-hint kbd")
    await expect(hint).toHaveCount(2)
    await expect(hint.nth(1)).toHaveText("K")
})

test("Escape clears the query and then leaves the field", async ({ page }) => {
    await page.goto("/docs")

    const search = page.locator(".dz-side").getByLabel("Search components")
    await search.fill("reel")
    await search.press("Escape")
    await expect(search).toHaveValue("")
    await expect(search).toBeFocused()

    await search.press("Escape")
    await expect(search).not.toBeFocused()
})

test("customizing a control rewrites the generated code", async ({ page, browserLog: guard }) => {
    await page.goto("/docs/raster")

    const code = page.locator(".dz-code code")
    await expect(code).toHaveText("<Raster />")

    await page.getByLabel("Mode", { exact: true }).selectOption("glyph")
    await expect(code).toContainText('mode="glyph"')

    await page.getByRole("button", { name: /^Reset/ }).click()
    await expect(code).toHaveText("<Raster />")

    guard.assertClean()
})

test("the copy button copies the current snippet", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.goto("/docs/raster")

    await page.getByLabel("Mode", { exact: true }).selectOption("blur")
    await page.getByRole("button", { name: "Copy" }).first().click()

    await expect(page.getByRole("button", { name: "Copied" }).first()).toBeVisible()

    const clipboard = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboard).toContain('mode="blur"')
})

test("the props table is visible and scrolls sideways when it has to", async ({ page }) => {
    await page.goto("/docs/raster")

    const table = page.getByRole("table")
    await expect(table).toBeVisible()
    await expect(table.getByRole("rowheader", { name: "pixelSize" })).toBeVisible()
    await expect(table.getByRole("columnheader", { name: "Default" })).toBeVisible()

    const wrap = page.locator(".dz-table-wrap")
    await expect(wrap).toHaveCSS("overflow-x", "auto")
})

test("dependencies are shown for every component", async ({ page }) => {
    await page.goto("/docs/reel")

    await expect(page.locator(".dz-deps")).toContainText("0")
    await expect(page.locator(".dz-deps")).toContainText("external runtime dependencies")
})

test("the preview and code tabs show the same snippet", async ({ page }) => {
    await page.goto("/docs/raster")

    await page.getByLabel("Mode", { exact: true }).selectOption("pixel")
    await page.getByRole("tab", { name: "Code" }).click()

    await expect(page.locator(".dz-preview")).toHaveCount(0)
    await expect(page.locator(".dz-code code")).toHaveCount(2)
})

test.describe("on a phone", () => {
    test.use({ viewport: { width: 390, height: 780 } })

    test("the component list opens in a drawer and navigates", async ({
        page,
        browserLog: guard,
    }) => {
        await page.goto("/docs/reel")

        await expect(page.locator(".dz-side")).toBeHidden()
        await page.getByRole("button", { name: "Components" }).click()

        const drawer = page.getByRole("dialog", { name: "Components" })
        await expect(drawer).toBeVisible()

        await drawer.getByLabel("Search components").fill("stencil")
        await drawer.getByRole("link", { name: /^Stencil/ }).click()

        await expect(page).toHaveURL(/\/docs\/stencil$/)
        await expect(page.getByRole("dialog")).toHaveCount(0)

        guard.assertClean()
    })

    test("the drawer closes on Escape and gives focus back", async ({ page }) => {
        await page.goto("/docs/reel")

        await page.getByRole("button", { name: "Components" }).click()
        await expect(page.getByRole("dialog")).toBeVisible()

        await page.keyboard.press("Escape")
        await expect(page.getByRole("dialog")).toHaveCount(0)
        await expect(page.getByRole("button", { name: "Components" })).toBeFocused()
    })

    test("nothing overflows sideways", async ({ page }) => {
        for (const path of ["/", "/docs", "/docs/reel", "/docs/raster"]) {
            await page.goto(path)
            const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
            )
            expect(overflow, path).toBeLessThanOrEqual(0)
        }
    })

    test("a long code line scrolls inside its block", async ({ page }) => {
        await page.goto("/docs/meadow")

        const pre = page.locator(".dz-code pre").first()
        await expect(pre).toHaveCSS("overflow-x", "auto")
    })
})
