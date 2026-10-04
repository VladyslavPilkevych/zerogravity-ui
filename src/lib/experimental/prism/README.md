# Prism

A slab of glass. It leans toward the pointer, throws a specular band under it,
and pushes a warm edge and a cool edge to opposite sides — the way light behaves
on its way through a wedge.

```tsx
<Prism>
    <Card />
</Prism>
```

## How it works

Three decorative layers over your content, all sharing the same corner radius:
a dispersion layer whose two coloured edges are pushed apart by however far the
slab is leaning, a specular layer that tracks the pointer, and a rim.

The pointer never reaches React. One listener on the root writes four custom
properties, damped on the shared frame clock, and CSS does the rest — so the
cost does not grow with what is inside the glass.

## Props

| Prop                   | Default | Notes                                     |
| ---------------------- | ------- | ----------------------------------------- |
| `children`             | —       | Whatever sits inside. Stays interactive   |
| `tilt`                 | `12`    | How far the slab leans, in degrees        |
| `dispersion`           | `0.6`   | How far the colours separate at the edges |
| `sheen`                | `0.7`   | How bright the specular band is           |
| `radius`               | `20`    | Corner radius; every layer shares it      |
| `disabled`             | `false` | Hold the slab flat                        |
| `respectReducedMotion` | `true`  | Honour `prefers-reduced-motion`           |

Every numeric prop is clamped before it reaches CSS, so a bad value cannot
produce a broken rule.

## Accessibility

All three effect layers are `aria-hidden` with `pointer-events: none`. Content
inside stays clickable, focusable and readable, and nothing is added to the
accessibility tree.

## Reduced motion

Under `prefers-reduced-motion: reduce`, or with `disabled`, the slab is flat and
the pointer is ignored. The glass is still glass — sheen, rim and dispersion are
all still drawn, just not moving.
