# Lenticular

Two pictures interlaced under one lens. Move across it and the second one takes
over, strip by strip, exactly as a lenticular print does when you walk past it.

```tsx
<Lenticular frontSrc="/day.jpg" backSrc="/night.jpg" alt="A meadow, noon and night" />
```

## How it works

Both plates are stacked; the front one is cut into strips by a repeating mask.
The pointer's position across the card maps to a lens mix:

| Pointer   | What you see                                     |
| --------- | ------------------------------------------------ |
| 0 – 20%   | The first picture alone, no seams from the other |
| 20 – 80%  | The two interlaced, eased with a smoothstep      |
| 80 – 100% | The second picture alone                         |

Inside the middle band the strips' duty cycle follows the mix, so the handover
is striped rather than a crossfade. Toward either edge the gaps are filled in
and the front plate fades out entirely, so neither extreme keeps a trace of the
other picture. The mapping lives in `lens.ts` as a pure function.

The lens ribbing is strongest mid-swap and only a faint texture at the edges.
The print keeps whichever side the pointer left it on, and the frame loop stops
once it has settled. On touch screens a horizontal drag or a tap scrubs the
print and vertical scrolling still works.

## Props

| Prop                   | Default     | Notes                                          |
| ---------------------- | ----------- | ---------------------------------------------- |
| `frontSrc`             | —           | The image seen from the left                   |
| `backSrc`              | —           | The image seen from the right                  |
| `alt`                  | —           | Describes the pair; one card, one description  |
| `strips`               | `46`        | How many lens strips run across the card       |
| `tilt`                 | `7`         | How far the card leans, in degrees             |
| `sheen`                | `0.5`       | How bright the lens sheen is                   |
| `aspect`               | `"4 / 3"`   | Locks the card to a ratio                      |
| `objectPosition`       | `"50% 50%"` | Where both plates sit when cropped             |
| `radius`               | `16`        | Corner radius                                  |
| `position`             | —           | Holds the print at 0–1 and ignores the pointer |
| `disabled`             | `false`     | Hold the print head-on                         |
| `respectReducedMotion` | `true`      | Honour `prefers-reduced-motion`                |

## Accessibility

One `role="img"` with your `alt` over two `alt=""`, `aria-hidden` plates — a
screen reader meets one card with one description, never two pictures. A broken
source marks the card rather than leaving a blank hole.

Under reduced motion the print holds head-on, showing both pictures interlaced,
which is what a lenticular print actually looks like when nobody is moving.
