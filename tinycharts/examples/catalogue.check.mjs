// The rules for one jar on the shelf. Run with bun to write catalogue.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
// the jar that keeps worst: apricot with no sugar, good for one week open, three spoons here to keep the run small
export const KEEP = 1, SPOONS = 3;

export const result = check({
  mmd: HERE + 'catalogue.mmd',
  init: { w: 0, left: SPOONS },
  guard: {
    'last spoon': v => v.left === 0,
    'past its weeks': v => v.w > KEEP,
  },
  effect: {
    'open it': () => ({ w: 0, left: SPOONS }),
    'a spoonful': v => ({ ...v, left: v.left - 1 }),
    'a week later': v => ({ ...v, w: v.w + 1 }),
    'a new jar': () => ({ w: 0, left: SPOONS }),
  },
  rules: [
    { rule: 'Gone off only past its weeks', says: 'A jar goes off only when it has been open longer than its kind keeps.', holds: s => s.at !== 'mouldy' || s.w > KEEP },
    { rule: 'Eaten up only when empty', says: 'A jar is eaten up only after its last spoonful.', holds: s => s.at !== 'finished' || s.left === 0 },
    { rule: 'A sealed jar keeps', says: 'A jar with its lid on does not count the weeks.', holds: s => s.at !== 'sealed' || s.w === 0 },
  ],
  mutants: { 'last spoon': true, 'past its weeks': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'catalogue.json', result);
