# Decision tree

**Answers:** every answer, and every outcome in view.

**Example:** `examples/decision-tree.js`, which house plant suits the room: light, pets, water.

## When to use it

A choice made by a few yes-or-no questions, where every end is worth seeing at once: which plant, which drink, which form to fill in, which train. For steps that loop or wait, use a flowchart. For one walk through places, use a route map.

## Layout

- The first question on a card at the top, with a start dot above it. Each card has a small picture at its left, the question at its right and "question n" under it.
- One dashed panel for each answer of the first question, with its name in small capitals. The later cards sit inside it.
- Under each card, two arrows with a `yes` and a `no` pill.
- Every outcome stands on one long shelf at the foot of the tree, drawn, with its name and a short note under it. A note in red marks an outcome with a catch.
- All outcomes join to one end card. The end card shows the picked outcome beside it.
- A way back runs up one edge to the first card, dashed, with its event and guard in rotated words. A second way back can run up the other edge.
- A red token sits beside the current card. It walks the tree's own lines, and a red line grows along them behind it. The path stays red.
- The branches not taken lie under a paper mist.
- People at the top (the ones who choose, the one who sells) and one at the end card.
- The status: the question now, and how many outcomes are still possible.

## The statechart it suits

One state for each question card, one for the end, and one or two after it. The answers are the same two events everywhere (`yes`, `no`). One surprise after the end that goes through a choice with a guard (`[plant is pet-safe]`). A counted way back (`next room [a room is left]`) and an `[else]` to a done state. The rules: the catch of an outcome never meets the thing it harms, and the way back never runs past its limit.

## Buttons

- `yes` and `no`: answer the card now. Refused away from a card.
- One button for the surprise after the end. Refused before the end.
- One button for the way back. Refused while a question is open.

## Kit

`flowArrow`, `pill`, `litRing`, `nowTag`, `walk`, `tween`, `arrive`, `pot`, `cat`, `person`, `box`, `legend`, `fill`, `rim`, `shape`. The cards, the shelf and the plants are drawn in the sheet.

## Density

From the original: 7 question cards, 14 answer pills, 2 panels, 8 outcomes on a shelf with 8 names, 1 end card, 1 way back, 4 people, 2 counter props, 8 states, 3 buttons plus Play all. The example sheet reaches at least these counts: 7 cards, 14 pills, 2 panels, 8 plants, 3 end cards, 2 ways back, 4 people, a cat and a kitten, 10 states, 4 buttons.
