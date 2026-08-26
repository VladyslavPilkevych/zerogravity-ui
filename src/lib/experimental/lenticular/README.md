# Lenticular

Two pictures interlaced under one lens. Move across it and the second one takes
over, strip by strip, exactly as a lenticular print does when you walk past it.

```tsx
<Lenticular frontSrc="/day.jpg" backSrc="/night.jpg" alt="A meadow, noon and night" />
```

## How it works

Both plates are stacked; the front one is cut into strips by a repeating mask
whose _duty cycle_ answers to the pointer. Wide open on one side of the card,
closed on the other, interlaced in between — so it is a striped handover rather
than a crossfade, and at either extreme you see one whole picture.

The lens ribbing and the sheen are two more gradients over the top. No canvas,
no filter, no JavaScript per strip.

## Props

| Prop                   | Default     | Notes                                         |
| ---------------------- | ----------- | --------------------------------------------- |
| `frontSrc`             | —           | The image seen from the left                  |
| `backSrc`              | —           | The image seen from the right                 |
| `alt`                  | —           | Describes the pair; one card, one description |
| `strips`               | `46`        | How many lens strips run across the card      |
| `tilt`                 | `7`         | How far the card leans, in degrees            |
| `sheen`                | `0.5`       | How bright the lens sheen is                  |
| `aspect`               | `"4 / 3"`   | Locks the card to a ratio                     |
| `objectPosition`       | `"50% 50%"` | Where both plates sit when cropped            |
| `radius`               | `16`        | Corner radius                                 |
| `disabled`             | `false`     | Hold the print head-on                        |
| `respectReducedMotion` | `true`      | Honour `prefers-reduced-motion`               |

## Accessibility

One `role="img"` with your `alt` over two `alt=""`, `aria-hidden` plates — a
screen reader meets one card with one description, never two pictures. A broken
source marks the card rather than leaving a blank hole.

Under reduced motion the print holds head-on, showing both pictures interlaced,
which is what a lenticular print actually looks like when nobody is moving.
