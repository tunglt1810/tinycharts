# The kit

The kit is plain script files that share one scope. The build loads them in this order: `core`, `pen`, `marker`, `solids`, `life`, `text`, `marks`, `logo`, `objects`, `motion`. A sheet calls the functions below by name.

**Points.**
- A *world point* is `[x, y, z]`. x runs down and to the right, y runs down and to the left, z runs up.
- A *sheet point* is `[sx, sy]` in pixels. `P(x, y, z)` turns a world point into a sheet point. `OX` and `OY` set where the world origin falls on the sheet.

**Colours.** `PAL` holds the marker palette: `cream sand tan wood bark sage leaf mint sky blue navy lilac rose brick mustard butter stone grey`, plus `paper` and `red`. Keep `red` for the current state. `INK` is the line colour.

## core

- `P(x, y, z = 0)`: a world point as a sheet point.
- `at(sx, sy)`: a sheet point as a world point on the ground.
- `rnd()`: the next seeded random number in [0, 1). Use it only through `begin(seed)`, so each draw is the same.
- `begin(seed)`: start a drawing. Call it first in `draw`.
- `finish()`: write the drawing into `#art`. Call it last in `draw`.
- `put(key, sub, fn)`: queue a drawing in depth order. Things with a smaller key are drawn first. Use `x + y` as the key, so near things cover far things.
- `flush()`: draw the queue now. `finish` calls it.
- `group(attrs, fn)`: wrap what `fn` draws in `<g attrs>`. Mark a state with `group('data-state="id"', …)`, and put its lit look in `<g class="on">`.
- `n1(v)`: a number rounded to 0.1, as text.
- `pathOf(pts, closed)`: SVG path data for sheet points.
- `mixC(a, b, t)`, `litOf(c)`, `shadeOf(c)`, `soften(c)`: colour helpers. `litOf` is the top face, `shadeOf` is the side in shadow.

## pen

- `line(pts, {w, col, amp, over, curve})`: a hand-drawn stroke through sheet points.
- `rim(pts, w, col)`: one stroke per edge, corners crossed a little.
- `edge(a, b, w, over)`: one edge.
- `rule(pairs, col, w)`: many thin lines at once. Each pair is `[a, b]`.
- `dash(a, b, col, on, off, w)`: a dashed line.
- `wander(lamMin, lamMax, n)`, `resample(pts, ds)`, `hand(pts, amp, over, curve)`: the stroke maths that `line` uses.

## marker

- `fill(pts, col, {dx, dy, amp})`: a marker wash inside a shape, a little off the line.
- `flat(pts, col)`: a flat colour, with no texture.
- `hatch(poly, {dir, gap, w, col, keep, from, to})`: parallel ink lines across a shape.
- `ground(pts)`: a soft shadow on the ground.
- `cast(x, y, w, d, h, z)`, `castDisc(x, y, r, h, z)`: the shadow of a box or of a round body. Draw it before the solid.
- `hull(pts)`, `toothDefs()`: helpers for the shadow and the paper texture.

## solids

- `box(x, y, z, w, d, h, {top, left, ink, marks})`: an isometric box. `left` is the colour of the +x face.
- `turn(x, y, z, prof, col, {cap, ink, seam, wall, sink})`: a turned body (a pot, a cup) from a profile `[[r, z], …]`.
- `cyl(x, y, z, r, h, col, {ink, cap})`: an upright cylinder.
- `board(x, y, w, d, h, top, side)`: a cut ground slab. Technical sheets stand on one.
- `block(x, y, z, w, d, h, {wall, deck, t, sink, ink})`: a building with walls round a sunk roof deck.
- `gable(x, y, w, d, h, rise, {wall, roof, eave})`: a house with a pitched roof.
- `windowL(x, y, z, w, h)`, `windowR(…)`, `doorL(x, y, z, w, h, col)`, `doorR(…)`: a window or a door on the left (+y) or right (+x) face.
- `flight(x, y, z, n, go, up, wd, axis, col)`: a flight of steps.
- `fence(pts, {col, post, gap})`: a fence along world points.
- `pipe(pts, w, col)`: a pipe along sheet points.
- `faceM(face, x, y, z, s)`: the SVG matrix of a face ('top', 'left', 'right'), for drawing flat on it. The point `x, y, z` is the local origin. On 'top', local x runs along world +x and local y along world +y. On 'left' (the +y face, down-left), local x runs along world +x. On 'right' (the +x face, down-right), local x runs along world −y. On both side faces, local y runs down (world −z).
- `clipped(pts, fn)`: draw `fn` clipped to a shape.

## life

- `who(x, y, o, z)`: a person at a world point. `person(sx, sy, o)` takes a sheet point. Options: `shirt`, `pants`, `hair` ('short', 'bun', 'bob', 'cap', …), `arm` ('down', 'out', 'wave', 'up', 'hold'), `look` (1 or -1), `kid`, `size`, `sit`, `hold`, `say`. `hold` is a function that gets the right hand's sheet point `[x, y]`, to draw a thing in the hand. `say` is what the person says when the reader taps them, in a bubble. It is not drawn on the sheet or in the PNGs: for words that must always show, use a label.
- `cat(x, y, z, col)`, `dog(x, y, z, col)`, `bird(x, y, z, col)`: animals.
- `tree(x, y, r, z, col)`, `puff(x, y, z, {hw, h, col})`, `pot(x, y, z, plant, col)`: plants.
- `oval(cx, cy, rx, ry, n)`, `spline(pts, closed, step)`, `blob(cx, cy, rx, ry, bump, k)`, `capsule(a, b, ra, rb, n)`, `limbOf(pts, r)`: shapes in sheet points.
- `shape(pts, col, {w})`: a filled shape with an ink outline. `blot(pts, col)`: a filled shape with no outline.

