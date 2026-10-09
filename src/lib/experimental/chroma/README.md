# Chroma

A soft chromatic cursor trail. It follows the pointer as one continuous, blurred
comet that shifts from pink through violet to cyan as it ages, tapers toward the
tail and fades out within a fraction of a second.

```tsx
<Chroma>
    <Surface />
</Chroma>
```

## How it works

Pointer samples go into a ring buffer of 64 slots (`CHROMA_SAMPLES`), so a
pointer moving for an hour costs exactly what a flick costs. Samples closer than
a few pixels move the newest one instead of adding another.

Each frame the samples are joined by a centripetal Catmull-Rom curve, split
finely enough that a fast flick between two far-apart samples still draws one
smooth, unbroken line. The curve is filled as a tapering ribbon, one quad per
pair of points, with a brighter core on top; the whole canvas is softened with a
CSS blur.

The frame loop starts on the first move and stops as soon as the last sample has
faded. When the pointer leaves, the trail decays out on its own, and the next
entry starts a new stroke rather than drawing a line across the surface.

## Props

| Prop                   | Default         | Notes                                                |
| ---------------------- | --------------- | ---------------------------------------------------- |
| `children`             | —               | The surface the trail is drawn over                  |
| `width`                | `24`            | Width at the pointer, in px                          |
| `blur`                 | `12`            | Edge softness, in px                                 |
| `decay`                | `0.6`           | Seconds a point of the trail takes to fade           |
| `colors`               | `CHROMA_COLORS` | Fresh, middle and faded tint, any CSS colour         |
| `paused`               | `false`         | Time advances one frame per sample, never on its own |
| `disabled`             | `false`         | No trail at all                                      |
| `respectReducedMotion` | `true`          | Honour `prefers-reduced-motion`                      |

## Accessibility

The trail is an `aria-hidden` canvas with `pointer-events: none`, so everything
underneath stays clickable and focusable. Under reduced motion there is no trail
and nothing animates: a single soft glow sits under the pointer and disappears
when it leaves.
