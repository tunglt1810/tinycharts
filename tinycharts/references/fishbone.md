# Fishbone

**Answers:** which causes are ruled in or out.

**Example:** `examples/fishbone.js`, why a loaf of bread did not rise.

## When to use it

One bad result with several possible causes, checked one by one until one is left: a flat loaf, a dead plant, a late train, a flat tyre. For causes that lead to each other in a chain, use a flow. For a choice made by yes and no questions, use a decision tree.

## Layout

- A spine from the tail on the left to the head on the right. The head holds the effect, a small picture of it, and a count of the bones checked.
- Six bones, three above the spine and three below. Each bone has a label box at its tip and a small picture past the box.
- Each bone has a question near the spine and two evidence ribs. The ribs show `·  ·  ·` until the bone is checked.
- When a bone is checked, a lens runs from the spine up the bone to its label. Then the evidence and a chip land: "ruled out" in grey with the question struck through, or "ruled in" in red with the bone drawn red.
- The state pills sit under the head.
- The status: how many bones are checked and the last one checked, or the cause at the end.

## The statechart it suits

A start, a checking state and an explained end, with one choice. The event that checks the next bone goes to the choice. Its guard `[all six checked]` picks explained, `[else]` picks checking. One event starts again. The rules: no more bones than there are, a cause only after every bone, and one cause ruled in.

## Buttons

- `check next bone`: checks the next bone in order. Refused once all are checked.
- `explain the bread`: says how the cause gave the effect. Refused before all are checked.
- `bake again`. Refused before all are checked.

## Kit

`line`, `shape`, `box`, `cyl`, `turn`, `blob`, `windowL`, `who`, `pill`, `nowTag`, `flowArrow`, `tween`. The ribs, the label boxes and the chips are drawn in the sheet.

## Density

From the original: 6 bones, 12 evidence ribs, 6 pictures, 1 head, 6 verdict chips. The example sheet reaches at least these counts: 6 bones, 12 ribs, 6 questions, 6 pictures, 1 head with a picture, 6 chips, 3 state pills, 3 buttons.
