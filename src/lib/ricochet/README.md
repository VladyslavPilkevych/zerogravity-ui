# Ricochet

A short word or number, built out of destructible pixel blocks, with an arcade
game underneath it. Aim it at a 404 page and the missing number becomes something
to knock apart while the visitor decides where to go next.

```tsx
<Ricochet text="404" onClear={() => router.push("/")} />
```

Ricochet is an original component **inspired by two classic arcade mechanics** —
brick-breaking and a bottom-of-screen shooter. It is not an implementation of any
particular game, and it contains no assets, sprites, level data or code from one.
The bitmap font, the ship, the palettes and the physics are all written for this
library.

## Games

One component, one destructible field, two ways to break it. Pick with `game`:

| `game`       | You control  | Breaks blocks with | Bonuses      |
| ------------ | ------------ | ------------------ | ------------ |
| `"breakout"` | A paddle     | A bouncing ball    | Falling `+3` |
| `"shooter"`  | A pixel ship | Bolts fired upward | —            |

Everything else is shared: the pixel font, the block field, destruction and
sparks, the remaining-block count, `onClear`, colours, responsive scaling,
accessibility and reduced motion. A block only ever dies in one place, whether a
ball or a bolt reached it.

**Breakout** is the default. The ball bounces off the walls, the paddle and the
blocks, and a miss simply serves again — the damage already done is kept, so the
scene never resets under the player.

**Shooter** puts a small ship at the bottom that slides left and right and fires
upward. Each bolt destroys the first block it reaches. There is nothing to lose:
no descending wall, no return fire.

## Power-ups

Occasionally a destroyed block drops a small pixel bonus that falls from roughly
where the block stood. Catch it with the paddle and it applies; miss it and it is
removed. Nothing accumulates.

The only bonus so far is **`+3`**, which adds three more balls on slightly
different headings while keeping the one already in play. Simultaneous balls are
capped internally so repeated bonuses cannot fill the board.

```tsx
// off entirely
<Ricochet powerUps={false} />

// noticeably more generous than the default 5%
<Ricochet powerUpChance={0.2} />
```

Drops are rolled from a seeded generator keyed to the text, not from render-time
randomness, so a given board drops the same bonuses on the same hits — which is
what makes them testable.

Bonuses are declared as a small internal list of `{ id, label, modes, apply }`,
so adding a wider paddle or a slower ball later is one more entry. Each bonus
names the modes it belongs to, which is why `+3` never appears in shooter, where
it would mean nothing.

## Controls

| Input                 | Breakout          | Shooter                 |
| --------------------- | ----------------- | ----------------------- |
| Pointer or touch move | Slides the paddle | Slides the ship         |
| Pointer or touch down | Serves if idle    | Fires, and keeps firing |
| `←` `→` / `A` `D`     | Nudges the paddle | Nudges the ship         |
| `Space`               | —                 | Fires, and keeps firing |

Keyboard handling lives on the play area, so arrow keys and space behave normally
until it is focused. Held fire is throttled to `fireRate` shots per second and
bolts come from a fixed pool, so neither a held key nor fast clicking can flood
the board.

Set `interactive={false}` to make the scene purely decorative: no pointer
tracking, no focus stop, no cursor hiding. `autoStart` decides whether play
begins on mount or on the first interaction.

## Text

`text` accepts digits `0–9`, `A–Z`, spaces, and `. - + ! ? *`. Lowercase is
upper-cased automatically, and unsupported characters fall back to a blank cell.
`SUPPORTED_CHARACTERS` is exported if you want to validate input yourself.

**Three to five characters is the sweet spot.** The glyph grid is scaled to fit
the box on both axes, so longer text keeps working but the blocks shrink and the
shape stops reading as typography. `404`, `LOST`, `OOPS`, `500` and `NOPE` all
sit comfortably.

A blank `text` produces no blocks, which the component treats as an
already-cleared board rather than an unwinnable one.

## Props

