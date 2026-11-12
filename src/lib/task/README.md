# Task

One task as a row: a done checkbox, the title, a summary line, optional progress
and an expandable detail region. The data and the actions are yours.

```tsx
<Task
    title="Quarterly report"
    progress={{ value: 1, max: 4 }}
    meta={
        <>
            <span>In progress</span>
            <span>Due Fri</span>
        </>
    }
    actions={<MyMenu />}
>
    <Checklist label="Subtasks" items={steps} />
</Task>
```

| Prop                                                | Default    |                                                  |
| --------------------------------------------------- | ---------- | ------------------------------------------------ |
| `title`                                             | —          | Names the row and its checkbox                   |
| `name`                                              | from title | Plain-text name when `title` is not a string     |
| `done` / `defaultDone` / `onDoneChange`             | `false`    |                                                  |
| `expanded` / `defaultExpanded` / `onExpandedChange` | `false`    | Only when there are children                     |
| `meta`                                              | —          | Summary items; separators are added between them |
| `progress`                                          | —          | `{ value, max? }`, named after the task          |
| `actions`                                           | —          | Buttons or menus at the end of the row           |
| `children`                                          | —          | The detail region; adds the disclosure button    |
| `as`                                                | `div`      | `div`, `li` or `article`                         |
| `variant`                                           | `pixel`    | `pixel`, `classic`, `minimal` or `glass`         |

**Semantics.** The checkbox is a native input named by the title and described
by the meta line. With children, the title and meta form a disclosure button
(`aria-expanded`, `aria-controls`) for a region named by the title.

**Styles.** **Pixel** uses square block checks, block separators and a
monospaced meta line; **classic** a round check and soft card; **minimal** a
flat row with an outlined check and one rule beneath; **glass** a translucent
card with a fine edge, tinted rather than blurred because tasks repeat down a
list. Classic, minimal and glass share one geometry.
