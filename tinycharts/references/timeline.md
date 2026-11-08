# Timeline

**Answers:** how long each step takes, to scale.

**Example:** `examples/timeline.js`, a loaf of bread from the bowl to the last slice.

## When to use it

The question is how long. Some steps take minutes and some take hours, and the reader must see that at a glance. For several things on one clock at the same time, use a parallel timeline. For one day on a dial, use a clock.

## Layout

- One tape on the floor across the sheet, drawn with `tape()`. Each numbered stretch is one step. A longer step gets a longer stretch.
- Draw the stretches to scale, and say "to scale" in the subtitle. If the spans are too far apart (years against minutes), say "not to scale" and give each stretch a fixed minimum.
- Write the duration of each stretch in red beside it. Mark the clock time at the main points.
- Colour the stretches by kind (hands-on, waiting) and add a legend with the totals.
- One prop for each step beside the tape, on alternate sides. Margin labels lead to the props.
- A red playhead walks the tape. The person who does the work moves to the prop of the current step.
- Corners: a `dial` with the time now, and the totals. Turn its hands with `sweep` in the same move as the playhead, so the clock runs while the time passes.
- **A step with no fixed time** ("until it doubles", "until the queue is empty"): give it its usual length on the tape, write the condition in red and "about N min" under it. Write "about" before every clock time after that step.

## The statechart it suits

A straight chain, one state for each step. A guard where a step must wait for time (`[doubled]`, `[cool]`), with a `wait` event that passes the time. The rules are about order and time: nothing starts before the step it waits for has ended.

## Buttons

- `next step` moves the playhead to the next stretch.
- `wait` passes the time of a step that must wait.
- One button for the mistake that people make (cut it while hot). The guard refuses it.
- The status gives the duration and the clock time. A number with no source is "Illustrative" in the footnote.

## Kit

`tape`, `dial`, `sweep`, `label`, `who`, `glide` or `arrive` (the worker), `hops` (the playhead), `rise` (steam), `legend`.

## Density

From the original (Free edition): 6 stretches, 6 props, 6 margin labels, 2 people, 2 buttons, 3 corner pieces. The example sheet reaches at least these counts.
