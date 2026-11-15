// The beach's rules. Run with bun to write time-lapse.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'time-lapse.mmd',
  // after a rip the red flag stays up for the rest of the day
  init: { red: false, swim: false, beds: false },
  guard: { 'green flag': v => !v.red, 'beds out': v => v.beds, 'beds stacked': v => !v.beds },
  effect: {
    'lifeguard on': v => ({ ...v, beds: true }),
    swim: v => ({ ...v, swim: true }),
    'rip current': v => ({ ...v, red: true, swim: false }),
    'stack sunbeds': v => ({ ...v, beds: false }),
    'lifeguard off': v => ({ ...v, swim: false }),
    sunrise: v => ({ ...v, red: false, swim: false }),
  },
  rules: [
    { rule: 'Nobody swims under a red flag', says: 'Once the red flag is up, nobody goes back into the sea that day.', holds: s => !(s.red && s.swim) },
    { rule: 'No sunbed is under the tide', says: 'At high tide and through the night, every sunbed is stacked on the promenade.', holds: s => !['dusk', 'night'].includes(s.at) || !s.beds },
  ],
  mutants: { 'green flag': true, 'beds stacked': true, 'beds out': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'time-lapse.json', result);
