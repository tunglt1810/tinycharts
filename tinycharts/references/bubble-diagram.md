# Bubble diagram

**Answers:** which spaces connect, and how big.

**Example:** `examples/bubble-diagram.js`, a small café: pavement, terrace, seating, toilet, counter, kitchen and store, seen on an inspector's round.

## When to use it

A place is a set of rooms or zones, and the reader wants to know how big each one is and which doors join them: a café, a flat, a clinic, a school, a shop with a stockroom. Who may go through which door matters. For one walk in a fixed order across open ground, use a route map. For a box inside a box, use a zoom. For many things in one place at once, use an annotated scene.

## Layout

- One round bubble for each zone, drawn flat on the paper with a marker wash and an ink rim. The bubble AREA is in proportion to the m²: radius = k · √m². The pavement or street outside is a small bubble with a dashed rim and no m².
- Small isometric furniture inside each bubble, drawn round the bubble centre (set `OX`/`OY` to the centre, draw, `flush()`, then set them back to one base for the motion).
- A plate above or below each bubble: the name in capitals and "N m²". Put the plate on the side where no link runs. The plates do the job of margin labels.
- A straight ink link between the rims of two zones that share a door. A door mark across the middle of each link: a short bar and a door leaf. A few links get a note plate ("front door", "staff door").
- The current zone has a red ring and the `nowTag` beside it. The followed person stands in it and walks from bubble to bubble through the door marks (`hops`, along the shortest chain of links).
- A small floor plan in a corner: the real layout, rooms as coloured rectangles to scale with their names, door swings as quarter arcs, a scale bar, and "no door" on a wall that has none. The current room has a red outline.
- A legend of the zone colours, the door mark, and "area ∝ m²". Bubble colours group the zones (guests, staff only, wet, outside).
- The status: the time and the zone now; the note: the data that the guards read ("16 of 20 seats · hairnet off").
- Background motion: steam from cups and pans, a waiter pacing, a bird on the pavement.

## The statechart it suits

One state for each zone the followed thing stands in, plus an end state. The moves follow the links; a zone visited twice gets guards on its `next door` (`[toilet still to see]`). One door with a guard that only some people pass (`[hairnet on]`, staff only). A counter guarded against a limit that the zone's size sets (`[4 seats free]`). The rules: a zone is reached only through the zone that holds its door, and a zone never holds more than it has room for.

## Buttons

- `next door`: to the next zone, through one or more doors. Refused when the door ahead is closed to the walker.
- One button that lets the walker through a guarded door (`hairnet on`). Refused away from that door.
- One button that adds people to a zone (`a group comes in`). Refused when the zone is full.
- One button to end the round. Refused before every zone is seen.

## Kit

`box`, `cyl`, `turn`, `cast`, `castDisc`, `pot`, `puff`, `fence`, `who`, `bird`, `fill`, `line`, `rim`, `oval`, `shape`, `blob`, `rule`, `textW`, `nowTag`, `litRing`, `legend`, `status`, `footnote`, `hops`, `arrive`, `stroll`, `rise`. The bubbles, door marks, plates and floor plan are drawn in the sheet.

## Density

From the original: 7 bubbles with 7 plates (name and m²), 6 links with door marks, 2 link notes, 1 person, about 22 pieces of furniture, a floor plan of 7 rooms with door swings and a "no door" note, a legend of 6 items, about 7 states, 3 buttons plus Play all. No margin labels: the plates do that job. The example sheet reaches at least these counts: 7 bubbles and plates, 7 links with door marks, 5 link notes, 20+ people, about 40 pieces of furniture, a floor plan of 7 rooms, a legend of 6 items, 8 states, 4 buttons.
