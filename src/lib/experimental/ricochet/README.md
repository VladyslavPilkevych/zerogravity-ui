# Ricochet

A short word or number, built out of destructible pixel blocks, with a paddle and
a ball underneath. Aim it at a 404 page and the missing number becomes something
to knock apart while the visitor decides where to go next.

```tsx
<Ricochet text="404" onClear={() => router.push("/")} />
```

Ricochet is an original component **inspired by the Breakout / Arkanoid game
mechanic**. It is not an implementation of either game, and it contains no
assets, sprites, level data, or code from them. The bitmap font, artwork, palettes
and physics are all written for this library.

## Concept

The text is rasterised through a built-in 5×7 pixel font, and every filled cell
becomes one block. The ball bounces off the walls, off the paddle and off the
blocks, and each hit removes the block it landed on. Clear them all and the
component fires `onClear`. Miss the ball and it simply serves again — the damage
already done to the text is kept, so the scene never resets under the player.

There is no score, no lives, and no fail state. It is a toy on a dead-end page,
not a game to win.

## Usage

```tsx
import { Ricochet } from "@/lib/experimental/ricochet"

// a 404 page
<Ricochet text="404" variant="neon" onClear={() => setDone(true)} />

// any short word
<Ricochet text="OOPS" variant="soft" pixelSize={22} />

// decorative only, nothing to play
<Ricochet text="500" interactive={false} autoStart={false} hint="" />
```

## Text

`text` accepts digits `0–9`, `A–Z`, spaces, and `. - + ! ? *`. Lowercase is
upper-cased automatically, and unsupported characters fall back to a blank cell.
`SUPPORTED_CHARACTERS` is exported if you want to validate input yourself.

**Three to five characters is the sweet spot.** The glyph grid is scaled to fit
the box on both axes, so longer text keeps working but the blocks shrink, the
ball needs longer to find the last few, and the shape stops reading as
typography. `404`, `LOST`, `OOPS`, `500` and `NOPE` all sit comfortably.

A blank `text` produces no blocks at all, which the component treats as an
already-cleared board rather than an unwinnable one.

## Controls

| Input                 | Effect                             |
| --------------------- | ---------------------------------- |
| Pointer or touch move | Paddle follows the horizontal axis |
| `←` / `→`             | Nudges the paddle one step         |
| Focus the scene       | Enables the keyboard controls      |

Set `interactive={false}` to make the scene purely decorative: no pointer
tracking, no focus stop, no cursor hiding. `autoStart` decides whether the first
ball is served on mount or on the first interaction.

## Props

| Prop                   | Default          | Notes                                        |
| ---------------------- | ---------------- | -------------------------------------------- |
| `text`                 | `"404"`          | Short word or number, 3–5 characters         |
| `variant`              | `"neon"`         | `mono`, `neon`, `soft`                       |
| `pixelSize`            | `26`             | Preferred block size, scaled down to fit     |
| `speed`                | `1`              | Ball speed multiplier                        |
| `color`                | variant          | Block colour                                 |
| `ballColor`            | variant          | Ball colour                                  |
| `paddleColor`          | variant          | Paddle colour                                |
| `interactive`          | `true`           | Pointer, keyboard and focus handling         |
| `autoStart`            | `true`           | Serve on mount instead of on first move      |
| `hideCursor`           | `true`           | Hides the cursor over the scene only         |
| `hint`                 | `"move to play"` | Caption under the scene, `""` removes it     |
| `respectReducedMotion` | `true`           | Static render when the user asks for less    |
| `onClear`              | —                | Fires once, when the last block is destroyed |

## Callbacks

`onClear` fires exactly once per board, on the frame the last block is removed.
It is the natural place to reveal a "back home" link, advance a step, or start
another transition. Changing `text` builds a fresh board and arms it again.

To restart the same board, remount the component with a `key`:

```tsx
<Ricochet key={run} text="404" onClear={() => setRun(run + 1)} />
```

## Accessibility

The text is always present as real, selectable content in a visually hidden
paragraph, so screen readers and search engines read `404` whether or not a
single block has been destroyed. The canvas itself is `aria-hidden`, since it is
a decoration of text that has already been announced.

The playfield is a labelled `role="group"`. When interactive it takes focus and
accepts arrow keys, with a visible `:focus-visible` outline. Nothing about the
page depends on playing: the component has no fail state, blocks the ball from
being lost permanently, and never traps focus or the pointer.

## Reduced motion

Under `prefers-reduced-motion: reduce` the component draws the complete text
once, standing still, and starts **no** animation frame at all — the loop is
never scheduled rather than being paused. Pointer tracking, keyboard control and
cursor hiding are all switched off, so the scene is a static pixel wordmark.
Pass `respectReducedMotion={false}` to opt out.

## Performance

Everything is drawn on a single `<canvas>` with plain `fillRect` calls, driven by
one `requestAnimationFrame` loop. React state is never written per frame; the
only re-renders come from a phase change, which happens at most a handful of
times in a session.

- **Canvas, not DOM.** A 5-character word is 100–150 blocks plus the ball, the
  paddle and a spark pool. Moving that many DOM nodes every frame would mean
  layout and style work per node; one canvas is a fixed cost regardless of the
  word.
- Device pixel ratio is capped at 2, so a 3× phone does not pay for a 3× buffer.
- The spark pool is fixed at 28 entries and reused, so impacts allocate nothing.
- The frame step is clamped to 1/30s, and fast balls are sub-stepped, so a
  backgrounded tab cannot let the ball tunnel through the text.
- A `ResizeObserver` re-lays out the board on resize, keeping the damage already
  done. The canvas is `width: 100%` with no intrinsic minimum, so it cannot
  cause horizontal overflow.

## Variants

| Variant | Look                                      |
| ------- | ----------------------------------------- |
| `mono`  | Off-white blocks on near-black, no glow   |
| `neon`  | Warm amber blocks with a soft cyan paddle |
| `soft`  | Muted pastel blocks on a dark slate board |

Any of the three colours can be overridden individually while keeping the rest of
the variant.
