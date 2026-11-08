# Catalogue

**Answers:** one set of states, many at once.

**Example:** `examples/catalogue.js`, a shelf of nine jam jars.

## When to use it

Many things of one kind, each in its own state of one small statechart: jars of jam, house plants, hens, loaves, library books. Each kind may have its own limits (a jam with no sugar keeps one week, honey keeps for ever). For one thing that moves through stages, use a timeline. For a few things on two measures, use a quadrant.

## Layout

- A grid of the things, one cell each, on shelves or plates. Each cell is drawn to its kind and shows its state with one visual code: the lid on or off, the jam level, mould.
- A tag under each cell: the name, the state in words, and a row of dots for its limit (weeks it keeps, filled as the weeks pass, red when past).
- A shared clock for the shared event: a wall calendar with the week.
- A legend explains the code once.
- The state pills show the state of the picked thing, the one with the red tag.
- The status: how many are good, the week, how many are open and gone off.

## Motion

- Tap a sealed jar: the lid lifts off and lands beside the jar.
- Tap an open jar: a spoon dips in, and the jam level drops.
- Tap a jar that is eaten up or gone off: it slides away and a new jar slides in.
- `a week later`: the calendar page flips. A jar that goes off hops.

## The statechart it suits

One small statechart that every thing runs on its own: sealed, open, eaten up, gone off. Opening goes from sealed to open. A spoonful goes to a choice: `[last spoon]` picks eaten up, `[else]` stays open. A week later goes to a choice: `[past its weeks]` picks gone off, `[else]` stays open. A new jar starts it again. The rules: gone off only past its weeks, eaten up only when empty, and a sealed jar does not count the weeks.

## Buttons

- Tap a jar: the next event for that jar (open it, a spoonful, or a new jar).
- `a week later`: every open jar ages one week at once. Refused when no jar is open.
- `start the shelf again`.

## Kit

`turn`, `cyl`, `castDisc`, `blob`, `shape`, `line`, `legend`, `pill`, `nowTag`, `tween`. The dresser, the tags, the dots and the calendar are drawn in the sheet.

## Density

From the original (Free edition): 9 things, 9 name tags, 1 shared button, 1 legend line, 2 extra figures. The example sheet reaches at least these counts: 9 jars, 9 tags with dots, 9 lids, 1 calendar, 1 legend, 2 extra figures (the keeper and a cat), 4 state pills, 2 buttons plus a tap on each jar.
