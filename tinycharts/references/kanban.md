# Kanban

**Answers:** where each item is, and what is held up.

**Example:** `examples/kanban.js`, a tailor's week of orders.

## When to use it

Several items that each pass the same columns, where some columns can hold only a few at once: orders in a workshop, loads of laundry, tickets on a team, patients in a clinic. For one item through a machine, use a flow machine. For who passes a job to whom, use escalation.

## Layout

- A picture strip on top: one prop over each column (the counter, the bench, the machine), with the people who work there. What is in a column shows in its prop.
- A row of state pills on the strip, joined by arrows. The current one is lit, with a `now` tag.
- A wooden board below. Each column has a header card with a pin: its name in capitals, the limit in red after it, and "n of m free" under it.
- Swimlanes, with their names in rotated capitals on the left.
- Each item is a card with a pin, a small picture, a name, a short note, the owner, and "order n" at the top. Each lane stacks its cards from the top, so cards never sit on top of each other. When a card leaves a column, the cards under it slide up.
- Empty slots are dashed.
- When the board is held up, the full columns turn red and the card that holds them gets a red frame.
- The status: how many are done, and what the shop is doing.

## The statechart it suits

A few states for the board as a whole: open, at work, held up, all done. One event moves one item. A choice after it reads the board: `[all ready]`, `[nothing can move]`, `[else]`. One event clears the hold, with a guard that something waits for it. One event starts again. The rules: no column goes over its limit, held up only when nothing can move, done only when every item is done.

## Buttons

- `move an order`: the item furthest along that can move. Refused when held up and when all are done.
- One button that clears the hold. Refused when nothing waits for it.
- One button that starts a new round. Refused before all are done.

## Kit

`box`, `turn`, `who`, `flat`, `fill`, `rim`, `shape`, `spline`, `line`, `rule`, `pill`, `nowTag`, `flowArrow`, `glide`, `tween`. The board, the cards and the garments are drawn in the sheet.

## Density

From the original: 5 columns with 2 limits, 2 swimlanes, 4 cards each with a picture, 5 props and 1 person on the strip, 2 buttons plus Play all. The example sheet reaches at least these counts: 6 columns with 4 limits, 2 swimlanes, 4 cards each with a picture, 6 props and 5 people on the strip, 4 state pills, 4 states, 3 buttons.
