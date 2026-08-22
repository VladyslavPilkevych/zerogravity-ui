import { DOCS_ROUTES, expect, test } from "./fixtures"

for (const route of DOCS_ROUTES) {
    test(`docs page for ${route.slug} loads without browser errors`, async ({
        page,
        browserLog: guard,
    }) => {
        await page.goto(route.path)

        await expect(page.locator(".dz-header")).toBeVisible()
        await expect(page.locator(".dz-side")).toBeVisible()
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
        await expect(page.locator(".dz-preview")).toBeVisible()

        await page.waitForLoadState("networkidle")
        guard.assertClean()
    })
}

test("the home page leads into the docs", async ({ page, browserLog: guard }) => {
    await page.goto("/")

    await page.getByRole("link", { name: "Browse components" }).click()
    await expect(page).toHaveURL(/\/docs$/)
    await expect(page.getByRole("heading", { level: 1, name: "Components" })).toBeVisible()

    guard.assertClean()
})

test("the brand returns to the home page", async ({ page, browserLog: guard }) => {
    await page.goto("/docs/reel")

    await page.getByRole("link", { name: "ZeroGravity UI", exact: true }).click()
    await expect(page).toHaveURL(/\/$/)

    guard.assertClean()
})

test("the header links to the repository and never lists components", async ({ page }) => {
    await page.goto("/docs")

    const github = page.locator(".dz-header").getByRole("link", { name: /GitHub/i })
    await expect(github).toHaveAttribute(
        "href",
        "https://github.com/VladyslavPilkevych/zerogravity-ui",
    )
    await expect(github).toHaveAttribute("target", "_blank")

    await expect(page.locator(".dz-header").getByRole("link")).toHaveCount(3)
})

test("the sidebar navigates and marks the active component", async ({
    page,
    browserLog: guard,
}) => {
    await page.goto("/docs")

    const side = page.locator(".dz-side")
    await side.getByRole("link", { name: /^Reel/ }).click()

    await expect(page).toHaveURL(/\/docs\/reel$/)
    await expect(side.getByRole("link", { name: /^Reel/ })).toHaveAttribute("aria-current", "page")
    await expect(page.getByRole("heading", { level: 1, name: "Reel" })).toBeVisible()

    await side.getByRole("link", { name: /^Stencil/ }).click()
    await expect(page).toHaveURL(/\/docs\/stencil$/)
    await expect(side.getByRole("link", { name: /^Reel/ })).not.toHaveAttribute("aria-current")

    guard.assertClean()
})

test("every component stays reachable from the sidebar", async ({ page }) => {
    await page.goto("/docs")
    const side = page.locator(".dz-side")

    for (const route of DOCS_ROUTES) {
        await expect(side.locator(`a[href="${route.path}"]`)).toHaveCount(1)
    }

    const scrolls = await side
        .locator(".dz-side-scroll")
        .evaluate((node) => node.scrollHeight > node.clientHeight)
    expect(scrolls, "the component list should scroll inside the sidebar").toBe(true)
})

test("no docs page overflows horizontally", async ({ page }) => {
    for (const path of ["/", "/docs", "/docs/reel", "/docs/meadow", "/docs/ricochet"]) {
        await page.goto(path)
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, path).toBeLessThanOrEqual(0)
    }
})
