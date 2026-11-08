// The bike or bus rules. Run with bun to write break-even.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
// £120 for the bike once, £2.50 a bus ride: they cross at 48 rides; the chart ends at 80
export const BIKE = 120, FARE = 2.5, EVEN = BIKE / FARE, MAX = 80;
const add = k => v => ({ n: Math.min(MAX, v.n + k) });

export const result = check({
  mmd: HERE + 'break-even.mmd',
  init: { n: 0 },
  guard: {
    'past the break-even': v => v.n * FARE > BIKE,
    'at the break-even': v => v.n * FARE === BIKE,
  },
  effect: { 'ride': add(1), 'a week of rides': add(10), 'start again': () => ({ n: 0 }) },
  rules: [
    { rule: 'The bus is cheaper only below 48 rides', says: 'While the bus is cheaper, the fares so far are under the £120 bike.', holds: s => s.at !== 'bus' || s.n * FARE < BIKE },
    { rule: 'Even only at 48 rides', says: 'The bike has paid for itself exactly when 48 fares make £120.', holds: s => s.at !== 'even' || s.n === EVEN },
    { rule: 'The bike wins only past 48 rides', says: 'The bike is cheaper only once the fares would pass £120.', holds: s => s.at !== 'bike' || s.n > EVEN },
  ],
  mutants: { 'past the break-even': true, 'at the break-even': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'break-even.json', result);
