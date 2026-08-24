# Lodestone

A button that leans toward the pointer as it approaches and springs back when it
leaves. The pull is local to the button, distance-weighted, and clamped so the
control never chases the cursor.

```tsx
<Lodestone onClick={submit}>Get started</Lodestone>
```

| Prop              | Default | Notes                                              |
| ----------------- | ------- | -------------------------------------------------- |
| `radius`          | `130`   | Influence radius around the button, px             |
| `strength`        | `0.32`  | Fraction of the pointer offset applied as pull     |
| `maxDisplacement` | `16`    | Hard clamp on displacement, px                     |
| `minGap`          | `12`    | Space always kept between neighbouring buttons, px |
| `release`         | `0.16`  | Spring rate back to rest                           |
| `lift`            | `0.04`  | Scale added at full displacement                   |
| `disabled`        | `false` | Native disabled state; also stops the magnet       |

Every other prop is forwarded to the underlying `<button>`, so `onClick`,
`type`, `aria-*`, `form` and the rest behave normally.

**Interaction.** A window-level `pointermove` listener measures distance to the
button centre. Outside `radius` nothing happens and no frames are scheduled.
Inside it, a smoothstep falloff sets a target and one rAF loop springs toward it,
stopping as soon as the button is at rest.

**Overlap.** Buttons in the same parent register with each other and each one
constrains its own displacement against its neighbours' rest bounds, inflated by
`minGap`. The constraint is a swept-rectangle test: it finds how far along the
desired direction the button can travel before contact and scales the movement to
just short of it. A button therefore slows and stops as it approaches a
neighbour instead of sliding over it, and moves freely in directions where there
is room. Nothing reorders, no layout box moves, and only transforms are used.

**Reduced motion.** No listener, no loop, no transform — a normal polished button.

**Performance.** No permanent loop: frames run only while the button is moving.
The bounding box is cached and invalidated on scroll and resize, so pointer
events never force layout.

**Accessibility.** It is a real `<button>`. Focus, `focus-visible`, Enter/Space,
and the disabled state all work without pointer involvement. The magnet uses
`transform` only, so surrounding layout never shifts, and the label is
`pointer-events: none` so clicks always land on the button.

**Limitations.** Constraints are evaluated against neighbours' rest positions
rather than their live positions, which is stable and avoids feedback loops but
means two buttons both pulled hard toward the same point can end up closer than
`minGap` to each other's _current_ edges. With the default strength this is not
reachable. Only siblings inside the same parent element are considered.
