import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
    stories: ["../src/lib/**/*.stories.@(ts|tsx)"],
    addons: ["@storybook/addon-a11y", "@storybook/addon-vitest"],
    framework: {
        name: "@storybook/react-vite",
        options: {},
    },
    core: {
        disableTelemetry: true,
    },
    typescript: {
        reactDocgen: "react-docgen-typescript",
    },
    // tsconfig.json uses jsx: "preserve" for Next, which makes esbuild fall back to the
    // classic runtime and emit React.createElement without importing React.
    viteFinal: (config) => ({
        ...config,
        esbuild: {
            ...(typeof config.esbuild === "object" ? config.esbuild : {}),
            jsx: "automatic" as const,
        },
    }),
}

export default config
