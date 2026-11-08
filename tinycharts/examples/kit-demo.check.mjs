// The bike stall's rules. Run with node to write kit-demo.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'kit-demo.mmd',
  init: { spares: 0, fitted: false, ridden: false, untested: false },
  guard: { 'has the part': v => v.fitted, ridden: v => v.ridden },
  effect: {
    'next bike': v => ({ ...v, fitted: false, ridden: false }),
    'fix it': v => ({ ...v, fitted: v.spares > 0, spares: Math.max(0, v.spares - 1) }),
    'part arrives': v => ({ ...v, spares: v.spares + 1 }),
    'test ride': v => ({ ...v, ridden: true }),
    'hand back': v => ({ ...v, untested: !v.ridden }),
  },
  rules: [
    { rule: 'No fix without the part', says: 'A bike is never marked fixed unless the new part went on.', holds: s => s.at !== 'fixed' || s.fitted },
    { rule: 'Every bike is ridden before it goes home', says: 'The stall never hands back a bike nobody has test-ridden.', holds: s => !s.untested },
  ],
  mutants: { 'has the part': true, ridden: true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'kit-demo.json', result);
