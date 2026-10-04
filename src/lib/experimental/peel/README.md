# Peel

The sheet on top lifts off the one underneath as the section scrolls past —
cut back along a diagonal, lifted at the corner, with light gathering along the
crease.

```tsx
<Peel front={<Cover />} back={<Underneath />} />
```

## How it works

The stage is pinned for two screens. One scroll listener writes a single custom
property, `--pe-lift`, and CSS does everything else: the `clip-path` that cuts
the sheet back, the transform that lifts it, and the gradient that shades the
crease. Which corner lifts is a data attribute, so all four are the same
machinery.

## Props

| Prop                   | Default       | Notes                                     |
| ---------------------- | ------------- | ----------------------------------------- |
| `front`                | —             | The sheet on top, the one that lifts away |
| `back`                 | —             | What is underneath it                     |
| `scrollContainer`      | —             | Drive it from a scrollable element        |
| `corner`               | `"top-right"` | Which corner lifts first                  |
| `height`               | `"100vh"`     | How tall the pinned stage is              |
| `travel`               | `1`           | How much scroll it takes, in viewports    |
| `curl`                 | `0.7`         | How hard the crease shades the sheet      |
| `disabled`             | `false`       | Drop the peel entirely                    |
| `respectReducedMotion` | `true`        | Honour `prefers-reduced-motion`           |

## Accessibility

Both layers are always in the document, so the content underneath is readable
and searchable before it is uncovered. The crease is `aria-hidden`.

Under reduced motion the pinning is dropped altogether: the two layers become
ordinary blocks stacked down the page, each at its natural height, with no
clipping and no transform.
