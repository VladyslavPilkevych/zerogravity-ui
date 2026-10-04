# Quartz

Film grain over anything.

```tsx
<Quartz>
    <Hero />
</Quartz>
```

## How it works

One noise tile is rendered to an offscreen canvas exactly once, handed to CSS as
a data URI, and repeated. A stepped animation nudges the background position, so
it flickers like film rather than sliding like a texture.

That is the whole component: no frame loop, no live turbulence filter, and no
per-frame paint. A `feTurbulence` field would cost a filter pass every frame for
a result nobody can tell apart at this size.

## Props

| Prop                   | Default        | Notes                                         |
| ---------------------- | -------------- | --------------------------------------------- |
| `children`             | —              | Whatever the grain sits over                  |
| `intensity`            | `0.35`         | How visible the grain is                      |
| `scale`                | `128`          | Tile size in px; larger reads as coarser      |
| `speed`                | `1`            | How fast the field shifts                     |
| `colour`               | `0`            | 0 monochrome, 1 coloured speckle              |
| `blend`                | `"soft-light"` | `soft-light`, `overlay`, `screen`, `multiply` |
| `seed`                 | `1`            | Fixes the tile                                |
| `disabled`             | `false`        | Hold the grain still                          |
| `respectReducedMotion` | `true`         | Honour `prefers-reduced-motion`               |

## Accessibility

The grain layer is `aria-hidden` with `pointer-events: none`, and the tile URL
never touches React state — it is written straight to the node. Under reduced
motion the grain holds still, which is what film does when the projector stops.
