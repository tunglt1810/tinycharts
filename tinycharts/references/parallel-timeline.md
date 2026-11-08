# Parallel timeline

**Answers:** jobs that run at once, and meet on time.

**Example:** `examples/parallel-timeline.js`, three children and their dad getting ready, out of the door by 8:00.

## When to use it

Several things happen at the same time, share something (one bathroom, one oven, one line), and must all be ready at one moment. For one chain of steps, use a timeline. For one day on a dial, use a clock.

## Layout

- One lane for each job, side by side on one board, on a shared time axis. Draw each lane with `tape()`, coloured by what the job does. A legend gives the colours.
- The time axis runs along the front edge of the board. Each state is a tick on it.
- A red line crosses all lanes at the time now. The people stand on it and move with it.
- The shared thing stands behind the lanes. The end point (the door, the table) stands at the end of the lanes.
- Small props along each lane show what happens there.
- Left margin: one label for each lane, with a note.
- An inset with the last minutes, wider, one bar row for each lane, so the close finish can be read.

## The statechart it suits

One state for each moment where something changes, in time order. A guard on the shared thing (`[bathroom free]`) and a guard on the meeting (`[all ready]`). The rules: the shared thing is never used twice at once, and nobody finishes without the others.

## Buttons

- `next step` moves the red line to the next moment.
- One button that jumps the queue for the shared thing. The guard refuses it.
- One button that finishes early. The guard refuses it until all lanes are ready.

## Kit

`tape`, `glide` (the red line and the people on it), `who`, `box`, `label`, `legend`, `dial`.

## Density

From the original: 4 lanes, 4 margin labels and an end label, an inset with one row for each lane, a legend of 3, about 20 props, 1 person, 3 buttons. The example sheet reaches at least these counts: 4 lanes (Dad and three children), 4 margin labels for the lanes plus 2 for the bathroom and the door, an inset with one row for each lane, a legend of 6, about 20 props, 4 people, 7 states, 4 buttons.
