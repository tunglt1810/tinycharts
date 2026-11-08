// The fruit bowl's rules. Run with bun to write quadrant.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
// ripeness in %, size across in cm, for the twelve fruits in the order they are picked
export const FRUIT = [[80, 7.5], [35, 8.5], [75, 4.5], [65, 7.8], [20, 5.5], [50, 9.4], [85, 5.0], [40, 6.2], [90, 8.0], [15, 4.8], [70, 9.0], [55, 5.8]];
export const RIPE = 60, BIG = 7;
const place = ([r, s]) => (r >= RIPE ? 1 : 0) + (s >= BIG ? 2 : 0);

export const result = check({
  mmd: HERE + 'quadrant.mmd',
  init: { n: 0, q: [0, 0, 0, 0] },
  guard: { 'last fruit': v => v.n === FRUIT.length },
  effect: {
    'next fruit': v => { const q = v.q.slice(); q[place(FRUIT[v.n])]++; return { n: v.n + 1, q }; },
    'a new bowl': () => ({ n: 0, q: [0, 0, 0, 0] }),
  },
  rules: [
    { rule: 'Twelve fruits, no more', says: 'Each pick takes one fruit from the bowl of twelve.', holds: s => s.n <= FRUIT.length },
    { rule: 'Each fruit in one place', says: 'The four places together hold every fruit picked so far, once each.', holds: s => s.q.reduce((a, b) => a + b, 0) === s.n },
    { rule: 'Sorted only when the bowl is empty', says: 'Every fruit has its place only after the twelfth is picked.', holds: s => s.at !== 'sorted' || s.n === FRUIT.length },
  ],
  mutants: { 'last fruit': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'quadrant.json', result);
