# Calendar

A month, week and day calendar built from replaceable parts. Data comes in
through props; fetching, saving, recurrence and providers stay in your app.

```tsx
import { Calendar } from "zerogravity/calendar"

;<Calendar events={events} onEventClick={open} />
```

An event is `{ id, title, start: Date, end: Date, allDay?, accent? }`, with `end`
exclusive. Add any fields you need: they reach `renderEvent` and the click
handlers with their types intact.

## Composition

`<Calendar>` renders `Calendar.Header` and `Calendar.View` unless you pass
children. Swap either, or pick a view directly:

```tsx
;<Calendar events={events} defaultView="week">
    <MyHeader />
    <Calendar.Week />
</Calendar>

function MyHeader() {
    const { title, previous, next, goToToday, view, setView } = useCalendar()
    // …
}
```

`Calendar.Month`, `Calendar.Week` and `Calendar.Day` share one scheduling core.
`CalendarEvent` is the default chip and works on its own, in agendas or popovers.

## Props

| Prop                                                            | Default                 |                                             |
| --------------------------------------------------------------- | ----------------------- | ------------------------------------------- |
| `events`                                                        | `[]`                    | Items to show                               |
| `view` / `defaultView` / `onViewChange`                         | `week`, `day` on phones | `month`, `week` or `day`                    |
| `views`                                                         | all three               | Which views the header offers               |
| `date` / `defaultDate` / `onDateChange`                         | today                   | The date being looked at                    |
| `selectedDate` / `defaultSelectedDate` / `onSelectedDateChange` | none                    | The chosen day                              |
| `weekStartsOn`                                                  | `1`                     | 0 is Sunday                                 |
| `locale`                                                        | device                  | Any BCP 47 locale                           |
| `timeZone`                                                      | device                  | The wall clock events are placed on         |
| `now`                                                           | live                    | A fixed now, for tests and server rendering |
| `variant`                                                       | `pixel`                 | `pixel`, `classic`, `minimal` or `glass`    |
| `renderEvent`                                                   | `CalendarEvent`         | `(event, info) => ReactNode`                |
| `renderDay`                                                     | —                       | Extra content in each month cell            |
| `onEventClick`                                                  | —                       | Makes the default chips buttons             |
| `onMoreClick`                                                   | open the day            | The `+N more` control                       |
| `maxEventsPerDay`                                               | `3`                     | Month cells, before `+N more`               |
| `hourHeight`                                                    | `48`                    | px per hour in week and day views           |
| `startHour` / `endHour`                                         | `0` / `24`              | The visible part of the day                 |
| `scrollToHour`                                                  | `7`                     | Where the time grid opens                   |
| `height`                                                        | `560`                   | Height of the time grid's scroll area       |
| `label`                                                         | `"Calendar"`            | Accessible name of the region               |

**Styles.** **Pixel** (default) draws a crisp grid, square chips with a block
accent bar, a notched selected day, a block now-marker and monospaced labels.
**Classic** is rounded and quiet, for ordinary product UI. **Minimal** keeps the
grid but lightens its lines, drops fills and half-hour rules, and marks
selection with a 2px underline. **Glass** gives the controls translucent pills,
the grid a tinted frame and the events translucent chips; nothing blurs, because
the grid is large and scrolls. Every style keeps the same layout, so switching
never moves an event. Colours are custom
properties: `--zg-calendar-accent`, `--zg-calendar-surface` (behind sticky
headers), `--zg-calendar-now`, and `--zg-calendar-event-accent` per chip.

## Layout

Overlapping timed events are laid out from their data alone, with no DOM
measurement: chains of overlap form a group, each event takes the first free
column, and afterwards stretches right into columns that stay free beside it.
Touching events (one ends as the next starts) do not overlap. Every event is
drawn at least 20 minutes tall, and that drawn length counts for overlap, so a
five-minute item never hides under its neighbour. Items flagged `allDay`, or a
day or longer, go to the all-day row. Overnight items are split per day.

## Dates

Days are counted on the civil calendar, so stepping through months and weeks
never meets a DST gap. Times are placed by wall-clock minutes in `timeZone`
(the device's by default), read with `Intl`; there is no date library. On a DST
day an item is drawn where its wall-clock times fall.

## Keyboard and semantics

The month is a table with real column headers. Each day is a button named with
its full date, `aria-pressed` when selected and `aria-current="date"` for today.
Arrow keys move between days, Home and End go to the week's start and end, Page
Up and Page Down change the month, and moving past the month's edge turns the
page. In week and day views each day column is a labelled group and each event a
button named by its title and time. The title is a polite live region, so
navigating is announced.

## Small screens

Without a `view` or `defaultView`, phones (640 px and narrower) open on the day
view. A narrow week keeps readable columns and scrolls sideways inside its
frame; month cells drop event times.

## Server rendering

Pass `defaultDate` (and `now` if you want today marked in the HTML) for stable
server output. Without `now`, today's highlight and the now line appear after
hydration, so server and client always agree.
