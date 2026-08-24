# Overprint

Text printed as overlapping colour separations that drift out of register while
the page scrolls and pull back together when it stops — a misprinted poster that
corrects itself.

```tsx
<Overprint text="MISREGISTER" inks={["#00b7c8", "#e6007e", "#ffd400"]} />
```

| Prop              | Default             | Notes                    |
| ----------------- | ------------------- | ------------------------ |
| `text`            | —                   | The word to print        |
| `inks`            | cyan/magenta/yellow | One plate per colour     |
| `spread`          | `10`                | Maximum plate offset, px |
| `converge`        | `5`                 | How fast plates realign  |
| `size` / `weight` | `96` / `800`        | Type scale               |
| `blend`           | `"screen"`          | Plate blend mode         |

**Interaction.** Scroll velocity drives the offset; a single rAF loop converges
the plates and stops when they are aligned.

**Reduced motion.** A fixed, pleasant offset is kept and the loop never runs, so
the misprint reads as a deliberate style rather than an animation.

**Performance.** One custom property write per frame regardless of plate count.
Plate offsets are pure CSS transforms.

**Accessibility.** One real text node carries the content; every ink plate is
`aria-hidden`.

**Limitations.** `screen` blending needs a dark background to look right; on
light backgrounds switch `blend` to `multiply`.
