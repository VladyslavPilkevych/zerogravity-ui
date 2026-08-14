# SplitFlap

An airport departure board. Each cell is split across the middle and flips one
character at a time until it reaches its target, with a stagger so the word
resolves left to right.

```tsx
import { SplitFlap } from "@/lib/split-flap"

export function Board() {
    return <SplitFlap value="DEPARTURES" />
}
```

## Props

| Prop                 | Type                               | Default            |                                                                     |
| -------------------- | ---------------------------------- | ------------------ | ------------------------------------------------------------------- |
| `value`              | string                             | `""`               | Text to display, used when `mode` is `"text"`                       |
| `mode`               | `"text" \| "clock" \| "countdown"` | `"text"`           | `clock` shows the current time, `countdown` counts down to `target` |
| `target`             | number                             |                    | Epoch milliseconds the countdown runs to                            |
| `length`             | number                             |                    | Fixed cell count; defaults to the length of the value               |
| `alphabet`           | string                             | letters or digits  | Characters the flap cycles through                                  |
| `stepDuration`       | number                             | `55`               | Milliseconds per character step                                     |
| `stagger`            | number                             | `45`               | Delay added per cell, in milliseconds                               |
| `gap`                | number                             | `4`                | Space between cells, px                                             |
| `charWidth`          | number                             | `44`               | Cell width, px                                                      |
| `charHeight`         | number                             | `64`               | Cell height, px                                                     |
| `fontSize`           | number                             | `34`               | px                                                                  |
| `color`              | string                             | `"#f5f5f7"`        | Character colour                                                    |
| `background`         | string                             | `"#141419"`        | Cell colour                                                         |
| `seamColor`          | string                             | `rgba(0,0,0,0.55)` | Colour of the split line                                            |
| `radius`             | number                             | `6`                | Cell corner radius, px                                              |
| `className`, `style` |                                    |                    | Applied to the board                                                |
| `onSettled`          | `(value: string) => void`          |                    | Fires when the rendered text changes                                |

Characters outside the alphabet render as blanks, and the value is padded or
truncated to `length`.

## Behaviour

A cell steps forward through the alphabet one character per `stepDuration` until
it reaches its target, so the distance between two characters decides how long
the flip takes. The stagger applies only to the first step of each cell, not to
every step, which is what makes the board resolve as a wave rather than a crawl.

## Accessibility

The board is a single `role="img"` labelled with the trimmed text, so a screen
reader announces the word once instead of spelling out every cell. Under
`prefers-reduced-motion: reduce` no timers are scheduled at all: cells render
their target character immediately and the falling leaf is hidden.

## Performance

Each cell owns one `setTimeout` chain and clears it on unmount or when the
target changes. The flip itself is a CSS keyframe animation on `transform`, so
it runs off the main thread. Nothing polls: in `text` mode the component is
completely idle once the word has settled, and `clock`/`countdown` modes tick
once per second.
