# Kern

A headline whose glyphs open up as the pointer passes: letter-spacing widens,
the glyph lifts, and a variable font's weight axis increases with proximity.
Real DOM text throughout.

```tsx
<Kern text="TYPESET" radius={200} spread={0.4} />
```

| Prop     | Default | Notes                                |
| -------- | ------- | ------------------------------------ |
| `text`   | —       | The word to render                   |
| `radius` | `160`   | Pointer influence radius, px         |
| `spread` | `0.34`  | Extra tracking at full influence, em |
| `lift`   | `12`    | Vertical rise, px                    |
| `weight` | `320`   | Added `wght` axis units              |
| `size`   | `88`    | Font size, px                        |

**Interaction.** Glyph centres are measured once and refreshed on resize. Each
frame writes one custom property per glyph, and the loop stops once every glyph
has settled.

**Reduced motion.** No listeners; glyphs render with normal tracking and weight.

**Performance.** Cost scales with character count, so this is intended for
headlines rather than paragraphs. Nothing is measured during pointer movement.

**Accessibility.** The full word is rendered once in a visually hidden span and
read normally; the per-glyph copies are `aria-hidden`.

**Limitations.** The weight axis only responds on variable fonts; with a static
font the spacing and lift still work. Long strings mean many DOM nodes.
