// The checkout's rules. Run with bun to write flowchart-tech.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const ORDER = ['created', 'emailed', 'picking', 'shipped', 'delivered'];

export const result = check({
  mmd: HERE + 'flowchart-tech.mmd',
  // the first address and the first card fail, the first 3DS answer fails, one unit on the shelf
  init: { guest: false, addrOk: false, tries: 0, badCards: 1, sca: 0, paid: false, reviewed: false, stock: 1, held: false, refunded: false },
  guard: {
    'valid address': v => v.addrOk,
    'card accepted': v => v.tries > v.badCards,
    'tries left': v => v.tries < 3,
    '3DS passed': v => v.sca > 1,
    'low risk': v => !v.guest,
    'in stock': v => v.held,
  },
  effect: {
    'as guest': v => ({ ...v, guest: true }),
    'fix it': v => ({ ...v, addrOk: true }),
    'charge card': v => ({ ...v, tries: v.tries + 1 }),
    'answer 3DS': v => ({ ...v, sca: v.sca + 1, paid: v.sca + 1 > 1 }),
    // a person takes time: the last unit sells while the order waits
    approve: v => ({ ...v, reviewed: true, stock: v.stock - 1 }),
    reject: v => ({ ...v, reviewed: true, paid: false, refunded: true }),
    'hold stock': v => ({ ...v, held: v.stock > 0 }),
    refund: v => ({ ...v, paid: false, held: false, refunded: true }),
  },
  rules: [
    { rule: 'No order before a checked address and the money', says: 'An order exists only after the address passed and the card passed 3-D Secure.', holds: s => !ORDER.includes(s.at) || (s.addrOk && s.paid) },
    { rule: 'No order without stock held', says: 'Redis holds a unit for every order, so nobody sells the same box twice.', holds: s => !ORDER.includes(s.at) || s.held },
    { rule: 'A guest order meets a person first', says: 'A guest checkout has a high fraud score, so a person looks at it before the order.', holds: s => !ORDER.includes(s.at) || !s.guest || s.reviewed },
  ],
  mutants: { 'valid address': true, 'card accepted': true, '3DS passed': true, 'low risk': true, 'in stock': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'flowchart-tech.json', result);
