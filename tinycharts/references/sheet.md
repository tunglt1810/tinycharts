# A sheet, and the commands

A sheet is four files with one name: `<name>.js` (the drawing and the buttons), `<name>.mmd` (the statechart), `<name>.check.mjs` (the rules) and `<name>.json` (what the check found). `<skill>` is the directory of this skill. Run every command with `bun`, from the project where the sheet goes.

## Start from the template

```
bun <skill>/build/new.mjs <type> <dir>/<name>
```

This copies the example sheet of the type to `<dir>/<name>.*`. A wrong type name lists the three closest names. The command does not overwrite a sheet unless you add `--force`.

## The sheet file

- `SIZE`: optional, `[1400, 1400]` by default. A dense technical sheet can be larger, for example `[2400, 1400]`.
- `ABOUT`: optional, the question the type answers.
- `draw(seed)`: draw the whole sheet. Start with `begin(seed)` and end with `finish()`.
  - Mark each state with `group('data-state="<id>"', …)`. Every state of the `.mmd` needs a mark.
  - Draw the lit look of a state (red ring, `nowTag`, lit pill) inside `<g class="on">` in that group.
- `init(ctx)`: add the buttons, and return `{goto(id, play), story, tick?, click?}`.
  - `goto(id, play)`: put the sheet in state `id`. When `play` is true, Play all called it, so animate the move. Otherwise go there at once.
  - `story`: the states in the order of the flow. Play all and the storyboard use it.
  - `tick(t, dt)`: optional background motion, each frame.
  - `click(e)`: optional, a click on the sheet.

The sheet and the kit share one scope. Do not give a sheet helper the name of a kit function (`references/kit.md`), for example `route` or `label`: the sheet's function replaces the kit's.

## ctx

- `ctx.button(text, fn)`: an event button. Four at most.
- `ctx.say(text)`: the result line. `ctx.hint(text)`: the hint line.
- `ctx.no(text)`: refuse a press. Say why in one line. The button shakes.
- `ctx.state(id)`: light state `id`. Call it after each redraw.
- `ctx.busy(job)`, `ctx.idle(job)`: the animation lock. The kit motion (`glide`, `hops`, `tween`) calls them for you. Play all waits until no job runs, then holds the step for a moment. A move that does not take the lock is cut short by the next step.
- `ctx.focus(sx, sy, zoom, hold)`, `ctx.follow(on)`: the camera. `follow(true)` keeps the current state in view. Use it on dense sheets.
- `ctx.track(el, w)`: the camera keeps `el` in the middle on each frame, `w` sheet pixels wide. `ctx.track(null)` stops it and leaves the view where it is. `glide` and `hops` call it for you with `follow`.
- `ctx.bubble(sx, sy, text)`, `ctx.hop(el)`: a speech bubble, a small hop.
- `ctx.still`: true on a bare or export page. Do not start timers there.

## The rules

`<name>.check.mjs` calls `check({mmd, init, guard, effect, rules, mutants})` from `build/check-lib.mjs`, then writes `<name>.json`.

- `guard`: one function per guard name in the `.mmd`. Each returns true when the event is allowed.
- `effect`: one function per event that changes the data.
- `rules`: 2–3 rules, each `{rule, says, holds: s => …}`. `s.at` is the state, and the data is on `s`.
- `mutants`: the guards to take away one at a time. The check then shows the shortest path that breaks each rule.

How the check reads the `.mmd`:

- The check starts from `init` and visits every state that the guards let it reach. It has no chance. To show "sometimes the card is declined", put the data that makes both ways possible in `init`, for example a first tap that fails and a second that works.
- An event's `effect` runs first. Then the guards of a `<<choice>>` after it read the new data. So `check --> ok: [valid]` after a choice can test what `check` just set.
- `[else]` on a choice arrow is true when no other arrow of that choice is.
- A group state, `state fulfilment { … }`, can have its own arrows. Write the labels of its states inside the block: a state named first at the top level stays out of the group. An arrow into the group goes to the group (`stock_ok --> fulfilment`), and `[*] --> created` inside the block picks the first state. An arrow from the group leaves from every state inside it: `fulfilment --> cancelled: cancel` lets "cancel" happen at each step until the group ends.
- The built-in rule says every arrow can fire. An arrow whose guard is never true breaks it. Use a group state or a choice for "only before X".
- `goto(id)` must set the data of state `id` as well as the picture, because `#state=<id>` and the storyboard open a state with no steps before it.

## Make: check, build, audit

```
bun <skill>/build/make.mjs <dir>/<name>.js -o <dir>/<name>.html [--png <dir>]
```

1. Make runs the check. A broken rule stops it.
2. Make builds one page with the logic panel.
3. Make opens every state in headless Chrome and audits it. It finds text off the sheet, text on top of other text, and states with no mark. Then it plays the story with Play all. An error in a move gives the line `<sheet>: error: <message>`. Make does not press the event buttons. Press each button yourself.
4. Make prints each problem as `<sheet>: <state>: <problem>`, and exits 1. It prints `ok` when the page is clean.
5. With `--png`, it also writes one PNG for each state of the story.

Fix every line before you hand the sheet over. Then look at the PNGs, because the audit only finds text on text. It does not find text that runs past its card or board, a line through text, or text on top of a picture.

The PNGs open each state by its id. A state that the story visits many times with different data gives the same picture each time.

## Themes

A theme is a JSON file that gives new colours to `PAL` names: `{ "ink": "#22303a", "red": "#cf4457", "paper": "#f5f7f6" }`. Make and build take it with `--theme <file>`. A name that is not in `PAL` stops the build.

- The build changes the colour of a name everywhere on the page: in the kit, the page style, the logos and the sheet. A name that the theme does not give keeps its colour.
- A sheet that writes its own hex for a colour that is not in `PAL` keeps that colour. Make sure that it still looks right with the theme.
- A theme changes colours only. The fonts, the hand-drawn lines and the isometric view stay.
- Keep `paper` light and `ink` dark. The kit draws its highlights and its cards with light colours that are not in `PAL`.
- Keep `red` clear of the other colours, because it marks the current state.

`<skill>/themes/sea.json` is a sample. Look at the PNGs after a make with a theme.

## Pictures

```
bun <skill>/build/export.mjs <page>.html [--sheet <key>] [--state <id> | --story] [--svg] [--png] -o <dir>
```

The SVG has its fonts in it. The PNG is the sheet at 1:1. A page also opens one state straight away with `<page>.html#state=<id>`.

```
bun <skill>/build/gif.mjs <page>.html [--sheet <key>] [--width 560] [--fps 10] [--max 180] -o <name>.gif
```

The GIF is a recording of Play all, from the first state to the last. It needs `ffmpeg`.

## Technical objects

- `bun <skill>/build/logos.mjs <key…>`: fetch a logo once, into `<skill>/icons/logos/`.
- `bun <skill>/build/icon.mjs <name…>`: write the icon of a technology as SVG and PNG.
- A sheet names a technology in quotes, `tech('Kafka', x, y)`, so that the build puts its logo in the page. A technology that is not in `<skill>/icons/tech.json` goes in that table first.
