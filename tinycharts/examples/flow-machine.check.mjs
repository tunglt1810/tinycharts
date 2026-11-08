// The sorting line's rules. Run with bun to write flow-machine.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
export const BALES = 3;

export const result = check({
  mmd: HERE + 'flow-machine.mmd',
  init: { dirty: false, bales: 0 },
  guard: { 'only paper left': v => !v.dirty, 'lorry has room': v => v.bales < BALES },
  effect: {
    'a greasy pizza box': v => ({ ...v, dirty: true }),
    'pick it out': v => ({ ...v, dirty: false }),
    'next load': v => ({ ...v, bales: v.bales + 1 }),
    'drive off': v => ({ ...v, bales: 0 }),
  },
  rules: [
    { rule: 'No dirty bale', says: 'A greasy pizza box spoils a bale of paper. It never goes into the baler.', holds: s => s.at !== 'baled' || !s.dirty },
    { rule: 'Three bales to a lorry', says: `The lorry carries ${BALES} bales. It never takes a fourth.`, holds: s => s.bales <= BALES },
  ],
  mutants: { 'only paper left': true, 'lorry has room': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'flow-machine.json', result);
