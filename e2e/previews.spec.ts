import { expect, test } from "./fixtures"

// the probe reads the canvas back repeatedly, which is what warns, so no console guard here
test("GridTrail lights the cell under the pointer", async ({ page }) => {
    await page.goto("/docs/grid-trail")
    const canvas = page.locator("canvas.grid-trail")
    await expect(canvas).toBeVisible()

    const cell = await page
        .locator(".pg-row", { hasText: "Cell size" })
        .locator("input[type=number]")
        .inputValue()
    const size = Number(cell)

    const box = (await canvas.boundingBox())!

    for (const [col, row] of [
        [1, 1],
        [6, 3],
    ]) {
        // park far away and let the trail fade before each probe
        await page.mouse.move(box.x + 4, box.y + 4)
        await page.waitForTimeout(900)

        const x = Math.round(box.x + (col + 0.5) * size)
        const y = Math.round(box.y + (row + 0.5) * size)
        await page.mouse.move(x, y)
        await page.waitForTimeout(60)

        const error = await page.evaluate(
            ([px, py]) => {
                const node = document.querySelector("canvas.grid-trail") as HTMLCanvasElement
                const rect = node.getBoundingClientRect()
                const scale = node.width / rect.width
                const data = node.getContext("2d")!.getImageData(0, 0, node.width, node.height).data

                let x0 = Infinity
                let y0 = Infinity
                let x1 = -1
                let y1 = -1
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] < 30) continue
                    const index = i / 4
                    const cx = index % node.width
                    const cy = Math.floor(index / node.width)
                    if (cx < x0) x0 = cx
                    if (cx > x1) x1 = cx
                    if (cy < y0) y0 = cy
                    if (cy > y1) y1 = cy
                }
                if (x1 < 0) return null

                return {
                    dx: (x0 + x1) / 2 / scale + rect.left - px,
                    dy: (y0 + y1) / 2 / scale + rect.top - py,
                }
            },
            [x, y],
        )

        expect(error, `no cell lit at ${col},${row}`).not.toBeNull()
        expect(Math.abs(error!.dx), `x drift at ${col},${row}`).toBeLessThan(2)
        expect(Math.abs(error!.dy), `y drift at ${col},${row}`).toBeLessThan(2)
    }
})

