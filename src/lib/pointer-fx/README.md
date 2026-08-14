# pointer-fx

Shared building blocks for the pointer-driven components. `GridTrail` and
`TrailingCursor` both use them, so their colour handling and their rules about
when an effect may run cannot drift apart.

This module exports no component of its own.

## `usePointerFxEnabled`

Decides whether a pointer effect may run at all.

```tsx
const enabled = usePointerFxEnabled({ disabled, enableOnTouch, respectReducedMotion })
if (!enabled) return null
```

| Option                 | Default |                                                                    |
| ---------------------- | ------- | ------------------------------------------------------------------ |
| `disabled`             | `false` | Force the effect off                                               |
| `enableOnTouch`        | `false` | Allow coarse pointers; by default only `(pointer: fine)` qualifies |
| `respectReducedMotion` | `true`  | Honour `prefers-reduced-motion: reduce`                            |

It is built on `useSyncExternalStore`, so it reports `false` during server
rendering and on the first client render, then settles to the real value. That
avoids both hydration mismatches and a state update inside an effect. A
component that gates on it renders nothing and attaches no listeners until the
gate opens.

## `resolveColor`

```ts
resolveColor(value: string, element?: Element | null): string
```

Returns the value unchanged for every ordinary CSS colour — hex, `rgb()`,
`hsl()`, `oklch()`, named colours. Canvas accepts all of those directly, so
nothing is parsed and no colour space is reimplemented.

The one thing canvas cannot read is `var(--token)`. Those are resolved against
the given element with `getComputedStyle`, including a token that points at
another token and the `var(--x, fallback)` form. With no element to read from,
the fallback is used, otherwise the raw string is returned.

```ts
resolveColor("oklch(0.79 0.16 78)") // unchanged
resolveColor("var(--brand)", element) // computed value of --brand
resolveColor("var(--missing, #34d399)") // "#34d399"
```

Tokens are resolved when configuration changes, not per frame. Swapping a theme
at runtime requires a re-render for the new value to be picked up.

## Presets

`POINTER_FX_PRESETS` maps each preset id to its token set, and
`POINTER_FX_PRESET_IDS` lists them in order: `amber`, `cyan`, `violet`,
`emerald`, `rose`, `mono`. Components take a `preset` prop and fall back to
these tokens for any colour the caller did not set explicitly. Explicit props
always win over the preset.
