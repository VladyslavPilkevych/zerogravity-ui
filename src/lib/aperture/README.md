# Aperture

A full-bleed panel that closes into a framed card as you scroll — or opens the
other way. The frame is animated with `clip-path`, so the content itself is
never rescaled and stays sharp.

```tsx
import { Aperture } from "@/lib/aperture"

export function Showcase() {
    return (
        <Aperture inset={14} radius={32}>
            <img src="/hero.jpg" alt="" />
        </Aperture>
    )
}
```

The component owns a tall scroll track and pins a sticky viewport inside it, so
place it as a normal block in the page flow. It must not sit inside an ancestor
with `overflow: hidden` or a `transform`, both of which break `position: sticky`.

## Props

| Prop                 | Type                          | Default     |                                                               |
| -------------------- | ----------------------------- | ----------- | ------------------------------------------------------------- |
| `children`           | ReactNode                     |             | Panel content, sized to the viewport                          |
| `height`             | string                        | `"160vh"`   | Length of the scroll track; longer means a slower transition  |
| `scrollContainer`    | RefObject<HTMLElement>        |             | Drive the frame from a scrollable element instead of the page |
| `inset`              | number                        | `12`        | How far each edge closes in, in percent                       |
| `radius`             | number                        | `28`        | Corner radius at full progress, px                            |
| `direction`          | `"close" \| "open" \| "both"` | `"close"`   | `both` closes and then reopens                                |
| `scale`              | number                        | `0.06`      | How far the content pulls back at full progress               |
| `dim`                | number                        | `0`         | Opacity of the overlay at full progress                       |
| `dimColor`           | string                        | `"#05050a"` | Overlay colour                                                |
| `easing`             | `"smooth" \| "linear"`        | `"smooth"`  | Curve applied to progress                                     |
| `disabled`           | boolean                       | `false`     | Renders the panel flat, with no scroll response               |
| `className`, `style` |                               |             | Applied to the scroll track                                   |
| `onProgress`         | `(progress: number) => void`  |             | Fires with 0..1 as progress changes                           |

## Performance

- **No layout reads while scrolling.** The track offset and viewport height are
  measured once on mount and again on resize through a `ResizeObserver`; each
  frame only reads `window.scrollY`, which never forces layout.
- **One animation frame per scroll burst.** Scroll events are coalesced, so
  twenty events still paint once.
- **`clip-path` and `transform` only**, both compositor properties, so the panel
  content is not repainted as the frame closes.
- A frame is skipped entirely when progress moved less than 0.002.
- The pending frame is cancelled on unmount.

## Accessibility

The dimming overlay is decorative and marked `aria-hidden`. Under
`prefers-reduced-motion: reduce` progress is pinned to 0, so the panel renders
full-bleed and static, and `onProgress` reports 0. Content inside the panel is
untouched and stays fully focusable.

## Driving it from a bounded scroller

`scrollContainer` points the component at a scrollable element instead of the
page. One thing has to move with it: the sticky pane is `100vh` by default,
which is taller than the box you are looking through, so you would only ever see
a crop. Override `--aperture-viewport` with the height of that element:

```css
.my-scroller {
    container-type: size;
    --aperture-viewport: 100cqh;
}
```

`cqh` is the tidiest way to say it — the pane then tracks the scroller at any
size. A fixed `px` height works just as well.
