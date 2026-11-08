# TrailingCursor

A small dot on the pointer plus a larger ring that lags behind it. The ring
grows over interactive elements, shrinks while pressed, and any element can
override the cursor through `data-` attributes. Text fields keep their native
text cursor. The loop stops as soon as everything visible has caught up.

```tsx
import { TrailingCursor } from "@/lib/trailing-cursor"

export function Chrome() {
    return <TrailingCursor preset="cyan" mixBlendMode="difference" />
}
```

Mount it once, near the root of the app.

## Dot only

`ease` drives the ring and `dotEase` drives the dot, so the two never interfere.
`dotEase={1}`, the default, keeps the dot pinned to the pointer; lower values
make it trail. With `variant="dot-only"` the ring is not simulated at all.

```tsx
<TrailingCursor
    variant="dot-only"
    dotSize={10}
    dotEase={0.2}
    dotHoverScale={2.4}
    dotPressScale={0.7}
/>
```

`dotHoverScale` applies over anything matching `interactiveSelector` and
`dotPressScale` while the pointer is down. Both default to `1`, and both scale
around the dot's centre, so it never drifts off the pointer.

## Scope

Without `container` the cursor owns the page: it listens on the window and hides
the native cursor on `<body>`. Pass a `container` ref and everything narrows to
that element — the listeners, the coordinates the dot and ring use, and the
`cursor: none` rule. The native cursor returns the moment the pointer leaves.

```tsx
const box = useRef<HTMLDivElement>(null)

<div ref={box}>
    <TrailingCursor container={box} />
</div>
```

## Props

| Prop                   | Type                                                 | Default      |                                                     |
| ---------------------- | ---------------------------------------------------- | ------------ | --------------------------------------------------- |
| `preset`               | `amber \| cyan \| violet \| emerald \| rose \| mono` | `amber`      | Fills the three colours from the shared palette     |
| `container`            | RefObject<HTMLElement>                               | —            | Scope the effect to one element instead of the page |
| `variant`              | `dot-ring \| ring-only \| dot-only`                  | `dot-ring`   |                                                     |
| `dotColor`             | string                                               | from preset  | Any CSS colour, `var(--token)` included             |
| `ringColor`            | string                                               | from preset  | Ring fill                                           |
| `ringBorderColor`      | string                                               | from preset  | Ring border and label colour                        |
| `dotSize`              | number                                               | `6`          | px                                                  |
| `ringSize`             | number                                               | `34`         | px at rest                                          |
| `ringHoverSize`        | number                                               | `52`         | px over an interactive element                      |
| `ringPressSize`        | number                                               | `26`         | px while the pointer is down                        |
| `ease`                 | number                                               | `0.16`       | Ring follow rate, 0..1. Higher snaps harder         |
| `dotEase`              | number                                               | `1`          | Dot follow rate, 0..1. `1` pins it to the pointer   |
| `dotHoverScale`        | number                                               | `1`          | Dot scale over an interactive element               |
| `dotPressScale`        | number                                               | `1`          | Dot scale while the pointer is down                 |
| `hideNativeCursor`     | boolean                                              | `true`       |                                                     |
| `preserveTextCursor`   | boolean                                              | `true`       | Keep the native text cursor in text fields          |
| `interactiveSelector`  | string                                               | see below    | What counts as interactive                          |
| `mixBlendMode`         | CSS value                                            |              | `difference` inverts against any background         |
| `zIndex`               | number                                               | `2147483000` |                                                     |
| `className`            | string                                               |              |                                                     |
| `disabled`             | boolean                                              | `false`      |                                                     |
| `enableOnTouch`        | boolean                                              | `false`      |                                                     |
| `respectReducedMotion` | boolean                                              | `true`       |                                                     |

The default `interactiveSelector` is
`a, button, input, select, textarea, [role='button'], [data-cursor]`.

Both follow rates are per frame at 60 Hz and are corrected for the real frame
time, so the trail feels the same on a 120 Hz display.

## Text fields

Over a `textarea`, a `contenteditable` region or a text-like `<input>` (text,
search, email, password, number, URL and so on), the native text cursor comes
back and the custom cursor fades out, so there are never two cursors at once.
Buttons, checkboxes, radios, ranges, colour and file inputs and `<select>` keep
the custom cursor. Pass `preserveTextCursor={false}` to hide the native cursor
everywhere, as before.

## Per-element overrides

Resolved on `pointerover` against the closest ancestor carrying any of them:

| Attribute                     | Effect                                               |
| ----------------------------- | ---------------------------------------------------- |
| `data-cursor="hidden"`        | Both layers fade out over that element               |
| `data-cursor-scale="2"`       | Multiplies the current ring size                     |
| `data-cursor-color="#22d3ee"` | Recolours the dot and the ring border while hovering |
| `data-cursor-label="Open"`    | Renders short text inside the ring                   |

```tsx
<article data-cursor-label="Read" data-cursor-scale="1.8">…</article>
<video data-cursor="hidden" />
<a href="/pricing" data-cursor-color="var(--brand)">Pricing</a>
```

`data-cursor-color` accepts any CSS colour, `var(--token)` included. It goes
through the same `resolveColor` helper as GridTrail, so a token is read off the
element that declares it — a section can theme the cursor with its own
`--brand`.

## Performance

- **The loop stops once every visible layer converges** (within 0.15 px) and
  restarts on the next pointer move. It runs on the library's shared frame
  loop, which also holds while the tab is hidden.
- **Dot only does no ring work.** With the default `dotEase={1}` a pointer move
  costs a single frame.
- Both layers move with the `translate` property, never `top`/`left`, and the
  dot scales with `scale`, so position and size never fight each other.
- Every pointer listener is `passive: true`. The release listeners exist only
  while the pointer is down.
- Ring resizing is a CSS transition on the inner element, so it never fights the
  position written by the loop each frame.

## Accessibility

- The root is `aria-hidden="true"` and every layer is `pointer-events: none`, so
  the cursor can never swallow a click.
- `hideNativeCursor` adds a class to `<body>` and the cleanup removes it, on
  unmount and on every route change. Verified by test and in the browser. Text
  fields keep their native text cursor unless `preserveTextCursor` is `false`.
- A press always ends: releasing outside a scoped container, a cancelled pointer
  or the window losing focus all reset the pressed state.
- With `respectReducedMotion` on (the default) and a user who prefers reduced
  motion, the component renders nothing, attaches no listeners and **never hides
  the native cursor**. Same on coarse pointers unless `enableOnTouch` is set.
- Focus styles are untouched. A custom cursor is decoration — never make it the
  only affordance for a control.
