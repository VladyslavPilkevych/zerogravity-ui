import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

import { installBrowserStubs, resetMediaState } from "./src/test/environment"

installBrowserStubs()

afterEach(() => {
    cleanup()
    resetMediaState()
    vi.restoreAllMocks()
})
