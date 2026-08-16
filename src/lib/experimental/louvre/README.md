# Louvre

A sticky scroll transition between two full sections. Section A is shown on
slats that rotate away as you scroll, revealing Section B behind them.

```tsx
<Louvre front={<SectionA />} back={<SectionB />} />
```

| Prop           | Default        | Notes                                     |
| -------------- | -------------- | ----------------------------------------- |
| `front`        | —              | Content shown before the transition       |
| `back`         | —              | Content revealed behind the blinds        |
| `slats`        | `10`           | Number of blinds                          |
| `orientation`  | `"horizontal"` | Rotate on X or Y                          |
| `scrollLength` | `"260vh"`      | Scroll distance the sticky phase occupies |
| `phase`        | `0.55`         | Wave offset so slats open in sequence     |
| `perspective`  | `1400`         | 3D depth, px                              |
| `gap`          | `0`            | Space between slats, px                   |
| `shade`        | `0.55`         | Shadow applied to a slat as it rotates    |

**How it works.** The root reserves `scrollLength` of scroll; inside it a sticky
viewport pins the scene. Scroll progress writes one `--louvre-progress` custom
property and every slat derives its own rotation from that value plus its index,
so slat count does not affect per-frame cost.

Each slat contains a copy of `front` offset so the slices reconstruct the section
when closed.

**Reduced motion.** No sticky phase and no blinds: `back` renders directly in
normal flow, which is the end state of the transition.

**Performance.** One passive scroll listener coalesced into a single rAF, one
custom property write per frame, and the value is only written when it changes by
more than 0.001. No layout reads during scrolling beyond the root rect.

**Accessibility.** Only the first copy of `front` is live; the remaining copies
are `inert`, so duplicated interactive content is neither focusable nor announced.
`back` is `inert` until the transition passes its midpoint, so exactly one of the
two sections is reachable at a time. Reading order follows `back` then `front`.

**Limitations.** `front` is duplicated once per slat, so keep it reasonably light
and avoid many slats with heavy media. The sticky viewport is `100vh`, so `front`
and `back` should be designed for a full screen.
