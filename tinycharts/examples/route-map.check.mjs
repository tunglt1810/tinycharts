// The dog walk's rules. Run with bun to write route-map.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const ROADSIDE = ['gate', 'lamp', 'kiosk', 'home'];

export const result = check({
  mmd: HERE + 'route-map.mmd',
  // back: the loop is done and the dog is at the gate again
  init: { lead: true, back: false },
  guard: { 'on the lead': v => v.lead, 'off the lead': v => !v.lead, 'back at the gate': v => v.back },
  effect: {
    'set off': v => ({ ...v, back: false }),
    'let him off': v => ({ ...v, lead: false }),
    'lead on': v => ({ ...v, lead: true }),
    'back to the gate': v => ({ ...v, back: true }),
    'next walk': () => ({ lead: true, back: false }),
  },
  rules: [
    { rule: 'On the lead by the road', says: 'At the gate, the lamp post, the kiosk and on the way home, the dog is always on the lead.', holds: s => !ROADSIDE.includes(s.at) || s.lead },
    { rule: 'Never in the pond', says: 'Past the ducks the dog is on the lead, so it never jumps in the pond.', holds: s => s.at !== 'pond' || s.lead },
    { rule: 'The walk ends at the gate', says: 'The dog goes home only from the gate, after the whole loop.', holds: s => s.at !== 'home' || s.back },
  ],
  mutants: { 'on the lead': true, 'back at the gate': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'route-map.json', result);
