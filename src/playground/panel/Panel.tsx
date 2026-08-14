"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"

import { Control } from "./Control"
import { toJsx } from "./codegen"
import { getPath } from "./path"
import type { ChangeHandler, ControlGroup, PanelAction, PanelPreset } from "./types"

interface PanelProps {
    component: string
    subtitle: string
    groups: ControlGroup[]
    config: Record<string, unknown>
    defaults: Record<string, unknown>
    onChange: ChangeHandler
    onReset: () => void
    presets?: PanelPreset[]
    presetId?: string
    onPreset?: (id: string) => void
    actions?: PanelAction[]
    badge?: ReactNode
    badgeLabel?: string
    metrics?: ReactNode
    omit?: string[]
    editCount?: number
}

export function Panel({
    component,
    subtitle,
    groups,
    config,
    defaults,
    onChange,
    onReset,
    presets,
    presetId,
    onPreset,
    actions,
    badge,
    badgeLabel = "fps",
    metrics,
    omit,
    editCount = 0,
}: PanelProps) {
    const [open, setOpen] = useState(true)
    const [copied, setCopied] = useState(false)
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
        Object.fromEntries(groups.map((group) => [group.id, group.open])),
    )

    const code = useMemo(
        () => toJsx(component, defaults, config, omit),
        [component, defaults, config, omit],
    )

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null
            if (target && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return
            if (event.key.toLowerCase() === "h") setOpen((value) => !value)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    const copy = useCallback(() => {
        navigator.clipboard?.writeText(code).then(() => {
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1400)
        })
    }, [code])

    return (
        <>
            <button
                type="button"
                className="pg-toggle"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
            >
                {open ? "Hide props" : "Props"}
            </button>

            <aside className={open ? "pg-panel" : "pg-panel pg-panel-closed"}>
                <header className="pg-header">
                    <div>
                        <h2>{component}</h2>
                        <p>{subtitle}</p>
                    </div>
                    {badge !== undefined ? (
                        <div className="pg-fps">
                            <strong>{badge}</strong>
                            <span>{badgeLabel}</span>
                        </div>
                    ) : null}
                </header>

                {metrics ? <div className="pg-metrics">{metrics}</div> : null}

                {presets && presets.length > 0 ? (
                    <div className="pg-presets">
                        {presets.map((preset) => (
                            <button
                                type="button"
                                key={preset.id}
                                title={preset.hint}
                                className={
                                    preset.id === presetId ? "pg-chip pg-chip-active" : "pg-chip"
                                }
                                onClick={() => onPreset?.(preset.id)}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                ) : null}

                {editCount > 0 ? (
                    <p className="pg-sticky-note">
                        <b>{editCount}</b> manual {editCount === 1 ? "edit" : "edits"} kept across
                        presets
                    </p>
                ) : null}

                <div className="pg-actions">
                    <button
                        type="button"
                        onClick={onReset}
                        className={editCount > 0 ? "pg-reset-armed" : undefined}
                    >
                        {editCount > 0 ? `Reset ${editCount}` : "Reset"}
                    </button>
                    {actions?.map((action) => (
                        <button type="button" key={action.label} onClick={action.onClick}>
                            {action.label}
                        </button>
                    ))}
                </div>

                {groups.map((group) => (
                    <details
                        key={group.id}
                        className="pg-group"
                        open={openGroups[group.id]}
                        onToggle={(event) => {
                            const isOpen = event.currentTarget.open
                            setOpenGroups((prev) =>
                                prev[group.id] === isOpen ? prev : { ...prev, [group.id]: isOpen },
                            )
                        }}
                    >
                        <summary>
                            <span>{group.title}</span>
                            <em>{group.hint}</em>
                        </summary>
                        <div className="pg-group-body">
                            {group.controls.map((def) => (
                                <Control
                                    key={def.path}
                                    def={def}
                                    value={getPath(config, def.path)}
                                    onChange={onChange}
                                />
                            ))}
                        </div>
                    </details>
                ))}

                <div className="pg-code">
                    <div className="pg-code-head">
                        <span>JSX</span>
                        <button type="button" onClick={copy}>
                            {copied ? "Copied" : "Copy"}
                        </button>
                    </div>
                    <pre>{code}</pre>
                </div>
            </aside>
        </>
    )
}
