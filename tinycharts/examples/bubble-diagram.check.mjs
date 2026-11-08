// The café round's rules. Run with bun to write bubble-diagram.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const SEATS = 20;

export const result = check({
  mmd: HERE + 'bubble-diagram.mmd',
  init: { guests: 16, hairnet: false, toilet: false, kitchen: false },
  guard: {
    'toilet still to see': v => !v.toilet,
    'kitchen still to see': v => v.toilet && !v.kitchen,
    'no hairnet': v => !v.hairnet,
    'hairnet on': v => v.hairnet,
    'kitchen seen': v => v.kitchen,
    '4 seats free': v => SEATS - v.guests >= 4,
  },
  effect: {
    'back out': v => ({ ...v, toilet: true }),
    'hairnet on': v => ({ ...v, hairnet: true }),
    'into the kitchen': v => ({ ...v, kitchen: true }),
    'back out front': v => ({ ...v, hairnet: false }),
    'a group comes in': v => ({ ...v, guests: v.guests + 4 }),
    'next visit': () => ({ guests: 16, hairnet: false, toilet: false, kitchen: false }),
  },
  rules: [
    { rule: 'The kitchen only through the counter', says: 'No door joins the seating to the kitchen. The only way in is behind the counter, where staff put a hairnet on, so in the kitchen and the store the hairnet is always on.', holds: s => !['kitchen', 'store'].includes(s.at) || s.hairnet },
    { rule: 'Never more guests than seats', says: 'The seating has 20 seats. A group of four comes in only when four seats are free.', holds: s => s.guests <= SEATS },
    { rule: 'The report comes after the kitchen', says: 'The inspector writes the report only after she has seen the kitchen.', holds: s => s.at !== 'report' || s.kitchen },
  ],
  mutants: { 'hairnet on': true, '4 seats free': true, 'kitchen seen': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'bubble-diagram.json', result);
