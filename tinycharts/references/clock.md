# Clock

**Answers:** a whole day, round once.

**Example:** `examples/clock.js`, a lighthouse keeper's day.

## When to use it

Something that repeats every day, and where it is at each hour: a keeper, a bakery, a cat, a market stall. For steps that do not repeat, use a timeline. For jobs side by side, use a parallel timeline.

## Layout

- A round plinth laid flat, with the 24 hours round its rim. Midnight is at the back, noon at the front.
- One sector for each part of the day, with its own small scene. Night sectors are darker.
- The main thing stands in the middle (the tower, the oven, the tree).
- A red hand on the plinth points at the time now. The person walks round the rim to the sector of the state.
- One margin label for each sector, left half to the left margin, right half to the right.
- A `dial` in a corner gives the time, and turns with `sweep`.
- Background motion: something that only happens at night, or the sea.

## The statechart it suits

A cycle of states, one for each sector, back to the first at midnight. One surprise event from a daytime state, with its own state and a way back. One choice at a fixed hour that depends on something done earlier in the day. The rules: what must be true at night, and a limit that a repeated chore must not pass.

## Buttons

- `next step` moves the hand to the next sector.
- One button for the surprise.
- One button for the chore that must be done in time. Its guard refuses it when it is not needed.

## Kit

`dial`, `sweep`, `hops` (the walk round the rim), `who`, `cyl`, `turn`, `box`, `label`, `rise`, `stroll`.

## Density

From the original: 8 sectors with furniture, 8 margin labels, 24 hour numbers, 1 walker, 2–3 buttons. The example sheet reaches at least these counts.
