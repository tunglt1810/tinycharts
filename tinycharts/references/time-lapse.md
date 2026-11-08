# Time-lapse

**Answers:** one place, changing through the day.

**Example:** `examples/time-lapse.js`, a beach from dawn to night.

## When to use it

One place where many things open, close, fill or light up at different hours: a street, a beach, a station, a market square. The reader drags the hour and sees each spot change. For one person's day, use a clock. For steps that do not repeat, use a timeline.

## Layout

- One isometric slab, its long side down to the right. The spots stand along it: fronts at the back, the open ground in front.
- One margin label for each spot, `NAME · STATE` and a note. The state word comes from the hour (OPEN, SHUT, ON DUTY, LIT …). Size the margins for the widest state word.
- An hour slider under the slab: a two-tone track (sand for day, navy for night), a tick each hour, hour words under it, a red knob. Each state is a stop on the track: a pill with its name, lit in `.on`. A surprise state sits off the track in its own group.
- The light follows the hour: a night wash over the slab, lamps and windows lit at dark, a sun or moon by the status.
- The crowd follows the hour too: each person has the hours when they are there.
- Status: the time word, and a short count ("5 of 8 open").
- Background motion: the sea, a bird, smoke, traffic.

## The statechart it suits

A chain of stops through the day, back to the first at night. One surprise event from a daytime stop, with its own state and a way on. One chore that must be done before a later stop, as a guard on the next step. The rules: what must never be true at an hour or after the surprise.

The slider fires the statechart, not the other way round:
- A drag or click forward fires `next step` once for each stop it passes. A refused guard stops it there, with `ctx.no`.
- A drag back is a jump: it opens that stop as `#state=` does, with the data of that hour.
- A drag to the same stop is refused with `ctx.no`. From the surprise, a drag forward fires its way on, and a drag back is a jump.

## Buttons

- `next step`: to the next stop.
- One button for the surprise.
- One or two buttons for things people do, each with a guard.
- The slider is the other input. Put its pointer listeners on `#art` once, in `init`, and stop the event so the camera does not pan.

## Kit

`board`, `box`, `gable`, `cyl`, `turn`, `tree`, `who`, `dog`, `bird`, `faceText`, `doorL`, `dash`, `pill`, `label`, `status`, `litRing`, `easeInOut`. The slider and the lapse (the whole sheet redrawn hour by hour) are drawn in the sheet.

## Density

From the original: 7 margin labels, about 22 people, 2 cars, 4 lamps, 2 trees, 6 fronts, 5 hour words and about 11 ticks on the track, 2 buttons plus the slider. The example sheet reaches at least these counts at its busiest stop: 7 margin labels, 22 people, 4 lamps, 2 trees, 6 fronts, 5 hour words, 2 cars, 4 buttons plus the slider.
