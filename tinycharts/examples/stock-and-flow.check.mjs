// The bath's rules. Run with bun to write stock-and-flow.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
// litres: the overflow hole sits at 160; the tap and the plug move 40 a turn
export const MAX = 160, STEP = 40;

export const result = check({
  mmd: HERE + 'stock-and-flow.mmd',
  init: { level: 0 },
  guard: { 'bath is empty': v => v.level === 0, 'at the overflow': v => v.level === MAX },
  effect: {
    'turn the tap': v => ({ level: Math.min(v.level + STEP, MAX) }),
    'pull the plug': v => ({ level: v.level - STEP }),
  },
  rules: [
    { rule: 'Never below empty', says: 'The plug cannot drain water that is not there.', holds: s => s.level >= 0 },
    { rule: 'Never over the rim', says: `What the tap adds past ${MAX} L runs out of the overflow. The floor stays dry.`, holds: s => s.level <= MAX },
    { rule: 'Each state tells the truth', says: 'Empty means 0 L, full means up to the overflow, partly full means in between.', holds: s => (s.at === 'empty') === (s.level === 0) && (s.at === 'full') === (s.level === MAX) },
  ],
  mutants: { 'bath is empty': true, 'at the overflow': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'stock-and-flow.json', result);
