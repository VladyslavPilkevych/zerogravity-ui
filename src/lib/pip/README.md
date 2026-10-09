# Pip

A small square status badge. Each status has its own 5×5 pixel glyph, so the
state reads without relying on colour; the live status blinks its ring.

```tsx
import { Pip } from "zerogravity"

<Pip status="success">Passing</Pip>
<Pip status="live">Live</Pip>
```

| Prop      | Default     | Notes                                                                 |
| --------- | ----------- | --------------------------------------------------------------------- |
| `status`  | `"neutral"` | `"neutral"`, `"info"`, `"success"`, `"warning"`, `"danger"`, `"live"` |
| `variant` | `"outline"` | `"outline"` or `"solid"`                                              |
| `tone`    | —           | Override the status colour                                            |

Every other attribute goes to the `<span>`. `PIP_STATUSES` lists the statuses.

**Theming.** `--zg-pip-tone`, `--zg-pip-ink` (text on the solid variant) and
`--zg-font-mono`. Outline text inherits `color`.

**Reduced motion.** The live ring stops blinking and stays lit.

**Accessibility.** The text is real text and the glyph is `aria-hidden`. Pip
is not a live region by default; pass `role="status"` only when its text
changes and the change should be announced.

## Pixel vocabulary

Uses crisp pixel glyphs (`shape-rendering: crispEdges`), mono caps, square
geometry and a `steps(1)` blink with a restrained glow. See
`src/lib/internal/PIXEL.md`.
