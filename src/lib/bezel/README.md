# Bezel

A frame for arbitrary content: stepped pixel corners, an optional mono label
tab, an optional 1px grid, and corner ticks that lock on with a single scan
line when the panel is hovered or focused within.

```tsx
import { Bezel } from "zerogravity"

;<Bezel label="Usage" grid>
    <UsageChart />
</Bezel>
```

| Prop      | Default | Notes                                                       |
| --------- | ------- | ----------------------------------------------------------- |
| `as`      | `"div"` | `div`, `section`, `article`, `aside`, `figure`, `nav`, `li` |
| `label`   | —       | Mono caps tab on the top edge, rendered as real text        |
| `tone`    | cyan    | Accent for the label, ticks and scan                        |
| `grid`    | `false` | 1px grid on the plate                                       |
| `ticks`   | `true`  | Corner brackets outside the frame                           |
| `scan`    | `true`  | Lock-on ticks and a scan line on hover and focus-within     |
| `notch`   | `4`     | Corner step, px; `0` gives square corners                   |
| `padding` | `20`    | Inner padding; numbers are pixels                           |

Every other attribute goes to the root element.

**Theming.** `--zg-bezel-accent`, `--zg-bezel-edge`, `--zg-bezel-surface`,
`--zg-bezel-grid`, `--zg-bezel-cell`, `--zg-bezel-ink` and `--zg-font-mono`.
Edge, surface and grid default to tints of `currentColor`, so the frame follows
light and dark text.

**Motion.** Pure CSS. The scan runs once per hover; nothing loops.

**Reduced motion.** Ticks and edge change colour without travel, and the scan
line does not run.

**Accessibility.** All frame layers are `aria-hidden`. The label is visible text
in reading order but does not name the element; for a landmark such as
`as="section"`, pass `aria-label` or `aria-labelledby`.

## Pixel vocabulary

Uses stepped corners with a true 1px stepped outline (`.zg-px-ring`), the 1px
grid, mono caps micro-labels and a stepped scan. See
`src/lib/internal/PIXEL.md`.
