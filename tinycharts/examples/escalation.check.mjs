// The station's rules. Run with bun to write escalation.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
// the four levels, low to high
export const LEVELS = ['platform', 'office', 'manager', 'depot'];

export const result = check({
  mmd: HERE + 'escalation.mmd',
  init: { level: 0, answered: false },
  guard: {},
  effect: {
    'wait': v => ({ ...v, level: v.level + 1 }),
    'they answer': v => ({ ...v, answered: true }),
    'a new bag is lost': () => ({ level: 0, answered: false }),
  },
  rules: [
    { rule: 'One level at a time', says: 'A wait with no answer moves the bag up one level, never two.', holds: s => s.at === 'found' || LEVELS[s.level] === s.at },
    { rule: 'Four levels, no more', says: 'Lost property is the top. Nobody passes it on from there.', holds: s => s.level < LEVELS.length },
    { rule: 'Found only by an answer', says: 'The bag is found only when someone at a level answers.', holds: s => (s.at === 'found') === s.answered },
  ],
  mutants: {},
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'escalation.json', result);
