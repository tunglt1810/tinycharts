---
name: tinycharts
description: Draws a process, or the events in one place, as a hand-drawn statechart sheet that a person can click. The sheet is one HTML page. It has an isometric picture, event buttons, and a statechart with checked rules. The skill has 28 diagram types, for example timeline, flowchart, sequence, kanban and sankey. The skill draws everyday subjects and technical or product flows. Technical objects show real logos. The skill exports SVG, PNG and GIF files. Use this skill when a person asks to show how something works, occurs or changes as an illustrated diagram that the person can play. Also use it when a person asks for a tinycharts sheet, or for a statechart drawn as a picture.
---

# Tinycharts

A sheet is one HTML page: a hand-drawn isometric picture on cream paper, up to four event buttons, and a status line. Behind the picture is a real statechart. The picture shows the states. The buttons are the events. A press that the statechart does not allow is refused in one plain line. The "Show the logic" panel lists the rules, and a search of every path proves them.

Every type has an example sheet in `examples/`. That example is also the template. Copy it with `new.mjs`, then change the content. Keep the layout of the template: do not draw a sheet from an empty file, and do not rebuild a layout that the template has.

`<skill>` in the commands is the directory of this skill. Run the commands with `bun`, from the project where the sheet goes. Temporary files go in `.tmp/` of that project. `references/sheet.md` has the sheet contract and every command. `references/kit.md` has every drawing function.

## The workflow

### 1. Write the process as states, events and guards

- **States:** where the thing can be, in plain words. Five to ten for an everyday sheet. A technical or product flow can have 20–40.
- **Events:** what moves it on. These become the buttons, four at most.
- **Guards:** the conditions that allow or stop an event.
- **Numbers:** write the source of each time, size or amount. A number with no source is marked "Illustrative" in the footnote.

### 2. Pick the type

Pick the row whose question matches what the reader wants to know. Say why in one line.

| Type | Answers | Example | Reference |
|---|---|---|---|
| Timeline | how long each step takes, to scale | `examples/timeline.js` | `references/timeline.md` |
| Parallel timeline | jobs that run at once, and meet on time | `examples/parallel-timeline.js` | `references/parallel-timeline.md` |
| Clock | a whole day, round once | `examples/clock.js` | `references/clock.md` |
| Time-lapse | one place, changing through the day | `examples/time-lapse.js` | `references/time-lapse.md` |
| Timing diagram | each signal, second by second | `examples/timing-diagram.js` | `references/timing-diagram.md` |
| Bands | which band a changing level is in | `examples/bands.js` | `references/bands.md` |
| Exploded view | what is inside, layer by layer | `examples/exploded-view.js` | `references/exploded-view.md` |
| Annotated scene | everything happening in one place | `examples/annotated-scene.js` | `references/annotated-scene.md` |
| Zoom | where it is, from the big picture down | `examples/zoom.js` | `references/zoom.md` |
| Route map | where it went, stop by stop | `examples/route-map.js` | `references/route-map.md` |
| Bubble diagram | which spaces connect, and how big | `examples/bubble-diagram.js` | `references/bubble-diagram.md` |
| Flowchart | every step, and where it splits or goes back | `examples/flowchart.js` | `references/flowchart.md` |
| Decision tree | every answer, and every outcome in view | `examples/decision-tree.js` | `references/decision-tree.md` |
| Comic strip | a story, one panel at a time | `examples/comic-strip.js` | `references/comic-strip.md` |
| Cycle | a loop, and the one way off it | `examples/cycle.js` | `references/cycle.md` |
| Flow machine | a process built as a machine | `examples/flow-machine.js` | `references/flow-machine.md` |
| Kanban | where each item is, and what is held up | `examples/kanban.js` | `references/kanban.md` |
| Game board | what chance decides | `examples/game-board.js` | `references/game-board.md` |
| Sankey | where it all goes, and how much | `examples/sankey.js` | `references/sankey.md` |
| Funnel | how many make it through each stage | `examples/funnel.js` | `references/funnel.md` |
| Stock and flow | what fills it, and what drains it | `examples/stock-and-flow.js` | `references/stock-and-flow.md` |
| Sequence | who says what to whom, in order | `examples/sequence.js` | `references/sequence.md` |
| Network | who reaches whom | `examples/network.js` | `references/network.md` |
| Fishbone | which causes are ruled in or out | `examples/fishbone.js` | `references/fishbone.md` |
| Escalation | who takes it next, if no one answers | `examples/escalation.js` | `references/escalation.md` |
| Catalogue | one set of states, many at once | `examples/catalogue.js` | `references/catalogue.md` |
| Break-even | the point where one option wins | `examples/break-even.js` | `references/break-even.md` |
| Quadrant | where each one falls on two measures | `examples/quadrant.js` | `references/quadrant.md` |

