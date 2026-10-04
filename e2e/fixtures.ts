import { test as base, expect, type Page } from "@playwright/test"

import { COMPONENT_SLUGS } from "./routes.data"

export const DOCS_ROUTES = COMPONENT_SLUGS.map((slug) => ({
    slug,
    path: `/docs/${slug}`,
}))

const ALLOWED = [
    /Download the React DevTools/i,
    /\[Fast Refresh\]/i,
    /favicon\.ico/i,
    /was preloaded using link preload but not used/i,
    // GL driver performance notes from the headless GPU, not page output
    /GL Driver Message \(OpenGL, Performance/i,
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
