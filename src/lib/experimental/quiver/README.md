# Quiver

A crest that travels along a line of type, lifting and turning letters as it
passes.

```tsx
<Quiver text="Quiver" as="h2" />
```

## How it works

Each character is its own span carrying one number: where it sits along the line.
The component writes a single custom property — where the crest is — and CSS
works out each letter's distance from it, its falloff, its lift and its turn.

That means a moving wave costs exactly one property write per frame however long
the word is, and no letter has a listener, a timer or a style of its own.

## Props

| Prop                   | Default  | Notes                                           |
| ---------------------- | -------- | ----------------------------------------------- |
| `text`                 | —        | The line                                        |
| `lift`                 | `18`     | How far a letter rises at the crest, in px      |
| `width`                | `0.22`   | How wide the crest is, as a share of the line   |
| `twist`                | `12`     | How far a letter turns, in degrees              |
| `ambient`              | `true`   | Keep a wave travelling when nothing is pointing |
| `as`                   | `"span"` | The tag the text is rendered as                 |
| `disabled`             | `false`  | Hold the line flat                              |
| `respectReducedMotion` | `true`   | Honour `prefers-reduced-motion`                 |

## Accessibility

The line carries an `aria-label` with the whole string and every per-letter span
is `aria-hidden`, so assistive technology meets one word rather than a column of
single characters. Under reduced motion the line is flat and no wave runs.
