# Network

**Answers:** who reaches whom.

**Example:** `examples/network.js`, a school's phone chain on a snow day.

## When to use it

People or places joined by one-way links, where the question is how far something spreads and how fast: a phone chain, news in a village, a cold through a class, a parcel handed between depots. For messages in a strict order between a few parties, use a sequence. For one path from start to end, use a flow.

## Layout

- Faces in circles on a small isometric map (houses, roads, trees), each with a name tag.
- One-way arrows from the one who rings to the one who is rung. An arrow that comes up from below stops under the name tag.
- Each call of a round runs down its arrow as a red fill with a phone on its tip. The one rung lights up when the phone gets there.
- The circle's fill tells who knows. A small badge gives the round each one heard.
- The arrows rung this round, and the faces they reached, are drawn red.
- A start dot with a note on where the news starts.
- One face with no links ("not on the list yet").
- A face that is out is greyed with a red "out: no answer".
- Along the bottom: the state pills with arrows between them, a round counter, and a legend.
- The status: how many know, the round, and the state.

## The statechart it suits

A start, a calling state and a settled end, with one choice. The event that rings a round goes to the choice. Its guard `[no one new heard]` picks settled, `[else]` picks calling. One event toggles a person out and back. One event starts again. The rules: news runs only along a link, a face with no links never hears, settled means no one is left to ring, and each round tells at least one more.

## Buttons

- `ring round`: everyone who knows rings everyone on their list who is at home. Refused once settled.
- One toggle for a person who may be out. Refused once settled.
- `start again`. Refused before settled.

## Kit

`gable`, `tree`, `at`, `clipped`, `oval`, `person`, `flowArrow`, `pill`, `nowTag`, `legend`, `faceText`, `line`. The face circles, the name tags, the roads and the round counter are drawn in the sheet.

## Density

From the original: 12 faces, 14 links, 10 buildings, 1 unlinked face, 1 legend, 1 round counter, 3 buttons plus Play all. The example sheet reaches at least these counts: 13 faces, 14 links, 10 buildings, 7 trees, 1 unlinked face, 1 legend, 1 round counter, 3 state pills, 3 buttons.
