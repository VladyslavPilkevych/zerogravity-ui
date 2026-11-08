# Clock

A compact date and time — `Sun 8 Nov · 20:57` — live or fixed, in any locale and
time zone, with nothing but `Intl`.

```tsx
<Clock />
<Clock timeZone="Asia/Tokyo" show="time" seconds />
<Clock value={meeting.start} />
```

| Prop         | Default                         |                              |
| ------------ | ------------------------------- | ---------------------------- |
| `value`      | live                            | A fixed instant              |
| `show`       | `datetime`                      | `datetime`, `date` or `time` |
| `locale`     | device                          |                              |
| `timeZone`   | device                          | Any IANA zone                |
| `hour12`     | from the locale                 |                              |
| `seconds`    | `false`                         |                              |
| `dateFormat` | `{ weekday, day, month }` short | Date part options            |
| `separator`  | `"·"`                           |                              |
| `variant`    | `pixel`                         | `pixel` or `classic`         |

**Updates.** A live clock wakes exactly when the display changes — on the next
whole minute, or second when `seconds` is on — and stops when it unmounts.

**Server rendering.** A live clock renders an empty `<time>` on the server and
fills in after hydration, so server and client can never disagree. A `value`
renders everywhere.

**Semantics.** A `<time>` element with a machine-readable `dateTime` and the
full date and time as its accessible name.
