"use client"

import { useRef, type RefObject } from "react"

import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect"

export function useLatestRef<T>(value: T): RefObject<T> {
    const ref = useRef(value)

    useIsomorphicLayoutEffect(() => {
        ref.current = value
    })

    return ref
}