## text

All lettering on a sheet is English.

- `title(kicker, big, x)`: the small kicker line and the big serif title.
- `subtitle(str, x)`: the line under the title.
- `status(big, small)`: the big status line at the top right, and its note. The page updates `#statusBig` and `#statusSmall`.
- `label(tx, ty, title, note, to, side)`: a margin label with a leader line to world point `to`. `side` is 'start' (left margin) or 'end' (right margin).
- `tag(x, y, w, text)`: a small card with a red dot.
- `pill(sx, sy, text, {lit})`: a state pill. Draw the lit copy inside the state's `.on` group.
- `faceText(face, x, y, z, s, {size, col, cls, anchor, scale})`: lettering flat on a face. `floorText(x, y, z, s, o)`: on the floor.
- `footnote(str, maxW)`: the source line at the foot. Write "Illustrative: …" when a number has no source.
- `textW(str, size, cls)`: the width of a text, to lay labels out.

## marks

- `arrow(pts, o)`: a red arrow along world points, with its head at the last point.
- `route(a, b, horizontalFirst)`: an arrow with one bend.
- `flowArrow(pts, {dashed, col, w})`: a red arrow along sheet points, for a chain of tags flat on the paper. `dashed` is for a way back.
- `tape(x0, y, len, spans, {w, z})`: a tape on the floor along world x. Each span `{sec, col}` gets a stretch to scale. Returns `[{a, b, m}]`, the start, end and middle of each stretch.
- `dial(sx, sy, r, min)`: a clock face at a sheet point, with its hands at `min` minutes after midnight. Turn the hands with the `clock` option of `glide` or `hops`, or with `sweep`. A sheet with a dial turns its hands on every move that passes time, and back when time goes back.
- `hourglass(x, y, z, {h, left, col})`: an hourglass. `left` is the share of sand still in the top, from 1 to 0. Use it for a step with no fixed time.
- `nowTag(sx, sy)`: the red "now" tag. Put it in the state's `.on` group.
- `litRing(pts)`: a red ring round a lit thing.
- `legend(items, sx, sy)`: a small key of colours and names.

## logo

- `logoOn(face, x, y, z, w, h, key, {fallback, pad})`: a logo on a flat face, on a light plate. With no logo, the name in letters.
- `logoWrap(x, y, ztop, r, w, h, key, {fallback, mid, strips})`: a logo wrapped round an upright cylinder.

## objects

Technical objects stand on their footprint centre `(x, y, z)` and return `{w, d, h}`. Options: `col` (body colour), `logo` (a logo key), `label` (letters when there is no logo).

- `tech(name, x, y, z, o)`: the object for a technology, by name or alias, with its logo. An unknown name throws `Unknown technology "x". Closest: …`.
- Each base object is `(x, y, z, o)`: `rack(…)` (a server rack), `dbCyl(…)` (a database), `queue(…)`, `gateway(…)`, `browser(…)`, `phone(…)`, `cloud(…)`, `bucket(…)` (storage), `devbox(…)` (a laptop), `lock(…)` (auth), `container(…)`.
- `message(x, y, z, o)`: a flat envelope, for a request or a reply.

## motion

Nothing moves in a still page (bare or export). Each move finishes at once there.

- `glide(ctx, el, a, b, {then, arc, spin, radius, clock, follow, ms})`: move a drawn thing from world point a to b on a low arc. Then redraw in `then`. `clock: [dialEl, m0, m1]` turns the dial's hands with the move, for exactly as long. `dialEl` is the dial or a group round it. `follow: w` keeps the camera on the thing while it moves, `w` sheet pixels wide. `ms` sets the time of the move, for a move that stands for a long time.
- `hops(ctx, el, pts, {then, arc, rest, clock, follow})`: move a thing through several world points, one hop per leg, with a short rest at each point. `clock` and `follow` as in `glide`. For one smooth walk with no stops (round a clock, along a path), use `tween`.
- `crossfade(ctx, redraw, ms)`: redraw the sheet, and fade the old picture out over the new one. Use it for a redraw that changes how a place looks (the light, a fire, a sign), so the change is soft, not a jump.
- `tween(ctx, ms, step, then)`: call `step(k)` on each frame for `ms`, with `k` from 0 to 1, eased. The move holds the animation lock like `glide`, so Play all waits for it. Use it for every move that the other helpers do not make: a walk along a curve, a level that rises, a belt, a hand on a big dial. Set the `transform` or the attributes in `step`, and redraw in `then`.
- `walk(ctx, el, pts, {then, ms, bob, follow, clock, onStep})`: walk a thing along world points at a steady pace, in one smooth move with a small step bob. Use it for a person or an animal on a path. `onStep(k, d, [sx, sy])` runs each frame, to leave a trail (footsteps, a red line) behind.
- `hopsMs(pts, {rest})`: how long `hops` takes over pts, to time other motion with it.
- `arrive(ctx, el, a, b, {delay})`: let a second thing follow the main move a beat later.
- `sweep(ctx, el, m0, m1, ms)`: turn the hands of a `dial` from `m0` to `m1` minutes in `ms`. Run it with the move that passes the time. The hands ease in and out, and turn back when `m1 < m0`.
- `sweepIn(ctx, el, m0, m1, ms)`: for a dial that a redraw already drew at `m1`: turn its hands in from `m0`.
- `glideMs(d)`: the time of a move of d pixels.
- `easeInOut(k)`: the ease curve.
- `rise(el, k, dx, dy, s0, s1)`: a puff of steam. Call it from `tick`.
- `stroll(el, pts, t, speed, phase)`: someone pacing to and fro. Call it from `tick`.
