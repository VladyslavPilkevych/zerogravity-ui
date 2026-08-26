# Gnomon

The pointer becomes a lamp. Every direct child works out where that lamp is
relative to itself and casts its own shadow away from it, so a card on the left
and one on the right disagree about the direction — which is what makes the
light read as a place in the room rather than a global offset.

```tsx
<Gnomon>
    <Card />
    <Card />
    <Card />
</Gnomon>
```

## How it works

Each child's centre is measured once (and again on resize). Every frame, the
component writes three custom properties per child — direction and distance —
and CSS turns them into a `drop-shadow`. Children further from the lamp get a
longer, softer shadow.

Nothing here allocates per frame, nothing re-renders, and the per-child work is
capped at 60 children.

## Props

| Prop                   | Default     | Notes                                   |
| ---------------------- | ----------- | --------------------------------------- |
| `children`             | —           | Each direct child casts its own shadow  |
| `distance`             | `28`        | How far a shadow is thrown, in px       |
| `softness`             | `30`        | How soft it is, in px                   |
| `depth`                | `0.55`      | How dark it is, 0 to 1                  |
| `color`                | `"#05070f"` | The shadow's colour                     |
| `lift`                 | `true`      | Children lean slightly toward the light |
| `disabled`             | `false`     | Pin the light where it started          |
| `respectReducedMotion` | `true`      | Honour `prefers-reduced-motion`         |

## Where it works

A shadow needs somewhere to fall. On a near-black surface there is nothing to
darken, so put this on a light or mid-tone background.

## Accessibility

Nothing is added to the accessibility tree; the effect is a filter on content
that was already there. Under `prefers-reduced-motion: reduce` the light holds
its resting position and the lift is dropped, so the shadows are still drawn but
never move.
