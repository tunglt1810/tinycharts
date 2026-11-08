# Route map

**Answers:** where it went, stop by stop.

**Example:** `examples/route-map.js`, a dog's walk round the park: gate, lamp post, oak, field, pond, fountain, bench, kiosk, and back to the gate.

## When to use it

One thing goes from place to place in one area, in a fixed order, and the order matters: a dog on a walk, a cat round the garden, a parcel round a depot, a visitor round a museum. The reader wants to see where it went and what each stop was for. For many things in one place at once, use an annotated scene. For a box inside a box, use a zoom. For a loop that repeats until a count is reached, use a cycle.

## Layout

- One square isometric slab, drawn full: the area and everything in it, depth-sorted by `x + y`. Fill the corners with trees, beds, water and small things.
- A path drawn on the ground as a wide sandy stroke through every stop, in order. The part walked so far is a dashed ink line on top of it.
- A numbered pin at each stop: faint until it is reached, ink once it is passed, red (in the state's `.on` group) at the stop now. A `litRing` round the place of the stop now.
- The followed thing (and whoever goes with it) travels the path between stops with `hops`, through the bends of the path. A dash off the path (a chase) is a `glide`.
- Margin labels, both margins, above and below the slab's side corners. Each is a place name in capitals and a short note. The notes carry the rules ("lead on: the road is here").
- A list "the trail, in order" at the foot, in two columns: one numbered row for each stop with a note. Rows not reached yet are faint. The surprise state is a row with "!" instead of a number.
- The status: the time and the stop now; the note: the data that the guards read ("on the lead · stop 4 of 8").
- Background motion: traffic on the road, ducks, a jogger, birds, a fountain.

## The statechart it suits

A chain of stops in a composite state, back to the first stop. Effects are keyed by event name, so give the first and last legs their own events (`set off`, `back to the gate`). One surprise from a middle stop, with its way back. The end of the route (`go home`) sits on the composite, so every stop inherits it, and its guard (`[back at the gate]`) is the only thing that keeps the walk from ending early. The rules: what must be true at certain stops (on the lead by the road and by the water), and that the route always ends where it started.

## Buttons

- `next step`: to the next stop. Its guards refuse it with `ctx.no`.
- One button for a thing the follower does at some stops (`lead on / off`). Refused where it is not allowed.
- One button for the surprise.
- One button to end the route (`go home`). Refused anywhere but at the end.

## Kit

`board`, `box`, `cyl`, `turn`, `gable`, `fence`, `tree`, `puff`, `cast`, `castDisc`, `who`, `dog`, `bird`, `line`, `dash`, `flat`, `label`, `litRing`, `nowTag`, `status`, `footnote`, `hops`, `glide`, `arrive`, `stroll`, `rise`. The pins, the trail list, the kiosk, the bandstand and the ducks are drawn in the sheet.

## Density

From the original: 9 margin labels, 4 people, 1 followed animal and about 4 birds, 1 tree, about 35 objects (a cut-open house with kitchen, sofa, shelves, rug, table and chairs; bins, washing line, pots, deck chair, bird table, bird bath, shed, mower, pond, reeds, vegetable bed, barrow, bench, flower bed, stepping stones), about 10 states (9 stops and a surprise), 2 buttons plus Play all, a trail list. The example sheet reaches at least these counts: 10 margin labels, 8 people, 11 animals, 17 trees, about 40 objects, 10 states, 4 buttons, a trail list of 10 rows.
