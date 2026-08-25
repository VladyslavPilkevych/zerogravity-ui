# Eclipse

Full-section scroll transitions. Each section takes over the viewport completely,
and the next one slides across it while the one behind eases back, dims and — if
you ask — blurs.

```tsx
<Eclipse>
    <EclipseSection>…</EclipseSection>
    <EclipseSection>…</EclipseSection>
    <EclipseSection>…</EclipseSection>
</Eclipse>
```

This is not [ScrollStack](../../scroll-stack), which gathers cards into a pile
inside a section. Eclipse is the section: one panel per screen, each one covering
the last.

## How it works

Every panel is `position: sticky; top: 0` with an ascending `z-index`, so
covering is simply a matter of sliding the next one in — no measuring of what is
on top of what, and no reordering. One scroll listener schedules one
`requestAnimationFrame`, which writes transforms directly to the panels; React
never re-renders while you scroll.

One panel's worth of scroll buys exactly one full cover, so the mapping between
distance and progress is something you can predict rather than tune.

## Props

| Prop                   | Default     | Notes                                                               |
| ---------------------- | ----------- | ------------------------------------------------------------------- |
| `children`             | —           | One `EclipseSection` per screen                                     |
| `scrollContainer`      | —           | Drive it from a scrollable element instead of the page              |
| `height`               | `"100vh"`   | How tall each section is                                            |
| `from`                 | `"up"`      | Which edge the incoming section arrives from: `up`, `left`, `right` |
| `recede`               | `0.06`      | How far the covered section pulls back                              |
| `dim`                  | `0.45`      | How far it dims                                                     |
| `dimColor`             | `"#05050a"` | What it dims toward                                                 |
| `blur`                 | `0`         | How far it blurs, in px                                             |
| `disabled`             | `false`     | Drop the effect entirely                                            |
| `respectReducedMotion` | `true`      | Honour `prefers-reduced-motion`                                     |
| `onActiveChange`       | —           | Called with the index of the section in view                        |

`onActiveChange` fires only when the active index actually changes, not on every
frame.

## Accessibility

Sections are ordinary elements in document order: reading order, tab order and
in-page search all match what is on screen, and nothing is removed from the
accessibility tree at any point in the transition. The dimming veil is
`aria-hidden` with `pointer-events: none`.

## Reduced motion

Under `prefers-reduced-motion: reduce`, or with `disabled`, the pinning is
dropped altogether: sections become ordinary blocks that follow one another down
the page, with no transforms, no dimming and no blur. Every section is still
reachable and still complete.

## Performance

One scroll listener, one coalesced frame, and transforms written straight to the
DOM. Measurements are taken once and refreshed on resize through a single
`ResizeObserver`. The panel count is whatever you pass; the per-frame cost is
linear in it and involves no layout reads.
