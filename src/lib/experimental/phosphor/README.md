# Phosphor

Type burned into a tube: bloom, a shadow mask, three guns that do not quite
agree, and the occasional roll.

```tsx
<Phosphor text="PHOSPHOR" as="h2" />
```

## How it works

Entirely CSS. The text is drawn once in the phosphor colour with two layered
text shadows for the bloom; two `aria-hidden` copies sit behind it in red and
blue, offset by the beam misalignment; and a repeating gradient in front is the
shadow mask, drifting by exactly one pitch so it never appears to jump.

There is no canvas and no frame loop at all — the whole component is markup and
two keyframes.

## Props

| Prop                   | Default     | Notes                                   |
| ---------------------- | ----------- | --------------------------------------- |
| `text`                 | —           | The line                                |
| `color`                | `"#54ffbe"` | The phosphor                            |
| `bloom`                | `0.6`       | How hard it glows                       |
| `scanline`             | `4`         | Mask pitch in px; `0` turns it off      |
| `fringe`               | `2`         | How far the beam misaligns, in px       |
| `jitter`               | `0.4`       | How much the picture rolls and flickers |
| `as`                   | `"span"`    | The tag the text is rendered as         |
| `disabled`             | `false`     | Hold a steady picture                   |
| `respectReducedMotion` | `true`      | Honour `prefers-reduced-motion`         |

## Accessibility

The text is announced once; both ghost guns are `aria-hidden`, as is the mask.
Under reduced motion the roll and the mask drift both stop, and what is left is
a steady, perfectly legible CRT — which is the point: the still state is a
design, not an absence.
