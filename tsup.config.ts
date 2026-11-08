import { defineConfig } from "tsup"

export default defineConfig({
    entry: [
        "src/lib/**/*.ts",
        "src/lib/**/*.tsx",
        "src/lib/**/*.css",
        "!src/lib/**/*.test.*",
        "!src/lib/**/*.stories.*",
        "!src/lib/experimental/**",
        // only the variant stories use it, and stories are not published
        "!src/lib/meadow/variants/gallery.css",
    ],
    outDir: "dist",
    format: ["esm"],
    target: "es2022",
    bundle: false,
    /*
     * Declarations come from `tsc` instead. tsup runs its dts pass in a worker
     * that flattens the whole type graph: it peaked at 2.1 GB here and died
     * outright on smaller machines with an error that named no file. `tsc`
     * emits the same surface from the same tsconfig in a fifth of the memory,
     * and when something is wrong it says which line.
     */
    dts: false,
    /*
     * No source maps. Output is one unminified file per source module with the
     * same names, so stack traces and devtools already read like the source,
     * while maps that embed their sources doubled the tarball (485 kB to 217
     * kB without them). Maps without sources would point at files we do not
     * ship, and leaving `.map` out of `files` would strand the
     * sourceMappingURL comments that make bundlers warn.
     */
    sourcemap: false,
    clean: true,
    tsconfig: "tsconfig.build.json",
    loader: { ".css": "copy" },
    external: ["react", "react-dom"],
    esbuildOptions(options) {
        options.jsx = "automatic"
    },
})
