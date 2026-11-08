# Tinycharts: design

Date: 2026-11-06. User: the owner (personal use).

## 1. Intent

The owner wants a Claude skill named `tinycharts`. The skill draws "how a thing works" as a hand-drawn HTML sheet that a person can click. Each sheet has a real statechart behind it.

The skill takes https://april-zhu.com/tinycharts (the Free and Pro editions) as its reference. The skill must have all 28 chart types of that site.

The owner uses the skill for two jobs:

- Draw application flows and product flows, to explain a design to the team.
- Draw everyday subjects, as the original does.

Default Mermaid is too plain for this. The original is good to look at, but it forbids technical subjects and has no technical icons.

## 2. Goals

1. The `tinycharts` skill draws all 28 chart types (the catalogue is in section 7).
2. The pictures are as good as the original: careful isometric drawings with people, objects, buildings and animals.
3. Each sheet has a statechart, event buttons, a rule check and a "The logic" panel, as the original does.
4. The skill draws isometric technical icons when a sheet needs them (section 6). Each icon is exported to a file for later use.
5. The skill draws technical and product subjects, not only everyday subjects.

## 3. Out of scope

- No full icon library made in advance. The skill draws an icon on request, then keeps it.
- No Vietnamese or Chinese lettering on a sheet. All lettering on a sheet is English.
- No distribution or public release. The skill is for personal use only.
- No drag-and-drop editor. Claude writes each sheet as code.

## 4. Failures that still run (anti-goals)

The owner ranked these from worst:

1. **The output is worse than the original.** This is the worst failure. A sheet that looks cheaper, rougher or more cluttered than the original sheet of the same type is a failure.
2. **Drawing takes longer than with the original.** This is the second worst failure.

What this means for the builder:

- Picture quality comes before speed. Speed comes before everything else.
- The kit must have enough ready-made parts, so that Claude does not draw each stroke for each sheet.
- Each type needs a template that is good enough for Claude to change only the content.

## 5. Constraints

### 5.1 License and code sources

