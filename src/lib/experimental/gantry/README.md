# Gantry

A rail of cards that travels sideways while the page scrolls down, leaning into
the direction of travel.

```tsx
<Gantry>
    <Card />
    <Card />
</Gantry>
```

## How it works

The track is as tall as the stage plus however much travel `pace` asks for, and
the stage inside it is sticky. One scroll listener converts progress into a
single `translate3d` on the rail, plus a lean derived from how fast the rail is
moving right now — clamped, so a jump in scroll position cannot throw the cards
on their side.

Travel is measured in stages rather than viewports, so driving it from an
internal scroll container behaves exactly like driving it from the page.

## Props

| Prop                   | Default                     | Notes                                     |
| ---------------------- | --------------------------- | ----------------------------------------- |
| `children`             | —                           | One card per stop along the rail          |
| `scrollContainer`      | —                           | Drive it from a scrollable element        |
| `height`               | `"80vh"`                    | How tall the pinned stage is              |
| `itemWidth`            | `clamp(220px, 32vw, 420px)` | The width of one car                      |
| `gap`                  | `"24px"`                    | Between cars                              |
| `pace`                 | `1`                         | How much scroll one stage of travel costs |
| `lean`                 | `6`                         | How far cars lean, in degrees             |
| `label`                | `"Horizontal gallery"`      | Names the rail once it becomes a scroller |
| `onProgress`           | —                           | Called with 0 to 1 as the rail travels    |
| `disabled`             | `false`                     | Drop the pinning                          |
| `respectReducedMotion` | `true`                      | Honour `prefers-reduced-motion`           |

## Accessibility

Cards are ordinary elements in document order. Under reduced motion the pinning
is dropped and the rail becomes a real horizontal scroller — so it is given a
`region` role, a label and a tab stop, because a scrollable region that the
keyboard cannot reach is a scrollable region nobody can use.
