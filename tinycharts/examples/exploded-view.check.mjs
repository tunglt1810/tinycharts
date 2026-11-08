// The layer cake's rules. Run with bun to write exploded-view.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const START = { on: 0, soft: false, slid: false, runny: false, iced: false };

export const result = check({
  mmd: HERE + 'exploded-view.mmd',
  init: START,
  guard: { 'still soft': v => v.soft, 'layer below is set': v => !v.soft, 'top is set': v => !v.soft },
  effect: {
    // a layer put on a soft one slides off: record it, so a rule can see it
    'add a layer': v => ({ ...v, on: v.on + 1, slid: v.slid || v.soft, soft: true }),
    'wait to set': v => ({ ...v, soft: false }),
    'ice it': v => ({ ...v, iced: true, runny: v.soft }),
    'start again': () => START,
  },
  rules: [
    { rule: 'Each layer goes on a set layer', says: 'A sponge is cold, and jam or cream has set, before the next layer goes on it.', holds: s => !s.slid },
    { rule: 'The icing goes on last', says: 'The icing goes on only when all five layers are on the board and the top one is cold.', holds: s => !s.iced || (s.on === 5 && !s.runny) },
  ],
  mutants: { 'layer below is set': true, 'top is set': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'exploded-view.json', result);
