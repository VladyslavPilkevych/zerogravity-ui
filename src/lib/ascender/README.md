# Ascender

A headline whose words rise one after another out of their own baseline masks
when the line scrolls into view.

```tsx
<Ascender as="h2" text="Every word arrives on its own beat" />
```

| Prop                   | Type                            | Default                         |                                                   |
| ---------------------- | ------------------------------- | ------------------------------- | ------------------------------------------------- |
| `text`                 | string                          | —                               | Split into words on ordinary spaces               |
| `as`                   | `span \| p \| h1`…`h6` `\| div` | `span`                          | Element rendered                                  |
| `trigger`              | `view \| mount`                 | `view`                          | Scroll into view, or play as soon as it is shown  |
| `replay`               | boolean                         | `false`                         | Hide again on leaving the view and rise on return |
| `stagger`              | number                          | `60`                            | ms between words                                  |
| `duration`             | number                          | `900`                           | ms each word takes                                |
| `delay`                | number                          | `0`                             | ms before the first word                          |
| `easing`               | string                          | `cubic-bezier(0.16, 1, 0.3, 1)` | Any CSS timing function                           |
| `disabled`             | boolean                         | `false`                         | Render the text static                            |
| `respectReducedMotion` | boolean                         | `true`                          |                                                   |

Typography is inherited; Ascender adds no font styles. To mix styles in one
line, chain several Ascenders and continue the stagger with `delay`.

**How it works.** One IntersectionObserver watches the root — never the words,
which sit clipped inside their masks and would never count as visible. It sets
one attribute, and CSS transitions do the rest: no animation frames and no React
state. `trigger="mount"` needs no JavaScript at all; it is a CSS animation that
plays when the element is first painted.

**Accessibility.** Screen readers get the sentence once, from a visually hidden
copy. The animated words are `aria-hidden`. The hidden copy cannot be selected,
so copying the headline gives the visible text once.

**Reduced motion and no JavaScript.** Both are handled in CSS, so the text is
simply there before hydration and without scripts. `respectReducedMotion={false}`
opts out.

**Above the fold.** Words that start clipped are not painted, which delays
Largest Contentful Paint for a hero headline. Use `trigger="mount"` there.
