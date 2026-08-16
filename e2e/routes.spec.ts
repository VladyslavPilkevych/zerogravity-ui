import { ROUTES, expect, test } from "./fixtures"

for (const route of ROUTES) {
    test(`${route.name} route loads without browser errors`, async ({
        page,
        browserLog: guard,
    }) => {
        await page.goto(route.path)
        await expect(page.locator("nav.pg-nav")).toBeVisible()
        await page.waitForLoadState("networkidle")
        guard.assertClean()
    })
}

test("every playground route is reachable from the navigation", async ({
    page,
    browserLog: guard,
}) => {
    await page.goto("/")

    for (const route of ROUTES.slice(1)) {
        const link = page.locator(`a[href="${route.path}"]`).first()
        await expect(link).toBeVisible()
    }

    guard.assertClean()
})

test("navigating between routes keeps the app mounted", async ({ page, browserLog: guard }) => {
    await page.goto("/")
    await page.locator('a[href="/reel"]').first().click()
    await expect(page).toHaveURL(/\/reel$/)
    await expect(page.locator(".reel").first()).toBeVisible()

    await page.locator('a[href="/split-flap"]').first().click()
    await expect(page).toHaveURL(/\/split-flap$/)
    await expect(page.locator(".split-flap").first()).toBeVisible()

    guard.assertClean()
})
