// The picnic's rules, over every face of the weather die. Run with bun to
// write game-board.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
export const RUG = 8;
// faces 1-3 sun: walk that far; 4 cloud: one step; 5 wind: stay; 6 rain: shelter
export const STEPS = [1, 2, 3, 1, 0, 0];
const roll = face => v => {
  if (face === 6) return { ...v, rain: true };
  const to = v.pos + STEPS[face - 1];
  return { ...v, pos: to > RUG ? v.pos : to };
};
const on = n => v => !v.rain && v.pos === n;

export const result = check({
  mmd: HERE + 'game-board.mmd',
  init: { pos: 0, rain: false },
  guard: {
    raining: v => v.rain, 'at the rug': on(RUG),
    ...Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7].map(n => [`at ${n + 1}`, on(n)])),
  },
  effect: {
    ...Object.fromEntries([1, 2, 3, 4, 5, 6].map(f => [`roll a ${f}`, roll(f)])),
    'the rain stops': v => ({ ...v, rain: false }),
    'home again': () => ({ pos: 0, rain: false }),
  },
  rules: [
    { rule: 'The picnic is on the rug', says: 'The basket opens only on square 9. No roll lets you eat on the way.', holds: s => s.at !== 'picnic' || s.pos === RUG },
    { rule: 'Nobody eats in the rain', says: 'In the rain, everyone waits in the bandstand. No picnic starts wet.', holds: s => s.at !== 'picnic' || !s.rain },
    { rule: 'Shelter only in the rain', says: 'You go to the bandstand only when the die shows rain.', holds: s => s.at !== 'shelter' || s.rain },
    { rule: 'Never past the rug', says: 'A roll that would carry you past square 9 leaves you where you are.', holds: s => s.pos <= RUG },
  ],
  mutants: { raining: true, 'at the rug': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'game-board.json', result);
