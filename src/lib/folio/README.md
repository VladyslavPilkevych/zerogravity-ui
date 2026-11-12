# Folio

A strip of panels where the one under the pointer or keyboard focus opens wide
while the others narrow — without ever changing a panel's size.

```tsx
<Folio label="Selected work">
    <FolioPanel label="Harbour" media={<img src="/harbour.jpg" alt="" />}>
        {(open) => <a href="/work/harbour">{open ? "Harbour — a new waterfront" : "Harbour"}</a>}
    </FolioPanel>
    <FolioPanel label="Field" media={<img src="/field.jpg" alt="" />}>
        <a href="/work/field">Field</a>
    </FolioPanel>
</Folio>
```

| Prop                   | Type                                   | Default                                          |                                               |
| ---------------------- | -------------------------------------- | ------------------------------------------------ | --------------------------------------------- |
| `children`             | `FolioPanel` elements                  | —                                                |                                               |
| `variant`              | `pixel \| classic \| minimal \| glass` | `pixel`                                          | Visual style                                  |
| `active`               | number                                 | —                                                | Controlled open panel                         |
| `defaultActive`        | number                                 | `0`                                              |                                               |
| `onActiveChange`       | `(index) => void`                      | —                                                |                                               |
| `height`               | number \| string                       | `420`                                            | px or any CSS length                          |
| `gap`                  | number                                 | `12`                                             | px between panels; real space, any background |
| `radius`               | number                                 | `4` pixel, `20` classic, `6` minimal, `18` glass | Corner step (pixel) or radius (classic), px   |
| `grow`                 | number                                 | `3`                                              | How many times wider the open panel is        |
| `duration`             | number                                 | `650`                                            | ms                                            |
| `easing`               | string                                 | `cubic-bezier(0.32, 0.72, 0, 1)`                 |                                               |
| `label`                | string                                 | —                                                | Accessible name of the list                   |
| `disabled`             | boolean                                | `false`                                          | Keep the current panel open                   |
| `respectReducedMotion` | boolean                                | `true`                                           |                                               |

`FolioPanel` takes `media` (fills the panel and stays centred in its visible
window), `children` (overlay content, or a function of `open`), `label` and
`className`. Each panel exposes `data-open`, `--zg-folio-open` (0 to 1) and
`--zg-folio-visible`, its visible width, for content that should track the
right edge.

**Styles.** **Pixel** (default) cuts each panel's corners in steps of `radius` and frames the open panel in `--zg-folio-accent`, fading the frame with the panel's openness. **Classic** rounds the corners with `radius`. **Minimal** keeps the content first, with small corners and a hairline under the open panel. **Glass** lays a fine inner edge and a top sheen over the open panel, fading with it; nothing blurs. Every style repaints only the frame, so the motion still does no layout work.

**No width animation, and no drift.** Every panel is as wide as the open one.
A single animated number — the open position — decides how far each panel sits,
how much of it shows (`clip-path`) and where its media is centred. Panels open
in a smooth wave: moving from the first panel to the last passes through the ones
between, and changing your mind halfway simply retargets that one number, so the
gaps never pull apart. Everything is a percentage of the panel's own width, so
the motion does no layout work at all, and the server-rendered HTML already has
the final geometry. The gaps are real, empty space, so the strip works over
images, gradients and either colour scheme. React renders only when the open
panel changes.

**Small screens.** Below 560 px the strip becomes a vertical stack of
fixed-height panels, all open, with no hover behaviour. Before hydration a media
query gives the same stack on narrow viewports.

**Pointer, touch and keyboard.** A mouse opens a panel on hover. On touch the
first tap opens a panel and the second follows its link. Keyboard focus opens
the panel it lands in; panels without a link or button become tab stops on their
own, so every panel can be reached.

**Semantics.** A list with an accessible name, each item named by `label`. The
open panel is emphasis, not disclosure — nothing is hidden from assistive
technology — so `aria-expanded` is not used. For choosing one of several values,
use a selection control such as Detent instead.

**Reduced motion.** Panels change instantly.

**Media.** `img`, `video` and `picture` children fill the panel with
`object-fit: cover`. Every image is drawn at the open width, so size its sources
for that.
