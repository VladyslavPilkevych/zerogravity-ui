# Vellum

A sheet that tilts toward the pointer, with an optional highlight layer that
dents where the pointer rests and catches a sheen on the opposite side.

```tsx
<Vellum highlight={false}>
    <article>Just the tilt</article>
</Vellum>
```

| Prop          | Default | Notes                                                |
| ------------- | ------- | ---------------------------------------------------- |
| `tilt`        | `9`     | Maximum rotation, degrees; `0` disables the geometry |
| `highlight`   | `true`  | `false`, or an object to configure it                |
| `radius`      | `22`    | Sheet corner radius, px                              |
| `ease`        | `0.14`  | Follow rate                                          |
| `perspective` | `900`   | 3D depth, px                                         |

`highlight` accepts `{ dent, sheen, color, sheenColor }`. Setting it to `false`
removes both overlay elements entirely rather than making them transparent, so
nothing is painted:

```tsx
<Vellum highlight={{ dent: 0.15, sheen: 1, sheenColor: "#ffd166" }}>…</Vellum>
```

The tilt and the highlight are independent — either can be used without the other.

**Interaction.** Three custom properties per frame; all geometry and shading is
CSS. The cached bounding box is invalidated on scroll and resize.

**Reduced motion.** No tilt, no dent, no sheen — the sheet renders flat.

**Performance.** One transformed element plus at most two gradient overlays.

**Accessibility.** Children keep their semantics; both overlays are `aria-hidden`
and non-interactive.

**Limitations.** `overflow: hidden` clips anything a child renders outside the
rounded rectangle.
