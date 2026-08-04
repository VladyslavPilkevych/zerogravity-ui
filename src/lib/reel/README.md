# Reel

A roulette-style carousel. The current item sits front and centre at full
opacity, its neighbours shrink back and fade, and you move between them by
dragging, flicking, scrolling sideways, pressing the arrow keys or clicking the
buttons.

```tsx
import { Reel } from "@/lib/reel"

export function Products({ items }) {
    const [index, setIndex] = useState(0)

    return (
        <Reel index={index} onIndexChange={setIndex} rotate={42} depth={180}>
            {items.map((item) => (
                <article key={item.id}>{item.name}</article>
            ))}
        </Reel>
    )
}
```

Leave `index` out to let the component own the selection.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `children` | ReactNode | | One slide per child |
| `index` | number | | Controlled index; omit for uncontrolled |
| `defaultIndex` | number | `0` | Starting index when uncontrolled |
| `onIndexChange` | `(index: number) => void` | | Fires on every selection change |
| `loop` | boolean | `false` | Infinite wrap-around |
| `itemWidth` | number | `300` | Slide width, px |
| `itemHeight` | number | `400` | Slide height, px |
| `spacing` | number | `340` | Distance between slide centres, px |
| `visible` | number | `3` | Neighbours kept on screen each side |
| `scale` | number | `0.8` | Scale of a neighbour |
| `opacity` | number | `0.35` | Opacity of a neighbour |
| `rotate` | number | `0` | Y rotation of a neighbour, ° — the coverflow look |
| `depth` | number | `0` | How far back a neighbour is pushed, px |
| `perspective` | number | `1400` | 3D perspective on the viewport, px |
| `stiffness` | number | `9` | Spring speed; higher snaps harder |
| `drag` | boolean | `true` | Pointer dragging with flick-to-advance |
| `wheel` | boolean | `true` | Horizontal wheel and shift+wheel |
| `arrows` | boolean | `true` | Previous / next buttons |
| `dots` | boolean | `true` | Dots, rendered for up to 12 items |
| `clickToSelect` | boolean | `true` | Clicking a neighbour glides it to the centre |
| `className`, `style` | | | Applied to the root |
| `label` | string | `"Carousel"` | `aria-label` for the carousel group |

## Imperative API

```tsx
const reel = useRef<ReelHandle>(null)

<Reel ref={reel}>...</Reel>
reel.current?.next()
reel.current?.prev()
reel.current?.go(4)
```

## Styling

The component ships layout and motion only; the slides are your markup. Two
hooks are available:

- `.reel-item-inner` wraps every slide and carries its own CSS transition. The
  outer element owns the JavaScript transform, so a hover effect on the inner
  element never fights the carousel. The default hover on the active slide is a
  lift, a shadow and an accent glow.
- `--reel-accent` sets the focus ring, active dot and hover glow colour.

```css
.my-reel {
    --reel-accent: #ff5d8f;
}
```

## Input details

- **Drag** follows the pointer one-to-one. Releasing projects the current
  velocity forward, so a flick can travel up to three slides; a slow release
  snaps to the nearest. Outside `loop` mode the ends have rubber-band
  resistance.
- **Wheel** only reacts to horizontal deltas and shift+wheel, so vertical page
  scrolling is never hijacked.
- **Keyboard**: `←` `→` step, `Home` and `End` jump to the ends. The viewport is
  focusable and shows a focus ring.
- **Click** on any neighbour glides it to the centre through the same spring as
  every other input, so it flows rather than jumps — however many positions away
  it is. A click that follows a drag is ignored so releasing a flick never
  selects the slide under your finger. Turn the whole behaviour off with
  `clickToSelect={false}`; neighbours then lose their pointer cursor and hover
  response too, and only the arrows, dots, drag, wheel and keyboard move the
  reel.

## Performance

- **The rAF loop only runs while something is moving.** Once the spring settles
  within 0.0005 of the target the loop stops, so an idle carousel costs nothing.
- **No React re-render per frame.** The animation writes `transform`, `opacity`
  and `zIndex` straight to the DOM nodes through refs; React only re-renders
  when the integer index changes.
- **Nothing outside `visible + 1` is touched.** Far slides get
  `visibility: hidden` once and are then skipped by the loop.
- **Time-based spring.** Position is integrated with `1 - exp(-stiffness · dt)`,
  so the motion is identical on 60 Hz and 120 Hz displays.
- **Transform and opacity only** — no layout is triggered while spinning.

For very large collections, window the list before passing it in: every child
is mounted, and while hidden slides cost nothing to animate, they still cost
DOM nodes.

## Accessibility

The carousel is a labelled group, each slide is a labelled `slide` group, the
arrows and dots are real buttons with `aria-label`, and the active dot carries
`aria-current`. Under `prefers-reduced-motion: reduce` the spring is skipped —
the index snaps — and the hover lift is disabled.
