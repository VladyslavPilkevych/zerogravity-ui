"use client"

import type { ReactNode } from "react"

import "./experimental.css"

interface StageProps {
    title: string
    blurb: string
    children: ReactNode
    scroll?: boolean
}

export function Stage({ title, blurb, children, scroll = false }: StageProps) {
    return (
        <div className={scroll ? "xpg-root xpg-scroll" : "xpg-root"}>
            <header className="xpg-head">
                <h1>{title}</h1>
                <p>{blurb}</p>
            </header>
            <div className="xpg-stage">{children}</div>
        </div>
    )
}
