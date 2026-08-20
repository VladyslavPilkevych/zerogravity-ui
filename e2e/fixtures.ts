import { test as base, expect, type Page } from "@playwright/test"

export const ROUTES = [
    { path: "/", name: "Antigravity" },
    { path: "/aperture", name: "Aperture" },
    { path: "/grid-trail", name: "GridTrail" },
    { path: "/reel", name: "Reel" },
    { path: "/scroll-stack", name: "ScrollStack" },
    { path: "/split-flap", name: "SplitFlap" },
    { path: "/stencil", name: "Stencil" },
    { path: "/trailing-cursor", name: "TrailingCursor" },
] as const

export const EXPERIMENTAL_ROUTES = [
    { path: "/x/louvre", name: "Louvre" },
    { path: "/x/lodestone", name: "Lodestone" },
    { path: "/x/facet", name: "Facet" },
    { path: "/x/vellum", name: "Vellum" },
    { path: "/x/kern", name: "Kern" },
    { path: "/x/overprint", name: "Overprint" },
    { path: "/x/diorama", name: "Diorama" },
    { path: "/x/wash", name: "Wash" },
    { path: "/x/tessera", name: "Tessera" },
] as const

const ALLOWED = [
    /Download the React DevTools/i,
    /\[Fast Refresh\]/i,
    /favicon\.ico/i,
    /was preloaded using link preload but not used/i,
] as const

function isAllowed(message: string) {
    return ALLOWED.some((pattern) => pattern.test(message))
}

export interface ConsoleGuard {
    messages: string[]
    assertClean(): void
}

function watchConsole(page: Page): ConsoleGuard {
    const messages: string[] = []

    page.on("console", (message) => {
        if (message.type() !== "error" && message.type() !== "warning") return
        const text = message.text()
        if (isAllowed(text)) return
        messages.push(`console.${message.type()}: ${text}`)
    })

    page.on("pageerror", (error) => {
        messages.push(`pageerror: ${error.message}`)
    })

    page.on("requestfailed", (request) => {
        const failure = request.failure()?.errorText ?? "unknown"
        if (failure.includes("ERR_ABORTED")) return
        messages.push(`requestfailed: ${request.url()} (${failure})`)
    })

    return {
        messages,
        assertClean() {
            expect(messages, `unexpected browser output:\n${messages.join("\n")}`).toEqual([])
        },
    }
}

export const test = base.extend<{ browserLog: ConsoleGuard }>({
    browserLog: async ({ page }, use) => {
        const guard = watchConsole(page)
        await use(guard)
    },
})

export { expect }
