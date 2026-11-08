// The passkey sign-in's rules. Run with bun to write sequence.json.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../build/check-lib.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));

export const result = check({
  mmd: HERE + 'sequence.mmd',
  init: { ch: 0, sig: -1, face: false },
  guard: { 'face matches': v => v.face, 'signature fits': v => v.sig === v.ch },
  effect: {
    // a fresh challenge each time; the count stops at 2 so the search ends
    challenge: v => ({ ...v, ch: v.ch < 2 ? v.ch + 1 : 1, sig: -1 }),
    'Face ID': v => ({ ...v, face: true }),
    'a stranger looks': v => ({ ...v, face: false }),
    signature: v => ({ ...v, sig: v.ch }),
    'replay an old one': v => ({ ...v, sig: v.ch - 1 }),
    'sign out': v => ({ ...v, face: false, sig: -1 }),
  },
  rules: [
    { rule: 'No sign-in without a fresh signature', says: 'Keycloak signs you in only with a signature for the challenge it just sent.', holds: s => s.at !== 'signed_in' || s.sig === s.ch },
    { rule: 'The phone signs only for its owner', says: 'The passkey signs nothing until Face ID knows the face.', holds: s => s.at !== 'signed' || s.face },
  ],
  mutants: { 'face matches': true, 'signature fits': true },
});

if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'sequence.json', result);
