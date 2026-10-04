# liquid

The wave engine behind [Undertow](../undertow) and [Wake](../wake). It is not a
component: it is a small, pure, time-driven ripple field with no DOM and no
canvas, so both surfaces disturb in the same language without either one owning
the simulation.

```ts
const field = createField()

// on every pointer move
trace(field, x, y, dt, RIPPLE_DEFAULTS)

// on every frame
stepField(field, dt * speed, RIPPLE_DEFAULTS)
for (const drop of field.drops) {
    if (!drop.live) continue
    const life = age(field, drop, RIPPLE_DEFAULTS) // 0 at birth, 1 spent
    const edge = edgeAt(drop, angle, reach, wobble, life)
}
```

## The field

`createField()` allocates `RIPPLE_CAPACITY` ripples once and never allocates
again. `strike` writes over the oldest slot, so a pointer held down for an hour
costs exactly what one held down for a second does. `liveCount` and `energy`
report what is currently in play.

`trace` is the one to call from a pointer handler. It strikes by **distance
travelled**, not by event, so a slow careful drag and a flick leave the same
trail at different speeds, and a high-rate pointer does not flood the pool. It
also carries pointer speed into `power`, which is what makes a fast pass hit
harder than a slow one.

`stepField` advances time and retires anything past `life`. Nothing else in the
engine touches the clock.

## The outline

`edgeAt` is what makes both surfaces read as liquid rather than as a lens. A
ripple is not a circle: two harmonics, phased off the ripple's own seed, push
and pull its outline, and the wobble relaxes as the ripple ages, so a fresh
disturbance is ragged and a spent one is nearly round.

```ts
const ring = Math.sin(angle * 3 + phase + life * 4) * 0.6 + Math.sin(angle * 5 - phase * 2) * 0.4
return reach * (1 + ring * wobble * (1 - life))
```

The seed is derived from the slot index, so nothing here is random and every
render agrees with every other one.

## coverBox

`coverBox(sourceW, sourceH, boxW, boxH, anchorX, anchorY)` is `object-fit: cover`
as arithmetic. Undertow draws two different images through it with identical
arguments, which is what guarantees the two can never drift apart by a pixel.

## Settings

| Setting   | Default | Notes                                                   |
| --------- | ------- | ------------------------------------------------------- |
| `radius`  | `0.28`  | Reach as a share of the shorter side                    |
| `life`    | `1.5`   | Seconds from birth to spent                             |
| `spacing` | `0.035` | Distance between strikes along a drag, in box fractions |
