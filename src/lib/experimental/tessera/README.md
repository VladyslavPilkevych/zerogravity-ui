# Tessera

A full-screen route transition built from tiles. Blocks pop into place at
scattered positions until the viewport is completely covered, the destination
route is allowed to render underneath, and the blocks then vanish again to
uncover it.

The transition engine knows nothing about routing. It only covers the screen,
tells you when coverage is complete, and waits for you to say the next page is
ready.

## Basic usage

```tsx
import { TesseraProvider, useTessera } from "@/lib/experimental"

export function Root({ children }) {
    return <TesseraProvider color="#0b0c11">{children}</TesseraProvider>
}

function ShopLink() {
    const tessera = useTessera()

    return <button onClick={() => tessera.run(() => navigate("/shop"))}>Shop</button>
}
```

`run` is the whole API. It covers the viewport, runs your callback, and reveals
the page again:

```text
idle → covering → covered → (your callback) → revealing → idle
```

The callback is invoked only after the last tile has finished animating **and**
React has committed and painted the covered state, so nothing of the outgoing
page can be seen while the route changes.

## Signalling that the next page is ready

The reveal begins when the promise your callback returns settles. That promise
is the readiness contract — there is no fixed delay guessing when a route
finished rendering.

```tsx
tessera.run(async () => {
    navigate("/shop")
    await whenTheDestinationHasMounted()
})
```

If the callback is synchronous, the engine still waits for a paint before
revealing, so a plain `setState` swap cannot flash.

As a safety valve, `timeout` (default `4000`ms) forces the reveal if the
readiness promise never settles, so a bug in the consumer can never leave the
page permanently covered. Pass `timeout={0}` to wait indefinitely.

## Per-navigation options

Global defaults live on the provider. A single navigation can override them:

```tsx
tessera.run({ color: "#111111", sequence: "center" }, () => navigate("/shop"))
```

Overrides apply to that transition only and are discarded when it ends.

## Concurrency

While a transition is active, further `run` calls are **ignored**: the returned
promise resolves immediately and the callback is never invoked. There is never
more than one overlay and never a second navigation from one gesture. Read the
phase if you want to reflect that in the UI:

```tsx
const phase = useTesseraPhase()

<button disabled={phase !== "idle"}>Shop</button>
```

## React Router

Not a dependency, and no React Router internals appear in the component. The
integration is a small hook the consumer owns:

```tsx
function useTesseraNavigate() {
    const tessera = useTessera()
    const navigate = useNavigate()
    const location = useLocation()
    const arrival = useRef<(() => void) | null>(null)

    useEffect(() => {
        arrival.current?.()
        arrival.current = null
    }, [location.key])

    return (to: string) =>
        tessera.run(() => {
            navigate(to)
            return new Promise<void>((resolve) => {
                arrival.current = resolve
            })
        })
}
```

The deferred promise resolves when the router reports the new location, which is
what unblocks the reveal.

## Next.js App Router

The core never imports `next`. Wrap the app in a client component and use the
same deferred pattern against `usePathname`:

```tsx
"use client"

function useTesseraRouter() {
    const tessera = useTessera()
    const router = useRouter()
    const pathname = usePathname()
    const arrival = useRef<(() => void) | null>(null)

    useEffect(() => {
        arrival.current?.()
        arrival.current = null
    }, [pathname])

    return (href: string) =>
        tessera.run(() => {
            router.push(href)
            return new Promise<void>((resolve) => {
                arrival.current = resolve
            })
        })
}
```

`TesseraProvider` is a client component and renders nothing while idle, so it
adds no markup to the server response and cannot cause a hydration mismatch.

**Tested surface.** The engine, lifecycle and reveal-gating are covered by unit
tests, a Storybook browser test and Playwright end-to-end tests, all driving a
mock router built from local state. The React Router and Next.js snippets above
follow the same contract but have **not** been executed against a real router in
this repository — treat them as documented patterns, not verified integrations.

