// The tailor's rules. Run with bun to write kanban.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
// columns: orders, measure, cut, sew, fitting, ready
const LIMIT = [9, 1, 1, 2, 1, 9];
const count = (pos, c) => pos.filter(p => p === c).length;
const canGo = (v, i) => v.pos[i] < 5 && count(v.pos, v.pos[i] + 1) < LIMIT[v.pos[i] + 1] && (v.pos[i] !== 4 || v.tried);
const mover = v => [0, 1, 2, 3].filter(i => canGo(v, i)).sort((a, b) => v.pos[b] - v.pos[a] || a - b)[0];
const allReady = v => v.pos.every(p => p === 5);

export const result = check({
  mmd: HERE + 'kanban.mmd',
  init: { pos: [0, 0, 0, 0], tried: false },
  guard: {
    'all ready': allReady,
    'nothing can move': v => !allReady(v) && mover(v) === undefined,
    'an order is at the fitting': v => v.pos.includes(4),
  },
  effect: {
    'move an order': v => {
      const i = mover(v);
      if (i === undefined) return v;
      const pos = v.pos.slice(); pos[i]++;
      return { pos, tried: pos[i] === 5 || pos[i] === 4 ? false : v.tried };
    },
    'the customer comes in': v => ({ ...v, tried: true }),
    'a new week': () => ({ pos: [0, 0, 0, 0], tried: false }),
  },
  rules: [
    { rule: 'No column over its limit', says: 'One order at the measuring, one at the cutting table, two at the sewing machines, one in the fitting room.', holds: s => [1, 2, 3, 4].every(c => count(s.pos, c) <= LIMIT[c]) },
    { rule: 'Ready means all four', says: 'The shop is all ready only when every order hangs on the rail.', holds: s => s.at !== 'ready' || allReady(s) },
    { rule: 'Held up only when stuck', says: 'The shop says held up only when no order can move on.', holds: s => s.at !== 'held' || mover(s) === undefined },
    { rule: 'A customer comes only to a fitting', says: 'Nobody is called in unless an order waits in the fitting room.', holds: s => !s.tried || s.pos.includes(4) },
  ],
  mutants: { 'all ready': true, 'nothing can move': true, 'an order is at the fitting': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'kanban.json', result);
