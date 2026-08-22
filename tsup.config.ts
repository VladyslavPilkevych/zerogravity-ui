import { defineConfig } from "tsup"

export default defineConfig({
    entry: [
        "src/lib/**/*.ts",
        "src/lib/**/*.tsx",
        "src/lib/**/*.css",
        "!src/lib/**/*.test.*",
        "!src/lib/**/*.stories.*",
        "!src/lib/experimental/**",
    ],
    outDir: "dist",
    format: ["esm"],
    target: "es2022",
    bundle: false,
    dts: true,
    sourcemap: true,
    clean: true,
    tsconfig: "tsconfig.build.json",
    loader: { ".css": "copy" },
    external: ["react", "react-dom"],
    esbuildOptions(options) {
        options.jsx = "automatic"
    },
})
