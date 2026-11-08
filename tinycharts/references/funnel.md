# Funnel

**Answers:** how many make it through each stage.

**Example:** `examples/funnel.js`, a packet of bean seeds to the picking.

## When to use it

A count that only shrinks, stage by stage, where the drop at each stage matters: seeds to harvest, people who sign up to people who finish, eggs to chicks, letters sent to replies. For an amount that splits many ways, use a sankey. For a level that can rise again, use stock and flow.

## Layout

- The start at the top (a packet), with a start dot and its count.
- Dashed stage boxes, one under the other, each narrower than the one above: its width grows with its count. Each box gives the stage, the count once reached ("·" before), and a short note on what was lost.
- Soft tinted trapezoids join the boxes.
- Dotted leader lines run left to a small isometric picture of each stage.
- Brackets with rotated capitals group the stages (UNDER GLASS, IN THE BED).
- What drops out runs off the side in red dashed arrows, with "−n", to one collector line and a compost bin with the total. A chance loss (the slugs) leaves the stage box on its own arrow, and the stage note names it.
- An arrow from the last box down to the end (a basket with a person), and a card for the end where nothing is left.
- A token hops from stage to stage.
- The status: the stage, the count, and the total lost.

## The statechart it suits

One state for each stage, a start, and two ends. One event moves to the next stage and drops a fixed count. One chance event in some stages drops more (`slugs in the night [plants in the bed]`). A choice at the last stage picks the good end (`[some plants left]`) or the empty end (`[else]`). One event starts again. The rules: what is left and what was lost always add up to the start, and the good end is reached only with something left.

## Buttons

- `next stage`: the next stage, or one of the ends.
- One chance button. Refused in stages it cannot reach.
- One button to start again. Refused before an end.

## Kit

`box`, `turn`, `blob`, `oval`, `shape`, `line`, `fill`, `flowArrow`, `litRing`, `nowTag`, `person`, `hops`. The trays, the beds, the slugs, the packet and the boxes are drawn in the sheet.

## Density

From the original: 1 start, 5 stage boxes, 4 joins, 5 pictures, 2 brackets, 1 end with 1 person, 1 compost count, 2 buttons plus Play all. The example sheet reaches at least these counts: 1 start, 5 stage boxes, 4 joins, 5 pictures, 2 brackets, 4 leak arrows, 2 ends, 1 person, 1 compost bin, 8 states, 3 buttons.
