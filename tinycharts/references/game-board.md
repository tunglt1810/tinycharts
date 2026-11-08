# Game board

**Answers:** what chance decides.

**Example:** `examples/game-board.js`, a picnic walk decided by a weather die.

## When to use it

Chance decides what comes next, and the fun is in not knowing: a picnic in uncertain weather, a lazy Saturday, a walk with a dog that stops where it likes. For a fixed order, use a flowchart. For a loop that always comes round, use a cycle.

## Layout

- The board is the place itself: a 3 × 3 grid of squares on a raised plinth. Each square is one state with a small scene on it, and a numbered stone in its corner.
- A path of stepping stones snakes through the squares. The trail walked so far is red and dashed.
- A token (a small person) hops from square to square, one hop for each step. The die tumbles and lands first, then the token moves.
- A place off the board for the face of the die that throws you off the path (rain sends everyone to the bandstand).
- A big die at the bottom left shows the last roll, with what it means under it.
- A table of the faces: each face drawn, and what it does. The face just rolled is red.
- A row of the rolls so far.
- The current square has a red ring on its tile, under the scenery, and a `now` tag.
- The status: the square, and the weather.

## The statechart it suits

A composite state holds the squares. One event for each face of the die (`roll a 1` … `roll a 6`) leaves the composite state for a choice. The choice reads the new place: one guard for each square, and one for the place off the board. One event brings you back from off the board, and one starts again from the end. Because each face is its own event, the check proves the rules for every face. The rules: you reach the end only on the end square, never off the board, and never past the end.

## Buttons

- `roll the die`: rolls a random face. Refused off the board and at the end.
- One button to come back from off the board. Refused on the board.
- One button to start again. Refused before the end.

## Kit

`box`, `gable`, `tree`, `bird`, `who`, `person`, `turn`, `blob`, `oval`, `spline`, `flat`, `fill`, `rim`, `rule`, `line`, `litRing`, `nowTag`, `hops`, `tween`. The die, its faces and the board are drawn in the sheet.

## Density

From the original (Free edition): 9 squares in a 3 × 3 grid, a numbered path, 1 die, 1 token, 2 buttons. The example sheet reaches at least these counts: 9 squares with scenes, 9 numbered stones, a trail, 1 place off the board, 1 die, a table of 6 faces, a row of rolls, 7 people, 10 states, 3 buttons.
