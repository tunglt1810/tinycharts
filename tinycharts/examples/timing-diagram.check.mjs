// The level crossing's rules. Run with bun to write timing-diagram.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'timing-diagram.mmd',
  // due: trains still to come; on: a train on the crossing; extra: a second train was detected
  init: { flashed: false, bar: 'up', on: false, due: 0, extra: false },
  guard: {
    'not flashed': v => !v.flashed, 'lights flashed': v => v.flashed,
    'no second train yet': v => !v.extra, 'train due': v => v.due > 0, 'crossing clear': v => !v.on && v.due === 0,
  },
  effect: {
    'train detected': v => ({ ...v, flashed: false, due: 1, extra: false }),
    'wait 6 s': v => ({ ...v, flashed: true }),
    'lower barrier': v => ({ ...v, bar: 'lowering' }),
    'barrier down': v => ({ ...v, bar: 'down' }),
    'another train': v => ({ ...v, due: v.due + 1, extra: true }),
    'train arrives': v => ({ ...v, due: v.due - 1, on: true }),
    'train leaves': v => ({ ...v, on: false }),
    'raise barrier': v => ({ ...v, bar: 'raising' }),
    'barrier up': v => ({ ...v, bar: 'up', flashed: false }),
  },
  rules: [
    { rule: 'The barrier is never up with a train on the crossing', says: 'While a train is on the crossing, or another is still due, the barrier stays down.', holds: s => (!s.on || s.bar === 'down') && (s.bar !== 'raising' || s.due === 0) },
    { rule: 'The lights flash before the barrier moves', says: 'The barrier starts down only after the lights have flashed for six seconds.', holds: s => s.bar === 'up' || s.flashed },
  ],
  mutants: { 'crossing clear': true, 'lights flashed': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'timing-diagram.json', result);
