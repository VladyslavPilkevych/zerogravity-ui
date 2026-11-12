# Tag

A small square status badge. Each status has its own 5×5 pixel glyph, so the
state reads without relying on colour; the live status blinks its ring.

```tsx
import { Tag } from "zerogravity"

<Tag status="success">Passing</Tag>
<Tag status="live">Live</Tag>
```

| Prop         | Default     | Notes                                                                 |
| ------------ | ----------- | --------------------------------------------------------------------- |
| `status`     | `"neutral"` | `"neutral"`, `"info"`, `"success"`, `"warning"`, `"danger"`, `"live"` |
| `variant`    | `"outline"` | `"outline"` or `"solid"`                                              |
| `appearance` | `"pixel"`   | `"pixel"`, `"classic"`, `"minimal"` or `"glass"`                      |
| `tone`       | —           | Override the status colour                                            |

Every other attribute goes to the `<span>`. `TAG_STATUSES` lists the statuses.

**Theming.** `--zg-tag-tone`, `--zg-tag-ink` (text on the solid variant) and
`--zg-font-mono`. Outline text inherits `color`.

**Appearance.** `appearance` is the visual style; it is not `variant`, which
already chose outline or solid before the styles existed. **Pixel** is the
square monospaced tag with its 5×5 glyph. **Classic** is a rounded pill,
**minimal** a dot and text, **glass** a translucent pill. The three trade the
glyph for a round status dot; the text carries the status in every look, and
`solid` combines with each of them.

**Reduced motion.** The live ring stops blinking and stays lit, and the live dot
stops pulsing.

**Accessibility.** The text is real text and the glyph is `aria-hidden`. Tag
is not a live region by default; pass `role="status"` only when its text
changes and the change should be announced.

## Pixel vocabulary

Uses crisp pixel glyphs (`shape-rendering: crispEdges`), mono caps, square
geometry and a `steps(1)` blink with a restrained glow. See
`src/lib/internal/PIXEL.md`.
