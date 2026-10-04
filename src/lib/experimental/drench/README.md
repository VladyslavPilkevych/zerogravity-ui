# Drench

A word that is not drawn until the rain finds it. The glyphs are invisible;
water falling down the pane collects on them, and the letters appear as wet
traces — not as text fading in.

```tsx
<Drench text="ZERO" />
```

## How it works

Three layers. A glyph layer holds the word as a stencil — an **outline**, not a
solid, so the letter itself is never drawn and what appears is its contour. A wet
layer accumulates every streak and bead the rain leaves behind. The wet layer is
then masked by the stencil with `destination-in`, so water only survives on that
contour, and the result is tinted with `source-atop`.

The stencil is also read back once to find the lowest lit pixel in each column —
the underside of every letter. Water gathers there, swells, lets go, and runs
down the frame leaving a streak, which is the part you actually watch.

Nothing animates the text's opacity. What changes is how much water is standing
on it: each frame drains the wet layer a little with `destination-out`, so a
letter that stops being rained on dries out and disappears again. Rain that falls
away from the word is drawn faintly on the scene and leaves nothing behind.

## Props

| Prop                   | Default                   | Notes                                 |
| ---------------------- | ------------------------- | ------------------------------------- |
| `text`                 | —                         | The word the rain finds               |
| `rain`                 | `0.55`                    | How many drops fall at once, 0 to 1   |
| `fall`                 | `1`                       | How fast they fall                    |
| `wetness`              | `0.6`                     | How much water a hit leaves behind    |
| `evaporation`          | `0.35`                    | How quickly it dries                  |
| `color`                | `"#9fd8ff"`               | The colour of the water on the glyphs |
| `fontFamily`           | `"system-ui, sans-serif"` | Face used for the stencil             |
| `fontWeight`           | `800`                     | Heavier faces hold more water         |
| `disabled`             | `false`                   | Hold the still, soaked state          |
| `respectReducedMotion` | `true`                    | Honour `prefers-reduced-motion`       |

Heavy weights read best: a thin face gives the water very little to cling to.

## Accessibility

The word is always in the DOM as real text — a visually hidden `<span>` — so it
is read, found by in-page search and selected by anything that walks the
document. The canvas is `aria-hidden`. The visual effect is a rendering of text
that is already there, never a replacement for it.

## Reduced motion

Under `prefers-reduced-motion: reduce`, or with `disabled`, the word is rendered
already soaked and standing still, using a fixed bead pattern rather than random
placement. It is legible, it is the same on every render, and no frame loop runs.

## Performance

One visible canvas plus two offscreen layers, a fixed pool of 160 drops — `rain`
decides how many of them are active, never how many exist — and one
`requestAnimationFrame`. The loop pauses offscreen and the stencil is re-rendered
only when the text, the face or the box changes.
