# Seam

A section divider made of pixel blocks, with an optional centred label and an
optional travelling pulse. Pure CSS.

```tsx
import { Seam } from "zerogravity"

<Seam />
<Seam pattern="dither" label="Part two" tone="#9d7bff" />
```

| Prop         | Default        | Notes                                                   |
| ------------ | -------------- | ------------------------------------------------------- |
| `pattern`    | `"dash"`       | `"dash"`, `"stair"`, `"dither"` or `"pulse"`            |
| `tone`       | `currentColor` | Block colour                                            |
| `cell`       | `4`            | Block size, px                                          |
| `animated`   | —              | Travelling pulse; on by default only for `"pulse"`      |
| `speed`      | `3.2`          | Seconds per pass of the pulse                           |
| `label`      | —              | Centred mono caption; a string also names the separator |
| `decorative` | `false`        | `aria-hidden` instead of `role="separator"`             |

**Theming.** `--zg-seam-tone`, `--zg-seam-cell`, `--zg-seam-speed`,
`--zg-seam-ink` (label colour) and `--zg-font-mono`.

**Motion.** The pulse is one `steps()` keyframe on a pseudo-element, masked by
the block pattern so only whole blocks light up.

**Reduced motion.** The pulse is removed; the pattern stays.

**Accessibility.** `role="separator"` with horizontal orientation by default.
Use `decorative` when the divider adds nothing for assistive technology.

## Pixel vocabulary

Uses blocks with gaps, stepped lighting (the dither fade drops in hard bands)
and stepped travel. See `src/lib/internal/PIXEL.md`.
