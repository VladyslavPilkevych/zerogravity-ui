# Chroma

A drag trail whose colour channels cannot keep up with each other. Each channel
is pushed sideways off the path and read a couple of samples behind the others,
so the three separate as you move and converge back to white when you stop.

```tsx
<Chroma>
    <Surface />
</Chroma>
```

## How it works

Pointer samples go into a ring buffer of 90 slots — a drag held for an hour
costs exactly what a flick costs. Each frame the component strokes one
continuous ribbon per channel, with a gradient from the head's colour to
transparent at the tail, composited additively.

The sideways push scales with pointer speed, so a slow drag stays tight and a
fast one splits wide. A gap larger than half the box is treated as a jump, not a
stroke, so re-entering the surface does not draw a line across it.

## Props

| Prop                   | Default         | Notes                                 |
| ---------------------- | --------------- | ------------------------------------- |
| `children`             | —               | The surface the trail is drawn over   |
| `split`                | `16`            | How far the channels separate, in px  |
| `width`                | `26`            | How wide the smear is, in px          |
| `linger`               | `0.7`           | How long a trail survives, in seconds |
| `colors`               | `CHROMA_COLORS` | The three channels                    |
| `enableOnTouch`        | `true`          | Answer a finger as well as a pointer  |
| `disabled`             | `false`         | No trail at all                       |
| `respectReducedMotion` | `true`          | Honour `prefers-reduced-motion`       |

## Accessibility

The trail is an `aria-hidden` canvas with `pointer-events: none`, so everything
underneath stays clickable and focusable. Under reduced motion the canvas is not
drawn at all — a chromatic smear is exactly the kind of motion that setting is
asking you to drop.
