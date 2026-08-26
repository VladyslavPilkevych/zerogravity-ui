# Ink

A word that soaks into the paper instead of fading in.

```tsx
<Ink text="Ink" />
```

## How it works

The word is drawn to an offscreen stencil, which is then read back once to find
a couple of hundred seeded points inside the letterforms. Those are the fibres
that take the ink first: each one blooms outward on its own schedule, and the
letter itself arrives as the paper saturates.

Because the seed points are seeded, the same word soaks the same way every time.

## Props

| Prop                   | Default          | Notes                                              |
| ---------------------- | ---------------- | -------------------------------------------------- |
| `text`                 | —                | The word                                           |
| `color`                | `"#1b2a4a"`      | The ink                                            |
| `bleed`                | `0.5`            | How far it wicks past the stroke                   |
| `duration`             | `2.6`            | How long one soak takes, in seconds                |
| `feather`              | `0.6`            | How ragged the edge goes                           |
| `repeat`               | `6`              | Soak again after this many seconds; `0` soaks once |
| `fontFamily`           | `Georgia, serif` | The face                                           |
| `fontWeight`           | `700`            | Heavier faces hold more ink                        |
| `seed`                 | `12`             | Fixes where the ink takes                          |
| `disabled`             | `false`          | Show it fully soaked and hold                      |
| `respectReducedMotion` | `true`           | Honour `prefers-reduced-motion`                    |

## Accessibility

The word is always in the DOM as real, visually hidden text, so it is read,
searched and selected. The canvas is `aria-hidden`. Under reduced motion the
word is drawn fully soaked and holds — legible, complete, and not moving.
