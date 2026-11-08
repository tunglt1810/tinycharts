# Quadrant

**Answers:** where each one falls on two measures.

**Example:** `examples/quadrant.js`, twelve fruits from a bowl sorted by how ripe and how big they are.

## When to use it

Many things, each measured on two scales, with a line on each scale that splits them into four places: fruit by ripeness and size, apples by size and colour, tasks by how urgent and how important. For one measure against a cost, use break-even. For many things that each run one statechart, use a catalogue.

## Layout

- A chart with one measure on each axis. A red dashed line on each axis at its threshold, with a red tag that gives the rule ("ripe ≥ 60 %").
- Four panels, one for each place, each with its name, what it is for, and a count.
- A dot with a name for each thing sorted, at its two readings.
- At the side: the bowl with the things not yet sorted, a person, a scanner gate, and a gauge box with the two readings of the last thing, each a bar with a mark at its threshold. A cable joins the gate to the gauge box.
- Small pictures for two of the places (a lunch box, a windowsill with a pot).
- The state pills at the bottom right.
- The status: how many are sorted, and where the last one went.

## Motion

- `next fruit`: the fruit flies in an arc from the bowl into the scanner gate and stops there. The beam flashes while the gauge bars fill to its readings. Then the fruit flies on to its spot on the chart, and its panel hops.
- `a new bowl`: every dot flies back into the bowl.

## The statechart it suits

A start, a sorting state and a sorted end, with one choice. The event that sorts the next thing goes to the choice. Its guard `[last fruit]` picks sorted, `[else]` picks sorting. One event starts again. The rules: no more things than in the bowl, each thing in one place, and sorted only when the bowl is empty.

## Buttons

- `next fruit`. Refused once all are sorted.
- `a new bowl`. Refused before all are sorted.

## Kit

`flowArrow`, `turn`, `castDisc`, `box`, `cyl`, `person`, `pill`, `nowTag`, `tween`. The panels, the threshold tags, the dots and the gauge are drawn in the sheet.

## Density

From the original: 4 panels with counts, 2 threshold lines with tags, 1 gauge box, 2 people, 4 objects (bin, chute, boxes, crate), 2 buttons plus Play all. The example sheet reaches at least these counts: 4 panels with counts, 2 threshold lines with tags, 12 named dots, 1 gauge box with 2 bars, 2 people, 5 objects (bowl, scanner gate, lunch box, sill, pot), 3 state pills, 2 buttons.
