# Sash

An endless band of words, logos or announcements that glides at a constant
speed, however long the content is.

```tsx
<Sash label="Clients">
    <Logo name="North" />
    <Logo name="Field" />
    <Logo name="Harbour" />
</Sash>
```

| Prop                   | Type               | Default |                                                    |
| ---------------------- | ------------------ | ------- | -------------------------------------------------- |
| `children`             | ReactNode          | —       | One run of the band; repeated as often as needed   |
| `variant`              | `pixel \| classic` | `pixel` | Visual style                                       |
| `speed`                | number             | `60`    | px per second, independent of the content's length |
| `direction`            | `left \| right`    | `left`  |                                                    |
| `gap`                  | number             | `40`    | px between items and between repeats               |
| `pauseOnHover`         | boolean            | `true`  | Keyboard focus inside the band always pauses it    |
| `fade`                 | boolean            | `false` | Fades both edges with a mask, on any background    |
| `paused`               | boolean            | `false` | Hold the band where it is                          |
| `label`                | string             | —       | Makes the band a named region                      |
| `disabled`             | boolean            | `false` | Static, wrapped content                            |
| `respectReducedMotion` | boolean            | `true`  |                                                    |

**Styles.** **Pixel** (default) frames the band with dashed block rules, puts a square marker after every item and fades its edges in hard bands. **Classic** is the bare band with a smooth fade. Both share the same loop.

**Seamless loop.** The first run is measured, sub-pixel exact, and the track
slides by one run plus one gap before starting over, with enough copies to cover
the band. Only the track's `transform` animates; React renders again only when
the band or the content changes size.

**Accessibility.** Only the first run is exposed. The copies are `aria-hidden`
and `inert`, so links inside are never reached twice — set through the DOM, so
React 18 and 19 behave the same. Moving content that lasts more than five
seconds needs a way to stop it (WCAG 2.2.2): hover and keyboard focus pause the
band, and `paused` lets a page offer its own control. Duplicated content
duplicates any `id` inside it, so avoid ids in the children.

**Reduced motion and disabled.** The band stops and its content wraps onto as
many lines as it needs, so nothing is cut off. Reduced motion is handled in CSS
as well, so it applies before hydration.

**Offscreen.** The animation holds while the band is scrolled out of view.
