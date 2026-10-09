# Gantry

A rail of cards that travels sideways while the page scrolls down, resting on
each card in turn and leaning into the direction of travel.

```tsx
<Gantry>
    <Card />
    <Card />
</Gantry>
```

## The sequence

The stage pins and the rail moves one stop at a time, where a stop lines the
next card up with the start of the window. Each stop costs `pace` stage heights
of scroll: the rail rests for part of it and moves for the `transition` share,
centred, so the first and the last card get a rest too. After the last stop the
stage stays pinned for `hold` before the page moves on.

```tsx
<Gantry pace={0.4} transition={0.8} hold={0.15}>…</Gantry>   // short
<Gantry>…</Gantry>                                            // normal
<Gantry pace={1.2} transition={0.45} hold={0.8}>…</Gantry>   // cinematic
```

A last step shorter than half a card is folded into the one before it, so the
reader never spends a whole stop of scroll on a nudge.

The current stop is on the track as `data-stop`, and the phase as `data-phase`
— `before`, `moving`, `holding` or `after`.

## How it works

The stops are measured from the cars' layout positions on mount and on
resize. A scroll listener wakes the shared frame clock, which eases the rail
towards its target and goes idle as soon as it has landed, so a fast flick
glides rather than jumps. The lean comes from how fast the rail is actually
moving, clamped, and returns to zero when it settles.

Travel is measured in stages rather than viewports, so driving it from an
internal scroll container behaves exactly like driving it from the page.

Pass `progress` to place the rail yourself, 0 to 1 along it. Scroll is then
ignored.

## Props

| Prop                   | Default                     | Notes                                                   |
| ---------------------- | --------------------------- | ------------------------------------------------------- |
| `children`             | —                           | One card per stop along the rail                        |
| `scrollContainer`      | —                           | Drive it from a scrollable element                      |
| `height`               | `"80vh"`                    | How tall the pinned stage is                            |
| `itemWidth`            | `clamp(220px, 32vw, 420px)` | The width of one car                                    |
| `gap`                  | `"24px"`                    | Between cars                                            |
| `pace`                 | `0.7`                       | Scroll per stop, in stage heights                       |
| `transition`           | `0.55`                      | Share of each stop spent moving, 0.1 to 1               |
| `hold`                 | `0.4`                       | Pinned scroll on the last card, in stage heights        |
| `easing`               | `"smooth"`                  | Curve of each move: `"smooth"` or `"linear"`            |
| `progress`             | —                           | Place the rail yourself, 0 to 1; scroll is then ignored |
| `lean`                 | `6`                         | How far cars lean, in degrees                           |
| `label`                | `"Horizontal gallery"`      | Names the rail once it becomes a scroller               |
| `onProgress`           | —                           | Called with 0 to 1 as the rail travels                  |
| `disabled`             | `false`                     | Drop the pinning                                        |
| `respectReducedMotion` | `true`                      | Honour `prefers-reduced-motion`                         |

## Accessibility

Cards are ordinary elements in document order. Under reduced motion the pinning
is dropped and the rail becomes a real horizontal scroller — so it is given a
`region` role, a label and a tab stop, because a scrollable region that the
keyboard cannot reach is a scrollable region nobody can use.
