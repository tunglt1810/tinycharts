# Cycle

**Answers:** a loop, and the one way off it.

**Example:** `examples/cycle.js`, a bee's trips to the flowers until the hive is full.

## When to use it

A round of steps that comes back to its start again and again, with one test that sends it off the loop: a bee's trips, a glass bottle's rounds, a bus route, a washing cycle. For a one-way flow with splits, use a flowchart. For a story that does not come back, use a comic strip.

## Layout

- A wide pale ring track in the middle of the sheet. The stations sit on it, evenly spaced.
- Each station is a round disc with a small isometric scene inside, clipped to the disc. A label card under the disc gives the name and a short note.
- Arrows run clockwise along the ring between the stations, with an event pill on each.
- A diamond on the ring before one station is the test. Its guarded arrow stays on the ring. The `[else]` arrow leaves the ring, red, to a station outside it. A curved arrow brings it back to the start.
- A dashed red shortcut runs inside the ring for an event that cuts a lap short.
- The centre: a dashed circle with the lap counter, the store that fills each lap, and the state of the load.
- A start dot with an arrow into the first station.
- The current disc has a red ring and a `now` tag. A token of the travelling thing flies round the ring on one smooth curve.
- The status: the station, and the store and the load.

## The statechart it suits

One state for each station, plus the one off the loop. One event moves along the ring. The test is a choice after the start station, with `[not full]` and `[else]`. One event inside a station that sets the load, and a guard on leaving that station. A shortcut event from two stations. One event brings it back from off the loop and resets the store. The rules: the store never goes over full, no lap starts when it is full, and the load is there when it should be.

## Buttons

- `fly on`: the next station, or off the loop when the test says so. Refused off the loop, and when the load is missing.
- One button that sets the load. Refused away from its station.
- One button for the shortcut. Refused away from its stations.
- One button that brings it back. Refused on the loop.

## Kit

`oval`, `fill`, `clipped`, `rim`, `litRing`, `nowTag`, `flowArrow`, `pill`, `walk`, `spline`, `who`, `tree`, `gable`, `box`, `bird`, `blob`, `shape`, `flat`. The ring, the discs, the diamond, the bee, the flowers and the comb are drawn in the sheet.

## Density

From the original: 5 stations plus 1 off the loop, 7 event pills, 1 diamond, 1 dashed shortcut, 1 centre counter, about 5 people, 6 states, 2 buttons plus Play all. The example sheet reaches at least these counts: 5 stations plus 1 off the loop, 10 pills, 1 diamond, 2 dashed shortcuts, a centre counter with 5 combs, 6 people, 6 states, 4 buttons.
