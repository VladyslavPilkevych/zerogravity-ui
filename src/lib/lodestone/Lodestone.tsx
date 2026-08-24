"use client"

import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react"

import { cx, useIsomorphicLayoutEffect, useLatestRef } from "../internal"
import { usePointerFxEnabled } from "../pointer-fx"
import { constrainDisplacement, type Bounds } from "./collision"
import "./Lodestone.css"

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">

export interface LodestoneProps extends NativeButtonProps {
    children: ReactNode
    radius?: number
    strength?: number
    maxDisplacement?: number
    minGap?: number
    release?: number
    lift?: number
    enableOnTouch?: boolean
    respectReducedMotion?: boolean
}

interface RegistryEntry {
    el: HTMLElement
    offsetX: number
    offsetY: number
}

const REGISTRY = new Set<RegistryEntry>()

const SETTLED = 0.08

export function Lodestone({
    children,
    radius = 130,
    strength = 0.32,
    maxDisplacement = 16,
    minGap = 12,
    release = 0.16,
    lift = 0.04,
    enableOnTouch = false,
    respectReducedMotion = true,
    className,
    disabled = false,
    ...rest
}: LodestoneProps) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const frameRef = useRef(0)
    const enabled = usePointerFxEnabled({ disabled, enableOnTouch, respectReducedMotion })
    const settings = useLatestRef({ radius, strength, maxDisplacement, minGap, release, lift })

    useIsomorphicLayoutEffect(() => {
        const button = buttonRef.current
        if (!button || !enabled) return

        let targetX = 0
        let targetY = 0
        let x = 0
        let y = 0
        let rest: Bounds | null = null
        let blockers: Bounds[] = []

        const entry = { el: button, offsetX: 0, offsetY: 0 }
        REGISTRY.add(entry)

        const measure = () => {
            const box = button.getBoundingClientRect()
            rest = {
                left: box.left - entry.offsetX,
                top: box.top - entry.offsetY,
                right: box.right - entry.offsetX,
                bottom: box.bottom - entry.offsetY,
            }

            blockers = []
            for (const other of REGISTRY) {
                if (other === entry || other.el.parentElement !== button.parentElement) continue
                const otherBox = other.el.getBoundingClientRect()
                blockers.push({
                    left: otherBox.left - other.offsetX,
                    top: otherBox.top - other.offsetY,
                    right: otherBox.right - other.offsetX,
                    bottom: otherBox.bottom - other.offsetY,
                })
            }
        }

        const invalidate = () => {
            rest = null
        }

        const paint = () => {
            const config = settings.current

            const factor = Math.min(Math.max(config.release, 0.02), 1)
            x += (targetX - x) * factor
            y += (targetY - y) * factor

            entry.offsetX = x
            entry.offsetY = y

            const travel = Math.hypot(x, y)
            const scale = 1 + (travel / Math.max(1, config.maxDisplacement)) * config.lift
            button.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`

            if (Math.abs(targetX - x) > SETTLED || Math.abs(targetY - y) > SETTLED) {
                frameRef.current = requestAnimationFrame(paint)
                return
            }

            frameRef.current = 0
            if (targetX === 0 && targetY === 0) {
                entry.offsetX = 0
                entry.offsetY = 0
                button.style.transform = ""
            }
        }

        const wake = () => {
            if (frameRef.current === 0) frameRef.current = requestAnimationFrame(paint)
        }

        const onMove = (event: PointerEvent) => {
            const config = settings.current
            if (!rest) measure()
            if (!rest) return

            const dx = event.clientX - (rest.left + rest.right) / 2
            const dy = event.clientY - (rest.top + rest.bottom) / 2
            const distance = Math.hypot(dx, dy)

            if (distance > config.radius) {
                if (targetX !== 0 || targetY !== 0) {
                    targetX = 0
                    targetY = 0
                    wake()
                }
                return
            }

            const falloff = 1 - distance / config.radius
            const pull = config.strength * falloff * falloff * (3 - 2 * falloff)
            const clamp = config.maxDisplacement

            const wantX = Math.max(-clamp, Math.min(clamp, dx * pull))
            const wantY = Math.max(-clamp, Math.min(clamp, dy * pull))
            const safe = constrainDisplacement(rest, blockers, wantX, wantY, config.minGap)

            targetX = safe.x
            targetY = safe.y
            wake()
        }

        const onRelease = () => {
            targetX = 0
            targetY = 0
            wake()
        }

        window.addEventListener("pointermove", onMove, { passive: true })
        window.addEventListener("blur", onRelease)
        window.addEventListener("resize", invalidate)
        window.addEventListener("scroll", invalidate, { passive: true, capture: true })

        return () => {
            window.removeEventListener("pointermove", onMove)
            window.removeEventListener("blur", onRelease)
            window.removeEventListener("resize", invalidate)
            window.removeEventListener("scroll", invalidate, { capture: true })
            REGISTRY.delete(entry)
            if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
            frameRef.current = 0
            button.style.transform = ""
        }
    }, [enabled, settings])

    return (
        <button
            ref={buttonRef}
            type="button"
            className={cx("xp-lodestone", className)}
            disabled={disabled}
            {...rest}
        >
            <span className="xp-lodestone-label">{children}</span>
        </button>
    )
}
