# TrailingCursor

A small dot pinned exactly to the pointer plus a larger ring that lags behind
it. The ring grows over interactive elements, shrinks while pressed, and any
element can override the cursor through `data-` attributes. The loop stops as
soon as the ring catches up.

```tsx
import { TrailingCursor } from "@/lib/trailing-cursor"

export function Chrome() {
    return <TrailingCursor preset="cyan" mixBlendMode="difference" />
}
```

Mount it once, near the root of the app.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `preset` | `amber \| cyan \| violet \| emerald \| rose \| mono` | `amber` | Fills the three colours from the shared palette |
| `variant` | `dot-ring \| ring-only \| dot-only` | `dot-ring` | |
| `dotColor` | string | from preset | Any CSS colour, `var(--token)` included |
| `ringColor` | string | from preset | Ring fill |
| `ringBorderColor` | string | from preset | Ring border and label colour |
| `dotSize` | number | `6` | px |
| `ringSize` | number | `34` | px at rest |
| `ringHoverSize` | number | `52` | px over an interactive element |
| `ringPressSize` | number | `26` | px while the pointer is down |
| `ease` | number | `0.16` | Lerp factor, 0..1. Higher snaps harder |
| `hideNativeCursor` | boolean | `true` | |
| `interactiveSelector` | string | see below | What counts as interactive |
| `mixBlendMode` | CSS value | | `difference` inverts against any background |
| `zIndex` | number | `2147483000` | |
| `className` | string | | |
| `disabled` | boolean | `false` | |
| `enableOnTouch` | boolean | `false` | |
| `respectReducedMotion` | boolean | `true` | |

The default `interactiveSelector` is
`a, button, input, select, textarea, [role='button'], [data-cursor]`.

## Per-element overrides

Resolved on `pointerover` against the closest ancestor carrying any of them:

| Attribute | Effect |
| --- | --- |
| `data-cursor="hidden"` | Both layers fade out over that element |
| `data-cursor-scale="2"` | Multiplies the current ring size |
| `data-cursor-color="#22d3ee"` | Recolours the dot and the ring border while hovering |
| `data-cursor-label="Open"` | Renders short text inside the ring |

```tsx
<article data-cursor-label="Read" data-cursor-scale="1.8">…</article>
<video data-cursor="hidden" />
<a href="/pricing" data-cursor-color="var(--brand)">Pricing</a>
```

`data-cursor-color` goes through the same `resolveColor` helper as GridTrail, so
a token is read off the element that declares it — a section can theme the
cursor with its own `--brand`.

## Performance

- **The loop stops once the ring converges** (within 0.15 px) and restarts on the
  next pointer move. Measured in Chromium: 0 frames in 600 ms before any
  movement, 12 frames while catching up, then 0 frames in 800 ms once settled.
- Both layers move with `transform: translate3d`, never `top`/`left`.
- Every pointer listener is `passive: true`.
- Ring resizing is a CSS transition on the inner element, so it never fights the
  transform written by the loop each frame.
- The loop is cancelled on `visibilitychange` when the tab goes hidden.

## Accessibility

- The root is `aria-hidden="true"` and every layer is `pointer-events: none`, so
  the cursor can never swallow a click.
- `hideNativeCursor` adds a class to `<body>` and the cleanup removes it, on
  unmount and on every route change. Verified by test and in the browser.
- With `respectReducedMotion` on (the default) and a user who prefers reduced
  motion, the component renders nothing, attaches no listeners and **never hides
  the native cursor**. Same on coarse pointers unless `enableOnTouch` is set.
- Focus styles are untouched. A custom cursor is decoration — never make it the
  only affordance for a control.
