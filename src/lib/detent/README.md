# Detent

A segmented control: a row of options with a thumb that slides to the one that
is selected.

```tsx
const [billing, setBilling] = useState("monthly")

<Detent
    label="Billing period"
    value={billing}
    onChange={setBilling}
    options={[
        { value: "monthly", label: "Monthly" },
        { value: "yearly", label: "Yearly" },
    ]}
/>
```

| Prop           | Type                                   | Default              |                                             |
| -------------- | -------------------------------------- | -------------------- | ------------------------------------------- |
| `options`      | `{ value, label, disabled? }[]`        | —                    | `value` is a string or a number             |
| `variant`      | `pixel \| classic \| minimal \| glass` | `pixel`              | Visual style                                |
| `label`        | string                                 | —                    | Accessible name of the group                |
| `value`        | `T`                                    | —                    | Controlled selection                        |
| `defaultValue` | `T`                                    | first enabled option | Uncontrolled starting selection             |
| `onChange`     | `(value: T) => void`                   | —                    | Receives the option's own value, typed      |
| `name`         | string                                 | generated            | Submitted with a surrounding form           |
| `disabled`     | boolean                                | `false`              |                                             |
| `fullWidth`    | boolean                                | `false`              | Stretch to the container instead of content |

**Styles.** **Pixel** (default) uses square segments, a 1px track frame, a square thumb with a hard offset shadow that slides in six steps, and monospaced uppercase labels. **Classic** keeps rounded segments and a springy slide. **Minimal** drops the track and marks the choice with a 2px line beneath it. **Glass** is a translucent track with a lighter thumb; as a single small control it blurs what lies behind it. Native radio behaviour is identical in every style.

**Native radios.** Each option is a real `<input type="radio">` inside its
`<label>`, so the keyboard model, focus, form submission and right-to-left
layouts come from the browser: Tab reaches the selected option, the arrow keys
move the selection and skip disabled options, and Space selects. A value that
matches no option leaves nothing selected and hides the thumb.

**The thumb.** Options are equal width, so the thumb's position is pure CSS from
the selected index — correct in the server-rendered HTML, no measuring, and only
`translate` animates. Long labels truncate rather than grow one option.

**Theming.** `--zg-detent-track`, `--zg-detent-thumb`, `--zg-detent-ink`,
`--zg-detent-ink-active`, `--zg-detent-focus`, `--zg-detent-radius`,
`--zg-detent-pad` and `--zg-detent-duration` on the root. Pick a thumb colour
with 4.5:1 contrast against `--zg-detent-ink-active`.

**Reduced motion.** The thumb jumps instead of sliding.
