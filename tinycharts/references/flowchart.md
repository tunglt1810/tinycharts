# Flowchart

**Answers:** every step in order, and where the process splits or goes back.

**Example:** `examples/flowchart.js`, fixing a flat bicycle tyre.

## When to use it

A process that goes one way, with one or two real branches and at most one loop back ("still flat, start again"). The reader wants to see each step in order and what each step looks like. For many actors that send things to each other, use a sequence. For dates on a line, use a timeline.

## Layout

- The states run down the middle of the sheet as small tags in capitals, joined by red routes. The event is in hand lettering beside each route.
- A branch splits into two tags side by side, with the guard on each route (`[a patch in the kit]`). The two sides join again below.
- A loop back is a dashed route up the side of the chain, with its guard on it.
- Round the chain, a small isometric doodle shows each step happening, on its own board, with a person at work and a short say line. A dotted grey link joins each doodle to its tag.
- A red token walks the routes. The tag and the doodle of the current state light up.
- The title is at the top left, the status at the top right, the footnote at the foot.

## The statechart it suits

A chain of 7–10 simple states. One choice with guards, or two events from one state that the reader picks. One loop back to an earlier state.

## Buttons

- `next step` walks the token one route.
- At a branch, one button for each side.
- One button for a step that the reader can forget (the loop shows what happens then).
- A press that skips a step, or that the state does not allow, is refused in one line.
- More ways to go wrong than buttons: one button, `it goes wrong`, takes the way that fits the current step.

## Kit

`tag`, `route`, `arrow`, `dash`, `board`, `who`, `hops` (the token), `ctx.follow`. Doodles from `box`, `turn`, `cyl`, `pipe`, `shape`.

## Density

From the original (Free edition): 9 states, 6 doodle stations, 7 people, 8 route words, 3 buttons, a token with a red trail. The example sheet reaches at least these counts.

## A long technical flow

**Example:** `examples/flowchart-tech.js`, a web shop checkout. Start it with `new.mjs flowchart-tech <dir>/<name>`.

- The sheet is 2620 × 1620. The steps run down the middle as tags. The ways each step fails sit to the right of it, with the guard words beside them.
- Each service stands on its own board, four on each side, drawn with `tech()` so that its logo shows. A dotted link joins each step to the board of the service that does it. A pill on the board gives the service's own state.
- A `message` envelope hops from board to board along the links as the token walks the steps. The camera follows.
- A group state holds the steps that a cancel can stop.
- Four buttons: `next step`, the choice at the start, `it fails here` (the failure that fits the current step), and `cancel order`.

**Density:** 20 states, 5 choices, 1 group state, 8 service boards, 9 people, 4 buttons, a token with a red trail, and an envelope.
