// The door's rules. Run with node to write door.json next to door.mmd.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../../tinycharts/build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'door.mmd',
  init: { locked: false },
  guard: { unlocked: v => !v.locked },
  effect: { lock: v => ({ ...v, locked: true }), unlock: v => ({ ...v, locked: false }) },
  rules: [{ rule: 'Never open while locked', says: 'The door is never open with the bolt across.', holds: s => !(s.at === 'open' && s.locked) }],
  mutants: { unlocked: true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'door.json', result);
