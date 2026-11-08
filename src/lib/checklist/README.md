# Checklist

A named list of native checkboxes: subtasks, steps, packing lists.

```tsx
<Checklist label="Subtasks" items={steps} defaultValue={["outline"]} showProgress />
```

| Prop                                  | Default |                                         |
| ------------------------------------- | ------- | --------------------------------------- |
| `items`                               | —       | `{ id, label: ReactNode, disabled? }[]` |
| `label`                               | —       | Legend of the group                     |
| `hideLabel`                           | `false` | Keep the legend for assistive tech only |
| `value` / `defaultValue` / `onChange` | `[]`    | Checked ids, in item order              |
| `name`                                | —       | Submits checked ids with a form         |
| `showProgress`                        | `false` | A Progress bar above the list           |
| `disabled`                            | `false` | Disables every item                     |
| `variant`                             | `pixel` | `pixel` or `classic`                    |

Each item is a real `<input type="checkbox">` inside its label, in a
`<fieldset>`, so Space toggles, Tab moves and forms submit as usual. It needs no
Task around it.
