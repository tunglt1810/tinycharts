# Exploded view

**Answers:** what is inside, layer by layer.

**Example:** `examples/exploded-view.js`, a layer cake: board, three sponges, jam, cream, icing.

## When to use it

The question is what is inside or underneath, and in which order the layers go: a cake, a street, a riverbank, a wall, a beehive. For one place that changes through the day, use a time-lapse. For a thing inside a thing inside a thing, use a zoom.

## Layout

- The thing stands in the middle, cut into layers that float apart along z. Each layer is a slab in its real material, with its own small details (crumbs, seeds, a drip of jam).
- Dashed guide lines join the rims across each gap, so the reader sees where each layer sits on the next.
- Every layer is on the sheet from the first state. A layer that is not there yet is a faint dashed ghost in its slot.
- The layer of the state now is risen a little and lit (red ring, `nowTag`).
- A click on a layer lifts it, and every layer above it, up and forward, and says its note. A click on a ghost is refused.
- One margin label for each layer, with its depth, size or time. Left and right in turn, level with the layer.
- Round the thing: the place where it is made or found (a kitchen, a street), with people and tools for each layer.
- A `dial` in a corner gives the time, and turns with `sweep` when something sets or cools.
- Background motion: steam over a warm layer, a pet, a person pacing.

## The statechart it suits

A chain through the layers, in the order they go on (or down). One state for each layer. Each layer state has a self-loop that waits for it to set, and the step to the next layer has a guard on it. The last layer has its own step. The rules: a layer goes only on a set layer, and the last layer goes on last.

## Buttons

- `add a layer`: the next layer drops into its slot (`arrive`). Refused while the layer under it is soft.
- `wait to set`: the time passes on the dial (`sweep`). Refused when the layer is set already.
- One button for the last layer (`ice it`). Refused until every layer is on and set.
- One button to start again.
- Click a layer to lift it, as well as the buttons.

## Kit

`cyl`, `turn`, `box`, `castDisc`, `dash`, `rule`, `shape`, `blob`, `who`, `cat`, `dog`, `label`, `dial`, `sweep`, `arrive`, `rise`, `stroll`, `nowTag`, `status`, `footnote`. The layers, the ghosts, the red ring and the click lift are drawn in the sheet.

## Density

From the original (Free edition): 5 layers, 6 margin labels, 6 people, 1 rat, 1 tree, 2 fossils, 1 train, 1 car, 1 manhole with a ladder, 1 button plus click, 0 states. The example sheet reaches at least these counts at every state: 7 layers, 7 margin labels, 6 people, 2 animals, 1 tree, 8 objects, 4 buttons, 7 states.
