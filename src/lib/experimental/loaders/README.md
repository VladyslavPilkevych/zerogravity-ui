# Pixel loaders

Four retro-digital loading states sharing one visual language: everything is
built from square blocks, all motion is CSS, and every one keeps proper loading
semantics.

```tsx
import { PixelBar, PixelBlocks, PixelHeart, PixelPulse } from "@/lib/experimental"
```

## Which one to reach for

| Loader        | Use it for                                              |
| ------------- | ------------------------------------------------------- |
| `PixelHeart`  | Brand moments — first paint, empty states, splash       |
| `PixelBlocks` | Inline: beside a label, inside a button, in a table row |
| `PixelBar`    | Progress, known or unknown                              |
| `PixelPulse`  | A whole page or a large container                       |

They are deliberately different in shape and scale rather than four variations of
one animation: an icon, a compact row, a bar, and a full surface.

### PixelHeart

A 70-pixel heart on an 11 × 10 grid — square blocks, no SVG curves.

```tsx
<PixelHeart size={120} variant="pulse" label="Loading your world" />
```

`pulse` breathes the whole heart while a soft ripple of opacity travels outward
from its core; each pixel's delay comes from its distance to the centre, which is
what keeps it rhythmic rather than uniform. `blink` uses `steps()` timing for a
retro on/off flicker at roughly 1Hz, dipping to 22% rather than going dark.

Props: `size`, `variant`, plus the shared set below.

### PixelBlocks

A short row of blocks, three patterns:

- `wave` — staggered rise and fall, left to right
- `center` — scale pulse radiating from the middle block outward
- `steps` — a hard stepped march, no easing

```tsx
<PixelBlocks size={14} count={5} variant="center" />
```

Props: `size` (block edge), `count`, `variant`.

### PixelBar

A segmented bar, fluid width, that works either way round:

```tsx
<PixelBar />                 {/* indeterminate: a lit comet marches across */}
<PixelBar value={0.55} />    {/* determinate: segments fill, the leading one blinks */}
```

Passing `value` switches the semantics too — the element becomes a
`role="progressbar"` with `aria-valuenow`, instead of a `role="status"`.

Props: `size` (segment height), `segments`, `value`.

### PixelPulse

A sparse field of pixel blocks breathing in two interleaved phases, sized to fill
its container. It wraps its own centred content, so it works as a page loader on
its own:

```tsx
<PixelPulse label="Loading page">
    <PixelHeart size={84} label="" />
</PixelPulse>

<PixelPulse overlay label="Loading page" />   {/* pinned over the viewport */}
```

The grid is two masked layers, not a checkerboard: crossed stripe masks intersect
into separated blocks so the surface stays quiet, peaking at 14% opacity.

Props: `children`, `cell`, `overlay`, `scrim`.

## Shared props

| Prop                   | Default     | Notes                                     |
| ---------------------- | ----------- | ----------------------------------------- |
| `label`                | `"Loading"` | Accessible name; `""` makes it decorative |
| `color`                | `#f4a04f`   | Any CSS colour                            |
| `speed`                | `1`         | Pace multiplier; `0` falls back to `1`    |
| `paused`               | `false`     | Hold the resting state                    |
| `respectReducedMotion` | `true`      | Honour `prefers-reduced-motion`           |
| `className` / `style`  | —           | Passed to the root                        |

## Accessibility

The root is `role="status"` with an accessible name, so a screen reader announces
the loading state once and politely. Every block inside is `aria-hidden`, so the
seventy pixels of a heart are never read out.

Pass `label=""` when the loader sits next to text that already says "Loading" —
the root becomes `aria-hidden` with no role, so nothing is announced twice. That
is also how to nest one loader inside another, as `PixelPulse` does with the heart.

`PixelBar` with a `value` reports real progress through `role="progressbar"`.

## Reduced motion

Under `prefers-reduced-motion: reduce`, or with `paused`, every animation is
removed rather than slowed, and each loader falls back to a composed resting
state: the heart at full opacity, the blocks at three-quarter strength, the bar
showing a short static fill, the pulse grid at a flat 9%. Loading semantics are
untouched, so the state is still announced.

No loader flashes faster than about 1Hz even at `speed={3}`, and none goes to full
black-on-white contrast, so nothing here is uncomfortable to sit next to.

## Performance

All motion is CSS `opacity` and `transform` — there is no JavaScript animation,
no timer and no state that changes while a loader runs; a test asserts that
rendering all four schedules no frames, intervals or timeouts.

DOM cost is a heart of 70 spans, a row of 5, a bar of 12, and a pulse of 2. The
pulse is the one to watch on a full page: it is two masked full-viewport layers,
so it costs a large composited paint, but only opacity animates.