test("TrailingCursor hides the cursor only inside its own preview", async ({ page }) => {
    await page.goto("/docs/trailing-cursor")
    const surface = page.locator(".pg-surface")
    await expect(surface).toBeVisible()

    const box = (await surface.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(200)

    await expect(surface).toHaveCSS("cursor", "none")
    await expect(page.locator("body")).not.toHaveClass(/trailing-cursor-none/)

    const drift = await page.evaluate(
        ([px, py]) => {
            const dot = document.querySelector(".trailing-cursor-dot")!.getBoundingClientRect()
            return Math.hypot(dot.left + dot.width / 2 - px, dot.top + dot.height / 2 - py)
        },
        [box.x + box.width / 2, box.y + box.height / 2],
    )
    expect(drift).toBeLessThan(2)

    await page.mouse.move(60, 500)
    await page.waitForTimeout(250)

    await expect(page.locator(".dz-side")).not.toHaveCSS("cursor", "none")
    await expect(page.locator(".trailing-cursor")).toHaveAttribute("data-visible", "false")
})

for (const slug of ["scroll-stack", "aperture", "louvre"]) {
    test(`${slug} plays out inside its preview without moving the page`, async ({ page }) => {
        await page.goto(`/docs/${slug}`)
        const port = page.locator(".pg-port")
        await expect(port).toBeVisible()

        const reach = await port.evaluate((node) => node.scrollHeight - node.clientHeight)
        expect(reach, "the preview should be scrollable").toBeGreaterThan(200)

        await port.evaluate((node) => {
            node.scrollTop = node.scrollHeight
        })
        await page.waitForTimeout(500)

        expect(await page.evaluate(() => window.scrollY)).toBe(0)
        expect(await port.evaluate((node) => node.scrollTop)).toBeGreaterThan(0)
    })
}

test("ScrollStack reads as a deck rather than one full-bleed panel", async ({ page }) => {
    await page.goto("/docs/scroll-stack")
    const port = page.locator(".pg-port")
    await expect(port).toBeVisible()

    await port.evaluate((node) => {
        node.scrollTop = (node.scrollHeight - node.clientHeight) * 0.7
    })
    await page.waitForTimeout(600)

    const deck = await port.evaluate((node) => {
        const frame = node.getBoundingClientRect()
        const cards = [...node.querySelectorAll(".scroll-stack-card")].map((card) => {
            const box = card.getBoundingClientRect()
            return { top: Math.round(box.top - frame.top), height: Math.round(box.height) }
        })
        const showing = cards.filter((c) => c.top < frame.height && c.top + c.height > 0)
        return { frame: Math.round(frame.height), cards, showing }
    })

    // a card has to be well under the frame, or nothing else can be seen behind it
    for (const card of deck.cards) {
        expect(card.height, "cards are scaled down for the frame").toBeLessThan(deck.frame * 0.6)
    }

    // several at once, each parked a notch lower, is what makes it read as a deck
    expect(deck.showing.length, "more than one card in view").toBeGreaterThanOrEqual(3)
    const stuck = deck.showing.map((c) => c.top).slice(0, 3)
    expect(new Set(stuck).size, "stacked cards sit at different offsets").toBe(3)
})

for (const [slug, pane] of [
    ["aperture", ".aperture-sticky"],
    ["louvre", ".xp-louvre-viewport"],
] as const) {
    test(`${slug} sizes its sticky pane to the preview frame, not the viewport`, async ({
        page,
    }) => {
        await page.goto(`/docs/${slug}`)
        const port = page.locator(".pg-port")
        await expect(port).toBeVisible()

        const sizes = await port.evaluate((node, selector) => {
            const sticky = node.querySelector(selector) as HTMLElement
            return {
                frame: node.clientHeight,
                pane: Math.round(sticky.getBoundingClientRect().height),
            }
        }, pane)

        // a 100vh pane inside a short frame is the whole reason these demos read
        // as a crop of something bigger
        expect(sizes.pane).toBe(sizes.frame)
    })
}

test("Raster thumbnails drive the main view and the generated code", async ({ page }) => {
    await page.goto("/docs/raster")
    const code = page.locator(".dz-code code")
    const hero = page.locator(".xpg-raster-hero")

    await expect(code).toHaveText("<Raster />")

    await page.getByRole("button", { name: "Glass" }).click()
    await expect(hero).toHaveAttribute("data-mode", "glass")
    await expect(code).toContainText('mode="glass"')
    await expect(page.getByRole("button", { name: "Glass" })).toHaveAttribute(
        "aria-pressed",
        "true",
    )

    await page.getByRole("button", { name: "Original" }).click()
    await expect(hero).toHaveAttribute("data-mode", "off")
    await expect(code).toContainText("disabled")

    // the Customize select and the thumbnails share one value
    await page.getByRole("button", { name: "Glyph" }).click()
    await page.getByLabel("Mode", { exact: true }).selectOption("pixel")
    await expect(page.getByRole("button", { name: "Pixel" })).toHaveAttribute(
        "aria-pressed",
        "true",
    )
})

test("the SplitFlap board button actually changes the word", async ({ page }) => {
    await page.goto("/docs/split-flap")

    const value = page.getByLabel("Value")
    const before = await value.inputValue()

    await page.getByRole("button", { name: "Flip to the next word" }).click()

    await expect(value).not.toHaveValue(before)
    await expect(page.locator(".dz-code code")).toContainText("value=")
})

test("the SplitFlap CountUp preset counts", async ({ page }) => {
    await page.goto("/docs/split-flap")

    await page.getByRole("button", { name: "CountUp" }).click()
    await expect(page.getByLabel("Value")).toHaveValue("0000")

    await page.getByRole("button", { name: "Count up" }).click()
    await expect(page.getByLabel("Value")).toHaveValue("0001")
})

test("the Stencil Dock preset stays on one line", async ({ page }) => {
    await page.goto("/docs/stencil")
    await page.getByRole("button", { name: "Dock" }).click()
    await page.waitForTimeout(400)

    const lines = await page.evaluate(() => {
        const letters = [...document.querySelectorAll(".stencil-letter")]
        return new Set(letters.map((node) => Math.round(node.getBoundingClientRect().top))).size
    })

    expect(lines).toBe(1)
})

test("no preview leaves fake buttons behind", async ({ page }) => {
    for (const slug of ["facet", "wash", "vellum", "lodestone", "meadow"]) {
        await page.goto(`/docs/${slug}`)
        const buttons = await page.locator(".dz-preview button, .dz-preview a").allTextContents()

        // Lodestone's magnets are the demo; nothing else should offer a control
        const expected = slug === "lodestone" ? ["Button 1", "Button 2", "Button 3"] : []
        expect(buttons.map((text) => text.trim()).slice(0, 3), slug).toEqual(expected)
    }
})

test("Elemental keeps its edge attached at every radius", async ({ page, browserLog: guard }) => {
    await page.goto("/docs/elemental")
    const card = page.locator(".xpg-el-main")
    await expect(card).toBeVisible()

    for (const radius of [0, 24, 999]) {
        await page.getByLabel("Radius").last().fill(String(radius))
        await page.waitForTimeout(300)

        const shape = await card.evaluate((node) => {
            const edges = [...node.querySelectorAll(".xp-el-edge")] as SVGRectElement[]
            const halo = node.querySelector(".xp-el-halo") as SVGRectElement
            const art = node.querySelector(".xp-el-art") as SVGSVGElement
            const box = node.getBoundingClientRect()
            return {
                content: parseFloat(getComputedStyle(node).borderTopLeftRadius),
                corners: edges.map((edge) => Number(edge.getAttribute("rx"))),
                limit: Math.min(box.width, box.height) / 2,
                stroke: parseFloat(getComputedStyle(halo).strokeWidth),
                spills: getComputedStyle(art).overflow,
            }
        })

        // every stroke corners on the same clamped radius as the content
        const expected = Math.min(radius, shape.limit)
        expect(shape.corners.length, `radius ${radius}`).toBeGreaterThanOrEqual(4)
        for (const corner of shape.corners)
            expect(corner, `radius ${radius}`).toBeCloseTo(expected, 0)
        expect(shape.content, `radius ${radius}`).toBeCloseTo(expected, 0)

        // the strokes straddle that path, so the glow spills outside the box
        expect(shape.stroke, `radius ${radius}`).toBeGreaterThan(0)
        expect(shape.spills, `radius ${radius}`).toBe("visible")
    }

    guard.assertClean()
})

test("Elemental scopes its cursor to the wrapper", async ({ page }) => {
    await page.goto("/docs/elemental")
    await page.getByLabel("Cursor effect").check()

    const card = page.locator(".xpg-el-main")
    await card.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)

    const box = (await card.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(350)

    await expect(card).toHaveCSS("cursor", "none")
    await expect(page.locator(".xp-el-cursor").first()).toHaveAttribute("data-on", "true")

    await page.mouse.move(60, 300)
    await page.waitForTimeout(350)

    await expect(page.locator(".dz-side")).not.toHaveCSS("cursor", "none")
    await expect(page.locator("body")).toHaveCSS("cursor", "auto")
    await expect(page.locator(".xp-el-cursor").first()).toHaveAttribute("data-on", "false")
})

test("Elemental decoration never blocks the content", async ({ page }) => {
    await page.goto("/docs/elemental")
    const card = page.locator(".xpg-el-main")
    const box = (await card.boundingBox())!

    const hit = await page.evaluate(
        ([x, y]) => {
            const node = document.elementFromPoint(x, y)
            return {
                inContent: Boolean(node?.closest(".xp-el-content")),
                inDecoration: Boolean(node?.closest(".xp-el-fx, .xp-el-rim, .xp-el-bits")),
            }
        },
        [Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2)],
    )

    expect(hit.inContent).toBe(true)
    expect(hit.inDecoration).toBe(false)
})

test("Elemental switches variant from the comparison row", async ({ page }) => {
    await page.goto("/docs/elemental")
    const card = page.locator(".xpg-el-main")

    await page.getByRole("button", { name: "fire" }).click()
    await expect(card).toHaveAttribute("data-variant", "fire")
    await expect(page.locator(".dz-code code")).toContainText('variant="fire"')

    // electric is the default, so picking it drops the prop again
    await page.getByRole("button", { name: "electric" }).click()
    await expect(card).toHaveAttribute("data-variant", "electric")
    await expect(page.locator(".dz-code code")).not.toContainText("variant=")
})
