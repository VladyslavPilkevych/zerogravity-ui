"use client"

import { useEffect, useRef, useState } from "react"

import { Kern } from "@/lib"
import type { PreviewApi } from "@/docs/useDocsConfig"

export function KernPreview({ config }: PreviewApi) {
    const c = config as {
        text: string
        size: number
        radius: number
        spread: number
        lift: number
        weight: number
        ease: number
    }

    const stageRef = useRef<HTMLDivElement>(null)
    const [room, setRoom] = useState(0)

    useEffect(() => {
        const stage = stageRef.current
        if (!stage || typeof ResizeObserver !== "function") return
        const observer = new ResizeObserver(([entry]) => setRoom(entry.contentRect.width))
        observer.observe(stage)
        return () => observer.disconnect()
    }, [])

    const glyphs = Math.max(1, Array.from(c.text).length)
    const fit = room > 0 ? Math.floor(room / (glyphs * (0.72 + c.spread * 0.5))) : c.size
    const size = Math.max(24, Math.min(c.size, fit))

    return (
        <div className="xpg-kern">
            <div className="xpg-kern-stage" ref={stageRef}>
                <Kern
                    text={c.text}
                    size={size}
                    radius={c.radius}
                    spread={c.spread}
                    lift={c.lift}
                    weight={c.weight}
                    ease={c.ease}
                />
            </div>
            <span className="xpg-kern-hint" aria-hidden="true">
                Sweep the pointer across the letters
            </span>
        </div>
    )
}