## Configuration

| Prop                   | Default            | Notes                                          |
| ---------------------- | ------------------ | ---------------------------------------------- |
| `color`                | `#0b0c11`          | Tile colour, one for the whole transition      |
| `rows`                 | `4`                | Grid rows, clamped to 1–12                     |
| `columns`              | `6`                | Grid columns, clamped to 1–12                  |
| `duration`             | `420`              | One tile's animation, ms                       |
| `stagger`              | `380`              | Total spread between first and last tile       |
| `easing`               | ease-out           | Timing function for both directions            |
| `sequence`             | `"random"`         | `random`, `row`, `column`, `reverse`, `center` |
| `revealSequence`       | same as `sequence` | Order the tiles vanish in                      |
| `zIndex`               | `9000`             | Stacking layer for the overlay                 |
| `timeout`              | `4000`             | Readiness failsafe, `0` disables it            |
| `respectReducedMotion` | `true`             | Honour `prefers-reduced-motion`                |

`stagger` is the spread across the whole grid, not a per-tile increment, so
raising `rows`/`columns` does not lengthen the transition.

Each tile scales up from its own centre and fades in, so the surface reads as
separate blocks landing in scattered spots rather than bands wiping across the
screen. `revealSequence` reuses the cover order by default, so the blocks leave
in the order they arrived.

`random` is a seeded scramble, not `Math.random`. The seed is the transition
counter, so every navigation gets a fresh scatter while each individual scatter
stays reproducible from `(rows, columns, runId)` — no `Math.random` during
render, no hydration risk, and stable enough to assert on in tests.

## Reduced motion

Under `prefers-reduced-motion: reduce` the tiles neither scale nor stagger. They
cross-fade as one 160ms block, the navigation still happens only once coverage
is complete, and the reveal is the same fade in reverse. The transition is
shortened, never skipped — dropping it would expose exactly the route flash it
exists to hide.

Detection is JavaScript-only, so timing and visuals cannot disagree; that also
means `respectReducedMotion={false}` genuinely restores the full animation.

## Accessibility

The overlay is `aria-hidden` and contains only empty `div`s, so it adds nothing
to the accessibility tree, holds no focus targets and cannot trap focus. Reading
order is untouched. Focus is never moved, which leaves the router's own focus
handling intact.

## Interaction and scrolling

While mounted the overlay sits above the app and absorbs pointer input, so
content underneath cannot be clicked and one gesture cannot start two
navigations. When idle it is unmounted entirely — there is no invisible fixed
element left over.

Body styles are never touched. The overlay sets `touch-action: none` so a touch
drag during the transition does not scroll the page; wheel scrolling of the
document underneath is deliberately left alone and handled by the router's own
scroll restoration.

## Error behaviour

If the callback throws or rejects, the page is revealed again, all state is
reset, and `run` rethrows so the failure is still visible to you:

```tsx
tessera.run(() => navigate("/shop")).catch(reportError)
```

## Performance notes

Twenty-four `div`s by default, capped at 144 by the axis clamp. Nothing renders while
idle. All motion is CSS animations on `transform` and `opacity`; per-tile delays
are custom properties, so React re-renders only on phase changes — four per
transition, never per frame. There is no `requestAnimationFrame` loop, no
canvas, no filters and no animation dependency.

Completion is read from the real animations via `Animation.finished` rather than
a guessed timer, with a timer only as a fallback for environments that do not
implement `getAnimations` and as a stall guard for backgrounded tabs.

Seams from fractional viewport sizes are handled twice over. Each tile carries
`margin: -1px`, so neighbours overlap by two device-independent pixels and no
rounding can open a gap; because that is the tile's own background rather than a
`box-shadow` ring, the overlap is a single alpha layer and leaves no darker edge
while a tile is still fading in. The fully covered phase additionally paints the
grid itself in the tile colour, so the static frame is gap-free by construction.
The 1px overhang at the viewport edge is clipped by the overlay.
