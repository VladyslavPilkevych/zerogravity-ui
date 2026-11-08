# Frost

A frosted-glass surface for any content: a translucent tint, a modest backdrop
blur, a light edge and a soft shadow.

```tsx
<Frost>
    <Card />
</Frost>
```

| Prop          | Type                                                            | Default               |                                                       |
| ------------- | --------------------------------------------------------------- | --------------------- | ----------------------------------------------------- |
| `as`          | `div \| section \| article \| aside \| header \| footer \| nav` | `div`                 | Element rendered                                      |
| `tone`        | `light \| dark`                                                 | `light`               | Sets tint, edge and shadow together                   |
| `variant`     | `blur \| tint`                                                  | `blur`                | `tint` skips the backdrop blur and fills more densely |
| `blur`        | number                                                          | `12`                  | px, 0 to 40. `0` behaves like `tint`                  |
| `tint`        | string                                                          | from tone             | Any CSS colour, `var(--token)` included               |
| `tintOpacity` | number                                                          | from tone and variant | Tint strength, 0 to 1                                 |
| `radius`      | number \| string                                                | `20`                  | px, or any CSS length                                 |
| `border`      | boolean                                                         | `true`                |                                                       |
| `shadow`      | boolean                                                         | `true`                |                                                       |

Every other HTML attribute, `ref` included, reaches the element. Frost sets no
text colour: pick one that reads against the busiest part of what sits behind.

**Server components.** Frost is plain markup and CSS, with no hooks, so it
renders in a React Server Component.

**Performance.** A backdrop blur costs one GPU pass per surface every time what
is behind it changes. The defaults keep that cheap: blur only, no `saturate()`,
a 12 px radius, and nothing that moves. Use `variant="tint"` for small or
repeated pieces such as chips and badges, and keep blurred surfaces few, still
and un-nested.

**Bundlers.** `-webkit-backdrop-filter` is declared before `backdrop-filter`.
Lightning CSS (used by Tailwind 4 and available in Vite and Turbopack) keeps only
the last of the two when the standard form comes first, and Chromium ignores the
prefixed one — which silently removes the blur. A test guards the order across
the library.

**No backdrop-filter.** Browsers without support get a denser tint instead, so
text stays legible.
