# ScrollStack

Full-height sections that slide over one another as you scroll and unstack
exactly the same way on the way back.

```tsx
import { ScrollStack } from "@/lib/scroll-stack"

export function Story() {
    return (
        <ScrollStack rounded={24} peek={20}>
            <section className="card-one">First</section>
            <section className="card-two">Second</section>
            <section className="card-three">Third</section>
        </ScrollStack>
    )
}
```

Each child is wrapped in a sticky card of the given height. The stacking itself
is plain CSS `position: sticky`; JavaScript only adds the recede — scale, dim,
lift, blur — of the card being covered.

## Props

| Prop                                  | Type                      | Default     |                                                              |
| ------------------------------------- | ------------------------- | ----------- | ------------------------------------------------------------ |
| `children`                            | ReactNode                 |             | One card per child                                           |
| `height`                              | string                    | `"100vh"`   | Default height of every section                              |
| `heights`                             | (string \| undefined)[]   |             | Per-section overrides; `undefined` falls back to `height`    |
| `top`                                 | number                    | `0`         | Where a card sticks, px from the top                         |
| `peek`                                | number                    | `0`         | Extra sticky offset per card, so previous edges stay visible |
| `scaleTo`                             | number                    | `0.92`      | Scale a fully covered card shrinks to                        |
| `dim`                                 | number                    | `0.5`       | Opacity of the dark veil over a covered card                 |
| `dimColor`                            | string                    | `"#05050a"` | Colour of that veil                                          |
| `opacityTo`                           | number                    | `1`         | Real element opacity of a covered card                       |
| `liftTo`                              | number                    | `0`         | Upward travel of a covered card, px                          |
| `blurTo`                              | number                    | `0`         | Blur of a covered card, px                                   |
| `rounded`                             | number                    | `0`         | Corner radius, px (also clips the content)                   |
| `easing`                              | `"smooth" \| "linear"`    | `"smooth"`  | Curve applied to the cover progress                          |
| `disabled`                            | boolean                   | `false`     | Plain sticky stacking with no motion                         |
| `className`, `cardClassName`, `style` |                           |             | Escape hatches for styling                                   |
| `onActiveChange`                      | `(index: number) => void` |             | Fires when the top card changes                              |

### `dim` versus `opacityTo`

Both darken a covered card, but only one of them is usually what you want.

`dim` paints an opaque veil on top of the card. The card stays solid, so the
cards underneath never show through — this is the classic deck look.

`opacityTo` lowers the real opacity of the element, which makes it genuinely
see-through: the card below becomes visible and the text of two cards can
overlap. Use it when you want a card to disappear rather than recede, and set
`dim: 0` at the same time.

## Sections of different sizes

Pass `heights` to give each section its own height — full-screen hero, then a
shorter card, then full-screen again:

```tsx
<ScrollStack height="100vh" heights={["100vh", "60vh", undefined, "75vh"]}>
```

The component measures every card once and keeps a cumulative offset table, so
mixed heights are exact rather than approximated. `undefined` at any position
falls back to `height`.

## Requirements

- The stack must not sit inside an ancestor with `overflow: hidden` or a
  `transform` — either one breaks `position: sticky`.
- Card heights are measured on mount and on resize. If a card changes height for
  a reason the `ResizeObserver` on the container cannot see, call for a resize
  or remount the stack.

## Performance

- **No layout reads while scrolling.** The cumulative card offsets and the
  viewport height are measured once on mount and again on resize
  (`ResizeObserver` + `resize`). Every frame after that only reads
  `window.scrollY`, which never forces layout.
- **One rAF per scroll burst.** Scroll events are coalesced into a single
  animation frame; a burst of twenty events still paints once.
- **Only `transform` and `opacity` are written**, both compositor properties,
  so scrolling does not repaint the card contents.
- **Nothing is written twice.** A card whose progress moved less than 0.0005 is
  skipped entirely.
- **`blurTo` is the one expensive option.** A `filter: blur()` on a full-height
  element repaints on every frame; it is off by default, and worth leaving off
  on low-end hardware.

Reverse scrolling needs no special handling because progress is derived from
scroll position, not from scroll direction.

## Accessibility

Under `prefers-reduced-motion: reduce` the transforms are skipped and the cards
simply stack, which keeps the layout meaningful without the motion.
