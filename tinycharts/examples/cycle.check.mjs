// The bee's rules. Run with bun to write cycle.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
export const FULL = 5;

export const result = check({
  mmd: HERE + 'cycle.mmd',
  init: { stores: 0, load: false },
  guard: { 'hive not full': v => v.stores < FULL, 'nectar in the basket': v => v.load },
  effect: {
    'sip nectar': v => ({ ...v, load: true }),
    'rain shower': v => ({ ...v, load: false }),
    unload: v => ({ stores: v.stores + (v.load ? 1 : 0), load: false }),
    spring: () => ({ stores: 0, load: false }),
  },
  rules: [
    { rule: 'The comb never overflows', says: `The hive holds ${FULL} combs of honey. No bee brings a sixth.`, holds: s => s.stores <= FULL },
    { rule: 'No trip from a full hive', says: 'When every comb is full, the bee stays home for the winter.', holds: s => s.at !== 'meadow' || s.stores < FULL },
    { rule: 'Home by the pond only with nectar', says: 'The bee leaves the clover for the pond only with a full basket.', holds: s => s.at !== 'pond' || s.load },
  ],
  mutants: { 'hive not full': true, 'nectar in the basket': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'cycle.json', result);
