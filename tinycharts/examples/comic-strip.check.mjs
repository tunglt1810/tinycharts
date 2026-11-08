// The umbrella's rules. Run with bun to write comic-strip.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'comic-strip.mmd',
  init: { open: false, described: false },
  guard: { 'office open': v => v.open, 'duck handle described': v => v.described },
  effect: {
    'wait for nine': v => ({ ...v, open: true }),
    'describe the handle': v => ({ ...v, described: true }),
    'another day': () => ({ open: false, described: false }),
  },
  rules: [
    { rule: 'Only to its owner', says: 'The office hands the umbrella over only to someone who can describe its duck handle.', holds: s => s.at !== 'found' || s.described },
    { rule: 'Nobody at a shut counter', says: 'The counter opens at nine. Nobody is served before.', holds: s => s.at !== 'counter' || s.open },
  ],
  mutants: { 'duck handle described': true, 'office open': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'comic-strip.json', result);
