# Zoom

**Answers:** where it is, from the big picture down.

**Example:** `examples/zoom.js`, a library: building, floor, shelf, book.

## When to use it

The thing sits inside a box, inside a box, inside a box, and the reader wants to find it: a book in a library, a letter in a town, a part in a warehouse, a file in a folder. Each level is a state inside the state of the level round it. For layers on top of each other, use an exploded view. For many things in one place at once, use an annotated scene.

## Layout

- One big scene that holds every level at once, at a size where the smallest box can still be seen. Not to scale: say so in the footnote.
- The box of the state now has a red ring and the `nowTag`. The camera zooms into it with `ctx.focus(sx, sy, zoom)`: about 1 for the whole thing, 4 for the smallest box (the shell stops at 4).
- A still page (export, bare, audit) never moves the camera. So a loupe in a corner shows the current box enlarged, with dashed lines to the box. It is redrawn for each deep state, and has no lettering in it.
- One margin label for each level, plus labels for the things round it. Left and right, level with their boxes.
- The status is the breadcrumb: the box now, then "in" or "on" its parent.
- Background motion: people walking, someone pacing with a trolley, a bird.

## The statechart it suits

One composite state for each box that holds another box, and one leaf state for each level you can look at. `zoom in` goes from a leaf to the composite one level in. `zoom out` sits on each composite, so it is inherited by every state inside it: put a guard on it (`[looking at the shelf]`), or it would skip levels. The deepest leaf has the actions on the thing itself, with guards. The rules: the view moves one level at a time, and the thing can only do what its own state allows (a book is lent once).

## Buttons

- `zoom in`: to the box one level in. Refused at the deepest level.
- `zoom out`: one level up. Refused at the top.
- One or two buttons for the thing at the deepest level (`borrow it`, `bring it back`). Refused at other levels, and by their guards.
- Click a box to zoom into it. A click on a box two levels in is refused: one level at a time.

## Kit

`board`, `box`, `cyl`, `windowL`, `windowR`, `doorR`, `flight`, `faceText`, `faceM`, `tree`, `puff`, `pot`, `who`, `cat`, `dog`, `bird`, `rule`, `dash`, `label`, `nowTag`, `status`, `footnote`, `glide`, `arrive`, `stroll`. The red ring, the books, the loupe and the camera stops are drawn in the sheet.

## Density

From the original: 4 margin labels, about 30 buildings, about 25 trees, about 10 people, 2 vans, 1 followed thing, 1 red selected box, 2 buttons plus Play all, a breadcrumb status. The example sheet reaches at least these counts: 9 margin labels, 10 people, 4 animals, 30 buildings (the library, the clock tower, 28 houses), 26 trees, 4 bushes, 3 pots, about 30 boxes (a library, a tower, 9 shelf units with about 400 books, a table, a trolley, a book return, a bench, steps, lamps), 2 vehicles, 1 followed book, a loupe, 4 buttons plus clicks, 4 levels (states).
