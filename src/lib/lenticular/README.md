# Lenticular

Two pictures interlaced under one lens. Move across it and the second one takes
over, strip by strip, exactly as a lenticular print does when you walk past it.

```tsx
import { Lenticular } from "zerogravity/lenticular"

export function Print() {
    return <Lenticular frontSrc="/day.jpg" backSrc="/night.jpg" alt="A meadow, noon and night" />
}
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
A pointer past either edge counts as that edge. The print keeps whichever side
the pointer left it on, and the frame loop stops once it has settled. The card
is measured once and again after a scroll, a window resize or a resize of the
card itself, so pointer moves read no layout.

On touch screens the card sets `touch-action: pan-y pinch-zoom`: a tap or a
sideways drag scrubs the print, while vertical scrolling and pinch-zoom still
work. Pass `position` to drive the print from your own control (a slider, a
scroll position) instead; the pointer is then ignored.

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
screen reader meets one card with one description, never two pictures, whichever
one is showing. Write `alt` so it covers both, for example "A meadow at noon,
and the same meadow at night". A broken source marks the card rather than
leaving a blank hole.

The card is not focusable and has no keyboard control of its own: the swap is a
visual flourish and the description already carries both pictures. If seeing
the second picture matters, pair it with a real control and pass `position`.

Under reduced motion the card never tilts and nothing eases or moves on its own:
it starts head-on, showing both pictures interlaced, and the swap follows the
pointer directly, so either picture can still be seen in full. `disabled` holds
the print head-on and ignores the pointer altogether.
