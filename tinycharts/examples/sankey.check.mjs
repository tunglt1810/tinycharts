// The household water's rules. Run with bun to write sankey.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
// litres a day for a house of three
export const flows = v => {
  const use = { shower: v.saver ? 54 : 90, toilet: 70, washer: 40, kitchen: 50, garden: 50 };
  const barrel = v.barrel ? 40 : 0;
  const into = Object.values(use).reduce((a, b) => a + b, 0);
  return { use, src: { mains: into - barrel, barrel }, out: { sewer: into - use.garden, soil: use.garden } };
};
const USES = ['shower', 'toilet', 'washer', 'kitchen', 'garden'];
// litre k of ten is the one at (k + 0.5) tenths down the stack of uses
const pick = v => {
  const f = flows(v), total = f.src.mains + f.src.barrel, p = (v.k + 0.5) / 10 * total;
  let acc = 0;
  for (const u of USES) { acc += f.use[u]; if (p < acc) return { use: u, barrel: p >= total - f.src.barrel }; }
};
const sum = o => Object.values(o).reduce((a, b) => a + b, 0);

export const result = check({
  mmd: HERE + 'sankey.mmd',
  init: { k: 7, saver: false, barrel: false },
  guard: {
    'from the barrel': v => pick(v).barrel,
    'to the shower': v => pick(v).use === 'shower', 'to the toilet': v => pick(v).use === 'toilet',
    'to the washer': v => pick(v).use === 'washer', 'to the kitchen': v => pick(v).use === 'kitchen',
  },
  effect: {
    'next litre': v => ({ ...v, k: (v.k + 3) % 10 }),
    'fit a saver shower head': v => ({ ...v, saver: !v.saver }),
    'connect the rain barrel': v => ({ ...v, barrel: !v.barrel }),
  },
  rules: [
    { rule: 'In equals out', says: 'Every litre from the mains and the barrel comes out in the sewer or the soil. None is lost, none is made.', holds: s => { const f = flows(s); return sum(f.src) === sum(f.out) && sum(f.use) === sum(f.src); } },
    { rule: 'Rain water only for the garden', says: 'The rain barrel is not clean enough to drink or wash in. Its water goes only to the garden.', holds: s => !['shower', 'toilet', 'washer', 'kitchen'].includes(s.at) || !pick(s).barrel },
    { rule: 'Each litre keeps to its band', says: 'A litre goes to the use whose band it is in, and nowhere else.', holds: s => !USES.includes(s.at) || pick(s).use === s.at },
  ],
  mutants: { 'from the barrel': true, 'to the shower': true, 'to the toilet': true, 'to the washer': true, 'to the kitchen': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'sankey.json', result);
