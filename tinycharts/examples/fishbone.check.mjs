// The fishbone's rules. Run with bun to write fishbone.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
// six bones, checked in order; the hot water (bone 4) is the one ruled in
export const BONES = 6, CULPRIT = 4;

export const result = check({
  mmd: HERE + 'fishbone.mmd',
  init: { n: 0 },
  guard: { 'all six checked': v => v.n === BONES },
  effect: {
    'check next bone': v => ({ n: v.n + 1 }),
    'bake again': () => ({ n: 0 }),
  },
  rules: [
    { rule: 'Six bones, no more', says: 'Each check takes one bone. There are six to check.', holds: s => s.n <= BONES },
    { rule: 'A cause only after every bone', says: 'The bread is explained only once all six bones are ruled in or out.', holds: s => s.at !== 'explained' || s.n === BONES },
    { rule: 'One cause ruled in', says: 'When the bread is explained, exactly one bone is ruled in: the hot water.', holds: s => s.at !== 'explained' || CULPRIT < s.n },
  ],
  mutants: { 'all six checked': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'fishbone.json', result);
