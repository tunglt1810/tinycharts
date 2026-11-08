// The checkout's rules. Run with node to write flow-demo.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'flow-demo.mmd',
  init: { items: 0, approved: false, tries: 0 },
  guard: {
    'has items': v => v.items > 0,
    'card approved': v => v.approved,
    'tries left': v => v.tries < 3,
  },
  effect: {
    'add item': v => ({ ...v, items: 1 }),
    pay: v => ({ ...v, approved: false, tries: v.tries + 1 }),
    'bank says yes': v => ({ ...v, approved: true }),
    'start again': v => ({ ...v, approved: false, tries: 0 }),
  },
  rules: [
    { rule: 'No order on a declined card', says: 'An order is placed only after the bank said yes to this payment.', holds: s => !['placed', 'emailed', 'packing', 'shipped'].includes(s.at) || s.approved },
    { rule: 'No checkout with an empty cart', says: 'Nobody reaches the address step with nothing in the cart.', holds: s => s.at !== 'address' || s.items > 0 },
    { rule: 'At most 3 card tries', says: 'After three declined cards the shop stops asking for another one.', holds: s => s.tries <= 3 },
  ],
  mutants: { 'card approved': true, 'has items': true, 'tries left': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'flow-demo.json', result);
