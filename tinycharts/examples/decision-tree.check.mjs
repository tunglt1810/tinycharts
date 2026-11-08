// The plant tree's rules. Run with bun to write decision-tree.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
// three answers, y or n: bright window, pets, water every week
const PLANT = { yyy: 'spider', yyn: 'haworthia', yny: 'fig', ynn: 'aloe', nyy: 'fern', nyn: 'castiron', nny: 'lily', nnn: 'snake' };
const TOXIC = ['fig', 'aloe', 'lily', 'snake'];
const answer = a => v => {
  const path = v.path + a;
  if (path.length < 3) return { ...v, path };
  return { ...v, path, plant: PLANT[path], pets: path[1] === 'y', rooms: v.rooms + 1 };
};

export const result = check({
  mmd: HERE + 'decision-tree.mmd',
  init: { path: '', plant: '', pets: false, rooms: 0 },
  guard: { 'plant is pet-safe': v => !TOXIC.includes(v.plant), 'a room is left': v => v.rooms < 3 },
  effect: {
    yes: answer('y'), no: answer('n'),
    'a kitten comes': v => ({ ...v, pets: true }),
    'next room': v => ({ ...v, path: '', plant: '', pets: false }),
    'start again': v => ({ ...v, rooms: 0 }),
  },
  rules: [
    { rule: 'No pet next to a plant that harms it', says: 'A plant that is bad for cats and dogs never stays within reach of one: it goes up on a high shelf.', holds: s => !(s.at === 'potted' && s.pets && TOXIC.includes(s.plant)) },
    { rule: 'One plant for each room', says: 'The flat has three rooms. The tree never picks a fourth plant.', holds: s => s.rooms <= 3 },
  ],
  mutants: { 'plant is pet-safe': true, 'a room is left': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'decision-tree.json', result);
