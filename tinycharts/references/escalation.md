# Escalation

**Answers:** who takes it next, if no one answers.

**Example:** `examples/escalation.js`, a lost bag at a train station.

## When to use it

A request that goes up a fixed ladder of people or desks, each with a time limit to answer: a lost bag, a hotel complaint, a broken lift, a parcel that does not come. For a path with branches, use a flowchart. For tasks that move along columns, use a kanban.

## Layout

- A ladder of cards that steps up to the right. Each card has a clock, the level, who has it, and the time limit.
- Between two cards, a tag "no answer in …" with an arrow up. The tags already passed are drawn red.
- A start dot under the first card.
- The lit card has a red border and a "now" tag. A suitcase sits beside it.
- To the right, a stepped isometric building, one tier for each level, with the person of that level on top. The person of the lit level waves.
- A RESOLVED box with the traveller, and how the bag was found.
- Along the bottom, the state pills.
- The status: who has it and the time to answer, or how it was found.

## Motion

- `wait`: the hands on the lit card's clock turn through its time limit. Then the suitcase hops up to the next card.
- `they answer`: the suitcase hops into the RESOLVED box.
- `a new bag is lost`: the hands on every timed-out clock turn back to twelve, and the suitcase hops down to the first card.

## The statechart it suits

One state for each level and one end state. `wait` goes from each level to the next, but not from the top. `they answer` goes from each level to the end. One event starts again. The rules: one level at a time, no level past the top, and the end only by an answer.

## Buttons

- `wait`: no answer in time. Refused at the top level and once found.
- `they answer`. Refused once found.
- `a new bag is lost`. Refused before found.

## Kit

`dial`, `sweep`, `tween`, `box`, `windowL`, `windowR`, `faceText`, `who`, `person`, `flowArrow`, `pill`, `nowTag`, `line`. The cards, the tags, the suitcase and the RESOLVED box are drawn in the sheet.

## Density

From the original: 4 level cards with clocks, 3 timeout tags, 4 outcome tags, 1 RESOLVED box, 6 people, 1 building with 4 tiers, 3 buttons plus Play all. The example sheet reaches at least these counts: 4 cards with clocks, 3 timeout tags, 4 outcomes (one shown at a time), 1 RESOLVED box, 6 people, 1 building with 4 tiers, 5 state pills, 3 buttons.
