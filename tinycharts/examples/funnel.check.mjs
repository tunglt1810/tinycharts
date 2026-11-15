// The bean packet's rules. Run with bun to write funnel.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
export const SEEDS = 40;
// plants lost on the way out of each stage: packet, sown, sprouted, planted, flowered, podded
export const LOSS = [0, 6, 6, 2, 2, 0];
const fresh = () => ({ s: 0, n: SEEDS, lost: 0 });

export const result = check({
  mmd: HERE + 'funnel.mmd',
  init: fresh(),
  guard: { 'plants in the bed': v => v.n > 0, 'some plants left': v => v.n > 0 },
  effect: {
    'next stage': v => { const d = Math.min(v.n, LOSS[v.s]); return { s: v.s + 1, n: v.n - d, lost: v.lost + d }; },
    'slugs in the night': v => { const d = Math.min(v.n, 8); return { ...v, n: v.n - d, lost: v.lost + d }; },
    'sow again': fresh,
  },
  rules: [
    { rule: 'Every seed is counted', says: `The plants still growing and the ones on the compost always add up to the ${SEEDS} seeds in the packet.`, holds: s => s.n + s.lost === SEEDS && s.n >= 0 },
    { rule: 'No picking from a bare bed', says: 'The basket fills only when at least one plant is left.', holds: s => s.at !== 'harvest' || s.n > 0 },
  ],
  mutants: { 'some plants left': true, 'plants in the bed': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'funnel.json', result);
