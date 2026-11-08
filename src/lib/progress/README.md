# Progress

A progress bar that says what it measures: `1 of 4` for counts, `25%` for
percentages.

```tsx
<Progress label="Subtasks" value={1} max={4} />
<Progress label="Upload" value={64} />
<Progress label="Week" value={4} max={7} segments />
```

| Prop        | Default |                                                                 |
| ----------- | ------- | --------------------------------------------------------------- |
| `value`     | —       | Clamped to 0…max                                                |
| `max`       | `100`   |                                                                 |
| `label`     | —       | Accessible name, shown unless `hideLabel`                       |
| `hideLabel` | `false` |                                                                 |
| `format`    | `auto`  | `percent`, `fraction`, or `(value, max) => string`              |
| `segments`  | `false` | `true` for one block per step, or a number of blocks (up to 40) |
| `variant`   | `pixel` | `pixel` or `classic`                                            |

`auto` reads as a percentage when `max` is 100 and as a fraction otherwise. The
bar is `role="progressbar"` with `aria-valuetext`, so assistive tech hears
"1 of 4" rather than a bare number. The fill moves with `transform`. A server
component.
