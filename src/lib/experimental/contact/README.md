# Contact

A contact sheet you scrub through — with the pointer, or with the arrow keys.

```tsx
<Contact frames={frames} labels={labels} alt="A sunrise sequence" />
```

## How it works

Every frame is in the DOM, stacked and hidden except the current one, so
scrubbing never waits for a network request after the first pass. Pointer moves
are converted to a frame _index_, not a pixel — so a drag across the plate is
one state change per frame boundary, not one per move.

## Props

| Prop             | Default     | Notes                                     |
| ---------------- | ----------- | ----------------------------------------- |
| `frames`         | —           | The sequence, in order                    |
| `alt`            | —           | Describes the sequence as a whole         |
| `labels`         | —           | A label per frame, read out by the slider |
| `defaultFrame`   | `0`         | Which frame to rest on                    |
| `strip`          | `true`      | Show the film strip of thumbnails         |
| `aspect`         | `"3 / 2"`   | Locks the plate to a ratio                |
| `objectFit`      | `"cover"`   | `cover` or `contain`                      |
| `objectPosition` | `"50% 50%"` | Where each frame sits when cropped        |
| `radius`         | `14`        | Corner radius                             |
| `disabled`       | `false`     | Freeze on the resting frame               |
| `onFrameChange`  | —           | Called when the frame changes             |

## Accessibility

The plate is a `slider`: it has a name, a range, a current value, and an
`aria-valuetext` carrying the label of the frame it is on. Arrow keys step,
Home and End jump to either end, and it has a visible focus ring. Disabled takes
it out of the tab order and marks it `aria-disabled`.

Every frame image is `alt=""` and `aria-hidden` — the slider is what speaks, not
eight separate pictures. There is no animation here at all, so there is nothing
for reduced motion to turn off.
