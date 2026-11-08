# Halo

A phrase set evenly around a full circle that turns slowly, with an optional
centre — a logo, an image, a button.

```tsx
<Halo text="Scroll to explore">
    <ArrowDown />
</Halo>
```

| Prop                   | Type                            | Default     |                                                |
| ---------------------- | ------------------------------- | ----------- | ---------------------------------------------- |
| `text`                 | string                          | —           | The phrase; its accessible name                |
| `repeat`               | number                          | `2`         | Copies around one turn, 1 to 12                |
| `separator`            | string                          | `" • "`     | Placed after every copy, the last one too      |
| `size`                 | number                          | `200`       | px diameter; shrinks to fit narrow containers  |
| `fontSize`             | number                          | fitted      | px at full size; fitted to the ring if omitted |
| `spin`                 | boolean                         | `true`      |                                                |
| `duration`             | number                          | `20`        | Seconds per turn                               |
| `direction`            | `clockwise \| counterclockwise` | `clockwise` |                                                |
| `paused`               | boolean                         | `false`     | Hold the ring where it is                      |
| `pauseOnHover`         | boolean                         | `false`     | Also pauses while the centre has focus         |
| `children`             | ReactNode                       | —           | Sits in the middle and keeps its semantics     |
| `respectReducedMotion` | boolean                         | `true`      |                                                |

Colour and font family are inherited; the ring is uppercase by default, which a
class can override.

**A ring that always closes.** Every character gets an equal slice of the turn
and is rotated into place, so the text covers exactly 360° in every browser.
Measuring the text along an SVG path instead — `textPath` with `textLength` —
leaves half the ring empty in Firefox, which ignores `textLength` there. Equal
slices suit uppercase or monospaced type best; very narrow and very wide
letters read slightly unevenly.

**Server components.** No hooks and no effects: plain markup and one CSS
animation, so Halo renders in a React Server Component.

**Motion.** One compositor rotation, no JavaScript per frame. Reduced motion is
handled in CSS, so the ring is still before hydration too.

**Accessibility.** The ring is `role="img"` named by `text`, read once however
many copies are drawn. The centre is outside the image and keeps its own role.

**Limits.** At most 240 characters are drawn.
