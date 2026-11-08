// The loaf's rules. Run with bun to write timeline.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'timeline.mmd',
  init: { doubled: false, baked: false, cool: false, cutHot: false },
  guard: { doubled: v => v.doubled, cool: v => v.cool },
  effect: {
    // waiting raises the dough before the oven, and cools the loaf after it
    wait: v => (v.baked ? { ...v, cool: true } : { ...v, doubled: true }),
    'out of the oven': v => ({ ...v, baked: true }),
    'slice it': v => ({ ...v, cutHot: !v.cool }),
  },
  rules: [
    { rule: 'The dough doubles before it is shaped', says: 'Nobody shapes a loaf from dough that has not risen.', holds: s => s.at !== 'shaping' || s.doubled },
    { rule: 'No slice while it is hot', says: 'The bread is cut only after an hour on the rack.', holds: s => !s.cutHot },
  ],
  mutants: { doubled: true, cool: true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'timeline.json', result);
