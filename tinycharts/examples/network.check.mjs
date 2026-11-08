// The phone chain's rules. Run with bun to write network.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
// who rings whom; one way only. The new family is not on the list yet.
export const PEOPLE = ['the head', 'the caretaker', 'Mrs Obi', 'Mr Dale', 'the bus driver', 'the Patels', "Sam's dad", 'Ms Ng', "the twins' mum", 'Grandma Rose', 'the cook', 'the lollipop man', 'the new family'];
export const CALLS = [[0, 1], [0, 2], [0, 3], [1, 4], [2, 5], [2, 6], [3, 7], [3, 8], [7, 4], [6, 9], [4, 10], [8, 11], [11, 9], [5, 9]];
const CARETAKER = 1;

// everyone a knower rings who is at home and has not heard yet
export function nextRound(k, away) {
  let add = 0;
  for (const [a, b] of CALLS) if (k & (1 << a) && !(k & (1 << b)) && !(away && b === CARETAKER)) add |= 1 << b;
  return add;
}
const count = m => m.toString(2).replace(/0/g, '').length;

export const result = check({
  mmd: HERE + 'network.mmd',
  init: { k: 1, away: false, fresh: 0 },
  guard: { 'no one new heard': v => v.fresh === 0 },
  effect: {
    'ring round': v => { const add = nextRound(v.k, v.away); return { ...v, k: v.k | add, fresh: count(add) }; },
    'caretaker in or out': v => ({ ...v, away: !v.away }),
    'start again': () => ({ k: 1, away: false, fresh: 0 }),
  },
  rules: [
    { rule: 'News runs only along a call', says: 'Everyone who knows is the head, or someone on the list rang them.', holds: s => PEOPLE.every((_, i) => i === 0 || !(s.k & (1 << i)) || CALLS.some(([a, b]) => b === i && s.k & (1 << a))) },
    { rule: 'Off the list, never told', says: 'The new family is not on the chain, so no call reaches them.', holds: s => !(s.k & (1 << 12)) },
    { rule: 'Settled means no one left to ring', says: 'The chain stops only when every knower has rung everyone at home on their list.', holds: s => s.at !== 'settled' || nextRound(s.k, s.away) === 0 },
    { rule: 'A round reaches someone new', says: 'The calls go round only while each round tells at least one more person.', holds: s => s.at !== 'calling' || s.fresh > 0 },
  ],
  mutants: { 'no one new heard': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'network.json', result);
