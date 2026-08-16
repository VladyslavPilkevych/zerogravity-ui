import type { Decorator, Preview } from "@storybook/react-vite"

import "./preview.css"

const withSurface: Decorator = (Story, context) => {
    const { surface } = context.parameters as { surface?: { padding?: number; height?: number } }

    return (
        <div
            className="sb-surface"
            style={{
                padding: surface?.padding ?? 32,
                minHeight: surface?.height ?? undefined,
            }}
        >
            <Story />
        </div>
    )
}

const preview: Preview = {
    decorators: [withSurface],
    parameters: {
        layout: "fullscreen",
        backgrounds: { disable: true },
        controls: { expanded: false },
        a11y: {
            test: "error",
        },
        chromatic: {
            viewports: [390, 1280],
            pauseAnimationAtEnd: true,
        },
    },
}

export default preview
