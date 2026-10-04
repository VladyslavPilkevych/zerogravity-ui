# Concertina

Panels hinged alternately — top, bottom, top — folding flat as they reach the
middle of the view and away again as they leave it, like a folded paper strip
opening as you scroll.

```tsx
<Concertina>
    <ConcertinaPanel>…</ConcertinaPanel>
    <ConcertinaPanel>…</ConcertinaPanel>
</Concertina>
```

## How it works

Each leaf's middle is measured against the scroll port, turned into a fold angle
between `-angle` and `+angle`, and written straight to the element as a
`rotateX` around alternating hinges. A shading layer over each leaf darkens in
proportion to how far it has turned, which is what sells the crease.

One scroll listener schedules one coalesced frame; React does not re-render
while you scroll.

## Props

| Prop                   | Default  | Notes                                                  |
| ---------------------- | -------- | ------------------------------------------------------ |
| `children`             | —        | One `ConcertinaPanel` per leaf                         |
| `scrollContainer`      | —        | Drive it from a scrollable element instead of the page |
| `height`               | `"62vh"` | How tall each leaf is                                  |
| `angle`                | `72`     | How far a leaf folds, in degrees                       |
| `depth`                | `1400`   | Perspective, in px                                     |
| `shade`                | `0.55`   | How dark a folded face goes                            |
| `disabled`             | `false`  | Lay every leaf flat                                    |
| `respectReducedMotion` | `true`   | Honour `prefers-reduced-motion`                        |

## Accessibility

Leaves are ordinary elements in document order, so reading order, tab order and
in-page search all match the screen. The shading layer is `aria-hidden`. Under
reduced motion nothing rotates and nothing is shaded: the leaves are plain
blocks, one after another.
