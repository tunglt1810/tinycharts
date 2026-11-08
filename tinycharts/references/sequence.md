# Sequence

**Answers:** who says what to whom, in order.

**Example:** `examples/sequence.js`, signing in with a passkey. It is a technical sheet.

## When to use it

Two to seven actors that send messages to each other, and the order matters: a sign-in, an API call through a gateway, a handover at a counter. For one thing that moves through steps, use a flowchart. For time on a clock face, use a clock.

## Layout

- An `sd` frame with a tab title round the diagram. A "time" arrow runs down its left side.
- One head card per lifeline at the top, side by side: a small board with the actor on it, the name under it. On a technical sheet the head is `tech('<name>')`, so it has its logo. A person is `who`.
- A dashed lifeline runs down from each head. A state pill under each head, and pills down the lifelines where an actor changes state.
- One row per message, numbered: a solid arrow for a call, a dashed arrow for a reply. Activation bars on the lifelines while an actor works.
- The current message is red with a `now` tag. The messages still to come are faded.
- The message itself is a `message` envelope that travels along its row with `hops`. A message through a gateway rests on the gateway lifeline.
- People who can break the flow (a stranger, an attacker) stand by the head they act on.

## The statechart it suits

One state per message: the state after that message. A choice where a check can fail (a face, a signature), with `[else]` back to the start. 8–12 states.

## Buttons

- `next message` sends the next message.
- One button for each way the flow can go wrong. The check refuses it and says why in one line.
- A press out of order is refused.

## Kit

`tech`, `message`, `hops`, `flowArrow`, `pill`, `nowTag`, `who`, `board`, `ctx.follow`. `SIZE` can be larger than 1400 × 1400.

## Density

From the original: 4 lifelines with picture cards, 7 messages (one to itself), about 16 state pills, activation bars, 6 people, 3 buttons. The example sheet reaches at least these counts.
