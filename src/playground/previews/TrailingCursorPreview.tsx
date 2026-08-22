"use client"

import { useRef, type CSSProperties } from "react"

import type { PointerFxPreset } from "@/lib/pointer-fx"
import { TrailingCursor } from "@/lib/trailing-cursor"
import type { PreviewApi } from "@/docs/useDocsConfig"

import type { TrailingCursorDemoConfig } from "../trailing-cursor/schema"
import { Hint } from "./parts"

export function TrailingCursorPreview({ config }: PreviewApi) {
    const c = config as unknown as TrailingCursorDemoConfig
    const scopeRef = useRef<HTMLDivElement>(null)

    return (
        <div className="pg-surface" ref={scopeRef}>
            <TrailingCursor
                container={scopeRef}
                preset={c.preset as PointerFxPreset}
                variant={c.variant}
                dotColor={c.dotColor || undefined}
                ringColor={c.ringColor || undefined}
                ringBorderColor={c.ringBorderColor || undefined}
                dotSize={c.dotSize}
                ringSize={c.ringSize}
                ringHoverSize={c.ringHoverSize}
                ringPressSize={c.ringPressSize}
                ease={c.ease}
                hideNativeCursor={c.hideNativeCursor}
                mixBlendMode={c.mixBlendMode as CSSProperties["mixBlendMode"]}
            />
            <Hint>Move cursor</Hint>
        </div>
    )
}
