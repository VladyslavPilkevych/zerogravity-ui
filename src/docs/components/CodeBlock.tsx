"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { tokenize } from "../highlight"
import { CheckIcon, CopyIcon } from "./icons"

interface CodeBlockProps {
    code: string
    language?: string
}

export function CodeBlock({ code, language = "tsx" }: CodeBlockProps) {
    const [copied, setCopied] = useState(false)
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    const tokens = useMemo(() => tokenize(code), [code])

    useEffect(() => () => clearTimeout(timer.current), [])

    const copy = useCallback(async () => {
        try {
            await navigator.clipboard?.writeText(code)
            setCopied(true)
            clearTimeout(timer.current)
            timer.current = setTimeout(() => setCopied(false), 1600)
        } catch {
            setCopied(false)
        }
    }, [code])

    return (
        <div className="dz-code">
            <div className="dz-code-bar">
                <span className="dz-code-lang">{language.toUpperCase()}</span>
                <button
                    type="button"
                    className="dz-copy"
                    data-copied={copied ? "true" : undefined}
                    onClick={copy}
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
            <pre>
                <code>
                    {tokens.map((token, index) => (
                        <span key={index} className={`tk-${token.type}`}>
                            {token.text}
                        </span>
                    ))}
                </code>
            </pre>
        </div>
    )
}
