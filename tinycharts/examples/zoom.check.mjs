// The library's rules. Run with bun to write zoom.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const DEPTH = { building: 0, stacks: 1, row: 2, book: 3 };

export const result = check({
  mmd: HERE + 'zoom.mmd',
  init: { depth: 0, loans: 0 },
  // zoom out on a composite state is inherited by every state inside it,
  // so only the depth guard keeps it from skipping levels
  guard: {
    'looking at the shelf': v => v.depth === 2,
    'looking at the floor': v => v.depth === 1,
    'on the shelf': v => v.loans === 0,
    'lent out': v => v.loans > 0,
  },
  effect: {
    'zoom in': v => ({ ...v, depth: v.depth + 1 }),
    'zoom out': v => ({ ...v, depth: v.depth - 1 }),
    'borrow it': v => ({ ...v, loans: v.loans + 1 }),
    'bring it back': v => ({ ...v, loans: v.loans - 1 }),
  },
  rules: [
    { rule: 'One level at a time', says: 'Zoom in and zoom out move the view one box at a time. The view never skips from the book to the floor or the building.', holds: s => s.depth === DEPTH[s.at] },
    { rule: 'One reader at a time', says: 'The book is lent only when it is on the shelf, never while it is out already.', holds: s => s.loans <= 1 },
    { rule: 'Only a lent book comes back', says: 'Bring it back works only when the book is out.', holds: s => s.loans >= 0 },
  ],
  mutants: { 'looking at the shelf': true, 'looking at the floor': true, 'on the shelf': true, 'lent out': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'zoom.json', result);
