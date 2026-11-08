// The request flow. Run with bun to write icon-board.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'icon-board.mmd',
  rules: [
    { rule: 'A request is answered before the next one', says: 'The page waits for the reply before it sends again.', holds: s => s.at === "request" || s.at === "reply" },
  ],
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'icon-board.json', result);
