import js from "@eslint/js"
import reactHooks from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"

export default tseslint.config(
    {
        ignores: [".next/**", "node_modules/**", "out/**", "dist/**", "next-env.d.ts"],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    reactHooks.configs["recommended-latest"],
    {
        languageOptions: {
            globals: {
                window: "readonly",
                document: "readonly",
                navigator: "readonly",
                performance: "readonly",
                requestAnimationFrame: "readonly",
                cancelAnimationFrame: "readonly",
                ResizeObserver: "readonly",
                IntersectionObserver: "readonly",
                HTMLElement: "readonly",
                HTMLCanvasElement: "readonly",
                Element: "readonly",
                Event: "readonly",
                PointerEvent: "readonly",
                WheelEvent: "readonly",
                KeyboardEvent: "readonly",
                MediaQueryList: "readonly",
                CanvasRenderingContext2D: "readonly",
                GlobalCompositeOperation: "readonly",
                globalThis: "readonly",
                console: "readonly",
                process: "readonly",
                __dirname: "readonly",
            },
        },
        rules: {
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            "no-console": ["error", { allow: ["warn", "error"] }],
            "react-hooks/preserve-manual-memoization": "off",
        },
    },
    {
        files: ["src/lib/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: ["@/playground/*", "**/playground/*", "next", "next/*"],
                            message:
                                "src/lib is framework-independent: it must not import the playground or Next.js.",
                        },
                    ],
                },
            ],
        },
    },
)
