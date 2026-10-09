# Keycap

A native `<button>` drawn as a pixel keycap: notched corners, a hard cast
shadow it presses into, and a dithered block sweep on hover and focus.

```tsx
import { Keycap } from "zerogravity"

<Keycap onClick={save}>Save</Keycap>
<Keycap variant="outline" tone="#ff5fa2">Delete</Keycap>
```

| Prop      | Default    | Notes                                     |
| --------- | ---------- | ----------------------------------------- |
| `variant` | `"solid"`  | `"solid"`, `"outline"` or `"ghost"`       |
| `size`    | `"md"`     | `"sm"`, `"md"` or `"lg"`                  |
| `tone`    | cyan       | Accent colour; sets `--zg-keycap-accent`  |
| `depth`   | `4`        | Cast shadow offset and press travel, px   |
| `notch`   | `3`        | Corner step, px; `0` gives square corners |
| `type`    | `"button"` | Never submits a form unless you ask it to |

Every other button attribute and `ref` go to the `<button>`.

**Theming.** `--zg-keycap-accent`, `--zg-keycap-ink` (text on the solid
variant) and `--zg-font-mono`. Outline and ghost text inherit `color`, so they
work on light and dark surfaces.

**Geometry.** The cast shadow extends `depth` pixels to the right and below
the box without taking layout space; leave room for it in tight rows.

**Reduced motion.** Hover, focus and press states still apply, without the
stepped transitions.

**Accessibility.** Native button semantics, keyboard activation and disabled
behaviour. The focus ring is a 2px outline outside the notched shape. The
shadow and edge layers are `aria-hidden`.

## Pixel vocabulary

Uses stepped corners (`.zg-px-notch`, `.zg-px-ring`), press depth with a hard
offset shadow, `steps()` transitions and a dithered block sweep. See
`src/lib/internal/PIXEL.md`.