Read the reference of the type before you draw. It gives the layout, the statechart shape, the buttons, and the density the sheet must reach.

### 3. Start the sheet from the template

```
bun <skill>/build/new.mjs <type> <dir>/<name>
```

For a long technical flow (20 states or more, many services), use the second flowchart template, `flowchart-tech`. It has the steps down the middle, the ways each step fails beside them, and one board for each service. A flow that is mostly messages between a few actors is a sequence.

### 4. Write the statechart

Write `<name>.mmd` as Mermaid `stateDiagram-v2`. Put the guards in square brackets on the arrows: `shut --> open: open [unlocked]`. `references/sheet.md` says how the check reads choices, `[else]` and group states.

### 5. Draw, and add the buttons

- Change the picture in `<name>.js` to the new subject.
- Mark every state with `group('data-state="<id>"', …)`.
- A press that is not allowed calls `ctx.no('<why, in one line>')`.
- `goto(id)` sets the data of state `id` as well as the picture, because a link or a PNG opens a state with no steps before it.
- Draw the lit look of a state so that it does not cover the main object: a red ring goes round it or under it, not across it.
- The page has a Reset button. Do not add one.

### 6. Add the motion

A sheet with no motion looks dead. Every change that a reader must see moves: a thing that changes place travels, a level rises or falls, a count runs up, a belt turns. A redraw never makes a thing jump.

- Run every move through the kit: `glide`, `hops` or `tween`. Then Play all waits for the move to end. A move with its own timer is cut short by the next step.
- Make each move slow enough to follow. A move that stands for time takes time: pass `ms` to `glide`, or use `tween`. Move one main thing at a time, then let the rest follow with `arrive`.
- When the main thing travels far on a large sheet, keep the camera on it: pass `follow` to `glide` or `hops`, or call `ctx.track(el)`.
- A sheet with a clock turns its hands with every move that passes time: pass `clock: [dial, m0, m1]` to `glide` or `hops`, or call `sweep`. The hands ease in and out, and turn back when time goes back.
- Background life runs in `tick`: water flows, belts turn, wheels spin, smoke rises. Draw these moving parts in their own groups, and move them with `transform`.

### 7. Write the rules

Write 2–3 rules in `<name>.check.mjs`. Each rule is a thing that must always hold ("never two bags on one belt"). List the guards as `mutants`, so that the logic panel shows how each rule breaks without its guard.

### 8. Make the page, and fix every line

```
bun <skill>/build/make.mjs <dir>/<name>.js -o <dir>/<name>.html --png <dir>/png
```

Make runs the check, builds the page, and audits every state. Fix every line it prints. Then look at the PNGs, because the audit only finds text on text. It does not find text past its card, a line through text, or text on a picture.

To hand the sheet over:

- `<page>.html#state=<id>` opens one state.
- `bun <skill>/build/export.mjs <page>.html --story --png -o <dir>` writes a storyboard. Add `--svg` for SVG files.
- `bun <skill>/build/gif.mjs <page>.html -o <name>.gif` records Play all as a GIF. It needs `ffmpeg`.

## Rules

- **All lettering on the sheet is English.**
- **Draw it, do not diagram it.** Each state is a place or a thing in the picture, with people, objects and animals where they fit. Boxes and arrows alone are a failure.
- **Density.** The sheet reaches the counts "from the original" in the density line of its reference. A sheet that keeps the template layout usually reaches them. An item that the line does not count has no target. A sheet that looks emptier than the original type is a failure.
- **Technical sheets** stand the objects on a ground board with arrows between them. Add people where a person acts. Do not draw a whole street. Use `ctx.follow(true)` on a dense sheet.
  - Name a technology in quotes, `tech('PostgreSQL', x, y)`, so that the build puts its logo in the page. A technology that is not in `<skill>/icons/tech.json` gets no logo: add it first (`references/sheet.md`, Technical objects).
  - Messages are `message` envelopes that travel with `hops`, along the arrows.
