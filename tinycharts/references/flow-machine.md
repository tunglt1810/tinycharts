# Flow machine

**Answers:** a process built as a machine.

**Example:** `examples/flow-machine.js`, a recycling sorting line.

## When to use it

A process with stations that one thing rides through, where the machine itself is worth seeing and one station can send the thing round again: a sorting line, a car wash, a bottling plant, a bakery oven belt. For a loop with no machine, use a cycle. For steps on paper, use a flowchart.

## Layout

- One big isometric machine on a shed floor. The main belt runs from the start station to the end. A return belt runs back beside it to the start.
- Each station is a real part of the machine: a hopper, a gantry with a magnet, a hood with air jets, a screen, a camera arch, a baler. What each station takes out drops into a bin beside it.
- Each station has a name tag on a post. The current one has a red ring on the belt top at its station and a `now` tag. The machine over the belt stands in front of the ring.
- Event pills lie on the floor beside the belts. Arrows on the belts show the way. The return belt arrows are dashed.
- The thing on the belt changes as it passes the stations. It rides the belts between states, on top of the machine. The belt slats run all the time.
- People work the stations: one at the start, one at the check, two on the return line, one at the end.
- A side list at the bottom left names the states. The current one is filled red.
- A gauge at the bottom right shows what the guards read.
- The status: the station, and what the guards read.

## The statechart it suits

A chain of stations into a check. The check is a choice with a guard (`[only paper left]`) and `[else]` to a return station, which goes back to the start. One fault event at the start makes the loop happen. A second choice at the end counts the output (`[lorry has room]`). The rules: nothing faulty reaches the end, and the count never goes past its limit.

## Buttons

- `next stop`: the next station along the belt, or round the loop, as the guards say.
- One fault button. Refused away from the start, and when the fault is in already.

## Kit

`box`, `turn`, `cyl`, `who`, `flat`, `shape`, `oval`, `rule`, `line`, `flowArrow`, `pill`, `litRing`, `nowTag`, `walk`, `clipped`. The belts, the bins, the load and the side list are drawn in the sheet.

## Density

From the original (Free edition): about 6 stations, 1 big working part, 1 loop, 1 side list, 1 gauge, 2 buttons. The example sheet reaches at least these counts: 8 stations, 4 belts, 4 bins, 8 event pills, 5 people, 1 side list of 8, 2 gauges, 8 states, 2 buttons plus Play all.
