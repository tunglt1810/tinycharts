# Stock and flow

**Answers:** what fills it, and what drains it.

**Example:** `examples/stock-and-flow.js`, a bath with a tap, a plug and an overflow.

## When to use it

An amount that builds up and runs down, where the inflows and outflows matter more than any one moment: water in a bath or a tank, money in a jar, books on a library shelf, people in a waiting room. For a count that only shrinks, use a funnel. For an amount that splits many ways at once, use a sankey.

## Layout

- The stock in the middle: a box with a 0..max scale on one edge, the level drawn as a fill, and the amount in large type ("40 L of 160 L").
- Each flow is a double pipe with a bow-tie valve and a label for its rate ("+40 L a turn").
- A cloud at the far end of each pipe: where the inflow comes from, where the outflows go.
- Pills for the states (empty, partly full, full) beside the stock, at the height they stand for, with a start dot.
- Below, an isometric picture of the real thing (a bathroom), its level kept in step with the stock.
- Dotted leader labels name each part: the inflow, the stock, the outflows.
- A drop token runs along the pipe for each press, and water runs in the open pipe. Then the level rises or falls to its new mark.
- The status: the state, the amount, and what went down the overflow.

## The statechart it suits

One state for each band of the level (empty, part, full) and one choice. Each flow event goes to the choice, and its guards pick the state from the level (`[bath is empty]`, `[at the overflow]`, `[else]`). An inflow at the top stays where it is: the overflow takes it. An outflow at the bottom is refused. The rules: the level never goes below empty or over the rim, and each state tells the truth about the level.

## Buttons

- One button for each inflow.
- One button for each outflow. Refused when empty.

## Kit

`box`, `flat`, `rim`, `rule`, `clipped`, `blob`, `oval`, `shape`, `line`, `fill`, `flowArrow`, `pill`, `nowTag`, `who`, `walk`, `tween`. The pipes, the valves and the clouds are drawn in the sheet.

## Density

From the original: 1 stock with a scale, 2 pipes with valves, 2 clouds, 1 picture with labels, 2 buttons plus Play all. The example sheet reaches at least these counts: 1 stock with a scale, 3 pipes with valves, 3 clouds, 3 state pills, 1 bathroom with 2 people, 4 leader labels, 2 buttons.
