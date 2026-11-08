// The catalogue's cart. Run with node to write kit-catalogue.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'kit-catalogue.mmd',
  rules: [
    { rule: 'The cart is at one stop at a time', says: 'The cart is home or away, never both and never lost.', holds: s => s.at === 'home' || s.at === 'away' },
  ],
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'kit-catalogue.json', result);
