# Timing diagram

**Answers:** each signal, second by second.

**Example:** `examples/timing-diagram.js`, a level crossing: lights, bell, barrier, train.

## When to use it

A few signals that change together, where the order in seconds matters: a crossing, a lift door, a toaster, a traffic light. One signal must change before another may. For jobs of minutes or hours side by side, use a parallel timeline. For one place through the day, use a time-lapse.

## Layout

- Left: a dashed board with one lane for each signal, stacked. The lane name in small capitals at the top left, a short note under it.
- One pill for each value of the signal, right-aligned against the start of the time axis. The current value has the lit pill.
- The trace of each lane is a step line from 0 to the time now. A slow change (a barrier moving) is a ramp across the rows; a fast one (a flashing lamp, a bell) is a small wave on its row.
- A faint grid: a line every 5 s, a dotted line for each row.
- A seconds axis under the board, a number every 5 s and a tick each second. A red line crosses all lanes at the time now, with a red time pill under the axis.
- One numbered dot on the axis for each state. A list of the states in order under it.
- Right: a picture of the thing itself, drawn from the time now (lamps lit, barrier angle, the train's place, cars waiting).
- Under the picture: an "EVENTS" box. Each change gets a row with its second, as the time passes it. "nothing yet" at the start.
- No margin labels: the lane names do that job.
- Background motion: lamps flashing in turn, a bell, traffic.

## The statechart it suits

One state for each moment where a signal changes, in time order, back to the start. One surprise event (a second train) that holds a later step back. The rules say which signal must change first, and what must never be true at once. Each guard is on a step that can fire or be refused from the same state, so the check can take it away.

## Buttons

- `next step`: to the next change.
- One button for the surprise.
- One or two buttons for steps with a guard (lower, raise). Each refused press says why with `ctx.no`.
- Time runs between states: redraw the whole sheet second by second, as the time-lapse does.

## Kit

`board`, `box`, `cyl`, `gable`, `tree`, `who`, `dog`, `bird`, `fence`, `dash`, `pill`, `nowTag`, `status`, `easeInOut`. The lanes, the traces, the barrier arm and the train are drawn in the sheet.

## Density

From the original: 4 lanes with 4 lane names and 1 lane note, 8 value pills, 7 axis numbers and about 30 second ticks, 1 EVENTS box, a picture with 3 cars, 2 people, 2 signals and about 8 props (button box, tree, 4 bollards, post box, paving), 3 buttons plus Play all. The example sheet reaches at least these counts.
