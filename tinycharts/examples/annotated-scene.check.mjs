// The campsite's rules. Run with bun to write annotated-scene.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'annotated-scene.mmd',
  // away: nobody awake at camp (down at the lake, or asleep)
  init: { fire: false, food: false, away: false },
  guard: { 'fire burns': v => v.fire, 'fire out': v => !v.fire, 'food out': v => v.food, 'food stowed': v => !v.food },
  effect: {
    'light the fire': v => ({ ...v, fire: true, food: true }),
    'douse the fire': v => ({ ...v, fire: false }),
    'walk to the lake': v => ({ ...v, away: true }),
    'back to the fire': v => ({ ...v, away: false, fire: true }),
    'stow the food': v => ({ ...v, food: false }),
    'lights out': v => ({ ...v, away: true }),
    sunrise: v => ({ ...v, away: false }),
  },
  rules: [
    { rule: 'No fire without a watcher', says: 'The fire never burns while nobody is awake at camp.', holds: s => !(s.fire && s.away) },
    { rule: 'No food out at night', says: 'From lights out, and when the bear comes, every bit of food is in the bear box.', holds: s => !['night', 'bear'].includes(s.at) || !s.food },
  ],
  mutants: { 'fire out': true, 'food stowed': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'annotated-scene.json', result);
