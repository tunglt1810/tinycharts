// Template fixture for new.mjs.
import { fileURLToPath } from 'node:url';
import { check, writeResult } from '../../../tinycharts/build/check-lib.mjs';
const HERE = fileURLToPath(new URL('.', import.meta.url));
export const result = check({ mmd: HERE + 'flowchart-tech.mmd', rules: [] });
if (process.argv[1] === fileURLToPath(import.meta.url)) writeResult(HERE + 'flowchart.json', result);
