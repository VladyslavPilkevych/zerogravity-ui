# Tether

An SVG path that draws itself as its section scrolls through the viewport — a
timeline spine, a connector between steps, a route on a diagram.

```tsx
<Tether d="M 10 0 C 10 40, 90 60, 90 100" viewBox="0 0 100 100" fit="stretch">
    <ol className="steps">…</ol>
</Tether>
```

| Prop                   | Type                          | Default                              |                                                                         |
| ---------------------- | ----------------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `d`                    | string                        | —                                    | SVG path data, in `viewBox` units                                       |
| `variant`              | `pixel \| classic \| minimal` | `pixel`                              | Visual style                                                            |
| `viewBox`              | string                        | `"0 0 100 100"`                      |                                                                         |
| `fit`                  | `contain \| stretch`          | `contain`                            | `stretch` fills the box, distorting the path, never the stroke          |
| `progress`             | number                        | —                                    | 0 to 1. Drives the path directly and turns scrolling off                |
| `start`                | number                        | `0.9`                                | Drawing begins when the box's top reaches this fraction of the viewport |
| `end`                  | number                        | `0.5`                                | It completes when the box's bottom reaches this one                     |
| `stroke`               | string                        | `currentColor`                       |                                                                         |
| `strokeWidth`          | number                        | `2`                                  | px, whatever the box's size                                             |
| `track`                | string \| `false`             | faint grey                           | The full-length path underneath                                         |
| `trackDash`            | string                        | `"2 6"` in pixel                     | Dash pattern for the track                                              |
| `linecap`              | `round \| butt \| square`     | `square` in pixel, `round` otherwise |                                                                         |
| `scrollContainer`      | RefObject\<HTMLElement\>      | the window                           |                                                                         |
| `onProgress`           | `(progress: number) => void`  | —                                    | Called when the drawn amount changes                                    |
| `disabled`             | boolean                       | `false`                              | Draw the path fully and stop listening                                  |
| `respectReducedMotion` | boolean                       | `true`                               |                                                                         |
| `children`             | ReactNode                     | —                                    | Laid over the path: steps, labels, markers                              |

**Styles.** **Pixel** (default) draws with square caps over a dotted block track, with a square head riding the tip of the line. **Classic** uses round caps, a solid track and no head. **Minimal** is the bare path: round caps, no head and a 1px hairline track. There is no glass style: a line has no surface to be glass. The path geometry and the scroll mapping are the same in both; explicit `linecap` and `trackDash` win over the style.

**How the path draws.** The stroke is non-scaling, so it stays the width you
asked for however the box stretches. A non-scaling stroke dashes in screen
pixels and ignores `pathLength` — verified in Chromium, Firefox and WebKit,
where `pathLength` with a non-scaling stroke draws the whole path at 50 %
progress — so Tether measures the path's on-screen length on mount and on
resize, and sizes the dash from that.

**Scrolling.** Scroll and resize events wake one frame on the library's shared
loop; the frame writes one `stroke-dashoffset` and the loop sleeps again. A
still page costs nothing.

**Reduced motion, no JavaScript and `disabled`.** The path is drawn in full.
Reduced motion and the no-script case are handled in CSS, so they hold before
hydration. A controlled `progress` is application state, not decoration, and is
always respected.

**Accessibility.** The SVG is decorative and hidden from assistive technology;
the meaning belongs in `children`.
