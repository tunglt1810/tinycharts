# Annotated scene

**Answers:** everything happening in one place.

**Example:** `examples/annotated-scene.js`, a campsite at dusk: tents, a fire, a bear box, a lake.

## When to use it

Many things in one place, each with its own small state, all on one evening or one day: a campsite, a farm, a harbour, a school yard. The reader wants to see all of them at once. For one place that changes hour by hour with a slider, use a time-lapse. For what is inside a thing, use an exploded view.

## Layout

- One square isometric slab, drawn full: the place and everything in it, depth-sorted by `x + y`. Fill the corners: trees along the back edges, water or a field in one side corner, bushes and stones in the gaps.
- Many margin labels, both margins, about half each side. Keep them above and below the slab's side corners, where the slab is narrow. Each label is `NAME · STATE` and a note. The state word comes from the stop (LIT, OUT, OPEN, LOCKED, ZIPPED …). Size the margins for the widest state word.
- People move between spots at each stop (`glide` for the furthest one, the rest beside it). A person who goes indoors walks to the door and is not drawn; `arrive` brings them back out.
- The light follows the stop: a dusk wash (one colour-matrix filter) over the slab. Lit things (fire, lanterns, lit windows, fireflies) sit above the wash, so they glow.
- A strip of pills along the foot, "the evening, in order", one pill for each stop with its time. A surprise state sits off the end, joined by a red dashed line.
- Each state's `.on` group has its lit pill and a red ring round the thing that stop is about.
- A sun or a moon by the status.
- Background motion: smoke, fireflies, ripples, ducks, bats, a dog.

## The statechart it suits

The ideal is one small statechart for each thing, in parallel. The build has no parallel regions, so use one shared clock of stops instead: a chain through the evening, back to the first stop. Each thing reads its state from the stop and the data. The guards sit on the steps where one thing must be safe before people move on. One surprise from a late stop, with its way back. The rules: what must never be true while nobody is there, and what must be put away before night.

## Buttons

- `next step`: to the next stop. Its guards refuse it with `ctx.no`.
- One or two buttons for chores (douse the fire, stow the food), each with a guard.
- One button for the surprise.
- A tap on a thing fires its chore. A tap on an animal makes it talk (`ctx.bubble`).

## Kit

`board`, `box`, `gable`, `doorL`, `cyl`, `turn`, `tree`, `puff`, `cast`, `castDisc`, `who`, `dog`, `faceText`, `label`, `pill`, `dash`, `litRing`, `status`, `footnote`, `glide`, `arrive`, `rise`, `stroll`, `glideMs`. The tents, the pines, the small animals and the glow are drawn in the sheet.

## Density

From the original (Free edition): 7 margin labels, 6 people, 14 animals, 3 trees, about 20 objects, 1 button plus taps, 0 states. The example sheet reaches at least these counts at its busiest stop: 10 margin labels, 6 people, 14 animals, 12 trees, about 30 objects, 4 buttons plus taps, 8 states.
