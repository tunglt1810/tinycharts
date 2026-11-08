// The tyre's rules. Run with bun to write flowchart.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'flowchart.mmd',
  init: { patches: 1, thorn: true, fixed: false, air: false },
  guard: { 'a patch in the kit': v => v.patches > 0, 'holds air': v => v.air },
  effect: {
    'feel the tyre': v => ({ ...v, thorn: false }),
    'patch it': v => ({ ...v, patches: v.patches - 1, fixed: true }),
    'new tube': v => ({ ...v, fixed: true }),
    // the thorn still in the tyre makes a new hole at once
    'wait a minute': v => ({ ...v, air: v.fixed && !v.thorn, fixed: v.fixed && !v.thorn }),
  },
  rules: [
    { rule: 'Never ride on a flat', says: 'The bike goes back on the road only when the tyre holds air.', holds: s => s.at !== 'riding' || s.air },
    { rule: 'A patch comes from the kit', says: 'Nobody puts on a patch that the kit does not have.', holds: s => s.patches >= 0 },
  ],
  mutants: { 'a patch in the kit': true, 'holds air': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'flowchart.json', result);
