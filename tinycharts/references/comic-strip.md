# Comic strip

**Answers:** a story, one panel at a time.

**Example:** `examples/comic-strip.js`, a lost umbrella finds its way home.

## When to use it

A short story where each step is a moment worth a picture: a lost thing that comes back, a parcel on its way, a first day at a new job. Each panel is one state. For steps with exact times, use a timeline. For one walk through places on a map, use a route map.

## Layout

- A page of panels in a grid, read left to right and top to bottom. Each frame is a little skewed, like a hand-ruled page.
- Each panel holds its own small isometric scene, clipped to its frame. A night panel is dark.
- A caption box at the top left of each panel, with the panel number in red.
- The travelling thing is drawn in every panel where it is. Speech bubbles carry the words of the people.
- The current panel has a red frame and a `now` tag. Past panels stay. Future panels are faint.
- Red arrows in the gutters join the panels in reading order. A dotted line runs from the end of a row to the start of the next.
- One detour panel: a solid arrow with its guard in brackets skips past it, and a dashed arrow comes back from it with its event.
- A small red token of the travelling thing rides from panel to panel. The camera follows it, then closes in on the new panel. The panel fades in.
- The status: the panel name, and the two facts that open the guards.

## The statechart it suits

One state for each panel. `next step` moves along the reading order. One wait event that opens the way on (`[office open]`), one event that sets a fact, and a choice with a guard (`[duck handle described]`) that leads to the good panel or to the detour. The detour goes back with its own event. A last event starts the story again. The rules: the thing reaches its owner only when the fact is set, and nobody waits at a shut door.

## Buttons

- `next step`: the next panel. Refused while the way on is shut, and at the choice.
- One wait button. Refused away from its panel, and when the wait is over.
- One button that sets the fact. Refused away from its panel, and when the fact is already set.
- One button for the choice. Refused away from its panel.

## Kit

`clipped`, `fill`, `rim`, `who`, `cat`, `dog`, `box`, `cyl`, `turn`, `gable`, `tree`, `doorL`, `windowL`, `flowArrow`, `nowTag`, `walk`, `crossfade`, `shape`, `oval`, `line`, `rule`. The frames, the umbrella, the bubbles and the rain are drawn in the sheet.

## Density

From the original (Free edition): 8 panels plus 1 detour, 1 caption in each, about 2 bubbles, people in most panels, 1 night panel, 9 states, 2 buttons plus Play all. The example sheet reaches at least these counts: 8 panels plus 1 detour, 9 captions, 6 bubbles, people in 8 panels, 1 night panel, a cat and a dog, 9 states, 4 buttons.
