// The school morning's rules. Run with bun to write parallel-timeline.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'parallel-timeline.mmd',
  init: { bath: 0, late: false, shoes: false },
  guard: { 'not snoozed': v => !v.late, 'all ready': v => v.shoes },
  effect: {
    snooze: v => ({ ...v, late: true }),
    'Mia gets up': v => ({ ...v, bath: 1 }),
    'to the table': v => ({ ...v, bath: 0 }),
    // a late Sam still has his shoes to find
    'shoes on': v => ({ ...v, shoes: !v.late }),
    'wait for Sam': v => ({ ...v, shoes: true }),
  },
  rules: [
    { rule: 'One in the bathroom at a time', says: 'Two children are never in the bathroom at once.', holds: s => s.bath <= 1 },
    { rule: 'Nobody goes without the others', says: 'The door opens only when all four have their shoes on.', holds: s => s.at !== 'out' || s.shoes },
  ],
  mutants: { 'all ready': true, 'not snoozed': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'parallel-timeline.json', result);
