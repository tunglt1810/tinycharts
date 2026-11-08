// The greenhouse's rules. Run with bun to write bands.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
// red: hours spent in a red band with nothing working against it
const idle = v => (v.band === 'cold' && !v.heater) || (v.band === 'hot' && !v.vent);

export const result = check({
  mmd: HERE + 'bands.mmd',
  init: { band: 'fine', heater: false, vent: false, red: 0 },
  guard: {
    'first hour': v => v.red === 0,
    'vent is open': v => v.vent, 'vent is shut': v => !v.vent,
    'heater is on': v => v.heater, 'heater is off': v => !v.heater,
  },
  effect: {
    'wait an hour': v => ({ ...v, red: idle(v) ? v.red + 1 : 0 }),
    'night falls': v => ({ ...v, band: 'cold', red: 0 }),
    'cold wind': v => ({ ...v, band: 'cold', red: 0 }),
    'sun comes out': v => ({ ...v, band: 'hot', red: 0 }),
    'heater on': v => ({ ...v, heater: true, red: 0 }),
    // heating stops once warm enough; in the hot band it only stops adding heat
    'heater off': v => ({ ...v, heater: false, band: v.band === 'hot' ? 'hot' : 'fine' }),
    'open vent': v => ({ ...v, vent: true, red: 0 }),
    'shut vent': v => ({ ...v, vent: false, band: v.band === 'cold' ? 'cold' : 'fine' }),
  },
  rules: [
    { rule: 'Never two hours in a red band', says: 'Under 10 °C or over 30 °C, the heater or the vent is working by the second hour.', holds: s => s.red < 2 },
    { rule: 'The heater and the vent are never on together', says: 'Heat is never let straight out of an open vent.', holds: s => !(s.heater && s.vent) },
  ],
  mutants: { 'first hour': true, 'vent is shut': true, 'heater is off': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'bands.json', result);
