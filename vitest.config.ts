import path from "node:path"
import { fileURLToPath } from "node:url"

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    esbuild: {
        jsx: "automatic",
    },
    resolve: {
        alias: {
            "@": path.resolve(dirname, "src"),
        },
    },
    test: {
        projects: [
            {
                extends: true,
                test: {
                    name: "unit",
                    environment: "jsdom",
                    globals: false,
                    setupFiles: ["./vitest.setup.ts"],
                    include: ["src/**/*.test.{ts,tsx}"],
                    css: false,
                },
            },
            {
                extends: true,
                plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })],
                test: {
                    name: "storybook",
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        instances: [{ browser: "chromium" }],
                    },
                },
            },
        ],
    },
})
