# Peel

The sheet on top lifts off the one underneath as the section scrolls past —
cut back along a diagonal, lifted at the corner, with light gathering along the
crease.

```tsx
import { Peel } from "zerogravity/peel"

;<Peel front={<Cover />} back={<Underneath />} />
```

## The sequence

The stage pins, and the scroll it is pinned for is split into three phases,
each measured in stage heights (`1` is one `height` of scroll, so a full
viewport with the default `100vh`):

1. **Lead** — the cover sits still, so the reader sees what is about to go.
2. **Travel** — the sheet peels off, eased at both ends so the lift starts and
   lands gently.
3. **Hold** — the layer underneath is fully uncovered and stays pinned for a
   moment before the page moves on.

```tsx
<Peel lead={0.1} travel={0.7} hold={0.2} front={...} back={...} />   // short
<Peel front={...} back={...} />                                       // normal
<Peel lead={0.5} travel={2.6} hold={1} front={...} back={...} />     // cinematic
```

`lead` and `hold` take 0 to 3, `travel` 0.2 to 5; anything outside is clamped
and a non-number falls back to the default. `hold` is the same pinned
pause, in the same unit, as Gantry's.

The track is `height × (1 + lead + travel + hold)` tall. The current phase is
on the track as `data-phase` — `before`, `moving`, `holding` or `after` — for
styling and tests.

## How it works

A scroll listener wakes the shared frame clock, which eases the lift towards
the scroll position and stops as soon as it has landed. It writes a single
custom property, `--pe-lift`, and CSS does everything else: the `clip-path`
that cuts the sheet back, the transform that lifts it, and the gradient that
shades the crease. Which corner lifts is a data attribute, so all four are the
same machinery.

Pass `progress` to drive the lift yourself — from your own scroll library, a
slider or a story. Scroll is then ignored, the lift jumps straight to the value
(smooth it on your side if you need to) and `data-phase` follows it. The track
keeps its pinned length, so the section still scrolls the same distance.

## Props

| Prop                   | Default       | Notes                                                      |
| ---------------------- | ------------- | ---------------------------------------------------------- |
| `front`                | —             | The sheet on top, the one that lifts away                  |
| `back`                 | —             | What is underneath it                                      |
| `scrollContainer`      | —             | Drive it from a scrollable element                         |
| `corner`               | `"top-right"` | Which corner lifts first                                   |
| `height`               | `"100vh"`     | How tall the pinned stage is                               |
| `lead`                 | `0.25`        | Pinned scroll before the peel starts, 0 to 3 stage heights |
| `travel`               | `1.5`         | Scroll the peel takes, 0.2 to 5 stage heights              |
| `hold`                 | `0.5`         | Pinned scroll on the uncovered layer, 0 to 3 stage heights |
| `progress`             | —             | Set the lift yourself, 0 to 1; scroll is then ignored      |
| `curl`                 | `0.7`         | How hard the crease shades the sheet, 0 to 1               |
| `disabled`             | `false`       | Drop the peel entirely                                     |
| `respectReducedMotion` | `true`        | Honour `prefers-reduced-motion`                            |

## Accessibility

Both layers are always in the document, so the content underneath is readable
and searchable before it is uncovered. The crease is `aria-hidden`.

Under reduced motion the pinning is dropped altogether: the cover and then the
layer underneath become ordinary blocks down the page, each at its natural
height, with no clipping and no transform. Nothing is ever hidden.