- The Free edition of tinycharts has a "personal use only" license. The license forbids redistribution, also in part.
- The Pro edition is a paid product. We do not have its code.
- The owner's decision: **learn how the code works, do not reuse the code**. The builder reads the Free edition and looks at the Pro site to learn the method. Then the builder writes new code.
- Do not copy code, image tiles (`marker.txt`, `tooth.txt`) or templates from the Free edition into the skill.
- Do not take the JS of the demos on the original site.
- MIT code is allowed, with its notice kept:
  - `statechart-art` by Kevin T. Ngo (https://github.com/kevintngo/statechart-art): pen strokes (`line`, `chase`, `sway`), the pencil paper tile, the human figures.
  - `pele` (https://pele.run, MIT, by kepano): renders Mermaid to SVG.
  - The statechart skill in `cursor/plugins/pstack` (MIT): the method of the rule check.
- The skill is named `tinycharts` and is for personal use only. A public release needs a new name.

### 5.2 Environment

- macOS. The machine has Node 26, Python 3.15, `rsvg-convert` and Google Chrome.
- `npm` fails with an SSL certificate error (`UNABLE_TO_GET_ISSUER_CERT_LOCALLY`). The builder must fix this before installing `pele`.
- The repo is the root folder that holds `tinycharts/`, `tests/` and `docs/`.
- Temporary files go in `.tmp/` in the repo. Do not use the operating system's `/tmp`.

### 5.3 Method

- Use the `leanrea` skill (https://github.com/aicodeking/leanrea) as the method to take the original apart:
  - Route by file type.
  - Start from the inventory and the text strings.
  - Tag each conclusion as "seen", "inferred" or "unknown".
- Learn how leanrea writes its SKILL.md: one short file, with a router table and a short list of rules.
- Use `/skill-creator` (anthropic-skills:skill-creator) to build and test the skill.

## 6. Isometric technical icons

### 6.1 Style

- Each technology is drawn as an **object for its role**. The logo is printed on a side face of the object.
- Examples: Kubernetes is a stack of servers, with the logo on the +x face. Postgres is a database cylinder.
- The icons use the style of the sheet: wobbly strokes, marker wash, elliptical shadows, the marker palette.

### 6.2 How it works

1. A sheet calls `tech("Kafka", x, y, z, o?)`.
2. `tech()` looks up the name in the technology table. It matches by key, by name and by alias. It ignores case and extra spaces.
3. When the name is not found, the function stops with `Unknown technology "x". Closest: a, b, c.` Claude then adds the technology to the table.
4. `tech()` draws the object of that technology and prints the logo on a face.
5. When the technology has no logo, the object shows its name in letters.

### 6.3 The technology table

- File: `tinycharts/icons/tech.json`. Each key has `name`, `object`, `alias?`, `cncf?`, `simple?`, `devicon?`, `tint?`, `logo?`.
- `cncf`, `simple` and `devicon` are the names of the logo in each source. An entry names only the sources that have that exact logo.
- `tint` is the name of a PAL colour. A simple-icons logo has one colour and no fill, so it needs a `tint`.
- `logo: false` is for a general role with no brand, and for a technology with no open logo: `api`, `webapp`, `database`, `storage`, `user`, `sendgrid`.
- The table has 34 technologies and 5 general roles.

### 6.4 Logos: sources, cleaning, colour

**Sources.** In this order: CNCF artwork, then simple-icons (CC0), then devicon (MIT). With no source, the object shows the name in letters.

**Storage.**

- Each logo is fetched once, into `tinycharts/icons/logos/<key>.svg`.
- `SOURCES.md` records the source, URL and license of each file.
- A logo is data. The skill never runs code from a logo.

**Cleaning** (`build/logo-lib.mjs`):

- The skill refuses a file larger than 200 KB, and a file that is not SVG.
- The skill keeps only drawing elements: `svg`, `g`, `path`, `rect`, `circle`, `ellipse`, `polygon`, `polyline`, `line`, `defs`, gradients, `stop`, `clipPath`, `mask`, `use`, `title`.
- The skill removes the `<a>` tag but keeps its content. The skill removes every other element together with its content.
- The skill removes `on*` attributes, an `href` that does not start with `#`, and a `url(` that points outside the file.
- Many logos set colours with classes in `<style>`. The skill copies the simple colour rules of each class into the `style` of each element, then removes the `<style>` block.

**Colour.**

- Each colour changes to the nearest PAL colour in Lab space.
- A colour near white changes to `cream`. A colour near black changes to `ink`.
- A logo never uses `paper` (the background colour) or `red` (the colour of the current state).
- The skill adds the key as a prefix to each id in a logo, so that two logos never share an id.

**Build.** A page includes only the logos of the technologies that the sheet names in quotes, by key, name or alias. The build cannot see a name that the sheet puts together at run time, so that object shows its name in letters.

### 6.5 Objects and how the logo is printed

11 objects in `kit/objects.js`: `rack`, `dbCyl`, `queue`, `gateway`, `browser`, `phone`, `cloud`, `bucket`, `devbox`, `lock`, `container`.

- Each object stands on the centre of its base `(x, y, z)` and returns its size `{w, d, h}`.
- `o.col` changes the body colour. `o.logo` and `o.label` set the logo and the fallback letters.
- The `message` object is a flat envelope for a request or a response. The envelope has no shadow, so it can fly above other objects.

**Printing the logo** (`kit/logo.js`):

- `logoOn(face, x, y, z, w, h, key, {fallback, pad})` prints a logo on a flat face. The logo keeps its proportions and sits in the middle of the box.
- The logo sits on a light plate with an ink edge, so it reads on any body colour.
- `logoWrap(...)` bends a logo round a cylinder (`dbCyl`, `bucket`). SVG cannot bend a shape. So the skill draws the logo once and cuts it into 10 vertical strips. Each strip sits on the plane that touches the cylinder at that place.

### 6.6 CLI

- `bun tinycharts/build/logos.mjs <key...> | --all`: fetch logos into `icons/logos/`.
- `bun tinycharts/build/icon.mjs <name...> [--force] [--offline] [--icons dir] [-o dir]`: write `<key>.svg` and `<key>.png` (320 px).
  - The icon draws the object 1.55 times its sheet size, so that the logo reads.
  - The SVG file has no paper background. The PNG file keeps the paper colour.
  - The skill keeps a file that exists, unless `--force` is given.

### 6.7 Changes the owner asked for at stop 2

- Logos must stand out: a light plate, a larger logo, a larger icon.
- A logo on a cylinder must tilt and bend with the cylinder, as a logo on a flat face does.
- The demo page has the `message` object. The envelope follows the arrows, through each object, and does not jump straight to the end.
- The sheet panel has zoom buttons.

## 7. The 28 chart types

### 7.1 Catalogue

The question that each type answers comes from the original site. The "Free" column marks the types in the Free edition, which has code to learn from. The "Seen" column records what Claude saw on the original site.

| # | Group | Type | Answers | Free | Seen |
|---|---|---|---|---|---|
| 1 | Time | Timeline | how long each step takes, to scale | ✓ | |
| 2 | Time | Parallel timeline | jobs that run at once, and meet on time | | A long isometric kitchen. The parallel lanes are time. A red line sweeps across. A "last ten minutes" zoom box as a horizontal bar. |
| 3 | Time | Clock | a whole day, round once | ✓ | |
| 4 | Time | Time-lapse | one place, changing through the day | | An isometric street with margin labels. A time slider to drag. The shops change state with the hour. |
| 5 | Time | Timing diagram | each signal, second by second | | Signal lanes with state pills. A seconds axis. On the right, a picture of a crossroads and an "EVENTS" box. |
| 6 | Time | Bands | which band a changing level is in | | A large harbour picture. A horizontal statechart strip. A tide graph with coloured background bands and dashed thresholds. |
| 7 | Space | Exploded view | what is inside, layer by layer | ✓ | |
| 8 | Space | Annotated scene | everything happening in one place | ✓ | |
| 9 | Space | Zoom | where it is, from the big picture down | | A whole isometric town. The selected box has a red edge. A "zoom out" button. States inside states. |
| 10 | Space | Route map | where it went, stop by stop | | An isometric house and garden. Stop labels in the margin. A list, "the trail, in order". |
| 11 | Space | Bubble diagram | which spaces connect, and how big | | Round bubbles with an area in proportion to the m². Door marks on the links. A small 1:200 floor plan and a key. |
| 12 | Order | Flowchart | every step, and where it splits | ✓ | |
| 13 | Order | Decision tree | every answer, and every outcome in view | | Question cards with icons. Answer pills. Branches inside dashed areas. The outcomes stand on a wooden shelf. A "next customer" line goes back. |
| 14 | Order | Comic strip | a story, one panel at a time | ✓ | |
| 15 | Order | Cycle | a loop, and the one way off it | | Round stations with pictures, on a ring. A diamond decision box. One way out. A lap counter in the middle. |
| 16 | Order | Flow machine | a process built as a machine | ✓ | The original site uses the `#baggage` example. The Free edition uses `cocoa`. |
| 17 | Order | Kanban | where each item is, and what is held up | | A wooden board with columns and WIP limits. Cards with small pictures. Swimlanes. A strip of station pictures above. |
| 18 | Order | Game board | what chance decides | ✓ | |
| 19 | Flow | Sankey | where it all goes, and how much | | Bands with a width in proportion, filled with marker. A cross-section of soil beside them. A "rain" pill with a red edge. |
| 20 | Flow | Funnel | how many make it through each stage | | Dashed stage boxes that get narrower. A picture of each stage on the left. Group brackets. A compost bin for what falls out. |
| 21 | Flow | Stock and flow | what fills it, and what drains it | | Pipes with valves, source and sink clouds, a tank with a scale. Below, a garden picture with dotted labels. |
| 22 | Who | Sequence | who says what to whom, in order | | A picture card at the top of each lifeline. State pills on the lifelines. Numbered messages. A vertical "time" axis and an "sd" frame. |
| 23 | Who | Network | who reaches whom | | Faces in circles, on a village map. One-way arrows. A counter of the rounds the news takes, and a key. |
| 24 | Who | Fishbone | which causes are ruled in or out | | A main bone, 6 branches, each with a capital-letter label and a picture. The head is "the effect". |
| 25 | Who | Escalation | who takes it next, if no one answers | | A ladder of cards with clocks. A multi-storey isometric building. A RESOLVED box. |
| 26 | Compare | Catalogue | one set of states, many at once | ✓ | |
| 27 | Compare | Break-even | the point where one option wins | | A graph with two lines, a filled area, a callout at the break-even point. A strip of pictures below. |
| 28 | Compare | Quadrant | where each one falls on two measures | | 4 wooden crates as the 4 quadrants. Red dashed thresholds. A chute and a "gauge" box. |

### 7.2 Sheet and page

This part records what Claude saw on the original site. The skill must keep these points.

- A 1400×1400 sheet on cream paper, with a faint isometric grid.
- A bold serif title. Handwritten subtitle and labels. At the top right, a large status line and a small note line.
- The current state has a red edge and a "now" tag.
- The foot of the sheet has a source line or "Illustrative: …".
- The left column has "TRY IT", ▶ Play all and up to 4 event buttons. Below them is the hint or result line.
- The top bar has "← All charts", the icon and name of the type, the question the type answers, ←/→ buttons to change chart, and a "Show the logic" button.
- The "The logic" panel:
  - A list of rules. Each rule has a "breaks: …" line.
  - A statechart diagram drawn by `pele`, with zoom and Full screen.
  - A click on a state lights the matching part of the picture.
- A gallery page groups the sheets in 6 groups.

### 7.3 The skill's workflow

Kept from the original:

1. Write the process as states, events and guards. Write the source of each number. A number with no source is marked "illustrative".
2. Pick 1 of the 28 types. Say why in one line.
3. Write the statechart as Mermaid `stateDiagram-v2` in `<name>.mmd`.
4. Draw the sheet with the kit, starting from the template of the type.
5. Add the buttons. The skill refuses a press that is not allowed, and says why in one line.
6. Write `<name>.check.mjs`. The script runs a BFS over every state. The script proves 2–3 rules. With each guard taken away, the script finds the shortest path that breaks a rule. The result goes in `<name>.json`.
7. Build one HTML file. Check it in a headless browser.

Changes from the original:

- The rule "never technical systems" is removed. Technical and product subjects use the icons of section 6.

### 7.4 Technical and product sheets

The owner decided these points:

- A technical sheet is drawn in a technical style. The technical objects (section 6) and the arrows stand on an isometric ground board. Users can be added. A whole street or houses are not needed.
- A technical sheet can be denser than the original. A real product flow can have 20–40 states.
- If possible: the camera zooms and pans with the flow. On Next step or Play all, the camera follows the current state. The original already has `ctx.focus` for a similar job.

Left to the builder: the size of a dense sheet (keep 1400×1400 or allow a larger sheet), and when to split a flow into several sheets.

At least one technical sheet must exist to test the goal "not worse than the original", because this is the main use.

### 7.5 Static image export

The owner wants to send sheets to the team on Slack, Confluence or slides. So the skill must export static images. This feature is part of the kit (step 1 in section 8). Adding it later would mean changes to all 28 templates.

- **SVG:** write the SVG of the sheet to a file. Embed the fonts in the file.
- **PNG:** capture the sheet with headless Chrome. Do not use an npm library for this step.
- **One state:** each sheet opens one state straight from the URL, for example `sheet.html#state=<id>`. The kit has this convention. Each template needs only a few lines.
- **Storyboard:** export one image for each state, in the order of the flow.

### 7.6 Example sheets

- Each type has an example sheet with an everyday subject. The owner chose everyday subjects.
- The example subject must be different from the subject of the 28 original sheets. For example, do not draw "a cat's day", "a fishing harbour" or "laundry day" again. Reason: we learn how to build, we do not copy pictures. (Claude's decision.)
- Each type has a reference file: the question it answers, when to use it, layout, a suitable statechart, buttons.

### 7.7 Kit and sheet contract

Plan 1 built the kit with the decisions below. Later plans use these decisions.

**Folder structure** (in `tinycharts/`):

- `kit/`: the drawing files. Load order: `core`, `pen`, `marker`, `solids`, `life`, `text`, `marks`, `logo`, `objects`, `motion`. The files are plain scripts that share one scope.
- `shell/`: `page.html`, `style.css`, `app.js`, `logic.js`.
- `build/`: `build.mjs`, `chrome.mjs`, `mmd.mjs`, `check-lib.mjs`, `export.mjs`, `logo-lib.mjs`, `logos.mjs`, `tech.mjs`, `icon.mjs`, `new.mjs`, `make.mjs`, `types.mjs`, `gif.mjs`.
- `icons/`: `tech.json` and `logos/`.
- `fonts/`: the woff2 fonts and the OFL file of each font.
- `examples/`: `kit-demo`, `flow-demo`, `kit-catalogue`, `icon-board`, the 28 example sheets and `flowchart-tech`. Each sheet has `.js`, `.mmd`, `.check.mjs` and `.json`.

**Sheet contract.** A sheet file declares:

- `draw(seed)`: draws the whole sheet into `#art`.
- `init(ctx)`: adds the buttons. The function returns `{goto(id, play), story, tick?, click?}`.
- `goto(id, play)`: puts the sheet in state `id`. When `play` is `true` (Play all calls it), the sheet runs the motion. Without `play`, the sheet goes straight to the state.
- `story`: the states in the order of the flow. Play all and the storyboard use this list.
- `SIZE` (optional): `[1400, 1400]` by default. A dense technical sheet can be larger, for example `[2400, 1400]`.
- `ABOUT` (optional): the question that the chart type answers.

**The `ctx` API:**

- `say`, `hint`, `button` (4 buttons at most), `clear`, `state(id)`.
- `no(text)`: refuses a press. The function writes the reason and shakes the button.
- `busy(job)`, `idle()`: the motion lock. A new press calls `job.finish()` first.
- `focus`, `follow(on)`: the camera. `follow` makes the camera follow the current state.
- The panel zoom buttons (`− % + Fit`) and a drag win over the sheet's camera. Fit gives the camera back to the sheet.
- `bubble`, `hop`.
- `still`: `true` when the page is in bare or export mode.

**Hash parameters:** `#sheet=`, `state=`, `bare=1`, `audit=1`, `audit=all`, `export=1`, `logic=1`, `selftest=`.

- The page sets `data-ready` when the fonts are loaded and the state in the hash is open.
- The page sets `data-error` when an error occurs.
- In bare or export mode, the page does not run `tick` and the camera does not move. So each export gives the same image.

**Commands:** use `bun`, not `node`. Run the tests with `bun test tests/`.

**Fonts** (embedded in the page as base64, OFL license):

- Young Serif for titles.
- Gaegu 400 for handwriting, with `font-size-adjust: .5`.
- DM Sans for the page interface.

**Motion** (`kit/motion.js`). The numbers come from the timing table of the LottieFiles motion-design-skill. We wrote the code ourselves.

- `glide`: an object moves between 2 states. The object pulls back a little, travels along a low arc with ease-in-out, and its wheels turn with the distance.
- `glideMs`: the time follows the distance, 450 ms at 100 px, between 360 and 900 ms.
- `hops`: an object travels through several points. Each leg is a low hop, and the object stops for a short beat at each point.
- `arrive`: a second object follows the main object one beat later, and does not jump to its new place.
- `rise`: smoke or steam rises.
- `stroll`: a person or an animal walks to and fro.
- The "now" tag and the red edge slide in when a state lights.

**Changes the owner asked for at stop 1:**

- A scene sheet must have motion: objects move between states, background motion, a refused button shakes, and Play all has motion.
- Lettering on a box face must sit in the middle of the face.
- The density of the drawings is done in Plan 3, in the template of each type.

### 7.8 Example sheets, commands and eval (Plan 3)

**Example subjects.** The slug is the file name in `examples/`. Only Sequence is a technical sheet.

| Slug | Example subject | Slug | Example subject |
|---|---|---|---|
| `timeline` | a loaf of bread, from mixing to cooling | `cycle` | a bee's trips to the flowers, until the hive is full |
| `parallel-timeline` | a family getting ready for school | `flow-machine` | a recycling sorting line |
| `clock` | a lighthouse keeper's day | `kanban` | a tailor's orders |
| `time-lapse` | a beach from dawn to night | `game-board` | a picnic, decided by the weather dice |
| `timing-diagram` | a level crossing: lights, bell, barrier, train | `sankey` | where a household's water goes |
| `bands` | a greenhouse: too cold, fine, too hot | `funnel` | a packet of bean seeds, from sowing to picking |
| `exploded-view` | a layer cake | `stock-and-flow` | a bath: the tap fills it, the drain empties it |
| `annotated-scene` | a campsite at dusk | `sequence` | signing in with a passkey |
| `zoom` | a library: building, floor, shelf, book | `network` | a school's phone chain on a snow day |
| `route-map` | a dog's walk round the park | `fishbone` | why the bread did not rise |
| `bubble-diagram` | a small café floor plan | `escalation` | a lost bag at a train station |
| `flowchart` | fixing a flat bicycle tyre | `catalogue` | a shelf of jam jars |
| `decision-tree` | which house plant suits the room | `break-even` | buy a bike or take the bus |
| `comic-strip` | a lost umbrella finds its way home | `quadrant` | a fruit bowl, by ripeness and size |

Flowchart has a second template, `flowchart-tech` (a web shop checkout), for a long technical flow. It has 20 states, 8 service boards with logos, and a `message` envelope that travels between the boards. This template is not in the gallery.

**Commands.**

- `new.mjs <type> <dir>/<name> [--force]` copies the example sheet of the type. The command takes a slug, a type name, or the file name of a second template. With a wrong name, the command lists the 3 closest names and writes no file. The command does not overwrite a sheet without `--force`. The command changes the `.mmd` and `.json` paths and the `check-lib.mjs` import in the check file.
- `make.mjs <a.js…> -o out.html [--png dir]` runs the check, builds with `--logic`, audits every state, and exports a storyboard with `--png`. The command exits 1 when there is an audit line or a broken rule.
- `#audit=all` opens each state in `[data-state]` and in `story` in turn, and audits each state. Each line starts with `<state>: `.
- The audit finds only text on text, text off the sheet and states with no mark. The audit does not find text past its card, a line through text, or text on a picture. So the person who draws the sheet must look at the PNGs.
- `scripts/gifs.mjs [slug...]` records the README GIF of each example sheet into `docs/gifs/`. It is not part of the skill.
- The commands find the skill's own files from their own location. So they run from any project, through the `~/.claude/skills/tinycharts` symlink. Temporary files go in `.tmp/` of the current folder.

**Density.** The reference of each type has a "Density" line. That line gives the counts of the original image: margin labels, people, objects, animals, states and buttons. A sheet must reach at least the counts "from the original". An item that the line does not count has no minimum.

**How "not slower" and "not worse" are measured.** The Free edition cannot be run for a comparison, because we do not run downloaded code. So the eval measures absolute numbers on 3 prompts: an everyday subject, a technical flow with 20 states or more, and a type that is not in the Free edition. For each prompt, a subagent starts from nothing and uses the skill. The measures are:

- The time from the prompt to an HTML page that passes `make`.
- The number of times `make` reports an error.
- The density counts against the reference.

**Eval results (2026-11-08).**

| Prompt | Type | Time | `make` errors | Density |
|---|---|---|---|---|
| A self-service laundromat | flowchart | 353 s | 1 of 3 runs | reached |
| A web shop checkout, 20 states | flowchart | 325 s | 1 of 2 runs | reached |
| A print shop's kanban board | kanban | 368 s | 0 of 3 runs | reached |

All 3 runs hit a bug in `new.mjs`: the `check-lib.mjs` import broke outside `examples/`. All 3 runs had to read the code to learn the rules of the check. After the eval, the bug was fixed. The rules of the check are now in `references/sheet.md`: an effect runs before the guards of a choice, `[else]`, group states, and the check has no chance. The checkout run, done again, took 781 s, because the agent built the service boards itself. That result led to the `flowchart-tech` template.

**Changes the owner asked for from stop 3 to the end of Plan 3.**

- The example sheets must reach the counts of the original image: as many buildings, trees, people, animals and objects as the original.
- Motion must be slow enough to follow. Only one main object moves at a time. A lit line fades in and does not jump. Clock hands turn with each step that passes time.
- Bands: the owner approved the stand-in objects in the greenhouse.
- Quadrant: each fruit passes through a scanner gate to be measured, and does not touch the gauge box.
- A person's `say` line shows in a bubble when the reader taps that person, as in the Free edition.
- Next.js and Stripe have logos. SendGrid has no open logo, so it is drawn by name.

## 8. Order of work

The owner agreed to this order:

1. **The drawing kit.** Pen strokes, marker wash, pencil paper, isometric solids, people, trees, animals, margin labels, titles, the page shell, the build, the logic panel, a camera that follows the flow, and static image export (section 7.5).
2. **Technical icons.** The lookup table, the set of base objects, logo fetching, file export.
3. **The 28 chart types.** References, templates and example sheets.

The owner reviews at 3 stops. The builder stops and waits for the owner's approval before going on:

1. After the drawing kit. A demo sheet that uses every part of the kit.
2. After the set of icon objects. A page that shows every base object, with real logos.
3. After the first 2–3 sheets. One of them must be a technical sheet.

## 9. Claude's decisions (not reviewed one by one by the owner)

- The icons are part of the `tinycharts` skill, not a separate skill. Reason: the icons use the same kit.
- The wobble is made on the path itself, not with an SVG filter. Reason: an exported SVG must look the same in every app (Keynote, Figma, a browser).
- PNG export captures the page with headless Chrome (`#bare=1&state=`).
- The kit is plain JS with no dependency. The build and the check run on Node. The only dependency is `pele`.
- The page works offline. The fonts are embedded in the page.
- The new kit follows the API shape of the Free edition: the `draw(seed)`/`init(ctx)` contract, the `label(...)` call style, the layout of `check.mjs`. All the internals are new. The builder copies no function body.
- The skill is installed with a symlink, `~/.claude/skills/tinycharts` → `<repo>/tinycharts`. The owner's other skills are installed the same way.

## 10. Left to the builder

- The folder structure inside the skill, and the file names.
- The kit API, on condition that Claude uses it fast and with few errors.
- Whether the build is written in Node or Python.
- The exact fonts, on condition that they feel like the original: a bold serif for titles, a handwritten monospace for labels.
- The exact subjects of the 28 example sheets, within the limits of section 7.6.
- How to measure "not worse than the original" and "not slower than the original", on condition that the measure is repeatable.
