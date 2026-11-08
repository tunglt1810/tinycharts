# Sankey

**Answers:** where it all goes, and how much.

**Example:** `examples/sankey.js`, where a household's water goes in a day.

## When to use it

An amount that splits and joins on its way, where the size of each part matters: a house's water, rain in a garden, a family's money in a month, a shop's flour. For how many survive each stage, use a funnel. For a level that rises and falls, use stock and flow.

## Layout

- Three columns of node bars: where it comes in, what it is used for, where it goes out. A column head in small capitals above each.
- Bands join the bars. Each band's width is its amount, to scale. The bands are filled with marker colour, one colour for each use, and keep it on both sides.
- The bands in and the bands out of each bar add up to the bar. In equals out.
- Each node has its name and its amount. The uses have pills on their bands.
- A scale bar: the width of 50 litres.
- Below, a picture of the place cut open, with a pill at each part that matches a node. The lit node lights its pill too.
- One unit (a drop) runs one whole band for each press. It sinks away at the end, and a new drop rises there for the next band.
- The current node has a red ring and a `now` tag.
- The status: the node, and the totals in and out.

## The statechart it suits

One state for each node, and a start state. One event takes the next unit, and a choice picks its source by where it sits in the stack (`[from the barrel]`, `[else]`). A second choice picks its use, with one guard for each band. One event takes it out, and one back to the start. Two events at the start change the split (a saver shower head, a rain barrel), so the bands change width. The rules: in equals out for every setting, a source only feeds the uses it may, and each unit keeps to its band.

## Buttons

- `follow the litre`: one step along its band.
- Two buttons that change the split. Refused away from the start.

## Kit

`fill`, `pathOf`, `pill`, `litRing`, `nowTag`, `walk`, `tween`, `box`, `turn`, `who`, `flat`, `line`, `spline`, `blob`, `shape`, `flowArrow`. The bands, the node bars, the meter and the drop are drawn in the sheet.

## Density

From the original: 6 nodes, 5 bands, 2 split marks, a cross-section with 6 pills, 1 person, 1 scale bar, 3 buttons plus Play all. The example sheet reaches at least these counts: 10 nodes, 12 bands, 2 split marks, a cut-open house with 10 pills, 3 people, 1 scale bar, 10 states, 3 buttons.
