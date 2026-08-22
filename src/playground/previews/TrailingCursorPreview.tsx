"use client"

import type { CSSProperties } from "react"

import type { PointerFxPreset } from "@/lib/pointer-fx"
import { TrailingCursor } from "@/lib/trailing-cursor"
import type { PreviewApi } from "@/docs/useDocsConfig"

import type { TrailingCursorDemoConfig } from "../trailing-cursor/schema"

export function TrailingCursorPreview({ config }: PreviewApi) {
    const c = config as unknown as TrailingCursorDemoConfig

    return (
        <div className="pg-fixed pg-cursor-root">
            <TrailingCursor
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

            <div className="pg-cursor-stage">
                <div className="pg-cursor-grid">
                    <button type="button" className="pg-cursor-card">
                        <strong>Interactive</strong>
                        <span>the ring grows here</span>
                    </button>

                    <div className="pg-cursor-card" data-cursor-label="Open">
                        <strong>data-cursor-label</strong>
                        <span>text inside the ring</span>
                    </div>

                    <div className="pg-cursor-card" data-cursor-scale="2">
                        <strong>data-cursor-scale</strong>
                        <span>ring doubles in size</span>
                    </div>

                    <div className="pg-cursor-card" data-cursor-color="#22d3ee">
                        <strong>data-cursor-color</strong>
                        <span>recoloured while hovering</span>
                    </div>

                    <div className="pg-cursor-card" data-cursor="hidden">
                        <strong>data-cursor=&quot;hidden&quot;</strong>
                        <span>both layers disappear</span>
                    </div>

                    <label className="pg-cursor-card">
                        <strong>A real input</strong>
                        <input type="text" placeholder="focus me with Tab" />
                    </label>
                </div>
            </div>
        </div>
    )
}
