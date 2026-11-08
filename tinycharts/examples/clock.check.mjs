// The lighthouse's rules. Run with bun to write clock.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'clock.mmd',
  // the tank holds two nights of oil; it starts with one
  init: { oil: 1, lit: true },
  guard: { 'tank not full': v => v.oil < 2, 'lamp burns': v => v.lit },
  effect: {
    sunrise: v => ({ ...v, lit: false }),
    'carry oil up': v => ({ ...v, oil: v.oil + 1 }),
    'light the lamp': v => ({ ...v, lit: v.oil > 0, oil: Math.max(0, v.oil - 1) }),
    'oil by lantern': v => ({ ...v, lit: true }),
  },
  rules: [
    { rule: 'The light burns all night', says: 'From the evening to sunrise the lamp is never dark.', holds: s => !['night', 'sleep', 'watch'].includes(s.at) || s.lit },
    { rule: 'The tank is never overfilled', says: 'The keeper never carries up more oil than the tank holds.', holds: s => s.oil <= 2 },
  ],
  mutants: { 'lamp burns': true, 'tank not full': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'clock.json', result);
