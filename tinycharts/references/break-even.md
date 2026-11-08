# Break-even

**Answers:** the point where one option wins.

**Example:** `examples/break-even.js`, a bike for £120 or the bus at £2.50 a ride.

## When to use it

Two options, one with a cost up front and one that costs each time, and the question of when the first pays off: a bike or the bus, a month pass or singles, buying a drill or hiring one. For many things on two measures, use a quadrant. For one amount that fills and drains, use stock and flow.

## Layout

- A chart with the use on the x axis and the money spent on the y axis.
- A flat line for the cost up front and a rising line for the cost each time, each labelled with its price.
- The area where the rising line is under the flat line is shaded red ("the bus is cheaper"). The area past the crossing is shaded blue ("the bike pays off").
- A note box over the crossing, with an arrow down to it: the break-even count and the sum that makes it.
- A dot on the rising line at the count now, with a line down to a dark chip on the x axis and a "now" tag.
- Under the chart, one picture panel for each option. The panel of the cheaper option so far has a red border. Each panel has a line with the money: paid so far, or still to pay off, or saved.
- The state pills under the panels.
- The status: the state and the money spent so far.

## Motion

- `ride` and `a week of rides`: the dot runs up the rising line to the new count, and the chip runs along the x axis. The bus pulls away from the stop and comes back.
- `start again`: the dot runs back down to zero.
- At the crossing, the crossing mark hops.

## The statechart it suits

Three states: one option cheaper, even, the other option cheaper. Each event that adds use goes to a choice. `[past the break-even]` picks the second option, `[at the break-even]` picks even, `[else]` keeps the first. One event starts again. The rules: each state holds only on its side of the crossing.

## Buttons

- `ride`: one more ride. Refused at the end of the axis.
- `a week of rides`: ten more. Refused at the end of the axis.
- `start again`. Refused before the break-even.

## Kit

`flowArrow`, `line`, `box`, `windowL`, `who`, `person`, `pill`, `nowTag`, `tween`. The grid, the shaded areas, the note box, the bike and the chip are drawn in the sheet.

## Density

From the original: 2 lines, 2 shaded areas, 1 note box, 1 crossing mark, 1 now marker, 3 picture panels, 2 people, 4 objects, 3 buttons plus Play all. The example sheet reaches at least these counts: 2 lines, 2 shaded areas, 1 note box, 1 crossing mark, 1 now marker with chip, 3 picture panels (the bus, the money as coin stacks, the bike), 2 people, 4 objects (shelter, sign, bus, bike), 3 state pills, 3 buttons.
