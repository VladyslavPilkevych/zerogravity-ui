import type { ReactNode } from "react"

import { cx } from "../../internal"
import "./Kbd.css"

export type KbdPlatform = "mac" | "pc"

export interface KbdProps {
    /** Key names to render as a group. `Mod` resolves to ⌘ on mac and Ctrl elsewhere. */
    keys?: readonly string[]
    /** Which glyph set to draw. Resolve this after mount to stay hydration-safe. */
    platform?: KbdPlatform
    /** A single key, when `keys` is not used. */
    children?: ReactNode
    className?: string
}

interface Glyph {
    mac: string
    pc: string
    /** what a screen reader should say, when the glyph alone would not do */
    spoken?: string
}

const GLYPHS: Record<string, Glyph> = {
    mod: { mac: "⌘", pc: "Ctrl", spoken: "Command" },
    meta: { mac: "⌘", pc: "Win", spoken: "Command" },
    ctrl: { mac: "⌃", pc: "Ctrl", spoken: "Control" },
    alt: { mac: "⌥", pc: "Alt", spoken: "Alt" },
    shift: { mac: "⇧", pc: "Shift", spoken: "Shift" },
    enter: { mac: "↵", pc: "↵", spoken: "Enter" },
    escape: { mac: "Esc", pc: "Esc" },
    esc: { mac: "Esc", pc: "Esc" },
    backspace: { mac: "⌫", pc: "⌫", spoken: "Backspace" },
    tab: { mac: "⇥", pc: "⇥", spoken: "Tab" },
    up: { mac: "↑", pc: "↑", spoken: "Arrow up" },
    down: { mac: "↓", pc: "↓", spoken: "Arrow down" },
    left: { mac: "←", pc: "←", spoken: "Arrow left" },
    right: { mac: "→", pc: "→", spoken: "Arrow right" },
}

function Key({ name, platform }: { name: string; platform: KbdPlatform }) {
    const glyph = GLYPHS[name.toLowerCase()]
    const shown = glyph ? glyph[platform] : name
    const spoken = glyph?.spoken

    return (
        <kbd className="zg-kbd-key">
            {spoken && spoken !== shown ? (
                <>
                    <span aria-hidden="true">{shown}</span>
                    <span className="zg-kbd-sr">{spoken}</span>
                </>
            ) : (
                shown
            )}
        </kbd>
    )
}

export function Kbd({ keys, platform = "pc", children, className }: KbdProps) {
    if (!keys) {
        return <kbd className={cx("zg-kbd-key", className)}>{children}</kbd>
    }

    return (
        <span className={cx("zg-kbd", className)}>
            {keys.map((name, index) => (
                <Key key={`${name}-${index}`} name={name} platform={platform} />
            ))}
        </span>
    )
}
