// Build every example sheet into one page with the gallery and the logic panels.
// bun scripts/gallery.mjs [-o .tmp/all.html]
import fs from 'node:fs';
import { build } from '../tinycharts/build/build.mjs';

const i = process.argv.indexOf('-o'), out = i > 0 ? process.argv[i + 1] : '.tmp/all.html';
const gallery = 'tinycharts/examples/gallery.json';
const files = JSON.parse(fs.readFileSync(gallery, 'utf8')).map(e => `tinycharts/examples/${e.key}.js`);
await build({ files, out, logic: true, gallery });
console.log(out);