| Prop                   | Default      | Notes                                        |
| ---------------------- | ------------ | -------------------------------------------- |
| `text`                 | `"404"`      | Short word or number, 3–5 characters         |
| `game`                 | `"breakout"` | `breakout` or `shooter`                      |
| `variant`              | `"neon"`     | `mono`, `neon`, `soft`                       |
| `pixelSize`            | `26`         | Preferred block size, scaled down to fit     |
| `speed`                | `1`          | Ball speed, breakout only                    |
| `powerUps`             | `true`       | Falling bonuses, breakout only               |
| `powerUpChance`        | `0.05`       | Chance a destroyed block drops one           |
| `shotSpeed`            | `1`          | Bolt speed, shooter only                     |
| `fireRate`             | `5`          | Bolts per second, shooter only               |
| `shipSpeed`            | `1`          | How briskly the paddle or ship follows       |
| `color`                | variant      | Block colour                                 |
| `ballColor`            | variant      | Ball, bolt and cockpit colour                |
| `paddleColor`          | variant      | Paddle, or ship hull                         |
| `interactive`          | `true`       | Pointer, keyboard and focus handling         |
| `autoStart`            | `true`       | Begin on mount instead of on first input     |
| `hideCursor`           | `true`       | Hides the cursor over the scene only         |
| `hint`                 | per game     | Caption under the scene, `""` removes it     |
| `respectReducedMotion` | `true`       | Static render when the user asks for less    |
| `onClear`              | —            | Fires once, when the last block is destroyed |

Options that belong to the other mode are simply ignored, so switching `game`
never means rewriting the props.

## Switching games

Changing `game` rebuilds the field from scratch: balls, bolts and falling
bonuses from the previous mode are dropped, the single animation loop is
cancelled and restarted, and the text configuration carries over unchanged. The
new mode always starts in a predictable state rather than inheriting whatever was
mid-flight.

## Callbacks

`onClear` fires exactly once per board, on the frame the last block is removed,
in either mode. It is the natural place to reveal a "back home" link, advance a
step, or start another transition. Changing `text` or `game` builds a fresh board
and arms it again.

To restart the same board, remount with a `key`:

```tsx
<Ricochet key={run} text="404" onClear={() => setRun(run + 1)} />
```

## Accessibility

The text is always present as real, selectable content in a visually hidden
paragraph, so screen readers and search engines read `404` whether or not a
single block has been destroyed. The canvas itself is `aria-hidden`, since it is
a decoration of text that has already been announced.

The playfield is a labelled `role="group"` whose label names the controls of the
running mode. When interactive it takes focus and accepts the keyboard, with a
visible `:focus-visible` outline. Nothing about the page depends on playing:
neither mode has a fail state, and neither traps focus or the pointer.

## Reduced motion

Under `prefers-reduced-motion: reduce` the component draws the complete text
once, standing still, and starts **no** animation frame at all — the loop is
never scheduled rather than being paused. This holds in both modes. Pointer
tracking, keyboard control and cursor hiding are all switched off, so the scene
is a static pixel wordmark. Pass `respectReducedMotion={false}` to opt out.

## Performance

Everything is drawn on a single `<canvas>` with plain `fillRect` calls, driven by
**one** `requestAnimationFrame` loop that owns every object in play — not one per
ball, bolt or bonus, and no timers. React state is never written per frame; the
only re-renders come from a phase change, which happens at most a handful of
times in a session.

- **Canvas, not DOM.** A 5-character word is 100–150 blocks, plus up to seven
  balls, a bolt pool and a spark pool. Moving that many DOM nodes every frame
  would mean layout and style work per node; one canvas is a fixed cost.
- Bolts, bonuses and sparks live in fixed-size pools and are recycled, so play
  allocates nothing per frame. Balls are the one live array, and it changes only
  when a bonus is caught or a ball is lost.
- Device pixel ratio is capped at 2, so a 3× phone does not pay for a 3× buffer.
- The frame step is clamped to 1/30s, and fast balls and bolts are sub-stepped,
  so nothing can tunnel through the text.
- A `ResizeObserver` re-lays out the board on resize, keeping the damage already
  done. The canvas is `width: 100%` with no intrinsic minimum, so it cannot cause
  horizontal overflow.

## Variants

| Variant | Look                                      |
| ------- | ----------------------------------------- |
| `mono`  | Off-white blocks on near-black, no glow   |
| `neon`  | Warm amber blocks, cyan paddle or ship    |
| `soft`  | Muted pastel blocks on a dark slate board |

Any of the three colours can be overridden individually while keeping the rest of
the variant.
