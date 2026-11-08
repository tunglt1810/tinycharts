# Bands

**Answers:** which band a changing level is in.

**Example:** `examples/bands.js`, a greenhouse: too cold, fine, too hot.

## When to use it

One level that rises and falls through the day, where the band it sits in decides what happens: a tide and a harbour bar, a greenhouse temperature, a reservoir, a battery charge. People act when the level crosses a line. For several signals at once, use a timing diagram. For one place with many spots, use a time-lapse.

## Layout

- Top: one big isometric picture of the place. The picture follows the level (the water in the basin, the colour of the seedlings, a lit heater, an open vent). Two in-picture labels name the threshold lines where the reader sees them (a gauge, a thermometer).
- Middle: one horizontal statechart strip. A small-capital kicker, then the states as boxes in a row, each with a name and a short note. Forward arrows are labelled above the row, ways back below it. A guard is red, above its arrow. The current box has a red ring and the `nowTag`, in `.on`.
- Bottom: the band chart. A value axis on the left, hours along the bottom. The bands are coloured background stripes by threshold (too cold / fine / too hot). Each threshold is a dashed line, red for the edge of a red band. Threshold words sit at one end of their line, band names at the other end, so the curve does not run through both.
- The curve: solid up to the time now, faint dotted ahead ("if nobody acts"). A red dot and a red line at the time now, with a time pill under the axis.
- Time words along the top of the chart (night, dawn, morning …), and the hour numbers under it.
- Optional lanes under the axis for what acts on the level (heater, vent), one bar for each hour it is on.
- Status: the state word, then the time and the level.
- Background motion: birds, a lit heater, a rising sun.

## The statechart it suits

One state for each band, plus one for each thing that acts in a red band (heating, venting). The level moves with `wait an hour`. A crossing fires the band's event (night falls, sun comes out). The rules: the level never stays in a red band for two steps, and two things that work against each other are never on together. Put the guards on the steps that act, so the check can take them away.

## Buttons

- `wait an hour`: the level moves one hour. Refused in a red band in its second hour, with what to do instead.
- One or two buttons for what acts (heater on / off, vent open / shut), each with a guard.
- One surprise (a cold wind, a storm surge) from one state only.
- Time runs between states: redraw the whole sheet hour by hour, as the timing diagram does.

## Kit

`board`, `box`, `gable`, `cyl`, `tree`, `pot`, `who`, `cat`, `bird`, `fence`, `dash`, `faceText`, `nowTag`, `litRing`, `flowArrow`, `status`, `footnote`, `easeInOut`. The strip, the bands, the curve and the greenhouse are drawn in the sheet.

## Density

From the original: 4 states in the strip with 6 arrow labels and 1 guard, 8 band words, 4 threshold lines with 4 labels, 6 value numbers, 8 time words, 2 in-picture labels, 0 margin labels. The picture has 14 people, 1 cat, 3 gulls, 9 boats, 7 buoys, 5 buildings (2 houses, a market hall, a boat shed, a kiosk), 1 van, 1 lighthouse, 3 lamps, 2 trees, 1 tide gauge. 2 buttons plus Play all. The example sheet reaches at least these counts at its busiest state. In the greenhouse, seed trays and raised beds stand in for the boats, bed plants and pots for the buoys, the thermometer for the tide gauge. The 5 buildings are the greenhouse, the shed, the potting shed, the cottage and the plant stall. The water tower is the tall landmark in place of the lighthouse. The user approved these stand-ins on 2026-11-08.
