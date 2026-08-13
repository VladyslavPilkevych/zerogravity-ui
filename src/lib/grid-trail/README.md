# GridTrail

Squares of an invisible grid light up under the pointer and fade out, leaving a
comet-like trail. Canvas 2D, no dependencies, and the animation loop stops
completely once the last cell has faded.

```tsx
import { GridTrail } from "@/lib/grid-trail"

export function Background() {
    return <GridTrail preset="cyan" shape="circle" showGrid />
}
```

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `preset` | `amber \| cyan \| violet \| emerald \| rose \| mono` | `amber` | Fills `color` and `gridColor` from the shared palette |
| `color` | string | from preset | Any CSS colour, including `oklch()` and `var(--token)` |
| `cellSize` | number | `56` | Grid pitch in px |
| `gap` | number | `2` | Inset between the square and its cell |
| `cornerRadius` | number | `0` | Uses `roundRect` when above 0 |
| `shape` | `square \| circle` | `square` | |
| `peakOpacity` | number | `0.5` | Alpha of a freshly lit cell |
| `fadeDuration` | number | `450` | ms from full to zero |
| `maxCells` | number | `90` | Oldest cells are evicted past this |
| `neighborFalloff` | number | `0` | `0.3` lights the eight neighbours at 30% |
| `showGrid` | boolean | `false` | Static grid lines on the same canvas |
| `gridColor` | string | from preset | |
| `gridOpacity` | number | `0.06` | |
| `blendMode` | GlobalCompositeOperation | `source-over` | `lighter` glows on dark backgrounds |
| `container` | `RefObject<HTMLElement>` | | Scope to an element instead of the viewport |
| `zIndex` | number | `-10` | |
| `className` | string | | |
| `disabled` | boolean | `false` | |
| `enableOnTouch` | boolean | `false` | |
| `respectReducedMotion` | boolean | `true` | |

Explicit `color` and `gridColor` always beat the preset.

## Scoping to a container

```tsx
const stage = useRef<HTMLDivElement>(null)

<div ref={stage} style={{ position: "relative", overflow: "hidden" }}>
    <GridTrail container={stage} zIndex={0} />
    <h2>Only lights up in here</h2>
</div>
```

In container mode the canvas switches to `position: absolute`, listens on that
element, converts pointer coordinates to be relative to it, and measures with a
`ResizeObserver`. The grid origin is the container's top-left corner, so cells
stay aligned to the box rather than to the viewport. In viewport mode the canvas
is `position: fixed`, listens on `window`, and aligns to the viewport origin.

Give the container `position: relative`, and `overflow: hidden` if you want the
trail clipped to it.

## Colour handling

Colours are never parsed. The raw string goes to `ctx.fillStyle` and
transparency is driven by `ctx.globalAlpha`, so the canvas accepts every CSS
colour syntax for free — `#f5ae20`, `rgb()`, `hsl()`, `oklch()`, named colours.

The one thing canvas cannot read is `var(--token)`. Those are resolved up front
through `resolveColor` from `../pointer-fx`, which reads the computed value off
the container (or the canvas in viewport mode), and follows a token that points
at another token.

```tsx
<GridTrail color="var(--brand-accent)" />
<GridTrail color="oklch(0.79 0.16 78)" />
```

Tokens are read when the config changes, not per frame. If you swap a theme at
runtime, re-render the component so the new value is picked up.

## Performance

- **The loop is fully idle when nothing is lit.** Measured in Chromium: 0 frames
  in 700 ms before any pointer movement, 18 frames in 300 ms while the trail is
  alive, then 0 frames in 900 ms once it has faded.
- `showGrid` does not change that. The grid is repainted once when the loop ends,
  so it stays on screen at zero cost.
- The pointer listener is `passive: true`.
- `devicePixelRatio` is capped at 2.
- `ResizeObserver` in container mode, `resize` in viewport mode.
- The loop is cancelled on `visibilitychange` when the tab goes hidden and
  resumes if cells are still alive.
- Changing props never restarts anything: the React layer pushes config into a
  plain `GridTrailEngine`, which diffs it. Only a `cellSize` change clears the
  cell map, because the old coordinates no longer line up.

## Accessibility

The canvas is `aria-hidden="true"` and `pointer-events: none`. With
`respectReducedMotion` on (the default) and a user who prefers reduced motion,
the component renders nothing at all and attaches no listeners. Same on coarse
pointers unless `enableOnTouch` is set.
