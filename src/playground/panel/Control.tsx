"use client"

import { memo } from "react"

import type { ChangeHandler, ControlDef } from "./types"

interface ControlProps {
    def: ControlDef
    value: unknown
    onChange: ChangeHandler
}

const HEX = /^#[0-9a-f]{6}$/i

function toHex(value: unknown): string {
    return typeof value === "string" && HEX.test(value) ? value : "#ffffff"
}

function format(value: number, step: number): string {
    if (step >= 1) return String(Math.round(value))
    if (step >= 0.05) return value.toFixed(2)
    return value.toFixed(3)
}

function Head({ def, display }: { def: ControlDef; display?: string }) {
    return (
        <div className="pg-row-head">
            <span className="pg-label">{def.label}</span>
            {display !== undefined ? <span className="pg-value">{display}</span> : null}
            <code className="pg-path">{def.path}</code>
        </div>
    )
}

export const Control = memo(function Control({ def, value, onChange }: ControlProps) {
    switch (def.kind) {
        case "number": {
            const current = typeof value === "number" && Number.isFinite(value) ? value : def.min
            return (
                <div className="pg-row">
                    <Head
                        def={def}
                        display={`${format(current, def.step)}${def.unit ? ` ${def.unit}` : ""}`}
                    />
                    <div className="pg-row-body">
                        <input
                            type="range"
                            min={def.min}
                            max={def.max}
                            step={def.step}
                            value={current}
                            onChange={(event) =>
                                onChange(def.path, event.currentTarget.valueAsNumber)
                            }
                        />
                        <input
                            type="number"
                            className="pg-number"
                            min={def.min}
                            max={def.max}
                            step={def.step}
                            value={current}
                            onChange={(event) => {
                                const next = event.currentTarget.valueAsNumber
                                if (Number.isFinite(next)) onChange(def.path, next)
                            }}
                        />
                    </div>
                </div>
            )
        }

        case "cssLength": {
            const raw = typeof value === "string" ? parseFloat(value) : def.min
            const current = Number.isFinite(raw) ? raw : def.min
            return (
                <div className="pg-row">
                    <Head def={def} display={`${format(current, def.step)}${def.unit}`} />
                    <div className="pg-row-body">
                        <input
                            type="range"
                            min={def.min}
                            max={def.max}
                            step={def.step}
                            value={current}
                            onChange={(event) =>
                                onChange(
                                    def.path,
                                    `${event.currentTarget.valueAsNumber}${def.unit}`,
                                )
                            }
                        />
                        <input
                            type="number"
                            className="pg-number"
                            min={def.min}
                            max={def.max}
                            step={def.step}
                            value={current}
                            onChange={(event) => {
                                const next = event.currentTarget.valueAsNumber
                                if (Number.isFinite(next)) onChange(def.path, `${next}${def.unit}`)
                            }}
                        />
                    </div>
                </div>
            )
        }

        case "select":
            return (
                <div className="pg-row">
                    <Head def={def} />
                    <select
                        className="pg-select"
                        value={String(value)}
                        onChange={(event) => onChange(def.path, event.currentTarget.value)}
                    >
                        {def.options.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            )

        case "boolean":
            return (
                <div className="pg-row pg-row-inline">
                    <label className="pg-switch">
                        <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(event) => onChange(def.path, event.currentTarget.checked)}
                        />
                        <span className="pg-label">{def.label}</span>
                    </label>
                    <code className="pg-path">{def.path}</code>
                </div>
            )

        case "color":
            return (
                <div className="pg-row pg-row-inline">
                    <label className="pg-switch">
                        <input
                            type="color"
                            className="pg-color"
                            value={toHex(value)}
                            onChange={(event) => onChange(def.path, event.currentTarget.value)}
                        />
                        <span className="pg-label">{def.label}</span>
                    </label>
                    <code className="pg-path">{def.path}</code>
                </div>
            )

        case "colorNullable": {
            const enabled = typeof value === "string"
            return (
                <div className="pg-row pg-row-inline">
                    <label className="pg-switch">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(event) =>
                                onChange(def.path, event.currentTarget.checked ? "#050505" : null)
                            }
                        />
                        <span className="pg-label">{def.label}</span>
                    </label>
                    {enabled ? (
                        <input
                            type="color"
                            className="pg-color"
                            value={toHex(value)}
                            onChange={(event) => onChange(def.path, event.currentTarget.value)}
                        />
                    ) : null}
                    <code className="pg-path">{def.path}</code>
                </div>
            )
        }

        case "palette": {
            const colors = Array.isArray(value) ? (value as string[]) : []
            return (
                <div className="pg-row">
                    <Head def={def} />
                    <div className="pg-palette">
                        {colors.map((color, index) => (
                            <div className="pg-swatch" key={`${index}-${color}`}>
                                <input
                                    type="color"
                                    className="pg-color"
                                    value={toHex(color)}
                                    onChange={(event) => {
                                        const next = colors.slice()
                                        next[index] = event.currentTarget.value
                                        onChange(def.path, next)
                                    }}
                                />
                                <button
                                    type="button"
                                    className="pg-swatch-remove"
                                    title="Remove colour"
                                    onClick={() =>
                                        onChange(
                                            def.path,
                                            colors.filter((_, i) => i !== index),
                                        )
                                    }
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="pg-swatch-add"
                            onClick={() => onChange(def.path, [...colors, "#ffffff"])}
                        >
                            +
                        </button>
                    </div>
                </div>
            )
        }

        default:
            return null
    }
})
